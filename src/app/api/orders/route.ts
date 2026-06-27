import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const orderItemSchema = z.object({
  menuItemId: z.string(),
  name: z.string(),
  price: z.number(),
  priceTier: z.string(),
  quantity: z.number().min(1),
});

const orderSchema = z.object({
  userId: z.string().nullable(),
  items: z.array(orderItemSchema).min(1),
  subtotal: z.number(),
  discount: z.number().default(0),
  total: z.number(),
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
    const body = await request.json();
    const data = orderSchema.parse(body);

    // Create order
    const order = await db.order.create({
      data: {
        userId: data.userId ?? null,
        subtotal: data.subtotal,
        discount: data.discount,
        total: data.total,
        couponCode: data.couponCode,
        notes: data.notes || null,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentMethod === 'cod' ? 'pending' : 'pending',
        items: {
          create: data.items.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            price: item.price,
            priceTier: item.priceTier,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    // Increment coupon usage if applicable
    if (data.couponCode) {
      await db.coupon.update({
        where: { code: data.couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const orders = await db.order.findMany({
      where,
      include: { items: true, user: { select: { name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
