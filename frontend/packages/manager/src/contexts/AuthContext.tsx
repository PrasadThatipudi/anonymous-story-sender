import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ManagerRole } from '../types/manager.types';

interface Manager {
  id: string;
  email: string;
  role: ManagerRole;
}

interface AuthState {
  token: string | null;
  manager: Manager | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (token: string, manager: Manager) => void;
  logout: () => void;
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      manager: null,
      isAuthenticated: false,
      isAdmin: false,
      setAuth: (token, manager) =>
        set({
          token,
          manager,
          isAuthenticated: true,
          isAdmin: manager.role === ManagerRole.ADMIN,
        }),
      logout: () =>
        set({
          token: null,
          manager: null,
          isAuthenticated: false,
          isAdmin: false,
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useAuth = () => authStore();

