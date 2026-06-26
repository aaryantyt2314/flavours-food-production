import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import crypto from 'crypto';

const verifySchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string().optional(),
  dbOrderId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = verifySchema.parse(body);

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';

    // Verify signature if real Razorpay
    if (data.razorpaySignature && razorpayKeySecret !== 'placeholder_secret') {
      const expectedSignature = crypto
        .createHmac('sha256', razorpayKeySecret)
        .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
        .digest('hex');

      if (expectedSignature !== data.razorpaySignature) {
        return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
      }
    }

    // Update order as paid
    const order = await db.order.update({
      where: { id: data.dbOrderId },
      data: {
        razorpayPaymentId: data.razorpayPaymentId,
        razorpaySignature: data.razorpaySignature || null,
        paymentStatus: 'paid',
        status: 'Confirmed',
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (error) {
    console.error('Payment verify error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
