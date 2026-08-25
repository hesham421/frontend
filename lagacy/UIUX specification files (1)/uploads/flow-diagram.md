# UI/UX DESIGN ENGINE — flow-diagram.md — Organization (ORG)

```
Module         : Organization (ORG prefix)
Status         : RECONCILED (see note on FLOW-ORG-003 — one sub-item BLOCKED-BY-OQ)
Reconciled on  : Reconciliation Gate — this session (prd-org.md + srs-org-001.md both attached)
Governed by    : CONTRACT-11 — this file is Layer 0.5b (Design Intent), not final
```

---

FLOW-ORG-001
  Screens involved : SCR-ORG-001
  Sequence         : Main Menu → Organization ← Legal Entities (Search) → [New | Edit] → Entry Panel → Save → back to Search
  Trigger          : User selects "Legal Entities" from Organization menu
  Source US-ID(s)  : US-ORG-001 (create/manage Legal Entities), US-ORG-008 (classify by type), US-ORG-015 (block deactivate w/ dependents), US-ORG-016 (immutable/unique code), US-ORG-018 (permission-gated), US-ORG-019 (audit visibility)
  Source SCR-ID(s) : SCR-ORG-001
  Priority         : Root of the module — first screen in navigation
  Status           : RECONCILED
  Onward links     : → SCR-ORG-002 (Branches), → SCR-ORG-006 (Profit Centers) — per SRS B1 "روابط إلى"

---

FLOW-ORG-002
  Screens involved : SCR-ORG-002
  Sequence         : Entry from SCR-ORG-001 (drill-in) OR Main Menu → Organization ← Branches (Search) → [New | Edit] → Entry Panel → Save → back to Search
  Trigger          : User selects "Branches" from Organization menu, or drills in from a Legal Entity record
  Source US-ID(s)  : US-ORG-002, US-ORG-009 (classify by type), US-ORG-015, US-ORG-016, US-ORG-018, US-ORG-019
  Source SCR-ID(s) : SCR-ORG-002
  Priority         : Second-level — requires an active Legal Entity to exist
  Status           : RECONCILED
  Onward links     : → SCR-ORG-004 (Departments), → SCR-ORG-005 (Cost Centers), → SCR-ORG-007 (Location Sites) — per SRS B1 "روابط إلى"

---

FLOW-ORG-003
  Screens involved : SCR-ORG-003
  Sequence         : Main Menu → Organization ← Regions (Search) → [New | Edit] → Entry Panel → Save → back to Search
  Trigger          : User selects "Regions" from Organization menu
  Source US-ID(s)  : US-ORG-003, US-ORG-014 (classify + extend region types), US-ORG-015, US-ORG-016, US-ORG-018, US-ORG-019
  Source SCR-ID(s) : SCR-ORG-003
  Priority         : Peer-level to Branch — grouped under Legal Entity
  Status           : RECONCILED — WITH ONE FLAGGED SUB-ITEM
  Flagged item     : US-ORG-014's "add new region types without a code change" need is only
                     partially covered — SRS B5 (SCR-ORG-003) exposes a single GET endpoint
                     (API-ORG-020) for region types; no SCR-ID, and no POST/PUT/DELETE API,
                     exists in PART B for an Admin to create/update/deactivate a RegionType
                     record, even though A3/ENTITY-ORG-008 declares those operations exist at
                     the entity level. This flow does NOT include a "manage region types"
                     screen or action — raised as OQ-ORG-002 (escalation RECONCILE-ORG),
                     excluded from human approval this round.

---

FLOW-ORG-004
  Screens involved : SCR-ORG-004
  Sequence         : Entry from SCR-ORG-002 (drill-in, branch-scoped) OR Main Menu → Organization ← Departments → select Branch (mandatory filter) → Tree Explorer loads → select node → Entry Panel → Save
  Trigger          : User selects "Departments" from Organization menu, or drills in from a Branch record
  Source US-ID(s)  : US-ORG-004, US-ORG-010 (SUMMARY/DETAIL marking), US-ORG-016, US-ORG-018, US-ORG-019
  Source SCR-ID(s) : SCR-ORG-004
  Priority         : Branch-scoped, tree-structured — Branch selection is a mandatory precondition (SRS B2)
  Status           : RECONCILED
  Note             : SRS B1 assigns PATTERN-3 (Specialized — Hierarchical Tree), not PATTERN-1.
                     Sequence differs from SCR-ORG-001/002/003/006/007 accordingly — Tree
                     Explorer + Entry Panel, not Search grid + Entry Panel.

