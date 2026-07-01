import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { applyRateLimit } from '@/lib/ratelimit';

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await applyRateLimit(request, 5, 'auth-register');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const data = registerSchema.parse(body);

    // Check if user already exists
    const existing = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        password: hashedPassword,
        role: 'customer',
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword, message: 'Registration successful' }, { status: 201 });
  } catch (error: unknown) {
    console.error('Register error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
