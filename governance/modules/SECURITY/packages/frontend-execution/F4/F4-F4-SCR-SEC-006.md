<!-- Source: PHASE:F4 / SUB:F4-SCR-SEC-006 -->
<!-- Context: see F4-HEADER.md for phase-level strategy, registry table, and intro -->


### F4-SCREEN — SCR-SEC-006 — User Profile [AS-BUILT identity preserved]
```
Shell status     : CONFIRMED.
Screen key       : n/a — not a top-level switch case; a shared drawer
                   opened from SCR-SEC-002's UsersPage.
Component file   : src/components/features/UserProfileDrawer.tsx
                   (confirmed)
Guard (AS-IS)    : none of its own — inherits SCR-SEC-002's (currently
                   also none beyond the global gate) context.
Guard (FLAGGED ADDITION): gate the drawer's OPEN action (not a
  separate render path) on PERM_USER_PROFILE_* (pageCode unconfirmed —
  OQ-SEC-FE-003), sourced from the drawer's own permission hook.
PERM_* required  : unconfirmed pageCode — OQ-SEC-FE-003.
COMPONENTS:
  UserProfileDrawer
    Path        : src/components/features/UserProfileDrawer.tsx
                   (confirmed)
    Props       : isOpen, onClose, user (confirmed, unchanged — see F1)
    Facade Hook : useUserProfileFacade(userId)
Shared UI imports: drawer form fields (fullNameEn, fullNameAr, branch
  select, preferred language, employee ID, active switch — confirmed
  field list, shell-manifest)
```

