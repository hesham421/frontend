---
name: create-routing
description: "Generates the application's routing layer with React Router v7: canonical path constants, a static code-first route tree, lazy loading, auth and permission guards, error and 404 routes, and a navigation model derived from the route config. Use when adding a screen, auditing route guards, or replacing state-driven view switching."
---

# Skill: create-routing

## Description
Generates `src/routes/` and wires a screen into it. Implements AD-1, AD-2, AD-3.
Rules: `references/contract-rules.md` §R.5, §P.

## When to Use
- Adding a screen or making one reachable
- Standing up routing for the first time
- Auditing guards, deep links, or navigation
- Replacing `currentScreen` state switching with real routes

## When NOT to Use
- Tab switching *within* one screen — that is `useState` or a URL search param, not a route
- Backend permission definitions — this skill consumes grants, never defines them
- Modal or drawer visibility — not routes unless the URL must reproduce them

## Output

```
src/routes/paths.ts         canonical path constants
src/routes/routes.tsx       static route tree
src/routes/navigation.ts    menu model
src/routes/guards.tsx       RequireAuth, RequirePermission
```

---

## The rule that shapes everything else

**Routes are declared in code. Nothing about the URL space comes from an API.**

The frontend owns its own URLs, its own screens, and its own navigation graph. The backend
owns one thing the frontend cannot know: **what this user is allowed to do**. That arrives
as a flat list of permission codes on the session payload, and nothing else about routing
crosses the wire.

This split matters in practice:

| Concern | Owner | Why |
|---|---|---|
| Which screens exist | frontend | It is a fact about the bundle, not about data |
| What each URL is | frontend | A rename is a refactor, not a data migration |
| Which screen a menu item opens | frontend | CI can verify it; an API response cannot be type-checked |
| Which permissions a user holds | backend | Genuinely user-specific and security-relevant |
| Whether the server honours those permissions | backend | The actual control (AD-6) |

Fetching the route table would make every navigation depend on a network call, defeat
per-route code splitting, and leave the app unable to render its own menu when the API is
slow — while adding nothing that improves security, because the server enforces
authorization regardless of what the client believes.

## Step 1 — Path constants (`paths.ts`)

One place where a URL string exists. Everything else imports from here, so a path change is
a single edit that the compiler propagates.

```ts
export const PATHS = {
  login: '/login',
  forbidden: '/forbidden',
  dashboard: '/',

  accounts: {
    list: '/accounts',
    new: '/accounts/new',
    edit: (accountId: string | number) => `/accounts/${accountId}/edit`,
    editPattern: '/accounts/:accountId/edit',
  },

  organization: {
    root: '/organization',
    tab: (tab: OrgTab) => `/organization?tab=${tab}`,
  },
} as const;
```

Two entries per parameterised route: a **builder** for navigation and a **pattern** for the
route definition. Hand-writing `` `/accounts/${id}/edit` `` at a call site is how a path
silently drifts from its route.

Organization tabs are a search param, not a path segment — the tab is a view preference on
one screen, and search params keep it shareable without multiplying routes (R.5.8).

## Step 2 — Permission constants

```ts
// src/auth/permissions.ts
export type PermissionAction = 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE';

export const RESOURCES = {
  ACCOUNT: 'ACCOUNT',
  ORG_UNIT: 'ORG_UNIT',
  DEPARTMENT: 'DEPARTMENT',
} as const;

export const perm = (resource: string, action: PermissionAction) => `PERM_${resource}_${action}`;
```

`perm(RESOURCES.ACCOUNT, 'UPDATE')` yields `PERM_ACCOUNT_UPDATE`. The `PERM_` prefix is not
stylistic — it's what the backend actually issues in every authority string (confirmed by
decoding a live login JWT, see `references/architecture.md` AD-2); a `perm()` without it
produces codes that never match, for any user. Codes are never concatenated inline either: a
literal `'ACCOUNT_UPDAT'` is a check that silently never passes, and grep cannot tie it back
to a resource (P.4).

