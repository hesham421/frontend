import { test, expect } from '@playwright/test';
import { UserListPage } from '../pages/UserListPage';
import { loginAsAdmin, fetchAdminSession, SECURITY_API_URL } from '../support/auth';
import { SecurityApiClient } from '../support/api-client';

/**
 * Group 7 — User Management (§7, TC-USER-001..018).
 *
 * /security/users has no separate create/edit route — UserListComponent opens
 * a drawer (createUserModal) for both, plus a second drawer (rolesModal) with
 * an ErpDualListComponent role picker. UserListPage POM drives both.
 *
 * Findings from writing/running this spec (verified via source read + live
 * calls, corrected once against an earlier wrong reading — see below):
 *
 * 1. CONTRACT_BREAK (severe, live-verified, NOT "silently ignored" as first
 *    assumed) — `CreateUserRequest` (backend record) has ONLY
 *    `username`+`password` fields. The drawer's submit path ALWAYS includes
 *    `enabled` (a plain boolean, never omitted) in the POST body. This
 *    backend enforces `spring.jackson.deserialization.fail-on-unknown-
 *    properties=true` GLOBALLY (erp-main/application.properties — a
 *    deliberate hardening choice per `CommonJacksonConfig`'s own comment),
 *    so any request carrying `enabled` gets a flat `400 INVALID_JSON` —
 *    confirmed live via curl. **The real "Add User" button cannot create a
 *    user at all in this environment.** UserService.createUser() would ALSO
 *    hardcode `.enabled(true)` and only attach a default "ROLE_USER" role IF
 *    one existed (it does not in this DB), but that logic is unreachable
 *    from the UI since the request never even parses. See the dedicated
 *    "REAL UI BEHAVIOR" test below for the live reproduction.
 * 2. NOT a gap (self-correction): `SecurityPermissions.USER_MANAGE_ROLES`
 *    *looks* like a distinct permission by its Java constant name, but its
 *    actual string value is `"PERM_USER_UPDATE"` — i.e. `assignRoles()`
 *    (`PUT /api/users/{id}/roles`) is gated by the SAME permission as the
 *    general update endpoint, not a separate one. An earlier version of this
 *    file wrongly concluded (from an `ILIKE '%MANAGE_ROLES%'` search over
 *    `permissions`, which correctly found nothing because no permission is
 *    literally named that) that the endpoint was universally unreachable —
 *    a live 200 response caught the mistake. Fixed below; TC-USER-008/009/
 *    010/017 run for real. The general `PUT /api/users/{id}` update path
 *    still can't clear all roles via an empty array (both the Angular
 *    component's `roleNames: length>0 ? roles : undefined` and the backend's
 *    `if (roleNames != null && !roleNames.isEmpty())` treat empty as
 *    "no change") — only the dedicated `/roles` endpoint (unconditional
 *    `user.setRoles(new HashSet<>(roleNames))`) can actually clear roles,
 *    which is exactly what TC-USER-010 exercises.
 * 3. CONTRACT SURPRISE, live-verified — `roleNames` (on both the dedicated
 *    `/roles` endpoint and the general update endpoint) does NOT mean role
 *    *codes*. `RoleRepository.findByRoleName(...)` is a Spring Data derived
 *    query matching the `Role` entity's `roleName` field (DB column `NAME`
 *    — the free-text *display* name from `CreateRoleRequest.roleName`, e.g.
 *    "System Administrator"), never `roleCode` (DB column `ROLE_CODE`, the
 *    canonical uppercase identifier every OTHER part of this app — Role-Pages
 *    assignment, the regex-validated create form, `PERM_*` naming — treats as
 *    the real key). `Role.getName()` is a `@Deprecated` compatibility shim
 *    that returns `roleName`, not `roleCode`, reinforcing the same confusion
 *    server-side. First caught this by passing a roleCode here and getting
 *    the exact same `404 ROLE_NOT_FOUND` TC-USER-017 (deliberately invalid
 *    role) expects — i.e. a syntactically well-formed, real, existing role
 *    was indistinguishable from a nonexistent one until the display name was
 *    used instead. `data.roles` in every response here is therefore a list
 *    of display names, not codes — worth flagging for anyone integrating
 *    against this endpoint expecting `roleCode` semantics.
 */

