import { Hono } from 'hono';
import { StoryService } from '../../application/services/story.service.ts';
import { EmailService } from '../../application/services/email.service.ts';
import { ManagerService } from '../../application/services/manager.service.ts';
import { StoryRepository } from '../../infrastructure/database/repositories/story.repository.ts';
import { ManagerRepository } from '../../infrastructure/database/repositories/manager.repository.ts';
import { InvitationRepository } from '../../infrastructure/database/repositories/invitation.repository.ts';
import { GmailClient } from '../../infrastructure/email/gmail.client.ts';
import { getPrismaClient } from '../../infrastructure/database/prisma.client.ts';
import { StoryQuerySchema, UpdateStorySchema, ExportQuerySchema } from '../../application/dto/story.dto.ts';
import { CreateInvitationSchema, ListInvitationsSchema } from '../../application/dto/manager.dto.ts';
import { authMiddleware, requireAdmin } from '../middleware/auth.middleware.ts';
import { requireStoryWrite, requireStoryExport } from '../middleware/permission.middleware.ts';
import { apiRateLimiter, createRateLimiter } from '../middleware/rate-limit.middleware.ts';

const invitationRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 10,
});

const managerRoutes = new Hono();

managerRoutes.use('*', authMiddleware);
managerRoutes.use('*', apiRateLimiter);

managerRoutes.get('/stories', async (c) => {
  const query = c.req.query();
  const filter = StoryQuerySchema.parse(query);

  const prisma = getPrismaClient();
  const storyRepo = new StoryRepository(prisma);
  const emailService = new EmailService();
  const storyService = new StoryService(storyRepo, emailService);

  const result = await storyService.getStories(filter);

  return c.json(result, 200);
});

managerRoutes.get('/stories/:id', async (c) => {
  const id = c.req.param('id');

  const prisma = getPrismaClient();
  const storyRepo = new StoryRepository(prisma);
  const emailService = new EmailService();
  const storyService = new StoryService(storyRepo, emailService);

  const story = await storyService.getStoryById(id);

  return c.json(story, 200);
});

managerRoutes.patch('/stories/:id', requireStoryWrite, async (c) => {
  const id = c.req.param('id');
  const managerId = c.get('managerId') as string;
  const body = await c.req.json();
  const data = UpdateStorySchema.parse(body);

  const prisma = getPrismaClient();
  const storyRepo = new StoryRepository(prisma);
  const emailService = new EmailService();
  const storyService = new StoryService(storyRepo, emailService);

  const story = await storyService.updateStory(id, data, managerId);

  return c.json(story, 200);
});

managerRoutes.delete('/stories/:id', requireStoryWrite, async (c) => {
  const id = c.req.param('id');
  const managerId = c.get('managerId') as string;

  const prisma = getPrismaClient();
  const storyRepo = new StoryRepository(prisma);
  const emailService = new EmailService();
  const storyService = new StoryService(storyRepo, emailService);

  await storyService.deleteStory(id, managerId);

  return c.json({ message: 'Story deleted successfully' }, 200);
});

managerRoutes.get('/stories/export', requireStoryExport, async (c) => {
  const query = c.req.query();
  const filter = ExportQuerySchema.parse(query);

  const prisma = getPrismaClient();
  const storyRepo = new StoryRepository(prisma);
  const emailService = new EmailService();
  const storyService = new StoryService(storyRepo, emailService);

  const data = await storyService.exportStories(filter);

  const contentType = filter.format === 'json' ? 'application/json' : 'text/csv';
  const filename = `stories-${new Date().toISOString().split('T')[0]}.${filter.format}`;

  c.res.headers.set('Content-Type', contentType);
  c.res.headers.set('Content-Disposition', `attachment; filename="${filename}"`);

  return c.body(data, 200);
});

managerRoutes.get('/stats', async (c) => {
  const prisma = getPrismaClient();
  const storyRepo = new StoryRepository(prisma);
  const emailService = new EmailService();
  const storyService = new StoryService(storyRepo, emailService);

  const stats = await storyService.getStats();

  return c.json(stats, 200);
});

managerRoutes.post('/invitations', requireAdmin, invitationRateLimiter, async (c) => {
  try {
    const managerId = c.get('managerId') as string;
    const body = await c.req.json();
    const data = CreateInvitationSchema.parse(body);

    const prisma = getPrismaClient();
    const invitationRepo = new InvitationRepository(prisma);
    const managerRepo = new ManagerRepository(prisma);
    const emailClient = new GmailClient();
    const managerService = new ManagerService(invitationRepo, managerRepo, emailClient);

    const invitation = await managerService.createInvitation(data, managerId);

    return c.json(invitation, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('already exists') || error.message.includes('pending invitation')) {
        return c.json({ error: 'Conflict', message: error.message }, 409);
      }
    }
    throw error;
  }
});

managerRoutes.get('/invitations', requireAdmin, async (c) => {
  const query = c.req.query();
  const filter = ListInvitationsSchema.parse(query);

  const prisma = getPrismaClient();
  const invitationRepo = new InvitationRepository(prisma);
  const managerRepo = new ManagerRepository(prisma);
  const emailClient = new GmailClient();
  const managerService = new ManagerService(invitationRepo, managerRepo, emailClient);

  const result = await managerService.listInvitations(filter.page, filter.limit);

  return c.json(result, 200);
});

managerRoutes.delete('/invitations/:id', requireAdmin, async (c) => {
  const id = c.req.param('id');
  const managerId = c.get('managerId') as string;

  const prisma = getPrismaClient();
  const invitationRepo = new InvitationRepository(prisma);
  const managerRepo = new ManagerRepository(prisma);
  const emailClient = new GmailClient();
  const managerService = new ManagerService(invitationRepo, managerRepo, emailClient);

  await managerService.revokeInvitation(id, managerId);

  return c.json({ message: 'Invitation revoked successfully' }, 200);
});

managerRoutes.get('/managers', requireAdmin, async (c) => {
  const query = c.req.query();
  const page = query.page ? parseInt(query.page) : 1;
  const limit = query.limit ? parseInt(query.limit) : 50;

  const prisma = getPrismaClient();
  const invitationRepo = new InvitationRepository(prisma);
  const managerRepo = new ManagerRepository(prisma);
  const emailClient = new GmailClient();
  const managerService = new ManagerService(invitationRepo, managerRepo, emailClient);

  const result = await managerService.listManagers(page, limit);

  return c.json(result, 200);
});

export default managerRoutes;

