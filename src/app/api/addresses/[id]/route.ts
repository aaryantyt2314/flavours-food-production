import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authErrorResponse, requireAuth } from '@/lib/auth';
import { applyRateLimit } from '@/lib/ratelimit';

const addressPatchSchema = z.object({
  label: z.string().trim().min(1).max(50).optional(),
  street: z.string().trim().min(1).max(255).optional(),
  city: z.string().trim().min(1).max(100).optional(),
  state: z.string().trim().min(1).max(100).optional(),
  pincode: z.string().trim().max(20).optional().nullable(),
  isDefault: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required',
});

const routeParamsSchema = z.object({
  id: z.string().trim().min(1).max(128),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const rateLimitResponse = await applyRateLimit(request, 20, 'addresses-update');
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = routeParamsSchema.parse(await params);
    const body = await request.json();
    const bodyData = addressPatchSchema.parse(body);

    const address = await db.address.findUnique({ where: { id } });
    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    if (session.user.role !== 'admin' && address.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data: {
      label?: string;
      street?: string;
      city?: string;
      state?: string;
      pincode?: string | null;
      isDefault?: boolean;
    } = {};
    if (bodyData.label !== undefined) data.label = bodyData.label;
    if (bodyData.street !== undefined) data.street = bodyData.street;
    if (bodyData.city !== undefined) data.city = bodyData.city;
    if (bodyData.state !== undefined) data.state = bodyData.state;
    if (bodyData.pincode !== undefined) data.pincode = bodyData.pincode || null;

    // Handle set default
    if (bodyData.isDefault) {
      // Unset all other defaults for this user
      await db.address.updateMany({
        where: { userId: address.userId, isDefault: true },
        data: { isDefault: false },
      });
      data.isDefault = true;
    }

    const updatedAddress = await db.address.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Address PATCH error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const rateLimitResponse = await applyRateLimit(request, 20, 'addresses-delete');
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = routeParamsSchema.parse(await params);

    const address = await db.address.findUnique({ where: { id } });
    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    if (session.user.role !== 'admin' && address.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.address.delete({ where: { id } });

    return NextResponse.json({ message: 'Address deleted' });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Address DELETE error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
