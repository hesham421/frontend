---
name: create-error-handling
description: "Generates the error architecture: the closed ApiError taxonomy, normalizeError, mapBackendError, route error elements, and layered error boundaries. Phase 1 — build before features. Use whenever handling a failed request, a render crash, a route failure, or deciding what a user should see when something breaks."
---

# Skill: create-error-handling

## Description
Generates the error layer. Implements AD-11. Rules: `references/contract-rules.md` §R.10.

## When to Use
- Standing up error handling for the first time
- Deciding what the user sees for a specific failure
- Adding an error boundary or a route `errorElement`
- Reviewing any `catch` block

## When NOT to Use
- Form field validation display → `create-forms`
- Permission denial pages → `create-routing`
- Backend error codes — this layer maps them, it does not define them

## Output

```
src/lib/errors/ApiError.ts        the closed taxonomy
src/lib/errors/normalize.ts       any thrown value → ApiError
src/lib/errors/mapBackendError.ts errorCode → translation key
src/app/RootErrorBoundary.tsx     last resort
src/app/RouteErrorElement.tsx     per-route branch
src/components/ui/ErrorState.tsx  in-place failure display
```

---

## Step 1 — The closed taxonomy (R.10.1)

Eight kinds. There is no ninth; anything unclassifiable is `unknown`, which is itself a
defined behaviour rather than an escape hatch.

```ts
export type ErrorKind =
  | 'network' | 'unauthenticated' | 'forbidden' | 'notFound'
  | 'validation' | 'conflict' | 'server' | 'unknown';

export class ApiError extends Error {
  constructor(
    readonly kind: ErrorKind,
    readonly status: number | null,
    readonly errorCode: string | null,
    readonly correlationId: string | null,
    readonly fieldErrors: Record<string, string> | null,
    message: string,
  ) { super(message); this.name = 'ApiError'; }
}
```

`message` is for logs. It is never rendered (R.10.4).

## Step 2 — Normalisation (R.10.1)

```ts
export function normalizeError(e: unknown): ApiError {
  if (e instanceof ApiError) return e;
  if (e instanceof DOMException && e.name === 'AbortError') return new ApiError('unknown', null, 'ABORTED', null, null, 'aborted');
  if (e instanceof TypeError) return new ApiError('network', null, null, null, null, e.message);
  return new ApiError('unknown', null, null, null, null, e instanceof Error ? e.message : String(e));
}

export function kindFromStatus(status: number): ErrorKind {
  if (status === 401) return 'unauthenticated';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'notFound';
  if (status === 409) return 'conflict';
  if (status === 400 || status === 422) return 'validation';
  if (status >= 500) return 'server';
  return 'unknown';
}
```

`lib/http/client.ts` is the only place that constructs an `ApiError` from a response. Every
`catch` elsewhere calls `normalizeError` first, so no code downstream handles `unknown`
shapes (TS.9).

## Step 3 — Behaviour per kind (R.10.2)

One row, one behaviour, applied everywhere. This table is the contract.

| Kind | User sees | Retry offered | Where |
|---|---|---|---|
| `network` | "Connection problem" | ✅ | Inline `ErrorState` or toast |
| `unauthenticated` | Nothing — refresh runs, then replay; on failure, the login page with an expiry notice | ❌ | Handled in the HTTP client |
| `forbidden` | 403 page (navigation) or "You do not have permission" toast (action) | ❌ | Route or handler |
| `notFound` | 404 page (navigation) or "No longer exists" + list refresh (action) | ❌ | Route or handler |
| `validation` | Field errors on the form; a form-level message if unfielded | ❌ | Form only (R.10.8) |
| `conflict` | The mapped business reason, e.g. "Code already in use" | ❌ | Form or toast |
| `server` | "Something went wrong on our side" + correlation ID | ✅ | Inline or toast |
| `unknown` | Same as `server` | ✅ | Inline or toast |

Retry appears only for `network` and `server` (R.10.9). A retry button on a 403 is noise —
the outcome cannot change.

## Step 4 — Mapping to copy (R.10.3, R.10.5)

