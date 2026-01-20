import { ManagerRole } from '../enums/manager-role.enum.ts';

export interface InvitationEntity {
  id: string;
  email: string;
  token: string;
  role: ManagerRole;
  expiresAt: Date;
  used: boolean;
  usedAt: Date | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvitationInput {
  email: string;
  role: ManagerRole;
  createdById: string;
}

export interface InvitationWithCreator extends InvitationEntity {
  createdBy: {
    id: string;
    email: string;
    role: ManagerRole;
  };
}

