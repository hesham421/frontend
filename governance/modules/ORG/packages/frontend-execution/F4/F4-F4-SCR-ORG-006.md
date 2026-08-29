<!-- Source: PHASE:F4 / SUB:F4-SCR-ORG-006 -->
<!-- Context: see F4-HEADER.md for phase-level strategy, registry table, and intro -->

### F4-SCREEN — SCR-ORG-006 — Profit Centers
─────────────────────────────────────────────────────────────────
Shell status     : Route/component ALREADY EXISTS — ProfitCentersPage at src/pages/Organization/ProfitCenters.tsx
Container Pattern: SIDE_DRAWER (confirmed in F1)

Target path (F4-RULE-1 convention, NOT yet real — no router exists in this repo):
  /profit-centers
  /profit-centers?editId={id}      (EDIT — toggles FormDrawer)
  /profit-centers?new=true           (CREATE — toggles FormDrawer)

Shell's ACTUAL current reality: screen-key 'org-profit-centers' in useNavigationStore,
  switched in src/App.tsx's renderCurrentScreen() — no URL-addressable sub-states
  for edit/new/node-selection exist today (single component handles all of it
  internally per the Shell Manifest's high-level extraction — the manifest's depth
  does not confirm whether Search/Drawer are separated as distinct React
  sub-components internally per CORE-9; agent must verify against the actual file
  before assuming compliance — this is a documentation gap, not a redesign call).

Route module     : not applicable today — no React.lazy code-split boundary exists
                   for this module (F4-RULE-2 target for future routing integration)

Route guard      : MISSING — confirmed gap (shell-manifest-ORG.md: "no permission
                   check wired around this case in App.tsx's switch" for org-profit-centers,
                   unlike sec-users' can('PERM_USER_VIEW') pattern). FLAGGED as an
                   integration addition, not a Shell redesign (F4-RULE-3).
PERM_* required  : PROFIT_CENTER_VIEW (list + read-mode entry)
                   PROFIT_CENTER_CREATE (new record)
                   PROFIT_CENTER_UPDATE (edit AND deactivate/activate — see FINDING-4/OQ-ORG-003:
                   real backend never checks PROFIT_CENTER_DELETE despite SRS/registry declaring it)
                   [PROFIT_CENTER_DELETE is SEC-3-seeded but unused by the real backend for this
                   module — do not wire it to any button; see SEC-FE below]

COMPONENTS (per F4-RULE-4/5, branched by Container Pattern):
  ProfitCentersPage (route-level, hosts Search + toggled FormDrawer)
    Path       : src/pages/Organization/ProfitCenters.tsx
    Facade Hook: useProfitCentersFacade()
    NOTE       : per F4-RULE-5, Search and the Entry form must be separate
                 components (a FormDrawer, not a conditional render inside one
                 component body) — confirm this internally in the existing file;
                 if the current implementation is one undivided component body,
                 that is a CORE-9 gap to fix during integration, not something
                 this plan invents new structure for.

Shared UI imports : not enumerated by shell-manifest-ORG.md's extraction depth —
                    agent confirms against the actual file (F4-RULE-8 applies: only
                    components actually rendered, no blanket import).
─────────────────────────────────────────────────────────────────
