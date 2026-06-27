import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authErrorResponse, requireAuth } from '@/lib/auth';

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
  menuItemId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
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
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const menuItemId = searchParams.get('menuItemId');

    if (!menuItemId) {
      return NextResponse.json({ error: 'menuItemId required' }, { status: 400 });
    }

    await db.wishlistItem.delete({
      where: { userId_menuItemId: { userId: session.user.id, menuItemId } },
    });

    return NextResponse.json({ message: 'Removed from wishlist' });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Wishlist DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
