---
name: create-auth-session
description: "Generates the authentication and session layer: in-memory token store, httpOnly refresh-cookie flow, startup bootstrap, single-flight 401 refresh, multi-tab sync, logout, and the session query that supplies permissions and pages. Phase 1 — build this before any feature. Use for login, logout, token refresh, session expiry, or anything touching credentials."
---

# Skill: create-auth-session

## Description
Generates the authentication and session foundation. Implements AD-4, AD-5, AD-7.
Rules: `references/contract-rules.md` §R.9, §SEC.

## When to Use
- Standing up authentication for the first time
- Changing token handling, refresh, logout, or session bootstrap
- Reviewing anything that touches credentials or the session payload

## When NOT to Use
- Feature-level permission checks → `enforce-permissions`
- Route guarding → `create-routing`
- Backend token issuance — this skill consumes it, never designs it

## Output

```
src/auth/tokenStore.ts         in-memory access token
src/auth/authApi.ts            login, refresh, logout
src/auth/session.ts            session query + Zod parsing
src/auth/permissions.ts        perm(), usePermission()
src/lib/http/refreshQueue.ts   single-flight 401 handling
src/app/AuthBootstrap.tsx      startup gate
src/routes/guards.tsx          RequireAuth, RequirePermission
```

---

## The model, in one paragraph

The access token lives in a module variable and dies with the tab. The refresh token lives
in an httpOnly cookie the page's JavaScript cannot read. On startup the app exchanges the
cookie for an access token and a session payload. On a 401 it does the same, once, with
every concurrent request queued behind it. On logout it tells the server, clears memory,
clears the cache, and tells the other tabs.

## Step 1 — Token store (R.9.1)

```ts
// src/auth/tokenStore.ts — never React state, never persisted
let accessToken: string | null = null;
let expiresAt = 0;

export const tokenStore = {
  get: () => accessToken,
  set: (token: string, expiresInSeconds: number) => {
    accessToken = token;
    expiresAt = Date.now() + expiresInSeconds * 1000;
  },
  clear: () => { accessToken = null; expiresAt = 0; },
  expiresSoon: () => expiresAt - Date.now() < 60_000,   // proactive refresh window
};
```

No `localStorage`. No `sessionStorage`. No cookie a script can read. No React state — the
token is never rendered, so putting it in state buys nothing and adds a re-render surface.

## Step 2 — Auth endpoints (R.9.2, R.9.3)

```ts
// src/auth/authApi.ts
const AUTH = '/auth';
const csrf = () => readCookie('csrf') ?? '';

export const authApi = {
  login: (body: LoginRequest) =>
    http.post<AuthResult>(`${AUTH}/login`, body, { credentials: 'include' }),

  // the httpOnly refresh cookie is scoped to /auth, so only these two carry it
  refresh: () =>
    http.post<AuthResult>(`${AUTH}/refresh`, undefined, {
      credentials: 'include',
      headers: { 'X-CSRF-Token': csrf() },       // double submit — R.9.3
      skipAuthRefresh: true,                      // never recurse into the queue
    }),

  logout: () =>
    http.post<void>(`${AUTH}/logout`, undefined, {
      credentials: 'include',
      headers: { 'X-CSRF-Token': csrf() },
      skipAuthRefresh: true,
    }),

  // backs Step 4's session query — user, permissions, pages
  me: () => http.get<AuthResult>(`${AUTH}/me`),
};
```

Business endpoints send `Authorization` and **not** `credentials: 'include'`. A header is
not attached automatically by the browser, so those endpoints are not CSRF-reachable. Only
the two cookie-bearing endpoints need the CSRF token.

## Step 3 — Single-flight refresh (R.9.5, R.9.6, R.2.12)

```ts
// lib/http/refreshQueue.ts
let inFlight: Promise<void> | null = null;

export function refreshOnce(): Promise<void> {
  inFlight ??= authApi.refresh()
    .then((r) => { tokenStore.set(r.accessToken, r.expiresIn); })
    .catch((e) => { hardLogout('session-expired'); throw e; })
    .finally(() => { inFlight = null; });
  return inFlight;
}
```

The client calls `refreshOnce()` on the first 401, awaits it, and replays the original
request exactly once. A second 401 on the replay is a hard logout, never a loop. Requests
arriving during a refresh await the same promise rather than starting their own.

## Step 4 — Session as server state (R.9.9, AD-5)

```ts
// src/auth/session.ts
export const sessionKeys = { current: () => ['session'] as const };

export function useSession() {
  return useQuery({
    queryKey: sessionKeys.current(),
    queryFn: async () => sessionSchema.parse(await authApi.me()),   // trust boundary — TS.10
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });
}
```

