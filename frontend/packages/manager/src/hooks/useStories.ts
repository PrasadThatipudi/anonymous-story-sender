import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStories,
  getStoryById,
  updateStory,
  deleteStory,
  getStats,
  GetStoriesParams,
} from '../api/stories';
import { UpdateStoryRequest } from '../types/story.types';
import toast from 'react-hot-toast';

export const useStories = (params: GetStoriesParams = {}) => {
  return useQuery({
    queryKey: ['stories', params],
    queryFn: () => getStories(params),
  });
};

export const useStory = (id: string | null) => {
  return useQuery({
    queryKey: ['story', id],
    queryFn: () => getStoryById(id!),
    enabled: !!id,
  });
};

export const useUpdateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStoryRequest }) =>
      updateStory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Story updated successfully');
    },
    onError: () => {
      toast.error('Failed to update story');
    },
  });
};

export const useDeleteStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Story deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete story');
    },
  });
};

export const useStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    refetchInterval: 30000,
  });
};

