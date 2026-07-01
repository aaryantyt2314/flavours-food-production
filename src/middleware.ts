import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit } from '@/lib/ratelimit';

export async function middleware(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.next();
  }

  const rateLimitResponse = await applyRateLimit(request, 10, 'auth-login');

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/auth/callback/credentials'],
};