import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authErrorResponse, requireAdmin } from '@/lib/auth';
import { applyRateLimit } from '@/lib/ratelimit';

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await applyRateLimit(request, 5, 'contacts-create');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const data = contactSchema.parse(body);

    const inquiry = await db.contactInquiry.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject || null,
        message: data.message,
      },
    });

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error: unknown) {
    console.error('Contact error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await requireAdmin();
    const inquiries = await db.contactInquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(inquiries);
  } catch (error: unknown) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('Contacts GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}
