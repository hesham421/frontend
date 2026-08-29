<!-- Source: PHASE:F1 / SUB:F1-SCR-ORG-003 -->
<!-- Context: see F1-HEADER.md for phase-level strategy, registry table, and intro -->

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
