<!-- Source: PHASE:F2 / SUB:F2-SCR-ORG-003 -->
<!-- Context: see F2-HEADER.md for phase-level strategy, registry table, and intro -->

## F2 — SCR-ORG-003 — Regions

### F2-QUERY — API-ORG-013 — Create Region
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-013
HTTP method      : POST
Endpoint path    : /api/v1/org/regions (matches real API Docs exactly)
Request shape    : CreateRegionRequest {nameAr, nameEn, legalEntityFk, regionTypeIdFk, notes?}
Response shape   : RegionResponse
Hook type        : useMutation
Errors this call can produce:
  400 (field validation, RULE-ORG-011..016 depending on field) → inline
  409 (RULE-ORG-012 code sequence conflict / RULE-ORG-015 name uniqueness) → toast
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['regions'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-014 — Search Regions
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-014
HTTP method      : POST (real API — SRS B5 wrongly declares GET, see FINDING-5)
Endpoint path    : /api/v1/org/regions/search (matches real API Docs exactly)
Request shape    : RegionSearchRequest {filters: [{field, operator, value}] — map regionCode/nameAr/legalEntityFk/regionTypeIdFk/isActive here, sorts?, page, size}
Response shape   : Page<RegionResponse>
Hook type        : useQuery (POST-in-queryFn — search is a read despite the HTTP verb; body carries the filter DSL, see FINDING-5)
Query key        : [ 'regions', searchFilters ] — searchFilters IS the request body (filters/sorts/page/size); currentPage/pageSize live inside it
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-015 — Update Region
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-015
HTTP method      : PUT
Endpoint path    : /api/v1/org/regions/{id} (matches real API Docs exactly)
Request shape    : UpdateRegionRequest {nameAr?, nameEn?, regionTypeIdFk?, notes?}
Response shape   : RegionResponse
Hook type        : useMutation
Errors this call can produce:
  400 (field validation, RULE-ORG-011..016 depending on field) → inline
  409 (RULE-ORG-012 code sequence conflict / RULE-ORG-015 name uniqueness) → toast
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['regions'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-016 — Deactivate Region
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-016
HTTP method      : PUT
Endpoint path    : /api/v1/org/regions/{id}/deactivate (matches real API Docs exactly)
Request shape    : (none)
Response shape   : confirmation / 204
Hook type        : useMutation
Errors this call can produce:
  409 (dependent-record block) → toast — rule(s): see screen's deactivate_rules below
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['regions'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-017 — Activate Region
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-017
HTTP method      : PUT
Endpoint path    : /api/v1/org/regions/{id}/activate (matches real API Docs exactly)
Request shape    : (none)
Response shape   : confirmation / 204
Hook type        : useMutation
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['regions'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-018 — Get Region by ID
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-018
HTTP method      : GET
Endpoint path    : /api/v1/org/regions/{id} (matches real API Docs exactly)
Request shape    : (none)
Response shape   : RegionResponse
Hook type        : useQuery
Query key        : [ 'regions', id ]
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
─────────────────────────────────────────────────────────────────

### F2-LOV-QUERY — (none owned by this screen)
regionTypeIdFk has no LOV-ID and no real listing endpoint (FINDING-2 / OQ-ORG-002).
DEFERRED: no F2-LOV-QUERY block until a real endpoint exists. Field renders
read-only from `regionTypeNameEn` on the response; no picker on create/edit.

**Cross-entity FK reuse (not an LOV — reuses another screen's entity search API):**
  legalEntityFk          → reuses API-ORG-002's query hook, filtered to LegalEntity (active only, isActive=true filter)

### F2-SCREEN-INIT — SCR-ORG-003 — Regions
─────────────────────────────────────────────────────────────────
On screen mount:
  1. Permission hook for SCR-ORG-003 — produces canView, canCreate, canEdit, canDelete
     (canDelete kept for completeness — not used to gate Deactivate here, see FINDING-4/SEC-FE)
  2. Cross-entity picker: legalEntityFk — reuses API-ORG-002 filtered to LegalEntity (active only, isActive=true filter)
  3. If ENTRY mode is EDIT: entity-by-PK query (API-ORG-018), `enabled: !!id`
Search screen state: currentPage/pageSize live in the search query key's filter object
─────────────────────────────────────────────────────────────────

### F2-FACADE-HOOK — SCR-ORG-003 — Regions
─────────────────────────────────────────────────────────────────
Facade Hook name : useRegionsFacade()
Composes         : API-ORG-013, API-ORG-014, API-ORG-015, API-ORG-016, API-ORG-017, API-ORG-018

STATE THIS FACADE HOOK OWNS OR EXPOSES:
  regionList      — from the search useQuery's `data` — not duplicated into local state
  selectedItem         — local useState (null if none) — UI selection only
  isLoading            — derived from composed hooks' isLoading/isFetching
  searchFilters        — local useState / URL search params — currentPage/pageSize live inside it
  legalEntityFkOptions  — from reused API-ORG-002 query's `data`, filtered active

OPERATIONS EXPOSED TO COMPONENTS:
  createRegion(data)          → calls API-ORG-013 mutation
  updateRegion(id, data)      → calls API-ORG-015 mutation
  deactivateRegion(id)        → calls API-ORG-016 mutation — backend performs the dependent-check
                                    (no client pre-check); on 409, banner shows the
                                    rule's bilingual message. Rules: RULE-ORG-006, RULE-ORG-017 (409 → toast; RULE-ORG-017 note: OQ-ORG-001 SOFT-READ warning still DEFERRED at consumer-module level, banner must not claim full cross-module safety)
  activateRegion(id)          → calls API-ORG-017 mutation
  selectItem(item)              → updates selectedItem — no API call
  setSearchFilters(filters)     → updates searchFilters — refetches automatically

BOUNDARIES:
  ✓ Components call the Facade Hook only — no direct useQuery/useMutation in components
  ✓ Facade Hook composes F2-QUERY/F2-LOV-QUERY hooks only — no direct fetch/axios calls
  ✓ currentPage/pageSize live inside searchFilters — never separate state
─────────────────────────────────────────────────────────────────
