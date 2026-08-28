# UI Shell Manifest — SECURITY
Extracted: 2026-08-28
Source: src/pages/Security/ (+ shared components in src/components/features/ used exclusively by this module)
GATE: UI SHELL COMPLETE confirmed: Yes — confirmed verbally by user in this session (no `execution-state.json` exists to check programmatically; governance/modules/SECURITY tracking data was removed in commit `29f8587`)

> **Structural note (read before using this manifest):** This prompt assumes a
> `frontend/src/features/[module-kebab]/` + `[module].routes.tsx` (React Router)
> layout. This repo does not use that layout. Modules live at
> `src/pages/<Module>/`, and navigation is a single `switch` statement in
> `src/App.tsx` driven by a Zustand store (`useNavigationStore`), keyed by
> string "screen" identifiers (e.g. `'sec-users'`) — not URL paths, not
> React Router, no `<Routes>`/`<Route>` tree. This is documented explicitly
> in the Route section below and flagged as a gap since it deviates from
> what F1/F4 likely expect ("route path", "route guard").

## Components

```
Component name : UsersPage
File path      : src/pages/Security/Users.tsx
Type           : Page component (screen-mounted via App.tsx switch, no route path)
Props accepted : none (React.FC with no props — reads all state from useSecurityStore())
Renders        : breadcrumb + header + KPI stat row (total/active/inactive users) + search/status filter bar + users data table + create/edit dialog (with embedded role-checkbox list) + confirm-delete dialog; opens UserProfileDrawer and DataScopeDrawer as sub-flows
```

```
Component name : RolesPage
File path      : src/pages/Security/Roles.tsx
Type           : Page component (screen-mounted via App.tsx switch, no route path)
Props accepted : none (React.FC with no props — reads all state from useSecurityStore())
Renders        : breadcrumb + header + KPI stat row (total/active/inactive roles) + search/status filter bar + roles data table + create/edit dialog with embedded permission matrix (per-screen canView/canCreate/canUpdate/canDelete checkboxes, "sync all" and "copy from another role" actions) + activate/deactivate confirm dialog; opens DataScopeDrawer as a sub-flow
```

```
Component name : PermissionsPage
File path      : src/pages/Security/Permissions.tsx
Type           : Page component (screen-mounted via App.tsx switch, no route path)
Props accepted : none (React.FC with no props — reads all state from useSecurityStore())
Renders        : breadcrumb + header + KPI stat row (total/VIEW-grants/write-grants) + search/module filter bar + permissions data table + create/edit dialog (name, type, module, associated screen) — no delete action per in-code comment "No Delete button per spec"
```

```
Component name : PagesRegistryPage
File path      : src/pages/Security/Pages.tsx
Type           : Page component (screen-mounted via App.tsx switch, no route path)
Props accepted : none (React.FC with no props — reads all state from useSecurityStore())
Renders        : breadcrumb + header + KPI stat row (total/active/inactive screens) + search/module/status filter bar + flat screens data table (explicitly flat, not tree — in-code comment "per OQ-013") + create/edit drawer (code, nameEn/nameAr, route path, icon, module, parent menu node, display order, description, active) + activate/deactivate actions
```

```
Component name : UserProfileDrawer
File path      : src/components/features/UserProfileDrawer.tsx
Type           : reusable presentational component (shared; used only by UsersPage in this module)
Props accepted : isOpen: boolean; onClose: () => void; user: AppUser | null
Renders        : drawer form — fullNameEn, fullNameAr, assigned branch (from useOrganizationStore), preferred language, employee ID, active switch
```

```
Component name : DataScopeDrawer
File path      : src/components/features/DataScopeDrawer.tsx
Type           : reusable presentational component (shared; used by UsersPage and RolesPage)
Props accepted : isOpen: boolean; onClose: () => void; scope: DataScope | null; roleId?: string
Renders        : drawer form — role select, assigned branch select (from useOrganizationStore), data access level select (BRANCH/CHILDREN/ALL), active switch, conditional delete button
```

Note: `src/components/features/FileAttachmentPanel.tsx` exists in the same
shared directory but is not imported by any Security page — excluded as out
of scope for this module.

## Routes

No route config file exists (no React Router, no `[module].routes.tsx`).
Navigation is implemented as a `switch (currentScreen)` in `src/App.tsx`,
where `currentScreen` is a string held in `useNavigationStore` (Zustand),
set via `setCurrentScreen`. Below is the App.tsx-declared mapping, in the
exact order the `switch` cases appear (App.tsx:49-57):

```
Screen key     : sec-users
Component      : UsersPage
Guard present  : No per-screen guard. A single top-level check in App.tsx
                 (`if (!isAuthenticated) return <Login .../>`) gates the
                 entire app before AppShell renders — there is no
                 <ProtectedRoute>-style per-route/per-screen guard.
Child routes   : none (flat switch, no nesting)
```

```
Screen key     : sec-roles
Component      : RolesPage
Guard present  : No per-screen guard (see note above)
Child routes   : none
```

```
Screen key     : sec-permissions
Component      : PermissionsPage
Guard present  : No per-screen guard (see note above)
Child routes   : none
```

```
Screen key     : sec-pages
Component      : PagesRegistryPage
Guard present  : No per-screen guard (see note above)
Child routes   : none
```

