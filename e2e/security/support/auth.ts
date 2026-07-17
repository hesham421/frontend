import { APIRequestContext, Page } from '@playwright/test';

/**
 * Shared auth helpers for the SECURITY module E2E suite.
 *
 * TokenStoreService hydrates its in-memory access/refresh token from
 * localStorage on app bootstrap (then immediately clears those keys) —
 * see frontend/src/app/core/services/token-store.service.ts. Seeding
 * localStorage before the first navigation is therefore sufficient to
 * land on an authenticated page without driving the real login form,
 * and keeps every spec independently runnable (no shared storageState file).
 */

export const SECURITY_API_URL = process.env['SECURITY_API_URL'] || 'http://localhost:7272';

export interface SecuritySession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: number;
  username: string;
  enabled: boolean;
  roles: string[];
  permissions: string[];
}

export async function loginViaApi(
  request: APIRequestContext,
  username: string,
  password: string
): Promise<SecuritySession> {
  const res = await request.post(`${SECURITY_API_URL}/api/auth/login-token`, {
    data: { username, password }
  });
  if (!res.ok()) {
    throw new Error(`loginViaApi(${username}) failed: ${res.status()} ${await res.text()}`);
  }
  const body = await res.json();
  const data = body.data ?? body;
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn ?? 900,
    userId: data.userId,
    username: data.username ?? username,
    enabled: data.enabled ?? true,
    roles: data.roles ?? [],
    permissions: data.permissions ?? []
  };
}

export async function fetchAdminSession(request: APIRequestContext): Promise<SecuritySession> {
  return loginViaApi(request, 'admin', 'admin');
}

/**
 * Seed localStorage BEFORE navigation so TokenStoreService hydrates on bootstrap.
 *
 * Also forces English (`erp_language`) — LanguageService (frontend/src/app/core/services/
 * language.service.ts) defaults to ARABIC (`DEFAULT_LANGUAGE = 'ar'`) and reads its
 * persisted preference from this same localStorage key on bootstrap. Every selector in
 * this suite that matches on visible text/title/aria-label (getByRole name, getByTitle,
 * translated button text) assumes English strings from en.json — without this, the app
 * renders Arabic and every one of those selectors times out (confirmed: the top-bar
 * "Logout" link renders as "تسجيل الخروج" by default). Seed this in every test, not just
 * once, since each test gets a fresh page/context.
 */
export async function seedSession(page: Page, session: SecuritySession): Promise<void> {
  await page.addInitScript((s) => {
    localStorage.setItem('erp_language', 'en');
    localStorage.setItem('accessToken', s.accessToken);
    localStorage.setItem('refreshToken', s.refreshToken);
    localStorage.setItem('tokenExpiration', String(Date.now() + s.expiresIn * 1000));
    localStorage.setItem(
      'currentUser',
      JSON.stringify({
        id: s.userId,
        username: s.username,
        enabled: s.enabled,
        roles: s.roles,
        permissions: s.permissions
      })
    );
  }, session);
}

/** Force English without an auth session — use for the Login screen itself. */
export async function forceEnglishLocale(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('erp_language', 'en');
  });
}

/** Convenience: log in as admin via API and seed the page, in one call. */
export async function loginAsAdmin(page: Page, request: APIRequestContext): Promise<SecuritySession> {
  const session = await fetchAdminSession(request);
  await seedSession(page, session);
  return session;
}

export function authHeaders(session: SecuritySession): Record<string, string> {
  return { Authorization: `Bearer ${session.accessToken}` };
}
