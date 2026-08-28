<!-- Source: PHASE:SEC-FE / SUB:SEC-FE-SCR-SEC-002 -->
<!-- Context: see SEC-FE-HEADER.md for phase-level strategy, registry table, and intro -->


### SEC-FE — SCR-SEC-002 — User Management
```
Screen guard     : navigation to 'sec-users' requires canView = true
                   (sourced from PERM_USER_VIEW, CONFIRMED real
                   literal) -> canView = false: render <Unauthorized/>
                   in place of UsersPage for this switch case (FLAGGED
                   ADDITION per F4 — no guard exists in the Shell
                   today).

Permission-based UI behavior:
  canView    = false -> blocked at the switch-case level (see above)
  canCreate  = false -> "Add User" entry point not shown (PERM_USER_
                        CREATE, pattern-derived per RULE-SEC-047)
  canEdit    = false -> edit dialog fields read-only, save unavailable
                        (PERM_USER_UPDATE, pattern-derived)
  canDelete  = false -> delete action not shown (PERM_USER_DELETE,
                        pattern-derived)
  canApprove = n/a   -> no approval workflow on this screen

SEC-IMPL-RULE-2: all four flags above are loaded once at
  F2-SCREEN-INIT (SCR-SEC-002) and read from the Facade — never
  re-derived ad hoc inside a component.
SEC-IMPL-RULE-3: HTTP 403 from any of this screen's mutations (only
  API-SEC-012, assign-roles, has an explicit permission requirement —
  USER_MANAGE_ROLES) is caught and shown as a localized message via
  the PHASE F2 global 403 -> unauthorized-redirect route.

CROSS-SCREEN NOTE: this screen also launches UserProfileDrawer
  (SCR-SEC-006) and DataScopeDrawer (SCR-SEC-007) — each drawer's OWN
  SEC-FE block (below) governs its own guard, independent of
  SCR-SEC-002's canEdit/canDelete flags.
```

