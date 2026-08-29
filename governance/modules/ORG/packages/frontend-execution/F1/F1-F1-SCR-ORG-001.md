<!-- Source: PHASE:F1 / SUB:F1-SCR-ORG-001 -->
<!-- Context: see F1-HEADER.md for phase-level strategy, registry table, and intro -->

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
