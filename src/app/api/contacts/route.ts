import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authErrorResponse, requireAdmin } from '@/lib/auth';
import { applyRateLimit } from '@/lib/ratelimit';
import { notifyAdmin } from '@/lib/notify';

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255).transform((email) => email.toLowerCase()),
  phone: z.string().trim().max(20).regex(/^[+()\-\s\d]*$/).optional(),
  subject: z.string().trim().max(150).optional(),
  message: z.string().trim().min(1).max(2000),
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
        phone: data.phone?.trim() || null,
        subject: data.subject?.trim() || null,
        message: data.message,
      },
    });

    await notifyAdmin({
      kind: 'inquiry',
      name: inquiry.name,
      email: inquiry.email,
      subject: inquiry.subject,
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
