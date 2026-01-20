import { StoryEntity, CreateStoryInput, UpdateStoryInput } from '../../../domain/entities/story.entity.ts';
import { StoryStatus } from '../../../domain/enums/story-status.enum.ts';
import { StoryListFilter, StoryStats } from '../../../domain/types/story.types.ts';

export class StoryRepository {
  constructor(private readonly prisma: any) {}

  async create(data: CreateStoryInput): Promise<StoryEntity> {
    return await this.prisma.story.create({
      data: {
        content: data.content,
        status: StoryStatus.NEW,
      },
    });
  }

  async findById(id: string): Promise<StoryEntity | null> {
    return await this.prisma.story.findUnique({
      where: { id },
    });
  }

  async findMany(filter: StoryListFilter): Promise<{ stories: StoryEntity[]; total: number }> {
    const { status, search, page = 1, limit = 20 } = filter;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [stories, total] = await Promise.all([
      this.prisma.story.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.story.count({ where }),
    ]);

    return { stories, total };
  }

  async update(id: string, data: UpdateStoryInput): Promise<StoryEntity> {
    return await this.prisma.story.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.story.delete({
      where: { id },
    });
  }

  async getStats(): Promise<StoryStats> {
    const [total, newCount, readCount, archivedCount, flaggedCount] = await Promise.all([
      this.prisma.story.count(),
      this.prisma.story.count({ where: { status: StoryStatus.NEW } }),
      this.prisma.story.count({ where: { status: StoryStatus.READ } }),
      this.prisma.story.count({ where: { status: StoryStatus.ARCHIVED } }),
      this.prisma.story.count({ where: { status: StoryStatus.FLAGGED } }),
    ]);

    return {
      total,
      new: newCount,
      read: readCount,
      archived: archivedCount,
      flagged: flaggedCount,
    };
  }

  async findByFilter(filter: {
    status?: StoryStatus;
    from?: Date;
    to?: Date;
  }): Promise<StoryEntity[]> {
    const where: Record<string, unknown> = {};

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.from || filter.to) {
      where.submittedAt = {};
      if (filter.from) {
        (where.submittedAt as Record<string, unknown>).gte = filter.from;
      }
      if (filter.to) {
        (where.submittedAt as Record<string, unknown>).lte = filter.to;
      }
    }

    return await this.prisma.story.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
    });
  }
}
