<!-- Source: PHASE:F1 / SUB:F1-SCR-SEC-006 -->
<!-- Context: see F1-HEADER.md for phase-level strategy, registry table, and intro -->


### F1-SCREEN — SCR-SEC-006 — User Profile [AS-BUILT identity preserved]

```
Shell status: CONFIRMED (UserProfileDrawer.tsx, shell-manifest-SECURITY.md).
Launched from SCR-SEC-002.

Entities touched: ENTITY-SEC-009 (SecUserProfile) exclusively.

Fields confirmed 1:1 against Create/UpdateSecUserProfileRequest:
fullNameEn, fullNameAr, branchId(->branchIdFk), preferredLang,
employeeId(->employeeIdFk), active switch(->isActiveFl). No structural
gap beyond the field renames/type corrections already listed under
F1-MODEL ENTITY-SEC-009.

OQ-015 CARRYOVER (repeated here per 0.4 — frontend impact is concrete on
this exact screen): RULE-SEC-037's allowedBranches[] JWT claim is issued
but never consumed anywhere in the backend to restrict data access. This
screen presents branch assignment as configuration data only. This plan
does not add, and does not claim, any frontend-side enforcement or
filtering by allowedBranches — none exists on the backend to consume.
```

