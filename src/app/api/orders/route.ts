import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authErrorResponse, requireAuth } from '@/lib/auth';

const orderItemSchema = z.object({
  menuItemId: z.string(),
  priceTier: z.string(),
  quantity: z.number().min(1),
});

const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  couponCode: z.string().nullable(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    pincode: z.string().optional(),
  }),
  notes: z.string().optional(),
  paymentMethod: z.string().default('cod'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
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

    const menuItemMap = new Map(menuItems.map((item) => [item.id, item]));
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
    if (data.couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: data.couponCode } });
      const now = new Date();
      const couponUsable = coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt > now) && subtotal >= coupon.minOrder && (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit);

      if (!couponUsable) {
        return NextResponse.json({ error: 'Coupon is not valid' }, { status: 400 });
      }

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

    // Create order
    const order = await db.order.create({
      data: {
        userId: session.user.id,
        subtotal,
        discount,
        total,
        couponCode: data.couponCode,
        notes: data.notes || null,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentMethod === 'cod' ? 'pending' : 'pending',
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    // Increment coupon usage if applicable
    if (data.couponCode && discount > 0) {
      await db.coupon.update({
        where: { code: data.couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Order creation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
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
    const status = searchParams.get('status');

    const where: any = session.user.role === 'admin' ? {} : { userId: session.user.id };
    if (status) where.status = status;

    const orders = await db.order.findMany({
      where,
      include: { items: true, user: { select: { name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(orders);
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
