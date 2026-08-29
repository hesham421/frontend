<!-- Source: PHASE:F2 / SUB:F2-SCR-ORG-004 -->
<!-- Context: see F2-HEADER.md for phase-level strategy, registry table, and intro -->

## F2 — SCR-ORG-004 — Departments

### F2-QUERY — API-ORG-019 — Create Department
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-019
HTTP method      : POST
Endpoint path    : /api/v1/org/departments (matches real API Docs exactly)
Request shape    : CreateDepartmentRequest {nameAr, nameEn, branchFk, parentDepartmentFk?, nodeTypeId, notes?}
Response shape   : DepartmentResponse
Hook type        : useMutation
Errors this call can produce:
  400 (field validation, RULE-ORG-011..016 depending on field) → inline
  409 (RULE-ORG-012 code sequence conflict / RULE-ORG-015 name uniqueness) → toast
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['departments'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-020 — Get Department tree
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-020
HTTP method      : GET
Endpoint path    : /api/v1/org/departments/tree (matches real API Docs exactly)
Request shape    : query {branchFk, isActive?}
Response shape   : DepartmentResponse[] (nested via children)
Hook type        : useQuery
Query key        : [ 'departments', 'tree', branchFk ]
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-021 — Search Departments (flat)
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-021
HTTP method      : POST (real API — SRS B5 wrongly declares GET, see FINDING-5)
Endpoint path    : /api/v1/org/departments/search (matches real API Docs exactly)
Request shape    : DepartmentSearchRequest {filters: [{field, operator, value}] — map branchFk/nameAr/nodeTypeId/isActive here, sorts?, page, size}
Response shape   : Page<DepartmentResponse>
Hook type        : useQuery (POST-in-queryFn — search is a read despite the HTTP verb; body carries the filter DSL, see FINDING-5)
Query key        : [ 'departments', searchFilters ] — searchFilters IS the request body (filters/sorts/page/size); currentPage/pageSize live inside it
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-022 — Update Department
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-022
HTTP method      : PUT
Endpoint path    : /api/v1/org/departments/{id} (matches real API Docs exactly)
Request shape    : UpdateDepartmentRequest {nameAr?, nameEn?, parentDepartmentFk?, notes?}
Response shape   : DepartmentResponse
Hook type        : useMutation
Errors this call can produce:
  400 (field validation, RULE-ORG-011..016 depending on field) → inline
  409 (RULE-ORG-012 code sequence conflict / RULE-ORG-015 name uniqueness) → toast
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['departments'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-023 — Deactivate Department
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-023
HTTP method      : PUT
Endpoint path    : /api/v1/org/departments/{id}/deactivate (matches real API Docs exactly)
Request shape    : (none)
Response shape   : confirmation / 204
Hook type        : useMutation
Errors this call can produce:
  409 (dependent-record block) → toast — rule(s): see screen's deactivate_rules below
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['departments'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-024 — Activate Department
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-024
HTTP method      : PUT
Endpoint path    : /api/v1/org/departments/{id}/activate (matches real API Docs exactly)
Request shape    : (none)
Response shape   : confirmation / 204
Hook type        : useMutation
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['departments'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-025 — Get Department by ID
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-025
HTTP method      : GET
Endpoint path    : /api/v1/org/departments/{id} (matches real API Docs exactly)
Request shape    : (none)
Response shape   : DepartmentResponse
Hook type        : useQuery
Query key        : [ 'departments', id ]
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
─────────────────────────────────────────────────────────────────

### F2-LOV-QUERY — LOV-ORG-003 — DEPARTMENT_NODE_TYPE
─────────────────────────────────────────────────────────────────
LOV-ID           : LOV-ORG-003
LOOKUP_CODE      : DEPARTMENT_NODE_TYPE
Hook name        : useDepartmentNodeTypeOptions()
Endpoint         : GET /api/v1/lookups/DEPARTMENT_NODE_TYPE?active=true (SRS A5 preamble — generic LOV endpoint, confirm exact path against real API Docs if a /lookups controller doc is added later; not among the 7 endpoint files supplied this session)
Query key        : ['lookups', 'DEPARTMENT_NODE_TYPE']
Returns          : list of lookup options — each option: { detailCode, nameAr, nameEn }
Used by field    : nodeTypeId in Department
DB Column        : node_type_id (DBF-ID: N/A — backend-execution-plan.md not provided this session; column name sourced directly from SRS A3)
Caching          : staleTime: long (10+ minutes) — stable reference data
Reuse rule       : ONE hook per LOOKUP_CODE — shared across screens using this LOV (none in this module — each LOV-ID here is used by exactly one screen)
─────────────────────────────────────────────────────────────────

**Cross-entity FK reuse (not an LOV — reuses another screen's entity search API):**
  branchFk               → reuses API-ORG-008's query hook, filtered to Branch (active only, isActive=true filter)
  parentDepartmentFk     → reuses API-ORG-020's query hook, filtered to from the already-loaded tree for the selected branch — not a separate query; candidate list excludes the current node's own descendants client-side per RULE-ORG-007 (see F3)

### F2-SCREEN-INIT — SCR-ORG-004 — Departments
─────────────────────────────────────────────────────────────────
On screen mount:
  1. Permission hook for SCR-ORG-004 — produces canView, canCreate, canEdit, canDelete
     (canDelete kept for completeness — not used to gate Deactivate here, see FINDING-4/SEC-FE)
  2. LOV hook: LOV-ORG-003 — LOOKUP_CODE: DEPARTMENT_NODE_TYPE
  2. Cross-entity picker: branchFk — reuses API-ORG-008 filtered to Branch (active only, isActive=true filter)
  2. Cross-entity picker: parentDepartmentFk — reuses API-ORG-020 filtered to from the already-loaded tree for the selected branch — not a separate query; candidate list excludes the current node's own descendants client-side per RULE-ORG-007 (see F3)
  3. Tree query (API-ORG-020) fires once a branch is selected — branchFk is a mandatory precondition (SRS B2); tree is empty/hidden until chosen
Search screen state: currentPage/pageSize live in the search query key's filter object
─────────────────────────────────────────────────────────────────

### F2-FACADE-HOOK — SCR-ORG-004 — Departments
─────────────────────────────────────────────────────────────────
Facade Hook name : useDepartmentsFacade()
Composes         : API-ORG-019, API-ORG-020, API-ORG-021, API-ORG-022, API-ORG-023, API-ORG-024, API-ORG-025, useDepartmentNodeTypeOptions()

STATE THIS FACADE HOOK OWNS OR EXPOSES:
  departmentTree      — from the tree useQuery's `data` — not duplicated into local state
  selectedItem         — local useState (null if none) — UI selection only
  isLoading            — derived from composed hooks' isLoading/isFetching
  searchFilters        — local useState / URL search params — currentPage/pageSize live inside it
  nodeTypeIdOptions     — from useDepartmentNodeTypeOptions()'s `data`
  branchFkOptions       — from reused API-ORG-008 query's `data`, filtered active
  parentDepartmentFkOptions — from reused API-ORG-020 query's `data`, filtered active

OPERATIONS EXPOSED TO COMPONENTS:
  createDepartment(data)      → calls API-ORG-019 mutation
  updateDepartment(id, data)  → calls API-ORG-022 mutation
  deactivateDepartment(id)    → calls API-ORG-023 mutation — backend performs the dependent-check
                                    (no client pre-check); on 409, banner shows the
                                    rule's bilingual message. Rules: No RULE-ID declared against Department self-deactivation by SRS A4 (A6 lifecycle text mentions a child-department restriction but no RULE-ID formalizes it — ui-ux-spec.md correctly omits a save-blocked banner for this screen; standard confirm-deactivate dialog only)
  activateDepartment(id)      → calls API-ORG-024 mutation
  selectItem(item)              → updates selectedItem — no API call
  setSearchFilters(filters)     → updates searchFilters — refetches automatically

BOUNDARIES:
  ✓ Components call the Facade Hook only — no direct useQuery/useMutation in components
  ✓ Facade Hook composes F2-QUERY/F2-LOV-QUERY hooks only — no direct fetch/axios calls
  ✓ currentPage/pageSize live inside searchFilters — never separate state
─────────────────────────────────────────────────────────────────
