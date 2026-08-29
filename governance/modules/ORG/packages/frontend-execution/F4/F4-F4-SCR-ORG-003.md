<!-- Source: PHASE:F4 / SUB:F4-SCR-ORG-003 -->
<!-- Context: see F4-HEADER.md for phase-level strategy, registry table, and intro -->

### F4-SCREEN — SCR-ORG-003 — Regions
─────────────────────────────────────────────────────────────────
Shell status     : Route/component ALREADY EXISTS — RegionsPage at src/pages/Organization/Regions.tsx
Container Pattern: SIDE_DRAWER (confirmed in F1)

Target path (F4-RULE-1 convention, NOT yet real — no router exists in this repo):
  /regions
  /regions?editId={id}      (EDIT — toggles FormDrawer)
  /regions?new=true           (CREATE — toggles FormDrawer)

Shell's ACTUAL current reality: screen-key 'org-regions' in useNavigationStore,
  switched in src/App.tsx's renderCurrentScreen() — no URL-addressable sub-states
  for edit/new/node-selection exist today (single component handles all of it
  internally per the Shell Manifest's high-level extraction — the manifest's depth
  does not confirm whether Search/Drawer are separated as distinct React
  sub-components internally per CORE-9; agent must verify against the actual file
  before assuming compliance — this is a documentation gap, not a redesign call).

Route module     : not applicable today — no React.lazy code-split boundary exists
                   for this module (F4-RULE-2 target for future routing integration)

Route guard      : MISSING — confirmed gap (shell-manifest-ORG.md: "no permission
                   check wired around this case in App.tsx's switch" for org-regions,
                   unlike sec-users' can('PERM_USER_VIEW') pattern). FLAGGED as an
                   integration addition, not a Shell redesign (F4-RULE-3).
PERM_* required  : REGION_VIEW (list + read-mode entry)
                   REGION_CREATE (new record)
                   REGION_UPDATE (edit AND deactivate/activate — see FINDING-4/OQ-ORG-003:
                   real backend never checks REGION_DELETE despite SRS/registry declaring it)
                   [REGION_DELETE is SEC-3-seeded but unused by the real backend for this
                   module — do not wire it to any button; see SEC-FE below]

COMPONENTS (per F4-RULE-4/5, branched by Container Pattern):
  RegionsPage (route-level, hosts Search + toggled FormDrawer)
    Path       : src/pages/Organization/Regions.tsx
    Facade Hook: useRegionsFacade()
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
