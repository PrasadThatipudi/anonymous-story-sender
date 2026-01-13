import { Context, Next } from 'hono';
import { AuthService } from '../../application/services/auth.service.ts';
import { ManagerRepository } from '../../infrastructure/database/repositories/manager.repository.ts';
import { getPrismaClient } from '../../infrastructure/database/prisma.client.ts';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', message: 'Missing or invalid authorization header' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const prisma = getPrismaClient();
    const managerRepo = new ManagerRepository(prisma);
    const authService = new AuthService(managerRepo);

    const payload = await authService.verifyToken(token);

    c.set('managerId', payload.managerId);
    c.set('email', payload.email);

    await next();
  } catch (error) {
    console.error({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message: 'Authentication failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return c.json({ error: 'Unauthorized', message: 'Invalid or expired token' }, 401);
  }
}

