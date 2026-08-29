<!-- Source: PHASE:F1 / SUB:F1-SCR-ORG-005 -->
<!-- Context: see F1-HEADER.md for phase-level strategy, registry table, and intro -->

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
