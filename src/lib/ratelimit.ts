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

// The leftmost entry of `x-forwarded-for` is fully client-controlled, so using
// it lets an attacker rotate the header to defeat rate limiting. Instead we
// trust only headers set by the hosting proxy (Cloudflare / Vercel / nginx),
// and for `x-forwarded-for` we take the entry contributed by our own trusted
// proxy — i.e. `TRUSTED_PROXY_HOPS` positions from the right (default 1).
const TRUSTED_PROXY_HOPS = Number(process.env.TRUSTED_PROXY_HOPS ?? '1');

function getClientIp(request: NextRequest) {
  // Platform-provided headers a client cannot spoof (the proxy overwrites them).
  const trusted =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip');
  if (trusted) return trusted.trim();

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const parts = forwardedFor.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) {
      const hops = Number.isFinite(TRUSTED_PROXY_HOPS) && TRUSTED_PROXY_HOPS > 0
        ? TRUSTED_PROXY_HOPS
        : 1;
      // Pick from the right so client-appended entries on the left are ignored.
      const index = Math.max(0, parts.length - hops);
      return parts[index];
    }
  }

  return '127.0.0.1';
}

export async function applyRateLimit(request: NextRequest, limit = 10, namespace = 'default') {
  const redis = getRedis();

  if (!redis) {
    if (process.env.NODE_ENV === 'production') {
      console.error('Upstash Redis is required for production rate limiting.');
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    console.warn('Upstash Redis is not configured; allowing request through without rate limiting.');
    return null;
  }

  const limiter = getLimiter(limit, namespace, redis);
  const { success, limit: rateLimit, remaining, reset } = await limiter.limit(getClientIp(request));

  if (success) {
    return null;
  }

  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'RateLimit-Limit': String(rateLimit),
        'RateLimit-Remaining': String(remaining),
        'RateLimit-Reset': String(Math.ceil(reset / 1000)),
      },
    }
  );
}
