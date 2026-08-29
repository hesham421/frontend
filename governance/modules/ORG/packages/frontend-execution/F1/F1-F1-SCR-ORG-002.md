<!-- Source: PHASE:F1 / SUB:F1-SCR-ORG-002 -->
<!-- Context: see F1-HEADER.md for phase-level strategy, registry table, and intro -->

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
