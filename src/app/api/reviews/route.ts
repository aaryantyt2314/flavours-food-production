import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authErrorResponse, requireAuth } from '@/lib/auth';

const reviewSchema = z.object({
  menuItemId: z.string().optional(),
  orderId: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const data = reviewSchema.parse(body);

    const review = await db.review.create({
      data: {
        userId: session.user.id,
        menuItemId: data.menuItemId || null,
        rating: data.rating,
        comment: data.comment || null,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Review error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const menuItemId = searchParams.get('menuItemId');
    const userId = searchParams.get('userId');

    const where: any = {};
    if (menuItemId) where.menuItemId = menuItemId;
    if (userId) where.userId = userId;

    const reviews = await db.review.findMany({
      where,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Reviews GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
