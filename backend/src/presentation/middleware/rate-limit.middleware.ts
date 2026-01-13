import { Context, Next } from 'hono';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 60000;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (c: Context) => string;
}) {
  const { windowMs, maxRequests, keyGenerator = (c: Context) => c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown' } = options;

  return async (c: Context, next: Next) => {
    const key = keyGenerator(c);
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, entry);
    }

    entry.count++;

    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

      console.log({
        timestamp: new Date().toISOString(),
        level: 'WARN',
        message: 'Rate limit exceeded',
        context: {
          key: key.replace(/\d+$/, '***'),
          count: entry.count,
          limit: maxRequests,
        },
      });

      c.res.headers.set('Retry-After', retryAfter.toString());
      return c.json(
        {
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter,
        },
        429
      );
    }

    c.res.headers.set('X-RateLimit-Limit', maxRequests.toString());
    c.res.headers.set('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count).toString());
    c.res.headers.set('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());

    await next();
  };
}

export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
});

export const storySubmissionRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 10,
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
  keyGenerator: (c: Context) => {
    const managerId = c.get('managerId') as string | undefined;
    return managerId || c.req.header('x-forwarded-for') || 'unknown';
  },
});

