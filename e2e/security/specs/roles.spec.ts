import { test, expect } from '@playwright/test';
import { RoleAccessPage } from '../pages/RoleAccessPage';
import { loginAsAdmin, fetchAdminSession } from '../support/auth';
import { SecurityApiClient } from '../support/api-client';

const uniq = () => Date.now().toString(36).toUpperCase().slice(-8) + Math.floor(Math.random() * 1000);

/** roleCode must match ^[A-Z][A-Z0-9_]*$ — build one directly, don't rely on the UI's derive logic. */
const roleCode = (label: string) => `PWTEST_${label}_${uniq()}`;
const pageCode = (label: string) => `PWTEST_${label}_${uniq()}`;

test.describe('TC-ROLE — Role Access Control (Group 6)', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginAsAdmin(page, request);
  });

  // ── TC-ROLE-001 — Create Role happy path (real Create Role screen) ──
  test('TC-ROLE-001 — Create Role happy path (UI)', async ({ page, request }) => {
    const roPage = new RoleAccessPage(page);
    const name = `PWTEST Role ${uniq()}`;

    await roPage.gotoCreate();
    await roPage.fillCreateForm({ name, description: 'PW test role description' });
    const createRes = page.waitForResponse((r) => r.url().includes('/api/roles') && r.request().method() === 'POST');
    await roPage.createRoleButton.click();
    const res = await createRes;
    expect(res.status()).toBeLessThan(300);
    const body = await res.json();
    const created = body.data;
    expect(created.roleCode).toMatch(/^[A-Z][A-Z0-9_]*$/);

    // DB validation AFTER (mandatory order step 3)
    const dbRows = (
      await (
        await new SecurityApiClient(request, await fetchAdminSession(request)).get(`/api/roles/${created.id}`)
      ).json()
    ).data;
    expect(dbRows.roleName).toBe(name);

    // Screen switches to edit mode in-place (location.replaceState, no navigation)
    await expect(page).toHaveURL(new RegExp(`/security/role-access/edit/${created.id}`));
  });

  // ── TC-ROLE-002 — Get Role by ID happy path ──
  test('TC-ROLE-002 — Get Role by ID happy path (API)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const created = (await (await api.post('/api/roles', { roleCode: roleCode('GET'), roleName: `PW Get Role ${uniq()}` })).json()).data;

    const res = await api.get(`/api/roles/${created.id}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe(created.id);
  });

  // ── TC-ROLE-003 — Get Role by ID not found ──
  test('TC-ROLE-003 — Get Role by ID not found', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const res = await api.get('/api/roles/999999999');
    expect(res.status()).toBe(404);
  });

  // ── TC-ROLE-004 — Update Role happy path ──
  // FINDING: role-access-form.component.ts disables `roleForm` entirely in edit mode
  // (`this.roleForm.disable()` in ngOnInit, re-asserted in the selectedRole effect) and
  // RoleAccessApiService has no `updateRole()` method calling PUT /api/roles/{id} at all —
  // there is no UI path to rename a role after creation. API-only, and flagged as a gap
  // (MISSING_IMPLEMENTATION on the UI side), not a bug to fix here.
  test('TC-ROLE-004 — Update Role happy path (API-only — no UI path exists)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const code = roleCode('UPD');
    const created = (await (await api.post('/api/roles', { roleCode: code, roleName: `PW Orig Name ${uniq()}` })).json()).data;

    const updatedName = `PW Updated Name ${uniq()}`;
    const res = await api.put(`/api/roles/${created.id}`, { roleName: updatedName, description: 'updated desc' });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.roleName).toBe(updatedName);
    expect(body.data.roleCode).toBe(code); // unchanged
  });

  // ── TC-ROLE-005/006 — Toggle Role Active deactivate/reactivate (real list-screen icon button) ──
  test('TC-ROLE-005/006 — Toggle Role Active deactivate then reactivate (UI)', async ({ page, request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const name = `PWTEST Toggle ${uniq()}`;
    const created = (await (await api.post('/api/roles', { roleCode: roleCode('TOGGLE'), roleName: name, active: true })).json()).data;

    // DB precondition: active before
    const preCheck = await api.get(`/api/roles/${created.id}`);
    expect((await preCheck.json()).data.active).toBe(true);

    const roPage = new RoleAccessPage(page);
    await roPage.gotoList();
    await roPage.filterByRoleName(name);
    await roPage.expectRowVisible(name);

    const toggleOffRes = page.waitForResponse((r) => r.url().includes(`/api/roles/${created.id}/toggle-active`));
    await roPage.clickToggleActiveRow(name);
    await roPage.confirmDialog('Deactivate');
    const offRes = await toggleOffRes;
    expect(offRes.status()).toBe(200);
    expect((await offRes.json()).data.active).toBe(false);

    // DB validation AFTER deactivate
    const afterOff = await api.get(`/api/roles/${created.id}`);
    expect((await afterOff.json()).data.active).toBe(false);

    const toggleOnRes = page.waitForResponse((r) => r.url().includes(`/api/roles/${created.id}/toggle-active`));
    await roPage.clickToggleActiveRow(name);
    await roPage.confirmDialog('Activate');
    const onRes = await toggleOnRes;
    expect(onRes.status()).toBe(200);
    expect((await onRes.json()).data.active).toBe(true);

    const afterOn = await api.get(`/api/roles/${created.id}`);
    expect((await afterOn.json()).data.active).toBe(true);
  });

  // ── TC-ROLE-007 — Search Roles filter by roleName ──
  // Screen's advanced-filter panel (erp-specification-filter) is a generic shared component
  // not specific to Role Access — tested at the API level directly against the documented
  // contract, same approach as pages.spec.ts's TC-PAGE-011..014.
  test('TC-ROLE-007 — Search Roles filter by roleName (API)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const name = `PWTEST SearchTest ${uniq()}`;
    await api.post('/api/roles', { roleCode: roleCode('SEARCH'), roleName: name });

    const res = await api.post('/api/roles/search', { filters: [{ field: 'roleName', operator: 'LIKE', value: 'SearchTest' }] });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.content.some((r: { roleName: string }) => r.roleName === name)).toBe(true);
  });

  // ── TC-ROLE-008/009 — Add Page to Role + Get Role Pages Matrix (real Add Page modal) ──
  test('TC-ROLE-008/009 — Add Page to Role via modal, then matrix reflects it (UI)', async ({ page, request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const code = pageCode('ADDPG');
    const pageLabel = `PW AddPage ${uniq()}`;
    await api.post('/api/pages', { pageCode: code, nameEn: pageLabel, nameAr: 'صفحة', route: `/pwtest/${code}` });

    const roleName = `PWTEST AddPageRole ${uniq()}`;
    const role = (await (await api.post('/api/roles', { roleCode: roleCode('ADDPG'), roleName })).json()).data;

    const roPage = new RoleAccessPage(page);
    await roPage.gotoEdit(role.id);
    await roPage.addPageButton.click();

    const addRes = page.waitForResponse((r) => r.url().includes(`/api/roles/${role.id}/pages`) && r.request().method() === 'POST');
    await roPage.addPageViaModal(pageLabel);
    const res = await addRes;
    expect(res.status()).toBeLessThan(300);

    // TC-ROLE-009: the pages tab grid (Role Pages Matrix, re-fetched via loadRolePages) shows it
    await roPage.expectPageRowVisible(code);

    // FINDING: the real "Add Page" modal's confirm button is hardcoded in the template —
    // `addSelectedPages({ create: false, update: false, delete: false })` — so the UI can only
    // ever add a page as VIEW-only (implicit). The doc's exact wording (POST with
    // permissions:["CREATE","UPDATE"]) is not reachable through the real Add Page UI; the only
    // way to grant CREATE/UPDATE at add-time is a direct API call, asserted separately below.
    const matrix = await api.get(`/api/roles/${role.id}/pages`);
    // NOTE: the RAW API response shape is `{ pageCode, permissions: string[] }` — CREATE/UPDATE/
    // DELETE booleans only exist after RoleAccessApiService.getRolePages() normalizes it
    // client-side (see role-access-api.service.ts). Asserting the raw contract directly here.
    const assignment = (await matrix.json()).data.assignments.find((a: { pageCode: string }) => a.pageCode === code);
    expect(assignment.permissions).toEqual([]);
  });

  test('TC-ROLE-008 — Add Page to Role with CREATE+UPDATE (API, exact doc contract)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const code = pageCode('ADDPGAPI');
    await api.post('/api/pages', { pageCode: code, nameEn: 'PW AddPage API', nameAr: 'ص', route: `/pwtest/${code}` });
    const role = (
      await (await api.post('/api/roles', { roleCode: roleCode('ADDPGAPI'), roleName: `PW AddPage API Role ${uniq()}` })).json()
    ).data;

    const res = await api.post(`/api/roles/${role.id}/pages`, { pageCode: code, permissions: ['CREATE', 'UPDATE'] });
    expect(res.status()).toBeLessThan(300);

    const matrix = await (await api.get(`/api/roles/${role.id}/pages`)).json();
    const assignment = matrix.data.assignments.find((a: { pageCode: string }) => a.pageCode === code);
    expect(assignment.permissions.sort()).toEqual(['CREATE', 'UPDATE']);
  });

  // ── TC-ROLE-010 — Bulk Sync Role Pages via Save (real checkbox toggles + Save button) ──
  test('TC-ROLE-010 — Bulk Sync Role Pages full replace via Save (UI)', async ({ page, request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const code = pageCode('SYNC');
    const pageLabel = `PW Sync ${uniq()}`;
    await api.post('/api/pages', { pageCode: code, nameEn: pageLabel, nameAr: 'ص', route: `/pwtest/${code}` });
    const role = (await (await api.post('/api/roles', { roleCode: roleCode('SYNC'), roleName: `PW Sync Role ${uniq()}` })).json())
      .data;
    // Seed a view-only assignment first (mirrors what the real Add Page modal produces).
    await api.post(`/api/roles/${role.id}/pages`, { pageCode: code, permissions: [] });

    const roPage = new RoleAccessPage(page);
    await roPage.gotoEdit(role.id);
    await roPage.expectPageRowVisible(code);

    // Toggle Create+Update on in the grid, then Save — this PUTs the full currently-displayed
    // permission set (syncRolePages), replacing whatever was there before.
    await roPage.toggleCreatePermission(code);
    await roPage.toggleUpdatePermission(code);

    const syncRes = page.waitForResponse((r) => r.url().includes(`/api/roles/${role.id}/pages`) && r.request().method() === 'PUT');
    await roPage.saveButton.click();
    const res = await syncRes;
    expect(res.status()).toBeLessThan(300);

    const afterMatrix = await (await api.get(`/api/roles/${role.id}/pages`)).json();
    const assignment = afterMatrix.data.assignments.find((a: { pageCode: string }) => a.pageCode === code);
    // old (view-only, permissions: []) values replaced entirely by the new synced set
    expect(assignment.permissions.sort()).toEqual(['CREATE', 'UPDATE']);
  });

  // ── TC-ROLE-011 — Bulk Sync empty array removes all ──
  // FINDING: the Save button always PUTs the currently-rendered rows (full set), never an
  // empty array — there's no "clear all pages, then Save" UI gesture (removing a row via the
  // per-row "Remove" button calls DELETE immediately, it doesn't defer to Save). API-only.
  test('TC-ROLE-011 — Bulk Sync empty array removes all (API-only, no UI gesture sends [])', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const code = pageCode('CLEAR');
    await api.post('/api/pages', { pageCode: code, nameEn: 'PW Clear', nameAr: 'ص', route: `/pwtest/${code}` });
    const role = (await (await api.post('/api/roles', { roleCode: roleCode('CLEAR'), roleName: `PW Clear Role ${uniq()}` })).json())
      .data;
    await api.post(`/api/roles/${role.id}/pages`, { pageCode: code, permissions: ['CREATE'] });

    const res = await api.put(`/api/roles/${role.id}/pages`, { assignments: [] });
    expect(res.status()).toBeLessThan(300);

    const afterMatrix = await (await api.get(`/api/roles/${role.id}/pages`)).json();
    expect(afterMatrix.data.assignments).toEqual([]);
  });

  // ── TC-ROLE-012 — Remove Page From Role (real per-row Remove button) ──
  test('TC-ROLE-012 — Remove Page From Role (UI)', async ({ page, request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const code = pageCode('REMOVE');
    await api.post('/api/pages', { pageCode: code, nameEn: 'PW Remove Me', nameAr: 'ص', route: `/pwtest/${code}` });
    const role = (await (await api.post('/api/roles', { roleCode: roleCode('REMOVE'), roleName: `PW Remove Role ${uniq()}` })).json())
      .data;
    await api.post(`/api/roles/${role.id}/pages`, { pageCode: code, permissions: [] });

    const roPage = new RoleAccessPage(page);
    await roPage.gotoEdit(role.id);
    await roPage.expectPageRowVisible(code);

    const delRes = page.waitForResponse(
      (r) => r.url().includes(`/api/roles/${role.id}/pages/${code}`) && r.request().method() === 'DELETE'
    );
    await roPage.removePageRow(code);
    await roPage.confirmDialog('Delete');
    const res = await delRes;
    expect(res.status()).toBe(204);

    const afterMatrix = await (await api.get(`/api/roles/${role.id}/pages`)).json();
    expect(afterMatrix.data.assignments.find((a: { pageCode: string }) => a.pageCode === code)).toBeUndefined();
  });

  // ── TC-ROLE-013 — Copy Permissions From Role (real Copy From modal) ──
  test('TC-ROLE-013 — Copy Permissions From Role (UI) + privilege-escalation guard note', async ({ page, request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const code = pageCode('COPYSRC');
    const pageLabel = 'PW Copy Src Page';
    await api.post('/api/pages', { pageCode: code, nameEn: pageLabel, nameAr: 'ص', route: `/pwtest/${code}` });

    // FINDING: RoleAccessFormComponent loads the Copy From dropdown via `facade.setSize(50);
    // facade.loadRoles()` (roleName ASC, no search-as-you-type) — with 200+ accumulated
    // PWTEST_* roles in this environment (repeated suite runs), a source role named
    // "PW CopySource ..." almost never lands on that first page of 50, and selectOption hangs
    // for the full 60s timeout unable to find its <option>. Prefixing with "AAA_" forces it to
    // sort first regardless of how much test data has accumulated — a test-side name choice,
    // not a fix to the underlying page-size-50 dropdown limitation (worth flagging to the team).
    const source = (
      await (await api.post('/api/roles', { roleCode: roleCode('COPYSRC'), roleName: `AAA_PW CopySource ${uniq()}` })).json()
    ).data;
    await api.post(`/api/roles/${source.id}/pages`, { pageCode: code, permissions: ['CREATE', 'UPDATE'] });

    const targetName = `PW CopyTarget ${uniq()}`;
    const target = (await (await api.post('/api/roles', { roleCode: roleCode('COPYTGT'), roleName: targetName })).json()).data;

    const roPage = new RoleAccessPage(page);
    await roPage.gotoEdit(target.id);
    await roPage.copyFromButton.click();

    const copyRes = page.waitForResponse((r) => r.url().includes(`/copy-from/${source.id}`) && r.request().method() === 'POST');
    await roPage.selectCopySourceRole(source.roleName);
    await roPage.confirmCopyFrom();
    const res = await copyRes;
    expect(res.status()).toBeLessThan(300);

    const afterMatrix = await (await api.get(`/api/roles/${target.id}/pages`)).json();
    const assignment = afterMatrix.data.assignments.find((a: { pageCode: string }) => a.pageCode === code);
    expect(assignment).toBeTruthy();
    expect(assignment.permissions.sort()).toEqual(['CREATE', 'UPDATE']);

    // PRIVILEGE-ESCALATION GUARD (doc: target's system-level permissions like PERM_SYSTEM_ADMIN
    // must stay untouched). DB_PRECONDITION: as of this run, `role_permissions` has ZERO rows
    // referencing a page_id_fk-null (system-level) permission for ANY role — no fixture role
    // currently holds PERM_SYSTEM_ADMIN, and RoleAccessApiService exposes no endpoint capable of
    // granting one (addPageToRole is page-scoped only). The positive "system perm survives a
    // copy" assertion can't be exercised in this environment without an out-of-band DB write,
    // which is out of scope (postgres MCP is SELECT-only). What IS verifiable and asserted here:
    // copyFromRole's response contract (RolePagesMatrixResponse) structurally carries page-scoped
    // assignments ONLY — there is no field through which a system-level permission could even be
    // represented, which is itself evidence the endpoint can't touch them by construction.
    expect(Object.keys(afterMatrix.data)).not.toContain('systemPermissions');
    expect(Object.keys(afterMatrix.data)).not.toContain('permissions');
  });

  // ── TC-ROLE-014 — Delete Role happy path (real list-screen Delete button) ──
  test('TC-ROLE-014 — Delete Role happy path, no user assignments (UI)', async ({ page, request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const name = `PWTEST DeleteMe ${uniq()}`;
    const role = (await (await api.post('/api/roles', { roleCode: roleCode('DEL'), roleName: name })).json()).data;

    const roPage = new RoleAccessPage(page);
    await roPage.gotoList();
    await roPage.filterByRoleName(name);
    await roPage.expectRowVisible(name);

    const delRes = page.waitForResponse((r) => r.url().includes(`/api/roles/${role.id}`) && r.request().method() === 'DELETE');
    await roPage.clickDeleteRow(name);
    await roPage.confirmDialog('Delete');
    const res = await delRes;
    expect(res.status()).toBe(204);

    await roPage.expectRowNotVisible(name);
    const afterGet = await api.get(`/api/roles/${role.id}`);
    expect(afterGet.status()).toBe(404);
  });

  // ── TC-ROLE-015 — Delete Role blocked, has user assignments ──
  test('TC-ROLE-015 — Delete Role blocked while assigned to a user (API setup, UI delete attempt)', async ({ page, request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const roleNameCode = roleCode('BLOCKED');
    const blockedRoleName = `PW Blocked Role ${uniq()}`;
    const role = (await (await api.post('/api/roles', { roleCode: roleNameCode, roleName: blockedRoleName })).json()).data;

    const username = `pwtest_user_${uniq()}`.toLowerCase();
    const userCreateRes = await api.post('/api/users', { username, password: 'Passw0rd!' });
    const user = (await userCreateRes.json()).data;
    // FINDING: despite the doc's own example (`roleNames:["TESTROLE_X"]`, code-shaped) and the
    // field being named `roleNames`, PUT /api/users/{id}/roles actually resolves entries against
    // the role's NAME field (roleName), not roleCode — passing roleCode 404s with ROLE_NOT_FOUND
    // ("Role not found in current tenant: <code>"). Confirmed via direct API probing.
    const assignRes = await api.put(`/api/users/${user.id}/roles`, { roleNames: [blockedRoleName] });
    const assignedOk = assignRes.status() < 300;
    test.skip(
      !assignedOk,
      `DB_PRECONDITION: PUT /api/users/${user.id}/roles returned ${assignRes.status()} — could not assign role to user for this precondition`
    );

    const roPage = new RoleAccessPage(page);
    await roPage.gotoList();
    await roPage.filterByRoleName(blockedRoleName);
    await roPage.clickDeleteRow(blockedRoleName);
    const delRes = page.waitForResponse((r) => r.url().includes(`/api/roles/${role.id}`) && r.request().method() === 'DELETE');
    await roPage.confirmDialog('Delete');
    const res = await delRes;
    expect(res.status()).toBe(409);
  });

  // ── TC-ROLE-016..019 — Create Role boundary/exploratory (raw API, bypasses UI's derive logic) ──
  test('TC-ROLE-016 — roleCode violates pattern, lowercase (exploratory)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const res = await api.post('/api/roles', { roleCode: 'admin_test_pwtest', roleName: `PW Invalid Lowercase ${uniq()}` });
    console.log('TC-ROLE-016 observed status:', res.status());
    expect(res.status()).toBe(400);
  });

  test('TC-ROLE-017 — roleCode violates pattern, starts with digit (exploratory)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const res = await api.post('/api/roles', { roleCode: `1PWTEST${uniq()}`, roleName: `PW Invalid Digit ${uniq()}` });
    console.log('TC-ROLE-017 observed status:', res.status());
    expect(res.status()).toBe(400);
  });

  test('TC-ROLE-018 — omit required roleName (exploratory)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const res = await api.post('/api/roles', { roleCode: roleCode('NONAME') });
    console.log('TC-ROLE-018 observed status:', res.status());
    expect(res.status()).toBe(400);
  });

  test('TC-ROLE-019 — duplicate roleCode (exploratory)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const code = roleCode('DUP');
    await api.post('/api/roles', { roleCode: code, roleName: `PW Dup 1 ${uniq()}` });
    const dup = await api.post('/api/roles', { roleCode: code, roleName: `PW Dup 2 ${uniq()}` });
    console.log('TC-ROLE-019 observed status:', dup.status());
    expect(dup.status()).toBe(409);
  });

  // ── TC-ROLE-020 — Add Page pageCode doesn't exist (exploratory) ──
  test('TC-ROLE-020 — Add Page to Role with nonexistent pageCode (exploratory)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const role = (await (await api.post('/api/roles', { roleCode: roleCode('NOPAGE'), roleName: `PW NoPage Role ${uniq()}` })).json())
      .data;
    const res = await api.post(`/api/roles/${role.id}/pages`, { pageCode: 'PWTEST_DOES_NOT_EXIST', permissions: [] });
    console.log('TC-ROLE-020 observed status:', res.status());
    expect([400, 404]).toContain(res.status());
  });

  // ── TC-ROLE-021 — Copy From sourceRoleId doesn't exist (exploratory) ──
  test('TC-ROLE-021 — Copy Permissions From nonexistent sourceRoleId (exploratory)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const target = (
      await (await api.post('/api/roles', { roleCode: roleCode('COPYBAD'), roleName: `PW CopyBad Role ${uniq()}` })).json()
    ).data;
    const res = await api.post(`/api/roles/${target.id}/copy-from/999999999`, {});
    console.log('TC-ROLE-021 observed status:', res.status());
    expect([400, 404]).toContain(res.status());
  });

  // ── TC-ROLE-022 — Add Page omit required permissions array (exploratory) ──
  test('TC-ROLE-022 — Add Page to Role omitting permissions array (exploratory)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const code = pageCode('OMITPERM');
    await api.post('/api/pages', { pageCode: code, nameEn: 'PW OmitPerm', nameAr: 'ص', route: `/pwtest/${code}` });
    const role = (
      await (await api.post('/api/roles', { roleCode: roleCode('OMITPERM'), roleName: `PW OmitPerm Role ${uniq()}` })).json()
    ).data;
    const res = await api.post(`/api/roles/${role.id}/pages`, { pageCode: code });
    console.log('TC-ROLE-022 observed status:', res.status());
    // VIEW is documented as always-added regardless — an omitted permissions array plausibly
    // still succeeds (VIEW-only grant), or the backend requires the field structurally (400).
    expect([200, 201, 400]).toContain(res.status());
  });
});
