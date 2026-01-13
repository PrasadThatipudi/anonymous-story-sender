import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Valid email is required').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginDTO = z.infer<typeof LoginSchema>;

export const CreateManagerSchema = z.object({
  email: z.string().email('Valid email is required').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters'),
});

export type CreateManagerDTO = z.infer<typeof CreateManagerSchema>;

