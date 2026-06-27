import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { authErrorResponse, requireAuth } from '@/lib/auth';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const address = await db.address.findUnique({ where: { id } });
    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    if (session.user.role !== 'admin' && address.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data: any = {};
    if (body.label) data.label = body.label;
    if (body.street) data.street = body.street;
    if (body.city) data.city = body.city;
    if (body.state) data.state = body.state;
    if (body.pincode !== undefined) data.pincode = body.pincode || null;

    // Handle set default
    if (body.isDefault) {
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
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;

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
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
