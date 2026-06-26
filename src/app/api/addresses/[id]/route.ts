import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: any = {};
    if (body.label) data.label = body.label;
    if (body.street) data.street = body.street;
    if (body.city) data.city = body.city;
    if (body.state) data.state = body.state;
    if (body.pincode !== undefined) data.pincode = body.pincode || null;

    // Handle set default
    if (body.isDefault && body.userId) {
      // Unset all other defaults for this user
      await db.address.updateMany({
        where: { userId: body.userId, isDefault: true },
        data: { isDefault: false },
      });
      data.isDefault = true;
    }

    const address = await db.address.update({
      where: { id },
      data,
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error('Address PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await db.address.delete({ where: { id } });

    return NextResponse.json({ message: 'Address deleted' });
  } catch (error) {
    console.error('Address DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
