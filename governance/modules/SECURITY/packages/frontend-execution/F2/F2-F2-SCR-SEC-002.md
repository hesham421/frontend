<!-- Source: PHASE:F2 / SUB:F2-SCR-SEC-002 -->
<!-- Context: see F2-HEADER.md for phase-level strategy, registry table, and intro -->


### F2 — SCR-SEC-002 — User Management

```
Shell status: CONFIRMED. Entity: ENTITY-SEC-001 (UserAccount), plus
cross-references to ENTITY-SEC-002 (roles by name) and, via the two
drawers, ENTITY-SEC-009/ENTITY-SEC-010 (their own F2 blocks live under
SCR-SEC-006/SCR-SEC-007 respectively — this screen's Facade Hook only
launches those drawers, it does not compose their query hooks).
```

### F2-QUERY — API-SEC-009 — Update user
```
HTTP method    : PUT
Endpoint path  : /api/users/{userId}
Request shape  : UpdateUserRequest { username?, password?, enabled?,
                 roleNames?: string[] } (all optional)
Response shape : UserDto
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login
Invalidation   : ['users'] (list/search), ['users', userId] (detail,
                 if a by-id query is ever added — none exists today,
                 see API-SEC-013 note)
Loading        : LOCAL
```

### F2-QUERY — API-SEC-010 — Delete user
```
HTTP method    : DELETE
Endpoint path  : /api/users/{userId}
Request shape  : void
Response shape : 204 No Content
Hook type      : useMutation
Errors         : 401 -> login; 409/422 -> toast (endpoint description:
                 "if they have no child relationships" implies a real
                 conflict path not captured in the doc's structured
                 error table — see PHASE F2 global 409/422 note)
Invalidation   : ['users']
Loading        : LOCAL
GOVERNANCE NOTE: RULE-SEC-049 (srs.md ENTITY-SEC-001, "Delete مقيَّد")
confirms deletion is restricted — consistent with this endpoint's own
"if they have no child relationships (e.g., active refresh tokens)"
description. No pre-flight check endpoint exists (see PHASE F2 global
pre-deactivation note) — the delete call itself is the check.
```

### F2-QUERY — API-SEC-011 — Get user roles
```
HTTP method    : GET
Endpoint path  : /api/users/{userId}/roles
Request shape  : void
Response shape : array of role-name strings (undocumented element
                 shape beyond "Returns list of role names")
Hook type      : useQuery
Query key      : ['users', userId, 'roles']
Errors         : 401 -> login
Loading        : LOCAL
Caching        : defaults
```

### F2-QUERY — API-SEC-012 — Assign roles to user
```
HTTP method    : PUT
Endpoint path  : /api/users/{userId}/roles
Request shape  : AssignRolesRequest { roleNames: string[] } (full
                 replace — removes existing roles not in the array)
Response shape : UserDto
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login;
                 403 FORBIDDEN -> unauthorized (requires
                 USER_MANAGE_ROLES permission — confirmed, only
                 endpoint in this file with an explicit permission
                 requirement)
Invalidation   : ['users'], ['users', userId, 'roles']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-013 — List all users
```
HTTP method    : GET
Endpoint path  : /api/users
Request shape  : pageable (sort format 'fieldName,asc|desc'; allowed
                 sort fields: id, username, enabled, createdAt, updated
                 At)
Response shape : paginated list of UserDto
Hook type      : useQuery
Query key      : ['users', { page, size, sort }] — see API-SEC-015 for
                 the filtered variant this screen actually uses; this
                 plain-list endpoint is the fallback with no filter
                 support (no search fields) — SCR-SEC-002's search bar
                 requires API-SEC-015 (search), not this endpoint
Errors         : 401 -> login
Loading        : LOCAL
Caching        : defaults
```

### F2-QUERY — API-SEC-014 — Create new user
```
HTTP method    : POST
Endpoint path  : /api/users
Request shape  : CreateUserRequest { username, password } — see F1-
                 MODEL ENTITY-SEC-001 correction #6: no email, no
                 roleNames, no enabled at creation
