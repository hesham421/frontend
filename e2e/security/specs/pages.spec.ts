import { test, expect } from '@playwright/test';
import { PagesRegistryPage } from '../pages/PagesRegistryPage';
import { loginAsAdmin, fetchAdminSession } from '../support/auth';
import { SecurityApiClient } from '../support/api-client';

const uniq = () => Date.now().toString(36).toUpperCase().slice(-8);

test.describe('TC-PAGE — Page Management', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginAsAdmin(page, request);
  });

  test('TC-PAGE-001 — Create Page happy path (real UI form)', async ({ page }) => {
    const pagesPage = new PagesRegistryPage(page);
    // pageCode must match the FORM's own client-side pattern (^[A-Z][A-Z0-9_]*$) and
    // route must match ^\/[a-z0-9\-\/]*$ (no underscore, no uppercase) — both stricter
    // than the backend accepts (see TC-PAGE-002 below). uniq() is already uppercase
    // base36, so it's pattern-safe for pageCode; route needs a lowercase variant.
    const suffix = uniq();
    const code = `PWTEST${suffix}`;
    const route = `/pwtest/${suffix.toLowerCase()}`;
    await pagesPage.gotoCreate();
    await pagesPage.fillForm({ pageCode: code, nameEn: 'PW Test Page', nameAr: 'صفحة اختبار', route, displayOrder: 1 });
    const createRes = page.waitForResponse((r) => r.url().includes('/api/pages') && r.request().method() === 'POST');
    await pagesPage.save();
    const res = await createRes;
    expect(res.status()).toBeLessThan(300);
    const body = await res.json();
    expect(body.data.pageCode).toBe(code);
    // permissionKeys is an OBJECT ({VIEW: "PERM_X_VIEW", ...}), not an array — doc implied a list.
    expect(Object.keys(body.data.permissionKeys ?? {}).sort()).toEqual(['CREATE', 'DELETE', 'UPDATE', 'VIEW']);
    // Not re-checking the list grid here: the create API response above already fully
    // confirms the write; scanning the grid for one row among 200+ accumulated test
    // pages with no working client-side filter (see TC-PAGE-007/008/009 note) would
    // just be flaky, not more thorough.
  });

  test('TC-PAGE-002 — pageCode normalized to uppercase (API — form blocks lowercase entirely)', async ({ request }) => {
    // FINDING: the Create Page FORM's pageCode field has a client-side
    // Validators.pattern(/^[A-Z][A-Z0-9_]*$/) — typing a lowercase pageCode leaves the
    // control invalid and the Save button permanently disabled (confirmed: it never
    // becomes enabled). A real user can never submit a lowercase pageCode through this
    // screen, so the backend's documented uppercase-normalization behavior is
    // unreachable via the UI. Testing at the API level, which is the only way this
    // documented behavior is actually exercised in practice.
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const code = `pwtest_${uniq()}`.toLowerCase();
    const res = await api.post('/api/pages', { pageCode: code, nameEn: 'PW Test Page', nameAr: 'صفحة اختبار', route: `/pwtest/${code}`, displayOrder: 1 });
    expect(res.status()).toBeLessThan(300);
    const body = await res.json();
    expect(body.data.pageCode).toBe(code.toUpperCase());
  });

  test('TC-PAGE-004 — Get Page by ID not found', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const res = await api.get('/api/pages/999999999');
    expect(res.status()).toBe(404);
  });

  test('TC-PAGE-005/006 — Update Page, pageCode immutable', async ({ page, request }) => {
    // FINDING (VALIDATION_FAILURE, HIGH severity, CONFIRMED REAL BUG): PUT
    // /api/pages/{id} rejects every request as `400 INVALID_JSON` ("Malformed JSON.
    // Please check the request body syntax."), even for a syntactically valid,
    // plain-ASCII JSON body matching the documented UpdatePageRequest shape exactly
    // (e.g. {"nameAr":"test","nameEn":"Updated Name","route":"/x","displayOrder":1,
    // "active":true}). Reproduced two independent ways: (1) driving the real Edit Page
    // screen and capturing the exact bytes sent via Playwright's request/response
    // listeners — the app's own serialized body is valid JSON; (2) a raw `curl -X PUT`
    // with an identical hand-written body against the live backend, no browser
    // involved. POST /api/pages (create) works fine with the same field set — this is
    // isolated to the PUT update endpoint specifically. Effectively: Update Page is
    // completely broken end-to-end, for every real user, not a test artifact. Asserting
    // the real (broken) behavior below so this fails loudly; do not "fix" the test to
    // tolerate it — that's a Fixing Agent job, not a test-writing one.
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const suffix = uniq();
    const code = `PWTEST${suffix}`;
    // route must satisfy the FORM's own pattern (^\/[a-z0-9\-\/]*$ — no underscore, no
    // uppercase) once loaded into the edit screen, even though the backend itself
    // accepts underscores/uppercase in routes (confirmed via curl) — same class of
    // "frontend validator stricter than backend" gap as TC-PAGE-002.
    const routeSlug = suffix.toLowerCase();
    const createRes = await api.post('/api/pages', { pageCode: code, nameEn: 'Orig', nameAr: 'اصل', route: `/pwtest/${routeSlug}`, displayOrder: 1 });
    const created = (await createRes.json()).data;

    const pagesPage = new PagesRegistryPage(page);
    await pagesPage.gotoEdit(created.id);
    await page.locator('#nameEn input').fill('Updated Name');
    await page.locator('#route input').fill(`/pwtest/${routeSlug}/updated`);
    const updateRes = page.waitForResponse((r) => r.url().includes(`/api/pages/${created.id}`) && r.request().method() === 'PUT');
    await pagesPage.save();
    const res = await updateRes;
    const body = await res.json();
    expect(res.status(), `expected 2xx, got ${res.status()}: ${JSON.stringify(body)}`).toBeLessThan(300);
    expect(body.data.nameEn).toBe('Updated Name');
    expect(body.data.pageCode).toBe(code); // unchanged
  });

  test('TC-PAGE-007/008/009 — Deactivate / Reactivate / double-deactivate idempotency', async ({ request }) => {
    // SCOPE NOTE: driven via API (PUT .../deactivate /.../reactivate — the doc's actual
    // target endpoints), not the list's row toggle button. The pages table has 200+ rows
    // from accumulated test data (no delete endpoint, per doc §13) and the grid has no
    // working client-side filter — ERP_DEFAULT_COL_DEF sets floatingFilter:true but no
    // column specifies a `filter` type, so AG-Grid never renders the floating-filter row;
    // the only working filter is the "Advanced Filters" panel, which uses custom
    // avl-select dropdowns not yet automated in this suite. Scanning the default
    // (paginated, 20/page) grid for one specific new row is unreliably flaky at this
    // scale. The toggle button itself was verified to exist with the right aria-label
    // (via PagesRegistryPage.clickToggleActive, kept for smaller-dataset scenarios).
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const code = `PWTEST_${uniq()}`;
    const createRes = await api.post('/api/pages', { pageCode: code, nameEn: 'ToggleMe', nameAr: 'تبديل', route: `/pwtest/${code}`, displayOrder: 1 });
    const created = (await createRes.json()).data;

    const deactivateRes = await api.put(`/api/pages/${created.id}/deactivate`);
    expect(deactivateRes.status()).toBeLessThan(300);
    expect((await deactivateRes.json()).data.active).toBe(false);

    // TC-PAGE-009: deactivate again (already-deactivated) — observe.
    const second = await api.put(`/api/pages/${created.id}/deactivate`);
    console.log('TC-PAGE-009 double-deactivate observed status:', second.status());

    const reactivateRes = await api.put(`/api/pages/${created.id}/reactivate`);
    expect(reactivateRes.status()).toBeLessThan(300);
    expect((await reactivateRes.json()).data.active).toBe(true);
  });

  test('TC-PAGE-010 — Get Active Pages excludes deactivated', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const code = `PWTEST_${uniq()}`;
    const created = (await (await api.post('/api/pages', { pageCode: code, nameEn: 'X', nameAr: 'Y', route: `/pwtest/${code}` })).json()).data;
    await api.put(`/api/pages/${created.id}/deactivate`);

    const activeRes = await api.get('/api/pages/active');
    const activeBody = await activeRes.json();
    const codes: string[] = (activeBody.data ?? []).map((p: { pageCode: string }) => p.pageCode);
    expect(codes).not.toContain(code);
  });

  test('TC-PAGE-011/012/013/014 — Search: no filters, filter pageCode, sort, pagination', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const noFilter = await api.post('/api/pages/search', { filters: [], sorts: [] });
    expect(noFilter.status()).toBe(200);
    const noFilterBody = await noFilter.json();
    expect(noFilterBody.data.content).toBeDefined();
    expect(typeof noFilterBody.data.number).toBe('number'); // TC-XCUT-005 pagination field name

    const code = `PWTEST_${uniq()}`;
    await api.post('/api/pages', { pageCode: code, nameEn: 'FilterMe', nameAr: 'ف', route: `/pwtest/${code}` });
    const filtered = await api.post('/api/pages/search', { filters: [{ field: 'pageCode', operator: 'EQ', value: code }] });
    const filteredBody = await filtered.json();
    expect(filteredBody.data.content.some((p: { pageCode: string }) => p.pageCode === code)).toBe(true);

    const sorted = await api.post('/api/pages/search', { filters: [], sorts: [{ field: 'nameEn', direction: 'DESC' }] });
    expect(sorted.status()).toBe(200);

    const paged = await api.post('/api/pages/search', { filters: [], page: 1, size: 5 });
    const pagedBody = await paged.json();
    expect(pagedBody.data.number).toBe(1);
    expect(pagedBody.data.size).toBe(5);
    expect(pagedBody.data.content.length).toBeLessThanOrEqual(5);
  });

  test('TC-PAGE-015 — Create Page omit required nameEn (exploratory)', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const res = await api.post('/api/pages', { pageCode: `PWTEST_${uniq()}`, nameAr: 'ا', route: '/pwtest/x' });
    console.log('TC-PAGE-015 observed status:', res.status());
    expect(res.status()).toBe(400);
  });

  test('TC-PAGE-016/017 — pageCode boundary at/over maxLength 50', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    // Build with the unique suffix at the END, not truncated off — the previous
    // version sliced the padded string from the front, discarding the entropy-bearing
    // suffix and keeping only a stable 'A'-repeat prefix, which collided (409) across
    // back-to-back runs. `uniq()` is 8 chars, so 42 'A's + 8-char suffix = exactly 50.
    const suffix = uniq();
    const at50 = 'A'.repeat(50 - suffix.length) + suffix; // exactly 50 chars, unique
    expect(at50.length).toBe(50);
    const ok = await api.post('/api/pages', { pageCode: at50, nameEn: 'N', nameAr: 'ا', route: `/pwtest/at50/${suffix}` });
    expect(ok.status()).toBeLessThan(300);

    const suffix2 = uniq();
    const over51 = 'B'.repeat(51 - suffix2.length) + suffix2; // exactly 51 chars, unique
    expect(over51.length).toBe(51);
    const over = await api.post('/api/pages', { pageCode: over51, nameEn: 'N', nameAr: 'ا', route: `/pwtest/over51/${suffix2}` });
    console.log('TC-PAGE-017 observed status:', over.status());
  });

  test('TC-PAGE-019 — Create Page duplicate pageCode', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const code = `PWTEST_${uniq()}`;
    await api.post('/api/pages', { pageCode: code, nameEn: 'N', nameAr: 'ا', route: `/pwtest/${code}/1` });
    const dup = await api.post('/api/pages', { pageCode: code, nameEn: 'N2', nameAr: 'ا2', route: `/pwtest/${code}/2` });
    console.log('TC-PAGE-019 observed status:', dup.status());
    expect(dup.status()).toBe(409);
  });

  test('TC-PAGE-021 — Auto-generated permissions exist after Create', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const code = `PWTEST_${uniq()}`;
    const created = (await (await api.post('/api/pages', { pageCode: code, nameEn: 'N', nameAr: 'ا', route: `/pwtest/${code}` })).json()).data;

    // FINDING (CONTRACT_BREAK): doc says filter by `pageId`, but /api/permissions/search
    // rejects both `pageId` and `pageCode` outright ("Field 'pageId' is not allowed for
    // searching", confirmed via curl) — only `name`/`module` are filterable, and the
    // generated permission names embed the pageCode (`PERM_<PAGECODE>_<TYPE>`), so
    // `name LIKE <pageCode>` is the only working equivalent.
    const permRes = await api.post('/api/permissions/search', { filters: [{ field: 'name', operator: 'LIKE', value: code }] });
    expect(permRes.status()).toBe(200);
    const permBody = await permRes.json();
    const types = (permBody.data.content ?? []).map((p: { permissionType?: string }) => p.permissionType);
    for (const t of ['VIEW', 'CREATE', 'UPDATE', 'DELETE']) {
      expect(types).toContain(t);
    }
  });

  test('TC-PAGE-022 — Unauthorized, no token', async ({ request }) => {
    const session = await fetchAdminSession(request);
    const api = new SecurityApiClient(request, session);
    const res = await api.unauthenticated().get('/api/pages/active');
    expect(res.status()).toBe(401);
  });
});
