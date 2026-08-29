<!-- Source: PHASE:F1 / SUB:F1-SCR-ORG-006 -->
<!-- Context: see F1-HEADER.md for phase-level strategy, registry table, and intro -->

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
