import { getIdToken, isExpired } from '@/stores/useAuthStore';
import { refreshTokenOnce } from '@/apis/refreshToken';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  throw new Error('EXPO_PUBLIC_API_BASE_URL is missing from frontend/.env');
}
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!response.ok) {
    let message = `Something went wrong (${response.status}).`;
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed?.message === 'string' && parsed.message.length > 0) {
        message = parsed.message;
      }
    } catch {
      // Non-JSON error body (e.g. an API Gateway HTML page) — keep the default.
    }
    throw new ApiError(response.status, message);
  }

  return (text.length > 0 ? JSON.parse(text) : undefined) as T;
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  isRetry = false,
): Promise<T> {
  let token = getIdToken();

  if (token && isExpired(token) && !isRetry) {
    token = await refreshTokenOnce();
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: token } : {}),
      ...init?.headers,
    },
  });

  if (response.status === 401 && !isRetry) {
    const fresh = await refreshTokenOnce();
    if (fresh) return apiFetch<T>(path, init, true);

    throw new ApiError(401, 'Your session expired. Please sign in again.');
  }

  return parseResponse<T>(response);
}

export default apiFetch;
