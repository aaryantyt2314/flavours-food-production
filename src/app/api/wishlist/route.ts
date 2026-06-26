import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const wishlist = await db.wishlistItem.findMany({
      where: { userId },
      include: { menuItem: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error('Wishlist GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

const wishlistSchema = z.object({
  userId: z.string(),
  menuItemId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = wishlistSchema.parse(body);

    const item = await db.wishlistItem.upsert({
      where: {
        userId_menuItemId: { userId: data.userId, menuItemId: data.menuItemId },
      },
      update: {},
      create: { userId: data.userId, menuItemId: data.menuItemId },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Wishlist POST error:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const menuItemId = searchParams.get('menuItemId');

    if (!userId || !menuItemId) {
      return NextResponse.json({ error: 'userId and menuItemId required' }, { status: 400 });
    }

    await db.wishlistItem.delete({
      where: { userId_menuItemId: { userId, menuItemId } },
    });

    return NextResponse.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Wishlist DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
