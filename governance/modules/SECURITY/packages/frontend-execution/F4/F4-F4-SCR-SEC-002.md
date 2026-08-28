<!-- Source: PHASE:F4 / SUB:F4-SCR-SEC-002 -->
<!-- Context: see F4-HEADER.md for phase-level strategy, registry table, and intro -->


### F4-SCREEN — SCR-SEC-002 — User Management
```
Shell status     : CONFIRMED — component already exists and is
                   correctly wired into the switch.
Screen key       : 'sec-users' (App.tsx:49-57, confirmed)
Component file   : src/pages/Security/Users.tsx (confirmed)
Guard (AS-IS)    : NONE per-screen — only the single global
                   isAuthenticated check in App.tsx gates entry to the
                   whole authenticated shell, this screen included.
Guard (FLAGGED ADDITION — F4-RULE-3 equivalent in a router-less
  architecture): wrap this switch case's render with a permission
  check — `if (!canView) return <Unauthorized />` — sourced from
  SCR-SEC-002's permission hook (SEC-FE phase), itself checking the
  current user's permissions array for PERM_USER_VIEW (the one
  confirmed real PERM_* literal, per permissionmanagement.md's
  example). This does not exist in the Shell today; added here as an
  explicit, flagged gap per CONTRACT-12 v2.1, not silently assumed
  present.
PERM_* required  : PERM_USER_VIEW (list/search — CONFIRMED real
                   literal), PERM_USER_CREATE / PERM_USER_UPDATE /
                   PERM_USER_DELETE (inferred by the standard
                   PERM_<PAGE_CODE>_<TYPE> pattern from RULE-SEC-047,
                   using the confirmed pageCode "USER" — these three
                   specific literals are a direct, low-risk pattern
                   application, not a guess at an unconfirmed
                   pageCode, unlike the OQ-SEC-FE-003 cases)
COMPONENTS:
  UsersPage
    Path        : src/pages/Security/Users.tsx (confirmed)
    Screen key  : 'sec-users'
    Facade Hook : useUserManagementFacade()
  Composite Screen (CORE-9): Search+Entry live in ONE component
    (UsersPage renders both the search/table view and the create/edit
    dialog internally) — confirmed AS-IS, NOT split into separate
    Search/Entry route-level components per F4-RULE-5's usual pattern,
    because there is no router to place them on separate routes. This
    is documented as the real Shell's structure, not corrected —
    CONTRACT-12 v2.1's "confirm, don't redesign" mandate applies
    directly here: F4-RULE-5 assumes a routed architecture this module
    does not have.
  UserProfileDrawer (shared, launched from this screen)
    Path        : src/components/features/UserProfileDrawer.tsx
    Facade Hook : useUserProfileFacade() (SCR-SEC-006)
  DataScopeDrawer (shared, launched from this screen)
    Path        : src/components/features/DataScopeDrawer.tsx
    Facade Hook : useRoleDataScopeFacade() (SCR-SEC-007)
Shared UI imports: confirmed from shell-manifest description — data
  table, KPI stat row, search/status filter bar, dialogs (exact
  component-library names not enumerated in shell-manifest; not
  invented here)
```

