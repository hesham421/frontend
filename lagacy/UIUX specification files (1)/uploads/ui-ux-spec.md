# UI/UX DESIGN ENGINE — ui-ux-spec.md — Organization (ORG)

```
Module         : Organization (ORG prefix)
Status         : RECONCILED (7/7 screens) — see flow-diagram.md for the one
                 flagged sub-item (US-ORG-014 / OQ-ORG-002)
Source         : srs-org-001.md PART B (B1-B4), per screen — reference only,
                 no field/rule/permission redefined here
```

---

## ui-ux-spec.md — SCR-ORG-001 — Legal Entities
──────────────────────────────────────────────────────────────────
Screen           : SCR-ORG-001 — Legal Entities
UI Pattern       : PATTERN-1 — Search + Entry (per SRS B1 — unchanged)
Fields shown     : legalEntityCode (read-only), nameAr, nameEn, entityTypeId (LOV-ORG-001), notes
                   [from SRS B3 — every field, no additions, no omissions]
Permissions      : PERM_LEGAL_ENTITY_{VIEW/CREATE/UPDATE/DELETE} (SRS B4 — reference only)
Empty state      : "No legal entities yet — Legal Entities are the root of the org
                   structure everything else sits under. Create the first one to begin."
                   + New button
Loading state    : Skeleton rows in search grid (5 placeholder rows); entry panel shows
                   a disabled form shell with spinner over the code field while a new
                   business code is being generated server-side
Error state       : Inline field errors under nameAr/nameEn/entityTypeId on validation
                   failure; a dismissible banner above the grid for save failures caused
                   by RULE-ORG-001/002 (active dependents block deactivation) — banner
                   text sourced from the rule's bilingual message, ERR-ID mapping deferred
                   to Project 3.2 (F3)
Design intent note: PROPOSAL — search grid on the left/top, entry panel opens as a
                   right-side drawer (not a full navigation change) so the admin keeps
                   search context while editing. Read-only code field is visually
                   distinguished (muted background) rather than merely disabled, to
                   signal "will never be editable" vs. "not editable right now."
                   Audit trail (createdBy/At, updatedBy/At — A3 fields, already governed)
                   proposed as a collapsed "Record info" footer inside the entry panel —
                   display only, satisfies US-ORG-019 without adding a new field.
──────────────────────────────────────────────────────────────────

## ui-ux-spec.md — SCR-ORG-002 — Branches
──────────────────────────────────────────────────────────────────
Screen           : SCR-ORG-002 — Branches
UI Pattern       : PATTERN-1 — Search + Entry (per SRS B1)
Fields shown     : branchCode (read-only), nameAr, nameEn, legalEntityFk (LOV, active only),
                   branchTypeId (LOV-ORG-002), notes
Permissions      : PERM_BRANCH_{VIEW/CREATE/UPDATE/DELETE}
Empty state      : "No branches under [Legal Entity name] yet." when arriving via drill-in
                   with a legalEntityFk filter pre-applied; generic "No branches yet" when
                   arriving from the main menu with no filter
Loading state    : Same skeleton-grid pattern as SCR-ORG-001; legalEntityFk LOV shows a
                   "Loading legal entities…" placeholder until the active list resolves
Error state       : Inline field errors; save-blocked banner for RULE-ORG-003/004/005
                   (active Departments/CostCenters/LocationSites block Branch deactivation)
                   — banner lists which dependent type blocked the action, not a generic message
Design intent note: PROPOSAL — same drawer pattern as SCR-ORG-001 for consistency. Because
                   three separate screens (Departments, Cost Centers, Location Sites) drill
                   in from a Branch record, the entry panel's read view proposes three quick
                   links ("View Departments," "View Cost Centers," "View Location Sites")
                   scoped to the selected branch — navigation convenience only, no new data.
──────────────────────────────────────────────────────────────────

## ui-ux-spec.md — SCR-ORG-003 — Regions
──────────────────────────────────────────────────────────────────
Screen           : SCR-ORG-003 — Regions
UI Pattern       : PATTERN-1 — Search + Entry (per SRS B1)
Fields shown     : regionCode (read-only), nameAr, nameEn, legalEntityFk (LOV, active only),
                   regionTypeId (LOV-ORG-007, Reference Table — not a static dropdown), notes
