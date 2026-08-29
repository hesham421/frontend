<!-- Source: PHASE:F2 / SUB:F2-SCR-ORG-002 -->
<!-- Context: see F2-HEADER.md for phase-level strategy, registry table, and intro -->

## F2 — SCR-ORG-002 — Branches

### F2-QUERY — API-ORG-007 — Create Branch
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-007
HTTP method      : POST
Endpoint path    : /api/v1/org/branches (matches real API Docs exactly)
Request shape    : CreateBranchRequest {nameAr, nameEn, legalEntityFk, branchTypeId, notes?}
Response shape   : BranchResponse
Hook type        : useMutation
Errors this call can produce:
  400 (field validation, RULE-ORG-011..016 depending on field) → inline
  409 (RULE-ORG-012 code sequence conflict / RULE-ORG-015 name uniqueness) → toast
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['branches'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-008 — Search Branches
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-008
HTTP method      : POST (real API — SRS B5 wrongly declares GET, see FINDING-5)
Endpoint path    : /api/v1/org/branches/search (matches real API Docs exactly)
Request shape    : BranchSearchRequest {filters: [{field, operator, value}] — map branchCode/nameAr/legalEntityFk/branchTypeId/isActive here, sorts?, page, size}
Response shape   : Page<BranchResponse>
Hook type        : useQuery (POST-in-queryFn — search is a read despite the HTTP verb; body carries the filter DSL, see FINDING-5)
Query key        : [ 'branches', searchFilters ] — searchFilters IS the request body (filters/sorts/page/size); currentPage/pageSize live inside it
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-009 — Update Branch
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-009
HTTP method      : PUT
Endpoint path    : /api/v1/org/branches/{id} (matches real API Docs exactly)
Request shape    : UpdateBranchRequest {nameAr?, nameEn?, branchTypeId?, notes?}
Response shape   : BranchResponse
Hook type        : useMutation
Errors this call can produce:
  400 (field validation, RULE-ORG-011..016 depending on field) → inline
  409 (RULE-ORG-012 code sequence conflict / RULE-ORG-015 name uniqueness) → toast
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['branches'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-010 — Deactivate Branch
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-010
HTTP method      : PUT
Endpoint path    : /api/v1/org/branches/{id}/deactivate (matches real API Docs exactly)
Request shape    : (none)
Response shape   : confirmation / 204
Hook type        : useMutation
Errors this call can produce:
  409 (dependent-record block) → toast — rule(s): see screen's deactivate_rules below
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['branches'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-011 — Activate Branch
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-011
HTTP method      : PUT
Endpoint path    : /api/v1/org/branches/{id}/activate (matches real API Docs exactly)
Request shape    : (none)
Response shape   : confirmation / 204
Hook type        : useMutation
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['branches'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-012 — Get Branch by ID
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-012
HTTP method      : GET
Endpoint path    : /api/v1/org/branches/{id} (matches real API Docs exactly)
Request shape    : (none)
Response shape   : BranchResponse
Hook type        : useQuery
Query key        : [ 'branches', id ]
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
─────────────────────────────────────────────────────────────────

### F2-LOV-QUERY — LOV-ORG-002 — BRANCH_TYPE
─────────────────────────────────────────────────────────────────
LOV-ID           : LOV-ORG-002
LOOKUP_CODE      : BRANCH_TYPE
Hook name        : useBranchTypeOptions()
Endpoint         : GET /api/v1/lookups/BRANCH_TYPE?active=true (SRS A5 preamble — generic LOV endpoint, confirm exact path against real API Docs if a /lookups controller doc is added later; not among the 7 endpoint files supplied this session)
Query key        : ['lookups', 'BRANCH_TYPE']
Returns          : list of lookup options — each option: { detailCode, nameAr, nameEn }
Used by field    : branchTypeId in Branch
DB Column        : branch_type_id (DBF-ID: N/A — backend-execution-plan.md not provided this session; column name sourced directly from SRS A3)
Caching          : staleTime: long (10+ minutes) — stable reference data
Reuse rule       : ONE hook per LOOKUP_CODE — shared across screens using this LOV (none in this module — each LOV-ID here is used by exactly one screen)
─────────────────────────────────────────────────────────────────

**Cross-entity FK reuse (not an LOV — reuses another screen's entity search API):**
  legalEntityFk          → reuses API-ORG-002's query hook, filtered to LegalEntity (active only, isActive=true filter)

### F2-SCREEN-INIT — SCR-ORG-002 — Branches
─────────────────────────────────────────────────────────────────
On screen mount:
  1. Permission hook for SCR-ORG-002 — produces canView, canCreate, canEdit, canDelete
     (canDelete kept for completeness — not used to gate Deactivate here, see FINDING-4/SEC-FE)
  2. LOV hook: LOV-ORG-002 — LOOKUP_CODE: BRANCH_TYPE
  2. Cross-entity picker: legalEntityFk — reuses API-ORG-002 filtered to LegalEntity (active only, isActive=true filter)
  3. If ENTRY mode is EDIT: entity-by-PK query (API-ORG-012), `enabled: !!id`
Search screen state: currentPage/pageSize live in the search query key's filter object
─────────────────────────────────────────────────────────────────

### F2-FACADE-HOOK — SCR-ORG-002 — Branches
─────────────────────────────────────────────────────────────────
Facade Hook name : useBranchesFacade()
Composes         : API-ORG-007, API-ORG-008, API-ORG-009, API-ORG-010, API-ORG-011, API-ORG-012, useBranchTypeOptions()

STATE THIS FACADE HOOK OWNS OR EXPOSES:
  branchList      — from the search useQuery's `data` — not duplicated into local state
  selectedItem         — local useState (null if none) — UI selection only
  isLoading            — derived from composed hooks' isLoading/isFetching
  searchFilters        — local useState / URL search params — currentPage/pageSize live inside it
  branchTypeIdOptions   — from useBranchTypeOptions()'s `data`
  legalEntityFkOptions  — from reused API-ORG-002 query's `data`, filtered active

OPERATIONS EXPOSED TO COMPONENTS:
  createBranch(data)          → calls API-ORG-007 mutation
  updateBranch(id, data)      → calls API-ORG-009 mutation
  deactivateBranch(id)        → calls API-ORG-010 mutation — backend performs the dependent-check
                                    (no client pre-check); on 409, banner shows the
                                    rule's bilingual message. Rules: RULE-ORG-003, RULE-ORG-004, RULE-ORG-005 (409 → toast, lists which dependent type blocked, backend-enforced)
  activateBranch(id)          → calls API-ORG-011 mutation
  selectItem(item)              → updates selectedItem — no API call
  setSearchFilters(filters)     → updates searchFilters — refetches automatically

BOUNDARIES:
  ✓ Components call the Facade Hook only — no direct useQuery/useMutation in components
  ✓ Facade Hook composes F2-QUERY/F2-LOV-QUERY hooks only — no direct fetch/axios calls
  ✓ currentPage/pageSize live inside searchFilters — never separate state
─────────────────────────────────────────────────────────────────
