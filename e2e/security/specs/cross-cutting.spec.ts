import { test, expect } from '@playwright/test';
import { fetchAdminSession, loginViaApi, SECURITY_API_URL } from '../support/auth';
import { SecurityApiClient } from '../support/api-client';

/**
 * Group 12 — Non-Functional / Cross-Cutting Cases (§12, TC-XCUT-001..006).
 *
 * TC-XCUT-001/002/004 are parametrized across a REPRESENTATIVE SAMPLE of the
 * 49-endpoint catalog — one GET, one POST, one PUT, one DELETE per major
 * group (Pages, Permissions, Roles, Users, User Profiles, Role-Branches),
 * not all 49. Endpoints and their exact required-permission gating were
 * confirmed by reading governance-repo/modules/SECURITY/api-docs/endpoints/**
 * (createPage.md, addPageToRole.md, etc.) rather than assumed.
 */

const uniq = () => Date.now().toString(36).toUpperCase().slice(-8);

interface SampleEndpoint {
  group: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
}

// One GET/POST/PUT/DELETE per major group — deliberately not exhaustive (49 endpoints total).
const SAMPLE_ENDPOINTS: SampleEndpoint[] = [
  { group: 'pages', method: 'GET', path: '/api/pages/active' },
  { group: 'pages', method: 'POST', path: '/api/pages/search', body: { filters: [], sorts: [] } },
  { group: 'permissions', method: 'POST', path: '/api/permissions/search', body: { filters: [], sorts: [] } },
  { group: 'roles', method: 'GET', path: '/api/roles/1' },
  { group: 'roles', method: 'POST', path: '/api/roles/search', body: { filters: [], sorts: [] } },
  { group: 'roles', method: 'PUT', path: '/api/roles/1/toggle-active', body: { active: true } },
  { group: 'roles', method: 'DELETE', path: '/api/roles/999999999' },
  { group: 'users', method: 'GET', path: '/api/users/1' },
  { group: 'users', method: 'PUT', path: '/api/users/1/roles', body: { roleNames: [] } },
  { group: 'user-profiles', method: 'GET', path: '/api/v1/security/user-profiles/1' },
  { group: 'user-profiles', method: 'POST', path: '/api/v1/security/user-profiles/search', body: { filters: [], page: 0, size: 10 } },
  { group: 'role-branches', method: 'GET', path: '/api/v1/security/role-branches/1/1' },
  { group: 'role-branches', method: 'DELETE', path: '/api/v1/security/role-branches/999999999/999999999' }
];

