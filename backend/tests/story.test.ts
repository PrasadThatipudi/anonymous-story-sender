import { assertEquals, assertExists } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { StoryService } from '../src/application/services/story.service.ts';
import { StoryRepository } from '../src/infrastructure/database/repositories/story.repository.ts';
import { EmailService } from '../src/application/services/email.service.ts';
import { StoryStatus } from '../src/domain/enums/story-status.enum.ts';

Deno.test('StoryService - submitStory should create a story', async () => {
  const mockRepo: Partial<StoryRepository> = {
    create: async (data) => ({
      id: 'test-id',
      content: data.content,
      status: StoryStatus.NEW,
      notes: null,
      submittedAt: new Date(),
      updatedAt: new Date(),
    }),
  };

  const mockEmailService: Partial<EmailService> = {
    sendStoryNotification: async () => {},
  };

  const service = new StoryService(
    mockRepo as StoryRepository,
    mockEmailService as EmailService
  );

  const result = await service.submitStory({ content: 'Test story' });

  assertExists(result.id);
  assertEquals(result.message, 'Story submitted successfully');
});

Deno.test('StoryService - getStats should return correct counts', async () => {
  const mockRepo: Partial<StoryRepository> = {
    getStats: async () => ({
      total: 10,
      new: 5,
      read: 3,
      archived: 2,
      flagged: 0,
    }),
  };

  const mockEmailService: Partial<EmailService> = {
    sendStoryNotification: async () => {},
  };

  const service = new StoryService(
    mockRepo as StoryRepository,
    mockEmailService as EmailService
  );

  const stats = await service.getStats();

  assertEquals(stats.total, 10);
  assertEquals(stats.new, 5);
});

