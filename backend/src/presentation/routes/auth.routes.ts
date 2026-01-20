import { Hono } from 'hono';
import { AuthService } from '../../application/services/auth.service.ts';
import { ManagerRepository } from '../../infrastructure/database/repositories/manager.repository.ts';
import { InvitationRepository } from '../../infrastructure/database/repositories/invitation.repository.ts';
import { getPrismaClient } from '../../infrastructure/database/prisma.client.ts';
import { LoginSchema, AcceptInvitationSchema } from '../../application/dto/auth.dto.ts';
import { authMiddleware } from '../middleware/auth.middleware.ts';
import { loginRateLimiter, createRateLimiter } from '../middleware/rate-limit.middleware.ts';

const acceptInvitationRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 3,
});

const authRoutes = new Hono();

authRoutes.post('/login', loginRateLimiter, async (c) => {
  try {
    const body = await c.req.json();
    const data = LoginSchema.parse(body);

    const prisma = getPrismaClient();
    const managerRepo = new ManagerRepository(prisma);
    const authService = new AuthService(managerRepo);

    const result = await authService.login(data);

    return c.json(result, 200);
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid credentials') {
      return c.json({ error: 'Authentication Failed', message: 'Invalid email or password' }, 401);
    }
    throw error;
  }
});

authRoutes.post('/logout', authMiddleware, async (c) => {
  const managerId = c.get('managerId') as string;

  console.log({
    timestamp: new Date().toISOString(),
    level: 'AUDIT',
    message: 'Manager logout',
    context: { managerId },
  });

  return c.json({ message: 'Logged out successfully' }, 200);
});

authRoutes.post('/accept-invitation', acceptInvitationRateLimiter, async (c) => {
  try {
    const body = await c.req.json();
    const data = AcceptInvitationSchema.parse(body);

    const prisma = getPrismaClient();
    const managerRepo = new ManagerRepository(prisma);
    const invitationRepo = new InvitationRepository(prisma);
    const authService = new AuthService(managerRepo, invitationRepo);

    const result = await authService.acceptInvitation(data.token, data.password);

    return c.json(result, 200);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Invalid') || error.message.includes('expired') || error.message.includes('used')) {
        return c.json({ error: 'Invitation Error', message: error.message }, 400);
      }
      if (error.message.includes('already exists')) {
        return c.json({ error: 'Account Exists', message: 'An account with this email already exists' }, 409);
      }
    }
    throw error;
  }
});

authRoutes.get('/me', authMiddleware, async (c) => {
  const managerId = c.get('managerId') as string;

  const prisma = getPrismaClient();
  const managerRepo = new ManagerRepository(prisma);
  const authService = new AuthService(managerRepo);

  const manager = await authService.getManagerById(managerId);

  return c.json(manager, 200);
});

export default authRoutes;