**Inconsistency to flag for F4:** the `AppScreen` data model (Page Registry,
`src/data/mockData.ts`) stores a `route` field with real URL-shaped paths
(e.g. `/security/users`, `/security/roles`, `/security/permissions`,
`/security/pages`) as if the app were URL-routed. These stored `route`
values are **not** actually wired to any router or used by the navigation
switch in App.tsx — the two mechanisms (Page Registry `route` strings vs.
App.tsx `currentScreen` keys) exist in parallel and appear disconnected.
P3.2/F4 needs to decide which is authoritative before integration.

## Existing Models/Interfaces

All declared in `src/data/mockData.ts`.

```
Name    : AppUser
Fields  : id: string; username: string; email: string; enabled: boolean; roles: string[] (Role IDs); profile?: UserProfile
Source  : src/data/mockData.ts:28-35
```

```
Name    : UserProfile
Fields  : fullNameAr: string; fullNameEn: string; branchId: string; preferredLang: 'ar' | 'en'; employeeId: string; isActive: boolean
Source  : src/data/mockData.ts:19-26
```

```
Name    : AppRole
Fields  : id: string; roleCode: string (read-only after first save); roleName: string; description: string; isActive: boolean; permissions: RolePermission[]
Source  : src/data/mockData.ts:45-52
```

```
Name    : RolePermission
Fields  : pageId: string; canView: boolean; canCreate: boolean; canUpdate: boolean; canDelete: boolean
Source  : src/data/mockData.ts:37-43
```

```
Name    : AppPermission
Fields  : id: string; name: string (pattern PERM_<CODE>_<TYPE>); permissionType: 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'SYSTEM'; pageId?: string; module: string
Source  : src/data/mockData.ts:54-60
```

```
Name    : AppScreen
Fields  : id: string; pageCode: string; nameEn: string; nameAr: string; module: 'SEC' | 'ORG' | 'FILE' | 'NOTIF' | 'FIN' | 'HR' | 'INV'; route: string; icon?: string; parentId?: string; displayOrder?: number; description?: string; isActive: boolean
Source  : src/data/mockData.ts:62-74
```

```
Name    : DataScope
Fields  : id: string; roleId: string; branchId: string; dataAccessLevel: 'BRANCH' | 'CHILDREN' | 'ALL'; isActive: boolean
Source  : src/data/mockData.ts:76-82
```

```
Name    : UserProfileDrawerProps
Fields  : isOpen: boolean; onClose: () => void; user: AppUser | null
Source  : src/components/features/UserProfileDrawer.tsx:10-14
```

```
Name    : DataScopeDrawerProps
Fields  : isOpen: boolean; onClose: () => void; scope: DataScope | null; roleId?: string
Source  : src/components/features/DataScopeDrawer.tsx:10-15
```

## Data Sources (pre-integration)

```
Component      : UsersPage
Data source    : Zustand store (useSecurityStore) seeded from imported mock array `mockUsers` (src/data/mockData.ts) — no API binding
Shape observed : { id: 'usr-1', username: 'admin', email: 'admin@avelynq.com', enabled: true, roles: ['role-1'], profile?: {...} }
```

```
Component      : RolesPage
Data source    : Zustand store (useSecurityStore) seeded from imported mock array `mockRoles` — no API binding
Shape observed : { id: 'role-1', roleCode: 'ROLE_SUPER_ADMIN', roleName: 'System Administrator', description: '...', isActive: true, permissions: [...] }
```

```
Component      : PermissionsPage
Data source    : Zustand store (useSecurityStore) seeded from imported mock array `mockPermissions` — no API binding
Shape observed : { id: 'perm-1', name: 'PERM_SEC_USERS_VIEW', permissionType: 'VIEW', pageId: 'SCR-SEC-002', module: 'SEC' }
```

```
Component      : PagesRegistryPage
Data source    : Zustand store (useSecurityStore) seeded from imported mock array `mockScreens` — no API binding
Shape observed : { id: 'SCR-SEC-002', pageCode: 'SCR_SEC_USERS', nameEn: 'User Management', nameAr: '...', module: 'SEC', route: '/security/users', icon: 'ti ti-users', isActive: true }
```

```
Component      : UserProfileDrawer / DataScopeDrawer
Data source    : Same useSecurityStore (mock-seeded), plus branch options read from a second store, useOrganizationStore (mock-seeded) — no API binding
Shape observed : n/a (consumes records passed down from parent pages; branch options shaped as { id, nameEn, branchCode, isActive })
```

## Gaps (not found — expected integration work for P3.2 F4)

- No routing file / React Router config found at all — navigation is an
  ad hoc `switch (currentScreen)` in `src/App.tsx` keyed by string screen
  IDs, not URL paths. F4 will need to decide whether to introduce real
  routing or document the switch-based approach as final.
- No per-route/per-screen guard component (no `<ProtectedRoute>`). There is
  only one global `isAuthenticated` check in `App.tsx` gating the entire
  authenticated app shell — 0/4 screens have an individual guard, because
  the concept doesn't exist in this architecture.
- Data Page Registry (`AppScreen.route`) stores URL-shaped paths that are
  disconnected from the actual navigation mechanism (see "Inconsistency to
  flag for F4" note under Routes) — needs reconciliation before this is
  treated as the routing source of truth.
- All four pages and both shared drawers run entirely on mock/local state
  (Zustand stores seeded from `src/data/mockData.ts`) — zero API/network
  calls exist anywhere in this module's Shell. Full backend integration is
  outstanding for every screen.
- No loading, error, or empty-from-network states exist (the only empty
  state shown is client-side "no records match filter", via `<EmptyState>`)
  — these will need to be added when real API integration lands.
