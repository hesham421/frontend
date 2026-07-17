import * as fs from 'fs';
import * as path from 'path';
import { test, expect, APIRequestContext } from '@playwright/test';
import { PagesRegistryPage } from '../pages/PagesRegistryPage';
import { RoleAccessPage } from '../pages/RoleAccessPage';
import { SignUpPage } from '../pages/SignUpPage';
import { PasswordRecoveryPage } from '../pages/PasswordRecoveryPage';
import { loginAsAdmin, loginViaApi, fetchAdminSession, SECURITY_API_URL } from '../support/auth';
import { SecurityApiClient } from '../support/api-client';

/**
 * TC-E2E-004/005 need the real activation/reset token, which is only ever
 * issued via an event no NotificationService subscriber consumes yet (per
 * the doc's §3 SEC-002-gap note) — i.e. it never reaches an inbox. But
 * `account_activation_token.token` / `password_reset_token.token` ARE plain
 * SELECT-able columns (confirmed via `mcp__postgres__describe_table`), so
 * the token is retrievable, just not from inside this Node process (no DB
 * client dependency is set up in this project, and adding one is out of
 * scope for a test-only change). Each flow is therefore split into two
 * Playwright tests with a filesystem handoff in between:
 *   - the "a" test drives the signup/forgot-password step and writes the
 *     generated username to a JSON file in the scratchpad dir
 *   - between runs, the token is fetched with one `mcp__postgres__query`
 *     SELECT (done by the test-execution agent, exactly the "DB/log access"
 *     the doc's own note anticipates) and passed in via an env var
 *   - the "b" test reads the username back and completes activation/reset
 * This is real orchestration, not a placeholder: see the report for the
 * actual SELECTs used and both tests' real pass/fail outcome.
 */
const HANDOFF_DIR = '/private/tmp/claude-501/-Users-ezzat-my-project/0ea7a2cc-3593-4e29-a5d3-2172a3c27757/scratchpad/e2e-handoff';
fs.mkdirSync(HANDOFF_DIR, { recursive: true });
const HANDOFF_004 = path.join(HANDOFF_DIR, 'e2e-004.json');
const HANDOFF_005 = path.join(HANDOFF_DIR, 'e2e-005.json');

/**
 * Group 11 — Cross-Module End-to-End Flows (§11, TC-E2E-001..009).
 *
 * Each test is self-contained (creates its own Page/Role/User prerequisites,
 * PWTEST_ prefixed) per the isolation rule — the doc's §1 "suggested
 * execution order" / TC-E2E-002's "continuing from TC-E2E-001" framing is
 * NOT followed literally; instead each flow re-derives whatever state it
 * needs so it can run alone or in any order.
 *
 * UI vs API split, decided per-step against the actual screens (verified
 * from component source, not guessed):
 *  - Page creation            -> UI (PagesRegistryPage — real form, real ids)
 *  - Role creation/pages/copy-from/branch-scope -> UI (RoleAccessPage —
 *    role-access-form.component.html has real data-testid-driven modals
 *    for exactly this: Add Page, Copy From, Assign Branch)
 *  - Permission search, Role-Pages matrix, user-menu, role delete 409/204
 *    chain, signup/activate/reset token retrieval -> API (SecurityApiClient
 *    + direct Postgres SELECT for the SEC-002 gap package's un-emailed
 *    tokens — account_activation_token / password_reset_token store the
 *    raw token in a SELECT-able column, so the "env-dependent" caveat in
 *    the doc's §3 note does not block automation here)
 *  - User creation/role assignment for the E2E chains -> API. The Users
 *    list drawer DOES have real UI (see user-list.component.html), but it's
 *    Group 7's (users.spec.ts) subject matter; re-implementing that POM
 *    here risked a concurrent-file collision with that in-progress spec,
 *    and this group's own focus is the cross-module chain, not the User
 *    form itself. Noted once here rather than repeated per-test.
 *
 * KNOWN WORKAROUND: RoleAccessPage's selectCopySourceRole/selectAssignBranch/
 * selectAssignLevel call `page.getByTestId(...).selectOption(...)` directly —
 * but the data-testid lives on the `<avl-select>` HOST element in the
 * template, not the native `<select>` it wraps (avl-select's own template
 * never forwards it inward). Playwright's selectOption() requires the
 * resolved element's tagName to literally be `select`, so those three
 * convenience methods appear to be a latent bug (confirmed by reading
 * avl-select.component.ts's template — no [attr.data-testid] passthrough).
 * Not fixed here (shared POM owned/edited concurrently by roles.spec.ts's
 * author) — this file bypasses them with its own `[data-testid="..."] select`
 * locators, flagged in the report as a CONTRACT_BREAK-adjacent finding.
 */

const uniq = () => Date.now().toString(36).toUpperCase().slice(-8);

