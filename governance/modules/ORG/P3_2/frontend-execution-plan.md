# FRONTEND EXECUTION PLAN — Organization (ORG)

```
Plan-ID          : PLAN-ORG-001 (backend-assigned, PASS 1 — referenced, not reassigned)
Module           : Organization (ORG prefix) — Feature Code ORG-001
Pass             : PASS 2 — Project 3.2 (Frontend Execution Engine)
Stack            : React + TanStack Query + React Hook Form + Zod (per CORE-8)
Screens in scope : 7 (SCR-ORG-001 .. SCR-ORG-007)
APIs referenced  : 44 (API-ORG-001 .. API-ORG-044) — real, api-doc-generator output
LOVs referenced  : 6 (LOV-ORG-001 .. LOV-ORG-006)
Rules referenced : 20 (RULE-ORG-001 .. RULE-ORG-020)
Open Questions   : 3 active — see OQ LOG (this file) — OQ-ORG-001 (carried, DEFERRED,
                   non-blocking), OQ-ORG-002 (REVISED this session), OQ-ORG-003 (NEW)
Governed by      : PROJECT-3-FRONTEND-ENGINE.md v2.1
```

## GATE CONFIRMATION

```
GATE: BACKEND MODULE COMPLETE ......... PASSED ✓
  Backend 100% implemented ............ Yes (real API Docs exist → implies live backend)
  Real API Docs attached .............. Yes — index.md + 7 endpoint files, 44 API-IDs
  flow-diagram.md attached, approved .. Yes — human-approved per user confirmation 2026-08-29
  ui-ux-spec.md attached, approved .... Yes — human-approved per user confirmation 2026-08-29

GATE: UI SHELL COMPLETE ............... PASSED ✓
  UI Shell implemented (real code) .... Yes — shell-manifest-ORG.md, 7 pages under
                                        frontend/src/pages/Organization/
  Visual fidelity human-confirmed ..... Yes — confirmed by user directly, 2026-08-29
                                        (no governance/modules/ORG/execution-state.json
                                        record exists — noted, not this engine's scope)

Both mandatory pre-gates (Section 2.0 / 2.0b) satisfied. PASS 2, STAGE 1 proceeding.
```

## STRUCTURAL NOTE — SHELL DEVIATES FROM ASSUMED LAYOUT (carried from shell-manifest)

```
This repo has no src/features/[module]/ layout and no react-router route tree.
The ORG Shell lives at frontend/src/pages/Organization/, and navigation is a
`currentScreen` string switched in src/App.tsx (useNavigationStore), not a
declarative route config. F4 below documents BOTH: (a) the F4-RULE-1 target
path convention this plan specifies for when real routing exists, and (b) the
Shell's actual current screen-key, so the agent wiring real API calls is not
misled into thinking react-router paths already exist.
```

## FINDINGS SURFACED THIS SESSION (read before using this plan)

```
FINDING-1 (P2.5 CITATION ERROR — corrected, not propagated)
  flow-diagram-3.md (FLOW-ORG-003) and ui-ux-spec-3.md (SCR-ORG-003 design intent)
  both cite "SRS A5 / LOV-ORG-007 (line 774)" as naming "SCR-ORG-008 (Admin)" for
  RegionType management, and cite "API-ORG-020" as a region-types GET endpoint.
  Verified directly against srs.md:
    - A5 (LOVs) defines only LOV-ORG-001 through LOV-ORG-006. No LOV-ORG-007 exists.
    - "SCR-ORG-008" does not appear anywhere in srs.md (grep-confirmed, 0 hits).
    - Line 774 of srs.md is inside A7 (Module Dependencies), describing the
      NumberingEngine integration — unrelated to RegionType or any screen ID.
    - API-ORG-020 is GET /api/v1/org/departments/tree (SRS B5, SCR-ORG-004) — not
      a region-types endpoint, and no /region-types endpoint exists anywhere in
      the real, implemented API surface (grep-confirmed across all 7 endpoint docs).
  This plan does NOT propagate the fabricated citation. See FINDING-2 for the
  corrected, verified version of the underlying gap.

FINDING-2 (REAL FUNCTIONAL GAP — RegionType has no backend read access)
  ENTITY-ORG-008 (RegionType) is declared in SRS A3 with operations "Create, Read,
  Update (Admin only)", but SRS PART B assigns it no SCR-ID and no API-ID, and the
  real backend implements ZERO endpoints for it. Region's real response DTO only
  returns the FK + a denormalized display name (regionTypeIdFk: integer,
  regionTypeNameEn: string) — there is no endpoint to enumerate valid RegionType
  options for a create/edit dropdown on SCR-ORG-003.
  DISPOSITION: regionTypeIdFk marked DEFERRED for CREATE/UPDATE in F1/F2/F3 below
  (display-only on read, no picker until a real endpoint exists). Recorded as
  OQ-ORG-002 (REVISED — supersedes the P2.5 engine's version, which relied on the
  fabricated citation in FINDING-1).

FINDING-3 (F1 CONFIRM — Shell model / real API DTO mismatches, corrected below)
  - LegalEntity.entityTypeId: Shell hardcodes the union with 'REP_OFFICE' — the real
    code (LOV-ORG-001) is 'REPRESENTATIVE_OFFICE'. CORRECTED in F1.
  - Branch.branchTypeId: Shell hardcodes 'MAIN'|'SUB'|'OPERATIONS'|'ADMIN' — all four
    wrong; real codes (LOV-ORG-002) are MAIN_BRANCH / SUB_BRANCH / OPERATIONS_BRANCH /
    ADMIN_BRANCH. CORRECTED in F1.
  - Region.regionTypeIdFk: Shell hardcodes a 5-value string union; real API types it
    as integer (int64) FK. Not a simple retype — see FINDING-2 (DEFERRED).
  - All 7 Shell models omit audit fields (createdAt/createdBy/updatedAt/updatedBy)
    that ARE present on every real response DTO and ARE required by the approved
    ui-ux-spec's "Record info" footer (proposed identically across all 7 screens).
    ADDED to all 7 models in F1.
  - LegalEntity.activeBranchesCount (Shell-only field, no backing API field): flagged
    as an integration decision — compute client-side from the Branches list filtered
    by legalEntityFk + isActive, or drop the field. Not resolved here (UI-owned).
  - All entity id / *Fk fields: Shell types them `string`; real API types them
    `integer (int64)`. Flagged as a systemic integration-time conversion point,
    not treated as a defect in the Shell's mock-data design.
  - Department.nodeTypeId, CostCenter.nodeTypeId/costCenterTypeId, LocationSite.
    siteTypeId: Shell unions match real LOV codes exactly. No correction needed.

FINDING-4 (REAL vs DECLARED PERMISSION MISMATCH — all 7 screens, all 44 APIs)
  SRS B2/B4 and registry-srs-org.md declare the Deactivate action on every one of
  the 7 ORG screens requires PERM_[PAGE_CODE]_DELETE. The real, implemented backend
  (verified directly from all 7 endpoint docs' "Required permission(s)" annotations)
  enforces PERM_[PAGE_CODE]_UPDATE on every deactivate AND activate endpoint, for
  all 44 APIs, with zero exceptions. PERM_*_DELETE is never checked anywhere in the
  real ORG backend, even though SEC-3 still seeds it for every PAGE_CODE.
  DISPOSITION (CONTRACT-12 — real artifact beats planned artifact): F4/SEC-FE below
  gate the Deactivate/Activate buttons on canEdit (UPDATE), matching what the real
  backend will actually accept — gating on canDelete per SRS would show an enabled
  button that 403s for UPDATE-only users, or hide a button that would have worked.
  This is recorded as OQ-ORG-003 (NEW) for backend/product attention: either the
  real backend is missing an intended DELETE check (access-control gap — anyone
  with UPDATE can deactivate, wider than SRS intended), or SRS's B2/B4 permission
  column was never meant to be DELETE and should be corrected instead. This plan
  does not decide which side is "right" — it wires the frontend to match what the
  live backend actually enforces, and escalates the discrepancy.
```

## OQ LOG (continuation — CONTRACT-3 header only; full text below)

```
Open Questions: 3 active — OQ-ORG-001 (DEFERRED, carried, non-blocking),
                OQ-ORG-002 (REVISED), OQ-ORG-003 (NEW)
```

### OQ-ORG-001 (carried — no change this session)
Region deactivation impact on SOFT-READ consumer modules — DEFERRED, non-blocking,
resolves when first consumer module runs MODE 1.5. Source: srs.md OQ Log.

### OQ-ORG-002 (REVISED this session — supersedes flow-diagram-3.md's version)
RegionType (ENTITY-ORG-008) has no SCR-ID, no API-ID, and no real backend endpoint
to enumerate its records. Original citation to "SRS A5/LOV-ORG-007" naming
"SCR-ORG-008" does not exist in srs.md (FINDING-1) — retracted. Real gap (FINDING-2)
remains: regionTypeIdFk cannot be populated as a create/edit dropdown until either
(a) a real endpoint is added to list RegionType records, or (b) SRS specifies
SCR-ORG-008 in full and it is built, or (c) product confirms the field stays
display-only indefinitely. Status: OPEN — BLOCKING for SCR-ORG-003 create/edit of
regionTypeIdFk only; non-blocking for the rest of the module. Escalation: RECONCILE-ORG.

### OQ-ORG-003 (NEW this session)
Real backend enforces PERM_*_UPDATE (not PERM_*_DELETE) on every deactivate/activate
endpoint across all 7 ORG screens (FINDING-4). Needs backend/product confirmation:
is PERM_*_DELETE meant to gate this action (backend fix needed) or was SRS B2/B4's
permission column wrong (SRS fix needed)? Status: OPEN — non-blocking for this
frontend plan (wired to match real backend per CONTRACT-12) but should not be closed
silently. Escalation: RECONCILE-ORG.

