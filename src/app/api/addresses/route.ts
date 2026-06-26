import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const addressSchema = z.object({
  userId: z.string(),
  label: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const addresses = await db.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Addresses GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = addressSchema.parse(body);

    // If this is the first address, make it default
    const existingCount = await db.address.count({ where: { userId: data.userId } });

    const address = await db.address.create({
      data: {
        userId: data.userId,
        label: data.label,
        street: data.street,
        city: data.city,
        state: data.state,
        pincode: data.pincode || null,
        isDefault: existingCount === 0,
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error('Address POST error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}