Response shape : UserDto
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login
Invalidation   : ['users']
Loading        : LOCAL
FLOW IMPLICATION: since Create cannot set roles or enabled state, the
Create dialog's "save" action in this plan is a two-step sequence:
(1) POST /api/users, then (2) if the form captured roles, immediately
follow with PUT /api/users/{newUserId}/roles (API-SEC-012) using the
returned id. This is not optional UX polish — it is required to match
what ui-ux-spec.md's single-dialog Create form implies the user
experiences, given the real API has no single-call equivalent. Flagged
here rather than silently assumed: the Facade Hook (below) must expose
this as one composed operation, not two independent ones the component
has to sequence itself (F4-RULE-6 boundary).
```

### F2-QUERY — API-SEC-015 — Dynamic search for users
```
HTTP method    : POST
Endpoint path  : /api/users/search
Request shape  : UserSearchContractRequest { filters[] (field: id|
                 username|enabled|createdAt, operator, value), sorts[],
                 page, size } — operators: EQ/NE/GT/GE/LT/LE/LIKE/IN/
                 IS_NULL/IS_NOT_NULL/BETWEEN
Response shape : paginated list of UserDto
Hook type      : useMutation (POST-as-query pattern — this endpoint is
                 semantically a read but is a POST; TanStack Query
                 still models it as useMutation per this project's
                 established convention for *-search endpoints,
                 declared once here and reused by every other -search
                 endpoint below without repeating this note)
Effective "query key" equivalent : searchFilters object lives in
                 Facade state exactly as a GET query key would (PHASE
                 F2 global State ownership note) even though the call
                 itself is a mutation — currentPage/pageSize still live
                 inside this same object, never separate useState
Errors         : 400 INVALID_JSON -> inline; 401 -> login
Loading        : LOCAL
Caching        : n/a (mutation pattern) — component-level manual
                 re-trigger on searchFilters change (not automatic
                 TanStack refetch-on-key-change, since this is a
                 mutation not a query) — DRV-ID: consequence of the
                 backend exposing search as POST rather than GET with
                 query params; not a deviation this plan introduces,
                 it is forced by the real endpoint shape
```

### F2-SCREEN-INIT — SCR-SEC-002 — User Management
```
On mount:
  1. Permission hook for SCR-SEC-002 -> canView, canCreate, canEdit,
     canDelete (canApprove: n/a, no approval workflow on this screen)
  2. No LOV hooks directly (roles multi-select sources from
     SCR-SEC-003's role list — see Facade below, not a formal LOV)
  3. Not an Entry screen with a single by-PK query — this is a
     Composite Screen (CORE-9): Search+Entry under one SCR-ID, entry
     dialog opens from a row/action, not from a route param
Search screen state: searchFilters (incl. currentPage/pageSize) drives
  API-SEC-015 per the global State ownership rule.
```

### F2-FACADE-HOOK — SCR-SEC-002 — User Management
```
Facade Hook name : useUserManagementFacade()
Composes         : useSearchUsers (API-SEC-015), useCreateUser
                   (API-SEC-014), useUpdateUser (API-SEC-009),
                   useDeleteUser (API-SEC-010), useAssignRoles
                   (API-SEC-012), plus a read-only useRolesOptions
                   composed from SCR-SEC-003's role-search hook (for
                   the roles multi-select — roles are looked up by
                   name, per F1-MODEL ENTITY-SEC-001 correction #2)

STATE OWNED:
  userList          — from useSearchUsers' data — not duplicated
  selectedUser       — local useState (null if none)
  isLoading          — derived from composed hooks' isLoading/
                       isFetching
  searchFilters      — local useState; currentPage/pageSize inside it
  roleOptions        — from the composed role-list hook's data (for
                       the roles multi-select and, indirectly, for
                       resolving role NAME <-> role display label)
  kpiCounts          — DERIVED client-side from the currently loaded
                       page's data, NOT from a dedicated summary
                       endpoint (see F1-SCREEN SCR-SEC-002 GAP note —
                       no count/summary endpoint exists). This is an
                       explicit, imperfect approximation carried
                       forward, not silently presented as exact totals
                       across all pages.

OPERATIONS EXPOSED:
  createUser(data)          -> composed 2-step: POST /api/users, then
                                (if roles selected) PUT .../roles —
                                exposed as ONE operation per the Flow
                                Implication note under API-SEC-014
  updateUser(id, data)      -> PUT /api/users/{userId}
  deleteUser(id)            -> DELETE (409/422 handled via toast, no
                                separate pre-check call — see PHASE F2
                                global pre-deactivation note)
  assignRoles(userId, names)-> PUT /api/users/{userId}/roles
  selectUser(user)          -> updates selectedUser — no API call
  setSearchFilters(filters) -> triggers useSearchUsers re-invocation

BOUNDARIES: components call this Facade only; this Facade composes the
  F2-QUERY hooks above only, plus the cross-screen role-options read.
```

