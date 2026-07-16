import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authErrorResponse, requireAuth } from '@/lib/auth';
import { applyRateLimit } from '@/lib/ratelimit';
import { notifyAdmin } from '@/lib/notify';

// Thrown inside the order transaction when a coupon's usage limit was
// exhausted by a concurrent order between validation and claiming.
class CouponUnavailableError extends Error {
  constructor() {
    super('Coupon is no longer available');
    this.name = 'CouponUnavailableError';
  }
}

const orderStatuses = ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Ready', 'Completed', 'Cancelled'] as const;

const orderItemSchema = z.object({
  menuItemId: z.string().trim().min(1).max(128),
  priceTier: z.string().trim().min(1).max(50),
  quantity: z.number().int().min(1).max(25),
});

const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1).max(50),
  couponCode: z.string().trim().min(1).max(50).nullable().optional(),
  address: z.object({
    street: z.string().trim().min(1).max(255),
    city: z.string().trim().min(1).max(100),
    pincode: z.string().trim().max(20).optional(),
  }),
  notes: z.string().trim().max(1000).optional(),
  paymentMethod: z.enum(['cod', 'razorpay']).default('cod'),
});

const orderQuerySchema = z.object({
  status: z.enum(orderStatuses).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const rateLimitResponse = await applyRateLimit(request, 10, 'orders-create');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const data = orderSchema.parse(body);

    const menuItemIds = data.items.map((item) => item.menuItemId);
    const menuItems = await db.menuItem.findMany({
      where: { id: { in: menuItemIds } },
      select: { id: true, name: true, prices: true },
    });

    if (menuItems.length !== menuItemIds.length) {
      return NextResponse.json({ error: 'One or more menu items were not found' }, { status: 400 });
    }

    const menuItemMap = new Map(
      menuItems.map((item): [string, typeof item] => [item.id, item])
    );
    let subtotal = 0;

    const orderItems = data.items.map((item) => {
      const menuItem = menuItemMap.get(item.menuItemId)!;
      const prices = JSON.parse(menuItem.prices || '{}') as Record<string, number>;
      const price = prices[item.priceTier];

      if (typeof price !== 'number' || Number.isNaN(price)) {
        throw new Error(`Invalid price tier for item ${menuItem.id}`);
      }

      subtotal += price * item.quantity;

      return {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price,
        priceTier: item.priceTier,
        quantity: item.quantity,
      };
    });

    let discount = 0;
    let usageLimitForClaim: number | null = null;
    const couponCode = data.couponCode?.toUpperCase() || null;
    if (couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: couponCode } });
      const now = new Date();
      const couponUsable = coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt > now) && subtotal >= coupon.minOrder && (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit);

      if (!couponUsable) {
        return NextResponse.json({ error: 'Coupon is not valid' }, { status: 400 });
      }

      usageLimitForClaim = coupon!.usageLimit ?? null;

      if (coupon!.type === 'percentage') {
        discount = Math.round((subtotal * coupon!.value) / 100);
        if (coupon!.maxDiscount) {
          discount = Math.min(discount, coupon!.maxDiscount);
        }
      } else {
        discount = coupon!.value;
      }
    }

    const total = Math.max(subtotal - discount, 0);

    // Create the order and atomically claim the coupon slot in a single
    // transaction. The coupon increment uses a conditional updateMany so two
    // concurrent orders cannot both push usedCount past usageLimit (TOCTOU).
    const shouldClaimCoupon = Boolean(couponCode && discount > 0);

    const order = await db.$transaction(async (tx) => {
      if (shouldClaimCoupon) {
        const claimed = await tx.coupon.updateMany({
          where: {
            code: couponCode!,
            isActive: true,
            // Only claim if the coupon still has capacity. usageLimit === null
            // means unlimited, so match that case explicitly.
            OR: [
              { usageLimit: null },
              { usedCount: { lt: usageLimitForClaim ?? 0 } },
            ],
          },
          data: { usedCount: { increment: 1 } },
        });

        if (claimed.count === 0) {
          throw new CouponUnavailableError();
        }
      }

      return tx.order.create({
        data: {
          userId: session.user.id,
          subtotal,
          discount,
          total,
          couponCode,
          notes: data.notes?.trim() || null,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentMethod === 'cod' ? 'pending' : 'pending',
          items: {
            create: orderItems,
          },
        },
        include: { items: true },
      });
    });

    await notifyAdmin({
      kind: 'order',
      orderId: order.id,
      total: order.total,
      paymentMethod: order.paymentMethod,
      itemCount: order.items.length,
      customer: session.user.name || session.user.email || 'Customer',
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    if (error instanceof CouponUnavailableError) {
      return NextResponse.json({ error: 'Coupon is no longer available' }, { status: 409 });
    }
    console.error('Order creation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    if (error instanceof Error && error.message.startsWith('Invalid price tier')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const query = orderQuerySchema.parse({
      status: searchParams.get('status') || undefined,
    });

    const where: any = session.user.role === 'admin' ? {} : { userId: session.user.id };
    if (query.status) where.status = query.status;

    const since = searchParams.get('since');
    if (since) {
      const sinceDate = new Date(since);
      if (isNaN(sinceDate.getTime())) {
        return NextResponse.json({ error: 'Invalid since date format' }, { status: 400 });
      }
      where.createdAt = { gt: sinceDate };

      const orders = await db.order.findMany({
        where,
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const minimalOrders = orders.map((order) => ({
        id: order.id,
        total: order.total,
        customerName: order.user?.name || 'Guest',
        createdAt: order.createdAt,
        status: order.status,
      }));

      return NextResponse.json(minimalOrders);
    }

    const orders = await db.order.findMany({
      where,
      include: { items: true, user: { select: { name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(orders);
  } catch (error: unknown) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Orders GET error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
