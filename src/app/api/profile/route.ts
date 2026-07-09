import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authErrorResponse, requireAuth } from '@/lib/auth';
import { applyRateLimit } from '@/lib/ratelimit';

const profileSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().max(20).regex(/^[+()\-\s\d]*$/).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const rateLimitResponse = await applyRateLimit(request, 20, 'profile-update');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const data = profileSchema.parse(body);

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        phone: data.phone?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;

    console.error('Profile update error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
