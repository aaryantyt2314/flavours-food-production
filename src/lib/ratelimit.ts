import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse, type NextRequest } from 'next/server';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set');
}

export const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});

const limiterCache = new Map<string, Ratelimit>();

function getLimiter(limit: number, namespace: string) {
  const cacheKey = `${namespace}:${limit}`;
  const existingLimiter = limiterCache.get(cacheKey);

  if (existingLimiter) {
    return existingLimiter;
  }

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(limit, '1 m'),
    analytics: true,
    prefix: namespace,
  });

  limiterCache.set(cacheKey, limiter);
  return limiter;
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  return forwardedFor?.split(',')[0]?.trim() || realIp || '127.0.0.1';
}

export async function applyRateLimit(request: NextRequest, limit = 10, namespace = 'default') {
  const limiter = getLimiter(limit, namespace);
  const { success } = await limiter.limit(getClientIp(request));

  if (success) {
    return null;
  }

  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429 }
  );
}