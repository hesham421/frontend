<!-- Source: PHASE:F2 / SUB:F2-SCR-SEC-004 -->
<!-- Context: see F2-HEADER.md for phase-level strategy, registry table, and intro -->


### F2 — SCR-SEC-004 — Permission Registry

```
Shell status: CONFIRMED. Entity: ENTITY-SEC-003 (Permission, primary).
```

### F2-QUERY — API-SEC-027 — Update permission
```
HTTP method    : PUT
Endpoint path  : /api/permissions/{id}
Request shape  : UpdatePermissionRequest { name (required) } — only
                 `name` is writable; permissionType/pageId are NOT
                 updatable via this endpoint (confirmed — CORRECTION
                 for F3/F4: edit dialog fields beyond `name` must be
                 rendered read-only, not silently allowed to submit)
Response shape : PermissionDto
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login
Invalidation   : ['permissions']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-028 — Create new permission
```
HTTP method    : POST
Endpoint path  : /api/permissions
Request shape  : CreatePermissionRequest { name (required), pageId?,
                 permissionType? }
Response shape : PermissionDto
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login
Invalidation   : ['permissions']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-029 — Search permissions
```
HTTP method    : POST
Endpoint path  : /api/permissions/search
Request shape  : PermissionSearchContractRequest { filters[] (allowed:
                 name, module — module is the indirect join-filter, see
                 F1-MODEL ENTITY-SEC-003 correction #1), sorts[]
                 (allowed: id, name, module, createdAt, updatedAt),
                 page, size }
Response shape : paginated list of PermissionDto
Hook type      : useMutation (POST-as-query pattern)
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (PERMISSION_VIEW required)
Loading        : LOCAL
Caching        : n/a (mutation pattern)
```

### F2-SCREEN-INIT — SCR-SEC-004 — Permission Registry
```
On mount:
  1. Permission hook for SCR-SEC-004 -> canView, canCreate, canEdit
     (canDelete: n/a — no delete endpoint exists, confirmed match to
     Shell's own "No Delete button per spec")
  2. LOV-SEC-001 (permissionType) — see F2-LOV-QUERY block below: a
     genuine deviation, not a runtime lookup call
  3. Composite Screen (CORE-9) — entry dialog opens from a row/create
     action
Search screen state: searchFilters (incl. currentPage/pageSize) drives
  API-SEC-029.
```

### F2-LOV-QUERY — LOV-SEC-001 — Permission Type
```
LOV-ID           : LOV-SEC-001
LOOKUP_CODE      : NONE — this is a DOCUMENTED DEVIATION, not a real
                   MD_LOOKUP_DETAIL-backed LOV. srs.md ENTITY-SEC-003
                   is explicit: "permissionType مُخزَّن كـ Java enum عبر
                   @Enumerated(STRING)، وليس مقروءاً من MD_LOOKUP_DETAIL
                   كما تتطلب LOV-1/LOV-4 القياسية" — stored as a Java
                   enum, not read from the standard lookup table.
Hook name        : NONE — there is no runtime endpoint to call. This
                   plan does NOT invent a GET /api/v1/sys/lookups/...
                   call for this value set, since none exists (HR-1).
Values (hardcoded client-side constant, per confirmed real API/LOV-1
  deviation note): 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' — plus the
  `null` case representing a page-less "system permission" (see
  F1-MODEL ENTITY-SEC-003 correction #2 — NOT a literal 'SYSTEM' value)
Used by field    : permissionType in Permission (ENTITY-SEC-003)
Caching          : n/a — compile-time constant, not fetched
Reuse rule       : this constant array is the single shared source used
                   anywhere permissionType needs to be rendered/
                   selected — never re-declared ad hoc in a component
```

### F2-FACADE-HOOK — SCR-SEC-004 — Permission Registry
```
Facade Hook name : usePermissionRegistryFacade()
Composes         : useSearchPermissions (API-SEC-029), useCreate
                   Permission (API-SEC-028), useUpdatePermission
                   (API-SEC-027), plus the LOV-SEC-001 constant (not a
                   hook — a static import) and a read-only page-options
                   read composed from SCR-SEC-005 (for the "associated
                   screen" picker — see F1-SCREEN SCR-SEC-004's flagged
                   module-field ambiguity, unresolved here)

STATE OWNED: permissionList (from useSearchPermissions), selectedPerm
  (local useState), isLoading (derived), searchFilters (currentPage/
  pageSize inside), pageOptions (from the composed page-list read)

OPERATIONS EXPOSED: createPermission(data), updatePermission(id,
  { name }) — note the write surface is name-only, per API-SEC-027 —
  selectPermission(perm), setSearchFilters(filters)

BOUNDARIES: components call this Facade only; composes the F2-QUERY
  hooks above only.
```

