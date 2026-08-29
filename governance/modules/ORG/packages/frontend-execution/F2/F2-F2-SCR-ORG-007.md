<!-- Source: PHASE:F2 / SUB:F2-SCR-ORG-007 -->
<!-- Context: see F2-HEADER.md for phase-level strategy, registry table, and intro -->

## F2 — SCR-ORG-007 — Location Sites

### F2-QUERY — API-ORG-039 — Create Location Site
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-039
HTTP method      : POST
Endpoint path    : /api/v1/org/location-sites (matches real API Docs exactly)
Request shape    : CreateLocationSiteRequest {nameAr, nameEn, branchFk, siteTypeId, notes?}
Response shape   : LocationSiteResponse
Hook type        : useMutation
Errors this call can produce:
  400 (field validation, RULE-ORG-011..016 depending on field) → inline
  409 (RULE-ORG-012 code sequence conflict / RULE-ORG-015 name uniqueness) → toast
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['location-sites'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-040 — Search Location Sites
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-040
HTTP method      : POST (real API — SRS B5 wrongly declares GET, see FINDING-5)
Endpoint path    : /api/v1/org/location-sites/search (matches real API Docs exactly)
Request shape    : LocationSiteSearchRequest {filters: [{field, operator, value}] — map locationSiteCode/nameAr/branchFk/siteTypeId/isActive here, sorts?, page, size}
Response shape   : Page<LocationSiteResponse>
Hook type        : useQuery (POST-in-queryFn — search is a read despite the HTTP verb; body carries the filter DSL, see FINDING-5)
Query key        : [ 'location-sites', searchFilters ] — searchFilters IS the request body (filters/sorts/page/size); currentPage/pageSize live inside it
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-041 — Update Location Site
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-041
HTTP method      : PUT
Endpoint path    : /api/v1/org/location-sites/{id} (matches real API Docs exactly)
Request shape    : UpdateLocationSiteRequest {nameAr?, nameEn?, siteTypeId?, notes?}
Response shape   : LocationSiteResponse
Hook type        : useMutation
Errors this call can produce:
  400 (field validation, RULE-ORG-011..016 depending on field) → inline
  409 (RULE-ORG-012 code sequence conflict / RULE-ORG-015 name uniqueness) → toast
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['location-sites'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-042 — Deactivate Location Site
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-042
HTTP method      : PUT
Endpoint path    : /api/v1/org/location-sites/{id}/deactivate (matches real API Docs exactly)
Request shape    : (none)
Response shape   : confirmation / 204
Hook type        : useMutation
Errors this call can produce:
  409 (dependent-record block) → toast — rule(s): see screen's deactivate_rules below
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['location-sites'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-043 — Activate Location Site
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-043
HTTP method      : PUT
Endpoint path    : /api/v1/org/location-sites/{id}/activate (matches real API Docs exactly)
Request shape    : (none)
Response shape   : confirmation / 204
Hook type        : useMutation
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['location-sites'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-044 — Get Location Site by ID
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-044
HTTP method      : GET
Endpoint path    : /api/v1/org/location-sites/{id} (matches real API Docs exactly)
Request shape    : (none)
Response shape   : LocationSiteResponse
Hook type        : useQuery
Query key        : [ 'location-sites', id ]
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
─────────────────────────────────────────────────────────────────

### F2-LOV-QUERY — LOV-ORG-006 — LOCATION_SITE_TYPE
─────────────────────────────────────────────────────────────────
LOV-ID           : LOV-ORG-006
LOOKUP_CODE      : LOCATION_SITE_TYPE
Hook name        : useLocationSiteTypeOptions()
Endpoint         : GET /api/v1/lookups/LOCATION_SITE_TYPE?active=true (SRS A5 preamble — generic LOV endpoint, confirm exact path against real API Docs if a /lookups controller doc is added later; not among the 7 endpoint files supplied this session)
Query key        : ['lookups', 'LOCATION_SITE_TYPE']
Returns          : list of lookup options — each option: { detailCode, nameAr, nameEn }
Used by field    : siteTypeId in LocationSite
DB Column        : site_type_id (DBF-ID: N/A — backend-execution-plan.md not provided this session; column name sourced directly from SRS A3)
Caching          : staleTime: long (10+ minutes) — stable reference data
Reuse rule       : ONE hook per LOOKUP_CODE — shared across screens using this LOV (none in this module — each LOV-ID here is used by exactly one screen)
─────────────────────────────────────────────────────────────────

**Cross-entity FK reuse (not an LOV — reuses another screen's entity search API):**
  branchFk               → reuses API-ORG-008's query hook, filtered to Branch (active only, isActive=true filter)

### F2-SCREEN-INIT — SCR-ORG-007 — Location Sites
─────────────────────────────────────────────────────────────────
On screen mount:
  1. Permission hook for SCR-ORG-007 — produces canView, canCreate, canEdit, canDelete
     (canDelete kept for completeness — not used to gate Deactivate here, see FINDING-4/SEC-FE)
  2. LOV hook: LOV-ORG-006 — LOOKUP_CODE: LOCATION_SITE_TYPE
  2. Cross-entity picker: branchFk — reuses API-ORG-008 filtered to Branch (active only, isActive=true filter)
  3. If ENTRY mode is EDIT: entity-by-PK query (API-ORG-044), `enabled: !!id`
Search screen state: currentPage/pageSize live in the search query key's filter object
─────────────────────────────────────────────────────────────────

### F2-FACADE-HOOK — SCR-ORG-007 — Location Sites
─────────────────────────────────────────────────────────────────
Facade Hook name : useLocationSitesFacade()
Composes         : API-ORG-039, API-ORG-040, API-ORG-041, API-ORG-042, API-ORG-043, API-ORG-044, useLocationSiteTypeOptions()

STATE THIS FACADE HOOK OWNS OR EXPOSES:
  locationsiteList      — from the search useQuery's `data` — not duplicated into local state
  selectedItem         — local useState (null if none) — UI selection only
  isLoading            — derived from composed hooks' isLoading/isFetching
  searchFilters        — local useState / URL search params — currentPage/pageSize live inside it
  siteTypeIdOptions     — from useLocationSiteTypeOptions()'s `data`
  branchFkOptions       — from reused API-ORG-008 query's `data`, filtered active

OPERATIONS EXPOSED TO COMPONENTS:
  createLocationSite(data)    → calls API-ORG-039 mutation
  updateLocationSite(id, data)→ calls API-ORG-041 mutation
  deactivateLocationSite(id)  → calls API-ORG-042 mutation — backend performs the dependent-check
                                    (no client pre-check); on 409, banner shows the
                                    rule's bilingual message. Rules: No RULE-ID declared against LocationSite deactivation in SRS A4 — standard confirm-deactivate dialog only (ui-ux-spec.md confirmed)
  activateLocationSite(id)    → calls API-ORG-043 mutation
  selectItem(item)              → updates selectedItem — no API call
  setSearchFilters(filters)     → updates searchFilters — refetches automatically

BOUNDARIES:
  ✓ Components call the Facade Hook only — no direct useQuery/useMutation in components
  ✓ Facade Hook composes F2-QUERY/F2-LOV-QUERY hooks only — no direct fetch/axios calls
  ✓ currentPage/pageSize live inside searchFilters — never separate state
─────────────────────────────────────────────────────────────────