---

FLOW-ORG-005
  Screens involved : SCR-ORG-005
  Sequence         : Entry from SCR-ORG-002 (drill-in, branch-scoped) OR Main Menu → Organization ← Cost Centers → select Branch (mandatory filter) → Tree Explorer loads → select node → Entry Panel → Save
  Trigger          : User selects "Cost Centers" from Organization menu, or drills in from a Branch record
  Source US-ID(s)  : US-ORG-005, US-ORG-011 (SUMMARY/DETAIL marking), US-ORG-012 (Direct/Indirect/Shared classification), US-ORG-016, US-ORG-018, US-ORG-019
  Source SCR-ID(s) : SCR-ORG-005
  Priority         : Branch-scoped, tree-structured — same pattern as Departments plus one extra classification field
  Status           : RECONCILED
  Note             : PATTERN-3 (Specialized — Hierarchical Tree), same structural note as FLOW-ORG-004.

---

FLOW-ORG-006
  Screens involved : SCR-ORG-006
  Sequence         : Entry from SCR-ORG-001 (drill-in) OR Main Menu → Organization ← Profit Centers (Search) → [New | Edit] → Entry Panel → Save → back to Search
  Trigger          : User selects "Profit Centers" from Organization menu, or drills in from a Legal Entity record
  Source US-ID(s)  : US-ORG-006, US-ORG-016, US-ORG-018, US-ORG-019
  Source SCR-ID(s) : SCR-ORG-006
  Priority         : Peer-level to Branch — tied to Legal Entity directly (financial reporting unit, per SRS A2), not to Branch
  Status           : RECONCILED

---

FLOW-ORG-007
  Screens involved : SCR-ORG-007
  Sequence         : Entry from SCR-ORG-002 (drill-in, branch-scoped) OR Main Menu → Organization ← Location Sites (Search) → [New | Edit] → Entry Panel → Save → back to Search
  Trigger          : User selects "Location Sites" from Organization menu, or drills in from a Branch record
  Source US-ID(s)  : US-ORG-007, US-ORG-013 (classify by type), US-ORG-016, US-ORG-018, US-ORG-019
  Source SCR-ID(s) : SCR-ORG-007
  Priority         : Branch-scoped, flat structure (no tree, per SRS B1)
  Status           : RECONCILED

---

## Navigation Map (summary)

```
Organization (menu)
 ├─ Legal Entities        (SCR-ORG-001) ──┬──▶ Branches
 │                                        └──▶ Profit Centers
 ├─ Branches              (SCR-ORG-002) ──┬──▶ Departments
 │                                        ├──▶ Cost Centers
 │                                        └──▶ Location Sites
 ├─ Regions               (SCR-ORG-003)     [region-type mgmt: BLOCKED-BY-OQ — OQ-ORG-002]
 ├─ Departments           (SCR-ORG-004)  [branch-scoped tree]
 ├─ Cost Centers          (SCR-ORG-005)  [branch-scoped tree]
 ├─ Profit Centers        (SCR-ORG-006)  [legal-entity-scoped]
 └─ Location Sites        (SCR-ORG-007)  [branch-scoped]
```

## Reconciliation Gate Output (see chat for full report)

```
Reconciled, no rework needed : 7 screens  → straight to human approval
Flagged for rework            : 0 screens
Blocked (OQ)                  : 1 user story  → OQ-ORG-002 (US-ORG-014, RegionType mgmt)
Contradictions (OQ)           : 0 found
```

---
*End of flow-diagram.md — Organization — Project 2.5 (UI/UX Design Engine)*
*Status: RECONCILED — ready for human approval except the flagged FLOW-ORG-003 sub-item*
