import { create } from 'zustand';

type AuthUser = {
  id: string;
  email: string;
  displayName: string;
};

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  // True while the initial GET /auth/me is in-flight. Route guards must
  // wait for this to settle before deciding to redirect to /login.
  isRestoring: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  setRestoring: (value: boolean) => void;
};

// In-memory only — no localStorage persistence.
// The access token is intentionally ephemeral: it lives only in memory and is
// restored on page load via GET /auth/me (which reads the httpOnly refresh cookie).
// Storing the access token in localStorage would expose it to any XSS attack.
export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  isRestoring: true,
  setAuth: (accessToken, user) => set({ accessToken, user }),
  clearAuth: () => set({ accessToken: null, user: null, isRestoring: false }),
  setRestoring: (value) => set({ isRestoring: value }),
}));
