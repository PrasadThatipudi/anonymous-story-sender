import { StoryStatus } from '../enums/story-status.enum.ts';

export interface StoryEntity {
  id: string;
  content: string;
  status: StoryStatus;
  notes: string | null;
  submittedAt: Date;
  updatedAt: Date;
}

export interface CreateStoryInput {
  content: string;
}

export interface UpdateStoryInput {
  status?: StoryStatus;
  notes?: string;
}

