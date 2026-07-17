import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../support/auth';
import { SecurityApiClient } from '../support/api-client';

/**
 * Group 5 — Permission Management (TC-PERM-001..009).
 *
 * No UI exists anywhere in the app for this — confirmed via
 * frontend/src/app/modules/security/security-routing.module.ts (no `/permissions`
 * route defined, unlike `/users`, `/pages-registry`, `/role-access`, `/user-profiles`).
 * Entirely API-level, via SecurityApiClient (admin session).
 *
 * PWTEST_ naming prefix used throughout: there is no delete endpoint for
 * Permissions (confirmed here in TC-PERM-009, and per doc §13) so created rows
 * accumulate — expected, not a bug. Flag for manual DB cleanup by prefix.
 */

function pwtestPermName(suffix: string): string {
  return `PWTEST_PERM_${suffix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

test.describe('TC-PERM — Permission Management (API-only, no UI)', () => {
  test('TC-PERM-001 — Create Permission standalone (no pageId)', async ({ page, request }) => {
    const session = await loginAsAdmin(page, request);
    const api = new SecurityApiClient(request, session);

    const name = pwtestPermName('STANDALONE');
    const res = await api.post('/api/permissions', { name });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    expect(body.data.name).toBe(name);
    // API omits pageId/pageCode entirely for a standalone permission rather than
    // sending explicit nulls (@JsonInclude(NON_NULL)-style behavior) — doc says
    // "pageId/pageCode null"; tolerant assertion for either shape.
    expect(body.data.pageId ?? null).toBeNull();
    expect(body.data.pageCode ?? null).toBeNull();
  });

  test('TC-PERM-002 — Create Permission scoped to a page', async ({ page, request }) => {
    const session = await loginAsAdmin(page, request);
    const api = new SecurityApiClient(request, session);

    // Fetch a real existing Page dynamically rather than hardcoding an id.
    const pagesRes = await api.get('/api/pages/active');
    expect(pagesRes.status()).toBe(200);
    const pagesBody = await pagesRes.json();
    const existingPage = pagesBody.data[0];
    expect(existingPage).toBeTruthy();

    const name = pwtestPermName('SCOPED');
    const res = await api.post('/api/permissions', { name, pageId: existingPage.id, permissionType: 'VIEW' });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    expect(body.data.pageCode).toBe(existingPage.pageCode);
    expect(body.data.pageId).toBe(existingPage.id);
    expect(body.data.permissionType).toBe('VIEW');
  });

  test('TC-PERM-003 — Update Permission happy path', async ({ page, request }) => {
    const session = await loginAsAdmin(page, request);
    const api = new SecurityApiClient(request, session);

    const createRes = await api.post('/api/permissions', { name: pwtestPermName('UPDATE_BASE') });
    expect(createRes.status()).toBe(201);
    const created = (await createRes.json()).data;

    const newName = pwtestPermName('UPDATE_RENAMED');
    const updateRes = await api.put(`/api/permissions/${created.id}`, { name: newName });
    expect(updateRes.status()).toBe(200);
    const updated = (await updateRes.json()).data;
    expect(updated.name).toBe(newName);
  });

  test('TC-PERM-004 — Update Permission not found', async ({ page, request }) => {
    const session = await loginAsAdmin(page, request);
    const api = new SecurityApiClient(request, session);

    const res = await api.put('/api/permissions/999999999', { name: pwtestPermName('NOTFOUND') });
    // Undocumented in the catalog (no explicit 404 row) — observed actual behavior: 404 PERMISSION_NOT_FOUND.
    console.log('TC-PERM-004 observed status:', res.status());
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('PERMISSION_NOT_FOUND');
  });

  test('TC-PERM-005 — Search Permissions filter by name', async ({ page, request }) => {
    const session = await loginAsAdmin(page, request);
    const api = new SecurityApiClient(request, session);

    const res = await api.post('/api/permissions/search', { filters: [{ field: 'name', operator: 'LIKE', value: 'USER' }] });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.number).toBeDefined(); // pagination field is `number`, not `page` (TC-XCUT-005)
    expect(body.data.content.length).toBeGreaterThan(0);
    expect(body.data.content.every((p: { name: string }) => p.name.includes('USER'))).toBe(true);
  });

  test('TC-PERM-006 — Search Permissions filter by module (CONTRACT/SERVER_ERROR finding)', async ({ page, request }) => {
    const session = await loginAsAdmin(page, request);
    const api = new SecurityApiClient(request, session);

    const res = await api.post('/api/permissions/search', { filters: [{ field: 'module', operator: 'EQ', value: 'SECURITY' }] });
    const body = await res.json();
    // FINDING (SERVER_ERROR / CONTRACT_BREAK, not fixed here per ownership boundary —
    // never modify app source, report the gap instead): the doc expects this to
    // return 200. Actual runtime always returns 500 DB_ERROR — `module` lives on the
    // Page entity, not on Permission, and the backend does not resolve it through the
    // pageId FK: "Could not resolve attribute 'module' of 'com.example.security.entity.Permission'".
    // Confirmed reproducible via direct curl during authoring. Asserting the DOCUMENTED
    // (expected) contract here so this fails loudly rather than silently encoding the bug.
    expect(res.status()).toBe(200);
    void body;
  });

  test('TC-PERM-007 — Create Permission omit required name (exploratory)', async ({ page, request }) => {
    const session = await loginAsAdmin(page, request);
    const api = new SecurityApiClient(request, session);

    const res = await api.post('/api/permissions', {});
    console.log('TC-PERM-007 observed status:', res.status());
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.fieldErrors?.[0]?.field).toBe('name');
  });

  test('TC-PERM-008 — Create Permission duplicate name (exploratory)', async ({ page, request }) => {
    const session = await loginAsAdmin(page, request);
    const api = new SecurityApiClient(request, session);

    const name = pwtestPermName('DUPLICATE');
    const first = await api.post('/api/permissions', { name });
    expect(first.status()).toBe(201);

    const second = await api.post('/api/permissions', { name });
    console.log('TC-PERM-008 observed status:', second.status());
    expect(second.status()).toBe(409);
    const body = await second.json();
    expect(body.error.code).toBe('PERMISSION_ALREADY_EXISTS');
  });

  test('TC-PERM-009 — No delete/deactivate endpoint exists (documentation check)', async ({ page, request }) => {
    const session = await loginAsAdmin(page, request);
    const api = new SecurityApiClient(request, session);

    const createRes = await api.post('/api/permissions', { name: pwtestPermName('NODELETE') });
    expect(createRes.status()).toBe(201);
    const created = (await createRes.json()).data;

    const deleteRes = await api.delete(`/api/permissions/${created.id}`);
    // Confirmed absent: DELETE isn't routed at all, framework returns 405 (not 404),
    // i.e. no handler for the verb exists on this path — matches doc §13's note that
    // created test permissions cannot be cleaned up via API. This row (and every
    // PWTEST_PERM_* row created by this spec file) needs manual DB cleanup.
    expect(deleteRes.status()).toBe(405);
    const body = await deleteRes.json();
    expect(body.error.code).toBe('METHOD_NOT_ALLOWED');
  });
});
