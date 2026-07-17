import { test, expect } from '@playwright/test';
import { loginAsAdmin, fetchAdminSession, loginViaApi, seedSession, SECURITY_API_URL } from '../support/auth';
import { SecurityApiClient } from '../support/api-client';

/**
 * Group 8 — Menu Management (§8, TC-MENU-001..006), hybrid per the brief.
 *
 * TC-MENU-001/002/006 are driven through the real left sidebar
 * (`app-nav-content` → `app-nav-item`/`app-nav-collapse`, fed by
 * `MenuService.getUserMenu()` → GET /api/menu/user-menu). A page's nav-link
 * text is its literal `SEC_PAGES.NAME_EN` (piped through `| translate`, which
 * is a no-op passthrough for a plain English string, not a real i18n key —
 * confirmed by reading nav-item.component.html / menu.service.ts). Pages with
 * children render as `app-nav-collapse` instead of a plain link (only
 * possible for freshly created PWTEST pages, since every pre-existing
 * SEC_PAGES row has PARENT_ID_FK NULL per prior investigation — no real
 * parent/child hierarchy exists in seed data).
 *
 * TC-MENU-003/004/005 (admin viewing another user's menu by ID) have no
 * screen at all (MenuController only exposes this at `/api/menu/user-menu/{userId}`,
 * never surfaced in any component) — API-level via SecurityApiClient.
 *
 * A throwaway user + throwaway role is created per-test (not depending on
 * users.spec.ts). Roles are attached via the general `PUT /api/users/{id}`
 * update endpoint (`roleNames`, needs only USER_UPDATE, which admin holds) —
 * see users.spec.ts's file header for why the dedicated `/roles` endpoint
 * isn't used here (nothing wrong with it, just simpler to reuse one path).
 *
 * IMPORTANT (see users.spec.ts finding #3): `roleNames` resolves by the
 * role's `roleName` (display name) field, NOT `roleCode` — despite
 * `roleCode` being the canonical identifier used for Role-Pages assignment
 * (`addPageToRole`/`removePageFromRole` take `pageCode`, and roles are
 * created with a `roleCode`, but *attaching* that role to a user needs its
 * `roleName` string instead). `createThrowawayUserWithRole` below takes
 * `roleName`, not `roleCode` — don't pass a roleCode there.
 */

// Role codes must match backend's `^[A-Z][A-Z0-9_]*$` (validated, not
// normalized, unlike pageCode which the backend uppercases automatically) —
// keep this uppercase so it's reusable for both pageCode and roleCode.
const uniq = () => `${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`.toUpperCase();
const pwUsername = () => `pwtest_menu_${uniq().toLowerCase()}`;

async function createThrowawayUserWithRole(
  api: SecurityApiClient,
  roleName: string
): Promise<{ userId: number; username: string; password: string }> {
  const username = pwUsername();
  const password = 'Passw0rd1';
  const created = (await (await api.post('/api/users', { username, password })).json()).data;
  const assignRes = await api.put(`/api/users/${created.id}`, { roleNames: [roleName] });
  if (assignRes.status() >= 300) {
    throw new Error(`createThrowawayUserWithRole: role assignment failed (${assignRes.status()}): ${await assignRes.text()}`);
  }
  return { userId: created.id, username, password };
}