test.describe('TC-XCUT-001/002 — Missing / expired token rejected (representative sample)', () => {
  for (const ep of SAMPLE_ENDPOINTS) {
    test(`TC-XCUT-001 — ${ep.method} ${ep.path} (${ep.group}) rejects MISSING token -> 401`, async ({ request }) => {
      const res = await request.fetch(`${SECURITY_API_URL}${ep.path}`, {
        method: ep.method,
        data: ep.body,
        headers: { 'Content-Type': 'application/json' }
      });
      expect(res.status()).toBe(401);
    });

    test(`TC-XCUT-002 — ${ep.method} ${ep.path} (${ep.group}) rejects EXPIRED/malformed token -> 401`, async ({ request }) => {
      // A syntactically-plausible but unsigned/garbage JWT stands in for "expired" —
      // the backend can't distinguish "expired" from "invalid signature" at the
      // filter layer any differently for this black-box check; both take the same
      // 401 path (JwtAuthenticationFilter rejects before reaching the controller).
      const fakeExpiredToken =
        'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTAwMDAwMDAwMH0.invalidsignature000000000000000000000000';
      const res = await request.fetch(`${SECURITY_API_URL}${ep.path}`, {
        method: ep.method,
        data: ep.body,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${fakeExpiredToken}` }
      });
      expect(res.status()).toBe(401);
    });
  }
});

test.describe('TC-XCUT-003 — Permission-gated endpoints reject insufficient permission (403)', () => {
  // Excludes DataScope endpoints (deliberately ungated per §9/§10 notes) and /api/auth/**.
  // PAGE_CREATE is the clearest documented example (createPage.md: "Required
  // permission(s): PAGE_CREATE") — build a role with only PAGE_VIEW (never
  // PAGE_CREATE) and confirm the gated call is refused.

  test('narrow-permission user (PERM_PAGE_VIEW only) gets 403 on PAGE_CREATE-gated POST /api/pages', async ({ request }) => {
    const adminSession = await fetchAdminSession(request);
    const admin = new SecurityApiClient(request, adminSession);

    const roleCode = `PWTESTXCUT${uniq()}`;
    const roleName = `PWTEST XCUT Narrow ${uniq()}`;
    const roleRes = await admin.post('/api/roles', { roleCode, roleName });
    expect(roleRes.status()).toBeLessThan(300);
    const roleId = (await roleRes.json()).data.id;

    // Grant VIEW-only on the built-in "PAGE" page (Page Management's own bootstrap
    // page, confirmed via Postgres: `permissions.name = 'PERM_PAGE_VIEW'` /
    // `'PERM_PAGE_CREATE'` both point at `sec_pages.page_code = 'PAGE'`). This is
    // what actually grants/withholds PERM_PAGE_VIEW / PERM_PAGE_CREATE — granting a
    // throwaway PWTEST-prefixed page here would only ever produce
    // PERM_<THAT_CODE>_VIEW, not PERM_PAGE_VIEW, and would make the "narrow role"
    // fail even the sanity GET below for the wrong reason.
    const addPageRes = await admin.post(`/api/roles/${roleId}/pages`, { pageCode: 'PAGE', permissions: [] }); // VIEW-only, always implicit
    expect(addPageRes.status()).toBeLessThan(300);

    const username = `pwtest_xcut_${uniq()}`.toLowerCase();
    const userRes = await admin.post('/api/users', { username, password: 'Passw0rd1' });
    const userId = (await userRes.json()).data.id;
    // CONFIRMED APP BUG: PUT /api/users/{id}/roles's `roleNames` field is misleadingly
    // named — despite the field name and the doc's own code-like example
    // (`["TESTROLE_X"]`), it actually resolves entries against the role's roleNAME
    // (display name), not its roleCode. Passing `roleCode` here gives
    // `{"error":{"code":"ROLE_NOT_FOUND","details":"Role not found in current
    // tenant: <code>"}}`, confirmed via curl. Using `roleName` below.
    await admin.put(`/api/users/${userId}/roles`, { roleNames: [roleName] });

    const narrowSession = await loginViaApi(request, username, 'Passw0rd1');
    const narrowApi = new SecurityApiClient(request, narrowSession);

    // Sanity: the narrow user CAN read pages (has VIEW), confirming the token/role
    // wiring works and the eventual 403 below is a real permission-gate hit, not
    // an unrelated auth failure.
    const viewRes = await narrowApi.get('/api/pages/active');
    expect(viewRes.status()).toBe(200);

    // The actual TC-XCUT-003 assertion: PAGE_CREATE-gated call -> 403.
    const forbiddenRes = await narrowApi.post('/api/pages', {
      pageCode: `PWTEST_XCUT_SHOULD_FAIL_${uniq()}`,
      nameEn: 'Should Not Be Created',
      nameAr: 'ا',
      route: '/pwtest/should-not-exist'
    });
    expect(forbiddenRes.status()).toBe(403);
  });
});

test.describe('TC-XCUT-004 — Malformed JSON rejected on @RequestBody endpoints (representative sample)', () => {
  const bodyEndpoints = SAMPLE_ENDPOINTS.filter((e) => e.method === 'POST' || e.method === 'PUT');

  for (const ep of bodyEndpoints) {
    test(`TC-XCUT-004 — ${ep.method} ${ep.path} (${ep.group}) rejects malformed JSON -> 400`, async ({ request }) => {
      const session = await fetchAdminSession(request);
      const res = await request.fetch(`${SECURITY_API_URL}${ep.path}`, {
        method: ep.method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
        data: '{ this is not valid json'
      });
      expect(res.status()).toBe(400);
      const body = await res.json().catch(() => null);
      if (body?.error?.code) expect(body.error.code).toBe('INVALID_JSON');
    });
  }
});

test.describe('TC-XCUT-005/006 — Envelope shape + pagination field name', () => {
  test('TC-XCUT-005 — paginated search response uses `number`, not `page`', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const res = await api.post('/api/pages/search', { filters: [], sorts: [], page: 0, size: 10 });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.data.number).toBe('number');
    expect(body.data.page).toBeUndefined();
    // Full paginated-envelope shape per doc §0.
    for (const field of ['content', 'totalElements', 'totalPages', 'size', 'number', 'numberOfElements', 'first', 'last', 'empty']) {
      expect(body.data).toHaveProperty(field);
    }
  });

  test('TC-XCUT-006 — top-level envelope shape is consistent on success AND error responses', async ({ request }) => {
    // CONTRACT_BREAK vs the doc's §0 claim of one fixed shape
    // `{success, message, data, error, timestamp}` on every response: the real
    // envelope is CONDITIONAL, not uniform — confirmed via curl on both a success
    // and a 404 call against the same endpoint:
    //   success: {correlationId, data,        message, success, timestamp}  (no `error` key at all)
    //   error:   {correlationId, error,       message, success, timestamp}  (no `data` key at all)
    // Both also carry an undocumented `correlationId` field the doc's §0 envelope
    // description never mentions. Asserting the REAL, confirmed contract below
    // (same convention as auth.spec.ts's TC-AUTH-001 refresh-token-cookie note) —
    // "consistent" holds for the fields common to both shapes, not literally all 5.
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);

    const successRes = await api.get('/api/pages/active');
    expect(successRes.status()).toBe(200);
    const successBody = await successRes.json();
    for (const field of ['success', 'message', 'data', 'timestamp', 'correlationId']) {
      expect(successBody).toHaveProperty(field);
    }
    expect(successBody).not.toHaveProperty('error');
    expect(successBody.success).toBe(true);

    const errorRes = await api.get('/api/pages/999999999');
    expect(errorRes.status()).toBe(404);
    const errorBody = await errorRes.json();
    for (const field of ['success', 'message', 'error', 'timestamp', 'correlationId']) {
      expect(errorBody).toHaveProperty(field);
    }
    expect(errorBody).not.toHaveProperty('data');
    expect(errorBody.success).toBe(false);
  });
});
