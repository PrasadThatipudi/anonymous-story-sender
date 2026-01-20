import { useMutation } from '@tanstack/react-query';
import { 
  login as apiLogin, 
  logout as apiLogout, 
  acceptInvitation as apiAcceptInvitation,
  LoginRequest,
  AcceptInvitationRequest 
} from '../api/auth';
import { useAuth as useAuthStore } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useLogin = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => apiLogin(credentials),
    onSuccess: (data) => {
      setAuth(data.token, data.manager);
      toast.success('Login successful!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed. Please check your credentials.');
    },
  });
};

export const useLogout = () => {
  const { logout: clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: apiLogout,
    onSuccess: () => {
      clearAuth();
      toast.success('Logged out successfully');
    },
  });
};

export const useAcceptInvitation = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: AcceptInvitationRequest) => apiAcceptInvitation(data),
    onSuccess: (data) => {
      setAuth(data.token, data.manager);
      toast.success('Account created successfully! Welcome!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to accept invitation';
      toast.error(message);
    },
  });
};

