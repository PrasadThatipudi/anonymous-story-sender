import { StoryRepository } from '../../infrastructure/database/repositories/story.repository.ts';
import { EmailService } from './email.service.ts';
import { CreateStoryInput, UpdateStoryInput } from '../../domain/entities/story.entity.ts';
import { StoryListFilter, StoryListResponse, StoryStats, ExportFilter } from '../../domain/types/story.types.ts';
import { StoryStatus } from '../../domain/enums/story-status.enum.ts';

export class StoryService {
  constructor(
    private readonly storyRepo: StoryRepository,
    private readonly emailService: EmailService
  ) {}

  async submitStory(data: CreateStoryInput): Promise<{ id: string; message: string }> {
    const story = await this.storyRepo.create(data);

    console.log({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: 'Story submitted',
      context: {
        storyId: story.id,
        contentLength: data.content.length,
      },
    });

    this.emailService.sendStoryNotification(story.id, data.content).catch((error) => {
      console.error('Email notification failed:', error);
    });

    return {
      id: story.id,
      message: 'Story submitted successfully',
    };
  }

  async getStories(filter: StoryListFilter): Promise<StoryListResponse> {
    const { stories, total } = await this.storyRepo.findMany(filter);

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const totalPages = Math.ceil(total / limit);

    return {
      stories: stories.map((story) => ({
        id: story.id,
        content: story.content,
        status: story.status,
        notes: story.notes,
        submittedAt: story.submittedAt.toISOString(),
        updatedAt: story.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getStoryById(id: string) {
    const story = await this.storyRepo.findById(id);

    if (!story) {
      throw new Error('Story not found');
    }

    return {
      id: story.id,
      content: story.content,
      status: story.status,
      notes: story.notes,
      submittedAt: story.submittedAt.toISOString(),
      updatedAt: story.updatedAt.toISOString(),
    };
  }

  async updateStory(id: string, data: UpdateStoryInput, managerId: string) {
    const existing = await this.storyRepo.findById(id);

    if (!existing) {
      throw new Error('Story not found');
    }

    const updated = await this.storyRepo.update(id, data);

    console.log({
      timestamp: new Date().toISOString(),
      level: 'AUDIT',
      message: 'Story updated',
      context: {
        storyId: id,
        managerId,
        changes: data,
      },
    });

    return {
      id: updated.id,
      content: updated.content,
      status: updated.status,
      notes: updated.notes,
      submittedAt: updated.submittedAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async deleteStory(id: string, managerId: string): Promise<void> {
    const existing = await this.storyRepo.findById(id);

    if (!existing) {
      throw new Error('Story not found');
    }

    await this.storyRepo.delete(id);

    console.log({
      timestamp: new Date().toISOString(),
      level: 'AUDIT',
      message: 'Story deleted',
      context: {
        storyId: id,
        managerId,
      },
    });
  }

  async getStats(): Promise<StoryStats> {
    return await this.storyRepo.getStats();
  }

  async exportStories(filter: ExportFilter): Promise<string> {
    const stories = await this.storyRepo.findByFilter({
      status: filter.status,
      from: filter.from ? new Date(filter.from) : undefined,
      to: filter.to ? new Date(filter.to) : undefined,
    });

    if (filter.format === 'json') {
      return JSON.stringify(
        stories.map((story) => ({
          id: story.id,
          content: story.content,
          status: story.status,
          notes: story.notes,
          submittedAt: story.submittedAt.toISOString(),
          updatedAt: story.updatedAt.toISOString(),
        })),
        null,
        2
      );
    } else {
      const csvRows = [
        ['ID', 'Content', 'Status', 'Notes', 'Submitted At', 'Updated At'].join(','),
      ];

      for (const story of stories) {
        const row = [
          story.id,
          `"${story.content.replace(/"/g, '""')}"`,
          story.status,
          story.notes ? `"${story.notes.replace(/"/g, '""')}"` : '',
          story.submittedAt.toISOString(),
          story.updatedAt.toISOString(),
        ];
        csvRows.push(row.join(','));
      }

      return csvRows.join('\n');
    }
  }
}

