<!-- Source: PHASE:F1 / SUB:F1-SCR-ORG-007 -->
<!-- Context: see F1-HEADER.md for phase-level strategy, registry table, and intro -->

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
