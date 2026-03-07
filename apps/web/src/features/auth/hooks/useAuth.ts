import type { LoginInput, RegisterInput } from '@ironquill/shared';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api.js';
import { useAuthStore } from '../../../stores/auth.js';

type AuthUser = { id: string; email: string; displayName: string };

type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

// ── Session restore ───────────────────────────────────────────────────────────
// Called once on app mount. Hits GET /auth/me which reads the httpOnly refresh
// cookie. If valid, returns a fresh access token and user — restoring the
// in-memory session transparently. No localStorage required.

export function useRestoreSession() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useQuery<AuthResponse | null>({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      try {
        return await api.get<AuthResponse>('/auth/me');
      } catch {
        return null;
      }
    },
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
    select: (data) => {
      if (data) setAuth(data.accessToken, data.user);
      return data;
    },
  });
}

// ── Login ─────────────────────────────────────────────────────────────────────

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<AuthResponse, Error, LoginInput>({
    mutationFn: (data) => api.post<AuthResponse>('/auth/login', data),
    onSuccess: (res) => setAuth(res.accessToken, res.user),
  });
}

// ── Register ──────────────────────────────────────────────────────────────────

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<AuthResponse, Error, RegisterInput>({
    mutationFn: (data) => api.post<AuthResponse>('/auth/register', data),
    onSuccess: (res) => setAuth(res.accessToken, res.user),
  });
}

// ── Logout ────────────────────────────────────────────────────────────────────

export function useLogout() {
  const { clearAuth, accessToken } = useAuthStore();

  return useMutation<void, Error, void>({
    mutationFn: () => api.post<void>('/auth/logout', {}, accessToken ?? undefined),
    onSettled: () => clearAuth(),
  });
}

// ── Token refresh (silent) ────────────────────────────────────────────────────
// Called proactively before the 15-min access token expires.
// Reads the httpOnly refresh cookie server-side — nothing stored in the browser.

export function useRefreshToken() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<AuthResponse, Error, void>({
    mutationFn: () => api.post<AuthResponse>('/auth/refresh', {}),
    onSuccess: (res) => setAuth(res.accessToken, res.user),
  });
}