The session — user, permissions, pages — is server state and lives in the QueryClient. It is
never copied into React Context. There is exactly one permission set in the application, which is
why `usePermission()` cannot disagree with the navigation menu.

A page entry that fails Zod parsing is dropped with one logged warning; the rest of the
session still loads.

## Step 5 — Permissions (AD-7, P.4)

```ts
// src/auth/permissions.ts
export type PermissionAction = 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE';

export const perm = (resource: string, action: PermissionAction) => `PERM_${resource}_${action}`;

export function usePermission() {
  const { data } = useSession();
  const granted = useMemo(() => new Set(data?.permissions ?? []), [data]);
  return {
    can: (permission: string) => granted.has(permission),
    canDo: (resource: string, action: PermissionAction) => granted.has(perm(resource, action)),
  };
}
```

Features never concatenate permission strings. `perm(RESOURCES.BRANCH, 'UPDATE')` is
greppable back to a page; `'PERM_BRANCH_UPDAT'` typed inline is a check that silently never
passes.

## Step 6 — Startup bootstrap (R.9.4)

```tsx
// app/AuthBootstrap.tsx
export function AuthBootstrap({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<'pending' | 'authed' | 'anon'>('pending');

  useEffect(() => {
    refreshOnce().then(() => setStatus('authed')).catch(() => setStatus('anon'));
  }, []);

  if (status === 'pending') return <FullPageSpinner />;   // nothing authenticated renders yet
  return <>{children}</>;
}
```

This is one of the few legitimate uses of `useEffect` in the application: it is a genuine
external-system synchronisation on mount, not data fetching for render (R.3.1's exception).
Rendering the shell before bootstrap settles produces a flash of authenticated UI followed
by a redirect — the defect this gate exists to prevent.

## Step 7 — Logout and multi-tab (R.9.7, R.9.8, SEC.9)

```ts
const channel = new BroadcastChannel('auth');

export async function hardLogout(reason: 'user' | 'session-expired') {
  try { await authApi.logout(); } catch { /* server may already have expired it */ }
  tokenStore.clear();
  queryClient.clear();                       // SEC.9 — no residue for the next user
  channel.postMessage({ type: 'logout', reason });
  router.navigate('/login', { replace: true, state: { reason } });
}

channel.onmessage = (e) => {
  if (e.data.type === 'logout') {
    tokenStore.clear();
    queryClient.clear();
    router.navigate('/login', { replace: true, state: { reason: e.data.reason } });
  }
};
```

Each tab holds its own access token, so only logout needs global synchronisation. Clearing
the query cache is not optional: without it, the next user on a shared machine can read the
previous user's cached records straight out of memory.

## Step 8 — Login redirect (SEC.5)

```ts
const target = location.state?.from;
const safe = typeof target === 'string' && target.startsWith('/') && !target.startsWith('//');
navigate(safe ? target : '/', { replace: true });
```

An unvalidated return path is an open redirect. Same-origin relative paths only.

## Verify before finishing

- [ ] No token in `localStorage`, `sessionStorage`, a readable cookie, or React state
- [ ] Refresh and logout are the only `credentials: 'include'` calls, both sending CSRF
- [ ] Refresh is single-flight; a failed refresh is a hard logout with no retry
- [ ] Nothing behind the auth boundary renders before bootstrap settles
- [ ] Logout clears token, cache, and other tabs
- [ ] Session and permissions come from one query; nothing is mirrored
- [ ] Permission strings built with `perm()`
- [ ] Return path validated as a same-origin relative path
- [ ] No token or permission set logged, persisted, or sent to analytics

## Violations requiring immediate rejection

| Pattern | Rule |
|---|---|
| Token in `localStorage` / `sessionStorage` | R.9.1, SEC.1 |
| Refresh token readable from JavaScript | R.9.2 |
| Cookie endpoint with no CSRF header | R.9.3 |
| Authenticated UI rendering before bootstrap | R.9.4 |
| Per-call 401 handling | R.9.5, R.2.12 |
| Retry loop on failed refresh | R.9.6 |
| Logout that does not clear the query cache | R.9.7, SEC.9 |
| Grants duplicated into a second source | R.9.9, R.7.1 |
| Token in a log, URL, or analytics payload | R.9.10, SEC.12 |
| Unvalidated post-login redirect | SEC.5 |

## Alignment with general React guidance

**Consistent with:** React Router's `state`-carried return path, TanStack Query's cache
lifecycle for session invalidation, the standard `BroadcastChannel` pattern for tab sync.

**Deliberately different:** the common tutorial pattern of a JWT in `localStorage` behind an
`AuthContext` is rejected — it makes any XSS, including one in a transitive dependency, a
silent long-lived account takeover. Context is also unnecessary here: the token is not
rendered, and the session is already a query.
