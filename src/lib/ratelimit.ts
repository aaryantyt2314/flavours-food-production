import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse, type NextRequest } from 'next/server';

const limiterCache = new Map<string, Ratelimit>();

function getRedis() {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    return null;
  }

  return new Redis({
    url: redisUrl,
    token: redisToken,
  });
}

function getLimiter(limit: number, namespace: string, redis: Redis) {
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
  const redis = getRedis();

  if (!redis) {
    console.warn('Upstash Redis is not configured; allowing request through without rate limiting.');
    return null;
  }

  const limiter = getLimiter(limit, namespace, redis);
  const { success } = await limiter.limit(getClientIp(request));

  if (success) {
    return null;
  }

  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429 }
  );
}