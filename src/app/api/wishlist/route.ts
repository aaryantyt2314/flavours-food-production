import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authErrorResponse, requireAuth } from '@/lib/auth';
import { applyRateLimit } from '@/lib/ratelimit';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const wishlist = await db.wishlistItem.findMany({
      where: { userId: session.user.id },
      include: { menuItem: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(wishlist);
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Wishlist GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

const wishlistSchema = z.object({
  menuItemId: z.string().trim().min(1).max(128),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const rateLimitResponse = await applyRateLimit(request, 30, 'wishlist-write');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const data = wishlistSchema.parse(body);

    const item = await db.wishlistItem.upsert({
      where: {
        userId_menuItemId: { userId: session.user.id, menuItemId: data.menuItemId },
      },
      update: {},
      create: { userId: session.user.id, menuItemId: data.menuItemId },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Wishlist POST error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const rateLimitResponse = await applyRateLimit(request, 30, 'wishlist-write');
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const { menuItemId } = wishlistSchema.parse({ menuItemId: searchParams.get('menuItemId') });

    await db.wishlistItem.delete({
      where: { userId_menuItemId: { userId: session.user.id, menuItemId } },
    });

    return NextResponse.json({ message: 'Removed from wishlist' });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Wishlist DELETE error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
