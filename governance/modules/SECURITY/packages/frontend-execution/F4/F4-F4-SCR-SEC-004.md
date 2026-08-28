<!-- Source: PHASE:F4 / SUB:F4-SCR-SEC-004 -->
<!-- Context: see F4-HEADER.md for phase-level strategy, registry table, and intro -->


### F4-SCREEN — SCR-SEC-004 — Permission Registry
```
Shell status     : CONFIRMED.
Screen key       : 'sec-permissions' (App.tsx:49-57, confirmed)
Component file   : src/pages/Security/Permissions.tsx (confirmed)
Guard (AS-IS)    : NONE per-screen (same single global gate).
Guard (FLAGGED ADDITION): same pattern — permission check against
  PERM_PERMISSION_* (pageCode unconfirmed, OQ-SEC-FE-003 applies here
  too).
PERM_* required  : unconfirmed pageCode — OQ-SEC-FE-003.
COMPONENTS:
  PermissionsPage
    Path        : src/pages/Security/Permissions.tsx (confirmed)
    Screen key  : 'sec-permissions'
    Facade Hook : usePermissionRegistryFacade()
  Composite Screen (CORE-9): Search+Entry in ONE component, no delete
    action (confirmed match to the real API's own absent delete
    endpoint — see F1-MODEL ENTITY-SEC-003) — AS-IS, router-less.
Shared UI imports: data table, KPI stat row, search/module filter bar,
  create/edit dialog (not enumerated further by shell-manifest)
```

