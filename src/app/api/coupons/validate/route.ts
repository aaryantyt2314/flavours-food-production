import { db } from '@/lib/db';
import { applyRateLimit } from '@/lib/ratelimit';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const couponQuerySchema = z.object({
  code: z.string().trim().min(1).max(50).transform((code) => code.toUpperCase()),
  total: z.coerce.number().finite().min(0).max(100000),
});

export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = await applyRateLimit(request, 20, 'coupons-validate');
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const query = couponQuerySchema.parse({
      code: searchParams.get('code'),
      total: searchParams.get('total') || '0',
    });

    const coupon = await db.coupon.findUnique({
      where: { code: query.code },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
    }

    if (query.total < coupon.minOrder) {
      return NextResponse.json({ error: `Minimum order Rs ${coupon.minOrder} required` }, { status: 400 });
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (query.total * coupon.value) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.value;
    }

    return NextResponse.json({
      valid: true,
      discount: Math.round(discount),
      type: coupon.type,
      value: coupon.value,
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}
