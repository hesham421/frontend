# Frontend Architecture Reference

The binding architecture for the AVELYNQ ERP dashboard. Every skill in this pack implements
part of it. Where a skill and this document disagree, this document wins.

**Contents**
1. Stack and library ownership
2. Architecture decisions (AD-1 … AD-13)
3. Project structure
4. Naming conventions
5. Cross-cutting contracts

---

## 1. Stack and library ownership

Every responsibility has exactly one owner. Adding a second library for an owned
responsibility requires amending this table, not a local decision.

| Responsibility | Owner | May be used in | Must NOT be used for |
|---|---|---|---|
| UI runtime | React 18.3 | everywhere | — |
| Build | Vite 5 | build config | runtime flags |
| Language | TypeScript 5.9 (`strict`) | everywhere | — |
| Routing | React Router v7 | `src/routes/` | authorization truth |
| Styling | Vanilla CSS custom properties + `avl-*` classes | `src/styles/` and component CSS | inline style objects |
| Design tokens | `src/styles/tokens/*.css` | referenced via `var(--token)` | hardcoded hex or px |
| Icons | `@tabler/icons-webfont` | everywhere | any second icon set |
| Localization and direction | `LanguageContext` → `useLanguage()`, `t()` | everywhere | per-component dictionaries |
| Session and permissions | `AuthContext` → `useAuth()`, `useCan()` | everywhere | a second auth store |
| Cross-cutting client state | React Context | `src/context/` | server data |
| Server state and caching | TanStack Query v5 | `src/features/*/hooks.ts` | UI state, form state |
| HTTP transport | native `fetch` behind `lib/http` | `lib/http`, `features/*/api.ts` | components, pages |
| Form state | React Hook Form 7 | pages and form components | server state |
| Schema and validation | Zod 4 | `features/*/model.ts`, trust boundaries | replacing DTO types |
| Dates, numbers, currency | `Intl.*` | `lib/format` | manual formatting |
| Unit and component tests | Vitest + React Testing Library | `*.test.tsx` | end-to-end flows |
| Network mocking | MSW | tests | hand-written `fetch` stubs |
| End-to-end tests | Playwright | `e2e/` | unit assertions |

**Prohibited outright** (each duplicates an owner above): Redux, Zustand, Jotai, Recoil,
MobX, SWR, Axios, Formik, Yup, Moment.js, Tailwind CSS, styled-components, Emotion, CSS
Modules, Material UI, Ant Design, Chakra, react-icons, lucide-react, Enzyme, Cypress.

> **Note on client state.** `AuthContext` and `LanguageContext` already own cross-cutting
> client state. A state library alongside them would create a second owner for the same
> concern, which is the failure this table exists to prevent. Context is sufficient here
> because this state is small, changes rarely, and is read almost everywhere.

## 2. Architecture decisions

### AD-1 — Routing: React Router v7, static route tree, frontend-owned

Routes are declared in code in `src/routes/routes.tsx` using `createBrowserRouter`. Paths
are constants in `src/routes/paths.ts`. **No route, path, or navigation item is fetched
from an API or generated at runtime.**

**Why:** a static tree is type-checkable, code-splittable per route, greppable, and
analysable by CI. Runtime-generated routes defeat bundler code splitting, make every
navigation dependent on a network call, and turn the router into a security surface. The
frontend owns its own URL space; that is not a fact the backend needs to supply.

This replaces the prototype's `currentScreen` state switch in `App.tsx`, which cannot
support deep links, browser history, refresh-stable URLs, or per-route code splitting —
all of which an ERP needs.

### AD-2 — Authorization: the backend supplies grants, not pages

The frontend asks the backend **what this user may do**, never **what pages exist**.

```
Backend  ──► session payload: { user, permissions: string[] }
Frontend ──► routes.tsx: each route declares the permission it requires
             navigation.ts: menu derived from the same route config, filtered by grants
```

