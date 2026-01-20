import { apiClient } from './auth';
import {
  CreateInvitationRequest,
  CreateInvitationResponse,
  ListInvitationsResponse,
  ListManagersResponse,
} from '../types/manager.types';

export const createInvitation = async (data: CreateInvitationRequest): Promise<CreateInvitationResponse> => {
  const response = await apiClient.post<CreateInvitationResponse>('/manager/invitations', data);
  return response.data;
};

export const listInvitations = async (page: number = 1, limit: number = 20): Promise<ListInvitationsResponse> => {
  const response = await apiClient.get<ListInvitationsResponse>('/manager/invitations', {
    params: { page, limit },
  });
  return response.data;
};

export const revokeInvitation = async (invitationId: string): Promise<void> => {
  await apiClient.delete(`/manager/invitations/${invitationId}`);
};

export const listManagers = async (page: number = 1, limit: number = 50): Promise<ListManagersResponse> => {
  const response = await apiClient.get<ListManagersResponse>('/manager/managers', {
    params: { page, limit },
  });
  return response.data;
};

