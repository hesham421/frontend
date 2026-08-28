<!-- Source: PHASE:F2 / SUB:F2-SCR-SEC-007 -->
<!-- Context: see F2-HEADER.md for phase-level strategy, registry table, and intro -->


### F2 — SCR-SEC-007 — Role Data Scope (Branch Assignment)

```
Shell status: CONFIRMED (DataScopeDrawer.tsx). Entity: ENTITY-SEC-010
(SecRoleBranch) exclusively. Launched from SCR-SEC-002 and SCR-SEC-003.
```

### F2-QUERY — API-SEC-042 — Get a role-branch assignment
```
HTTP method    : GET
Endpoint path  : /api/v1/security/role-branches/{roleId}/{branchId}
Response shape : SecRoleBranchDto
Hook type      : useQuery
Query key      : ['role-branches', roleId, branchId] — COMPOSITE key,
                 per F1-MODEL ENTITY-SEC-010 correction #1 (no single
                 id exists to key on)
Errors         : 401 -> login; 403 -> unauthorized (ROLE_VIEW required)
Loading        : LOCAL
Caching        : defaults
Enabled         : !!roleId && !!branchId
```

### F2-QUERY — API-SEC-043 — Update a role-branch assignment
```
HTTP method    : PUT
Endpoint path  : /api/v1/security/role-branches/{roleId}/{branchId}
Request shape  : UpdateSecRoleBranchRequest { dataAccessLevel
                 (required) } — see F1-MODEL ENTITY-SEC-010 correction
                 #3: values are BRANCH_ONLY/BRANCH_AND_CHILDREN/ALL,
                 NOT the Shell's original BRANCH/CHILDREN/ALL
Response shape : SecRoleBranchDto
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (ROLE_UPDATE required)
Invalidation   : ['role-branches', roleId, branchId], ['role-branches']
                 (list)
Loading        : LOCAL
```

### F2-QUERY — API-SEC-044 — Remove a role-branch assignment
```
HTTP method    : DELETE
Endpoint path  : /api/v1/security/role-branches/{roleId}/{branchId}
Response shape : 204 No Content
Hook type      : useMutation
Errors         : 401 -> login; 403 -> unauthorized (ROLE_DELETE
                 required)
Invalidation   : ['role-branches', roleId, branchId], ['role-branches']
Loading        : LOCAL
MAPS TO SHELL ACTION: "conditional delete button" in DataScopeDrawer —
confirmed exact match.
```

### F2-QUERY — API-SEC-045 — List role-branch assignments
```
HTTP method    : GET
Endpoint path  : /api/v1/security/role-branches
Request shape  : pageable (allowed sort: roleIdFk, branchIdFk,
                 dataAccessLevel, isActiveFl, createdAt)
Response shape : paginated list of SecRoleBranchDto
Hook type      : useQuery
Query key      : ['role-branches', { page, size, sort }]
Errors         : 401 -> login
Loading        : LOCAL
Caching        : defaults
```

### F2-QUERY — API-SEC-046 — Assign a branch scope to a role
```
HTTP method    : POST
Endpoint path  : /api/v1/security/role-branches
Request shape  : CreateSecRoleBranchRequest { roleIdFk (required),
                 branchIdFk (required), dataAccessLevel (required) }
Response shape : SecRoleBranchDto
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (ROLE_CREATE required)
Invalidation   : ['role-branches']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-047 — Search role-branch assignments
```
HTTP method    : POST
Endpoint path  : /api/v1/security/role-branches/search
Response shape : paginated list of SecRoleBranchDto
Hook type      : useMutation (POST-as-query pattern)
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (ROLE_VIEW required)
Loading        : LOCAL
Caching        : n/a (mutation pattern)
```

### F2-SCREEN-INIT — SCR-SEC-007 — Role Data Scope
```
On mount (drawer open):
  1. Permission hook for SCR-SEC-007 -> canView, canCreate, canEdit,
     canDelete
  2. LOV-SEC-002 (Data Access Level) — see F2-LOV-QUERY block below —
     a REAL master-data-validated LOV, unlike LOV-SEC-001
  3. Entry-by-PK query: useRoleBranch(roleId, branchId) (API-SEC-042),
     composite-key enabled, drives the create-vs-update branch
```

### F2-LOV-QUERY — LOV-SEC-002 — Data Access Level
```
LOV-ID           : LOV-SEC-002
LOOKUP_CODE      : DATA_ACCESS_LEVEL (per srs.md ENTITY-SEC-010 Cross-
                   Module note: "يستهلك DATA_ACCESS_LEVEL من MasterData
                   (MD_MASTER_LOOKUP)") — confirmed as a real
                   MasterDataLookupClient-validated value set, UNLIKE
                   LOV-SEC-001.
Hook name        : useDataAccessLevelOptions()
GAP (confirmed, not invented): no endpoint in this module's 50-endpoint
  real API surface returns the runtime OPTIONS LIST for this LOOKUP_
  CODE (only server-side VALIDATION against it is confirmed, via
  MasterDataLookupClient, on write). srs.md itself states the
  dependency is "SOFT-READ فقط، بلا XM-ID مؤكَّد بعد" (soft-read only,
  no confirmed XM-ID yet) — i.e. even the SRS does not point to a
  settled cross-module read contract for fetching this list. This plan
  does NOT invent a `GET /api/v1/sys/lookups/DATA_ACCESS_LEVEL` call
  that has no corresponding entry in the real API docs (HR-1).
Practical resolution (documented, not silently assumed): the 3 known
  values — BRANCH_ONLY, BRANCH_AND_CHILDREN, ALL — are confirmed
  identically across every request/response example in
  securitydatascoperolebranches.md. This plan hardcodes them as a
  client-side constant (same treatment as LOV-SEC-001), pending a real
  MasterData lookup-list endpoint. Unlike LOV-SEC-001 (a genuine,
  permanent Java-enum deviation), this is flagged as a TEMPORARY gap —
  if MD_MASTER_LOOKUP's read endpoint becomes available, this hardcoded
  list should be replaced with a real fetch; it is hardcoded here only
  because no such endpoint exists in the API surface confirmed this
  session.
Used by field    : dataAccessLevel in SecRoleBranch (ENTITY-SEC-010)
Caching          : n/a — compile-time constant (see GAP above)
```

### F2-FACADE-HOOK — SCR-SEC-007 — Role Data Scope
```
Facade Hook name : useRoleDataScopeFacade(roleId, branchId)
Composes         : useRoleBranch (API-SEC-042), useCreateRoleBranch
                   (API-SEC-046), useUpdateRoleBranch (API-SEC-043),
                   useDeleteRoleBranch (API-SEC-044), plus the
                   LOV-SEC-002 constant (static import, see GAP above)

STATE OWNED: scope (from useRoleBranch's data), isLoading (derived)

OPERATIONS EXPOSED: saveScope(data) -> branches to create (API-SEC-046)
  if no assignment exists for this (roleId, branchId) pair yet, else
  update (API-SEC-043); deleteScope() -> direct DELETE, no pre-check
  call (per PHASE F2 global pre-deactivation note)

BOUNDARIES: components call this Facade only; composes the F2-QUERY
  hooks above only.

OQ-015 CARRYOVER (repeated once more, data-layer completeness — no new
content): this Facade does not filter or restrict anything by
allowedBranches[] — nothing to consume, and this is the screen most
likely to be mistaken for enforcement.
```

