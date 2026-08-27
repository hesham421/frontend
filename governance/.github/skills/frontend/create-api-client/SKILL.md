---
name: create-api-client
description: "Generates the HTTP layer: the shared fetch client with auth injection, envelope unwrapping, error normalization and 401 refresh, plus a feature's typed api module. Step 2.2 — AFTER models, BEFORE hooks. Use when wiring a feature to backend endpoints, adding upload or download, or removing stray fetch calls."
---

# Skill: create-api-client

## Description
Generates `lib/http` (once) and the feature's `api/<entity>Api.ts`. **Step 2.2.**
Implements AD-8. Rules: `references/contract-rules.md` §R.2.

## When to Use
- Wiring a feature to the backend
- `lib/http/client.ts` does not exist yet
- Adding file upload or download
- Removing `fetch` calls found in components or hooks

## When NOT to Use
- Before models exist — run `create-models` first
- Adding one endpoint to an existing module (edit directly)
- Anything involving React, toasts, navigation, or storage (R.2.6)

## Output

```
src/lib/http/client.ts     once per project
src/lib/http/download.ts   once per project
src/features/<feature>/api/<ENTITY_CAMEL>Api.ts
```

---

## Step 1 — The client

```ts
const BASE = import.meta.env.VITE_API_URL;                         // R.2.3

// Matches the backend's actual ApiResponse<T>/ApiError/FieldErrorItem shape
// (com.erp.common.web) — do not simplify this to a flat { data, errorCode }
// shape, the backend never sends one.
interface EnvelopeError {
  code?: string;
  details?: string;
  fieldErrors?: { field: string; message: string }[];
}
interface Envelope<T> { success?: boolean; message?: string; data: T; error?: EnvelopeError; correlationId?: string }

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  signal?: AbortSignal;
  skipAuthRefresh?: boolean;
}

export async function apiClient<T>(path: string, options: RequestOptions = {}, isReplay = false): Promise<T> {
  const { body, headers, skipAuthRefresh, ...rest } = options;
  const token = tokenStore.get();

  if (token && tokenStore.expiresSoon() && !skipAuthRefresh) await refreshOnce();  // proactive

  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),  // R.2.11
      ...(tokenStore.get() ? { Authorization: `Bearer ${tokenStore.get()}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
  });

  // 401 handling lives here and nowhere else — R.2.12, R.9.5
  if (res.status === 401 && !skipAuthRefresh && !isReplay) {
    await refreshOnce();
    return apiClient<T>(path, options, true);        // exactly one replay
  }

  if (res.status === 204) return undefined as T;

  const payload = (await res.json().catch(() => ({}))) as Partial<Envelope<T>>;

  if (!res.ok) {
    // Backend sends field errors as an array ([{ field, message }]) — collapse to a
    // Record once, here, so create-forms' applyServerErrors can keep using Object.entries.
    const fieldErrors = payload.error?.fieldErrors?.length
      ? Object.fromEntries(payload.error.fieldErrors.map((fe) => [fe.field, fe.message]))
      : null;
    throw new ApiError(                               // R.2.5
      kindFromStatus(res.status), res.status,
      payload.error?.code ?? null, payload.correlationId ?? null,
      fieldErrors, payload.message ?? payload.error?.details ?? `HTTP ${res.status}`,
    );
  }

  return (payload.data ?? payload) as T;              // R.2.4 — unwrapped once
}

export const http = {
  get:  <T>(p: string, o?: RequestOptions) => apiClient<T>(p, { ...o, method: 'GET' }),
  post: <T>(p: string, body?: unknown, o?: RequestOptions) => apiClient<T>(p, { ...o, method: 'POST', body }),
  put:  <T>(p: string, body?: unknown, o?: RequestOptions) => apiClient<T>(p, { ...o, method: 'PUT', body }),
  del:  <T>(p: string, o?: RequestOptions) => apiClient<T>(p, { ...o, method: 'DELETE' }),
};
```

No retry, no cache, no dedupe (R.2.10) — retry is a QueryClient default, caching is the
QueryClient's job, and dedupe is automatic on shared keys. Duplicating them here produces
two policies that drift.

**Envelope shape is not this skill's to invent.** It must match the backend's actual
`ApiResponse<T>` / `ApiError` / `FieldErrorItem` (`com.erp.common.web`, see
`backend/governance/.github/context/api-contract.md`) exactly: `error` is a nested object
(`error.code`, `error.fieldErrors`), never flattened to a top-level `errorCode` field, and
`fieldErrors` arrives as an array of `{ field, message }`, never a `Record`. Corrected
2026-08-28 — a prior version of this skill assumed a flat, un-verified shape that never
matched what the backend sends, which silently broke error-code and field-error handling
in every feature built from it.

## Step 2 — Feature api module

```ts
const BASE = '/api/organization/branches';

