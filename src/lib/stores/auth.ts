import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  setAuth: (token, user) => {
    localStorage.setItem('rakit_token', token);
    localStorage.setItem('rakit_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true, isInitialized: true });
  },

  logout: () => {
    localStorage.removeItem('rakit_token');
    localStorage.removeItem('rakit_user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('rakit_token');
    const userStr = localStorage.getItem('rakit_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ token, user, isAuthenticated: true, isInitialized: true });
        return;
      } catch {
        localStorage.removeItem('rakit_token');
        localStorage.removeItem('rakit_user');
      }
    }
    set({ isInitialized: true });
  },
}));
