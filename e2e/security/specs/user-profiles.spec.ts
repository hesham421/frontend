import { test, expect } from '@playwright/test';
import { UserProfilePage } from '../pages/UserProfilePage';
import { loginAsAdmin, fetchAdminSession } from '../support/auth';
import { SecurityApiClient } from '../support/api-client';

/**
 * Group 9 — Security DataScope User Profiles (§9, TC-UP-001..016).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * FORMER ENVIRONMENT GAP, NOW RESOLVED: `PERM_USER_PROFILE_VIEW/_CREATE/_UPDATE`
 * (`003_sec_pages_permissions_seed.sql` BLOCK 2+3) were missing from `permissions`
 * for a while, 403-blocking every account including SUPER_ADMIN. Those grants
 * have since been applied (confirmed live via `mcp__postgres__query`:
 * `permissions` has all 3 rows, granted to SUPER_ADMIN in `role_permissions`) —
 * admin can now pass every `@PreAuthorize` check in this group and reach the
 * real `/security/user-profiles` screen. See "GAP CONFIRMATION" below, which
 * now asserts the resolved (unblocked) state instead of the old 403s.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * TC-UP-001..014/016 each still open with a `test.skip()` guarded by a live
 * probe of the actual current state (`probeBlocked`), so this file self-heals
 * either direction if the grant is ever reverted — no need to hardcode
 * "unblocked" everywhere. TC-UP-015 (no DELETE endpoint) is unaffected either
 * way, since a 405 for an unmapped HTTP method is decided by Spring's
 * DispatcherServlet before the `@PreAuthorize`-guarded service method is ever
 * invoked.
 *
 * Needs an existing active Branch: `org_branch` has exactly one seeded row,
 * `branch_pk=1` (`DEFAULT_BR`, `is_active_fl=1`) — confirmed via SELECT.
 */