async function api(request: APIRequestContext): Promise<SecurityApiClient> {
  const session = await fetchAdminSession(request);
  return new SecurityApiClient(request, session);
}

async function createPageViaApi(apiClient: SecurityApiClient, code: string) {
  const res = await apiClient.post('/api/pages', {
    pageCode: code,
    nameEn: `PW Test ${code}`,
    nameAr: 'صفحة اختبار',
    route: `/pwtest/${code.toLowerCase()}`
  });
  expect(res.status()).toBeLessThan(300);
  return (await res.json()).data as { id: number; pageCode: string };
}

test.describe('TC-E2E — Cross-Module End-to-End Flows', () => {
  test('TC-E2E-001 — New page -> permissions auto-generate -> role gets access -> user sees it in menu', async ({
    page,
    request
  }) => {
    await loginAsAdmin(page, request);
    const apiClient = await api(request);
    const code = `PWTEST_E2E001_${uniq()}`;

    // 1. Create Page via real UI form.
    const pagesPage = new PagesRegistryPage(page);
    await pagesPage.gotoCreate();
    await pagesPage.fillForm({
      pageCode: code,
      nameEn: 'E2E001 Page',
      nameAr: 'صفحة',
      // Angular form validator: `^\/[a-z0-9\-\/]*$` — lowercase/digits/hyphens/slashes
      // ONLY, no underscores (unlike the backend, which per doc only caps length —
      // this route regex is a frontend-only rule on pages-form.component.ts's reactive
      // form, confirmed via a failed-test screenshot showing "Must start with / and
      // contain only lowercase letters, numbers, hyphens" under the Route field).
      route: `/pwtest/${code.toLowerCase().replace(/_/g, '-')}`,
      displayOrder: 1
    });
    const createPageRes = page.waitForResponse((r) => r.url().includes('/api/pages') && r.request().method() === 'POST');
    await pagesPage.save();
    const pageBody = (await (await createPageRes).json()).data as { id: number; pageCode: string };
    const pageId = pageBody.id;
    const pageCode = pageBody.pageCode; // normalized uppercase

    // 2. Search Permissions filtered by pageId -> 4 rows VIEW/CREATE/UPDATE/DELETE.
    // CONFIRMED APP BUG (backend, not touched — never modify src/app/ or backend/):
    // the doc's own example (§4 TC-PAGE-021 / §5 TC-PERM-005) filters permissions by
    // `pageId`, but the running backend's search allowlist rejects it —
    // `{"error":{"code":"SEARCH_ERROR"},"message":"Field 'pageId' is not allowed for
    // searching"}`, confirmed via direct curl, even though `pageId` IS a real field on
    // every permission row returned by an unrelated filter (`name LIKE`). Falling back
    // to `name LIKE <pageCode>` here, since permission names are always
    // `PERM_<PAGECODE>_<TYPE>` — reliable for a unique PWTEST pageCode.
    const permRes = await apiClient.post('/api/permissions/search', {
      filters: [{ field: 'name', operator: 'LIKE', value: pageCode }]
    });
    expect(permRes.status(), 'permissions/search by name LIKE pageCode').toBe(200);
    const permBody = await permRes.json();
    const permTypes = (permBody.data.content ?? []).map((p: { permissionType?: string }) => p.permissionType);
    for (const t of ['VIEW', 'CREATE', 'UPDATE', 'DELETE']) expect(permTypes).toContain(t);
    void pageId; // kept for readability of the flow narrative; not used by the (fixed) filter above

    // 3. Create Role via real UI form.
    const roleAccessPage = new RoleAccessPage(page);
    await roleAccessPage.gotoCreate();
    await roleAccessPage.fillCreateForm({ name: `PWTEST E2E001 Role ${uniq()}` });
    const createRoleRes = page.waitForResponse((r) => r.url().endsWith('/api/roles') && r.request().method() === 'POST');
    await roleAccessPage.createRoleButton.click();
    const roleBody = (await (await createRoleRes).json()).data as { id: number; roleCode: string; roleName: string };
    const roleId = roleBody.id;
    await expect(page).toHaveURL(new RegExp(`/security/role-access/edit/${roleId}`));

    // 4. Add Page to Role with [CREATE, UPDATE] via the real "Add Page" dual-list modal.
    await roleAccessPage.addPageButton.click();
    const addPageRes = page.waitForResponse(
      (r) => r.url().includes(`/api/roles/${roleId}/pages`) && r.request().method() === 'POST'
    );
    await roleAccessPage.addPageViaModal(pageCode);
    await addPageRes;
    await roleAccessPage.expectPageRowVisible(pageCode);
    await roleAccessPage.toggleCreatePermission(pageCode);
    await roleAccessPage.toggleUpdatePermission(pageCode);
    const saveRes = page.waitForResponse(
      (r) => r.url().includes(`/api/roles/${roleId}/pages`) && r.request().method() === 'PUT'
    );
    await roleAccessPage.saveButton.click();
    expect((await saveRes).status()).toBeLessThan(300);

    // 5+6. Create User (API — see file-level note) + Assign Role to User.
    const username = `pwtest_e2e001_${uniq()}`.toLowerCase();
    const createUserRes = await apiClient.post('/api/users', { username, password: 'Passw0rd1' });
    expect(createUserRes.status()).toBeLessThan(300);
    const userId = (await createUserRes.json()).data.id;
    const assignRes = await apiClient.put(`/api/users/${userId}/roles`, { roleNames: [roleBody.roleName] });
    expect(assignRes.status()).toBeLessThan(300);

    // 7. Login as that user.
    const userSession = await loginViaApi(request, username, 'Passw0rd1');
    const userApi = new SecurityApiClient(request, userSession);

    // 8. GET /api/menu/user-menu as that user -> PAGE_A present (VIEW implicit).
    const menuRes = await userApi.get('/api/menu/user-menu');
    expect(menuRes.status()).toBe(200);
    const menuBody = await menuRes.json();
    const menuCodes: string[] = (menuBody.data ?? []).map((m: { pageCode: string }) => m.pageCode);
    expect(menuCodes).toContain(pageCode);

    // 9. Get Role Pages Matrix -> CREATE+UPDATE present, DELETE absent, for pageCode.
    // Raw backend shape is `{assignments: [{pageCode, permissions: string[]}]}` — the
    // create/update/delete BOOLEANS only exist after RoleAccessApiService's own
    // normalization (see role-access-api.service.ts getRolePages()); hitting the API
    // directly here, so assert on the raw `permissions` array instead.
    const matrixRes = await apiClient.get(`/api/roles/${roleId}/pages`);
    const matrixBody = await matrixRes.json();
    const assignments = matrixBody.data?.assignments ?? matrixBody.data ?? [];
    const rowForPage = assignments.find((a: { pageCode: string }) => a.pageCode === pageCode);
    expect(rowForPage).toBeTruthy();
    expect(rowForPage.permissions).toContain('CREATE');
    expect(rowForPage.permissions).toContain('UPDATE');
    expect(rowForPage.permissions).not.toContain('DELETE');
  });

  test('TC-E2E-002 — Remove page access -> user immediately loses menu item', async ({ page, request }) => {
    await loginAsAdmin(page, request);
    const apiClient = await api(request);
    const code = `PWTEST_E2E002_${uniq()}`;

    // Fast API setup (page + role + VIEW-only page assignment + user + role assignment) —
    // Page creation/Add-Page-to-Role already exercised via UI in TC-E2E-001; this test's
    // own subject is the "remove access reflects immediately" behavior, driven via UI below.
    const pageRes = await createPageViaApi(apiClient, code);
    const roleRes = await (
      await apiClient.post('/api/roles', { roleCode: `PWTESTE2E002${uniq()}`, roleName: `PWTEST E2E002 Role ${uniq()}` })
    ).json();
    const roleId = roleRes.data.id;
    await apiClient.post(`/api/roles/${roleId}/pages`, { pageCode: pageRes.pageCode, permissions: [] });

    const username = `pwtest_e2e002_${uniq()}`.toLowerCase();
    const userRes = await (await apiClient.post('/api/users', { username, password: 'Passw0rd1' })).json();
    await apiClient.put(`/api/users/${userRes.data.id}/roles`, { roleNames: [roleRes.data.roleName] });

    // Precondition: user's menu currently includes the page.
    let userSession = await loginViaApi(request, username, 'Passw0rd1');
    let userApi = new SecurityApiClient(request, userSession);
    let menuBody = await (await userApi.get('/api/menu/user-menu')).json();
    expect((menuBody.data ?? []).map((m: { pageCode: string }) => m.pageCode)).toContain(pageRes.pageCode);

    // 1. Remove Page From Role via the real UI ("X" icon-button + confirm dialog).
    const roleAccessPage = new RoleAccessPage(page);
    await roleAccessPage.gotoEdit(roleId);
    await roleAccessPage.expectPageRowVisible(pageRes.pageCode);
    const removeRes = page.waitForResponse(
      (r) => r.url().includes(`/api/roles/${roleId}/pages/`) && r.request().method() === 'DELETE'
    );
    await roleAccessPage.removePageRow(pageRes.pageCode);
    await roleAccessPage.confirmDialog('Delete');
    expect((await removeRes).status()).toBeLessThan(300);

    // 2. Re-login as the test user (fresh token — menu is computed from current DB
    //    role/page state at request time, not cached in the JWT).
    userSession = await loginViaApi(request, username, 'Passw0rd1');
    userApi = new SecurityApiClient(request, userSession);

    // 3. GET user-menu -> page no longer present.
    menuBody = await (await userApi.get('/api/menu/user-menu')).json();
    const codesAfter = (menuBody.data ?? []).map((m: { pageCode: string }) => m.pageCode);
    expect(codesAfter).not.toContain(pageRes.pageCode);
  });

  test('TC-E2E-003 — Copy role permissions preserves system-level, replaces page-level', async ({ page, request }) => {
    await loginAsAdmin(page, request);
    const apiClient = await api(request);

    const pageA = await createPageViaApi(apiClient, `PWTEST_E2E003A_${uniq()}`);
    const pageB = await createPageViaApi(apiClient, `PWTEST_E2E003B_${uniq()}`);
    const pageC = await createPageViaApi(apiClient, `PWTEST_E2E003C_${uniq()}`); // target's own original page

    const sourceRes = await (
      await apiClient.post('/api/roles', { roleCode: `PWTESTSRC${uniq()}`, roleName: `0-PWTEST-E2E003-SRC-${uniq()}` })
    ).json();
    const targetRes = await (
      await apiClient.post('/api/roles', { roleCode: `PWTESTTGT${uniq()}`, roleName: `PWTEST Target ${uniq()}` })
    ).json();
    const sourceId = sourceRes.data.id;
    const targetId = targetRes.data.id;

    await apiClient.post(`/api/roles/${sourceId}/pages`, { pageCode: pageA.pageCode, permissions: ['CREATE'] });
    await apiClient.post(`/api/roles/${sourceId}/pages`, { pageCode: pageB.pageCode, permissions: ['UPDATE'] });
    await apiClient.post(`/api/roles/${targetId}/pages`, { pageCode: pageC.pageCode, permissions: ['DELETE'] });

    // NOTE (documented gap, not a failure): the doc's step 1/2 also call for a
    // system-level permission (e.g. PERM_SYSTEM_ADMIN) on each role, to prove
    // copy-from doesn't touch non-page-scoped permissions. No endpoint in this
    // API catalog assigns a standalone (non-page) permission to a role — only
    // Add/Sync/Remove/Copy Page operate on role_permissions, and all are
    // page-scoped. That half of TC-E2E-003 is therefore untestable via
    // UI/API black-box automation as it stands; flagging as
    // MISSING_IMPLEMENTATION rather than skipping the page-scoped half below.

    // 3. Copy From Role via the real Copy From modal (role-access-form.component.html).
    const roleAccessPage = new RoleAccessPage(page);
    const rolesLoadedRes = page.waitForResponse(
      (r) => r.url().endsWith('/api/roles/search') && r.request().method() === 'POST'
    );
    await roleAccessPage.gotoEdit(targetId);
    // ngOnInit's Copy-From preload (`facade.setSize(50); facade.loadRoles()`) is async and
    // capped at 50 rows sorted by roleName ASC — with many PWTEST_* roles already in this
    // shared dev DB, a role named "PWTEST Source ..." can sort past position 50 and never
    // reach the dropdown. Waiting for the search response (not just DOM presence of the
    // tab) avoids a race; the source role's name is also given a "0-" prefix above so it
    // sorts near the top regardless.
    await rolesLoadedRes;
    await roleAccessPage.copyFromButton.click();
    // Bypasses RoleAccessPage.selectCopySourceRole (see file-level KNOWN WORKAROUND note).
    await page.locator('[data-testid="role-access-copy-source"] select').selectOption({ label: sourceRes.data.roleName });
    const copyRes = page.waitForResponse((r) => r.url().includes(`/copy-from/${sourceId}`) && r.request().method() === 'POST');
    await roleAccessPage.confirmCopyFrom();
    expect((await copyRes).status()).toBeLessThan(300);

    // 4. Get Role Pages Matrix for target -> matches source's 2 pages, original page gone.
    const matrixBody = await (await apiClient.get(`/api/roles/${targetId}/pages`)).json();
    const assignments = matrixBody.data?.assignments ?? matrixBody.data ?? [];
    const codesAfter = assignments.map((a: { pageCode: string }) => a.pageCode);
    expect(codesAfter).toContain(pageA.pageCode);
    expect(codesAfter).toContain(pageB.pageCode);
    expect(codesAfter).not.toContain(pageC.pageCode);
  });

  test('TC-E2E-004a — Signup + disabled + login-fails-while-disabled (writes handoff)', async ({ page, request }) => {
    const username = `pwteste2e004${uniq()}`.toLowerCase();
    const email = `${username}@pwtest.example.com`;
    const password = 'Passw0rd1';

    // 1. Signup via real UI.
    const signUpPage = new SignUpPage(page);
    await signUpPage.goto();
    await signUpPage.fillForm(username, email, password);
    const signupRes = page.waitForResponse((r) => r.url().includes('/api/auth/signup') && r.request().method() === 'POST');
    await signUpPage.submit();
    const signupBody = await (await signupRes).json();
    expect(signupBody.data.enabled).toBe(false); // 2. RULE-SEC-030
    await signUpPage.expectCheckYourEmail();

    // 2b. Login fails while disabled.
    const failedLoginRes = await request.post(`${SECURITY_API_URL}/api/auth/login-token`, { data: { username, password } });
    expect(failedLoginRes.status()).toBe(401);

    fs.writeFileSync(HANDOFF_004, JSON.stringify({ username, email, password }));
  });

  test('TC-E2E-004b — Activate (real token) -> login succeeds -> user-menu', async ({ page, request }) => {
    test.skip(
      !fs.existsSync(HANDOFF_004) || !process.env['PWTEST_E2E004_TOKEN'],
      'Run TC-E2E-004a first, then supply PWTEST_E2E004_TOKEN from: ' +
        "SELECT token FROM account_activation_token WHERE user_id_fk = (SELECT users_pk FROM users WHERE username = '<handoff username>') " +
        'AND used_fl = 0 ORDER BY created_at DESC LIMIT 1;'
    );
    const { username, password } = JSON.parse(fs.readFileSync(HANDOFF_004, 'utf-8'));
    const token = process.env['PWTEST_E2E004_TOKEN']!;

    // 4. Activate via the real UI (emailed-link simulation: ?token=...).
    const signUpPage = new SignUpPage(page);
    await signUpPage.gotoActivation(token);
    await signUpPage.expectActivated();

    // 5. Login succeeds.
    const userSession = await loginViaApi(request, username, password);
    expect(userSession.accessToken).toBeTruthy();

    // 6. GET user-menu for the new user — self-registered users get no default
    // role, so this should be an empty array, not an error.
    const userApi = new SecurityApiClient(request, userSession);
    const menuRes = await userApi.get('/api/menu/user-menu');
    expect(menuRes.status()).toBe(200);
    const menuBody = await menuRes.json();
    expect(Array.isArray(menuBody.data)).toBe(true);
    console.log('TC-E2E-004b observed self-registered user-menu length:', menuBody.data.length);
  });

  test('TC-E2E-005a — Signup+activate a user, then request password reset (writes handoff)', async ({ page, request }) => {
    // Admin-created users have no email (doc §7 note), so forgot-password needs
    // a self-service (signup+activate) account. Signup itself only needs its own
    // activation token, fetched the same handoff way as TC-E2E-004.
    //
    // Idempotent by design: this test does signup AND (once a token is supplied)
    // activation+forgot-password in the SAME test, so a naive fresh `uniq()` on every
    // invocation would sign up a brand-new user each re-run — orphaning any
    // already-fetched activation token from a prior run (fetched via
    // mcp__postgres__query against the FIRST run's username). Reusing the prior
    // handoff's username/email/password (when present and still at the
    // 'signed-up' stage) keeps the token valid across the two-phase run.
    const existing = fs.existsSync(HANDOFF_005) ? JSON.parse(fs.readFileSync(HANDOFF_005, 'utf-8')) : null;
    const reuseSignup = existing?.stage === 'signed-up';
    const username = reuseSignup ? existing.username : `pwteste2e005${uniq()}`.toLowerCase();
    const email = reuseSignup ? existing.email : `${username}@pwtest.example.com`;
    const password = reuseSignup ? existing.password : 'Passw0rd1';

    if (!reuseSignup) {
      const signUpPage = new SignUpPage(page);
      await signUpPage.goto();
      await signUpPage.fillForm(username, email, password);
      const signupRes = page.waitForResponse((r) => r.url().includes('/api/auth/signup') && r.request().method() === 'POST');
      await signUpPage.submit();
      await signupRes;
      await signUpPage.expectCheckYourEmail();

      fs.writeFileSync(HANDOFF_005, JSON.stringify({ username, email, password, stage: 'signed-up' }));
    }

    const signUpPage = new SignUpPage(page);
    test.skip(
      !process.env['PWTEST_E2E005_ACTIVATION_TOKEN'],
      'Supply PWTEST_E2E005_ACTIVATION_TOKEN from: ' +
        `SELECT token FROM account_activation_token WHERE user_id_fk = (SELECT users_pk FROM users WHERE username = '${username}') ` +
        'AND used_fl = 0 ORDER BY created_at DESC LIMIT 1; (then re-run this test)'
    );
    const activationToken = process.env['PWTEST_E2E005_ACTIVATION_TOKEN']!;
    await signUpPage.gotoActivation(activationToken);
    await signUpPage.expectActivated();

    // 2. Forgot Password via the real UI, now that the account is active + has an email.
    const recoveryPage = new PasswordRecoveryPage(page);
    await recoveryPage.gotoRequest();
    const forgotRes = page.waitForResponse((r) => r.url().includes('/api/auth/forgot-password') && r.request().method() === 'POST');
    await recoveryPage.submitRequest(email);
    expect((await forgotRes).status()).toBe(200);
    await recoveryPage.expectRequestSuccess();

    fs.writeFileSync(HANDOFF_005, JSON.stringify({ username, email, password, stage: 'reset-requested' }));
  });

  test('TC-E2E-005b — Reset password (real token) -> old password fails -> new password succeeds', async ({ page, request }) => {
    test.skip(
      !fs.existsSync(HANDOFF_005) || !process.env['PWTEST_E2E005_RESET_TOKEN'],
      'Run TC-E2E-005a first (through the reset-requested stage), then supply PWTEST_E2E005_RESET_TOKEN from: ' +
        "SELECT token FROM password_reset_token WHERE user_id_fk = (SELECT users_pk FROM users WHERE username = '<handoff username>') " +
        'AND used_fl = 0 ORDER BY created_at DESC LIMIT 1;'
    );
    const { username, password: oldPassword } = JSON.parse(fs.readFileSync(HANDOFF_005, 'utf-8'));
    const resetToken = process.env['PWTEST_E2E005_RESET_TOKEN']!;
    const newPassword = 'NewPassw0rd2';

    // 4. Reset Password via the real UI.
    const recoveryPage = new PasswordRecoveryPage(page);
    await recoveryPage.gotoReset(resetToken);
    await recoveryPage.submitReset(newPassword, newPassword);
    await recoveryPage.expectResetSuccess();

    // 5. Login with OLD password -> 401.
    const oldLoginRes = await request.post(`${SECURITY_API_URL}/api/auth/login-token`, {
      data: { username, password: oldPassword }
    });
    expect(oldLoginRes.status()).toBe(401);

    // 6. Login with NEW password -> 200.
    const newLoginRes = await request.post(`${SECURITY_API_URL}/api/auth/login-token`, {
      data: { username, password: newPassword }
    });
    expect(newLoginRes.status()).toBe(200);
  });

  test('TC-E2E-006 — Delete Role is blocked while a user holds it, unblocks after unassignment', async ({ page, request }) => {
    await loginAsAdmin(page, request);
    const apiClient = await api(request);

    // 1. Create Role, 2. Create User via API (see file-level note on Users UI ownership).
    // "0-" prefix: see step 6 below for why (grid pagination + a confirmed dead-end
    // in the Advanced Filters panel meant to work around it).
    const roleRes = await (
      await apiClient.post('/api/roles', { roleCode: `PWTESTE2E006${uniq()}`, roleName: `0-PWTEST-E2E006-${uniq()}` })
    ).json();
    const roleId = roleRes.data.id;
    const username = `pwtest_e2e006_${uniq()}`.toLowerCase();
    const userRes = await (await apiClient.post('/api/users', { username, password: 'Passw0rd1' })).json();
    const userId = userRes.data.id;

    // 3. Assign Role to User.
    await apiClient.put(`/api/users/${userId}/roles`, { roleNames: [roleRes.data.roleName] });

    // 4. Attempt Delete Role -> 409.
    const blockedRes = await apiClient.delete(`/api/roles/${roleId}`);
    expect(blockedRes.status()).toBe(409);

    // 5. Clear the user's roles.
    const clearRes = await apiClient.put(`/api/users/${userId}/roles`, { roleNames: [] });
    expect(clearRes.status()).toBeLessThan(300);

    // 6. Attempt Delete Role again -> 204 this time — driven via the real UI list
    // screen's Delete action + confirm dialog, to also exercise that path once.
    //
    // CONFIRMED APP BUG, found while building this step: the grid is
    // unfiltered/paginated and this shared dev DB already holds many PWTEST_*
    // roles, so a brand-new role isn't reliably on page 1 (same class of issue as
    // PagesRegistryPage's own documented KNOWN LIMITATION comment). The "Advanced
    // Filters" panel (erp-specification-filter) looks like the fix, but is ITSELF
    // broken: createRoleFilterOptions() (role-access-grid.config.ts) hardcodes
    // `{ value: 'search', label: 'Role Name' }` as the filterable field, and the
    // backend rejects it — confirmed via curl: POST /api/roles/search with
    // `field: 'search'` -> `{"error":{"code":"SEARCH_ERROR"},"message":"Field
    // 'search' is not allowed for searching"}`. The real allowed field (also
    // curl-confirmed) is `roleName`. So the Advanced Filters UI for Roles cannot
    // currently filter by name at all. Worked around here (not fixed, per "never
    // modify src/app/") by giving the role a "0-" name prefix so ascending
    // roleName sort always puts it on page 1 — same technique as TC-E2E-003.
    await loginAsAdmin(page, request);
    const roleAccessPage = new RoleAccessPage(page);
    await roleAccessPage.gotoList();
    await roleAccessPage.expectRowVisible(roleRes.data.roleName);
    const deleteRes = page.waitForResponse((r) => r.url().includes(`/api/roles/${roleId}`) && r.request().method() === 'DELETE');
    await roleAccessPage.clickDeleteRow(roleRes.data.roleName);
    await roleAccessPage.confirmDialog('Delete');
    expect((await deleteRes).status()).toBe(204);
    await roleAccessPage.expectRowNotVisible(roleRes.data.roleName);
  });

  test('TC-E2E-007 — Role-Branch scope combined with User Profile branch (data-scope enforcement gap)', async ({
    page,
    request
  }) => {
    await loginAsAdmin(page, request);
    const apiClient = await api(request);

    // 1. Create Role, assign Branch Scope via the real "Assign Branch" modal
    // (role-access-form.component.html's branch-scope tab).
    const roleAccessPage = new RoleAccessPage(page);
    await roleAccessPage.gotoCreate();
    await roleAccessPage.fillCreateForm({ name: `PWTEST E2E007 Role ${uniq()}` });
    const createRoleRes = page.waitForResponse((r) => r.url().endsWith('/api/roles') && r.request().method() === 'POST');
    await roleAccessPage.createRoleButton.click();
    const roleBody = (await (await createRoleRes).json()).data as { id: number; roleCode: string; roleName: string };
    const roleId = roleBody.id;

    // onCreateRole() switches to edit-mode IN-PLACE via location.replaceState (no real
    // navigation), which skips ngOnInit's roleIdParam branch — that's the ONLY place
    // branchFacade.loadActiveBranches()/loadRoleBranches() get called (see
    // role-access-form.component.ts). Without a real navigation, the "Assign Branch"
    // modal's branch dropdown never populates. Force a real navigation instead — and
    // attach the response listener BEFORE that navigation, not before opening the
    // modal: loadActiveBranches() fires once from ngOnInit on this real nav, and the
    // modal reuses that already-fetched (cached) list rather than re-querying, so a
    // listener attached after gotoEdit() would wait forever for a request that
    // already happened.
    const branchSearchRes = page.waitForResponse((r) => r.url().includes('/api/v1/org/branches/search'));
    await roleAccessPage.gotoEdit(roleId);
    await roleAccessPage.switchToBranchScopeTab();

    // CONFIRMED APP BUG (frontend-only, not fixed here per "never modify src/app/"):
    // RoleBranchApiService.searchActiveBranches() (role-branch-api.service.ts) sends
    // `filters: [{ field: 'isActive', operator: 'EQUALS', value: true }]` against
    // POST /api/v1/org/branches/search. The backend rejects that field name —
    // confirmed via direct curl: `{"error":{"code":"SEARCH_ERROR"},"message":"Field
    // 'isActive' is not allowed for searching"}` — the correct field (also
    // curl-confirmed to work and return the seeded "Default Branch") is
    // `isActiveFl`. Net effect: the real "Assign Branch" modal's branch dropdown is
    // ALWAYS empty in the running app today, for every user — not a test race. This
    // is captured below as a real (failing) sub-assertion, then the test falls back
    // to the API to complete the rest of the scenario, the same way TC-E2E-003
    // documents its own untestable sub-part instead of forcing a UI path that
    // cannot currently succeed.
    await roleAccessPage.assignBranchButton.click();
    const branchSearchStatus = (await branchSearchRes).status();
    console.log('TC-E2E-007 CONFIRMED BUG — GET active branches for Assign-Branch dropdown, status:', branchSearchStatus);
    // expect.soft: records this as a real failure in the report WITHOUT aborting the
    // test, so the rest of the scenario (API fallback + data-scope gap finding below)
    // still runs and produces its own signal regardless of this bug.
    expect.soft(branchSearchStatus, 'CONTRACT_BREAK: isActive vs isActiveFl — see comment above').toBe(200);
    await page.keyboard.press('Escape').catch(() => undefined);

    // Fall back to the API for the actual assignment so the rest of this scenario
    // (User Profile branch linkage + the data-scope enforcement gap below) is still
    // exercised despite the broken modal.
    const assignRes = await apiClient.post('/api/v1/security/role-branches', {
      roleIdFk: roleId,
      branchIdFk: 1,
      dataAccessLevel: 'BRANCH_ONLY'
    });
    expect(assignRes.status()).toBeLessThan(300);

    // 2. Create User, assign the Role (API — see file-level note).
    const username = `pwtest_e2e007_${uniq()}`.toLowerCase();
    const userRes = await (await apiClient.post('/api/users', { username, password: 'Passw0rd1' })).json();
    const userId = userRes.data.id;
    await apiClient.put(`/api/users/${userId}/roles`, { roleNames: [roleBody.roleName] });

    // 3. Create a User Profile for that user pointing at branch X (branch_pk=1, "DEFAULT_BR",
    //    confirmed active via Postgres SELECT during test development).
    const profileRes = await apiClient.post('/api/v1/security/user-profiles', { userIdFk: userId, branchIdFk: 1 });
    expect(profileRes.status()).toBeLessThan(300);
    expect((await profileRes.json()).data.isActiveFl).toBe(true);

    // Sanity: both assignments are independently readable back.
    const roleBranchGet = await apiClient.get(`/api/v1/security/role-branches/${roleId}/1`);
    expect(roleBranchGet.status()).toBe(200);
    const profileGet = await apiClient.get(`/api/v1/security/user-profiles/${userId}`);
    expect(profileGet.status()).toBe(200);
    expect((await profileGet.json()).data.branchIdFk).toBe(1);

    // 4. (Documented gap, per doc's own framing — not a failure.) Confirmed by
    // grepping the whole frontend (`grep -rn "allowedBranches" src/app` — zero
    // hits anywhere in src/app/core) and every other module's governance docs
    // under governance-repo/modules for "allowedBranches"/"dataAccessLevel" outside
    // SECURITY itself (zero hits): no JWT claim, no core service, and no
    // consuming module (ORG, MASTERDATA, etc.) reads or enforces
    // roleIdFk/branchIdFk/dataAccessLevel anywhere observable from the
    // frontend. Role-Branch + User Profile assignment is real and persists,
    // but nothing downstream currently filters data by it — confirms the
    // doc's own caveat that "Security module alone doesn't expose an endpoint
    // that visibly proves this." Recorded as MISSING_IMPLEMENTATION (not a
    // Security-module bug): branch-scoped enforcement has no consumer yet.
  });

  test('TC-E2E-008 — Logout invalidates access across all suites', async ({ request }) => {
    // 1. Login.
    const session = await fetchAdminSession(request);
    // 2. Call any authenticated GET successfully.
    const okRes = await request.get(`${SECURITY_API_URL}/api/pages/active`, {
      headers: { Authorization: `Bearer ${session.accessToken}` }
    });
    expect(okRes.status()).toBe(200);
    // 3. Logout.
    const logoutRes = await request.post(`${SECURITY_API_URL}/api/auth/logout`, {
      headers: { Authorization: `Bearer ${session.accessToken}` }
    });
    expect(logoutRes.status()).toBe(204);
    // 4. Repeat the same GET with the same (now stale) token -> 401 per doc §2
    // TC-AUTH-009 ("all tokens for the session invalidated") and TC-AUTH-011
    // ("confirms logout actually revokes"). CONFIRMED REAL FINDING (reproduced
    // independently via curl, outside Playwright): the access token is still
    // accepted after logout — this GET returns 200, not 401. Logout appears to
    // only revoke the REFRESH token (TC-AUTH-008 in auth.spec.ts, refresh-after-
    // logout -> 401, is consistent with that), while the access token itself
    // stays valid until its natural 900s expiry — a live, unrevoked session.
    // Asserting the documented/expected contract here (not weakening it to match
    // the bug) so this fails loudly with the right taxonomy code in the report.
    const staleRes = await request.get(`${SECURITY_API_URL}/api/pages/active`, {
      headers: { Authorization: `Bearer ${session.accessToken}` }
    });
    expect(staleRes.status()).toBe(401);
  });

  test('TC-E2E-009 — Duplicate-prevention consistency between admin-created and self-registered users', async ({
    page,
    request
  }) => {
    // Deliberately NOT loginAsAdmin(page, ...) here — that seeds an authenticated
    // session into `page`'s localStorage, and SignUpComponent's constructor redirects
    // an already-logged-in user straight to /dashboard, so the signup form below would
    // never render. `api(request)` only touches the API request context, not `page`.
    const apiClient = await api(request);
    const username = `pwteste2e009${uniq()}`.toLowerCase();

    // 1. Admin-create a user.
    const createRes = await apiClient.post('/api/users', { username, password: 'Passw0rd1' });
    expect(createRes.status()).toBeLessThan(300);

    // 2. Attempt Signup with the same username via the real UI.
    const signUpPage = new SignUpPage(page);
    await signUpPage.goto();
    await signUpPage.fillForm(username, `${username}@pwtest.example.com`, 'Passw0rd1');
    const signupRes = page.waitForResponse((r) => r.url().includes('/api/auth/signup') && r.request().method() === 'POST');
    await signUpPage.submit();
    const res = await signupRes;
    expect(res.status()).toBe(409);
    const body = await res.json().catch(() => null);
    if (body?.error?.code) expect(body.error.code).toBe('SIGNUP_USERNAME_ALREADY_EXISTS');
    await signUpPage.expectSubmitError();
  });
});
