<!-- Source: PHASE:F2 / SUB:F2-SCR-ORG-005 -->
<!-- Context: see F2-HEADER.md for phase-level strategy, registry table, and intro -->

## F2 — SCR-ORG-005 — Cost Centers

### F2-QUERY — API-ORG-026 — Create Cost Center
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-026
HTTP method      : POST
Endpoint path    : /api/v1/org/cost-centers (matches real API Docs exactly)
Request shape    : CreateCostCenterRequest {nameAr, nameEn, branchFk, parentCostCenterFk?, nodeTypeId, costCenterTypeId, notes?}
Response shape   : CostCenterResponse
Hook type        : useMutation
Errors this call can produce:
  400 (field validation, RULE-ORG-011..016 depending on field) → inline
  409 (RULE-ORG-012 code sequence conflict / RULE-ORG-015 name uniqueness) → toast
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['cost-centers'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-027 — Get Cost Center tree
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-027
HTTP method      : GET
Endpoint path    : /api/v1/org/cost-centers/tree (matches real API Docs exactly)
Request shape    : query {branchFk, isActive?}
Response shape   : CostCenterResponse[] (nested via children)
Hook type        : useQuery
Query key        : [ 'cost-centers', 'tree', branchFk ]
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-028 — Search Cost Centers (flat)
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-028
HTTP method      : POST (real API — SRS B5 wrongly declares GET, see FINDING-5)
Endpoint path    : /api/v1/org/cost-centers/search (matches real API Docs exactly)
Request shape    : CostCenterSearchRequest {filters: [{field, operator, value}] — map branchFk/nameAr/nodeTypeId/costCenterTypeId/isActive here, sorts?, page, size}
Response shape   : Page<CostCenterResponse>
Hook type        : useQuery (POST-in-queryFn — search is a read despite the HTTP verb; body carries the filter DSL, see FINDING-5)
Query key        : [ 'cost-centers', searchFilters ] — searchFilters IS the request body (filters/sorts/page/size); currentPage/pageSize live inside it
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-029 — Update Cost Center
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-029
HTTP method      : PUT
Endpoint path    : /api/v1/org/cost-centers/{id} (matches real API Docs exactly)
Request shape    : UpdateCostCenterRequest {nameAr?, nameEn?, parentCostCenterFk?, costCenterTypeId?, notes?}
Response shape   : CostCenterResponse
Hook type        : useMutation
Errors this call can produce:
  400 (field validation, RULE-ORG-011..016 depending on field) → inline
  409 (RULE-ORG-012 code sequence conflict / RULE-ORG-015 name uniqueness) → toast
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['cost-centers'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-030 — Deactivate Cost Center
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-030
HTTP method      : PUT
Endpoint path    : /api/v1/org/cost-centers/{id}/deactivate (matches real API Docs exactly)
Request shape    : (none)
Response shape   : confirmation / 204
Hook type        : useMutation
Errors this call can produce:
  409 (dependent-record block) → toast — rule(s): see screen's deactivate_rules below
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['cost-centers'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-031 — Activate Cost Center
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-031
HTTP method      : PUT
Endpoint path    : /api/v1/org/cost-centers/{id}/activate (matches real API Docs exactly)
Request shape    : (none)
Response shape   : confirmation / 204
Hook type        : useMutation
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['cost-centers'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-032 — Get Cost Center by ID
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-032
HTTP method      : GET
Endpoint path    : /api/v1/org/cost-centers/{id} (matches real API Docs exactly)
Request shape    : (none)
Response shape   : CostCenterResponse
Hook type        : useQuery
Query key        : [ 'cost-centers', id ]
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
─────────────────────────────────────────────────────────────────

### F2-LOV-QUERY — LOV-ORG-004 — COST_CENTER_NODE_TYPE
─────────────────────────────────────────────────────────────────
LOV-ID           : LOV-ORG-004
LOOKUP_CODE      : COST_CENTER_NODE_TYPE
Hook name        : useCostCenterNodeTypeOptions()
Endpoint         : GET /api/v1/lookups/COST_CENTER_NODE_TYPE?active=true (SRS A5 preamble — generic LOV endpoint, confirm exact path against real API Docs if a /lookups controller doc is added later; not among the 7 endpoint files supplied this session)
Query key        : ['lookups', 'COST_CENTER_NODE_TYPE']
Returns          : list of lookup options — each option: { detailCode, nameAr, nameEn }
Used by field    : nodeTypeId in CostCenter
DB Column        : node_type_id (DBF-ID: N/A — backend-execution-plan.md not provided this session; column name sourced directly from SRS A3)
Caching          : staleTime: long (10+ minutes) — stable reference data
Reuse rule       : ONE hook per LOOKUP_CODE — shared across screens using this LOV (none in this module — each LOV-ID here is used by exactly one screen)
─────────────────────────────────────────────────────────────────

### F2-LOV-QUERY — LOV-ORG-005 — COST_CENTER_TYPE
─────────────────────────────────────────────────────────────────
LOV-ID           : LOV-ORG-005
LOOKUP_CODE      : COST_CENTER_TYPE
Hook name        : useCostCenterTypeOptions()
Endpoint         : GET /api/v1/lookups/COST_CENTER_TYPE?active=true (SRS A5 preamble — generic LOV endpoint, confirm exact path against real API Docs if a /lookups controller doc is added later; not among the 7 endpoint files supplied this session)
Query key        : ['lookups', 'COST_CENTER_TYPE']
Returns          : list of lookup options — each option: { detailCode, nameAr, nameEn }
Used by field    : costCenterTypeId in CostCenter
DB Column        : cost_center_type_id (DBF-ID: N/A — backend-execution-plan.md not provided this session; column name sourced directly from SRS A3)
Caching          : staleTime: long (10+ minutes) — stable reference data
Reuse rule       : ONE hook per LOOKUP_CODE — shared across screens using this LOV (none in this module — each LOV-ID here is used by exactly one screen)
─────────────────────────────────────────────────────────────────

**Cross-entity FK reuse (not an LOV — reuses another screen's entity search API):**
  branchFk               → reuses API-ORG-008's query hook, filtered to Branch (active only, isActive=true filter)
  parentCostCenterFk     → reuses API-ORG-027's query hook, filtered to from the already-loaded tree for the selected branch — not a separate query; candidate list excludes descendants per RULE-ORG-008 (see F3)

### F2-SCREEN-INIT — SCR-ORG-005 — Cost Centers
─────────────────────────────────────────────────────────────────
On screen mount:
  1. Permission hook for SCR-ORG-005 — produces canView, canCreate, canEdit, canDelete
     (canDelete kept for completeness — not used to gate Deactivate here, see FINDING-4/SEC-FE)
  2. LOV hook: LOV-ORG-004 — LOOKUP_CODE: COST_CENTER_NODE_TYPE
  2. LOV hook: LOV-ORG-005 — LOOKUP_CODE: COST_CENTER_TYPE
  2. Cross-entity picker: branchFk — reuses API-ORG-008 filtered to Branch (active only, isActive=true filter)
  2. Cross-entity picker: parentCostCenterFk — reuses API-ORG-027 filtered to from the already-loaded tree for the selected branch — not a separate query; candidate list excludes descendants per RULE-ORG-008 (see F3)
  3. Tree query (API-ORG-027) fires once a branch is selected — branchFk is a mandatory precondition (SRS B2); tree is empty/hidden until chosen
Search screen state: currentPage/pageSize live in the search query key's filter object
─────────────────────────────────────────────────────────────────

### F2-FACADE-HOOK — SCR-ORG-005 — Cost Centers
─────────────────────────────────────────────────────────────────
Facade Hook name : useCostCentersFacade()
Composes         : API-ORG-026, API-ORG-027, API-ORG-028, API-ORG-029, API-ORG-030, API-ORG-031, API-ORG-032, useCostCenterNodeTypeOptions(), useCostCenterTypeOptions()

STATE THIS FACADE HOOK OWNS OR EXPOSES:
  costcenterTree      — from the tree useQuery's `data` — not duplicated into local state
  selectedItem         — local useState (null if none) — UI selection only
  isLoading            — derived from composed hooks' isLoading/isFetching
  searchFilters        — local useState / URL search params — currentPage/pageSize live inside it
  nodeTypeIdOptions     — from useCostCenterNodeTypeOptions()'s `data`
  costCenterTypeIdOptions — from useCostCenterTypeOptions()'s `data`
  branchFkOptions       — from reused API-ORG-008 query's `data`, filtered active
  parentCostCenterFkOptions — from reused API-ORG-027 query's `data`, filtered active

OPERATIONS EXPOSED TO COMPONENTS:
  createCostCenter(data)      → calls API-ORG-026 mutation
  updateCostCenter(id, data)  → calls API-ORG-029 mutation
  deactivateCostCenter(id)    → calls API-ORG-030 mutation — backend performs the dependent-check
                                    (no client pre-check); on 409, banner shows the
                                    rule's bilingual message. Rules: No RULE-ID declared against CostCenter self-deactivation by SRS A4 (same A6-vs-A4 gap as Departments) — standard confirm-deactivate dialog only
  activateCostCenter(id)      → calls API-ORG-031 mutation
  selectItem(item)              → updates selectedItem — no API call
  setSearchFilters(filters)     → updates searchFilters — refetches automatically

BOUNDARIES:
  ✓ Components call the Facade Hook only — no direct useQuery/useMutation in components
  ✓ Facade Hook composes F2-QUERY/F2-LOV-QUERY hooks only — no direct fetch/axios calls
  ✓ currentPage/pageSize live inside searchFilters — never separate state
─────────────────────────────────────────────────────────────────
