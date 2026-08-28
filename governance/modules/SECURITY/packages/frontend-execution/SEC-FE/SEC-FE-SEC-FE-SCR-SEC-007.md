<!-- Source: PHASE:SEC-FE / SUB:SEC-FE-SCR-SEC-007 -->
<!-- Context: see SEC-FE-HEADER.md for phase-level strategy, registry table, and intro -->


### SEC-FE — SCR-SEC-007 — Role Data Scope (Branch Assignment)
```
Screen guard     : opening the drawer requires canView = true (real:
                   ROLE_VIEW, confirmed literal — reused from the Role
                   entity's own permission family, per the F4 note
                   that this screen has no PERM_DATASCOPE_* family of
                   its own).

Permission-based UI behavior:
  canView    = false -> drawer open action not shown from either
                        launching screen
  canCreate  = false -> save blocked on the create branch (real:
                        ROLE_CREATE, confirmed literal)
  canEdit    = false -> data access level field read-only, save
                        unavailable on the update branch (real:
                        ROLE_UPDATE, confirmed literal)
  canDelete  = false -> conditional delete button not shown (real:
                        ROLE_DELETE, confirmed literal)
  canApprove = n/a

OQ-015 CARRYOVER (final repetition): same as SCR-SEC-006 — this is the
  screen most likely to be mistaken for actual data-scope enforcement;
  it is configuration UI only, gated by ordinary CRUD permissions, not
  a data-filtering mechanism.
```

