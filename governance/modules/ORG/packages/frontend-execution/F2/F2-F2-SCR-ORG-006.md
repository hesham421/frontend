<!-- Source: PHASE:F2 / SUB:F2-SCR-ORG-006 -->
<!-- Context: see F2-HEADER.md for phase-level strategy, registry table, and intro -->

## F2 — SCR-ORG-006 — Profit Centers

### F2-QUERY — API-ORG-033 — Create Profit Center
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-033
HTTP method      : POST
Endpoint path    : /api/v1/org/profit-centers (matches real API Docs exactly)
Request shape    : CreateProfitCenterRequest {nameAr, nameEn, legalEntityFk, notes?}
Response shape   : ProfitCenterResponse
Hook type        : useMutation
Errors this call can produce:
  400 (field validation, RULE-ORG-011..016 depending on field) → inline
  409 (RULE-ORG-012 code sequence conflict / RULE-ORG-015 name uniqueness) → toast
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['profit-centers'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-034 — Search Profit Centers
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-034
HTTP method      : POST (real API — SRS B5 wrongly declares GET, see FINDING-5)
Endpoint path    : /api/v1/org/profit-centers/search (matches real API Docs exactly)
Request shape    : ProfitCenterSearchRequest {filters: [{field, operator, value}] — map profitCenterCode/nameAr/legalEntityFk/isActive here, sorts?, page, size}
Response shape   : Page<ProfitCenterResponse>
Hook type        : useQuery (POST-in-queryFn — search is a read despite the HTTP verb; body carries the filter DSL, see FINDING-5)
Query key        : [ 'profit-centers', searchFilters ] — searchFilters IS the request body (filters/sorts/page/size); currentPage/pageSize live inside it
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-035 — Update Profit Center
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-035
HTTP method      : PUT
Endpoint path    : /api/v1/org/profit-centers/{id} (matches real API Docs exactly)
Request shape    : UpdateProfitCenterRequest {nameAr?, nameEn?, notes?}
Response shape   : ProfitCenterResponse
Hook type        : useMutation
Errors this call can produce:
  400 (field validation, RULE-ORG-011..016 depending on field) → inline
  409 (RULE-ORG-012 code sequence conflict / RULE-ORG-015 name uniqueness) → toast
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['profit-centers'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-036 — Deactivate Profit Center
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-036
HTTP method      : PUT
Endpoint path    : /api/v1/org/profit-centers/{id}/deactivate (matches real API Docs exactly)
Request shape    : (none)
Response shape   : confirmation / 204
Hook type        : useMutation
Errors this call can produce:
  409 (dependent-record block) → toast — rule(s): see screen's deactivate_rules below
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['profit-centers'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-037 — Activate Profit Center
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-037
HTTP method      : PUT
Endpoint path    : /api/v1/org/profit-centers/{id}/activate (matches real API Docs exactly)
Request shape    : (none)
Response shape   : confirmation / 204
Hook type        : useMutation
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['profit-centers'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-038 — Get Profit Center by ID
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-038
HTTP method      : GET
Endpoint path    : /api/v1/org/profit-centers/{id} (matches real API Docs exactly)
Request shape    : (none)
Response shape   : ProfitCenterResponse
Hook type        : useQuery
Query key        : [ 'profit-centers', id ]
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
─────────────────────────────────────────────────────────────────

### F2-LOV-QUERY — (none owned by this screen)
This screen's only FK fields reuse another screen's own entity search (see
cross-entity reuse below) — no LOV-ID / lookupKey applies.

**Cross-entity FK reuse (not an LOV — reuses another screen's entity search API):**
  legalEntityFk          → reuses API-ORG-002's query hook, filtered to LegalEntity (active only, isActive=true filter)

### F2-SCREEN-INIT — SCR-ORG-006 — Profit Centers
─────────────────────────────────────────────────────────────────
On screen mount:
  1. Permission hook for SCR-ORG-006 — produces canView, canCreate, canEdit, canDelete
     (canDelete kept for completeness — not used to gate Deactivate here, see FINDING-4/SEC-FE)
  2. Cross-entity picker: legalEntityFk — reuses API-ORG-002 filtered to LegalEntity (active only, isActive=true filter)
  3. If ENTRY mode is EDIT: entity-by-PK query (API-ORG-038), `enabled: !!id`
Search screen state: currentPage/pageSize live in the search query key's filter object
─────────────────────────────────────────────────────────────────

### F2-FACADE-HOOK — SCR-ORG-006 — Profit Centers
─────────────────────────────────────────────────────────────────
Facade Hook name : useProfitCentersFacade()
Composes         : API-ORG-033, API-ORG-034, API-ORG-035, API-ORG-036, API-ORG-037, API-ORG-038

STATE THIS FACADE HOOK OWNS OR EXPOSES:
  profitcenterList      — from the search useQuery's `data` — not duplicated into local state
  selectedItem         — local useState (null if none) — UI selection only
  isLoading            — derived from composed hooks' isLoading/isFetching
  searchFilters        — local useState / URL search params — currentPage/pageSize live inside it
  legalEntityFkOptions  — from reused API-ORG-002 query's `data`, filtered active

OPERATIONS EXPOSED TO COMPONENTS:
  createProfitCenter(data)    → calls API-ORG-033 mutation
  updateProfitCenter(id, data)→ calls API-ORG-035 mutation
  deactivateProfitCenter(id)  → calls API-ORG-036 mutation — backend performs the dependent-check
                                    (no client pre-check); on 409, banner shows the
                                    rule's bilingual message. Rules: No RULE-ID declared against ProfitCenter deactivation in SRS A4 — standard confirm-deactivate dialog only (ui-ux-spec.md confirmed)
  activateProfitCenter(id)    → calls API-ORG-037 mutation
  selectItem(item)              → updates selectedItem — no API call
  setSearchFilters(filters)     → updates searchFilters — refetches automatically

BOUNDARIES:
  ✓ Components call the Facade Hook only — no direct useQuery/useMutation in components
  ✓ Facade Hook composes F2-QUERY/F2-LOV-QUERY hooks only — no direct fetch/axios calls
  ✓ currentPage/pageSize live inside searchFilters — never separate state
─────────────────────────────────────────────────────────────────
