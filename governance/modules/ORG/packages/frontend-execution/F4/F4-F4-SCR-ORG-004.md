<!-- Source: PHASE:F4 / SUB:F4-SCR-ORG-004 -->
<!-- Context: see F4-HEADER.md for phase-level strategy, registry table, and intro -->

### F4-SCREEN — SCR-ORG-004 — Departments
─────────────────────────────────────────────────────────────────
Shell status     : Route/component ALREADY EXISTS — DepartmentsPage at src/pages/Organization/Departments.tsx
Container Pattern: TREE_MASTER_DETAIL (confirmed in F1)

Target path (F4-RULE-1 convention, NOT yet real — no router exists in this repo):
  /departments
  /departments/tree                ← tree-bearing entity, MUST precede /:id/* (F4-RULE-1)
  /departments/tree/:nodeId         (selected-node detail panel)

Shell's ACTUAL current reality: screen-key 'org-departments' in useNavigationStore,
  switched in src/App.tsx's renderCurrentScreen() — no URL-addressable sub-states
  for edit/new/node-selection exist today (single component handles all of it
  internally per the Shell Manifest's high-level extraction — the manifest's depth
  does not confirm whether Search/Drawer are separated as distinct React
  sub-components internally per CORE-9; agent must verify against the actual file
  before assuming compliance — this is a documentation gap, not a redesign call).

Route module     : not applicable today — no React.lazy code-split boundary exists
                   for this module (F4-RULE-2 target for future routing integration)

Route guard      : MISSING — confirmed gap (shell-manifest-ORG.md: "no permission
                   check wired around this case in App.tsx's switch" for org-departments,
                   unlike sec-users' can('PERM_USER_VIEW') pattern). FLAGGED as an
                   integration addition, not a Shell redesign (F4-RULE-3).
PERM_* required  : DEPARTMENT_VIEW (list + read-mode entry)
                   DEPARTMENT_CREATE (new record)
                   DEPARTMENT_UPDATE (edit AND deactivate/activate — see FINDING-4/OQ-ORG-003:
                   real backend never checks DEPARTMENT_DELETE despite SRS/registry declaring it)
                   [DEPARTMENT_DELETE is SEC-3-seeded but unused by the real backend for this
                   module — do not wire it to any button; see SEC-FE below]

COMPONENTS (per F4-RULE-4/5, branched by Container Pattern):
  DepartmentsPage (route-level, hosts Tree + permanently-visible detail form)
    Path       : src/pages/Organization/Departments.tsx
    Facade Hook: useDepartmentsFacade()
    Mode resolution: selected-node id — currently internal component state per the
                 Shell (no route param exists); F4-RULE-7 target is a route param
                 (e.g. /:nodeId) once routing integration happens.

Shared UI imports : not enumerated by shell-manifest-ORG.md's extraction depth —
                    agent confirms against the actual file (F4-RULE-8 applies: only
                    components actually rendered, no blanket import).
─────────────────────────────────────────────────────────────────
