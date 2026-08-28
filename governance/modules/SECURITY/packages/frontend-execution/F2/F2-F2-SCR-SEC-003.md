<!-- Source: PHASE:F2 / SUB:F2-SCR-SEC-003 -->
<!-- Context: see F2-HEADER.md for phase-level strategy, registry table, and intro -->


### F2 — SCR-SEC-003 — Role & RBAC Management

```
Shell status: CONFIRMED. Entity: ENTITY-SEC-002 (Role, primary) +
the separate Role-Pages-Matrix resource (ENTITY-SEC-004 join, per
F1-MODEL ENTITY-SEC-002 correction #2/#3).
```

### F2-QUERY — API-SEC-016 — Get role by ID
```
HTTP method    : GET
Endpoint path  : /api/roles/{roleId}
Response shape : RoleDto
Hook type      : useQuery
Query key      : ['roles', roleId]
Errors         : 401 -> login; 403 -> unauthorized (ROLE_VIEW required)
Loading        : LOCAL
Caching        : defaults
USAGE NOTE: this screen's own list comes from API-SEC-026 (search), not
this by-id GET — this hook is used by the cross-screen role-options
reads (SCR-SEC-002's roles multi-select resolution, SCR-SEC-007's role
select) when a single role needs re-confirming outside the list.
```

### F2-QUERY — API-SEC-017 — Update role
```
HTTP method    : PUT
Endpoint path  : /api/roles/{roleId}
Request shape  : UpdateRoleRequest { roleName (required), description?,
                 active? } — roleCode is immutable, confirmed absent
                 from this request shape
Response shape : RoleDto
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (ROLE_UPDATE required)
Invalidation   : ['roles']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-018 — Delete role
```
HTTP method    : DELETE
Endpoint path  : /api/roles/{roleId}
Response shape : 204 No Content
Hook type      : useMutation
Errors         : 401 -> login; 403 -> unauthorized (ROLE_DELETE
                 required); 409/422 -> toast (endpoint description:
                 "Returns 409 if role has user assignments" — same
                 undocumented-in-structured-table pattern as API-010)
Invalidation   : ['roles']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-019 — Get role pages matrix
```
HTTP method    : GET
Endpoint path  : /api/roles/{roleId}/pages
Response shape : RolePagesMatrixResponse { roleId, roleName,
                 assignments: [{ pageCode, pageName, pageNameAr,
                 permissions: string[] }] } — VIEW implicit, never in
                 the array (see F1-MODEL ENTITY-SEC-002 correction #3)
Hook type      : useQuery
Query key      : ['roles', roleId, 'pages']
Errors         : 401 -> login; 403 -> unauthorized (ROLE_VIEW required)
Loading        : LOCAL
Caching        : defaults
```

### F2-QUERY — API-SEC-020 — Bulk update role pages (replace mode)
```
HTTP method    : PUT
Endpoint path  : /api/roles/{roleId}/pages
Request shape  : SyncRolePagesRequest { assignments: [{ pageCode,
                 permissions: string[] }] } — full replace; VIEW
                 auto-added; empty array removes all pages
Response shape : RolePagesMatrixResponse
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (ROLE_UPDATE required)
Invalidation   : ['roles', roleId, 'pages']
Loading        : LOCAL
MAPS TO SHELL ACTION: "sync all" (per shell-manifest RolesPage.tsx
create/edit dialog description) — confirmed exact match, no correction.
```

### F2-QUERY — API-SEC-021 — Add page to role
```
HTTP method    : POST
Endpoint path  : /api/roles/{roleId}/pages
Request shape  : AddPageToRoleRequest { pageCode, permissions:
                 string[] } — VIEW auto-added
Response shape : PageAssignmentResponse
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (ROLE_UPDATE required)
Invalidation   : ['roles', roleId, 'pages']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-022 — Deactivate role
```
HTTP method    : PUT
Endpoint path  : /api/roles/{roleId}/deactivate
Response shape : RoleDto
Hook type      : useMutation
Errors         : 401 -> login
Invalidation   : ['roles']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-023 — Activate role
```
HTTP method    : PUT
Endpoint path  : /api/roles/{roleId}/activate
Response shape : RoleDto
Hook type      : useMutation
Errors         : 401 -> login
Invalidation   : ['roles']
Loading        : LOCAL
MAPS TO SHELL ACTION: single "activate/deactivate confirm dialog"
driving API-SEC-022/023 as two distinct calls — confirmed, no
correction (see F1-MODEL ENTITY-SEC-002 correction #6 — srs.md notes
these were unified into two proper separate paths on 2026-08-23).
```

