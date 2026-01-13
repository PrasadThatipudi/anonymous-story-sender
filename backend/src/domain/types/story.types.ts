import { StoryStatus } from '../enums/story-status.enum.ts';

export interface StoryListFilter {
  status?: StoryStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface StoryListResponse {
  stories: Array<{
    id: string;
    content: string;
    status: StoryStatus;
    notes: string | null;
    submittedAt: string;
    updatedAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StoryStats {
  total: number;
  new: number;
  read: number;
  archived: number;
  flagged: number;
}

export interface ExportFilter {
  format: 'json' | 'csv';
  status?: StoryStatus;
  from?: string;
  to?: string;
}

