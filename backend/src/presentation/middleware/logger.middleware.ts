import { Context, Next } from 'hono';

interface LogContext {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  context: {
    method: string;
    path: string;
    statusCode?: number;
    duration?: number;
    ip?: string;
    managerId?: string;
  };
}

function maskIP(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
  }
  return 'unknown';
}

function log(logData: LogContext): void {
  console.log(JSON.stringify(logData));
}

export async function loggerMiddleware(c: Context, next: Next) {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';

  await next();

  const duration = Date.now() - start;
  const statusCode = c.res.status;
  const managerId = c.get('managerId') as string | undefined;

  const logData: LogContext = {
    timestamp: new Date().toISOString(),
    level: statusCode >= 500 ? 'ERROR' : statusCode >= 400 ? 'WARN' : 'INFO',
    message: `${method} ${path} ${statusCode}`,
    context: {
      method,
      path,
      statusCode,
      duration,
      ip: maskIP(ip),
      ...(managerId && { managerId }),
    },
  };

  log(logData);
}

