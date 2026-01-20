import { Context, Next } from 'hono';
import { AuthService } from '../../application/services/auth.service.ts';
import { ManagerRepository } from '../../infrastructure/database/repositories/manager.repository.ts';
import { getPrismaClient } from '../../infrastructure/database/prisma.client.ts';
import { ManagerRole } from '../../domain/enums/manager-role.enum.ts';

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

    const manager = await managerRepo.findById(payload.managerId);
    if (!manager) {
      return c.json({ error: 'Unauthorized', message: 'Manager not found' }, 401);
    }

    c.set('managerId', payload.managerId);
    c.set('email', payload.email);
    c.set('role', manager.role);

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

export async function requireAdmin(c: Context, next: Next) {
  const role = c.get('role') as string;

  if (role !== ManagerRole.ADMIN) {
    console.log({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message: 'Admin access denied',
      context: {
        managerId: c.get('managerId'),
        role,
      },
    });

    return c.json({ error: 'Forbidden', message: 'Admin access required' }, 403);
  }

  await next();
}

