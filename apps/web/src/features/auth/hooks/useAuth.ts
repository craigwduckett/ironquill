import type { LoginInput, RegisterInput } from '@ironquill/shared';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '../../../lib/api.js';
import { useAuthStore } from '../../../stores/auth.js';

type AuthUser = { id: string; email: string; displayName: string };

type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

// Access tokens last 15 minutes. Refresh 1 minute before expiry.
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
const REFRESH_BEFORE_EXPIRY_MS = 60 * 1000;
const SILENT_REFRESH_INTERVAL_MS = ACCESS_TOKEN_TTL_MS - REFRESH_BEFORE_EXPIRY_MS;

// ── Session restore ───────────────────────────────────────────────────────────
// Called once on app mount. Hits GET /auth/me which reads the httpOnly refresh
// cookie. If valid, returns a fresh access token and user — restoring the
// in-memory session transparently. No localStorage required.
//
// Also schedules a silent token refresh every 14 minutes so the in-memory
// access token never expires mid-session.

export function useRestoreSession() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setRestoring = useAuthStore((s) => s.setRestoring);

  const query = useQuery<AuthResponse | null>({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      try {
        const data = await api.get<AuthResponse>('/auth/me');
        setAuth(data.accessToken, data.user);

        // #region agent log
        fetch('http://127.0.0.1:7466/ingest/1480f3c7-9e6a-44cf-9fa6-0cd75c14539e', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '6e1f58',
          },
          body: JSON.stringify({
            sessionId: '6e1f58',
            location: 'useAuth.ts:queryFn',
            message: '/auth/me SUCCESS',
            data: { hasToken: !!data.accessToken, user: data.user?.email },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion

        return data;
      } catch (err) {
        // #region agent log
        fetch('http://127.0.0.1:7466/ingest/1480f3c7-9e6a-44cf-9fa6-0cd75c14539e', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '6e1f58',
          },
          body: JSON.stringify({
            sessionId: '6e1f58',
            location: 'useAuth.ts:queryFn',
            message: '/auth/me FAILED',
            data: { error: String(err) },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion

        return null;
      } finally {
        setRestoring(false);
      }
    },
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  });

  // Proactively refresh the access token 1 minute before it expires.
  // Only runs while the user has an active session.
  const isAuthenticated = Boolean(query.data?.accessToken);
  useEffect(() => {
    if (!isAuthenticated) return;

    const id = setInterval(() => {
      void api
        .post<AuthResponse>('/auth/refresh', {})
        .then((res) => setAuth(res.accessToken, res.user))
        .catch(() => {
          // Refresh failed (cookie expired / revoked) — clear auth so
          // protected routes redirect to /login on next navigation.
          useAuthStore.getState().clearAuth();
        });
    }, SILENT_REFRESH_INTERVAL_MS);

    return () => clearInterval(id);
  }, [isAuthenticated, setAuth]);

  return query;
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
