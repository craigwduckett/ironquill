const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

// Auth endpoints that use the httpOnly refresh cookie need credentials: 'include'
// so the browser sends/receives the cookie. All other endpoints use the default
// ('same-origin') — we don't want to send the cookie to non-auth routes.
const AUTH_PATHS = ['/auth/me', '/auth/refresh', '/auth/logout', '/auth/login', '/auth/register'];

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

async function request<T>(path: string, options: RequestInit, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    // Only include cookies for auth routes that need the httpOnly refresh cookie.
    // Sending credentials broadly would attach the cookie to every API call.
    credentials: AUTH_PATHS.includes(path) ? 'include' : 'same-origin',
  });
  if (!res.ok) {
    const body = (await res
      .json()
      .catch(() => ({ message: 'Unknown error', error: 'UNKNOWN' }))) as {
      message?: string;
      error?: string;
    };
    throw new ApiError(body.message ?? 'Request failed', res.status, body.error ?? 'UNKNOWN');
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, token?: string) => request<T>(path, { method: 'GET' }, token),

  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }, token),

  patch: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, token),

  delete: <T>(path: string, token?: string) => request<T>(path, { method: 'DELETE' }, token),
};
