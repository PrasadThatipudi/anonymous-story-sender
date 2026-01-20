export enum ManagerRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
}

export interface Manager {
  id: string;
  email: string;
  role: ManagerRole;
  createdAt: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: ManagerRole;
  expiresAt: string;
  used: boolean;
  usedAt: string | null;
  createdBy: {
    email: string;
  };
  createdAt: string;
}

export interface CreateInvitationRequest {
  email: string;
  role: ManagerRole;
}

export interface CreateInvitationResponse extends Invitation {}

export interface AcceptInvitationRequest {
  token: string;
  password: string;
}

export interface AcceptInvitationResponse {
  token: string;
  manager: {
    id: string;
    email: string;
    role: ManagerRole;
  };
}

export interface ListInvitationsResponse {
  invitations: Invitation[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ListManagersResponse {
  managers: Manager[];
  total: number;
  page: number;
  totalPages: number;
}

