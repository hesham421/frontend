<!-- Source: PHASE:SEC-FE / SUB:SEC-FE-SCR-SEC-003 -->
<!-- Context: see SEC-FE-HEADER.md for phase-level strategy, registry table, and intro -->


### SEC-FE — SCR-SEC-003 — Role & RBAC Management
```
Screen guard     : navigation to 'sec-roles' requires canView = true.
                   PERM_* literal unconfirmed for this screen's own
                   pageCode (OQ-SEC-FE-003) — implementation resolves
                   at runtime against the live Page Registry rather
                   than a literal this plan invents.

Permission-based UI behavior:
  canView    = false -> blocked at the switch-case level
  canCreate  = false -> "Add Role" entry point not shown
  canEdit    = false -> edit dialog (incl. permission matrix, "sync
                        all", "copy from role") read-only, save
                        unavailable
  canDelete  = false -> delete action not shown
  canApprove = n/a

FIELD-LEVEL EXCEPTION (does not follow the screen-wide canEdit flag):
  the VIEW column in the permission matrix is ALWAYS rendered
  checked+disabled regardless of canEdit's value — this is RULE-SEC-042
  (VIEW cannot be independently toggled), not a permission-gating
  concern; the two constraints are independent and both apply.

SEC-IMPL-RULE-3: 403s from API-SEC-016/017/018/019/020/021/024/025/026/
  050 (all of which carry explicit ROLE_VIEW/ROLE_UPDATE/ROLE_DELETE/
  ROLE_CREATE requirements per roleaccesscontrol.md) route through the
  same global 403 handler.

CROSS-SCREEN NOTE: also launches DataScopeDrawer (SCR-SEC-007) — its
  own SEC-FE block governs its guard independently.
```

