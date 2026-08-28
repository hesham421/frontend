<!-- Source: PHASE:F1 / SUB:F1-SCR-SEC-002 -->
<!-- Context: see F1-HEADER.md for phase-level strategy, registry table, and intro -->


### F1-SCREEN — SCR-SEC-002 — User Management

```
Shell status: CONFIRMED (Users.tsx, shell-manifest-SECURITY.md).

Entities touched:
  ENTITY-SEC-001 (UserAccount)   - primary list/create/edit subject
  ENTITY-SEC-002 (Role)          - roles multi-select options (by name,
                                    per ENTITY-SEC-001 correction #2)
  ENTITY-SEC-009 (SecUserProfile)- via UserProfileDrawer (SCR-SEC-006)
  ENTITY-SEC-010 (SecRoleBranch) - via DataScopeDrawer (SCR-SEC-007) —
    NOTE: DataScope is Role+Branch-scoped, not User-scoped. The Shell
    opens DataScopeDrawer from this Users screen too (shell-manifest:
    "opens ... DataScopeDrawer as a sub-flow"), which is a real
    navigational nuance already reflected in the Shell's own
    `DataScopeDrawerProps.roleId?: string` (optional, not required) —
    F4 must confirm/document exactly which role's scope is being edited
    when launched from a user context rather than a role context.

Local UI state (not entity-backed): search text, status filter,
create/edit dialog open state, delete-confirm dialog state, KPI
aggregate values (total/active/inactive users).

GAP (confirmed, not invented): no lightweight count/summary endpoint
exists anywhere in usermanagement.md. The KPI row (total/active/
inactive) has no backing summary API — it can only be derived from the
paginated list response's own metadata/full-fetch, which is a real,
confirmed limitation of the backend surface, carried forward for F2.
```

