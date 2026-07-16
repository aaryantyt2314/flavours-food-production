import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authErrorResponse, requireAdmin } from '@/lib/auth';
import { applyRateLimit } from '@/lib/ratelimit';
import { notifyAdmin } from '@/lib/notify';

const reservationSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(7).max(20).regex(/^[+()\-\s\d]+$/),
  email: z.string().trim().email().max(255).optional().or(z.literal('')),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  // The form's time slots are 12-hour strings like "11:00 AM"; accept 24-hour too.
  time: z.string().trim().regex(/^\d{1,2}:\d{2}(\s?[AP]M)?$/i),
  partySize: z.number().int().min(1).max(50),
  specialRequests: z.string().trim().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await applyRateLimit(request, 5, 'reservations-create');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const data = reservationSchema.parse(body);

    // The form's min-date is client-side only; enforce it here too (IST = UTC+5:30).
    const todayIst = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];
    if (data.date < todayIst) {
      return NextResponse.json({ error: 'Reservation date cannot be in the past' }, { status: 400 });
    }

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

    await notifyAdmin({
      kind: 'reservation',
      name: reservation.name,
      phone: reservation.phone,
      date: reservation.date,
      time: reservation.time,
      partySize: reservation.partySize,
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

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');

    const where: any = {};
    if (since) {
      const sinceDate = new Date(since);
      if (isNaN(sinceDate.getTime())) {
        return NextResponse.json({ error: 'Invalid since date format' }, { status: 400 });
      }
      where.createdAt = { gt: sinceDate };

      const reservations = await db.reservation.findMany({
        where,
        select: {
          id: true,
          name: true,
          partySize: true,
          time: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(reservations);
    }

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
