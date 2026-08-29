<!-- Source: PHASE:F1 / SUB:F1-SCR-ORG-004 -->
<!-- Context: see F1-HEADER.md for phase-level strategy, registry table, and intro -->

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
