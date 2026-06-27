import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { authErrorResponse, requireAuth } from '@/lib/auth';
import crypto from 'crypto';

// Razorpay order creation
const createOrderSchema = z.object({
  orderId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const data = createOrderSchema.parse(body);

    const order = await db.order.findUnique({
      where: { id: data.orderId },
      select: { id: true, userId: true, total: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (session.user.role !== 'admin' && order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-razorpay-secret' : undefined);

    if (process.env.NODE_ENV === 'production' && (!razorpayKeyId || !razorpayKeySecret)) {
      return NextResponse.json({ error: 'Razorpay is not configured on the server' }, { status: 500 });
    }

    // Create Razorpay order (amount in paise)
    const orderData = {
      amount: Math.round(order.total * 100), // Convert to paise
      currency: 'INR',
      receipt: `rcpt_${data.orderId.slice(-8)}`,
      payment_capture: 1,
    };

    // Try real Razorpay if keys are configured
    if (razorpayKeyId && razorpayKeySecret) {
      try {
        const Razorpay = (await import('razorpay')).default;
        const razorpay = new Razorpay({
          key_id: razorpayKeyId,
          key_secret: razorpayKeySecret,
        });

        const razorpayOrder = await razorpay.orders.create(orderData);

        // Update order with Razorpay order ID
        await db.order.update({
          where: { id: data.orderId },
          data: {
            razorpayOrderId: razorpayOrder.id,
            paymentMethod: 'razorpay',
          },
        });

        return NextResponse.json({
          orderId: razorpayOrder.id,
          amount: order.total,
          currency: 'INR',
          key: razorpayKeyId,
          dbOrderId: data.orderId,
        });
      } catch (razorpayError) {
        console.error('Razorpay error:', razorpayError);
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 });
        }
      }
    }

    // Simulation mode (development only)
    const simulatedOrderId = `order_sim_${Date.now()}`;
    const simulatedPaymentId = `pay_sim_${Date.now()}`;
    const simulatedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${simulatedOrderId}|${simulatedPaymentId}`)
      .digest('hex');

    await db.order.update({
      where: { id: data.orderId },
      data: {
        razorpayOrderId: simulatedOrderId,
        paymentMethod: 'razorpay',
      },
    });

    return NextResponse.json({
      orderId: simulatedOrderId,
      amount: order.total,
      currency: 'INR',
      key: razorpayKeyId || 'development-only',
      dbOrderId: data.orderId,
      razorpayPaymentId: simulatedPaymentId,
      razorpaySignature: simulatedSignature,
      simulation: true,
    });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Payment create-order error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
