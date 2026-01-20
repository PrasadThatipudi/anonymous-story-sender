import { z } from 'zod';
import { ManagerRole } from '../../domain/enums/manager-role.enum.ts';

export interface ManagerResponseDTO {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export const CreateInvitationSchema = z.object({
  email: z.string().email('Valid email is required').toLowerCase().trim(),
  role: z.nativeEnum(ManagerRole, { errorMap: () => ({ message: 'Role must be ADMIN or MANAGER' }) }),
});

export type CreateInvitationDTO = z.infer<typeof CreateInvitationSchema>;

export const ListInvitationsSchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
});

export type ListInvitationsDTO = z.infer<typeof ListInvitationsSchema>;

export interface InvitationResponseDTO {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  used: boolean;
  usedAt: string | null;
  createdBy: {
    email: string;
  };
  createdAt: string;
}

