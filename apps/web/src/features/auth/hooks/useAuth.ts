import type { LoginInput, RegisterInput } from '@ironquill/shared';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api.js';
import { useAuthStore } from '../../../stores/auth.js';

type AuthResponse = {
  accessToken: string;
  user: { id: string; email: string; displayName: string };
};

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<AuthResponse, Error, LoginInput>({
    mutationFn: (data) => api.post<AuthResponse>('/auth/login', data),
    onSuccess: (res) => setAuth(res.accessToken, res.user),
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<AuthResponse, Error, RegisterInput>({
    mutationFn: (data) => api.post<AuthResponse>('/auth/register', data),
    onSuccess: (res) => setAuth(res.accessToken, res.user),
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation<void, Error, void>({
    mutationFn: () => api.post<void>('/auth/logout', {}),
    onSettled: () => clearAuth(),
  });
}
