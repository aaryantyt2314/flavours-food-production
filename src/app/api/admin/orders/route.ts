import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { authErrorResponse, requireAdmin } from '@/lib/auth';
import { z } from 'zod';

const orderStatusSchema = z.object({
  orderId: z.string().trim().min(1).max(128),
  status: z.enum(['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Ready', 'Completed', 'Cancelled']),
});

export async function GET() {
  try {
    await requireAdmin();
    const orders = await db.order.findMany({
      include: {
        items: true,
        user: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Admin orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { orderId, status } = orderStatusSchema.parse(body);

    const order = await db.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json(order);
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Order update error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
