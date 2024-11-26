import { create } from 'zustand';

interface User {
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  login: (user) => set({ user, loading: false }),
  logout: () => set({ user: null, loading: false }),
}));