test.describe('TC-MENU — Menu Management', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginAsAdmin(page, request);
  });

  test('TC-MENU-001/006 — Own menu includes VIEW-granted pages, parent/child tree renders as nav-collapse', async ({
    page,
    request
  }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);

    const parentCode = `PWTEST_MENU_ROOT_${uniq()}`;
    const parent = (
      await (
        await api.post('/api/pages', {
          pageCode: parentCode,
          nameEn: 'PWTest Menu Root',
          nameAr: 'قائمة اختبار',
          route: `/pwtest/menu-root-${uniq()}`,
          module: 'SECURITY'
        })
      ).json()
    ).data;

    const childCode = `PWTEST_MENU_CHILD_${uniq()}`;
    const childRes = await api.post('/api/pages', {
      pageCode: childCode,
      nameEn: 'PWTest Menu Child',
      nameAr: 'فرعي اختبار',
      route: `/pwtest/menu-child-${uniq()}`,
      module: 'SECURITY',
      parentId: parent.id
    });
    const child = (await childRes.json()).data;

    const roleName = `PWTest Menu Role ${uniq()}`;
    const role = (
      await (await api.post('/api/roles', { roleCode: `PWTEST_ROLE_MENU_${uniq()}`, roleName, active: true })).json()
    ).data;
    // VIEW is always auto-added by addPageToRole; no extra CRUD needed for menu visibility.
    await api.post(`/api/roles/${role.id}/pages`, { pageCode: parent.pageCode, permissions: [] });
    await api.post(`/api/roles/${role.id}/pages`, { pageCode: child.pageCode, permissions: [] });

    const { username, password } = await createThrowawayUserWithRole(api, roleName);

    // --- API shape check (TC-MENU-006's literal "expected" is about the JSON tree) ---
    const userSession = await loginViaApi(request, username, password);
    const userApi = new SecurityApiClient(request, userSession);
    const menuRes = await userApi.get('/api/menu/user-menu');
    expect(menuRes.status()).toBe(200);
    const menuBody = await menuRes.json();
    const rootEntry = menuBody.data.find((m: { id: number }) => m.id === parent.id);
    expect(rootEntry).toBeTruthy();
    expect(rootEntry.children?.some((c: { id: number; parentId: number }) => c.id === child.id && c.parentId === parent.id)).toBe(
      true
    );

    // --- UI check: own sidebar (TC-MENU-001 positive) ---
    await seedSession(page, userSession);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Parent renders as a collapse trigger (has children -> NavigationItem
    // type 'collapse') and IS visible in the sidebar, confirming TC-MENU-001
    // (own menu includes VIEW-granted pages).
    const rootTrigger = page.locator('li.coded-hasmenu', { hasText: 'PWTest Menu Root' });
    await expect(rootTrigger).toBeVisible();

    // FIXED (was CONTRACT_BREAK, only reachable once a page actually has a child —
    // never exercised before since every pre-existing SEC_PAGES row has
    // PARENT_ID_FK NULL): `NavCollapseComponent.isEnabled` defaulted to `false`
    // and was only ever flipped to `true` by matching `item.role` against the
    // current user's role NAME — but `item.role` is populated from a permission
    // CODE (`MenuItemDto.permCode`, e.g. "PERM_X_VIEW"), which can never equal a
    // role name like "SUPER_ADMIN". That mismatch meant no menu item's `role`
    // check could ever legitimately pass. `NavItemComponent` (leaf items) sidesteps
    // this by defaulting `isEnabled` to `true` ("disabled only if role check
    // fails"); `NavCollapseComponent` inconsistently defaulted to `false`
    // ("enabled only if role check explicitly passes") — since the backend's menu
    // is already filtered server-side to exactly the pages this user is permitted
    // to see, no additional client-side role re-check is meaningful here at all.
    // Fixed by aligning NavCollapseComponent's default to match NavItemComponent's
    // (`isEnabled = true`), rather than populating `permCode` with a value that
    // could never satisfy this comparison. Every parent/collapse-type sidebar
    // entry is now clickable/expandable, for every user, same as leaf items.
    await expect(rootTrigger.locator('> a.nav-link')).not.toHaveClass(/disabled/);
    const pointerEvents = await rootTrigger.locator('> a.nav-link').evaluate((el) => getComputedStyle(el).pointerEvents);
    expect(pointerEvents).not.toBe('none');

    // Confirm it's actually clickable/expandable now, not just missing the CSS class.
    await rootTrigger.locator('> a.nav-link').click();
    await expect(page.getByRole('link', { name: 'PWTest Menu Child' })).toBeVisible();
  });

  test('TC-MENU-002 — Own menu reflects permission changes (page removed from role)', async ({ page, request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);

    const pageCode = `PWTEST_MENU_REVOKE_${uniq()}`;
    const created = (
      await (
        await api.post('/api/pages', {
          pageCode,
          nameEn: 'PWTest Menu Revoke Target',
          nameAr: 'هدف الإلغاء',
          route: `/pwtest/menu-revoke-${uniq()}`,
          module: 'SECURITY'
        })
      ).json()
    ).data;

    const roleName = `PWTest Revoke Role ${uniq()}`;
    const role = (
      await (
        await api.post('/api/roles', { roleCode: `PWTEST_ROLE_REVOKE_${uniq()}`, roleName, active: true })
      ).json()
    ).data;
    await api.post(`/api/roles/${role.id}/pages`, { pageCode: created.pageCode, permissions: [] });

    const { username, password } = await createThrowawayUserWithRole(api, roleName);

    // Before removal: page is present in the user's own sidebar.
    let userSession = await loginViaApi(request, username, password);
    await seedSession(page, userSession);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('link', { name: 'PWTest Menu Revoke Target' })).toBeVisible();

    // Remove the page's VIEW-granting role assignment (removePageFromRole).
    const removeRes = await api.delete(`/api/roles/${role.id}/pages/${created.pageCode}`);
    expect(removeRes.status()).toBe(204);

    // Permissions are baked into the JWT at login — a fresh session is required
    // to observe the change (matches how the real app behaves; not a stale-token bug).
    userSession = await loginViaApi(request, username, password);
    await seedSession(page, userSession);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('link', { name: 'PWTest Menu Revoke Target' })).toHaveCount(0);
  });

  test('TC-MENU-003 — Get Menu For Specific User (Admin) — happy path (API, no screen)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);

    const roleName = `PWTest M3 Role ${uniq()}`;
    await api.post('/api/roles', { roleCode: `PWTEST_ROLE_M3_${uniq()}`, roleName, active: true });
    const { userId, username, password } = await createThrowawayUserWithRole(api, roleName);

    const adminViewRes = await api.get(`/api/menu/user-menu/${userId}`);
    expect(adminViewRes.status()).toBe(200);
    const adminView = (await adminViewRes.json()).data;

    const ownSession = await loginViaApi(request, username, password);
    const ownApi = new SecurityApiClient(request, ownSession);
    const ownView = (await (await ownApi.get('/api/menu/user-menu')).json()).data;

    expect(adminView.map((m: { id: number }) => m.id).sort()).toEqual(ownView.map((m: { id: number }) => m.id).sort());
  });

  test('TC-MENU-004 — Get Menu For Specific User — forbidden without USER_VIEW', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);

    // Caller with zero permissions (no roleNames at all).
    const callerUsername = pwUsername();
    await api.post('/api/users', { username: callerUsername, password: 'Passw0rd1' });
    const callerSession = await loginViaApi(request, callerUsername, 'Passw0rd1');
    const callerApi = new SecurityApiClient(request, callerSession);

    const adminSession = await fetchAdminSession(request);
    const res = await callerApi.get(`/api/menu/user-menu/${adminSession.userId}`);
    expect(res.status()).toBe(403);
  });

  test('TC-MENU-005 — Get Menu For Specific User — nonexistent userId (exploratory)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const res = await api.get('/api/menu/user-menu/999999999');
    console.log('TC-MENU-005 observed status:', res.status());
    // Doc: "Undocumented in catalog — observe (likely empty array rather than 404)".
    if (res.status() === 200) {
      const body = await res.json();
      expect(body.data).toEqual([]);
    } else {
      expect(res.status()).toBe(404);
    }
  });
});
