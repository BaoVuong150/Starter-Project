import { create } from 'zustand';
import type { UserDto } from '../../../types';

interface AuthState {
  user: UserDto | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: UserDto | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setToken: (token) =>
    set({
      accessToken: token,
      isAuthenticated: !!token,
    }),
  setUser: (user) => set({ user }),
  logout: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    }),
}));