Permission codes are `<RESOURCE>_<ACTION>` with `ACTION ∈ VIEW | CREATE | UPDATE | DELETE`,
declared once in `src/auth/permissions.ts` and referenced by routes, controls, and handlers.
A code the frontend does not know is ignored. A code the backend does not grant hides the
route and its menu entry.

**Why:** grants are user-specific and genuinely backend-owned. Page inventory is a UI fact.
Coupling the route table to a database table means a route rename becomes a data migration,
the menu breaks when the API is slow, and CI cannot verify the navigation graph.

### AD-3 — Deterministic route outcomes

| Situation | Result |
|---|---|
| Unknown path | 404 page |
| Not authenticated | redirect to `/login`, carrying the return path |
| Authenticated, permission not granted | explicit 403 page |
| Route exists, feature flag off | 404 page |
| Session still loading | full-page loader; nothing authenticated renders |
| Permission code in the session the frontend does not know | ignored |

403 rather than a redirect: bouncing an unauthorized user to the dashboard makes a
misconfigured grant indistinguishable from a broken link, and neither the user nor support
can tell which happened.

### AD-4 — Authentication: in-memory access token, httpOnly refresh cookie

- **Access token** lives in a module variable in `src/auth/tokenStore.ts`. Never in `localStorage`, `sessionStorage`, or React state. It dies with the tab.
- **Refresh token** lives in an `httpOnly; Secure; SameSite=Lax; Path=/auth` cookie. JavaScript cannot read it.
- **Bootstrap:** on startup the app calls `POST /auth/refresh` with `credentials: 'include'`. Success yields a token and the session; failure routes to `/login`. Nothing authenticated renders until this settles.
- **CSRF:** the cookie is scoped to `/auth`, so only refresh and logout carry it; both send a double-submit `X-CSRF-Token` header. Business endpoints use the `Authorization` header and are therefore not CSRF-reachable.
- **Renewal:** proactive refresh 60s before expiry, plus a single-flight refresh on the first 401 with concurrent requests queued behind it. A failed refresh is a hard logout, never a retry loop.
- **Logout:** call the server, clear the token, clear the query cache, broadcast to other tabs, navigate to `/login`.
- **Multi-tab:** `BroadcastChannel('auth')` propagates logout. Each tab holds its own token.

**Why not `localStorage`:** any XSS, including one in a transitive dependency, reads it and
exfiltrates a bearer token. In-memory storage reduces that from silent long-lived account
takeover to damage confined to the compromised tab.

### AD-5 — Session is Context over a query

The session is fetched once by TanStack Query and exposed through `AuthContext` so that
`useAuth()` and `useCan()` are the only read points. There is exactly one copy of the
permission set in the application. The token is not in Context — it is never rendered.

### AD-6 — Frontend authorization is a UX layer

The frontend decides what the user is **shown**. The backend decides what the user may
**do**. Every guarded action is enforced server-side regardless of any client check. This
is repeated in the permission skills and in the footer of every report they emit, because a
green frontend report is routinely misread as proof that an endpoint is protected.

### AD-7 — Five state owners

| State | Owner |
|---|---|
| Anything a server is the source of truth for | TanStack Query (`features/*/hooks.ts`) |
| Session, permissions, locale, direction | React Context (`src/context/`) |
| Fields being edited | React Hook Form |
| List page, size, sort, filters, active tab, opened record | URL search params |
| State used by one subtree | `useState` |

Two owners for the same data is the defect this pack most often catches.

### AD-8 — HTTP: native `fetch` behind one client

`src/lib/http/client.ts` owns the base URL, auth header, envelope unwrapping, error
normalisation, and the 401 refresh queue. Features call typed functions in
`features/*/api.ts`, never `fetch`. Retry lives in TanStack Query defaults — idempotent
reads only, network and 5xx only. Mutations never retry automatically.

The prototype's `mockData.ts` is replaced by MSW handlers, so the same code path runs in
development, tests, and production.

### AD-9 — Forms: React Hook Form + Zod