## Step 3 — Guards (`guards.tsx`)

```tsx
export function RequireAuth({ children }: PropsWithChildren) {
  const { data, isPending, isError } = useSession();   // AD-5 — the session query, no Context
  const location = useLocation();

  if (isPending) return <FullPageLoader />;                     // AD-3 — no flash
  if (isError || !data) {
    return <Navigate to={PATHS.login} replace state={{ from: location.pathname + location.search }} />;
  }
  return <>{children}</>;
}

export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const { can } = usePermission();
  if (!can(permission)) return <ForbiddenPage />;               // explicit 403, not a redirect
  return <>{children}</>;
}
```

Rendering a 403 instead of redirecting is deliberate. A redirect makes a misconfigured grant
look exactly like a broken link, so the user reports "the menu is broken" and support cannot
reproduce it.

## Step 4 — The route tree (`routes.tsx`)

```tsx
const Dashboard    = lazy(() => import('@/pages/Dashboard'));
const Accounts     = lazy(() => import('@/pages/Accounts'));
const AccountForm  = lazy(() => import('@/pages/AccountForm'));
const Organization = lazy(() => import('@/pages/Organization'));

/** Wraps a lazy page in its permission guard and a suspense boundary. */
const screen = (permission: string, element: React.ReactNode) => (
  <RequirePermission permission={permission}>
    <Suspense fallback={<PageSkeleton />}>{element}</Suspense>
  </RequirePermission>
);

function AccountEditRoute() {
  const { accountId } = useParams();
  return <AccountForm key={accountId} mode="edit" />;      // key resets state across records
}

export const router = createBrowserRouter([
  { path: PATHS.login, element: <Login />, errorElement: <RouteError /> },
  { path: PATHS.forbidden, element: <ForbiddenPage /> },

  {
    element: <RequireAuth><AppShell /></RequireAuth>,       // AppShell renders <Outlet />
    errorElement: <RouteError />,
    children: [
      { index: true, element: screen(perm(RESOURCES.ACCOUNT, 'VIEW'), <Dashboard />) },

      { path: PATHS.accounts.list,
        element: screen(perm(RESOURCES.ACCOUNT, 'VIEW'), <Accounts />) },
      { path: PATHS.accounts.new,
        element: screen(perm(RESOURCES.ACCOUNT, 'CREATE'), <AccountForm mode="create" />) },
      { path: PATHS.accounts.editPattern,
        element: screen(perm(RESOURCES.ACCOUNT, 'UPDATE'), <AccountEditRoute />) },

      { path: PATHS.organization.root,
        element: screen(perm(RESOURCES.ORG_UNIT, 'VIEW'), <Organization />) },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);
```

Points that are easy to get wrong:

- **Every route declares its own permission.** VIEW, CREATE, and UPDATE are distinct grants; a single guard on the layout cannot express them, and a user who may view accounts is not thereby allowed to create one.
- **`key={accountId}`** on the edit route. Without it, navigating `/accounts/1/edit → /accounts/2/edit` reuses the component instance and the form keeps the first record's values.
- **`errorElement` on every branch.** A lazy chunk that fails to load after a deploy otherwise renders a white screen with nothing the user can report.
- **`AppShell` renders `<Outlet />`**, not `children`. This is the change from a state-driven shell: the shell stays mounted across navigations, so sidebar scroll position and collapse state survive.

## Step 5 — Navigation derived from the route config (`navigation.ts`)

The menu is generated from the same declarations the router uses, so a screen cannot appear
in the menu without a route or drift to the wrong URL.

