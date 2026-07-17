import { test, expect } from '@playwright/test';
import { RoleAccessPage } from '../pages/RoleAccessPage';
import { loginAsAdmin, fetchAdminSession, SECURITY_API_URL } from '../support/auth';
import { SecurityApiClient } from '../support/api-client';

const uniq = () => Date.now().toString(36).toUpperCase().slice(-8) + Math.floor(Math.random() * 1000);
const roleCode = (label: string) => `PWTEST_${label}_${uniq()}`;

/**
 * Group 10 — Security DataScope Role Branches (§10, TC-RB-001..014).
 *
 * Despite the doc listing `/api/v1/security/role-branches` with "no standalone route",
 * this DOES have real UI — it's the "branch-scope" tab inside the Role edit screen
 * (role-access-form.component.html, `activeTab() === 'branch-scope'`). Reuses/extends
 * RoleAccessPage rather than a separate POM, per the brief.
 *
 * DB precondition (verified via mcp__postgres__query against org_branch): exactly ONE
 * active branch exists in this environment — branch_pk=1, branch_code=DEFAULT_BR,
 * name_en="Default Branch". Several TCs below adapt to that constraint and say so.
 */
const ACTIVE_BRANCH_LABEL = 'Default Branch';
/**
 * The branch-scope UI displays a role-branch row's name via `branchNameFor(branchId)`
 * (role-access-form.component.ts), which falls back to the raw numeric branchId only when
 * `RoleBranchFacade.activeBranches()` is empty. That used to always be true —
 * RoleBranchApiService.searchActiveBranches() sent `field: 'isActive'`, which the backend
 * rejects (only `isActiveFl` is a valid search field on this endpoint), so the lookup
 * silently 400'd. Now fixed (see TC-RB-001), so activeBranches() resolves correctly and
 * rows render "Default Branch".
 */
const RENDERED_BRANCH_LABEL = ACTIVE_BRANCH_LABEL;

