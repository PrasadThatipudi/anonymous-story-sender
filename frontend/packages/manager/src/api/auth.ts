import axios from 'axios';
import { authStore } from '../contexts/AuthContext';
import { ManagerRole } from '../types/manager.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = authStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  manager: {
    id: string;
    email: string;
    role: ManagerRole;
  };
}

export interface ManagerProfile {
  id: string;
  email: string;
  role: ManagerRole;
  createdAt: string;
}

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

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/login`, credentials);
  return response.data;
};

export const logout = async (): Promise<void> => {
  const token = authStore.getState().token;
  if (token) {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
};

export const getProfile = async (): Promise<ManagerProfile> => {
  const response = await apiClient.get<ManagerProfile>('/auth/me');
  return response.data;
};

export const acceptInvitation = async (data: AcceptInvitationRequest): Promise<AcceptInvitationResponse> => {
  const response = await axios.post<AcceptInvitationResponse>(`${API_BASE_URL}/auth/accept-invitation`, data);
  return response.data;
};

export { apiClient };

