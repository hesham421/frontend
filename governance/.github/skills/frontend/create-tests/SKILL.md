---
name: create-tests
description: "Generates the test suite for a feature: Vitest unit tests for schemas and mappers, MSW-backed API contract tests, React Testing Library integration tests for list and entry flows, permission and auth scenarios, and Playwright specs for critical journeys. Step 2.9. Use when adding tests or reviewing coverage."
---

# Skill: create-tests

## Description
Generates tests at the right level and prevents the two failure modes that make suites worse
than useless: tests that assert implementation details, and tests so mocked they prove
nothing. Rules: `references/contract-rules.md` §R.11.

## When to Use
- Adding tests for a new or existing feature
- Reviewing whether coverage is meaningful
- A regression escaped and the gap needs closing

## When NOT to Use
- Testing `components/ui` internals — the design system has its own suite
- Testing the backend
- Chasing a coverage percentage; coverage is a signal, not a target

## Output

```
model/<entity>.schema.test.ts        unit — schema + mapper
api/<entity>Api.test.ts              contract — MSW
pages/<Entity>ListPage.test.tsx      integration
pages/<Entity>EntryPage.test.tsx     integration
e2e/<entity>.spec.ts                 Playwright
```

---

## What is tested at each level

| Level | Tool | Tests | Does NOT test |
|---|---|---|---|
| Unit | Vitest | Schemas, mappers, pure helpers, type guards | Rendering, network |
| Contract | Vitest + MSW | URL, method, body shape, envelope unwrapping, error mapping | UI |
| Integration | Vitest + RTL + MSW | A user completing a flow on a real router and QueryClient | Internal state, hook internals |
| E2E | Playwright | Critical journeys against a running stack | Every branch and edge case |

The integration level carries the weight. Unit tests catch mapping bugs cheaply, E2E catches
wiring, and everything in between — the part where most defects actually live — is
integration.

## Step 1 — Unit: schema and mapper (R.11.1)

```ts
it('omits the immutable natural key from the update request', () => {
  const values = BranchFormMapper.fromDto(branchFixture);
  expect(BranchFormMapper.toUpdateRequest(values)).not.toHaveProperty('code');
});

it('preserves a zero sort order', () => {                     // guards R.1.8
  const values = BranchFormMapper.fromDto({ ...branchFixture, sortOrder: 0 });
  expect(values.sortOrder).toBe(0);
});

it('rejects a lowercase code', () => {
  expect(branchFormSchema.safeParse({ ...valid, code: 'abc' }).success).toBe(false);
});
```

The zero-sort-order test exists because `||` versus `??` is a silent data bug that no type
check catches. Every rule that can fail silently deserves a test that names it.

## Step 2 — Contract: API against MSW (R.11.2)

```ts
const server = setupServer(
  http.post('*/api/organization/branches/search', async ({ request }) => {
    const body = await request.json();
    expect(body).toMatchObject({ page: 0, size: 20 });
    return HttpResponse.json({ data: pagedFixture });        // the envelope
  }),
);

it('unwraps the envelope and returns content', async () => {
  const page = await branchApi.search({ filters: [], sorts: [], page: 0, size: 20 });
  expect(page.content).toHaveLength(2);
});

it('throws a conflict ApiError carrying the backend code', async () => {
  server.use(http.post('*/branches', () =>
    HttpResponse.json({ errorCode: 'BRANCH_CODE_DUPLICATE' }, { status: 409 })));
  await expect(branchApi.create(req)).rejects.toMatchObject({ kind: 'conflict', errorCode: 'BRANCH_CODE_DUPLICATE' });
});
```

MSW intercepts at the network layer, so the real client runs — envelope unwrapping, error
normalisation, and header injection are all exercised. Stubbing `fetch` instead would skip
exactly the code most likely to be wrong (R.11.2).

## Step 3 — Integration: the list flow (R.11.4, R.11.3)

```tsx
function renderFeature(route = '/org/branches', session = fullAccessSession) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });  // R.11.10
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: [route] })} />
    </QueryClientProvider>,
  );
}

it('paginates and keeps the page in the URL', async () => {
  renderFeature();
  await screen.findByRole('cell', { name: 'HQ' });
  await userEvent.click(screen.getByRole('button', { name: /next page/i }));
  expect(await screen.findByRole('cell', { name: 'Branch 21' })).toBeInTheDocument();
  expect(window.location.search).toContain('page=1');
});

it('distinguishes an empty result from a filtered empty result', async () => {
  renderFeature('/org/branches?filters=code:contains:zzz');
  expect(await screen.findByText(/no matches/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
});
```

Queries are by role and accessible name. A test that finds an element by CSS class breaks on
a restyle and passes when the control is invisible to a screen reader — it measures the
wrong thing twice (R.11.3).

