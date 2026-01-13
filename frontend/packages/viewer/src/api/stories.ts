import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SubmitStoryRequest {
  content: string;
}

export interface SubmitStoryResponse {
  id: string;
  message: string;
}

export const submitStory = async (data: SubmitStoryRequest): Promise<SubmitStoryResponse> => {
  const response = await apiClient.post<SubmitStoryResponse>('/stories', data);
  return response.data;
};

