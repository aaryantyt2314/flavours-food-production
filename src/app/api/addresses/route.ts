import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authErrorResponse, requireAuth } from '@/lib/auth';
import { applyRateLimit } from '@/lib/ratelimit';

const addressSchema = z.object({
  label: z.string().trim().min(1).max(50),
  street: z.string().trim().min(1).max(255),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  pincode: z.string().trim().max(20).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const addresses = await db.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(addresses);
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Addresses GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const rateLimitResponse = await applyRateLimit(request, 20, 'addresses-create');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const data = addressSchema.parse(body);

    // If this is the first address, make it default
    const existingCount = await db.address.count({ where: { userId: session.user.id } });

    const address = await db.address.create({
      data: {
        userId: session.user.id,
        label: data.label,
        street: data.street,
        city: data.city,
        state: data.state,
        pincode: data.pincode?.trim() || null,
        isDefault: existingCount === 0,
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Address POST error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}