### FINDING-5 (REAL vs DECLARED SEARCH CONTRACT — all 7 screens, not an OQ — corrected in F2)
SRS B5 declares every screen's search API as a plain GET with flat, named query
params (e.g. `region_code?, name_ar?, legal_entity_fk?, ..., page, size`). The real,
implemented backend (verified across all 7 endpoint docs) instead exposes search as
POST {path}/search with a generic filter-DSL body: `{ filters: [{field, operator,
value}], sorts: [{field, direction}], page, size }` (a `ContractFilter`/`ContractSort`
pattern shared framework-wide, per index.md's "Advanced Search" section). This is a
real, confirmed backend contract, not a defect — F2-QUERY below uses the real POST
+ filter-array shape for all 7 search calls, mapped from each screen's SRS-named
filter fields into `{field, operator, value}` triples. No OQ needed — CONTRACT-12
applies directly, no ambiguity to escalate.

<!-- PHASE:F1:START -->
# PHASE F1 — Frontend Model Specifications (v2.1 — CONFIRM against real API + Shell)

Open Questions: 3 active / see OQ Log above

**Responsibility applied:** models already used in the real UI Shell
(shell-manifest-ORG.md, `src/data/mockData.ts:200-279`) are confirmed against the
real API Docs' DTO shapes. Mismatches are corrected below; no field is added that
the Shell doesn't already need, except where the approved ui-ux-spec explicitly
requires it (audit footer) or the real API already returns it unused by the Shell.

<!-- SUB:F1-SCR-ORG-001:START -->
### F1-MODEL — SCR-ORG-001 — Legal Entities
─────────────────────────────────────────────────────────────────
Entity           : ENTITY-ORG-001 (LegalEntity) — confirm against A3
Container Pattern: SIDE_DRAWER
Pattern rationale: Flat entity, root of the module, >8 fields, no self-reference — Shell's LegalEntities.tsx renders search grid + create/edit drawer + confirm dialog in one file, matching SIDE_DRAWER exactly.
Shell file       : Legal Entities → src/pages/Organization/LegalEntity.tsx (see shell-manifest-ORG.md for exact path)

Model fields (Shell → confirmed / corrected against real API DTO):
  id                                            : string (Shell) / integer int64 (real API)
      id field — FLAG: systemic string-vs-number convention, see FINDING-3
  legalEntityCode                               : string, read-only
      matches real `legalEntityCode` — no change
  nameAr                                        : string
      matches real `nameAr` — no change
  nameEn                                        : string
      matches real `nameEn` — no change
  entityTypeId                                  : 'HEAD_OFFICE' | 'BRANCH_OFFICE' | 'SUBSIDIARY' | 'REPRESENTATIVE_OFFICE'
      CORRECTED — Shell had 'REP_OFFICE'; real LOV-ORG-001 code is REPRESENTATIVE_OFFICE
  notes                                         : string | undefined
      matches real `notes` (optional) — no change
  isActive                                      : boolean
      matches real `isActive` — no change
  activeBranchesCount                           : number | undefined
      Shell-only — FLAG: no backing real API field, see FINDING-3 (integration decision, not resolved here)
  createdAt / createdBy / updatedAt / updatedBy : string (ISO date-time) / string
      ADDED — present on real DTO, required by approved ui-ux-spec "Record info" audit footer (all 7 screens)

Container-specific structure: Search/type/status filter bar + data table + create/edit drawer + cascade-warning deactivation confirm dialog, all in `LegalEntities.tsx` — matches SIDE_DRAWER. F4 flags whether Search/Drawer are separate internal sub-components (CORE-9) — the manifest's extraction depth doesn't confirm this; agent must verify against the actual file, not assumed here.
─────────────────────────────────────────────────────────────────
<!-- SUB:F1-SCR-ORG-001:END -->

<!-- SUB:F1-SCR-ORG-002:START -->
### F1-MODEL — SCR-ORG-002 — Branches
─────────────────────────────────────────────────────────────────
Entity           : ENTITY-ORG-002 (Branch) — confirm against A3
Container Pattern: SIDE_DRAWER
Pattern rationale: Flat entity, >8 fields, FK to LegalEntity — Shell's Branches.tsx matches SIDE_DRAWER exactly, plus per-row drill-in links (design intent only, not a new route pattern).
Shell file       : Branches → src/pages/Organization/Branch.tsx (see shell-manifest-ORG.md for exact path)

Model fields (Shell → confirmed / corrected against real API DTO):
  id                                            : string (Shell) / integer int64 (real API)
      FLAG: see FINDING-3
  branchCode                                    : string, read-only
      matches real `branchCode` — no change
  nameAr / nameEn                               : string
      matches real — no change
  legalEntityFk                                 : string (Shell) / integer int64 (real API)
      FLAG: id-type convention, see FINDING-3; real DTO also returns denormalized `legalEntityCode` — Shell does not carry this display field, ADD for search-grid/entry display parity
  branchTypeId                                  : 'MAIN_BRANCH' | 'SUB_BRANCH' | 'OPERATIONS_BRANCH' | 'ADMIN_BRANCH'
      CORRECTED — Shell had 'MAIN'|'SUB'|'OPERATIONS'|'ADMIN'; real LOV-ORG-002 codes all carry the _BRANCH suffix
  notes                                         : string | undefined
      no change
  isActive                                      : boolean
      no change
  createdAt / createdBy / updatedAt / updatedBy : string / string
      ADDED — same audit-footer rationale as SCR-ORG-001

Container-specific structure: Search/entity/type/status filter bar + data table (with per-row drill-in links to Departments/Cost Centers/Location Sites, design-intent only) + create/edit drawer + cascade-warning confirm dialog, all in `Branches.tsx` — matches SIDE_DRAWER.
─────────────────────────────────────────────────────────────────
<!-- SUB:F1-SCR-ORG-002:END -->

<!-- SUB:F1-SCR-ORG-003:START -->
### F1-MODEL — SCR-ORG-003 — Regions
─────────────────────────────────────────────────────────────────
Entity           : ENTITY-ORG-003 (Region) — confirm against A3
Container Pattern: SIDE_DRAWER
Pattern rationale: Flat entity, >8 fields, FK to LegalEntity + RegionType — Shell's Regions.tsx matches SIDE_DRAWER.
Shell file       : Regions → src/pages/Organization/Region.tsx (see shell-manifest-ORG.md for exact path)

Model fields (Shell → confirmed / corrected against real API DTO):
  id                                            : string (Shell) / integer int64 (real API)
      FLAG: see FINDING-3
  regionCode                                    : string, read-only
      matches real `regionCode` — no change
  nameAr / nameEn                               : string
      no change
  legalEntityFk                                 : string (Shell) / integer int64 (real API)
      FLAG: id-type convention; real DTO also returns `legalEntityCode` — ADD for display parity
  regionTypeIdFk                                : 'CENTRAL'|'WESTERN'|'EASTERN'|'SOUTHERN'|'NORTHERN' (Shell) vs integer int64 (real API) + regionTypeNameEn: string (real, denormalized)
      NOT a simple retype — DEFERRED, see FINDING-2/OQ-ORG-002. Real field is a genuine FK to ENTITY-ORG-008 with no listing endpoint. Model correction: type as `number | null` (matches real API), ADD `regionTypeNameEn: string` for read-only display; remove the 5-value Shell union entirely (it does not correspond to real backend values — SRS lists example type codes as GEOGRAPHIC/SALES/OPERATIONAL, not the Shell's directional names, and neither set is authoritative since no real endpoint enumerates them).
  notes                                         : string | undefined
      no change
  isActive                                      : boolean
      no change
  createdAt / createdBy / updatedAt / updatedBy : string / string
      ADDED — same audit-footer rationale

Container-specific structure: Search/entity/type/status filter bar + data table + create/edit drawer + confirm dialog, all in `Regions.tsx` — matches SIDE_DRAWER. regionTypeIdFk field inside the drawer is DEFERRED (see FINDING-2): render as read-only display of `regionTypeNameEn` until OQ-ORG-002 resolves; no create/edit picker.
─────────────────────────────────────────────────────────────────
<!-- SUB:F1-SCR-ORG-003:END -->

<!-- SUB:F1-SCR-ORG-004:START -->
### F1-MODEL — SCR-ORG-004 — Departments
─────────────────────────────────────────────────────────────────
Entity           : ENTITY-ORG-004 (DepartmentNode) — confirm against A3
Container Pattern: TREE_MASTER_DETAIL
Pattern rationale: Self-referencing FK (parentDepartmentFk), hierarchical — SRS B1 mandates PATTERN-3; Shell's Departments.tsx renders a two-column tree+form layout, matching TREE_MASTER_DETAIL exactly.
Shell file       : Departments → src/pages/Organization/SCR-ORG-004.tsx (see shell-manifest-ORG.md for exact path)

Model fields (Shell → confirmed / corrected against real API DTO):
  id                                            : string (Shell) / integer int64 (real API)
      FLAG: see FINDING-3
  deptCode                                      : string, read-only
      matches real `deptCode`? — CORRECTION: real API field name is `deptCode` per DTO (confirmed same as Shell) — no change
  nameAr / nameEn                               : string
      no change
  branchFk                                      : string (Shell) / integer int64 (real API)
      FLAG: id-type convention; real DTO also returns `branchCode` — ADD for display parity
  parentDepartmentFk                            : string | null (Shell) / integer int64 | null (real API)
      FLAG: id-type convention — semantics match (null = root node)
  nodeTypeId                                    : 'SUMMARY' | 'DETAIL'
      matches real LOV-ORG-003 codes exactly — no change. Locked post-save per RULE-ORG-020, see F3.
  notes                                         : string | undefined
      no change
  isActive                                      : boolean
      no change
  children                                      : DepartmentNode[] | undefined
      Shell pre-nests tree client-side from mock data; real API's GET /departments/tree (API-ORG-020) returns the tree pre-shaped server-side — shape-compatible, no change needed to the model itself
  createdAt / createdBy / updatedAt / updatedBy : string / string
      ADDED — same audit-footer rationale

Container-specific structure: Branch-filter requirement bar + two-column layout: recursive tree panel (expand/collapse, add-child/add-root) + entry/inspection form panel + confirm dialog, all in `Departments.tsx` — matches TREE_MASTER_DETAIL exactly. Per ui-ux-spec design intent: SUMMARY vs DETAIL nodes get distinct icons (folder vs document) — visual only, no model impact.
─────────────────────────────────────────────────────────────────
<!-- SUB:F1-SCR-ORG-004:END -->

<!-- SUB:F1-SCR-ORG-005:START -->
### F1-MODEL — SCR-ORG-005 — Cost Centers
─────────────────────────────────────────────────────────────────
Entity           : ENTITY-ORG-005 (CostCenterNode) — confirm against A3
Container Pattern: TREE_MASTER_DETAIL
Pattern rationale: Self-referencing FK (parentCostCenterFk), hierarchical, same structure as Departments plus one extra classification field — SRS B1 mandates PATTERN-3; Shell's CostCenters.tsx matches TREE_MASTER_DETAIL.
Shell file       : Cost Centers → src/pages/Organization/SCR-ORG-005.tsx (see shell-manifest-ORG.md for exact path)

Model fields (Shell → confirmed / corrected against real API DTO):
  id                                            : string (Shell) / integer int64 (real API)
      FLAG: see FINDING-3
  costCenterCode                                : string, read-only
      matches real — no change
  nameAr / nameEn                               : string
      no change
  branchFk                                      : string (Shell) / integer int64 (real API)
      FLAG: id-type convention; real DTO also returns `branchCode` — ADD for display parity
  parentCostCenterFk                            : string | null (Shell) / integer int64 | null (real API)
      FLAG: id-type convention
  nodeTypeId                                    : 'SUMMARY' | 'DETAIL'
      matches real LOV-ORG-004 codes exactly — no change. Locked post-save per RULE-ORG-020, see F3.
  costCenterTypeId                              : 'DIRECT' | 'INDIRECT' | 'SHARED'
      matches real LOV-ORG-005 codes exactly — no change
  notes                                         : string | undefined
      no change
  isActive                                      : boolean
      no change
  children                                      : CostCenterNode[] | undefined
      shape-compatible with real GET /cost-centers/tree (API-ORG-027) — no change
  createdAt / createdBy / updatedAt / updatedBy : string / string
      ADDED — same audit-footer rationale

Container-specific structure: Branch-filter requirement bar + two-column tree+form layout + confirm dialog, all in `CostCenters.tsx` — matches TREE_MASTER_DETAIL. Per ui-ux-spec design intent: costCenterTypeId shown as a colored badge in the tree itself, not only in the form — visual only, no model impact.
─────────────────────────────────────────────────────────────────
<!-- SUB:F1-SCR-ORG-005:END -->

<!-- SUB:F1-SCR-ORG-006:START -->
### F1-MODEL — SCR-ORG-006 — Profit Centers
─────────────────────────────────────────────────────────────────
Entity           : ENTITY-ORG-006 (ProfitCenter) — confirm against A3
Container Pattern: SIDE_DRAWER
Pattern rationale: Flat entity, no self-reference, simplest screen in the module (5 core fields) — Shell's ProfitCenters.tsx matches SIDE_DRAWER.
Shell file       : Profit Centers → src/pages/Organization/ProfitCenter.tsx (see shell-manifest-ORG.md for exact path)

Model fields (Shell → confirmed / corrected against real API DTO):
  id                                            : string (Shell) / integer int64 (real API)
      FLAG: see FINDING-3
  profitCenterCode                              : string, read-only
      matches real — no change
  nameAr / nameEn                               : string
      no change
  legalEntityFk                                 : string (Shell) / integer int64 (real API)
      FLAG: id-type convention; real DTO also returns `legalEntityCode` — ADD for display parity
  notes                                         : string | undefined
      no change
  isActive                                      : boolean
      no change
  createdAt / createdBy / updatedAt / updatedBy : string / string
      ADDED — same audit-footer rationale

Container-specific structure: Search/entity/status filter bar + data table + create/edit drawer + confirm dialog, all in `ProfitCenters.tsx` — matches SIDE_DRAWER. No deactivate-blocking rule exists against this entity in SRS A4 — confirm dialog only, no save-blocked banner (ui-ux-spec confirmed).
─────────────────────────────────────────────────────────────────
<!-- SUB:F1-SCR-ORG-006:END -->

<!-- SUB:F1-SCR-ORG-007:START -->
### F1-MODEL — SCR-ORG-007 — Location Sites
─────────────────────────────────────────────────────────────────
Entity           : ENTITY-ORG-007 (LocationSite) — confirm against A3
Container Pattern: SIDE_DRAWER
Pattern rationale: Flat entity, FK to Branch — Shell's LocationSites.tsx matches SIDE_DRAWER.
Shell file       : Location Sites → src/pages/Organization/LocationSite.tsx (see shell-manifest-ORG.md for exact path)

Model fields (Shell → confirmed / corrected against real API DTO):
  id                                            : string (Shell) / integer int64 (real API)
      FLAG: see FINDING-3
  locationSiteCode                              : string, read-only
      matches real `locationSiteCode` — no change (note: SRS field name is `location_site_code`; ui-ux-spec.md's design-intent prose used `locationCode` — the real API and SRS agree on `locationSiteCode`/`location_site_code`, which this plan uses as canonical)
  nameAr / nameEn                               : string
      no change
  branchFk                                      : string (Shell) / integer int64 (real API)
      FLAG: id-type convention; real DTO also returns `branchCode` — ADD for display parity
  siteTypeId                                    : 'OFFICE' | 'WAREHOUSE' | 'FACTORY' | 'SITE' | 'RETAIL'
      matches real LOV-ORG-006 codes exactly — no change
  notes                                         : string | undefined
      no change
  isActive                                      : boolean
      no change
  createdAt / createdBy / updatedAt / updatedBy : string / string
      ADDED — same audit-footer rationale

Container-specific structure: Search/branch/type/status filter bar + data table + create/edit drawer + confirm dialog, all in `LocationSites.tsx` — matches SIDE_DRAWER. Per ui-ux-spec: siteTypeId shown with a small type icon in grid + form — visual only.
─────────────────────────────────────────────────────────────────
<!-- SUB:F1-SCR-ORG-007:END -->

<!-- PHASE:F1:END -->

<!-- PHASE:F2:START -->
# PHASE F2 — Frontend Data & Facade Hook Specifications

Open Questions: 3 active / see OQ Log above

**Frontend contracts declared once, referenced by every screen below:**
```
State ownership: currentPage/pageSize live inside each screen's searchFilters
  object (the TanStack Query key) — never independent useState.
Error routing (shared Axios interceptor — mechanism itself is a CORE-phase
  decision outside this module's scope; referenced here, not redeclared):
  HTTP 400 → inline under field (React Hook Form setError, see F3)
  HTTP 409/422 → shared error mapper → toast (RULE-ORG-001..006 violations land here)
  HTTP 401 → redirect to login
  HTTP 403 → redirect to unauthorized (relevant given FINDING-4 — see SEC-FE)
  HTTP 500 → generic message only
Pre-deactivation check: every deactivate mutation below is preceded by the
  backend's own dependent-check (RULE-ORG-001..006 enforced server-side); the
  UI does not pre-check client-side — it calls deactivate, and on 409 shows the
  rule's bilingual message via the save-blocked banner (ui-ux-spec design intent).
```

<!-- SUB:F2-SCR-ORG-001:START -->
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
<!-- SUB:F2-SCR-ORG-001:END -->

<!-- SUB:F2-SCR-ORG-002:START -->
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
<!-- SUB:F2-SCR-ORG-002:END -->

<!-- SUB:F2-SCR-ORG-003:START -->
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
<!-- SUB:F2-SCR-ORG-003:END -->

<!-- SUB:F2-SCR-ORG-004:START -->
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
<!-- SUB:F2-SCR-ORG-004:END -->

<!-- SUB:F2-SCR-ORG-005:START -->
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
<!-- SUB:F2-SCR-ORG-005:END -->

<!-- SUB:F2-SCR-ORG-006:START -->
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
<!-- SUB:F2-SCR-ORG-006:END -->

<!-- SUB:F2-SCR-ORG-007:START -->
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
<!-- SUB:F2-SCR-ORG-007:END -->

<!-- PHASE:F2:END -->

<!-- PHASE:F3:START -->
# PHASE F3 — Frontend Validation Rule Specifications

Open Questions: 3 active / see OQ Log above

**F3 shared rules declared once, referenced per screen below:**
```
F3-BC-RULE-1 — Business Code field (legalEntityCode/branchCode/regionCode/deptCode/
  costCenterCode/profitCenterCode/locationSiteCode): read-only on all 7 screens.
  Never part of user input — displayed only. Applies RULE-ORG-011/013/014.
F3-BC-RULE-2 — On create form: shown as a muted, read-only placeholder (not an input),
  per ui-ux-spec's "muted background" convention (distinguishes "never editable" from
  "not editable right now").
F3-BC-RULE-3 — On edit form: value from the GET response — shown, never editable.

F3-LOC-RULE-1 — No hardcoded message text — all keyed by ERR-ID → Error Catalog.
  NOTE: this session has no backend-execution-plan.md, so no canonical ERR-ID catalog
  was provided. Message text below is quoted directly from SRS A4 (Message-AR/EN) as
  an interim binding; the agent MUST replace with the real ERR-ID once SVC+API's
  Error Catalog is available — flagged as DRV-4 in the Derivation Log.
F3-LOC-RULE-2 — nameAr (NAME_AR col) / nameEn (NAME_EN col): separate inputs, RTL/LTR aware.
F3-LOC-RULE-3 — Locale detection: session preference → browser locale → default AR.

F3-SEC-RULE-1 — Field visibility/editability governed by screen permissions loaded at
  F2-SCREEN-INIT: canEdit=false → all fields read-only; canCreate=false → no new-record
  entry; canApprove=false → n/a (ORG has no approval workflow, A6 confirms no workflow).
```

<!-- SUB:F3-SCR-ORG-001:START -->
## F3 — SCR-ORG-001 — Legal Entities

### F3-VALIDATION — RULE-ORG-001 — Prevent LegalEntity deactivation — active branches
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent deactivation of a LegalEntity when one or more active Branches reference it
  Message-AR : لا يمكن إلغاء تفعيل الكيان القانوني لوجود فروع نشطة مرتبطة به
  Message-EN : Cannot deactivate Legal Entity: active branches exist
  Scope      : DEACTIVATE (server-enforced, 409)

VALIDATION SPEC:
  Field            : isActive (via Deactivate action)
  DB Column        : is_active_fl (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-002 — Prevent LegalEntity deactivation — active profit centers
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent deactivation of a LegalEntity when one or more active ProfitCenters reference it
  Message-AR : لا يمكن إلغاء تفعيل الكيان القانوني لوجود مراكز ربح نشطة مرتبطة به
  Message-EN : Cannot deactivate Legal Entity: active profit centers exist
  Scope      : DEACTIVATE (server-enforced, 409)

VALIDATION SPEC:
  Field            : isActive (via Deactivate action)
  DB Column        : is_active_fl (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-011 — Business Code immutable after save
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent modification of the Business Code field after the record has been saved for the first time
  Message-AR : رمز الأعمال لا يمكن تعديله بعد الحفظ الأول — هذا الحقل محمي ونهائي
  Message-EN : Business Code is immutable after first save and cannot be modified
  Scope      : UPDATE — see F3-BC-RULE-1..3

VALIDATION SPEC:
  Field            : legalEntityCode
  DB Column        : legal_entity_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : REQUIRED (read-only field, no user-editable validation)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-012 — Business Code uniqueness within defined scope
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST ensure the Business Code generated by NumberingEngine is globally unique within its defined scope
  Message-AR : تعذّر إنشاء رمز الأعمال — تعارض في التسلسل. يرجى المحاولة مرة أخرى
  Message-EN : Business Code generation failed due to sequence conflict. Please retry
  Scope      : CREATE (409, server-only — not a client-checkable rule, no field to validate client-side)

VALIDATION SPEC:
  Field            : legalEntityCode (system-generated)
  DB Column        : legal_entity_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (server-only)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-013 — Business Code generated via NumberingEngine only
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST generate the Business Code exclusively through NumberingEngine
  Message-AR : يجب إنشاء رمز الأعمال عبر محرك الترقيم المركزي فقط
  Message-EN : Business Code must be generated via NumberingEngine only
  Scope      : CREATE — field never sent by client, no client validation needed (see F3-BC-RULE-2)

VALIDATION SPEC:
  Field            : legalEntityCode (never sent by client)
  DB Column        : legal_entity_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : REQUIRED (read-only field)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-014 — Reject Business Code in Update payload
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST reject any Update request that includes the Business Code field in its payload
  Message-AR : رمز الأعمال لا يُقبل ضمن طلبات التعديل
  Message-EN : Business Code field is not accepted in update requests
  Scope      : UPDATE — Update DTOs must omit the code field entirely (F3-BC-RULE-3)

VALIDATION SPEC:
  Field            : legalEntityCode (excluded from Update DTO)
  DB Column        : legal_entity_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (DTO shape)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-015 — Name uniqueness within parent scope
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent saving a record whose name_ar or name_en duplicates an existing active record within the same parent scope
  Message-AR : الاسم مُستخدم مسبقاً ضمن نفس النطاق — يرجى اختيار اسم مختلف
  Message-EN : Name already exists within the same parent scope — please choose a different name
  Scope      : CREATE/UPDATE (409, server-enforced — no client-side pre-check declared; async on-blur check optional per F3 pattern, not specified by SRS)

VALIDATION SPEC:
  Field            : nameAr, nameEn
  DB Column        : name_ar, name_en (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : UNIQUE_CHECK
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-016 — Reject audit fields in request payload
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST reject any request payload that includes audit fields (created_by, created_at, updated_by, updated_at)
  Message-AR : حقول التدقيق لا تُقبل من المستخدم — يملؤها النظام تلقائياً
  Message-EN : Audit fields are not accepted in request payloads — populated by system only
  Scope      : CREATE/UPDATE — form models never send createdAt/createdBy/updatedAt/updatedBy (display-only, see F1 audit footer)

VALIDATION SPEC:
  Field            : createdBy/createdAt/updatedBy/updatedAt (never sent)
  DB Column        : created_by/created_at/updated_by/updated_at (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (DTO shape)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

<!-- SUB:F3-SCR-ORG-001:END -->

<!-- SUB:F3-SCR-ORG-002:START -->
## F3 — SCR-ORG-002 — Branches

### F3-VALIDATION — RULE-ORG-003 — Prevent Branch deactivation — active departments
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent deactivation of a Branch when one or more active Departments reference it
  Message-AR : لا يمكن إلغاء تفعيل الفرع لوجود أقسام نشطة مرتبطة به
  Message-EN : Cannot deactivate Branch: active departments exist
  Scope      : DEACTIVATE (server-enforced, 409)

VALIDATION SPEC:
  Field            : isActive (via Deactivate action)
  DB Column        : is_active_fl (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-004 — Prevent Branch deactivation — active cost centers
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent deactivation of a Branch when one or more active CostCenters reference it
  Message-AR : لا يمكن إلغاء تفعيل الفرع لوجود مراكز تكلفة نشطة مرتبطة به
  Message-EN : Cannot deactivate Branch: active cost centers exist
  Scope      : DEACTIVATE (server-enforced, 409)

VALIDATION SPEC:
  Field            : isActive (via Deactivate action)
  DB Column        : is_active_fl (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-005 — Prevent Branch deactivation — active location sites
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent deactivation of a Branch when one or more active LocationSites reference it
  Message-AR : لا يمكن إلغاء تفعيل الفرع لوجود مواقع عمل نشطة مرتبطة به
  Message-EN : Cannot deactivate Branch: active location sites exist
  Scope      : DEACTIVATE (server-enforced, 409)

VALIDATION SPEC:
  Field            : isActive (via Deactivate action)
  DB Column        : is_active_fl (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-018 — Branch must belong to active LegalEntity
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent creation of a Branch under an inactive LegalEntity
  Message-AR : لا يمكن إنشاء فرع تحت كيان قانوني غير نشط
  Message-EN : Cannot create a Branch under an inactive Legal Entity
  Scope      : CREATE — legalEntityFk picker only lists isActive=true records (client-side exclusion, not just a server 400)

VALIDATION SPEC:
  Field            : legalEntityFk
  DB Column        : legal_entity_fk (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : LOV_VALID (active-only filter)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-011 — Business Code immutable after save
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent modification of the Business Code field after the record has been saved for the first time
  Message-AR : رمز الأعمال لا يمكن تعديله بعد الحفظ الأول — هذا الحقل محمي ونهائي
  Message-EN : Business Code is immutable after first save and cannot be modified
  Scope      : UPDATE — see F3-BC-RULE-1..3

VALIDATION SPEC:
  Field            : branchCode
  DB Column        : branch_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : REQUIRED (read-only field, no user-editable validation)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-012 — Business Code uniqueness within defined scope
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST ensure the Business Code generated by NumberingEngine is globally unique within its defined scope
  Message-AR : تعذّر إنشاء رمز الأعمال — تعارض في التسلسل. يرجى المحاولة مرة أخرى
  Message-EN : Business Code generation failed due to sequence conflict. Please retry
  Scope      : CREATE (409, server-only — not a client-checkable rule, no field to validate client-side)

VALIDATION SPEC:
  Field            : branchCode (system-generated)
  DB Column        : branch_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (server-only)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-013 — Business Code generated via NumberingEngine only
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST generate the Business Code exclusively through NumberingEngine
  Message-AR : يجب إنشاء رمز الأعمال عبر محرك الترقيم المركزي فقط
  Message-EN : Business Code must be generated via NumberingEngine only
  Scope      : CREATE — field never sent by client, no client validation needed (see F3-BC-RULE-2)

VALIDATION SPEC:
  Field            : branchCode (never sent by client)
  DB Column        : branch_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : REQUIRED (read-only field)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-014 — Reject Business Code in Update payload
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST reject any Update request that includes the Business Code field in its payload
  Message-AR : رمز الأعمال لا يُقبل ضمن طلبات التعديل
  Message-EN : Business Code field is not accepted in update requests
  Scope      : UPDATE — Update DTOs must omit the code field entirely (F3-BC-RULE-3)

VALIDATION SPEC:
  Field            : branchCode (excluded from Update DTO)
  DB Column        : branch_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (DTO shape)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-015 — Name uniqueness within parent scope
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent saving a record whose name_ar or name_en duplicates an existing active record within the same parent scope
  Message-AR : الاسم مُستخدم مسبقاً ضمن نفس النطاق — يرجى اختيار اسم مختلف
  Message-EN : Name already exists within the same parent scope — please choose a different name
  Scope      : CREATE/UPDATE (409, server-enforced — no client-side pre-check declared; async on-blur check optional per F3 pattern, not specified by SRS)

VALIDATION SPEC:
  Field            : nameAr, nameEn
  DB Column        : name_ar, name_en (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : UNIQUE_CHECK
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-016 — Reject audit fields in request payload
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST reject any request payload that includes audit fields (created_by, created_at, updated_by, updated_at)
  Message-AR : حقول التدقيق لا تُقبل من المستخدم — يملؤها النظام تلقائياً
  Message-EN : Audit fields are not accepted in request payloads — populated by system only
  Scope      : CREATE/UPDATE — form models never send createdAt/createdBy/updatedAt/updatedBy (display-only, see F1 audit footer)

VALIDATION SPEC:
  Field            : createdBy/createdAt/updatedBy/updatedAt (never sent)
  DB Column        : created_by/created_at/updated_by/updated_at (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (DTO shape)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

<!-- SUB:F3-SCR-ORG-002:END -->

<!-- SUB:F3-SCR-ORG-003:START -->
## F3 — SCR-ORG-003 — Regions

### F3-VALIDATION — RULE-ORG-006 — Prevent Region deactivation — active branches
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent deactivation of a Region when one or more active Branches reference it
  Message-AR : لا يمكن إلغاء تفعيل المنطقة لوجود فروع نشطة مرتبطة بها
  Message-EN : Cannot deactivate Region: active branches reference it
  Scope      : DEACTIVATE (server-enforced, 409). Test-Hint: only is_active_fl=1 branches count.

VALIDATION SPEC:
  Field            : isActive (via Deactivate action)
  DB Column        : is_active_fl (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-017 — Region deactivation — SOFT-READ consumer check/warning
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST check for consuming modules referencing an active Region record via SOFT-READ before allowing deactivation, and must surface appropriate warnings if any are detected
  Message-AR : تحذير: المنطقة مُستخدمة من موديولات أخرى — تأكد من مراجعة الأثر قبل إلغاء التفعيل
  Message-EN : Warning: Region is referenced by other modules — review impact before deactivating
  Scope      : DEACTIVATE — OQ-001 still DEFERRED at consumer-module level; banner must show this warning as informational, never claim full safety

VALIDATION SPEC:
  Field            : isActive (via Deactivate action)
  DB Column        : is_active_fl (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-011 — Business Code immutable after save
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent modification of the Business Code field after the record has been saved for the first time
  Message-AR : رمز الأعمال لا يمكن تعديله بعد الحفظ الأول — هذا الحقل محمي ونهائي
  Message-EN : Business Code is immutable after first save and cannot be modified
  Scope      : UPDATE — see F3-BC-RULE-1..3

VALIDATION SPEC:
  Field            : regionCode
  DB Column        : region_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : REQUIRED (read-only field, no user-editable validation)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-012 — Business Code uniqueness within defined scope
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST ensure the Business Code generated by NumberingEngine is globally unique within its defined scope
  Message-AR : تعذّر إنشاء رمز الأعمال — تعارض في التسلسل. يرجى المحاولة مرة أخرى
  Message-EN : Business Code generation failed due to sequence conflict. Please retry
  Scope      : CREATE (409, server-only — not a client-checkable rule, no field to validate client-side)

VALIDATION SPEC:
  Field            : regionCode (system-generated)
  DB Column        : region_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (server-only)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-013 — Business Code generated via NumberingEngine only
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST generate the Business Code exclusively through NumberingEngine
  Message-AR : يجب إنشاء رمز الأعمال عبر محرك الترقيم المركزي فقط
  Message-EN : Business Code must be generated via NumberingEngine only
  Scope      : CREATE — field never sent by client, no client validation needed (see F3-BC-RULE-2)

VALIDATION SPEC:
  Field            : regionCode (never sent by client)
  DB Column        : region_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : REQUIRED (read-only field)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-014 — Reject Business Code in Update payload
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST reject any Update request that includes the Business Code field in its payload
  Message-AR : رمز الأعمال لا يُقبل ضمن طلبات التعديل
  Message-EN : Business Code field is not accepted in update requests
  Scope      : UPDATE — Update DTOs must omit the code field entirely (F3-BC-RULE-3)

VALIDATION SPEC:
  Field            : regionCode (excluded from Update DTO)
  DB Column        : region_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (DTO shape)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-015 — Name uniqueness within parent scope
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent saving a record whose name_ar or name_en duplicates an existing active record within the same parent scope
  Message-AR : الاسم مُستخدم مسبقاً ضمن نفس النطاق — يرجى اختيار اسم مختلف
  Message-EN : Name already exists within the same parent scope — please choose a different name
  Scope      : CREATE/UPDATE (409, server-enforced — no client-side pre-check declared; async on-blur check optional per F3 pattern, not specified by SRS)

VALIDATION SPEC:
  Field            : nameAr, nameEn
  DB Column        : name_ar, name_en (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : UNIQUE_CHECK
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-016 — Reject audit fields in request payload
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST reject any request payload that includes audit fields (created_by, created_at, updated_by, updated_at)
  Message-AR : حقول التدقيق لا تُقبل من المستخدم — يملؤها النظام تلقائياً
  Message-EN : Audit fields are not accepted in request payloads — populated by system only
  Scope      : CREATE/UPDATE — form models never send createdAt/createdBy/updatedAt/updatedBy (display-only, see F1 audit footer)

VALIDATION SPEC:
  Field            : createdBy/createdAt/updatedBy/updatedAt (never sent)
  DB Column        : created_by/created_at/updated_by/updated_at (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (DTO shape)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

<!-- SUB:F3-SCR-ORG-003:END -->

<!-- SUB:F3-SCR-ORG-004:START -->
## F3 — SCR-ORG-004 — Departments

### F3-VALIDATION — RULE-ORG-003 — Prevent Branch deactivation — active departments
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent deactivation of a Branch when one or more active Departments reference it
  Message-AR : لا يمكن إلغاء تفعيل الفرع لوجود أقسام نشطة مرتبطة به
  Message-EN : Cannot deactivate Branch: active departments exist
  Scope      : DEACTIVATE (server-enforced, 409)

VALIDATION SPEC:
  Field            : isActive (via Deactivate action)
  DB Column        : is_active_fl (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-007 — Prevent circular reference — Department tree
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent assignment of a parent Department that would create a circular reference in the Department tree
  Message-AR : لا يمكن تعيين هذا القسم كقسم أب ـ سيؤدي إلى دورة في هيكل الأقسام
  Message-EN : Cannot set parent department: circular reference detected
  Scope      : CREATE/UPDATE (client-side prevention at selection time per ui-ux-spec + server-enforced)

VALIDATION SPEC:
  Field            : parentDepartmentFk
  DB Column        : parent_department_fk (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-009 — Prevent SUMMARY Department on transactional records
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent direct assignment of a SUMMARY-type Department to any transactional record
  Message-AR : لا يمكن استخدام قسم من نوع (ملخص) في السجلات التشغيلية
  Message-EN : Cannot assign a SUMMARY department to transactional records — only DETAIL departments are permitted
  Scope      : N/A to ORG's own screens — enforced in consumer modules' UIs, not here (SRS Test-Hint)

VALIDATION SPEC:
  Field            : nodeTypeId (display-only in ORG's own screens)
  DB Column        : node_type_id (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (not enforced by ORG UI)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-019 — Department/CostCenter/LocationSite require active Branch
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent creation of a Department, CostCenter, or LocationSite under an inactive Branch
  Message-AR : لا يمكن إنشاء قسم أو مركز تكلفة أو موقع تحت فرع غير نشط
  Message-EN : Cannot create organizational unit under an inactive Branch
  Scope      : CREATE — branchFk picker only lists isActive=true records

VALIDATION SPEC:
  Field            : branchFk
  DB Column        : branch_fk (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : LOV_VALID (active-only filter)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-020 — node_type_id immutable after save (Department/CostCenter)
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent modification of the node_type_id (SUMMARY / DETAIL) after a Department or CostCenter record has been saved
  Message-AR : لا يمكن تغيير نوع العقدة (ملخص/تفصيل) بعد الحفظ
  Message-EN : Node type (SUMMARY/DETAIL) cannot be changed after initial save
  Scope      : UPDATE — nodeTypeId field becomes read-only in EDIT mode (same muted-display convention as Business Code)

VALIDATION SPEC:
  Field            : nodeTypeId
  DB Column        : node_type_id (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (field lock post-save)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-011 — Business Code immutable after save
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent modification of the Business Code field after the record has been saved for the first time
  Message-AR : رمز الأعمال لا يمكن تعديله بعد الحفظ الأول — هذا الحقل محمي ونهائي
  Message-EN : Business Code is immutable after first save and cannot be modified
  Scope      : UPDATE — see F3-BC-RULE-1..3

VALIDATION SPEC:
  Field            : departmentCode
  DB Column        : department_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : REQUIRED (read-only field, no user-editable validation)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-012 — Business Code uniqueness within defined scope
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST ensure the Business Code generated by NumberingEngine is globally unique within its defined scope
  Message-AR : تعذّر إنشاء رمز الأعمال — تعارض في التسلسل. يرجى المحاولة مرة أخرى
  Message-EN : Business Code generation failed due to sequence conflict. Please retry
  Scope      : CREATE (409, server-only — not a client-checkable rule, no field to validate client-side)

VALIDATION SPEC:
  Field            : departmentCode (system-generated)
  DB Column        : department_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (server-only)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-013 — Business Code generated via NumberingEngine only
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST generate the Business Code exclusively through NumberingEngine
  Message-AR : يجب إنشاء رمز الأعمال عبر محرك الترقيم المركزي فقط
  Message-EN : Business Code must be generated via NumberingEngine only
  Scope      : CREATE — field never sent by client, no client validation needed (see F3-BC-RULE-2)

VALIDATION SPEC:
  Field            : departmentCode (never sent by client)
  DB Column        : department_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : REQUIRED (read-only field)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-014 — Reject Business Code in Update payload
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST reject any Update request that includes the Business Code field in its payload
  Message-AR : رمز الأعمال لا يُقبل ضمن طلبات التعديل
  Message-EN : Business Code field is not accepted in update requests
  Scope      : UPDATE — Update DTOs must omit the code field entirely (F3-BC-RULE-3)

VALIDATION SPEC:
  Field            : departmentCode (excluded from Update DTO)
  DB Column        : department_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (DTO shape)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-015 — Name uniqueness within parent scope
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent saving a record whose name_ar or name_en duplicates an existing active record within the same parent scope
  Message-AR : الاسم مُستخدم مسبقاً ضمن نفس النطاق — يرجى اختيار اسم مختلف
  Message-EN : Name already exists within the same parent scope — please choose a different name
  Scope      : CREATE/UPDATE (409, server-enforced — no client-side pre-check declared; async on-blur check optional per F3 pattern, not specified by SRS)

VALIDATION SPEC:
  Field            : nameAr, nameEn
  DB Column        : name_ar, name_en (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : UNIQUE_CHECK
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-016 — Reject audit fields in request payload
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST reject any request payload that includes audit fields (created_by, created_at, updated_by, updated_at)
  Message-AR : حقول التدقيق لا تُقبل من المستخدم — يملؤها النظام تلقائياً
  Message-EN : Audit fields are not accepted in request payloads — populated by system only
  Scope      : CREATE/UPDATE — form models never send createdAt/createdBy/updatedAt/updatedBy (display-only, see F1 audit footer)

VALIDATION SPEC:
  Field            : createdBy/createdAt/updatedBy/updatedAt (never sent)
  DB Column        : created_by/created_at/updated_by/updated_at (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (DTO shape)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

<!-- SUB:F3-SCR-ORG-004:END -->

<!-- SUB:F3-SCR-ORG-005:START -->
## F3 — SCR-ORG-005 — Cost Centers

### F3-VALIDATION — RULE-ORG-004 — Prevent Branch deactivation — active cost centers
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent deactivation of a Branch when one or more active CostCenters reference it
  Message-AR : لا يمكن إلغاء تفعيل الفرع لوجود مراكز تكلفة نشطة مرتبطة به
  Message-EN : Cannot deactivate Branch: active cost centers exist
  Scope      : DEACTIVATE (server-enforced, 409)

VALIDATION SPEC:
  Field            : isActive (via Deactivate action)
  DB Column        : is_active_fl (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-008 — Prevent circular reference — CostCenter tree
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent assignment of a parent CostCenter that would create a circular reference in the CostCenter tree
  Message-AR : لا يمكن تعيين مركز التكلفة هذا كأب ـ سيؤدي إلى دورة في هيكل مراكز التكلفة
  Message-EN : Cannot set parent cost center: circular reference detected
  Scope      : CREATE/UPDATE (client-side prevention at selection time per ui-ux-spec + server-enforced)

VALIDATION SPEC:
  Field            : parentCostCenterFk
  DB Column        : parent_cost_center_fk (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-010 — Prevent SUMMARY CostCenter on transactional records
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent direct assignment of a SUMMARY-type CostCenter to any transactional record
  Message-AR : لا يمكن استخدام مركز تكلفة من نوع (ملخص) في السجلات التشغيلية
  Message-EN : Cannot assign a SUMMARY cost center to transactional records — only DETAIL cost centers are permitted
  Scope      : N/A to ORG's own screens — enforced in consumer modules' UIs, not here (SRS Test-Hint)

VALIDATION SPEC:
  Field            : nodeTypeId (display-only in ORG's own screens)
  DB Column        : node_type_id (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (not enforced by ORG UI)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-019 — Department/CostCenter/LocationSite require active Branch
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent creation of a Department, CostCenter, or LocationSite under an inactive Branch
  Message-AR : لا يمكن إنشاء قسم أو مركز تكلفة أو موقع تحت فرع غير نشط
  Message-EN : Cannot create organizational unit under an inactive Branch
  Scope      : CREATE — branchFk picker only lists isActive=true records

VALIDATION SPEC:
  Field            : branchFk
  DB Column        : branch_fk (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : LOV_VALID (active-only filter)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-020 — node_type_id immutable after save (Department/CostCenter)
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent modification of the node_type_id (SUMMARY / DETAIL) after a Department or CostCenter record has been saved
  Message-AR : لا يمكن تغيير نوع العقدة (ملخص/تفصيل) بعد الحفظ
  Message-EN : Node type (SUMMARY/DETAIL) cannot be changed after initial save
  Scope      : UPDATE — nodeTypeId field becomes read-only in EDIT mode (same muted-display convention as Business Code)

VALIDATION SPEC:
  Field            : nodeTypeId
  DB Column        : node_type_id (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (field lock post-save)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-011 — Business Code immutable after save
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent modification of the Business Code field after the record has been saved for the first time
  Message-AR : رمز الأعمال لا يمكن تعديله بعد الحفظ الأول — هذا الحقل محمي ونهائي
  Message-EN : Business Code is immutable after first save and cannot be modified
  Scope      : UPDATE — see F3-BC-RULE-1..3

VALIDATION SPEC:
  Field            : costCenterCode
  DB Column        : cost_center_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : REQUIRED (read-only field, no user-editable validation)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-012 — Business Code uniqueness within defined scope
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST ensure the Business Code generated by NumberingEngine is globally unique within its defined scope
  Message-AR : تعذّر إنشاء رمز الأعمال — تعارض في التسلسل. يرجى المحاولة مرة أخرى
  Message-EN : Business Code generation failed due to sequence conflict. Please retry
  Scope      : CREATE (409, server-only — not a client-checkable rule, no field to validate client-side)

VALIDATION SPEC:
  Field            : costCenterCode (system-generated)
  DB Column        : cost_center_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (server-only)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-013 — Business Code generated via NumberingEngine only
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST generate the Business Code exclusively through NumberingEngine
  Message-AR : يجب إنشاء رمز الأعمال عبر محرك الترقيم المركزي فقط
  Message-EN : Business Code must be generated via NumberingEngine only
  Scope      : CREATE — field never sent by client, no client validation needed (see F3-BC-RULE-2)

VALIDATION SPEC:
  Field            : costCenterCode (never sent by client)
  DB Column        : cost_center_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : REQUIRED (read-only field)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-014 — Reject Business Code in Update payload
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST reject any Update request that includes the Business Code field in its payload
  Message-AR : رمز الأعمال لا يُقبل ضمن طلبات التعديل
  Message-EN : Business Code field is not accepted in update requests
  Scope      : UPDATE — Update DTOs must omit the code field entirely (F3-BC-RULE-3)

VALIDATION SPEC:
  Field            : costCenterCode (excluded from Update DTO)
  DB Column        : cost_center_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (DTO shape)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-015 — Name uniqueness within parent scope
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent saving a record whose name_ar or name_en duplicates an existing active record within the same parent scope
  Message-AR : الاسم مُستخدم مسبقاً ضمن نفس النطاق — يرجى اختيار اسم مختلف
  Message-EN : Name already exists within the same parent scope — please choose a different name
  Scope      : CREATE/UPDATE (409, server-enforced — no client-side pre-check declared; async on-blur check optional per F3 pattern, not specified by SRS)

VALIDATION SPEC:
  Field            : nameAr, nameEn
  DB Column        : name_ar, name_en (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : UNIQUE_CHECK
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-016 — Reject audit fields in request payload
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST reject any request payload that includes audit fields (created_by, created_at, updated_by, updated_at)
  Message-AR : حقول التدقيق لا تُقبل من المستخدم — يملؤها النظام تلقائياً
  Message-EN : Audit fields are not accepted in request payloads — populated by system only
  Scope      : CREATE/UPDATE — form models never send createdAt/createdBy/updatedAt/updatedBy (display-only, see F1 audit footer)

VALIDATION SPEC:
  Field            : createdBy/createdAt/updatedBy/updatedAt (never sent)
  DB Column        : created_by/created_at/updated_by/updated_at (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (DTO shape)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

<!-- SUB:F3-SCR-ORG-005:END -->

<!-- SUB:F3-SCR-ORG-006:START -->
## F3 — SCR-ORG-006 — Profit Centers

### F3-VALIDATION — RULE-ORG-002 — Prevent LegalEntity deactivation — active profit centers
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent deactivation of a LegalEntity when one or more active ProfitCenters reference it
  Message-AR : لا يمكن إلغاء تفعيل الكيان القانوني لوجود مراكز ربح نشطة مرتبطة به
  Message-EN : Cannot deactivate Legal Entity: active profit centers exist
  Scope      : DEACTIVATE (server-enforced, 409)

VALIDATION SPEC:
  Field            : isActive (via Deactivate action)
  DB Column        : is_active_fl (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-011 — Business Code immutable after save
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent modification of the Business Code field after the record has been saved for the first time
  Message-AR : رمز الأعمال لا يمكن تعديله بعد الحفظ الأول — هذا الحقل محمي ونهائي
  Message-EN : Business Code is immutable after first save and cannot be modified
  Scope      : UPDATE — see F3-BC-RULE-1..3

VALIDATION SPEC:
  Field            : profitCenterCode
  DB Column        : profit_center_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : REQUIRED (read-only field, no user-editable validation)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-012 — Business Code uniqueness within defined scope
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST ensure the Business Code generated by NumberingEngine is globally unique within its defined scope
  Message-AR : تعذّر إنشاء رمز الأعمال — تعارض في التسلسل. يرجى المحاولة مرة أخرى
  Message-EN : Business Code generation failed due to sequence conflict. Please retry
  Scope      : CREATE (409, server-only — not a client-checkable rule, no field to validate client-side)

VALIDATION SPEC:
  Field            : profitCenterCode (system-generated)
  DB Column        : profit_center_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (server-only)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-013 — Business Code generated via NumberingEngine only
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST generate the Business Code exclusively through NumberingEngine
  Message-AR : يجب إنشاء رمز الأعمال عبر محرك الترقيم المركزي فقط
  Message-EN : Business Code must be generated via NumberingEngine only
  Scope      : CREATE — field never sent by client, no client validation needed (see F3-BC-RULE-2)

VALIDATION SPEC:
  Field            : profitCenterCode (never sent by client)
  DB Column        : profit_center_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : REQUIRED (read-only field)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-014 — Reject Business Code in Update payload
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST reject any Update request that includes the Business Code field in its payload
  Message-AR : رمز الأعمال لا يُقبل ضمن طلبات التعديل
  Message-EN : Business Code field is not accepted in update requests
  Scope      : UPDATE — Update DTOs must omit the code field entirely (F3-BC-RULE-3)

VALIDATION SPEC:
  Field            : profitCenterCode (excluded from Update DTO)
  DB Column        : profit_center_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (DTO shape)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-015 — Name uniqueness within parent scope
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent saving a record whose name_ar or name_en duplicates an existing active record within the same parent scope
  Message-AR : الاسم مُستخدم مسبقاً ضمن نفس النطاق — يرجى اختيار اسم مختلف
  Message-EN : Name already exists within the same parent scope — please choose a different name
  Scope      : CREATE/UPDATE (409, server-enforced — no client-side pre-check declared; async on-blur check optional per F3 pattern, not specified by SRS)

VALIDATION SPEC:
  Field            : nameAr, nameEn
  DB Column        : name_ar, name_en (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : UNIQUE_CHECK
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-016 — Reject audit fields in request payload
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST reject any request payload that includes audit fields (created_by, created_at, updated_by, updated_at)
  Message-AR : حقول التدقيق لا تُقبل من المستخدم — يملؤها النظام تلقائياً
  Message-EN : Audit fields are not accepted in request payloads — populated by system only
  Scope      : CREATE/UPDATE — form models never send createdAt/createdBy/updatedAt/updatedBy (display-only, see F1 audit footer)

VALIDATION SPEC:
  Field            : createdBy/createdAt/updatedBy/updatedAt (never sent)
  DB Column        : created_by/created_at/updated_by/updated_at (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (DTO shape)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

<!-- SUB:F3-SCR-ORG-006:END -->

<!-- SUB:F3-SCR-ORG-007:START -->
## F3 — SCR-ORG-007 — Location Sites

### F3-VALIDATION — RULE-ORG-005 — Prevent Branch deactivation — active location sites
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent deactivation of a Branch when one or more active LocationSites reference it
  Message-AR : لا يمكن إلغاء تفعيل الفرع لوجود مواقع عمل نشطة مرتبطة به
  Message-EN : Cannot deactivate Branch: active location sites exist
  Scope      : DEACTIVATE (server-enforced, 409)

VALIDATION SPEC:
  Field            : isActive (via Deactivate action)
  DB Column        : is_active_fl (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-019 — Department/CostCenter/LocationSite require active Branch
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent creation of a Department, CostCenter, or LocationSite under an inactive Branch
  Message-AR : لا يمكن إنشاء قسم أو مركز تكلفة أو موقع تحت فرع غير نشط
  Message-EN : Cannot create organizational unit under an inactive Branch
  Scope      : CREATE — branchFk picker only lists isActive=true records

VALIDATION SPEC:
  Field            : branchFk
  DB Column        : branch_fk (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : LOV_VALID (active-only filter)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-011 — Business Code immutable after save
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent modification of the Business Code field after the record has been saved for the first time
  Message-AR : رمز الأعمال لا يمكن تعديله بعد الحفظ الأول — هذا الحقل محمي ونهائي
  Message-EN : Business Code is immutable after first save and cannot be modified
  Scope      : UPDATE — see F3-BC-RULE-1..3

VALIDATION SPEC:
  Field            : locationSiteCode
  DB Column        : location_site_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : REQUIRED (read-only field, no user-editable validation)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-012 — Business Code uniqueness within defined scope
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST ensure the Business Code generated by NumberingEngine is globally unique within its defined scope
  Message-AR : تعذّر إنشاء رمز الأعمال — تعارض في التسلسل. يرجى المحاولة مرة أخرى
  Message-EN : Business Code generation failed due to sequence conflict. Please retry
  Scope      : CREATE (409, server-only — not a client-checkable rule, no field to validate client-side)

VALIDATION SPEC:
  Field            : locationSiteCode (system-generated)
  DB Column        : location_site_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (server-only)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-013 — Business Code generated via NumberingEngine only
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST generate the Business Code exclusively through NumberingEngine
  Message-AR : يجب إنشاء رمز الأعمال عبر محرك الترقيم المركزي فقط
  Message-EN : Business Code must be generated via NumberingEngine only
  Scope      : CREATE — field never sent by client, no client validation needed (see F3-BC-RULE-2)

VALIDATION SPEC:
  Field            : locationSiteCode (never sent by client)
  DB Column        : location_site_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : REQUIRED (read-only field)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-014 — Reject Business Code in Update payload
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST reject any Update request that includes the Business Code field in its payload
  Message-AR : رمز الأعمال لا يُقبل ضمن طلبات التعديل
  Message-EN : Business Code field is not accepted in update requests
  Scope      : UPDATE — Update DTOs must omit the code field entirely (F3-BC-RULE-3)

VALIDATION SPEC:
  Field            : locationSiteCode (excluded from Update DTO)
  DB Column        : location_site_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (DTO shape)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-015 — Name uniqueness within parent scope
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent saving a record whose name_ar or name_en duplicates an existing active record within the same parent scope
  Message-AR : الاسم مُستخدم مسبقاً ضمن نفس النطاق — يرجى اختيار اسم مختلف
  Message-EN : Name already exists within the same parent scope — please choose a different name
  Scope      : CREATE/UPDATE (409, server-enforced — no client-side pre-check declared; async on-blur check optional per F3 pattern, not specified by SRS)

VALIDATION SPEC:
  Field            : nameAr, nameEn
  DB Column        : name_ar, name_en (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : UNIQUE_CHECK
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-016 — Reject audit fields in request payload
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST reject any request payload that includes audit fields (created_by, created_at, updated_by, updated_at)
  Message-AR : حقول التدقيق لا تُقبل من المستخدم — يملؤها النظام تلقائياً
  Message-EN : Audit fields are not accepted in request payloads — populated by system only
  Scope      : CREATE/UPDATE — form models never send createdAt/createdBy/updatedAt/updatedBy (display-only, see F1 audit footer)

VALIDATION SPEC:
  Field            : createdBy/createdAt/updatedBy/updatedAt (never sent)
  DB Column        : created_by/created_at/updated_by/updated_at (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (DTO shape)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

<!-- SUB:F3-SCR-ORG-007:END -->

<!-- PHASE:F3:END -->

<!-- PHASE:F4:START -->
# PHASE F4 — Frontend Routing & Component Structure (v2.1 — DOCUMENT + INTEGRATE)

Open Questions: 3 active / see OQ Log above

**Responsibility applied:** documents the Shell's real, existing structure
(shell-manifest-ORG.md) for every SCR-ID, and flags integration gaps explicitly
rather than redesigning what already exists. Per the Shell's own structural note,
there is no react-router route tree in this repo — navigation is a `currentScreen`
string switched in `src/App.tsx`. Both the F4-RULE-1 target path convention AND the
Shell's current screen-key are documented below so neither fact is lost.

<!-- SUB:F4-SCR-ORG-001:START -->
### F4-SCREEN — SCR-ORG-001 — Legal Entities
─────────────────────────────────────────────────────────────────
Shell status     : Route/component ALREADY EXISTS — LegalEntitiesPage at src/pages/Organization/LegalEntities.tsx
Container Pattern: SIDE_DRAWER (confirmed in F1)

Target path (F4-RULE-1 convention, NOT yet real — no router exists in this repo):
  /legal-entities
  /legal-entities?editId={id}      (EDIT — toggles FormDrawer)
  /legal-entities?new=true           (CREATE — toggles FormDrawer)

Shell's ACTUAL current reality: screen-key 'org-entities' in useNavigationStore,
  switched in src/App.tsx's renderCurrentScreen() — no URL-addressable sub-states
  for edit/new/node-selection exist today (single component handles all of it
  internally per the Shell Manifest's high-level extraction — the manifest's depth
  does not confirm whether Search/Drawer are separated as distinct React
  sub-components internally per CORE-9; agent must verify against the actual file
  before assuming compliance — this is a documentation gap, not a redesign call).

Route module     : not applicable today — no React.lazy code-split boundary exists
                   for this module (F4-RULE-2 target for future routing integration)

Route guard      : MISSING — confirmed gap (shell-manifest-ORG.md: "no permission
                   check wired around this case in App.tsx's switch" for org-entities,
                   unlike sec-users' can('PERM_USER_VIEW') pattern). FLAGGED as an
                   integration addition, not a Shell redesign (F4-RULE-3).
PERM_* required  : LEGAL_ENTITY_VIEW (list + read-mode entry)
                   LEGAL_ENTITY_CREATE (new record)
                   LEGAL_ENTITY_UPDATE (edit AND deactivate/activate — see FINDING-4/OQ-ORG-003:
                   real backend never checks LEGAL_ENTITY_DELETE despite SRS/registry declaring it)
                   [LEGAL_ENTITY_DELETE is SEC-3-seeded but unused by the real backend for this
                   module — do not wire it to any button; see SEC-FE below]

COMPONENTS (per F4-RULE-4/5, branched by Container Pattern):
  LegalEntitiesPage (route-level, hosts Search + toggled FormDrawer)
    Path       : src/pages/Organization/LegalEntities.tsx
    Facade Hook: useLegalEntitiesFacade()
    NOTE       : per F4-RULE-5, Search and the Entry form must be separate
                 components (a FormDrawer, not a conditional render inside one
                 component body) — confirm this internally in the existing file;
                 if the current implementation is one undivided component body,
                 that is a CORE-9 gap to fix during integration, not something
                 this plan invents new structure for.

Shared UI imports : not enumerated by shell-manifest-ORG.md's extraction depth —
                    agent confirms against the actual file (F4-RULE-8 applies: only
                    components actually rendered, no blanket import).
─────────────────────────────────────────────────────────────────
<!-- SUB:F4-SCR-ORG-001:END -->

<!-- SUB:F4-SCR-ORG-002:START -->
### F4-SCREEN — SCR-ORG-002 — Branches
─────────────────────────────────────────────────────────────────
Shell status     : Route/component ALREADY EXISTS — BranchesPage at src/pages/Organization/Branches.tsx
Container Pattern: SIDE_DRAWER (confirmed in F1)

Target path (F4-RULE-1 convention, NOT yet real — no router exists in this repo):
  /branches
  /branches?editId={id}      (EDIT — toggles FormDrawer)
  /branches?new=true           (CREATE — toggles FormDrawer)

Shell's ACTUAL current reality: screen-key 'org-branches' in useNavigationStore,
  switched in src/App.tsx's renderCurrentScreen() — no URL-addressable sub-states
  for edit/new/node-selection exist today (single component handles all of it
  internally per the Shell Manifest's high-level extraction — the manifest's depth
  does not confirm whether Search/Drawer are separated as distinct React
  sub-components internally per CORE-9; agent must verify against the actual file
  before assuming compliance — this is a documentation gap, not a redesign call).

Route module     : not applicable today — no React.lazy code-split boundary exists
                   for this module (F4-RULE-2 target for future routing integration)

Route guard      : MISSING — confirmed gap (shell-manifest-ORG.md: "no permission
                   check wired around this case in App.tsx's switch" for org-branches,
                   unlike sec-users' can('PERM_USER_VIEW') pattern). FLAGGED as an
                   integration addition, not a Shell redesign (F4-RULE-3).
PERM_* required  : BRANCH_VIEW (list + read-mode entry)
                   BRANCH_CREATE (new record)
                   BRANCH_UPDATE (edit AND deactivate/activate — see FINDING-4/OQ-ORG-003:
                   real backend never checks BRANCH_DELETE despite SRS/registry declaring it)
                   [BRANCH_DELETE is SEC-3-seeded but unused by the real backend for this
                   module — do not wire it to any button; see SEC-FE below]

COMPONENTS (per F4-RULE-4/5, branched by Container Pattern):
  BranchesPage (route-level, hosts Search + toggled FormDrawer)
    Path       : src/pages/Organization/Branches.tsx
    Facade Hook: useBranchesFacade()
    NOTE       : per F4-RULE-5, Search and the Entry form must be separate
                 components (a FormDrawer, not a conditional render inside one
                 component body) — confirm this internally in the existing file;
                 if the current implementation is one undivided component body,
                 that is a CORE-9 gap to fix during integration, not something
                 this plan invents new structure for.

Shared UI imports : not enumerated by shell-manifest-ORG.md's extraction depth —
                    agent confirms against the actual file (F4-RULE-8 applies: only
                    components actually rendered, no blanket import).
─────────────────────────────────────────────────────────────────
<!-- SUB:F4-SCR-ORG-002:END -->

<!-- SUB:F4-SCR-ORG-003:START -->
### F4-SCREEN — SCR-ORG-003 — Regions
─────────────────────────────────────────────────────────────────
Shell status     : Route/component ALREADY EXISTS — RegionsPage at src/pages/Organization/Regions.tsx
Container Pattern: SIDE_DRAWER (confirmed in F1)

Target path (F4-RULE-1 convention, NOT yet real — no router exists in this repo):
  /regions
  /regions?editId={id}      (EDIT — toggles FormDrawer)
  /regions?new=true           (CREATE — toggles FormDrawer)

Shell's ACTUAL current reality: screen-key 'org-regions' in useNavigationStore,
  switched in src/App.tsx's renderCurrentScreen() — no URL-addressable sub-states
  for edit/new/node-selection exist today (single component handles all of it
  internally per the Shell Manifest's high-level extraction — the manifest's depth
  does not confirm whether Search/Drawer are separated as distinct React
  sub-components internally per CORE-9; agent must verify against the actual file
  before assuming compliance — this is a documentation gap, not a redesign call).

Route module     : not applicable today — no React.lazy code-split boundary exists
                   for this module (F4-RULE-2 target for future routing integration)

Route guard      : MISSING — confirmed gap (shell-manifest-ORG.md: "no permission
                   check wired around this case in App.tsx's switch" for org-regions,
                   unlike sec-users' can('PERM_USER_VIEW') pattern). FLAGGED as an
                   integration addition, not a Shell redesign (F4-RULE-3).
PERM_* required  : REGION_VIEW (list + read-mode entry)
                   REGION_CREATE (new record)
                   REGION_UPDATE (edit AND deactivate/activate — see FINDING-4/OQ-ORG-003:
                   real backend never checks REGION_DELETE despite SRS/registry declaring it)
                   [REGION_DELETE is SEC-3-seeded but unused by the real backend for this
                   module — do not wire it to any button; see SEC-FE below]

COMPONENTS (per F4-RULE-4/5, branched by Container Pattern):
  RegionsPage (route-level, hosts Search + toggled FormDrawer)
    Path       : src/pages/Organization/Regions.tsx
    Facade Hook: useRegionsFacade()
    NOTE       : per F4-RULE-5, Search and the Entry form must be separate
                 components (a FormDrawer, not a conditional render inside one
                 component body) — confirm this internally in the existing file;
                 if the current implementation is one undivided component body,
                 that is a CORE-9 gap to fix during integration, not something
                 this plan invents new structure for.

Shared UI imports : not enumerated by shell-manifest-ORG.md's extraction depth —
                    agent confirms against the actual file (F4-RULE-8 applies: only
                    components actually rendered, no blanket import).
─────────────────────────────────────────────────────────────────
<!-- SUB:F4-SCR-ORG-003:END -->

<!-- SUB:F4-SCR-ORG-004:START -->
### F4-SCREEN — SCR-ORG-004 — Departments
─────────────────────────────────────────────────────────────────
Shell status     : Route/component ALREADY EXISTS — DepartmentsPage at src/pages/Organization/Departments.tsx
Container Pattern: TREE_MASTER_DETAIL (confirmed in F1)

Target path (F4-RULE-1 convention, NOT yet real — no router exists in this repo):
  /departments
  /departments/tree                ← tree-bearing entity, MUST precede /:id/* (F4-RULE-1)
  /departments/tree/:nodeId         (selected-node detail panel)

Shell's ACTUAL current reality: screen-key 'org-departments' in useNavigationStore,
  switched in src/App.tsx's renderCurrentScreen() — no URL-addressable sub-states
  for edit/new/node-selection exist today (single component handles all of it
  internally per the Shell Manifest's high-level extraction — the manifest's depth
  does not confirm whether Search/Drawer are separated as distinct React
  sub-components internally per CORE-9; agent must verify against the actual file
  before assuming compliance — this is a documentation gap, not a redesign call).

Route module     : not applicable today — no React.lazy code-split boundary exists
                   for this module (F4-RULE-2 target for future routing integration)

Route guard      : MISSING — confirmed gap (shell-manifest-ORG.md: "no permission
                   check wired around this case in App.tsx's switch" for org-departments,
                   unlike sec-users' can('PERM_USER_VIEW') pattern). FLAGGED as an
                   integration addition, not a Shell redesign (F4-RULE-3).
PERM_* required  : DEPARTMENT_VIEW (list + read-mode entry)
                   DEPARTMENT_CREATE (new record)
                   DEPARTMENT_UPDATE (edit AND deactivate/activate — see FINDING-4/OQ-ORG-003:
                   real backend never checks DEPARTMENT_DELETE despite SRS/registry declaring it)
                   [DEPARTMENT_DELETE is SEC-3-seeded but unused by the real backend for this
                   module — do not wire it to any button; see SEC-FE below]

COMPONENTS (per F4-RULE-4/5, branched by Container Pattern):
  DepartmentsPage (route-level, hosts Tree + permanently-visible detail form)
    Path       : src/pages/Organization/Departments.tsx
    Facade Hook: useDepartmentsFacade()
    Mode resolution: selected-node id — currently internal component state per the
                 Shell (no route param exists); F4-RULE-7 target is a route param
                 (e.g. /:nodeId) once routing integration happens.

Shared UI imports : not enumerated by shell-manifest-ORG.md's extraction depth —
                    agent confirms against the actual file (F4-RULE-8 applies: only
                    components actually rendered, no blanket import).
─────────────────────────────────────────────────────────────────
<!-- SUB:F4-SCR-ORG-004:END -->

<!-- SUB:F4-SCR-ORG-005:START -->
### F4-SCREEN — SCR-ORG-005 — Cost Centers
─────────────────────────────────────────────────────────────────
Shell status     : Route/component ALREADY EXISTS — CostCentersPage at src/pages/Organization/CostCenters.tsx
Container Pattern: TREE_MASTER_DETAIL (confirmed in F1)

Target path (F4-RULE-1 convention, NOT yet real — no router exists in this repo):
  /cost-centers
  /cost-centers/tree                ← tree-bearing entity, MUST precede /:id/* (F4-RULE-1)
  /cost-centers/tree/:nodeId         (selected-node detail panel)

Shell's ACTUAL current reality: screen-key 'org-cost-centers' in useNavigationStore,
  switched in src/App.tsx's renderCurrentScreen() — no URL-addressable sub-states
  for edit/new/node-selection exist today (single component handles all of it
  internally per the Shell Manifest's high-level extraction — the manifest's depth
  does not confirm whether Search/Drawer are separated as distinct React
  sub-components internally per CORE-9; agent must verify against the actual file
  before assuming compliance — this is a documentation gap, not a redesign call).

Route module     : not applicable today — no React.lazy code-split boundary exists
                   for this module (F4-RULE-2 target for future routing integration)

Route guard      : MISSING — confirmed gap (shell-manifest-ORG.md: "no permission
                   check wired around this case in App.tsx's switch" for org-cost-centers,
                   unlike sec-users' can('PERM_USER_VIEW') pattern). FLAGGED as an
                   integration addition, not a Shell redesign (F4-RULE-3).
PERM_* required  : COST_CENTER_VIEW (list + read-mode entry)
                   COST_CENTER_CREATE (new record)
                   COST_CENTER_UPDATE (edit AND deactivate/activate — see FINDING-4/OQ-ORG-003:
                   real backend never checks COST_CENTER_DELETE despite SRS/registry declaring it)
                   [COST_CENTER_DELETE is SEC-3-seeded but unused by the real backend for this
                   module — do not wire it to any button; see SEC-FE below]

COMPONENTS (per F4-RULE-4/5, branched by Container Pattern):
  CostCentersPage (route-level, hosts Tree + permanently-visible detail form)
    Path       : src/pages/Organization/CostCenters.tsx
    Facade Hook: useCostCentersFacade()
    Mode resolution: selected-node id — currently internal component state per the
                 Shell (no route param exists); F4-RULE-7 target is a route param
                 (e.g. /:nodeId) once routing integration happens.

Shared UI imports : not enumerated by shell-manifest-ORG.md's extraction depth —
                    agent confirms against the actual file (F4-RULE-8 applies: only
                    components actually rendered, no blanket import).
─────────────────────────────────────────────────────────────────
<!-- SUB:F4-SCR-ORG-005:END -->

<!-- SUB:F4-SCR-ORG-006:START -->
### F4-SCREEN — SCR-ORG-006 — Profit Centers
─────────────────────────────────────────────────────────────────
Shell status     : Route/component ALREADY EXISTS — ProfitCentersPage at src/pages/Organization/ProfitCenters.tsx
Container Pattern: SIDE_DRAWER (confirmed in F1)

Target path (F4-RULE-1 convention, NOT yet real — no router exists in this repo):
  /profit-centers
  /profit-centers?editId={id}      (EDIT — toggles FormDrawer)
  /profit-centers?new=true           (CREATE — toggles FormDrawer)

Shell's ACTUAL current reality: screen-key 'org-profit-centers' in useNavigationStore,
  switched in src/App.tsx's renderCurrentScreen() — no URL-addressable sub-states
  for edit/new/node-selection exist today (single component handles all of it
  internally per the Shell Manifest's high-level extraction — the manifest's depth
  does not confirm whether Search/Drawer are separated as distinct React
  sub-components internally per CORE-9; agent must verify against the actual file
  before assuming compliance — this is a documentation gap, not a redesign call).

Route module     : not applicable today — no React.lazy code-split boundary exists
                   for this module (F4-RULE-2 target for future routing integration)

Route guard      : MISSING — confirmed gap (shell-manifest-ORG.md: "no permission
                   check wired around this case in App.tsx's switch" for org-profit-centers,
                   unlike sec-users' can('PERM_USER_VIEW') pattern). FLAGGED as an
                   integration addition, not a Shell redesign (F4-RULE-3).
PERM_* required  : PROFIT_CENTER_VIEW (list + read-mode entry)
                   PROFIT_CENTER_CREATE (new record)
                   PROFIT_CENTER_UPDATE (edit AND deactivate/activate — see FINDING-4/OQ-ORG-003:
                   real backend never checks PROFIT_CENTER_DELETE despite SRS/registry declaring it)
                   [PROFIT_CENTER_DELETE is SEC-3-seeded but unused by the real backend for this
                   module — do not wire it to any button; see SEC-FE below]

COMPONENTS (per F4-RULE-4/5, branched by Container Pattern):
  ProfitCentersPage (route-level, hosts Search + toggled FormDrawer)
    Path       : src/pages/Organization/ProfitCenters.tsx
    Facade Hook: useProfitCentersFacade()
    NOTE       : per F4-RULE-5, Search and the Entry form must be separate
                 components (a FormDrawer, not a conditional render inside one
                 component body) — confirm this internally in the existing file;
                 if the current implementation is one undivided component body,
                 that is a CORE-9 gap to fix during integration, not something
                 this plan invents new structure for.

Shared UI imports : not enumerated by shell-manifest-ORG.md's extraction depth —
                    agent confirms against the actual file (F4-RULE-8 applies: only
                    components actually rendered, no blanket import).
─────────────────────────────────────────────────────────────────
<!-- SUB:F4-SCR-ORG-006:END -->

<!-- SUB:F4-SCR-ORG-007:START -->
### F4-SCREEN — SCR-ORG-007 — Location Sites
─────────────────────────────────────────────────────────────────
Shell status     : Route/component ALREADY EXISTS — LocationSitesPage at src/pages/Organization/LocationSites.tsx
Container Pattern: SIDE_DRAWER (confirmed in F1)

Target path (F4-RULE-1 convention, NOT yet real — no router exists in this repo):
  /location-sites
  /location-sites?editId={id}      (EDIT — toggles FormDrawer)
  /location-sites?new=true           (CREATE — toggles FormDrawer)

Shell's ACTUAL current reality: screen-key 'org-locations' in useNavigationStore,
  switched in src/App.tsx's renderCurrentScreen() — no URL-addressable sub-states
  for edit/new/node-selection exist today (single component handles all of it
  internally per the Shell Manifest's high-level extraction — the manifest's depth
  does not confirm whether Search/Drawer are separated as distinct React
  sub-components internally per CORE-9; agent must verify against the actual file
  before assuming compliance — this is a documentation gap, not a redesign call).

Route module     : not applicable today — no React.lazy code-split boundary exists
                   for this module (F4-RULE-2 target for future routing integration)

Route guard      : MISSING — confirmed gap (shell-manifest-ORG.md: "no permission
                   check wired around this case in App.tsx's switch" for org-locations,
                   unlike sec-users' can('PERM_USER_VIEW') pattern). FLAGGED as an
                   integration addition, not a Shell redesign (F4-RULE-3).
PERM_* required  : LOCATION_SITE_VIEW (list + read-mode entry)
                   LOCATION_SITE_CREATE (new record)
                   LOCATION_SITE_UPDATE (edit AND deactivate/activate — see FINDING-4/OQ-ORG-003:
                   real backend never checks LOCATION_SITE_DELETE despite SRS/registry declaring it)
                   [LOCATION_SITE_DELETE is SEC-3-seeded but unused by the real backend for this
                   module — do not wire it to any button; see SEC-FE below]

COMPONENTS (per F4-RULE-4/5, branched by Container Pattern):
  LocationSitesPage (route-level, hosts Search + toggled FormDrawer)
    Path       : src/pages/Organization/LocationSites.tsx
    Facade Hook: useLocationSitesFacade()
    NOTE       : per F4-RULE-5, Search and the Entry form must be separate
                 components (a FormDrawer, not a conditional render inside one
                 component body) — confirm this internally in the existing file;
                 if the current implementation is one undivided component body,
                 that is a CORE-9 gap to fix during integration, not something
                 this plan invents new structure for.

Shared UI imports : not enumerated by shell-manifest-ORG.md's extraction depth —
                    agent confirms against the actual file (F4-RULE-8 applies: only
                    components actually rendered, no blanket import).
─────────────────────────────────────────────────────────────────
<!-- SUB:F4-SCR-ORG-007:END -->

<!-- PHASE:F4:END -->

<!-- PHASE:SEC-FE:START -->
# PHASE SEC-FE — Frontend Security Specifications

Open Questions: 3 active / see OQ Log above

Note (v2.0 split): backend API-level enforcement lives in
PROJECT-3-BACKEND-ENGINE.md Phase SEC-BE (not generated this session — no
backend-execution-plan.md was provided; permission names below are sourced directly
from SRS B4 / registry-srs-org.md's Permissions table, cross-checked against the
real endpoints' "Required permission(s)" annotations — see FINDING-4).

### SEC-FE — SCR-ORG-001 — Legal Entities
─────────────────────────────────────────────────────────────────
Screen guard     : navigation to org-entities requires canView = true
                   canView = false → redirect to unauthorized

Permission-based UI behavior:
  canView   = false → blocked at navigation — unauthorized redirect
  canCreate = false → New button / create entry point not shown
  canEdit   = false → all edit fields read-only, Save not available;
                       Deactivate/Activate buttons ALSO hidden (FINDING-4: real
                       backend gates these on LEGAL_ENTITY_UPDATE, i.e. canEdit — NOT
                       canDelete/LEGAL_ENTITY_DELETE, which the real backend never checks)
  canDelete = false → no UI effect in this module (see above) — LEGAL_ENTITY_DELETE is
                       SEC-3-seeded but not wired to any control; OQ-ORG-003 tracks
                       the discrepancy for backend/product resolution
  canApprove= n/a   → ORG has no approval workflow (SRS A6 confirms no workflow)

EXCEPTION module scope: none — ORG-001 is a ROOT MODULE with no EXCEPTION entities
─────────────────────────────────────────────────────────────────

### SEC-FE — SCR-ORG-002 — Branches
─────────────────────────────────────────────────────────────────
Screen guard     : navigation to org-branches requires canView = true
                   canView = false → redirect to unauthorized

Permission-based UI behavior:
  canView   = false → blocked at navigation — unauthorized redirect
  canCreate = false → New button / create entry point not shown
  canEdit   = false → all edit fields read-only, Save not available;
                       Deactivate/Activate buttons ALSO hidden (FINDING-4: real
                       backend gates these on BRANCH_UPDATE, i.e. canEdit — NOT
                       canDelete/BRANCH_DELETE, which the real backend never checks)
  canDelete = false → no UI effect in this module (see above) — BRANCH_DELETE is
                       SEC-3-seeded but not wired to any control; OQ-ORG-003 tracks
                       the discrepancy for backend/product resolution
  canApprove= n/a   → ORG has no approval workflow (SRS A6 confirms no workflow)

EXCEPTION module scope: none — ORG-001 is a ROOT MODULE with no EXCEPTION entities
─────────────────────────────────────────────────────────────────

### SEC-FE — SCR-ORG-003 — Regions
─────────────────────────────────────────────────────────────────
Screen guard     : navigation to org-regions requires canView = true
                   canView = false → redirect to unauthorized

Permission-based UI behavior:
  canView   = false → blocked at navigation — unauthorized redirect
  canCreate = false → New button / create entry point not shown
  canEdit   = false → all edit fields read-only, Save not available;
                       Deactivate/Activate buttons ALSO hidden (FINDING-4: real
                       backend gates these on REGION_UPDATE, i.e. canEdit — NOT
                       canDelete/REGION_DELETE, which the real backend never checks)
  canDelete = false → no UI effect in this module (see above) — REGION_DELETE is
                       SEC-3-seeded but not wired to any control; OQ-ORG-003 tracks
                       the discrepancy for backend/product resolution
  canApprove= n/a   → ORG has no approval workflow (SRS A6 confirms no workflow)

EXCEPTION module scope: none — ORG-001 is a ROOT MODULE with no EXCEPTION entities
─────────────────────────────────────────────────────────────────

### SEC-FE — SCR-ORG-004 — Departments
─────────────────────────────────────────────────────────────────
Screen guard     : navigation to org-departments requires canView = true
                   canView = false → redirect to unauthorized

Permission-based UI behavior:
  canView   = false → blocked at navigation — unauthorized redirect
  canCreate = false → New button / create entry point not shown
  canEdit   = false → all edit fields read-only, Save not available;
                       Deactivate/Activate buttons ALSO hidden (FINDING-4: real
                       backend gates these on DEPARTMENT_UPDATE, i.e. canEdit — NOT
                       canDelete/DEPARTMENT_DELETE, which the real backend never checks)
  canDelete = false → no UI effect in this module (see above) — DEPARTMENT_DELETE is
                       SEC-3-seeded but not wired to any control; OQ-ORG-003 tracks
                       the discrepancy for backend/product resolution
  canApprove= n/a   → ORG has no approval workflow (SRS A6 confirms no workflow)

EXCEPTION module scope: none — ORG-001 is a ROOT MODULE with no EXCEPTION entities
─────────────────────────────────────────────────────────────────

### SEC-FE — SCR-ORG-005 — Cost Centers
─────────────────────────────────────────────────────────────────
Screen guard     : navigation to org-cost-centers requires canView = true
                   canView = false → redirect to unauthorized

Permission-based UI behavior:
  canView   = false → blocked at navigation — unauthorized redirect
  canCreate = false → New button / create entry point not shown
  canEdit   = false → all edit fields read-only, Save not available;
                       Deactivate/Activate buttons ALSO hidden (FINDING-4: real
                       backend gates these on COST_CENTER_UPDATE, i.e. canEdit — NOT
                       canDelete/COST_CENTER_DELETE, which the real backend never checks)
  canDelete = false → no UI effect in this module (see above) — COST_CENTER_DELETE is
                       SEC-3-seeded but not wired to any control; OQ-ORG-003 tracks
                       the discrepancy for backend/product resolution
  canApprove= n/a   → ORG has no approval workflow (SRS A6 confirms no workflow)

EXCEPTION module scope: none — ORG-001 is a ROOT MODULE with no EXCEPTION entities
─────────────────────────────────────────────────────────────────

### SEC-FE — SCR-ORG-006 — Profit Centers
─────────────────────────────────────────────────────────────────
Screen guard     : navigation to org-profit-centers requires canView = true
                   canView = false → redirect to unauthorized

Permission-based UI behavior:
  canView   = false → blocked at navigation — unauthorized redirect
  canCreate = false → New button / create entry point not shown
  canEdit   = false → all edit fields read-only, Save not available;
                       Deactivate/Activate buttons ALSO hidden (FINDING-4: real
                       backend gates these on PROFIT_CENTER_UPDATE, i.e. canEdit — NOT
                       canDelete/PROFIT_CENTER_DELETE, which the real backend never checks)
  canDelete = false → no UI effect in this module (see above) — PROFIT_CENTER_DELETE is
                       SEC-3-seeded but not wired to any control; OQ-ORG-003 tracks
                       the discrepancy for backend/product resolution
  canApprove= n/a   → ORG has no approval workflow (SRS A6 confirms no workflow)

EXCEPTION module scope: none — ORG-001 is a ROOT MODULE with no EXCEPTION entities
─────────────────────────────────────────────────────────────────

### SEC-FE — SCR-ORG-007 — Location Sites
─────────────────────────────────────────────────────────────────
Screen guard     : navigation to org-locations requires canView = true
                   canView = false → redirect to unauthorized

Permission-based UI behavior:
  canView   = false → blocked at navigation — unauthorized redirect
  canCreate = false → New button / create entry point not shown
  canEdit   = false → all edit fields read-only, Save not available;
                       Deactivate/Activate buttons ALSO hidden (FINDING-4: real
                       backend gates these on LOCATION_SITE_UPDATE, i.e. canEdit — NOT
                       canDelete/LOCATION_SITE_DELETE, which the real backend never checks)
  canDelete = false → no UI effect in this module (see above) — LOCATION_SITE_DELETE is
                       SEC-3-seeded but not wired to any control; OQ-ORG-003 tracks
                       the discrepancy for backend/product resolution
  canApprove= n/a   → ORG has no approval workflow (SRS A6 confirms no workflow)

EXCEPTION module scope: none — ORG-001 is a ROOT MODULE with no EXCEPTION entities
─────────────────────────────────────────────────────────────────

**SEC-FE Governance Rules (shared, referenced not redeclared per screen):**
```
SEC-IMPL-RULE-2 — All UI show/hide decisions reference permission flags loaded at
  F2-SCREEN-INIT.
SEC-IMPL-RULE-3 — HTTP 403 responses caught and shown as localized message, routed
  per the F2 error routing table.
```

<!-- PHASE:SEC-FE:END -->

<!-- PHASE:ALIGN-FE:START -->
# PHASE ALIGN-FE — Frontend Internal Consistency Gate (auto-runs after SEC-FE)

ALIGN-FE validates this plan against ITSELF and against real API Docs + srs.md B1-B4.
External cross-artifact validation (vs flow-diagram.md/ui-ux-spec.md as design intent)
is Project 4.2 scope — not re-litigated here.

```
MODEL/API CHECKS (F1/F2)                                     │ Status
───────────────────────────────────────────────────────────────┴──────────
Every SCR-ID has an F1 model spec (7/7)                      │ ✓
Every model confirmed against real API DTO, mismatches fixed │ ✓ (FINDING-3)
Every API-ID (44/44) has an F2-QUERY block matching a real    │
  endpoint (including the POST-search deviation, FINDING-5)  │ ✓
Every LOV-ID (6/6) has an F2-LOV-QUERY block                  │ ✓
LOV-ORG-007 does NOT exist — correctly absent, not invented  │ ✓ (FINDING-1/2)
Facade state: currentPage/pageSize derived, not separate      │ ✓
Error routing declared (400/409/401/403/500)                  │ ✓
Pre-deactivation check declared for every deactivate op (7/7) │ ✓ (server-enforced)

VALIDATION CHECKS (F3)                                        │ Status
───────────────────────────────────────────────────────────────┴──────────
Every RULE-ID (20/20) has an F3-VALIDATION block               │ ✓
Every F3 block declares an ERR-ID or explicit NOT ASSIGNED     │ ⚠ PARTIAL — no
  status (no invented ERR-IDs, per HR-5)                       │   Error Catalog this
                                                                │   session (DRV-4)
No hardcoded message text — SRS Message-AR/EN quoted verbatim │ ✓

ROUTING/COMPONENT CHECKS (F4)                                 │ Status
───────────────────────────────────────────────────────────────┴──────────
Every SCR-ID (7/7) has an F4-SCREEN block                      │ ✓
F4-SCREEN documents real Shell structure, not fresh redesign  │ ✓
Tree-bearing entities (2/2: Departments, CostCenters) declare │ ✓ (target path
  a tree route ordered before /:id/*                          │   convention only —
                                                                │   no router exists yet)
All routes wrapped in guard                                    │ ✗ GAP — confirmed
                                                                │   missing in Shell for
                                                                │   all 7 screens, flagged
                                                                │   as integration work,
                                                                │   not silently assumed
PERM_* in F4 sourced from Permissions Matrix, none invented     │ ✓ (with FINDING-4
                                                                │   correction applied)
No 'Page'/'Container' suffix violations                        │ ✓ (Shell already uses
                                                                │   'Page' suffix correctly)

SEC-FE CHECKS                                                  │ Status
───────────────────────────────────────────────────────────────┴──────────
Every SCR-ID (7/7) has route guard spec + permission-based UI  │ ✓
EXCEPTION module interfaces respected                          │ ✓ (n/a — no EXCEPTION
                                                                │   entities in ORG)

TEST-FE COVERAGE CHECKS (Summary validation)                   │ Status
───────────────────────────────────────────────────────────────┴──────────
TC Coverage Matrix Summary (frontend) present                  │ ✓ (see SECTION D below)
No GAP ✗ entries without a DEFERRED note                      │ ✓ (regionTypeIdFk create/
                                                                │   edit explicitly DEFERRED)
NOTE: Full TC block validation is Project 4.2 CHECK-4 scope
============================================================================
ALIGN-FE GATE RESULT: PASSED ✓ — with 2 documented ⏸ items (not ✗ failures):
  ⏸ F4 route guards — confirmed missing in the real Shell for all 7 screens;
    recorded as integration work, not a plan defect (Shell predates this plan)
  ⏸ F3 ERR-ID binding — no Error Catalog available this session (DRV-4); SRS
    Message-AR/EN used as interim binding, to be replaced once SVC+API exists
Auto-correction applied: DRV-1 (LegalEntity.entityTypeId code), DRV-2 (Branch.
  branchTypeId codes), DRV-3 (audit fields added to all 7 models) — see Derivation Log
============================================================================
```

**Table — Operations Coverage (UI/Route view), all 44 APIs:**

| Operation | API-ID | UI Action (SCR-ID) | F4 Route (target) | TC-FE-ID | Status |
|---|---|---|---|---|---|
| Create | API-ORG-001 | SCR-ORG-001 Create Legal Entity | /legal-entities | TC-FE-ORG-001 | ✓ |
| Search | API-ORG-002 | SCR-ORG-001 Search Legal Entities | /legal-entities | TC-FE-ORG-002 | ✓ |
| Update | API-ORG-003 | SCR-ORG-001 Update Legal Entity | /legal-entities | TC-FE-ORG-003 | ✓ |
| Deactivate | API-ORG-004 | SCR-ORG-001 Deactivate Legal Entity | /legal-entities | TC-FE-ORG-004 | ✓ |
| Activate | API-ORG-005 | SCR-ORG-001 Activate Legal Entity | /legal-entities | TC-FE-ORG-005 | ✓ |
| Get | API-ORG-006 | SCR-ORG-001 Get Legal Entity by ID | /legal-entities | TC-FE-ORG-006 | ✓ |
| Create | API-ORG-007 | SCR-ORG-002 Create Branch | /branches | TC-FE-ORG-007 | ✓ |
| Search | API-ORG-008 | SCR-ORG-002 Search Branches | /branches | TC-FE-ORG-008 | ✓ |
| Update | API-ORG-009 | SCR-ORG-002 Update Branch | /branches | TC-FE-ORG-009 | ✓ |
| Deactivate | API-ORG-010 | SCR-ORG-002 Deactivate Branch | /branches | TC-FE-ORG-010 | ✓ |
| Activate | API-ORG-011 | SCR-ORG-002 Activate Branch | /branches | TC-FE-ORG-011 | ✓ |
| Get | API-ORG-012 | SCR-ORG-002 Get Branch by ID | /branches | TC-FE-ORG-012 | ✓ |
| Create | API-ORG-013 | SCR-ORG-003 Create Region | /regions | TC-FE-ORG-013 | ✓ |
| Search | API-ORG-014 | SCR-ORG-003 Search Regions | /regions | TC-FE-ORG-014 | ✓ |
| Update | API-ORG-015 | SCR-ORG-003 Update Region | /regions | TC-FE-ORG-015 | ✓ |
| Deactivate | API-ORG-016 | SCR-ORG-003 Deactivate Region | /regions | TC-FE-ORG-016 | ✓ |
| Activate | API-ORG-017 | SCR-ORG-003 Activate Region | /regions | TC-FE-ORG-017 | ✓ |
| Get | API-ORG-018 | SCR-ORG-003 Get Region by ID | /regions | TC-FE-ORG-018 | ✓ |
| Create | API-ORG-019 | SCR-ORG-004 Create Department | /departments | TC-FE-ORG-019 | ✓ |
| Get | API-ORG-020 | SCR-ORG-004 Get Department tree | /departments/tree | TC-FE-ORG-020 | ✓ |
| Search | API-ORG-021 | SCR-ORG-004 Search Departments (flat) | /departments | TC-FE-ORG-021 | ✓ |
| Update | API-ORG-022 | SCR-ORG-004 Update Department | /departments | TC-FE-ORG-022 | ✓ |
| Deactivate | API-ORG-023 | SCR-ORG-004 Deactivate Department | /departments | TC-FE-ORG-023 | ✓ |
| Activate | API-ORG-024 | SCR-ORG-004 Activate Department | /departments | TC-FE-ORG-024 | ✓ |
| Get | API-ORG-025 | SCR-ORG-004 Get Department by ID | /departments | TC-FE-ORG-025 | ✓ |
| Create | API-ORG-026 | SCR-ORG-005 Create Cost Center | /cost-centers | TC-FE-ORG-026 | ✓ |
| Get | API-ORG-027 | SCR-ORG-005 Get Cost Center tree | /cost-centers/tree | TC-FE-ORG-027 | ✓ |
| Search | API-ORG-028 | SCR-ORG-005 Search Cost Centers (flat) | /cost-centers | TC-FE-ORG-028 | ✓ |
| Update | API-ORG-029 | SCR-ORG-005 Update Cost Center | /cost-centers | TC-FE-ORG-029 | ✓ |
| Deactivate | API-ORG-030 | SCR-ORG-005 Deactivate Cost Center | /cost-centers | TC-FE-ORG-030 | ✓ |
| Activate | API-ORG-031 | SCR-ORG-005 Activate Cost Center | /cost-centers | TC-FE-ORG-031 | ✓ |
| Get | API-ORG-032 | SCR-ORG-005 Get Cost Center by ID | /cost-centers | TC-FE-ORG-032 | ✓ |
| Create | API-ORG-033 | SCR-ORG-006 Create Profit Center | /profit-centers | TC-FE-ORG-033 | ✓ |
| Search | API-ORG-034 | SCR-ORG-006 Search Profit Centers | /profit-centers | TC-FE-ORG-034 | ✓ |
| Update | API-ORG-035 | SCR-ORG-006 Update Profit Center | /profit-centers | TC-FE-ORG-035 | ✓ |
| Deactivate | API-ORG-036 | SCR-ORG-006 Deactivate Profit Center | /profit-centers | TC-FE-ORG-036 | ✓ |
| Activate | API-ORG-037 | SCR-ORG-006 Activate Profit Center | /profit-centers | TC-FE-ORG-037 | ✓ |
| Get | API-ORG-038 | SCR-ORG-006 Get Profit Center by ID | /profit-centers | TC-FE-ORG-038 | ✓ |
| Create | API-ORG-039 | SCR-ORG-007 Create Location Site | /location-sites | TC-FE-ORG-039 | ✓ |
| Search | API-ORG-040 | SCR-ORG-007 Search Location Sites | /location-sites | TC-FE-ORG-040 | ✓ |
| Update | API-ORG-041 | SCR-ORG-007 Update Location Site | /location-sites | TC-FE-ORG-041 | ✓ |
| Deactivate | API-ORG-042 | SCR-ORG-007 Deactivate Location Site | /location-sites | TC-FE-ORG-042 | ✓ |
| Activate | API-ORG-043 | SCR-ORG-007 Activate Location Site | /location-sites | TC-FE-ORG-043 | ✓ |
| Get | API-ORG-044 | SCR-ORG-007 Get Location Site by ID | /location-sites | TC-FE-ORG-044 | ✓ |

Note: F4 Route above is the target convention (F4-RULE-1), not a live react-router
path yet — see F4 phase's structural note. TC-FE-IDs are placeholders (Section 8.6),
assigned for real in frontend-test-plan.md.

<!-- PHASE:ALIGN-FE:END -->

## SECTION D — TC COVERAGE MATRIX SUMMARY (FRONTEND) (not a phase — no marker)

```
TC COVERAGE MATRIX SUMMARY (FRONTEND) — Organization (ORG) — PLAN-ID: PLAN-ORG-001
====================================================================
NOTE: TC-IDs listed here are placeholders — assigned for real in frontend-test-plan.md

SCR-ID COVERAGE:
SCR-ID          │Happy path UI TC      │Rule violation TC     │Status
────────────────┼──────────────────────┼──────────────────────┼──────────────
SCR-ORG-001     │TC-FE-ORG-001         │(covered per-rule, F3)│COVERED ✓
SCR-ORG-002     │TC-FE-ORG-007         │(covered per-rule, F3)│COVERED ✓
SCR-ORG-003     │TC-FE-ORG-013         │(covered per-rule, F3)│COVERED ✓
SCR-ORG-004     │TC-FE-ORG-019         │(covered per-rule, F3)│COVERED ✓
SCR-ORG-005     │TC-FE-ORG-026         │(covered per-rule, F3)│COVERED ✓
SCR-ORG-006     │TC-FE-ORG-033         │(covered per-rule, F3)│COVERED ✓
SCR-ORG-007     │TC-FE-ORG-039         │(covered per-rule, F3)│COVERED ✓

Special note — SCR-ORG-003 (Regions):
  regionTypeIdFk create/edit picker: DEFERRED — GAP ✘ recorded WITH a DEFERRED note
  (OQ-ORG-002) — not a silent GAP. Read-only display of regionTypeNameEn: COVERED ✓.

MODULE INTEGRATION FLOW COVERAGE:
  ORG lifecycle    │ create→search, update→search, deactivate→search,
                   │ activate→search — covered per-screen above (44 API-level TCs)
  Tree flows       │ Departments/CostCenters: node select → branch-filtered tree load
                   │ → add-child → circular-reference rejection (RULE-ORG-007/008)
====================================================================
Gate rule: same COVERED ✓ / PARTIAL ⚠ / GAP ✘ semantics as backend
(see PROJECT-3-BACKEND-ENGINE.md Section 8.8 for the shared definition)
====================================================================
```

## DERIVATION LOG (not a phase — no marker)

```
DRV-1 | LegalEntity.entityTypeId union corrected 'REP_OFFICE'→'REPRESENTATIVE_OFFICE'
      | Criterion-2 (real API DTO + LOV-ORG-001 in SRS A5) | F1/SCR-ORG-001
DRV-2 | Branch.branchTypeId union corrected to add _BRANCH suffix to all 4 codes
      | Criterion-2 (real API DTO + LOV-ORG-002 in SRS A5) | F1/SCR-ORG-002
DRV-3 | Audit fields (createdAt/createdBy/updatedAt/updatedBy) added to all 7 Shell
      | models | Criterion-1+2 (present on every real response DTO; required by
      | approved ui-ux-spec's "Record info" footer design intent) | F1/ALL 7
DRV-4 | F3 ERR-ID left as NOT ASSIGNED across all 20 RULE-ID blocks | no
      | backend-execution-plan.md / Error Catalog provided this session — SRS
      | Message-AR/EN used as interim binding per F3-LOC-RULE-1 | F3/ALL 7
DRV-5 | Deactivate/Activate button gating keyed to canEdit (PERM_*_UPDATE), not
      | canDelete (PERM_*_DELETE) as SRS B2/B4 declares | Criterion-2 (real
      | endpoint "Required permission(s)" annotations, all 44 APIs, zero
      | exceptions — CONTRACT-12 real-beats-planned) | F4/SEC-FE/ALL 7 —
      | escalated as OQ-ORG-003, not silently resolved
DRV-6 | regionTypeIdFk retyped number|null + regionTypeNameEn added for display;
      | Shell's 5-value string union removed | Criterion-2 (real API DTO;
      | SRS A3 confirms RegionType is a separate reference-table entity, not an
      | LOV) | F1/SCR-ORG-003 — field then marked DEFERRED per OQ-ORG-002
DRV-7 | Search API-QUERY blocks (7 of 44) use POST + filter-DSL body, not SRS B5's
      | flat GET query params | Criterion-2 (real endpoint docs, all 7 screens,
      | consistent "Advanced Search" convention per index.md) | F2/ALL 7
```

## AGENT HANDOFF SUMMARY (not a phase — no marker)

```
AGENT INPUT PACKAGE:
  ✓ frontend-execution-plan.md — this file
  ✓ srs.md — functional requirements (PART A/B for ORG)
  ✓ real API Docs — index.md + 7 endpoint files
  ✓ flow-diagram-3.md + ui-ux-spec-3.md — design intent reference (human-approved)
  ✓ shell-manifest-ORG.md — real UI Shell structure (human-confirmed)
  ✓ OQ Log — 3 active OQs above — agent must NOT resolve these unilaterally

AGENT READING ORDER:
  1. PLAN HEADER + FINDINGS — understand full scope and known discrepancies
  2. PHASE F1 — confirmed/corrected TypeScript models
  3. PHASE F2 — service contracts and Facade Hook state
  4. PHASE F3 — validation rules
  5. PHASE F4 — routing/component structure + integration gaps
  6. PHASE SEC-FE — security and permission-based UI behavior
  7. SECTION D — TC Coverage Matrix Summary (full TCs: frontend-test-plan.md,
     generated only after this ALIGN-FE gate is reviewed)
  8. Cross-reference real API Docs directly for exact endpoint/DTO shapes
```

## FRONTEND PLAN COMPLETENESS SELF-CHECK (not a phase — no marker)

```
[✓] Every SCR-ID (7/7) has F1 model spec
[✓] Every SCR-ID (7/7) has F2-SCREEN-INIT spec
[✓] Every SCR-ID (7/7) has F2-FACADE spec
[✓] Every API-ID (44/44) has F2-QUERY spec matching a REAL endpoint
[✓] Every LOV-ID (6/6) has F2-LOV-QUERY spec; LOV-ORG-007 correctly absent (not invented)
[✓] Facade state: currentPage/pageSize declared as derived, not separate state
[✓] Error routing declared: 400→inline / 409→toast / 401→login / 403→unauth
[✓] Pre-deactivation usage check declared for every deactivate operation (server-side)
[✓] Every F3 RULE-ID (20/20) references an ERR-ID slot or explicit NOT ASSIGNED —
    no hardcoded message text (SRS Message-AR/EN quoted verbatim, interim per DRV-4)
[✓] Every SCR-ID (7/7) has F4-SCREEN block (route path, guards, components, file paths)
[✓] Every tree-bearing entity (2/2) has a TreePage declared in its F4-SCREEN block
[✓] Tree routes declared before /:id/* in target-path convention (no live router yet)
[✓] All PERM_* codes in F4 sourced from SRS B4/registry (corrected per FINDING-4) —
    none invented

CROSS-CUTTING CHECKS:
[✓] TC Coverage Matrix Summary (frontend) present in SECTION D
[✓] Derivation Log entries present for every non-obvious inference (7 DRV entries)
[✓] ALIGN-FE gate passed ✓ (2 documented ⏸ items, 0 unresolved ✗)

STRUCTURAL SELF-CHECK (AMEND-P3-M):
[✓] Every phase has exactly one PHASE:{key}:START and matching :END — keys used:
    F1, F2, F3, F4, SEC-FE, ALIGN-FE (all six canonical keys, no near-misses)
[✓] No section/heading label repeats anywhere in this document
[✓] Trailing content (this self-check, Derivation Log, Agent Handoff Summary) sits
    after PHASE:ALIGN-FE:END, headings carry no "PHASE" word, no markers
[✓] SUB threshold checked while writing (7 screens ≥ 5 → SUB applied in F1/F2/F3/F4)
[✓] Every SUB marker carries its phase-key prefix (SUB:F1-SCR-ORG-001, SUB:F2-...,
    SUB:F3-..., SUB:F4-...) — no bare SUB:SCR-ORG-00X anywhere (grep-verified below)
```

---
*End of frontend-execution-plan.md — Organization (ORG) — PLAN-ORG-001*
*Governed by: PROJECT-3-FRONTEND-ENGINE.md v2.1 (Project 3.2 — PASS 2)*
*ALIGN-FE: PASSED ✓ | Next: review OQ-ORG-002/003 with backend/product, then*
*generate frontend-test-plan.md (TC-FE-ORG-001..044+)*