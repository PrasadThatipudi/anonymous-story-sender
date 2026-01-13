export enum StoryStatus {
  NEW = 'NEW',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED',
  FLAGGED = 'FLAGGED',
}

export interface Story {
  id: string;
  content: string;
  status: StoryStatus;
  notes: string | null;
  submittedAt: string;
  updatedAt: string;
}

export interface StoryListResponse {
  stories: Story[];
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

export interface UpdateStoryRequest {
  status?: StoryStatus;
  notes?: string;
}

