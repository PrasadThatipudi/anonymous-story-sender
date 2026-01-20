import { Hono } from 'hono';
import { StoryService } from '../../application/services/story.service.ts';
import { EmailService } from '../../application/services/email.service.ts';
import { StoryRepository } from '../../infrastructure/database/repositories/story.repository.ts';
import { ManagerRepository } from '../../infrastructure/database/repositories/manager.repository.ts';
import { getPrismaClient } from '../../infrastructure/database/prisma.client.ts';
import { CreateStorySchema } from '../../application/dto/story.dto.ts';
import { storySubmissionRateLimiter } from '../middleware/rate-limit.middleware.ts';

const storyRoutes = new Hono();

storyRoutes.post('/', storySubmissionRateLimiter, async (c) => {
  const body = await c.req.json();
  const data = CreateStorySchema.parse(body);

  const prisma = getPrismaClient();
  const storyRepo = new StoryRepository(prisma);
  const managerRepo = new ManagerRepository(prisma);
  const emailService = new EmailService(managerRepo);
  const storyService = new StoryService(storyRepo, emailService);

  const result = await storyService.submitStory(data);

  return c.json(result, 201);
});

export default storyRoutes;