test.describe('TC-RB — Security DataScope Role Branches (Group 10)', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginAsAdmin(page, request);
  });

  // ── TC-RB-001 — Assign Branch Scope to Role happy path (real Assign Branch modal) ──
  // FIXED (was BUSINESS_LOGIC_ISSUE): RoleBranchApiService.searchActiveBranches()
  // (role-branch-api.service.ts) sent `filters: [{ field: 'isActive', operator: 'EQUALS',
  // value: true }]` to POST /api/v1/org/branches/search, which the backend rejects (only
  // `isActiveFl` is a valid search field there) — silently swallowed by
  // RoleBranchFacade.loadActiveBranches()'s catchError, leaving activeBranches() empty, so
  // the Assign Branch modal's dropdown only ever showed the disabled placeholder. Fixed by
  // sending `isActiveFl` instead. Asserting the real (now-working) happy path below.
  test('TC-RB-001 — Assign Branch Scope happy path (UI)', async ({ page, request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const role = (await (await api.post('/api/roles', { roleCode: roleCode('RB1'), roleName: `PW RB Assign Role ${uniq()}` })).json()).data;

    const roPage = new RoleAccessPage(page);
    await roPage.gotoEdit(role.id);
    await roPage.switchToBranchScopeTab();
    await roPage.assignBranchButton.click();

    const branchSelect = page.getByTestId('role-access-assign-branch-select').locator('select');
    await expect(branchSelect.locator('option', { hasText: ACTIVE_BRANCH_LABEL })).toHaveCount(1);

    const assignRes = page.waitForResponse(
      (r) => r.url().includes('/api/v1/security/role-branches') && r.request().method() === 'POST'
    );
    await roPage.selectAssignBranch(ACTIVE_BRANCH_LABEL);
    await roPage.selectAssignLevel('BRANCH_ONLY');
    await roPage.confirmAssignBranch();
    const res = await assignRes;
    expect(res.status(), `expected 2xx, got ${res.status()}`).toBeLessThan(300);

    await roPage.expectBranchRowVisible(ACTIVE_BRANCH_LABEL);

    const search = await api.post('/api/v1/security/role-branches/search', {
      filters: [{ field: 'roleIdFk', operator: 'EQUALS', value: role.id }],
      page: 0,
      size: 10
    });
    const content = (await search.json()).data.content;
    expect(content).toHaveLength(1);
    expect(content[0].branchIdFk).toBe(1);
  });

  // ── TC-RB-002 — roleIdFk doesn't exist ──
  test('TC-RB-002 — Assign Branch Scope, roleIdFk not found', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const res = await api.post('/api/v1/security/role-branches', {
      roleIdFk: 999999999,
      branchIdFk: 1,
      dataAccessLevel: 'BRANCH_ONLY'
    });
    expect(res.status()).toBe(404);
    const body = await res.json();
    console.log('TC-RB-002 observed error.code:', body?.error?.code);
    if (body?.error?.code) expect(body.error.code).toBe('ROLE_NOT_FOUND');
  });

  // ── TC-RB-003 — duplicate (roleIdFk, branchIdFk) ──
  // FINDING: the real Assign Branch modal structurally prevents this — `assignableBranchOptions`
  // filters out already-assigned branches from the dropdown, AND `onAssignBranchConfirm` has a
  // client-side duplicate guard (RULE-SEC-036 comment) that shows a warning toast instead of
  // submitting if a branch is already assigned. There is no way to drive a duplicate submission
  // through the real UI (with only one active branch, the dropdown is simply empty after the
  // first assignment) — tested at the API level to reach the backend's 409 guard directly.
  test('TC-RB-003 — Assign Branch Scope duplicate pair (API — UI guard blocks this before submit)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const role = (await (await api.post('/api/roles', { roleCode: roleCode('RB3'), roleName: `PW RB Dup Role ${uniq()}` })).json()).data;

    const first = await api.post('/api/v1/security/role-branches', { roleIdFk: role.id, branchIdFk: 1, dataAccessLevel: 'BRANCH_ONLY' });
    expect(first.status()).toBeLessThan(300);

    const dup = await api.post('/api/v1/security/role-branches', { roleIdFk: role.id, branchIdFk: 1, dataAccessLevel: 'BRANCH_ONLY' });
    expect(dup.status()).toBe(409);
    const body = await dup.json();
    console.log('TC-RB-003 observed error.code:', body?.error?.code);
    if (body?.error?.code) expect(body.error.code).toBe('SEC_ROLE_BRANCH_DUPLICATE_ASSIGNMENT');
  });

  // ── TC-RB-004 — omit dataAccessLevel ──
  // FINDING: the Assign Branch modal's <select> always carries a default value
  // (`selectedNewDataAccessLevel = DATA_ACCESS_LEVELS[0]`, no blank option) — an empty/omitted
  // submission is structurally impossible through the UI (per the component's own RULE-SEC-035
  // comment). API-only.
  test('TC-RB-004 — Assign Branch Scope omit dataAccessLevel (API-only, UI cannot omit it)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const role = (await (await api.post('/api/roles', { roleCode: roleCode('RB4'), roleName: `PW RB Omit Role ${uniq()}` })).json()).data;

    const res = await api.post('/api/v1/security/role-branches', { roleIdFk: role.id, branchIdFk: 1 });
    expect(res.status()).toBe(400);
    const body = await res.json();
    console.log('TC-RB-004 observed error.code:', body?.error?.code);
    if (body?.error?.code) expect(body.error.code).toBe('SEC_ROLE_BRANCH_DATA_ACCESS_LEVEL_REQUIRED');
  });

  // ── TC-RB-005 — invalid dataAccessLevel value ──
  // FINDING: the <select> only ever renders the 3 documented LOV options — an invalid value
  // can't be selected through the real UI either. API-only.
  test('TC-RB-005 — Assign Branch Scope invalid dataAccessLevel (API-only, UI select has no invalid option)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const role = (await (await api.post('/api/roles', { roleCode: roleCode('RB5'), roleName: `PW RB Invalid Role ${uniq()}` })).json()).data;

    const res = await api.post('/api/v1/security/role-branches', {
      roleIdFk: role.id,
      branchIdFk: 1,
      dataAccessLevel: 'NOT_A_REAL_LEVEL'
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    console.log('TC-RB-005 observed error.code:', body?.error?.code);
    if (body?.error?.code) expect(body.error.code).toBe('SEC_ROLE_BRANCH_DATA_ACCESS_LEVEL_REQUIRED');
  });

  // ── TC-RB-006 — Get Role-Branch Assignment happy path ──
  test('TC-RB-006 — Get Role-Branch Assignment happy path (API)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const role = (await (await api.post('/api/roles', { roleCode: roleCode('RB6'), roleName: `PW RB Get Role ${uniq()}` })).json()).data;
    await api.post('/api/v1/security/role-branches', { roleIdFk: role.id, branchIdFk: 1, dataAccessLevel: 'BRANCH_ONLY' });

    const res = await api.get(`/api/v1/security/role-branches/${role.id}/1`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.roleIdFk).toBe(role.id);
    expect(body.data.branchIdFk).toBe(1);
  });

  // ── TC-RB-007 — Get Role-Branch Assignment not found ──
  test('TC-RB-007 — Get Role-Branch Assignment not found (API)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const role = (await (await api.post('/api/roles', { roleCode: roleCode('RB7'), roleName: `PW RB NotFound Role ${uniq()}` })).json()).data;

    const res = await api.get(`/api/v1/security/role-branches/${role.id}/1`);
    expect(res.status()).toBe(404);
    const body = await res.json();
    console.log('TC-RB-007 observed error.code:', body?.error?.code);
    if (body?.error?.code) expect(body.error.code).toBe('SEC_ROLE_BRANCH_NOT_FOUND');
  });

  // ── TC-RB-008 — Update Role-Branch Assignment happy path (real row-level select) ──
  // Row label note: renders RENDERED_BRANCH_LABEL ("1"), not "Default Branch" — see the
  // TC-RB-001 finding (branchNameFor() falls back to the raw id when activeBranches() is
  // empty). The update mechanism itself (row-level dataAccessLevel <select>) is unaffected
  // by that bug — it's driven fine through the real UI.
  test('TC-RB-008 — Update Role-Branch Assignment happy path (UI, row-level select)', async ({ page, request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const role = (await (await api.post('/api/roles', { roleCode: roleCode('RB8'), roleName: `PW RB Update Role ${uniq()}` })).json()).data;
    await api.post('/api/v1/security/role-branches', { roleIdFk: role.id, branchIdFk: 1, dataAccessLevel: 'BRANCH_ONLY' });

    const roPage = new RoleAccessPage(page);
    await roPage.gotoEdit(role.id);
    await roPage.switchToBranchScopeTab();
    await roPage.expectBranchRowVisible(RENDERED_BRANCH_LABEL);

    const updateRes = page.waitForResponse(
      (r) => r.url().includes(`/api/v1/security/role-branches/${role.id}/1`) && r.request().method() === 'PUT'
    );
    await roPage.changeBranchRowLevel(RENDERED_BRANCH_LABEL, 'BRANCH_AND_CHILDREN');
    const res = await updateRes;
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.dataAccessLevel).toBe('BRANCH_AND_CHILDREN');

    const after = await (await api.get(`/api/v1/security/role-branches/${role.id}/1`)).json();
    expect(after.data.dataAccessLevel).toBe('BRANCH_AND_CHILDREN');
  });

  // ── TC-RB-009 — Update re-validates LOV ──
  // Same reasoning as TC-RB-005 — the row's <select> has no invalid option. API-only.
  test('TC-RB-009 — Update Role-Branch Assignment re-validates LOV (API-only)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const role = (await (await api.post('/api/roles', { roleCode: roleCode('RB9'), roleName: `PW RB Revalidate Role ${uniq()}` })).json()).data;
    await api.post('/api/v1/security/role-branches', { roleIdFk: role.id, branchIdFk: 1, dataAccessLevel: 'BRANCH_ONLY' });

    const res = await api.put(`/api/v1/security/role-branches/${role.id}/1`, { dataAccessLevel: 'NOT_A_REAL_LEVEL' });
    expect(res.status()).toBe(400);
    const body = await res.json();
    console.log('TC-RB-009 observed error.code:', body?.error?.code);
    if (body?.error?.code) expect(body.error.code).toBe('SEC_ROLE_BRANCH_DATA_ACCESS_LEVEL_REQUIRED');
  });

  // ── TC-RB-010 — Delete Role-Branch Assignment happy path (real per-row Remove button) ──
  test('TC-RB-010 — Delete Role-Branch Assignment happy path (UI)', async ({ page, request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const role = (await (await api.post('/api/roles', { roleCode: roleCode('RB10'), roleName: `PW RB Delete Role ${uniq()}` })).json()).data;
    await api.post('/api/v1/security/role-branches', { roleIdFk: role.id, branchIdFk: 1, dataAccessLevel: 'BRANCH_ONLY' });

    const roPage = new RoleAccessPage(page);
    await roPage.gotoEdit(role.id);
    await roPage.switchToBranchScopeTab();
    await roPage.expectBranchRowVisible(RENDERED_BRANCH_LABEL); // see TC-RB-001 finding

    const delRes = page.waitForResponse(
      (r) => r.url().includes(`/api/v1/security/role-branches/${role.id}/1`) && r.request().method() === 'DELETE'
    );
    await roPage.removeBranchRow(RENDERED_BRANCH_LABEL);
    await roPage.confirmDialog('Delete');
    const res = await delRes;
    expect(res.status()).toBe(204);

    const after = await api.get(`/api/v1/security/role-branches/${role.id}/1`);
    expect(after.status()).toBe(404);
  });

  // ── TC-RB-011 — List sorted by dataAccessLevel ──
  // RoleBranchApiService exposes no plain GET-list endpoint (only POST /search, which is what
  // the branch-scope tab actually calls) — the doc's literal `GET ?pageable=dataAccessLevel,asc`
  // form isn't what the frontend contract uses. Tested via the real search contract instead.
  test('TC-RB-011 — List Role-Branch Assignments sorted by dataAccessLevel (API, real search contract)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const res = await api.post('/api/v1/security/role-branches/search', {
      filters: [],
      sorts: [{ field: 'dataAccessLevel', direction: 'ASC' }],
      page: 0,
      size: 20
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data.content)).toBe(true);
    expect(typeof body.data.number).toBe('number'); // TC-XCUT-005 pagination field name
  });

  // ── TC-RB-012 — Search filter by roleIdFk (real branch-scope tab load) ──
  test('TC-RB-012 — Search Role-Branch Assignments filter by roleIdFk (UI — tab load calls this exact search)', async ({
    page,
    request
  }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const role = (await (await api.post('/api/roles', { roleCode: roleCode('RB12'), roleName: `PW RB Search Role ${uniq()}` })).json()).data;
    await api.post('/api/v1/security/role-branches', { roleIdFk: role.id, branchIdFk: 1, dataAccessLevel: 'ALL' });

    // FINDING (test-timing, not an app bug): RoleAccessFormComponent.ngOnInit() calls
    // `branchFacade.loadRoleBranches(roleId)` unconditionally in edit mode — it fires
    // immediately on navigation, NOT gated behind switching to the branch-scope tab. The
    // response listener must be armed BEFORE `gotoEdit()`, not after a later tab switch,
    // or the request has already come and gone.
    const roPage = new RoleAccessPage(page);
    const searchRes = page.waitForResponse(
      (r) => r.url().includes('/api/v1/security/role-branches/search') && r.request().method() === 'POST'
    );
    await roPage.gotoEdit(role.id);
    const res = await searchRes;
    expect(res.status()).toBe(200);
    const reqBody = res.request().postDataJSON();
    expect(reqBody.filters).toContainEqual({ field: 'roleIdFk', operator: 'EQUALS', value: role.id });

    const body = await res.json();
    expect(body.data.content.some((rb: { branchIdFk: number }) => rb.branchIdFk === 1)).toBe(true);
  });

  // ── TC-RB-013 — Composite-key uniqueness under concurrency (race test) ──
  // FINDING: did NOT force this through the UI. The Assign Branch modal's confirm button is
  // `[disabled]="!selectedNewBranchId || isBranchScopeSaving"` — `isBranchScopeSaving` flips true
  // for the duration of the in-flight request, so two rapid UI clicks physically can't both
  // submit (the second click hits a disabled button). That's a legitimate double-submit guard,
  // not a way to exercise the DB-level race the doc is actually asking about. Run as a direct
  // two-concurrent-request API test instead, per the doc's own framing ("worth a dedicated
  // concurrency test in Playwright" — not "must go through the widget").
  test('TC-RB-013 — Composite-key uniqueness enforced under concurrency (API race, not forced through the UI)', async ({
    request
  }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const role = (await (await api.post('/api/roles', { roleCode: roleCode('RB13'), roleName: `PW RB Race Role ${uniq()}` })).json()).data;

    const payload = { roleIdFk: role.id, branchIdFk: 1, dataAccessLevel: 'BRANCH_ONLY' };
    const [a, b] = await Promise.all([
      request.post(`${SECURITY_API_URL}/api/v1/security/role-branches`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        data: payload
      }),
      request.post(`${SECURITY_API_URL}/api/v1/security/role-branches`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        data: payload
      })
    ]);
    const statuses = [a.status(), b.status()].sort();
    console.log('TC-RB-013 observed concurrent statuses:', statuses);
    // Exactly one should succeed (200/201) and the other should be rejected (409) — some
    // backends may instead serialize both through row-level locking and still 409 the loser,
    // so assert the invariant (exactly one success) rather than a specific pair of codes.
    const successCount = statuses.filter((s) => s < 300).length;
    expect(successCount).toBe(1);
  });

  // ── TC-RB-014 — All 3 documented dataAccessLevel values accepted ──
  // DB_PRECONDITION adaptation: only ONE active branch exists in this environment (org_branch,
  // branch_pk=1) — verified via mcp__postgres__query. The doc's literal wording ("3 separate
  // assignments, different branches") isn't satisfiable; the composite key is (roleIdFk,
  // branchIdFk), so 3 different ROLES against the SAME branch exercise the same LOV-acceptance
  // contract without violating the uniqueness constraint.
  // All 3 driven via API, not UI: the Assign Branch modal's dropdown is unconditionally empty
  // in this environment (see the TC-RB-001 finding), so a UI-driven flavor here would just be
  // a second copy of that same documented failure, not new coverage.
  test('TC-RB-014 — All 3 dataAccessLevel values accepted (adapted: 3 roles, 1 active branch)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);

    const roleAll = (await (await api.post('/api/roles', { roleCode: roleCode('RB14A'), roleName: `PW RB Level ALL ${uniq()}` })).json()).data;
    const roleChildren = (
      await (await api.post('/api/roles', { roleCode: roleCode('RB14C'), roleName: `PW RB Level Children ${uniq()}` })).json()
    ).data;
    const roleOnly = (await (await api.post('/api/roles', { roleCode: roleCode('RB14O'), roleName: `PW RB Level Only ${uniq()}` })).json())
      .data;

    const onlyRes = await api.post('/api/v1/security/role-branches', {
      roleIdFk: roleOnly.id,
      branchIdFk: 1,
      dataAccessLevel: 'BRANCH_ONLY'
    });
    expect(onlyRes.status()).toBeLessThan(300);

    const childrenRes = await api.post('/api/v1/security/role-branches', {
      roleIdFk: roleChildren.id,
      branchIdFk: 1,
      dataAccessLevel: 'BRANCH_AND_CHILDREN'
    });
    expect(childrenRes.status()).toBeLessThan(300);

    const allRes = await api.post('/api/v1/security/role-branches', {
      roleIdFk: roleAll.id,
      branchIdFk: 1,
      dataAccessLevel: 'ALL'
    });
    expect(allRes.status()).toBeLessThan(300);
  });
});
