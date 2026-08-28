<!-- Source: PHASE:F4 / SUB:F4-SCR-SEC-005 -->
<!-- Context: see F4-HEADER.md for phase-level strategy, registry table, and intro -->


### F4-SCREEN — SCR-SEC-005 — Page Registry
```
Shell status     : CONFIRMED.
Screen key       : 'sec-pages' (App.tsx:49-57, confirmed)
Component file   : src/pages/Security/Pages.tsx (confirmed)
Guard (AS-IS)    : NONE per-screen (same single global gate).
Guard (FLAGGED ADDITION): same pattern — permission check against
  PERM_PAGE_* (pageCode unconfirmed by literal example for THIS
  registry screen itself — the "PAGE" business concept is confirmed as
  a data type, ENTITY-SEC-004, but not as a literal pageCode string
  for the registry screen's own permission record — OQ-SEC-FE-003
  applies).
PERM_* required  : unconfirmed pageCode — OQ-SEC-FE-003. NOTE also that
                   deactivate specifically requires PAGE_DELETE per
                   API-SEC-033's real permission annotation (a backend
                   permission KEY name, not the same thing as this
                   screen's own PERM_PAGE_* frontend gating literal —
                   flagged so the two are not conflated during
                   implementation).
COMPONENTS:
  PagesRegistryPage
    Path        : src/pages/Security/Pages.tsx (confirmed)
    Screen key  : 'sec-pages'
    Facade Hook : usePageRegistryFacade()
  Composite Screen (CORE-9): Search+Entry in ONE component — entry is
    a DRAWER (confirmed shell-manifest terminology, not a dialog) —
    AS-IS, router-less. Flat (non-tree) rendering confirmed AS-IS
    despite parentId existing on the model (per-OQ-013 in-code
    comment, already noted at F1/F2) — this plan does NOT declare a
    PagesTreePage or a /tree route: no tree component exists in the
    Shell, and F4-RULE-1's tree-route-ordering requirement does not
    apply to a screen that was deliberately built flat.
Shared UI imports: data table, KPI stat row, search/module/status
  filter bar, create/edit drawer (not enumerated further by
  shell-manifest)
```

