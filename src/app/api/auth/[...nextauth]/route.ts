import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { applyRateLimit } from '@/lib/ratelimit';
import { type NextRequest } from 'next/server';

const handler = NextAuth(authOptions);

export { handler as GET };

export async function POST(request: NextRequest) {
	if (request.nextUrl.pathname.includes('/callback/credentials')) {
		const rateLimitResponse = await applyRateLimit(request, 10, 'auth-login');
		if (rateLimitResponse) return rateLimitResponse;
	}

	return handler(request);
}
