<!-- Source: PHASE:F2 / SUB:F2-SCR-ORG-001 -->
<!-- Context: see F2-HEADER.md for phase-level strategy, registry table, and intro -->

## F2 — SCR-ORG-001 — Legal Entities

### F2-QUERY — API-ORG-001 — Create Legal Entity
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-001
HTTP method      : POST
Endpoint path    : /api/v1/org/legal-entities (matches real API Docs exactly)
Request shape    : CreateLegalEntityRequest {nameAr, nameEn, entityTypeId, notes?}
Response shape   : LegalEntityResponse
Hook type        : useMutation
Errors this call can produce:
  400 (field validation, RULE-ORG-011..016 depending on field) → inline
  409 (RULE-ORG-012 code sequence conflict / RULE-ORG-015 name uniqueness) → toast
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['legal-entities'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-002 — Search Legal Entities
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-002
HTTP method      : POST (real API — SRS B5 wrongly declares GET, see FINDING-5)
Endpoint path    : /api/v1/org/legal-entities/search (matches real API Docs exactly)
Request shape    : LegalEntitySearchRequest {filters: [{field, operator, value}] — map legalEntityCode/nameAr/nameEn/entityTypeId/isActive here, sorts?, page, size}
Response shape   : Page<LegalEntityResponse>
Hook type        : useQuery (POST-in-queryFn — search is a read despite the HTTP verb; body carries the filter DSL, see FINDING-5)
Query key        : [ 'legal-entities', searchFilters ] — searchFilters IS the request body (filters/sorts/page/size); currentPage/pageSize live inside it
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-003 — Update Legal Entity
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-003
HTTP method      : PUT
Endpoint path    : /api/v1/org/legal-entities/{id} (matches real API Docs exactly)
Request shape    : UpdateLegalEntityRequest {nameAr?, nameEn?, entityTypeId?, notes?}
Response shape   : LegalEntityResponse
Hook type        : useMutation
Errors this call can produce:
  400 (field validation, RULE-ORG-011..016 depending on field) → inline
  409 (RULE-ORG-012 code sequence conflict / RULE-ORG-015 name uniqueness) → toast
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['legal-entities'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-004 — Deactivate Legal Entity
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-004
HTTP method      : PUT
Endpoint path    : /api/v1/org/legal-entities/{id}/deactivate (matches real API Docs exactly)
Request shape    : (none)
Response shape   : confirmation / 204
Hook type        : useMutation
Errors this call can produce:
  409 (dependent-record block) → toast — rule(s): see screen's deactivate_rules below
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['legal-entities'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-005 — Activate Legal Entity
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-005
HTTP method      : PUT
Endpoint path    : /api/v1/org/legal-entities/{id}/activate (matches real API Docs exactly)
Request shape    : (none)
Response shape   : confirmation / 204
Hook type        : useMutation
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
Invalidation     : invalidates ['legal-entities'] search query key on success (list must refresh)
─────────────────────────────────────────────────────────────────

### F2-QUERY — API-ORG-006 — Get Legal Entity by ID
─────────────────────────────────────────────────────────────────
API-ID           : API-ORG-006
HTTP method      : GET
Endpoint path    : /api/v1/org/legal-entities/{id} (matches real API Docs exactly)
Request shape    : (none)
Response shape   : LegalEntityResponse
Hook type        : useQuery
Query key        : [ 'legal-entities', id ]
Errors this call can produce:
  401 → login / 403 → unauthorized (see FINDING-4 for Deactivate/Activate specifically)
Loading behavior : LOCAL (no SRS indication any of these calls exceed 500ms)
Caching          : defaults (no deviation declared — not stable reference data)
─────────────────────────────────────────────────────────────────

### F2-LOV-QUERY — LOV-ORG-001 — LEGAL_ENTITY_TYPE
─────────────────────────────────────────────────────────────────
LOV-ID           : LOV-ORG-001
LOOKUP_CODE      : LEGAL_ENTITY_TYPE
Hook name        : useLegalEntityTypeOptions()
Endpoint         : GET /api/v1/lookups/LEGAL_ENTITY_TYPE?active=true (SRS A5 preamble — generic LOV endpoint, confirm exact path against real API Docs if a /lookups controller doc is added later; not among the 7 endpoint files supplied this session)
Query key        : ['lookups', 'LEGAL_ENTITY_TYPE']
Returns          : list of lookup options — each option: { detailCode, nameAr, nameEn }
Used by field    : entityTypeId in LegalEntity
DB Column        : entity_type_id (DBF-ID: N/A — backend-execution-plan.md not provided this session; column name sourced directly from SRS A3)
Caching          : staleTime: long (10+ minutes) — stable reference data
Reuse rule       : ONE hook per LOOKUP_CODE — shared across screens using this LOV (none in this module — each LOV-ID here is used by exactly one screen)
─────────────────────────────────────────────────────────────────

### F2-SCREEN-INIT — SCR-ORG-001 — Legal Entities
─────────────────────────────────────────────────────────────────
On screen mount:
  1. Permission hook for SCR-ORG-001 — produces canView, canCreate, canEdit, canDelete
     (canDelete kept for completeness — not used to gate Deactivate here, see FINDING-4/SEC-FE)
  2. LOV hook: LOV-ORG-001 — LOOKUP_CODE: LEGAL_ENTITY_TYPE
  3. If ENTRY mode is EDIT: entity-by-PK query (API-ORG-006), `enabled: !!id`
Search screen state: currentPage/pageSize live in the search query key's filter object
─────────────────────────────────────────────────────────────────

### F2-FACADE-HOOK — SCR-ORG-001 — Legal Entities
─────────────────────────────────────────────────────────────────
Facade Hook name : useLegalEntitiesFacade()
Composes         : API-ORG-001, API-ORG-002, API-ORG-003, API-ORG-004, API-ORG-005, API-ORG-006, useLegalEntityTypeOptions()

STATE THIS FACADE HOOK OWNS OR EXPOSES:
  legalentityList      — from the search useQuery's `data` — not duplicated into local state
  selectedItem         — local useState (null if none) — UI selection only
  isLoading            — derived from composed hooks' isLoading/isFetching
  searchFilters        — local useState / URL search params — currentPage/pageSize live inside it
  entityTypeIdOptions   — from useLegalEntityTypeOptions()'s `data`

OPERATIONS EXPOSED TO COMPONENTS:
  createLegalEntity(data)     → calls API-ORG-001 mutation
  updateLegalEntity(id, data) → calls API-ORG-003 mutation
  deactivateLegalEntity(id)   → calls API-ORG-004 mutation — backend performs the dependent-check
                                    (no client pre-check); on 409, banner shows the
                                    rule's bilingual message. Rules: RULE-ORG-001, RULE-ORG-002 (409 → toast, backend-enforced)
  activateLegalEntity(id)     → calls API-ORG-005 mutation
  selectItem(item)              → updates selectedItem — no API call
  setSearchFilters(filters)     → updates searchFilters — refetches automatically

BOUNDARIES:
  ✓ Components call the Facade Hook only — no direct useQuery/useMutation in components
  ✓ Facade Hook composes F2-QUERY/F2-LOV-QUERY hooks only — no direct fetch/axios calls
  ✓ currentPage/pageSize live inside searchFilters — never separate state
─────────────────────────────────────────────────────────────────
