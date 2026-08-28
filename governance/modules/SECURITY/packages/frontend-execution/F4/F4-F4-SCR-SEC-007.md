<!-- Source: PHASE:F4 / SUB:F4-SCR-SEC-007 -->
<!-- Context: see F4-HEADER.md for phase-level strategy, registry table, and intro -->


### F4-SCREEN — SCR-SEC-007 — Role Data Scope (Branch Assignment)
```
Shell status     : CONFIRMED.
Screen key       : n/a — shared drawer opened from both SCR-SEC-002
                   (Users) and SCR-SEC-003 (Roles).
Component file   : src/components/features/DataScopeDrawer.tsx
                   (confirmed)
Guard (AS-IS)    : none of its own — inherits whichever launching
                   screen's context (currently also none beyond the
                   global gate).
Guard (FLAGGED ADDITION): gate the drawer's OPEN action on
  PERM_ROLE_UPDATE (this one IS a confirmed real permission-check
  literal — RoleAccessService's SecRoleBranchService endpoints require
  ROLE_VIEW/ROLE_UPDATE/ROLE_CREATE/ROLE_DELETE per
  securitydatascoperolebranches.md's own "Required permission(s)"
  annotations — reuse those exact confirmed names rather than
  inventing a new PERM_DATASCOPE_* family this screen has no evidence
  of owning).
PERM_* required  : ROLE_VIEW (view), ROLE_CREATE (create), ROLE_UPDATE
                   (update), ROLE_DELETE (delete) — all four CONFIRMED
                   literal from securitydatascoperolebranches.md's
                   endpoint docs, not inferred/guessed.
COMPONENTS:
  DataScopeDrawer
    Path        : src/components/features/DataScopeDrawer.tsx
                   (confirmed)
    Props       : isOpen, onClose, scope, roleId? (confirmed, unchanged
                   — see F1)
    Facade Hook : useRoleDataScopeFacade(roleId, branchId)
Shared UI imports: drawer form fields (role select, branch select, data
  access level select, active switch, conditional delete button —
  confirmed field list, shell-manifest)
```

