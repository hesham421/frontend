<!-- Source: PHASE:F1 / SUB:F1-SCR-SEC-007 -->
<!-- Context: see F1-HEADER.md for phase-level strategy, registry table, and intro -->


### F1-SCREEN — SCR-SEC-007 — Role Data Scope (Branch Assignment)

```
Shell status: CONFIRMED (DataScopeDrawer.tsx, shell-manifest-SECURITY.md).
Launched from both SCR-SEC-002 (Users) and SCR-SEC-003 (Roles) — Shell's
own DataScopeDrawerProps (scope, roleId?) already reflects this dual
entry point.

Entities touched: ENTITY-SEC-010 (SecRoleBranch) exclusively.

Fields confirmed against Create/UpdateSecRoleBranchRequest: role select
(->roleIdFk), branch select(->branchIdFk), data access level select
(->dataAccessLevel, corrected enum values per F1-MODEL ENTITY-SEC-010
correction #3 — this is the highest-stakes correction in this plan,
since the Shell's current values would fail every save), active switch
(->isActiveFl), conditional delete button (->DELETE endpoint, confirmed
to exist).

OQ-015 CARRYOVER (repeated here per 0.4 — this is the primary screen
where a user could reasonably assume the configured scope is enforced):
same allowedBranches[]-never-consumed gap as SCR-SEC-006. This plan does
not claim data-access enforcement exists anywhere in the frontend or
backend for this module.
```

