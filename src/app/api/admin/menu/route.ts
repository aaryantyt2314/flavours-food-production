import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { authErrorResponse, requireAdmin } from '@/lib/auth';
import { getCloudinary } from '@/lib/cloudinary';
import { Readable } from 'stream';
import { z } from 'zod';

export const runtime = 'nodejs';

const maxImageSizeBytes = 5 * 1024 * 1024;
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const booleanLikeSchema = z.union([z.boolean(), z.enum(['true', 'false'])])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    return value === true || value === 'true';
  });

const priceRecordSchema = z.record(
  z.string().trim().min(1).max(50),
  z.coerce.number().finite().min(0).max(100000)
).refine((prices) => Object.keys(prices).length > 0, {
  message: 'At least one price tier is required',
});

const menuPatchSchema = z.object({
  itemId: z.string().trim().min(1).max(128),
  name: z.string().trim().min(1).max(150).optional(),
  description: z.string().trim().max(2000).optional(),
  prices: z.unknown().optional(),
  priceLabel: z.string().trim().max(100).optional(),
  categoryId: z.string().trim().min(1).max(128).optional(),
  subCategory: z.string().trim().max(100).optional(),
  isAvailable: booleanLikeSchema,
  isFeatured: booleanLikeSchema,
  imageFile: z.instanceof(File).nullable(),
});

const menuCreateSchema = menuPatchSchema.omit({
  itemId: true,
  isAvailable: true,
}).extend({
  name: z.string().trim().min(1).max(150),
  categoryId: z.string().trim().min(1).max(128),
  prices: z.unknown(),
  isVeg: booleanLikeSchema,
});

const menuDeleteSchema = z.object({
  id: z.string().trim().min(1).max(128),
});

function parsePrices(value: unknown) {
  const candidate = typeof value === 'string' ? JSON.parse(value) : value;
  return JSON.stringify(priceRecordSchema.parse(candidate));
}

async function saveMenuImage(file: File) {
  if (!allowedImageTypes.has(file.type)) {
    throw new Error('Invalid image type');
  }

  if (file.size > maxImageSizeBytes) {
    throw new Error('Image is too large');
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const cloudinary = getCloudinary();

  return await new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'flavours-food/menu',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url) {
          reject(new Error('Cloudinary upload did not return a secure URL'));
          return;
        }

        resolve(result.secure_url);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
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

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const body = menuPatchSchema.parse(await readMenuPayload(request));

    const data: {
      isAvailable?: boolean;
      isFeatured?: boolean;
      name?: string;
      description?: string | null;
      prices?: string;
      categoryId?: string;
      subCategory?: string | null;
      priceLabel?: string | null;
      image?: string;
    } = {};

    if (body.isAvailable !== undefined) data.isAvailable = body.isAvailable;
    if (body.isFeatured !== undefined) data.isFeatured = body.isFeatured;
    if (body.name !== undefined) data.name = body.name;
    if (body.description !== undefined) data.description = body.description || null;
    if (body.prices !== undefined) data.prices = parsePrices(body.prices);
    if (body.categoryId !== undefined) data.categoryId = body.categoryId;
    if (body.subCategory !== undefined) data.subCategory = body.subCategory || null;
    if (body.priceLabel !== undefined) data.priceLabel = body.priceLabel || null;
    if (body.imageFile) data.image = await saveMenuImage(body.imageFile);

    const item = await db.menuItem.update({
      where: { id: body.itemId },
      data,
    });

    return NextResponse.json(item);
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Menu update error:', error);
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }
    if (error instanceof Error && (error.message === 'Invalid image type' || error.message === 'Image is too large')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = menuCreateSchema.parse(await readMenuPayload(request));

    const image = body.imageFile ? await saveMenuImage(body.imageFile) : null;

    const item = await db.menuItem.create({
      data: {
        name: body.name,
        description: body.description || null,
        prices: parsePrices(body.prices),
        priceLabel: body.priceLabel || null,
        categoryId: body.categoryId,
        subCategory: body.subCategory || null,
        isVeg: body.isVeg ?? true,
        isFeatured: body.isFeatured ?? false,
        image,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Menu create error:', error);
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }
    if (error instanceof Error && (error.message === 'Invalid image type' || error.message === 'Image is too large')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const { id } = menuDeleteSchema.parse({ id: searchParams.get('id') });

    await db.menuItem.delete({ where: { id } });
    return NextResponse.json({ message: 'Item deleted' });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Menu delete error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}
