import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createInvitation as apiCreateInvitation,
  listInvitations as apiListInvitations,
  revokeInvitation as apiRevokeInvitation,
  listManagers as apiListManagers,
} from '../api/managers';
import { CreateInvitationRequest } from '../types/manager.types';
import toast from 'react-hot-toast';

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvitationRequest) => apiCreateInvitation(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success(`Invitation sent to ${data.email}`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to send invitation';
      toast.error(message);
    },
  });
};

export const useInvitations = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['invitations', page, limit],
    queryFn: () => apiListInvitations(page, limit),
  });
};

export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => apiRevokeInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Invitation revoked successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to revoke invitation';
      toast.error(message);
    },
  });
};

export const useManagers = (page: number = 1, limit: number = 50) => {
  return useQuery({
    queryKey: ['managers', page, limit],
    queryFn: () => apiListManagers(page, limit),
  });
};

