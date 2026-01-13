import { z } from 'zod';
import { StoryStatus, StoryStatusValues } from '../../domain/enums/story-status.enum.ts';

export const CreateStorySchema = z.object({
  content: z
    .string()
    .min(1, 'Story content is required')
    .max(50000, 'Story content must not exceed 50,000 characters')
    .trim(),
});

export type CreateStoryDTO = z.infer<typeof CreateStorySchema>;

export const UpdateStorySchema = z.object({
  status: z.enum(StoryStatusValues as [string, ...string[]]).optional(),
  notes: z.string().max(5000, 'Notes must not exceed 5,000 characters').optional(),
});

export type UpdateStoryDTO = z.infer<typeof UpdateStorySchema>;

export const StoryQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  status: z.enum(StoryStatusValues as [string, ...string[]]).optional(),
  search: z.string().optional(),
});

export type StoryQueryDTO = z.infer<typeof StoryQuerySchema>;

export const ExportQuerySchema = z.object({
  format: z.enum(['json', 'csv']).default('json'),
  status: z.enum(StoryStatusValues as [string, ...string[]]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type ExportQueryDTO = z.infer<typeof ExportQuerySchema>;

