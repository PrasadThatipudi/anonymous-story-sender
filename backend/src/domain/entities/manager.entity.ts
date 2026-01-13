export interface ManagerEntity {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateManagerInput {
  email: string;
  password: string;
}

export interface ManagerPublicData {
  id: string;
  email: string;
  createdAt: Date;
}

