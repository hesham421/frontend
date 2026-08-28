<!-- Source: PHASE:F1 / SUB:F1-SCR-SEC-005 -->
<!-- Context: see F1-HEADER.md for phase-level strategy, registry table, and intro -->


### F1-SCREEN — SCR-SEC-005 — Page Registry

```
Shell status: CONFIRMED (Pages.tsx, shell-manifest-SECURITY.md).

Entities touched:
  ENTITY-SEC-004 (Page) - sole subject.

Local UI state (not entity-backed): search/module/status filter,
create/edit DRAWER (confirmed shell-manifest terminology — drawer, not
dialog) state, activate/deactivate action state, KPI aggregate values
(same no-summary-endpoint gap as SCR-SEC-002/003).

Fields confirmed 1:1 against CreatePageRequest/UpdatePageRequest:
pageCode (create-only, immutable after), nameEn, nameAr, route, icon,
module, parentId, displayOrder, description, active — including `route`,
whose runtime relevance to actual navigation is disputed (see F1-MODEL
ENTITY-SEC-004 correction #7); it remains a real, required, validated
field on the write payload regardless of that dispute.

CONFIRMED, NO CORRECTION: flat (non-tree) rendering despite `parentId`
existing on the model — matches the Shell's own in-code "per OQ-013"
comment; not changed here (HR-1).
```

