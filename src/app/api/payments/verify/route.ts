import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import crypto from 'crypto';
import { authErrorResponse, requireAuth } from '@/lib/auth';
import { applyRateLimit } from '@/lib/ratelimit';

const verifySchema = z.object({
  razorpayOrderId: z.string().trim().min(1).max(128),
  razorpayPaymentId: z.string().trim().min(1).max(128),
  razorpaySignature: z.string().trim().min(32).max(256),
  dbOrderId: z.string().trim().min(1).max(128),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const rateLimitResponse = await applyRateLimit(request, 20, 'payments-verify');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const data = verifySchema.parse(body);

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-razorpay-secret' : undefined);

    if (process.env.NODE_ENV === 'production' && !razorpayKeySecret) {
      return NextResponse.json({ error: 'Razorpay is not configured on the server' }, { status: 500 });
    }

    if (!razorpayKeySecret) {
      return NextResponse.json({ error: 'Razorpay secret is missing' }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
      .digest('hex');

    // Constant-time comparison to avoid leaking the signature via timing.
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const providedBuffer = Buffer.from(data.razorpaySignature, 'hex');
    const signatureValid =
      expectedBuffer.length === providedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, providedBuffer);

    if (!signatureValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const existingOrder = await db.order.findUnique({
      where: { id: data.dbOrderId },
      select: { id: true, userId: true, razorpayOrderId: true, paymentStatus: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (session.user.role !== 'admin' && existingOrder.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (existingOrder.razorpayOrderId !== data.razorpayOrderId) {
      return NextResponse.json({ error: 'Order mismatch' }, { status: 400 });
    }

    // Don't re-process an already-paid order (replay protection).
    if (existingOrder.paymentStatus === 'paid') {
      return NextResponse.json({
        success: true,
        order: { id: existingOrder.id, status: 'Confirmed', paymentStatus: 'paid' },
      });
    }

    // Update order as paid
    const updatedOrder = await db.order.update({
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
        id: updatedOrder.id,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
      },
    });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Payment verify error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