Permissions      : PERM_REGION_{VIEW/CREATE/UPDATE/DELETE}
Empty state      : "No regions yet."
Loading state    : Same skeleton-grid pattern; regionTypeId LOV fetched from
                   GET /api/v1/org/region-types (API-ORG-020) rather than a static LOV table
                   — loading indicator specific to that field since it's a live network call,
                   not a cached LOV
Error state       : Inline field errors; save-blocked banner for RULE-ORG-006 (active
                   Branches reference this Region) — banner notes this rule's Test-Hint
                   (SOFT-READ consumer impact is still OQ-001/DEFERRED) by NOT claiming the
                   deactivation is fully safe for other modules, only that Branches are clear
Design intent note: PROPOSAL — regionTypeId rendered as a searchable combobox, not a plain
                   dropdown, since SRS A2 notes >15 values and Admin-extensible growth over
                   time. FLAGGED: this spec does not include any "manage region types" screen
                   or action for admins to add a new region type themselves — see
                   flow-diagram.md FLOW-ORG-003 flagged item / OQ-ORG-002. Do not add one
                   without a resolved SCR-ID/API-ID — flagging instead of inventing.
──────────────────────────────────────────────────────────────────

## ui-ux-spec.md — SCR-ORG-004 — Departments
──────────────────────────────────────────────────────────────────
Screen           : SCR-ORG-004 — Departments
UI Pattern       : PATTERN-3 — Specialized (Hierarchical Tree) (per SRS B1 — unchanged;
                   this engine does not substitute PATTERN-1 for a tree-shaped entity)
Fields shown     : deptCode (read-only), nameAr, nameEn, branchFk (LOV, active only),
                   parentDepartmentFk (LOV, active only), nodeTypeId (LOV-ORG-003,
                   SUMMARY/DETAIL), notes
Permissions      : PERM_DEPARTMENT_{VIEW/CREATE/UPDATE/DELETE}
Empty state      : Branch filter required before the tree loads — empty state before a
                   branch is chosen reads "Select a branch to view its department tree.";
                   once a branch is chosen with zero departments: "No departments under
                   this branch yet." + New (root-level) button
Loading state    : Tree Explorer shows a collapsed skeleton (3 placeholder nodes) while
                   GET /departments/tree (API-ORG-022) resolves
Error state       : Inline error on parentDepartmentFk selection for RULE-ORG-007 (circular
                   reference) — surfaced at selection time in the combobox (candidate
                   ancestors of the current node visually disabled/excluded from the list),
                   not only on save, to prevent the error rather than just report it
Design intent note: PROPOSAL — Tree Explorer as a left sidebar, Entry Panel to its right
                   (not a drawer, since the tree needs to stay visible while editing a node
                   deep in the hierarchy). SUMMARY nodes get a distinct visual indicator
                   (e.g. a folder-style icon) vs. DETAIL nodes (a document-style icon) so
                   RULE-ORG-009 (SUMMARY nodes can't be posting targets, enforced by
                   consumer modules) is visually legible here even though ORG itself
                   doesn't enforce that rule.
──────────────────────────────────────────────────────────────────

## ui-ux-spec.md — SCR-ORG-005 — Cost Centers
──────────────────────────────────────────────────────────────────
Screen           : SCR-ORG-005 — Cost Centers
UI Pattern       : PATTERN-3 — Specialized (Hierarchical Tree) (per SRS B1)
Fields shown     : costCenterCode (read-only), nameAr, nameEn, branchFk (LOV, active only),
                   parentCostCenterFk (LOV, active only), nodeTypeId (LOV-ORG-004,
                   SUMMARY/DETAIL), costCenterTypeId (LOV-ORG-005, Direct/Indirect/Shared), notes
Permissions      : PERM_COST_CENTER_{VIEW/CREATE/UPDATE/DELETE}
Empty state      : Same branch-gated pattern as SCR-ORG-004
Loading state    : Same tree-skeleton pattern as SCR-ORG-004, sourced from
                   GET /cost-centers/tree (API-ORG-029)
