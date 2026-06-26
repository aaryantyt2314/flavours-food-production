import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Razorpay order creation
const createOrderSchema = z.object({
  orderId: z.string(),
  amount: z.number().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createOrderSchema.parse(body);

    // In production, use real Razorpay keys from env vars
    // For now, we create a simulated Razorpay order
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';

    // Create Razorpay order (amount in paise)
    const orderData = {
      amount: Math.round(data.amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `rcpt_${data.orderId.slice(-8)}`,
      payment_capture: 1,
    };

    // Try real Razorpay if keys are configured
    if (razorpayKeyId !== 'rzp_test_placeholder') {
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
          amount: data.amount,
          currency: 'INR',
          key: razorpayKeyId,
          dbOrderId: data.orderId,
        });
      } catch (razorpayError) {
        console.error('Razorpay error:', razorpayError);
        // Fall through to simulation
      }
    }

    // Simulation mode (no real Razorpay keys)
    const simulatedOrderId = `order_sim_${Date.now()}`;

    await db.order.update({
      where: { id: data.orderId },
      data: {
        razorpayOrderId: simulatedOrderId,
        paymentMethod: 'razorpay',
      },
    });

    return NextResponse.json({
      orderId: simulatedOrderId,
      amount: data.amount,
      currency: 'INR',
      key: razorpayKeyId,
      dbOrderId: data.orderId,
      simulation: true,
    });
  } catch (error) {
    console.error('Payment create-order error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
