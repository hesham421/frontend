import { tokenStore } from '@/modules/security/features/auth/api/tokenStore';
import { ApiError, kindFromStatus } from '../errors/ApiError';
import { refreshOnce } from './refreshQueue';

const BASE = import.meta.env.VITE_API_URL ?? '';

// Matches the backend's real ApiResponse<T>/ApiError/FieldErrorItem shape (com.erp.common.web):
// error is a nested object, fieldErrors is an array of { field, message } — never flattened.
interface EnvelopeError {
  code?: string;
  details?: string;
  fieldErrors?: { field: string; message: string }[];
}
interface Envelope<T> {
  success?: boolean;
  message?: string;
  data: T;
  error?: EnvelopeError;
  correlationId?: string;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  signal?: AbortSignal;
  skipAuthRefresh?: boolean;
}

export async function apiClient<T>(path: string, options: RequestOptions = {}, isReplay = false): Promise<T> {
  const { body, headers, skipAuthRefresh, ...rest } = options;
  const token = tokenStore.get();

  if (token && tokenStore.expiresSoon() && !skipAuthRefresh) await refreshOnce();

  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(tokenStore.get() ? { Authorization: `Bearer ${tokenStore.get()}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
  });

  // 401 handling lives here and nowhere else (R.2.12, R.9.5)
  if (res.status === 401 && !skipAuthRefresh && !isReplay) {
    await refreshOnce();
    return apiClient<T>(path, options, true);
  }

  if (res.status === 204) return undefined as T;

  const payload = (await res.json().catch(() => ({}))) as Partial<Envelope<T>>;

  if (!res.ok) {
    const fieldErrors = payload.error?.fieldErrors?.length
      ? Object.fromEntries(payload.error.fieldErrors.map((fe) => [fe.field, fe.message]))
      : null;
    throw new ApiError(
      kindFromStatus(res.status),
      res.status,
      payload.error?.code ?? null,
      payload.correlationId ?? null,
      fieldErrors,
      payload.message ?? payload.error?.details ?? `HTTP ${res.status}`,
    );
  }

  return (payload.data ?? payload) as T;
}

export const http = {
  get: <T>(p: string, o?: RequestOptions) => apiClient<T>(p, { ...o, method: 'GET' }),
  post: <T>(p: string, body?: unknown, o?: RequestOptions) => apiClient<T>(p, { ...o, method: 'POST', body }),
  put: <T>(p: string, body?: unknown, o?: RequestOptions) => apiClient<T>(p, { ...o, method: 'PUT', body }),
  del: <T>(p: string, o?: RequestOptions) => apiClient<T>(p, { ...o, method: 'DELETE' }),
};