```ts
export interface NavItem {
  labelKey: string;          // translation key — t() resolves it (AD-10)
  icon: string;              // `ti ti-<name>` — Tabler webfont, both classes required
  path: string;
  permission: string;
}

export const NAV_SECTIONS: NavSection[] = [
  {
    labelKey: 'nav.finance',
    items: [
      { labelKey: 'nav.accounts', icon: 'ti ti-book', path: PATHS.accounts.list,
        permission: perm(RESOURCES.ACCOUNT, 'VIEW') },
    ],
  },
  {
    labelKey: 'nav.organization',
    items: [
      { labelKey: 'nav.orgStructure', icon: 'ti ti-sitemap', path: PATHS.organization.root,
        permission: perm(RESOURCES.ORG_UNIT, 'VIEW') },
    ],
  },
];

/** Sections with no visible items disappear entirely. */
export function useVisibleNav(): NavSection[] {
  const { can } = usePermission();
  return useMemo(
    () => NAV_SECTIONS
      .map((s) => ({ ...s, items: s.items.filter((i) => can(i.permission)) }))
      .filter((s) => s.items.length > 0),
    [can],
  );
}
```

Labels are translation keys, not literals, so the menu is bilingual like everything else.
Filtering by grant means a user never sees a link that would 403.

## Step 6 — Active state and deep links

```tsx
<NavLink to={item.path} className={({ isActive }) => cx('avl-nav__item', isActive && 'avl-nav__item--active')}>
```

`NavLink` derives active state from the URL. A `currentScreen` variable cannot, which is why
the prototype's sidebar loses its highlight on refresh.

Every screen is now deep-linkable and refresh-stable. List state — page, size, sort,
filters, active tab — belongs in search params for the same reason (R.5.8):

```tsx
const [params, setParams] = useSearchParams();
const searchRequest = parseSearchRequest(params);   // Zod-coerced, defaulted
```

## Step 7 — Adding a screen

1. Add the path to `PATHS`.
2. Add the resource to `RESOURCES` if new, and confirm the backend grants `<RESOURCE>_<ACTION>`.
3. Create the page in `src/pages/` with a default export.
4. Add the route with its permission and `errorElement`.
5. Add the nav item if it belongs in the menu.
6. Confirm the permission strings match the backend exactly — a typo fails closed and silently.

## Verify before finishing

- [ ] No URL string outside `paths.ts`
- [ ] No route, path, or menu item derived from an API response
- [ ] Every authenticated route inside `RequireAuth` and its own `RequirePermission`
- [ ] Create and edit routes guarded by CREATE and UPDATE, not VIEW
- [ ] Pages lazy-loaded with a `Suspense` fallback
- [ ] `errorElement` on every branch; `*` renders a 404
- [ ] `key` on routes whose identity changes across records
- [ ] Params named `<entity>Id`
- [ ] Navigation derived from the route config and filtered by grants
- [ ] Unauthorized renders 403; unauthenticated redirects with a return path
- [ ] List state in search params
- [ ] `AppShell` renders `<Outlet />`

## Violations requiring immediate rejection

| Pattern | Rule |
|---|---|
| Routes, paths, or menu items fetched from an API | AD-1, R.5.1 |
| URL string literal outside `paths.ts` | R.5.2 |
| `currentScreen`-style state switching instead of routes | AD-1 |
| Eager page import | R.5.3 |
| Route without `RequireAuth` or `RequirePermission` | R.5.4, P.1 |
| Operation route guarded with VIEW | R.5.5 |
| `:id` instead of `:<entity>Id` | R.5.6 |
| Branch without `errorElement`, or no `*` route | R.5.7 |
| Filters or page held outside the URL | R.5.8 |
| Redirect instead of an explicit 403 | R.5.9 |
| Hardcoded menu not filtered by grants | R.5.10 |
| Permission literal concatenated inline | P.4 |
| Missing `key` where route identity changes | R.4.10 |

## Alignment with general React guidance

**Consistent with:** `createBrowserRouter`, route-level lazy loading, `errorElement`,
`NavLink` active state, `useSearchParams` for shareable state, route `loader` prefetching
into the query cache.

**Deliberately different:** runtime route generation from an API is rejected (AD-1) for the
reasons above. Guarding only the layout is rejected because VIEW, CREATE, and UPDATE are
distinct grants a shared guard cannot express.