`mode: 'onTouched'`, `reValidateMode: 'onChange'`. The Zod schema is the single source of
truth for shape and validation; form values are inferred from it. Submission goes through
`handleSubmit` on the `<form>` element, which preserves Enter-to-submit and prevents the
browser's native submit from reloading the page. Server field errors map to `setError`.
Unsaved changes are guarded with `useBlocker` on `formState.isDirty`.

### AD-10 — Styling: tokens and `avl-*` classes only

All colour, spacing, typography, elevation, and breakpoint values come from
`src/styles/tokens/*.css` via `var(--token)`. Components compose semantic `avl-*` classes.
No inline hex, no hardcoded px in JSX, no utility-class framework.

Direction is handled with **logical CSS properties** (`margin-inline-start`,
`padding-inline-end`, `border-inline-start`, `inset-inline-start`) so a single stylesheet
serves both directions. Physical properties are the single most common cause of RTL
breakage and are prohibited in layout code.

### AD-11 — Error taxonomy is closed

Every failure normalises to one of eight kinds: `network`, `unauthenticated`, `forbidden`,
`notFound`, `validation`, `conflict`, `server`, `unknown`. Each has one defined
user-facing behaviour. Raw messages, stacks, and backend internals never reach the UI; a
correlation ID does.

### AD-12 — TypeScript is architecture

`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`.
`any` is a review failure. Component props are explicit exported interfaces. Runtime
validation with Zod applies at trust boundaries only — the session payload, form input,
and responses containing discriminated unions — not on every DTO, where it would duplicate
the contract without adding information.

### AD-13 — Component splitting and no dumping grounds

Split a component when it exceeds ~300 lines, when a visual sub-section carries its own
state or handlers, or when it mixes domain logic with presentation primitives.

There is no `utils/`, `common/`, `helpers/`, or `misc/` folder. `src/lib/` is organised by
purpose: `lib/http`, `lib/format`, `lib/errors`. Catch-all folders accumulate unowned code
and become import hubs where violations hide.

### AD-14 — Performance is evidence-based; memoisation is explicit

This stack is React 18.3, which has **no auto-memoisation**. React Compiler is not adopted:
it targets React 19 and its React 18 support path adds a build-time transform plus a runtime
package to an application whose performance profile does not currently need it. Revisit only
on a React 19 upgrade, as an amendment to this document.

The consequence is that memoisation here is **manual and deliberate**, not absent and not
reflexive:

- Reach for `useMemo` / `useCallback` / `memo` when there is a **referential-identity
  requirement** (a value in a dependency array, a prop to a memoised child, a table's column
  array) or a **measured** render cost. State the reason in a comment.
- Do not memoise every handler by reflex. Unexplained memo obscures the cases where identity
  genuinely matters, and each one is a dependency array that can go stale.

Mandatory without measurement, because the cost is structural rather than incremental:
route-level code splitting, dynamic import of heavy widgets, server-side paged lists.
Virtualisation only above 200 rendered rows.


---

## 3. Project structure

```
src/
├── main.tsx                     React root, provider composition
├── App.tsx                      RouterProvider host
├── routes/
│   ├── paths.ts                 canonical path constants — the only place a URL string lives
│   ├── routes.tsx               static route tree (createBrowserRouter)
│   ├── navigation.ts            menu model derived from the route config
│   └── guards.tsx               RequireAuth, RequirePermission
├── auth/
│   ├── tokenStore.ts            in-memory access token
│   ├── permissions.ts           permission code constants + perm()
│   └── authApi.ts               login, refresh, logout
├── context/
│   ├── LanguageContext.tsx      locale, direction, t()
│   └── AuthContext.tsx          session, useAuth(), useCan()
├── layout/
│   ├── AppShell.tsx             Topbar + Sidebar + <Outlet />
│   ├── Sidebar.tsx              navigation from routes/navigation.ts
│   └── Topbar.tsx
├── components/ui/               primitives, grouped by capability
│   ├── Button.tsx               Button, IconButton
│   ├── FormControls.tsx         Input, Select, Checkbox, Switch
│   ├── DataDisplay.tsx          Card, Stat, Badge, Avatar, DataTable
│   └── OverlaysAndFeedback.tsx  Alert, EmptyState, Tabs, Breadcrumb, Dialog, Drawer, Toast
├── features/<feature>/          domain logic, one folder per feature
│   ├── model.ts                 DTO types, Zod schema, form mapper
│   ├── api.ts                   typed endpoint functions
│   ├── hooks.ts                 query keys, queries, mutations
│   ├── confirmActions.ts        permission- and usage-checked handlers
│   └── components/              feature-specific presentational parts
├── pages/                       screen views, one per route
├── data/                        cross-feature domain types
├── lib/
│   ├── http/                    client.ts, refreshQueue.ts
│   ├── errors/                  ApiError, normalize, mapBackendError
│   └── format/                  Intl wrappers
└── styles/
    ├── styles.css               reset, imports, avl-* base classes
    └── tokens/                  colors, typography, spacing, elevation, breakpoints, fonts, responsive
```