### F2-QUERY — API-SEC-024 — Create new role
```
HTTP method    : POST
Endpoint path  : /api/roles
Request shape  : CreateRoleRequest { roleCode (pattern ^[A-Z][A-Z0-9_]
                 *$), roleName, description?, active? }
Response shape : RoleDto
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (ROLE_CREATE required)
Invalidation   : ['roles']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-025 — Copy page permissions from another role
```
HTTP method    : POST
Endpoint path  : /api/roles/{roleId}/copy-from/{sourceRoleId}
Response shape : CopyPermissionsResponse { roleId, roleName,
                 copiedFrom: { roleId, roleName }, assignments: [...] }
Hook type      : useMutation
Errors         : 401 -> login
Invalidation   : ['roles', roleId, 'pages']
Loading        : LOCAL
GOVERNANCE NOTE: endpoint description confirms only page-scoped
permissions (PAGE_ID_FK IS NOT NULL) are copied; any system-level
(page-less) permissions on the target role are explicitly left
untouched. No F1 model correction needed — this is a backend behavior
note the Facade/UI copy-confirmation text should reflect, not a data
shape issue.
MAPS TO SHELL ACTION: "copy from another role" — confirmed exact match.
```

### F2-QUERY — API-SEC-026 — Search roles
```
HTTP method    : POST
Endpoint path  : /api/roles/search
Request shape  : RoleSearchContractRequest { filters[] (allowed field:
                 roleName only), sorts[] (allowed: id, roleName), page,
                 size }
Response shape : paginated list of RoleDto
Hook type      : useMutation (POST-as-query pattern, see SCR-SEC-002
                 note under API-SEC-015)
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (ROLE_VIEW required)
Loading        : LOCAL
Caching        : n/a (mutation pattern)
GAP: allowed filter fields are roleName ONLY — no filter by `active`
status is documented, even though shell-manifest describes a
"search/status filter bar" on RolesPage. This plan does not invent a
server-side status filter that doesn't exist; the status filter must
be applied CLIENT-SIDE on the fetched page's results, which is a real,
confirmed limitation (results are only correct within the currently
loaded page, not across the full dataset) — carried forward, not
silently presented as a true server-side filter.
```

### F2-QUERY — API-SEC-050 — Remove page from role
```
HTTP method    : DELETE
Endpoint path  : /api/roles/{roleId}/pages/{pageCode}
Response shape : 204 No Content — removes VIEW + all CRUD permissions
                 for that page entirely
Hook type      : useMutation
Errors         : 401 -> login; 403 -> unauthorized (ROLE_UPDATE
                 required)
Invalidation   : ['roles', roleId, 'pages']
Loading        : LOCAL
```

### F2-SCREEN-INIT — SCR-SEC-003 — Role & RBAC Management
```
On mount:
  1. Permission hook for SCR-SEC-003 -> canView, canCreate, canEdit,
     canDelete
  2. No formal LOV hooks (permission-type values used inside the
     matrix are the LOV-SEC-001 Java-enum deviation — hardcoded client
     constants, not a runtime lookup call — see F2-LOV-QUERY note under
     SCR-SEC-004 where this is documented once in full)
  3. Composite Screen (CORE-9) — entry dialog opens from a row action,
     with a nested API-SEC-019 (get-pages-matrix) fetch once a role is
     selected for edit
Search screen state: searchFilters (incl. currentPage/pageSize) drives
  API-SEC-026; client-side status sub-filter applied to the loaded page
  (see GAP note under API-SEC-026).
```

### F2-FACADE-HOOK — SCR-SEC-003 — Role & RBAC Management
```
Facade Hook name : useRoleManagementFacade()
Composes         : useSearchRoles (API-SEC-026), useCreateRole
                   (API-SEC-024), useUpdateRole (API-SEC-017),
                   useDeleteRole (API-SEC-018), useActivateRole
                   (API-SEC-023), useDeactivateRole (API-SEC-022),
                   useRolePagesMatrix (API-SEC-019, enabled only when a
                   role is selected for edit), useSyncRolePages
                   (API-SEC-020), useAddPageToRole (API-SEC-021),
                   useRemovePageFromRole (API-SEC-050), useCopyFromRole
                   (API-SEC-025)

STATE OWNED:
  roleList         — from useSearchRoles' data
  selectedRole      — local useState (null if none)
  pageMatrix         — from useRolePagesMatrix's data, enabled: !!
                       selectedRole
  isLoading           — derived from composed hooks
  searchFilters       — local useState (currentPage/pageSize inside)

OPERATIONS EXPOSED:
  createRole(data), updateRole(id, data), deleteRole(id),
  activateRole(id), deactivateRole(id), syncRolePages(roleId,
  assignments) -> "sync all", copyFromRole(roleId, sourceRoleId) ->
  "copy from another role", addPageToRole(roleId, pageCode,
  permissions), removePageFromRole(roleId, pageCode),
  selectRole(role), setSearchFilters(filters)

BOUNDARIES: components call this Facade only; composes the F2-QUERY
  hooks above only.
```