export const branchApi = {
  search: (req: SearchRequest, signal?: AbortSignal) =>
    http.post<PagedResponse<BranchDto>>(`${BASE}/search`, req, { signal }),      // R.2.8

  getById: (id: number, signal?: AbortSignal) => http.get<BranchDto>(`${BASE}/${id}`, { signal }),
  getUsage: (id: number, signal?: AbortSignal) => http.get<BranchUsageDto>(`${BASE}/${id}/usage`, { signal }),

  create: (req: CreateBranchRequest) => http.post<BranchDto>(BASE, req),
  update: (id: number, req: UpdateBranchRequest) => http.put<BranchDto>(`${BASE}/${id}`, req),

  activate:   (id: number) => http.put<BranchDto>(`${BASE}/${id}/activate`, {}),   // R.2.7
  deactivate: (id: number) => http.put<BranchDto>(`${BASE}/${id}/deactivate`, {}),

  remove: (id: number) => http.del<void>(`${BASE}/${id}`),
};
```

Two activation endpoints, not one toggle: a boolean toggle races itself when two users act
on the same row, and produces a request whose intent cannot be read from the audit log.

## Step 3 — Search, filter, sort contract (R.2.8)

One contract for every list in the application, defined in `data/types.ts`:

```ts
export type FilterOperator = 'contains' | 'equals' | 'starts_with' | 'greater_than' | 'less_than' | 'before' | 'after' | 'not_equals';
export interface FilterCondition { field: string; operator: FilterOperator; value?: string | number | boolean }
export interface SearchSort { field: string; direction: 'ASC' | 'DESC' }
export interface SearchRequest { filters: FilterCondition[]; sorts: SearchSort[]; page: number; size: number }
export interface PagedResponse<T> { content: T[]; totalElements: number; totalPages: number; size: number; number: number }
```

Search is `POST` because filter sets exceed practical URL limits and nest. The user-facing
list state still lives in URL params (R.5.8) — `useErpList()` translates params into a
`SearchRequest`.

## Step 4 — Upload and download (R.2.11)

```ts
upload: (id: number, file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  return http.post<AttachmentDto>(`${BASE}/${id}/attachments`, fd);   // no Content-Type — browser sets the boundary
},
```

```ts
// lib/http/download.ts
export async function downloadFile(path: string, filename: string) {
  const res = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${tokenStore.get()}` } });
  if (!res.ok) throw new ApiError(kindFromStatus(res.status), res.status, null, null, null, 'download failed');
  const url = URL.createObjectURL(await res.blob());
  try { const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); }
  finally { URL.revokeObjectURL(url); }               // revoke or leak the blob
}
```

Client-side type and size checks are UX. The server re-validates; never treat the client
check as the control (SEC.7).

## Verify before finishing

- [ ] Zero `fetch(` outside `lib/http`
- [ ] Base URL from `import.meta.env`
- [ ] Envelope unwrapped only in the client
- [ ] `ApiError` carries kind, status, code, correlation ID, field errors
- [ ] 401 handled once, in the client, with a single replay
- [ ] `signal` forwarded on every read
- [ ] Separate activate and deactivate
- [ ] No React import, toast, navigation, or storage access
- [ ] No retry, cache, or dedupe logic
- [ ] Uploads use `FormData` with no manual `Content-Type`; blob URLs revoked

## Violations requiring immediate rejection

| Pattern | Rule |
|---|---|
| `fetch` or a second client in a feature | R.2.1 |
| URL built inside a hook or component | R.2.2 |
| Hardcoded host | R.2.3 |
| `res.data.data` at a call site | R.2.4 |
| Swallowed error or bare `throw new Error` | R.2.5 |
| `toast` / `navigate` / storage access in an api module | R.2.6 |
| `toggleActive(id, active)` | R.2.7 |
| Paged search over query string | R.2.8 |
| Hand-rolled retry or in-module cache | R.2.10 |
| Manual `Content-Type` on `FormData`, unrevoked blob URL | R.2.11 |
| Per-call 401 branch | R.2.12 |

## Alignment with general React guidance

**Consistent with:** `AbortSignal` cancellation, `FormData` uploads, one typed module per
resource, and `react-best-practices`' waterfall category (`async-parallel`,
`async-dependencies`) — independent api calls in a feature hook are issued side by side, and
only genuinely dependent calls are chained; that composition happens in `create-queries`,
which is why this layer stays a thin, sequential-by-default set of typed functions rather than
orchestrating concurrency itself.

**Deliberately different:** Axios is not used (AD-9) — `fetch` is native, has first-class
cancellation, and keeps a dependency out of the auth-critical path. `{ data, error }` tuple
returns are also rejected: throwing lets TanStack Query classify failures, which tuples
would then have to re-derive.
