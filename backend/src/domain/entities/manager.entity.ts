import { ManagerRole } from '../enums/manager-role.enum.ts';

export interface ManagerEntity {
  id: string;
  email: string;
  password: string;
  role: ManagerRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateManagerInput {
  email: string;
  password: string;
  role: ManagerRole;
}

export interface ManagerPublicData {
  id: string;
  email: string;
  role: ManagerRole;
  createdAt: Date;
}

