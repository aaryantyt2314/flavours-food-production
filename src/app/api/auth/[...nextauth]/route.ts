import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { applyRateLimit } from '@/lib/ratelimit';
import { type NextRequest } from 'next/server';

const handler = NextAuth(authOptions);

// GET requests don't need rate limiting, so we can export them directly
export { handler as GET };

// Explicit type for App Router context params
type RouteContext = {
    params: Promise<{ nextauth: string[] }> | { nextauth: string[] };
};

export async function POST(request: NextRequest, context: RouteContext) {
    // 1. Intercept and apply rate limiting if it's the credentials callback
    if (request.nextUrl.pathname.includes('/callback/credentials')) {
        const rateLimitResponse = await applyRateLimit(request, 10, 'auth-login');
        if (rateLimitResponse) return rateLimitResponse;
    }

    // 2. Pass BOTH request and context down to NextAuth so it can read route parameters safely
    return handler(request, context as any);
}