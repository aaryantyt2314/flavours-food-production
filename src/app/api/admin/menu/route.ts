import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, isAvailable, isFeatured, name, description, prices, categoryId } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'itemId required' }, { status: 400 });
    }

    const data: any = {};
    if (isAvailable !== undefined) data.isAvailable = isAvailable;
    if (isFeatured !== undefined) data.isFeatured = isFeatured;
    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (prices) data.prices = typeof prices === 'string' ? prices : JSON.stringify(prices);
    if (categoryId) data.categoryId = categoryId;

    const item = await db.menuItem.update({
      where: { id: itemId },
      data,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Menu update error:', error);
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, prices, priceLabel, categoryId, subCategory, isVeg, isFeatured } = body;

    if (!name || !categoryId || !prices) {
      return NextResponse.json({ error: 'name, categoryId, and prices required' }, { status: 400 });
    }

    const item = await db.menuItem.create({
      data: {
        name,
        description: description || null,
        prices: typeof prices === 'string' ? prices : JSON.stringify(prices),
        priceLabel: priceLabel || null,
        categoryId,
        subCategory: subCategory || null,
        isVeg: isVeg !== undefined ? isVeg : true,
        isFeatured: isFeatured || false,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Menu create error:', error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    await db.menuItem.delete({ where: { id: itemId } });
    return NextResponse.json({ message: 'Item deleted' });
  } catch (error) {
    console.error('Menu delete error:', error);
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}
