import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authErrorResponse, requireAuth } from '@/lib/auth';
import { applyRateLimit } from '@/lib/ratelimit';

const reviewSchema = z.object({
  menuItemId: z.string().trim().min(1).max(128).optional(),
  orderId: z.string().trim().min(1).max(128).optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
}).refine((data) => data.menuItemId || data.orderId, {
  message: 'menuItemId or orderId is required',
});

const reviewQuerySchema = z.object({
  menuItemId: z.string().trim().min(1).max(128).optional(),
  userId: z.string().trim().min(1).max(128).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const rateLimitResponse = await applyRateLimit(request, 10, 'reviews-create');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const data = reviewSchema.parse(body);

    // A review must reference an order the user actually placed. Verify the
    // order belongs to this user before allowing a review to be created.
    if (data.orderId) {
      const order = await db.order.findUnique({
        where: { id: data.orderId },
        select: { userId: true, status: true },
      });

      if (!order || order.userId !== session.user.id) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      if (order.status !== 'Completed') {
        return NextResponse.json(
          { error: 'You can only review completed orders' },
          { status: 400 }
        );
      }
    }

    // If a menu item is referenced, make sure it exists.
    if (data.menuItemId) {
      const menuItem = await db.menuItem.findUnique({
        where: { id: data.menuItemId },
        select: { id: true },
      });

      if (!menuItem) {
        return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
      }
    }

    // Prevent duplicate reviews for the same item/order by the same user.
    const existing = await db.review.findFirst({
      where: {
        userId: session.user.id,
        menuItemId: data.menuItemId || null,
        orderId: data.orderId || null,
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this' }, { status: 409 });
    }

    const review = await db.review.create({
      data: {
        userId: session.user.id,
        menuItemId: data.menuItemId || null,
        orderId: data.orderId || null,
        rating: data.rating,
        comment: data.comment?.trim() || null,
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
    const query = reviewQuerySchema.parse({
      menuItemId: searchParams.get('menuItemId') || undefined,
      userId: searchParams.get('userId') || undefined,
    });

    const where: { menuItemId?: string; userId?: string } = {};
    if (query.menuItemId) where.menuItemId = query.menuItemId;
    if (query.userId) where.userId = query.userId;

    const reviews = await db.review.findMany({
      where,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Reviews GET error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
