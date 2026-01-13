import { Context, Next } from 'hono';
import { getCorsOrigins } from '../../config/env.ts';

export async function corsMiddleware(c: Context, next: Next) {
  const allowedOrigins = getCorsOrigins();
  const origin = c.req.header('origin') || '';

  if (allowedOrigins.includes(origin)) {
    c.res.headers.set('Access-Control-Allow-Origin', origin);
  }

  c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.res.headers.set('Access-Control-Allow-Credentials', 'true');
  c.res.headers.set('Access-Control-Max-Age', '86400');

  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }

  await next();
}