```ts
const CODE_KEYS: Record<string, string> = {
  BRANCH_CODE_DUPLICATE: 'errors.branch.codeDuplicate',
  BRANCH_HAS_CHILDREN:   'errors.branch.hasChildren',
};

const KIND_KEYS: Record<ErrorKind, string> = {
  network: 'errors.network',
  unauthenticated: 'errors.sessionExpired',
  forbidden: 'errors.forbidden',
  notFound: 'errors.notFound',
  validation: 'errors.validation',
  conflict: 'errors.conflict',
  server: 'errors.server',
  unknown: 'errors.unknown',
};

export function mapBackendError(e: unknown): { key: string; correlationId: string | null } {
  const err = normalizeError(e);
  return {
    key: (err.errorCode && CODE_KEYS[err.errorCode]) ?? KIND_KEYS[err.kind],
    correlationId: err.correlationId,
  };
}
```

Every backend `errorCode` gets a key in both languages, or it falls back to its kind. An
unmapped code degrades to a generic message rather than leaking `BRANCH_FK_VIOLATION_003` to
a user. `enforce-frontend-architecture` X.5 checks the mapping against the backend's code
list.

Show the correlation ID when present — it converts "it broke" into a supportable report.

## Step 5 — Boundary layers (R.10.6, R.10.7)

Three layers, each catching what the one below could not:

```
RootErrorBoundary          app/providers.tsx — render crash anywhere
  └─ RouteErrorElement     per route branch — loader failure, chunk failure, page crash
      └─ ErrorState        per widget — one failed query inside a working page
```

```tsx
// app/RouteErrorElement.tsx
export function RouteErrorElement() {
  const routeError = useRouteError();
  const err = normalizeError(routeError);
  if (err.kind === 'forbidden') return <ForbiddenPage />;
  if (err.kind === 'notFound')  return <NotFoundPage />;
  return <ErrorState kind={err.kind} correlationId={err.correlationId} onRetry={() => location.reload()} />;
}
```

A list that fails must not blank the page around it: give any independently failing region
its own boundary or its own `isError` branch (R.10.7). One dead widget taking down a
working screen is the most avoidable failure in this category.

## Step 6 — Reporting (R.10.10, SEC.8)

```ts
export function reportError(e: unknown, context: Record<string, unknown> = {}) {
  const err = normalizeError(e);
  if (err.kind === 'validation' || err.kind === 'forbidden') return;   // expected, not incidents
  monitoring.capture({
    kind: err.kind, status: err.status, errorCode: err.errorCode,
    correlationId: err.correlationId, ...scrub(context),
  });
}
```

`scrub` removes tokens, headers, cookies, and anything that looks like PII. Never send the
request body or the response payload.

## Verify before finishing

- [ ] Every `catch` calls `normalizeError`; no `catch (e: any)`
- [ ] `ApiError` constructed only in the HTTP client
- [ ] Each kind has exactly one user-facing behaviour, matching the table
- [ ] No raw message, stack, or backend internal reaches the UI
- [ ] Correlation ID surfaced when present
- [ ] Root boundary, route error elements, and per-widget states all exist
- [ ] Retry only on `network` and `server`
- [ ] `validation` routes to the form, not to a toast alone
- [ ] Monitoring payloads scrubbed

## Violations requiring immediate rejection

| Pattern | Rule |
|---|---|
| `catch (e: any)` or an untyped error path | R.10.1, TS.9 |
| Backend message rendered verbatim | R.10.3, R.10.4 |
| Stack trace or internal identifier shown to a user | R.10.4, SEC.8 |
| Route branch with no `errorElement` | R.10.6 |
| One failing widget blanking a whole page | R.10.7 |
| Validation errors surfaced only as a toast | R.10.8 |
| Retry button on `forbidden` or `notFound` | R.10.9 |
| Request or response body sent to monitoring | R.10.10 |

## Alignment with general React guidance

**Consistent with:** React Router's `errorElement` model, React error boundaries for render
failures, TanStack Query's `isError` for data failures.

**Deliberately different:** the common pattern of showing `error.message` in a toast is
rejected — it leaks internals, is untranslatable, and gives the user nothing actionable. The
kind table plus a correlation ID replaces it.
