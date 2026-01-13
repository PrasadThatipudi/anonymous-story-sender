import { apiClient } from './auth';
import { Story, StoryListResponse, StoryStats, UpdateStoryRequest } from '../types/story.types';

export interface GetStoriesParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const getStories = async (params: GetStoriesParams = {}): Promise<StoryListResponse> => {
  const response = await apiClient.get<StoryListResponse>('/manager/stories', { params });
  return response.data;
};

export const getStoryById = async (id: string): Promise<Story> => {
  const response = await apiClient.get<Story>(`/manager/stories/${id}`);
  return response.data;
};

export const updateStory = async (
  id: string,
  data: UpdateStoryRequest
): Promise<Story> => {
  const response = await apiClient.patch<Story>(`/manager/stories/${id}`, data);
  return response.data;
};

export const deleteStory = async (id: string): Promise<void> => {
  await apiClient.delete(`/manager/stories/${id}`);
};

export const getStats = async (): Promise<StoryStats> => {
  const response = await apiClient.get<StoryStats>('/manager/stats');
  return response.data;
};

export const exportStories = async (format: 'json' | 'csv' = 'json'): Promise<Blob> => {
  const response = await apiClient.get('/manager/stories/export', {
    params: { format },
    responseType: 'blob',
  });
  return response.data;
};

