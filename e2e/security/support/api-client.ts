import { APIRequestContext } from '@playwright/test';
import { SecuritySession, authHeaders } from './auth';

/**
 * Thin wrapper for the API-level (no dedicated UI) portions of the SECURITY
 * suite: Permission Management, DataScope Role Branches, cross-cutting
 * checks, and any step inside a POM-driven flow that has no screen at all.
 */
export class SecurityApiClient {
  constructor(
    private request: APIRequestContext,
    private session: SecuritySession,
    private baseUrl = process.env['SECURITY_API_URL'] || 'http://localhost:7272'
  ) {}

  private headers(extra?: Record<string, string>) {
    return { ...authHeaders(this.session), ...extra };
  }

  get(path: string, params?: Record<string, string | number | boolean>) {
    return this.request.get(`${this.baseUrl}${path}`, { headers: this.headers(), params });
  }

  post(path: string, data?: unknown) {
    return this.request.post(`${this.baseUrl}${path}`, { headers: this.headers(), data });
  }

  put(path: string, data?: unknown) {
    return this.request.put(`${this.baseUrl}${path}`, { headers: this.headers(), data });
  }

  delete(path: string) {
    return this.request.delete(`${this.baseUrl}${path}`, { headers: this.headers() });
  }

  /** Call with no Authorization header — for 401 assertions. */
  unauthenticated() {
    return {
      get: (path: string) => this.request.get(`${this.baseUrl}${path}`),
      post: (path: string, data?: unknown) => this.request.post(`${this.baseUrl}${path}`, { data }),
      put: (path: string, data?: unknown) => this.request.put(`${this.baseUrl}${path}`, { data }),
      delete: (path: string) => this.request.delete(`${this.baseUrl}${path}`)
    };
  }
}