A fresh `QueryClient` per test with `retry: false` prevents cache bleed between tests and
stops a failure case from taking three retries to surface.

## Step 4 — Integration: the entry flow (R.11.4)

```tsx
it('switches to edit mode in place after creating', async () => {
  renderFeature('/org/branches/new');
  await userEvent.type(screen.getByLabelText(/code/i), 'NEW');
  await userEvent.click(screen.getByRole('button', { name: /save/i }));
  await waitFor(() => expect(window.location.pathname).toBe('/org/branches/42/edit'));
});

it('submits on Enter', async () => {                          // guards R.8.2
  renderFeature('/org/branches/new');
  await userEvent.type(screen.getByLabelText(/code/i), 'NEW{Enter}');
  await waitFor(() => expect(createSpy).toHaveBeenCalled());
});

it('places a server field error on the field and focuses it', async () => {
  server.use(http.post('*/branches', () =>
    HttpResponse.json({ fieldErrors: { code: 'validation.duplicate' } }, { status: 422 })));
  renderFeature('/org/branches/new');
  await userEvent.click(screen.getByRole('button', { name: /save/i }));
  const input = await screen.findByLabelText(/code/i);
  expect(input).toHaveAccessibleDescription(/already/i);
  expect(input).toHaveFocus();
});

it('warns before navigating away from a dirty form', async () => { /* R.8.8 */ });
```

The Enter test is the one that catches an `onClick`-based submit — the click test passes
either way, which is exactly why that defect ships.

## Step 5 — Authorization and auth scenarios (R.11.5, R.11.6)

```tsx
it('hides delete without the DELETE grant', async () => {
  renderFeature('/org/branches', sessionWith(['PERM_BRANCH_VIEW']));
  await screen.findByRole('cell', { name: 'HQ' });
  expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
});

it('returns 403 on a deep link to edit without UPDATE', async () => {
  renderFeature('/org/branches/1/edit', sessionWith(['PERM_BRANCH_VIEW']));
  expect(await screen.findByText(/do not have permission/i)).toBeInTheDocument();
});

it('returns 403 for a page missing from the registry', async () => { /* fail closed — AD-3 */ });

it('refreshes once and replays the request on a 401', async () => {
  let refreshes = 0;
  server.use(http.post('*/auth/refresh', () => { refreshes++; return HttpResponse.json({ data: tokenFixture }); }));
  // three concurrent 401s must produce exactly one refresh — R.9.5
  await Promise.all([branchApi.getById(1), branchApi.getById(2), branchApi.getById(3)]);
  expect(refreshes).toBe(1);
});

it('clears the query cache on logout', async () => { /* SEC.9 */ });
```

Authorization UX and session edges are where untested code hurts most: they are rarely
exercised by hand because the developer is always signed in with full rights.

## Step 6 — E2E (R.11.9)

One Playwright spec per critical journey against a running stack: sign in, create, edit,
delete, and permission denial. E2E proves the pieces are wired together — real cookies, real
CORS, real deploy artefacts. It is not where branch coverage belongs; each spec costs
minutes, so keep the set small and the assertions end-to-end.

## What not to test (R.11.7, R.11.8)

| Anti-pattern | Why |
|---|---|
| Snapshot of a whole component | Fails on every restyle, approved without reading |
| `renderHook` on a feature hook to assert internal state | Tests the implementation, not the behaviour |
| Spying on provider internals or query cache keys | Refactor-fragile |
| Asserting `useState` values through the component instance | Not user-visible |
| Mocking the module under test | Proves the mock works |
| Asserting on CSS classes | Restyle breaks it; invisible controls pass |
| Testing `components/ui` behaviour from a feature test | Duplicates the design system's suite |

## Verify before finishing

- [ ] Schema and mapper unit tests, including the numeric-zero case
- [ ] API contract tests via MSW covering success, envelope, and at least one error kind
- [ ] List integration: load, filter, paginate, empty, filtered-empty, error
- [ ] Entry integration: create, edit, Enter-to-submit, server field error, dirty guard
- [ ] Permission tests: granted, denied control, denied deep link, unregistered page
- [ ] Auth tests: bootstrap success and failure, single-flight refresh, logout cache clear
- [ ] One E2E spec per critical journey
- [ ] Queries by role and accessible name only
- [ ] Fresh `QueryClient` per test with `retry: false`
- [ ] No snapshots, no hook-internal tests, no class-name assertions

## Alignment with general React guidance

**Consistent with:** Testing Library's "test what the user sees", MSW at the network
boundary, Playwright for journeys.

**Deliberately different:** high coverage targets are rejected as a goal — they reward
`renderHook` tests that assert nothing a user could notice. The required-scenario list above
replaces a percentage.
