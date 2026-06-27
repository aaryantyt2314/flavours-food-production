import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

async function saveMenuImage(file: File) {
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'menu');
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${randomUUID()}${extname(file.name) || '.jpg'}`;
  const filePath = join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);
  return `/uploads/menu/${fileName}`;
}

async function readMenuPayload(request: NextRequest) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const imageFile = formData.get('image');

    return {
      itemId: formData.get('itemId')?.toString() || '',
      name: formData.get('name')?.toString() || '',
      description: formData.get('description')?.toString(),
      prices: formData.get('prices')?.toString(),
      priceLabel: formData.get('priceLabel')?.toString(),
      categoryId: formData.get('categoryId')?.toString(),
      subCategory: formData.get('subCategory')?.toString(),
      isVeg: formData.get('isVeg')?.toString(),
      isFeatured: formData.get('isFeatured')?.toString(),
      isAvailable: formData.get('isAvailable')?.toString(),
      imageFile: imageFile instanceof File && imageFile.size > 0 ? imageFile : null,
    };
  }

  const body = await request.json();
  return { ...body, imageFile: null };
}

function toBoolean(value: unknown) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  return undefined;
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await readMenuPayload(request);
    const { itemId, isAvailable, isFeatured, name, description, prices, categoryId, subCategory, priceLabel, imageFile } = body as any;

    if (!itemId) {
      return NextResponse.json({ error: 'itemId required' }, { status: 400 });
    }

    const data: any = {};
    const parsedIsAvailable = toBoolean(isAvailable);
    const parsedIsFeatured = toBoolean(isFeatured);

    if (parsedIsAvailable !== undefined) data.isAvailable = parsedIsAvailable;
    if (parsedIsFeatured !== undefined) data.isFeatured = parsedIsFeatured;
    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (prices) data.prices = typeof prices === 'string' ? prices : JSON.stringify(prices);
    if (categoryId) data.categoryId = categoryId;
    if (subCategory !== undefined) data.subCategory = subCategory || null;
    if (priceLabel !== undefined) data.priceLabel = priceLabel || null;
    if (imageFile) data.image = await saveMenuImage(imageFile);

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
    const body = await readMenuPayload(request);
    const { name, description, prices, priceLabel, categoryId, subCategory, isVeg, isFeatured, imageFile } = body as any;

    if (!name || !categoryId || !prices) {
      return NextResponse.json({ error: 'name, categoryId, and prices required' }, { status: 400 });
    }

    const image = imageFile ? await saveMenuImage(imageFile) : null;

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
        image,
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