Error state       : Same circular-reference prevention pattern as SCR-ORG-004
                   (RULE-ORG-008 in place of RULE-ORG-007)
Design intent note: PROPOSAL — same Tree Explorer + Entry Panel layout as SCR-ORG-004 for
                   consistency across the module's two tree screens. costCenterTypeId
                   (Direct/Indirect/Shared) proposed as a small colored badge next to each
                   node's name in the tree (not just in the entry form), since financial
                   users (per SRS B1 "المستخدمون": مدير المالية included here but not on
                   Departments) benefit from seeing the classification while scanning
                   the tree, not only after opening a node.
──────────────────────────────────────────────────────────────────

## ui-ux-spec.md — SCR-ORG-006 — Profit Centers
──────────────────────────────────────────────────────────────────
Screen           : SCR-ORG-006 — Profit Centers
UI Pattern       : PATTERN-1 — Search + Entry (per SRS B1)
Fields shown     : profitCenterCode (read-only), nameAr, nameEn, legalEntityFk (LOV, active only), notes
Permissions      : PERM_PROFIT_CENTER_{VIEW/CREATE/UPDATE/DELETE}
Empty state      : "No profit centers yet."
Loading state    : Same skeleton-grid pattern as SCR-ORG-001
Error state       : Inline field errors; no deactivate-blocking rule is declared against
                   this entity in SRS A4, so no save-blocked banner is proposed for
                   deactivation — only a standard confirm-deactivate dialog
Design intent note: PROPOSAL — simplest screen in the module (5 fields, no tree, no
                   deactivate-blocking rule). Drawer pattern retained for consistency with
                   SCR-ORG-001/002/003/007 rather than introduced as a special case.
──────────────────────────────────────────────────────────────────

## ui-ux-spec.md — SCR-ORG-007 — Location Sites
──────────────────────────────────────────────────────────────────
Screen           : SCR-ORG-007 — Location Sites
UI Pattern       : PATTERN-1 — Search + Entry (per SRS B1)
Fields shown     : locationCode (read-only), nameAr, nameEn, branchFk (LOV, active only),
                   siteTypeId (LOV-ORG-006), notes
Permissions      : PERM_LOCATION_SITE_{VIEW/CREATE/UPDATE/DELETE}
Empty state      : "No location sites under [Branch name] yet." when drill-in filter is
                   applied; generic "No location sites yet" otherwise
Loading state    : Same skeleton-grid pattern as SCR-ORG-001/002
Error state       : Inline field errors; standard confirm-deactivate dialog (no
                   deactivate-blocking rule declared against this entity in SRS A4)
Design intent note: PROPOSAL — siteTypeId proposed with a small type-specific icon
                   (office/warehouse/factory/site/retail) in both the search grid and the
                   entry form, purely a visual aid — no new field, reuses the existing
                   LOV-ORG-006 values only.
──────────────────────────────────────────────────────────────────

---

## Cross-Screen Design Notes (apply to all 7 screens)

```
- All 7 screens use the same "Read-Only code field, muted background" convention
  (RULE-ORG-011 — immutable business codes) — a shared component, not 7 one-off styles.
- All 7 screens use the same save-blocked-banner pattern for deactivate-prevention rules
  where one applies (RULE-ORG-001 through 006) — banner appears only for screens whose
  entity actually has such a rule in A4 (Legal Entity, Branch, Region); Department, Cost
  Center, Profit Center, and Location Site do NOT get this banner, since SRS A4 declares
  no deactivate-blocking rule against those four entities.
- Audit trail footer (createdBy/At, updatedBy/At) proposed identically across all 7 screens
  — same component, sourced from A3 fields already governed for every entity.
- No screen introduces a field, permission, or rule not already present in SRS B1-B4 for
  that screen (self-check against CONTRACT-11 before finalizing this file).
```

---
*End of ui-ux-spec.md — Organization — Project 2.5 (UI/UX Design Engine)*
*Status: RECONCILED — strong design intent for Project 3.2 (F1/F4), not a locked spec*
*One flagged item remains open: see SCR-ORG-003 / OQ-ORG-002*
