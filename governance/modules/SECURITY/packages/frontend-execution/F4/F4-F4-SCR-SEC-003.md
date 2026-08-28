<!-- Source: PHASE:F4 / SUB:F4-SCR-SEC-003 -->
<!-- Context: see F4-HEADER.md for phase-level strategy, registry table, and intro -->


### F4-SCREEN — SCR-SEC-003 — Role & RBAC Management
```
Shell status     : CONFIRMED.
Screen key       : 'sec-roles' (App.tsx:49-57, confirmed)
Component file   : src/pages/Security/Roles.tsx (confirmed)
Guard (AS-IS)    : NONE per-screen (same single global gate as
                   SCR-SEC-002).
Guard (FLAGGED ADDITION): same pattern as SCR-SEC-002 — permission
  check sourced from SCR-SEC-003's permission hook, checking against
  PERM_ROLE_* — see PERM_* note below.
PERM_* required  : real pageCode for the Role screen was NOT confirmed
                   by literal example this session (unlike "USER") —
                   covered by OQ-SEC-FE-003. This plan does not print a
                   guessed PERM_ROLE_VIEW/etc. literal; SEC-FE resolves
                   it against the live Page Registry at implementation
                   time.
COMPONENTS:
  RolesPage
    Path        : src/pages/Security/Roles.tsx (confirmed)
    Screen key  : 'sec-roles'
    Facade Hook : useRoleManagementFacade()
  Composite Screen (CORE-9): Search+Entry in ONE component (create/
    edit dialog with embedded permission matrix, "sync all"/"copy from
    role" actions, all internal to RolesPage) — confirmed AS-IS, same
    router-less rationale as SCR-SEC-002.
  DataScopeDrawer (shared, launched from this screen)
    Path        : src/components/features/DataScopeDrawer.tsx
    Facade Hook : useRoleDataScopeFacade() (SCR-SEC-007)
Shared UI imports: data table, KPI stat row, search/status filter bar,
  dialog with embedded permission-matrix sub-panel (not enumerated
  further by shell-manifest; not invented here)
```

