import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { authErrorResponse, requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(coupons);
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Admin coupons error:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}
