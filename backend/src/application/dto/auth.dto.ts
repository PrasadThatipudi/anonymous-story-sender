import { z } from 'zod';
import { ManagerRole } from '../../domain/enums/manager-role.enum.ts';

export const LoginSchema = z.object({
  email: z.string().email('Valid email is required').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginDTO = z.infer<typeof LoginSchema>;

export const AcceptInvitationSchema = z.object({
  token: z.string().min(1, 'Token is required').trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters'),
});

export type AcceptInvitationDTO = z.infer<typeof AcceptInvitationSchema>;

