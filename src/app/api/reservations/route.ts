import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authErrorResponse, requireAdmin } from '@/lib/auth';
import { applyRateLimit } from '@/lib/ratelimit';

const reservationSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(7).max(20).regex(/^[+()\-\s\d]+$/),
  email: z.string().trim().email().max(255).optional().or(z.literal('')),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().trim().regex(/^\d{2}:\d{2}$/),
  partySize: z.number().int().min(1).max(30),
  specialRequests: z.string().trim().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await applyRateLimit(request, 5, 'reservations-create');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const data = reservationSchema.parse(body);

    const reservation = await db.reservation.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        date: data.date,
        time: data.time,
        partySize: data.partySize,
        specialRequests: data.specialRequests?.trim() || null,
      },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error: unknown) {
    console.error('Reservation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await requireAdmin();
    const reservations = await db.reservation.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(reservations);
  } catch (error: unknown) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Reservations GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}
