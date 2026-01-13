import { Hono } from 'hono';
import { StoryService } from '../../application/services/story.service.ts';
import { EmailService } from '../../application/services/email.service.ts';
import { StoryRepository } from '../../infrastructure/database/repositories/story.repository.ts';
import { getPrismaClient } from '../../infrastructure/database/prisma.client.ts';
import { StoryQuerySchema, UpdateStorySchema, ExportQuerySchema } from '../../application/dto/story.dto.ts';
import { authMiddleware } from '../middleware/auth.middleware.ts';
import { apiRateLimiter } from '../middleware/rate-limit.middleware.ts';

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

managerRoutes.patch('/stories/:id', async (c) => {
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

managerRoutes.delete('/stories/:id', async (c) => {
  const id = c.req.param('id');
  const managerId = c.get('managerId') as string;

  const prisma = getPrismaClient();
  const storyRepo = new StoryRepository(prisma);
  const emailService = new EmailService();
  const storyService = new StoryService(storyRepo, emailService);

  await storyService.deleteStory(id, managerId);

  return c.json({ message: 'Story deleted successfully' }, 200);
});

managerRoutes.get('/stories/export', async (c) => {
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

export default managerRoutes;

