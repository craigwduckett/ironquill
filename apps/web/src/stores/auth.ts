import { create } from 'zustand';

type AuthUser = {
  id: string;
  email: string;
  displayName: string;
};

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
};

// In-memory only — no localStorage persistence.
// The access token is intentionally ephemeral: it lives only in memory and is
// restored on page load via GET /auth/me (which reads the httpOnly refresh cookie).
// Storing the access token in localStorage would expose it to any XSS attack.
export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  setAuth: (accessToken, user) => set({ accessToken, user }),
  clearAuth: () => set({ accessToken: null, user: null }),
}));