const pwUsername = () => `pwtest_user_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

test.describe('TC-USER — User Management', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginAsAdmin(page, request);
  });

  test('TC-USER-001 REAL UI BEHAVIOR — Add User drawer is currently broken (CONTRACT_BREAK, live-verified)', async ({
    page
  }) => {
    // GENUINE, LIVE PRODUCTION BUG (not a test artifact): `CreateUserRequest`
    // (backend record) has ONLY `username`+`password` fields. The Angular
    // drawer's submit path (`UserListComponent.createUser()`) ALWAYS includes
    // `enabled: this.userForm.enabled` in the POST body — it's a plain
    // boolean, never omitted/undefined, defaulting to `true` on every fresh
    // form. This backend enforces
    // `spring.jackson.deserialization.fail-on-unknown-properties=true`
    // globally (erp-main/application.properties) — so ANY create-user
    // submission through the real "Add User" button 400s with
    // `INVALID_JSON`, confirmed live via curl replicating the exact payload
    // shape. The Add User feature is completely non-functional end-to-end in
    // this environment today. This test documents that real, current
    // behavior rather than working around it.
    const users = new UserListPage(page);
    const username = pwUsername();

    await users.gotoList();
    await users.openCreateDrawer();
    await users.fillForm({ username, password: 'Passw0rd1', enabled: true });
    const createRes = page.waitForResponse(
      (r) => r.url().endsWith('/api/users') && r.request().method() === 'POST'
    );
    await users.save();
    const res = await createRes;
    expect(res.status()).toBe(400); // CONTRACT_BREAK — see comment above.
    const body = await res.json();
    expect(body.error?.code).toBe('INVALID_JSON');
    await users.expectFormError(/.+/); // the drawer does surface the failure to the user, at least
    await users.dismissDrawer();
  });

  test('TC-USER-001/002 — Create User happy path + duplicate username (API — see UI bug above)', async ({
    request
  }) => {
    // Because the real drawer can never successfully create a user (see the
    // CONTRACT_BREAK test above), the happy-path/duplicate-username business
    // rules are verified here directly against the endpoint with the DTO
    // shape it actually accepts (username+password only) — proving the
    // BACKEND logic itself is correct; only the frontend's over-posting is broken.
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const username = pwUsername();

    const res = await api.post('/api/users', { username, password: 'Passw0rd1' });
    expect(res.status()).toBeLessThan(300);
    const body = await res.json();
    expect(body.data.username).toBe(username);
    expect(body.data.enabled).toBe(true);
    expect(body.data.roles).toEqual([]);

    const dup = await api.post('/api/users', { username, password: 'Passw0rd1' });
    expect(dup.status()).toBe(409);
    const dupBody = await dup.json();
    expect(dupBody.error?.code).toBe('USERNAME_ALREADY_EXISTS');
  });

  test('TC-USER-003 — List All Users (UI grid, happy path)', async ({ page, request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const username = pwUsername();
    await api.post('/api/users', { username, password: 'Passw0rd1' });

    const users = new UserListPage(page);
    await users.gotoList();
    await users.expectRowVisible(username);
  });

  test('TC-USER-004/005 — Search Users: filter by enabled + CONTAINS on username', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);

    // Real search contract for /api/users/search is {field, operator, value}
    // with EQUALS/CONTAINS/STARTS_WITH — confirmed live; note this differs
    // from Pages' EQ/LIKE vocabulary even though both extend the same
    // BaseSearchContractRequest shape (module-specific allowed-operator lists).
    const enabledRes = await api.post('/api/users/search', {
      filters: [{ field: 'enabled', operator: 'EQUALS', value: true }],
      page: 0,
      size: 20
    });
    expect(enabledRes.status()).toBe(200);
    const enabledBody = await enabledRes.json();
    expect(enabledBody.data.content.length).toBeGreaterThan(0);
    for (const u of enabledBody.data.content) expect(u.enabled).toBe(true);

    const username = pwUsername();
    await api.post('/api/users', { username, password: 'Passw0rd1' });
    const likeRes = await api.post('/api/users/search', {
      filters: [{ field: 'username', operator: 'CONTAINS', value: username }],
      page: 0,
      size: 20
    });
    expect(likeRes.status()).toBe(200);
    const likeBody = await likeRes.json();
    expect(likeBody.data.content.some((u: { username: string }) => u.username === username)).toBe(true);
  });

  test('TC-USER-006 — Update User: change enabled flag (UI drawer) blocks subsequent login', async ({ page, request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const username = pwUsername();
    await api.post('/api/users', { username, password: 'Passw0rd1' });

    const users = new UserListPage(page);
    await users.gotoList();
    await users.openEditDrawer(username);
    await users.fillForm({ enabled: false });
    const updateRes = page.waitForResponse(
      (r) => r.url().includes('/api/users/') && r.request().method() === 'PUT'
    );
    await users.save();
    const res = await updateRes;
    const body = await res.json();
    expect(body.data.enabled).toBe(false);

    const loginRes = await request.post(`${SECURITY_API_URL}/api/auth/login-token`, {
      data: { username, password: 'Passw0rd1' }
    });
    expect(loginRes.status()).not.toBe(200);
  });

  test('TC-USER-007 — Update User: change password (UI drawer), old fails / new succeeds', async ({ page, request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const username = pwUsername();
    await api.post('/api/users', { username, password: 'OldPassw0rd1' });

    const users = new UserListPage(page);
    await users.gotoList();
    await users.openEditDrawer(username);
    await users.fillForm({ password: 'NewPassw0rd2' });
    const updateRes = page.waitForResponse(
      (r) => r.url().includes('/api/users/') && r.request().method() === 'PUT'
    );
    await users.save();
    expect((await updateRes).status()).toBeLessThan(300);

    const oldLogin = await request.post(`${SECURITY_API_URL}/api/auth/login-token`, {
      data: { username, password: 'OldPassw0rd1' }
    });
    expect(oldLogin.status()).toBe(401);

    const newLogin = await request.post(`${SECURITY_API_URL}/api/auth/login-token`, {
      data: { username, password: 'NewPassw0rd2' }
    });
    expect(newLogin.status()).toBe(200);
  });

  test('TC-USER-011 — Get User Roles (dedicated GET endpoint, unaffected by the gap)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const username = pwUsername();
    const created = (await (await api.post('/api/users', { username, password: 'Passw0rd1' })).json()).data;

    const res = await api.get(`/api/users/${created.id}/roles`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]); // matches roles:[] observed at creation
  });

  test('TC-USER-008/009 — Assign Roles happy path + full-replace semantics (dedicated endpoint)', async ({ request }) => {
    // FINDING: `roleNames` (both here and on the general PUT /api/users/{id})
    // resolves via `RoleRepository.findByRoleName(...)`, a Spring Data
    // derived-query method matching the entity's `roleName` FIELD (DB column
    // NAME — the free-text DISPLAY name from CreateRoleRequest.roleName),
    // NOT `roleCode` (the canonical uppercase identifier used EVERYWHERE else
    // in the app, incl. Role-Pages assignment). `Role.getName()` is a
    // `@Deprecated` compat shim that literally returns `roleName`, not
    // `roleCode`. Confirmed by first getting `404 ROLE_NOT_FOUND` passing a
    // roleCode here (matches TC-USER-017's own nonexistent-role case!) —
    // passing the role's `roleName` value fixes it. `data.roles` in the
    // response is therefore also a list of display names, not codes.
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const uniqSuffix = `${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`.toUpperCase();

    const roleAName = `PWTest Role A ${uniqSuffix}`;
    const roleBName = `PWTest Role B ${uniqSuffix}`;
    await api.post('/api/roles', { roleCode: `PWTEST_ROLE_A_${uniqSuffix}`, roleName: roleAName, active: true });
    await api.post('/api/roles', { roleCode: `PWTEST_ROLE_B_${uniqSuffix}`, roleName: roleBName, active: true });

    const username = pwUsername();
    const created = (await (await api.post('/api/users', { username, password: 'Passw0rd1' })).json()).data;

    // TC-USER-008: happy path.
    const res1 = await api.put(`/api/users/${created.id}/roles`, { roleNames: [roleAName] });
    expect(res1.status()).toBe(200);
    expect((await res1.json()).data.roles).toEqual([roleAName]);

    // TC-USER-009: assigning ROLE_B afterward fully replaces ROLE_A, not additive.
    const res2 = await api.put(`/api/users/${created.id}/roles`, { roleNames: [roleBName] });
    expect(res2.status()).toBe(200);
    expect((await res2.json()).data.roles).toEqual([roleBName]);
  });

  test('TC-USER-010 — Assign Roles: empty array clears all roles (dedicated endpoint only)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const uniqSuffix = `${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`.toUpperCase();
    const roleName = `PWTest Role C ${uniqSuffix}`;
    await api.post('/api/roles', { roleCode: `PWTEST_ROLE_C_${uniqSuffix}`, roleName, active: true });

    const username = pwUsername();
    const created = (await (await api.post('/api/users', { username, password: 'Passw0rd1' })).json()).data;
    const assignRes = await api.put(`/api/users/${created.id}/roles`, { roleNames: [roleName] });
    expect(assignRes.status()).toBe(200); // sanity: the role really did get attached before clearing it

    // Sanity: the GENERAL update endpoint's empty-array-is-"no change" guard
    // (see file header) means THIS would be a no-op — must use /roles.
    const clearRes = await api.put(`/api/users/${created.id}/roles`, { roleNames: [] });
    expect(clearRes.status()).toBe(200);
    expect((await clearRes.json()).data.roles).toEqual([]);

    const getRolesRes = await api.get(`/api/users/${created.id}/roles`);
    expect((await getRolesRes.json()).data).toEqual([]);
  });

  test('TC-USER-017 — Assign Roles: role name does not exist (exploratory)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const username = pwUsername();
    const created = (await (await api.post('/api/users', { username, password: 'Passw0rd1' })).json()).data;

    const res = await api.put(`/api/users/${created.id}/roles`, { roleNames: ['PWTEST_DOES_NOT_EXIST'] });
    console.log('TC-USER-017 observed status:', res.status());
    expect(res.status()).toBe(404);
    expect((await res.json()).error?.code).toBe('ROLE_NOT_FOUND');
  });

  test('TC-USER-018 — Unauthorized: assignRoles without PERM_USER_UPDATE', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const targetUsername = pwUsername();
    const target = (await (await api.post('/api/users', { username: targetUsername, password: 'Passw0rd1' })).json())
      .data;

    // Throwaway caller with zero permissions (no roleNames passed at create).
    // assignRoles() is gated by PERM_USER_UPDATE under the hood (see file
    // header) — a permission-less caller lacks it same as any other
    // USER_UPDATE-gated endpoint.
    const callerUsername = pwUsername();
    await api.post('/api/users', { username: callerUsername, password: 'Passw0rd1' });
    const callerLogin = await request.post(`${SECURITY_API_URL}/api/auth/login-token`, {
      data: { username: callerUsername, password: 'Passw0rd1' }
    });
    const callerToken = (await callerLogin.json()).data.accessToken;

    const res = await request.put(`${SECURITY_API_URL}/api/users/${target.id}/roles`, {
      headers: { Authorization: `Bearer ${callerToken}` },
      data: { roleNames: ['SUPER_ADMIN'] }
    });
    expect(res.status()).toBe(403);
  });

  test('TC-USER-012 — Delete User happy path (UI grid + confirm dialog)', async ({ page, request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const username = pwUsername();
    await api.post('/api/users', { username, password: 'Passw0rd1' });

    const users = new UserListPage(page);
    await users.gotoList();
    await users.expectRowVisible(username);
    const deleteRes = page.waitForResponse(
      (r) => r.url().includes('/api/users/') && r.request().method() === 'DELETE'
    );
    await users.clickDelete(username);
    await users.confirmDeleteDialog();
    expect((await deleteRes).status()).toBe(204);

    await users.gotoList();
    await users.expectRowNotVisible(username);
  });

  test('TC-USER-013 — Delete User blocked by active refresh token', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const username = pwUsername();
    const created = (await (await api.post('/api/users', { username, password: 'Passw0rd1' })).json()).data;

    // Log in as the user to create a refresh token (do NOT log out first).
    await request.post(`${SECURITY_API_URL}/api/auth/login-token`, {
      data: { username, password: 'Passw0rd1' }
    });

    const res = await api.delete(`/api/users/${created.id}`);
    expect(res.status()).toBe(409);
  });

  test('TC-USER-014/016 — Create User boundary: username under minLength / password under minLength', async ({
    request
  }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);

    const shortUsername = await api.post('/api/users', { username: 'ab', password: 'Passw0rd1' });
    console.log('TC-USER-014 observed status:', shortUsername.status());
    expect(shortUsername.status()).toBe(400);

    const shortPassword = await api.post('/api/users', { username: pwUsername(), password: 'abcde' });
    console.log('TC-USER-016 observed status:', shortPassword.status());
    expect(shortPassword.status()).toBe(400);
  });

  test('TC-USER-015 — Create User at maxLength (80 chars) succeeds', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const base = `pwtest_${Date.now().toString(36)}_`;
    const username = (base + 'x'.repeat(80 - base.length)).slice(0, 80);
    expect(username.length).toBe(80);

    const res = await api.post('/api/users', { username, password: 'Passw0rd1' });
    expect(res.status()).toBeLessThan(300);
  });
});