**Dependency direction — imports flow downward only:**

```
routes → layout → pages → features/<f>/{hooks, components, confirmActions}
                                 ↓                    ↓
                              api.ts  ─────────────► model.ts
                                 ↓                    ↓
                          lib/ ◄── components/ui ◄── context/
```

- `features/*/api.ts` imports `model.ts` and `lib/`. Never React, never `hooks.ts`.
- `features/*/hooks.ts` imports `api.ts`, `model.ts`, `lib/`. Never `pages/`.
- `components/ui/` imports nothing from `features/` or `pages/`.
- Pages import their own feature only. **No cross-feature imports** — promote a shared type to `src/data/`.
- `src/lib/` imports nothing from `features/`, `pages/`, or `layout/`.

## 4. Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Component and page files | `PascalCase.tsx` | `AccountForm.tsx` |
| Utility, data, hook, api files | `camelCase.ts` | `mockData.ts`, `accountsApi.ts` |
| CSS files | `kebab-case.css` | `responsive.css` |
| CSS custom properties | `--kebab-case`, semantic prefix | `--brand-primary`, `--surface-sunken` |
| CSS classes | `avl-<block>__<element>--<modifier>` | `avl-card__header--compact` |
| Feature folder | `camelCase` | `features/accounts/` |
| Hook | `use` + PascalCase | `useAccountList` |
| Query key factory | `<feature>Keys` | `accountKeys` |
| API object | `<feature>Api` | `accountsApi` |
| DTO type | `<Entity>Dto`, `Create<Entity>Request` | `AccountDto` |
| Form values | `<Entity>FormValues` | `AccountFormValues` |
| Zod schema | `<entity>FormSchema` | `accountFormSchema` |
| Path constant | `PATHS.<area>.<screen>` | `PATHS.accounts.list` |
| Permission | `perm(ACCOUNT, 'UPDATE')` | `ACCOUNT_UPDATE` |
| Route param | `<entityCamel>Id` | `:accountId` |

Page components are the only default exports, because `React.lazy` requires it. Everything
else uses named exports.

## 5. Cross-cutting contracts

**Envelope.** Every response is `{ data, errorCode?, message?, correlationId? }`, unwrapped
once in `lib/http`. Features see `T`.

**Search.** Every paged list posts `SearchRequest { filters, sorts, page, size }` to
`POST /<resource>/search` and receives `PagedResponse<T>`. One contract for the whole app.

**Activation.** State changes are separate endpoints — `PUT /{id}/activate` and
`PUT /{id}/deactivate` — never one toggle taking a boolean.

**Usage gating.** Destructive actions consult `GET /{id}/usage` for `canDelete`,
`canDeactivate`, and blocking reasons before offering the action.

**Immutability.** Natural keys and parent foreign keys are absent from update requests on
both sides of the wire and disabled in edit forms.

**Translation.** Every user-facing string is a `t()` key present in both `en` and `ar`
dictionaries, with a documented fallback.
