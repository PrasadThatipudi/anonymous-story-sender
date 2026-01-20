export interface LoginCredentials {
  email: string;
  password: string;
}

export interface JWTPayload {
  managerId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface AuthResponse {
  token: string;
  manager: {
    id: string;
    email: string;
    role: string;
  };
}

