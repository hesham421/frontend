<!-- Source: PHASE:F1 / SUB:F1-SCR-SEC-003 -->
<!-- Context: see F1-HEADER.md for phase-level strategy, registry table, and intro -->


### F1-SCREEN — SCR-SEC-003 — Role & RBAC Management

```
Shell status: CONFIRMED (Roles.tsx, shell-manifest-SECURITY.md).

Entities touched:
  ENTITY-SEC-002 (Role)          - primary list/create/edit subject
  ENTITY-SEC-004 (Page)          - permission-matrix rows (pageCode-
                                    keyed, per ENTITY-SEC-002 correction #3)
  ENTITY-SEC-010 (SecRoleBranch) - via DataScopeDrawer (SCR-SEC-007)

Local UI state (not entity-backed): search text, status filter,
create/edit dialog with embedded permission matrix (VIEW column
checked+disabled per RULE-SEC-042; CREATE/UPDATE/DELETE columns map to
presence in the real `permissions: string[]` array), "sync all" action
state, "copy from another role" action state (source-role picker),
activate/deactivate confirm dialog, KPI aggregate values.

GAP (confirmed, not invented): same as SCR-SEC-002 — searchRoles has no
dedicated count/summary endpoint either; KPI values are derived from
the paginated fetch.
```

