const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

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

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
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
  // cache: 'no-store' bypasses the browser HTTP cache — TanStack Query manages its own cache.
  get: <T>(path: string, token?: string) =>
    request<T>(path, { method: 'GET', cache: 'no-store' }, token),

  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }, token),

  patch: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, token),

  delete: <T>(path: string, token?: string) => request<T>(path, { method: 'DELETE' }, token),
};
