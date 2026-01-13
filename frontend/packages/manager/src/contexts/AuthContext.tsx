import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Manager {
  id: string;
  email: string;
}

interface AuthState {
  token: string | null;
  manager: Manager | null;
  isAuthenticated: boolean;
  setAuth: (token: string, manager: Manager) => void;
  logout: () => void;
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      manager: null,
      isAuthenticated: false,
      setAuth: (token, manager) =>
        set({
          token,
          manager,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          token: null,
          manager: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useAuth = () => authStore();