const ACTIVE_BRANCH_ID = 1;
const BASE = '/api/v1/security/user-profiles';
const uniq = () => `${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

async function probeBlocked(api: SecurityApiClient): Promise<boolean> {
  const res = await api.post(`${BASE}/search`, { filters: [], sorts: [] });
  return res.status() === 403;
}

async function createThrowawayUser(api: SecurityApiClient): Promise<number> {
  const username = `pwtest_up_${uniq()}`;
  const res = await api.post('/api/users', { username, password: 'Passw0rd1' });
  return (await res.json()).data.id;
}

test.describe('TC-UP — Security DataScope User Profiles', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginAsAdmin(page, request);
  });

  test('GAP CONFIRMATION — admin/SUPER_ADMIN unblocked now that PERM_USER_PROFILE_* is granted', async ({
    page,
    request
  }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);

    const searchRes = await api.post(`${BASE}/search`, { filters: [], sorts: [] });
    expect(searchRes.status()).toBe(200);

    const createRes = await api.post(BASE, { userIdFk: 999999999, branchIdFk: ACTIVE_BRANCH_ID });
    // Not a permission 403 anymore — falls through to the (still real) business
    // validation for a nonexistent userIdFk.
    expect(createRes.status()).not.toBe(403);

    const profiles = new UserProfilePage(page);
    await profiles.gotoList();
    await expect(page).not.toHaveURL(/access-denied/);
  });

  test('TC-UP-015 — No DELETE endpoint exists (unaffected by the permission gap — 405 before auth is even checked)', async ({
    request
  }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const res = await api.delete(`${BASE}/1`);
    // SecUserProfileController has no @DeleteMapping at all — Spring's
    // DispatcherServlet 405s on the unmapped method before any
    // @PreAuthorize-guarded service method runs, so this is NOT gated by the
    // PERM_USER_PROFILE_* gap above.
    expect(res.status()).toBe(405);
  });

  test('TC-UP-001/002 — Create User Profile happy path + already-exists conflict (UI)', async ({ page, request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    test.skip(await probeBlocked(api), 'DB_PRECONDITION: PERM_USER_PROFILE_CREATE not seeded — see file header.');

    const userId = await createThrowawayUser(api);
    const profiles = new UserProfilePage(page);
    await profiles.gotoCreate();
    await profiles.fillForm({ userIdFk: userId, branchIdFk: ACTIVE_BRANCH_ID, fullNameEn: 'PWTEST Profile' });
    const createRes = page.waitForResponse((r) => r.url().endsWith(BASE) && r.request().method() === 'POST');
    await profiles.save();
    const res = await createRes;
    expect(res.status()).toBeLessThan(300);
    const body = await res.json();
    expect(body.data.isActiveFl).toBe(true);

    // TC-UP-002: create again for the same userIdFk.
    await profiles.gotoCreate();
    await profiles.fillForm({ userIdFk: userId, branchIdFk: ACTIVE_BRANCH_ID });
    const dupRes = page.waitForResponse((r) => r.url().endsWith(BASE) && r.request().method() === 'POST');
    await profiles.save();
    const dup = await dupRes;
    expect(dup.status()).toBe(409);
    const dupBody = await dup.json();
    expect(dupBody.error?.code).toBe('SEC_USER_PROFILE_ALREADY_EXISTS');
  });

  test('TC-UP-003 — Create User Profile — userIdFk does not exist', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    test.skip(await probeBlocked(api), 'DB_PRECONDITION: PERM_USER_PROFILE_CREATE not seeded — see file header.');

    const res = await api.post(BASE, { userIdFk: 999999999, branchIdFk: ACTIVE_BRANCH_ID });
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error?.code).toBe('USER_NOT_FOUND');
  });

  test('TC-UP-004 — Create User Profile — branchIdFk inactive/nonexistent', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    test.skip(await probeBlocked(api), 'DB_PRECONDITION: PERM_USER_PROFILE_CREATE not seeded — see file header.');

    const userId = await createThrowawayUser(api);
    const res = await api.post(BASE, { userIdFk: userId, branchIdFk: 999999999 });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error?.code).toBe('SEC_USER_PROFILE_BRANCH_INACTIVE');
  });

  test('TC-UP-005/006 — Get User Profile by ID: happy path + not found', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    test.skip(await probeBlocked(api), 'DB_PRECONDITION: PERM_USER_PROFILE_VIEW not seeded — see file header.');

    const userId = await createThrowawayUser(api);
    await api.post(BASE, { userIdFk: userId, branchIdFk: ACTIVE_BRANCH_ID });

    const okRes = await api.get(`${BASE}/${userId}`);
    expect(okRes.status()).toBe(200);

    const noProfileUserId = await createThrowawayUser(api);
    const notFoundRes = await api.get(`${BASE}/${noProfileUserId}`);
    expect(notFoundRes.status()).toBe(404);
    const notFoundBody = await notFoundRes.json();
    expect(notFoundBody.error?.code).toBe('SEC_USER_PROFILE_NOT_FOUND');
  });

  test('TC-UP-007/008 — Update User Profile: happy path + branch re-validated (UI)', async ({ page, request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    test.skip(await probeBlocked(api), 'DB_PRECONDITION: PERM_USER_PROFILE_UPDATE not seeded — see file header.');

    const userId = await createThrowawayUser(api);
    await api.post(BASE, { userIdFk: userId, branchIdFk: ACTIVE_BRANCH_ID });

    const profiles = new UserProfilePage(page);
    await profiles.gotoEdit(userId);
    await profiles.fillForm({ fullNameEn: 'PWTEST Updated Name' });
    const updateRes = page.waitForResponse((r) => r.url().includes(`${BASE}/${userId}`) && r.request().method() === 'PUT');
    await profiles.save();
    const res = await updateRes;
    expect(res.status()).toBe(200);
    expect((await res.json()).data.fullNameEn).toBe('PWTEST Updated Name');

    const badBranchRes = await api.put(`${BASE}/${userId}`, { branchIdFk: 999999999 });
    expect(badBranchRes.status()).toBe(400);
    expect((await badBranchRes.json()).error?.code).toBe('SEC_USER_PROFILE_BRANCH_INACTIVE');
  });

  test('TC-UP-009/010 — List (default sort by userIdFk) + Search by branchIdFk', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    test.skip(await probeBlocked(api), 'DB_PRECONDITION: PERM_USER_PROFILE_VIEW not seeded — see file header.');

    const userId = await createThrowawayUser(api);
    await api.post(BASE, { userIdFk: userId, branchIdFk: ACTIVE_BRANCH_ID });

    const listRes = await api.get(BASE, { page: 0, size: 20 });
    expect(listRes.status()).toBe(200);
    const listBody = await listRes.json();
    const ids = listBody.data.content.map((p: { userIdFk: number }) => p.userIdFk);
    expect([...ids]).toEqual([...ids].sort((a, b) => a - b));

    const searchRes = await api.post(`${BASE}/search`, {
      filters: [{ field: 'branchIdFk', operator: 'EQUALS', value: ACTIVE_BRANCH_ID }]
    });
    expect(searchRes.status()).toBe(200);
    const searchBody = await searchRes.json();
    expect(searchBody.data.content.some((p: { userIdFk: number }) => p.userIdFk === userId)).toBe(true);
  });

  test('TC-UP-011/012/013 — Boundary: fullNameAr/fullNameEn/preferredLang over maxLength', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    test.skip(await probeBlocked(api), 'DB_PRECONDITION: PERM_USER_PROFILE_CREATE not seeded — see file header.');

    const over200Ar = await api.post(BASE, {
      userIdFk: await createThrowawayUser(api),
      branchIdFk: ACTIVE_BRANCH_ID,
      fullNameAr: 'ا'.repeat(201)
    });
    expect(over200Ar.status()).toBe(400);

    const over100En = await api.post(BASE, {
      userIdFk: await createThrowawayUser(api),
      branchIdFk: ACTIVE_BRANCH_ID,
      fullNameEn: 'x'.repeat(101)
    });
    expect(over100En.status()).toBe(400);

    const over10Lang = await api.post(BASE, {
      userIdFk: await createThrowawayUser(api),
      branchIdFk: ACTIVE_BRANCH_ID,
      preferredLang: 'x'.repeat(11)
    });
    console.log('TC-UP-013 observed status:', over10Lang.status());
    expect(over10Lang.status()).toBe(400);
  });

  test('TC-UP-014 — employeeIdFk fully unconstrained (exploratory)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    test.skip(await probeBlocked(api), 'DB_PRECONDITION: PERM_USER_PROFILE_CREATE not seeded — see file header.');

    const userId = await createThrowawayUser(api);
    const res = await api.post(BASE, { userIdFk: userId, branchIdFk: ACTIVE_BRANCH_ID, employeeIdFk: 999999999 });
    console.log('TC-UP-014 observed status:', res.status());
    expect(res.status()).toBeLessThan(300);
  });

  test('TC-UP-016 — Create User Profile omitting required branchIdFk (exploratory)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    test.skip(await probeBlocked(api), 'DB_PRECONDITION: PERM_USER_PROFILE_CREATE not seeded — see file header.');

    const userId = await createThrowawayUser(api);
    const res = await api.post(BASE, { userIdFk: userId });
    console.log('TC-UP-016 observed status:', res.status());
    expect(res.status()).toBe(400);
  });
});
