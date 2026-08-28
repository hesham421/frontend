<!-- Source: PHASE:SEC-FE / SUB:SEC-FE-SCR-SEC-004 -->
<!-- Context: see SEC-FE-HEADER.md for phase-level strategy, registry table, and intro -->


### SEC-FE — SCR-SEC-004 — Permission Registry
```
Screen guard     : navigation to 'sec-permissions' requires canView =
                   true. PERM_* literal unconfirmed (OQ-SEC-FE-003).

Permission-based UI behavior:
  canView    = false -> blocked at the switch-case level
  canCreate  = false -> "Add Permission" entry point not shown
  canEdit    = false -> edit dialog's `name` field (the only writable
                        field, per API-SEC-027) read-only, save
                        unavailable
  canDelete  = n/a   -> confirmed no delete capability exists in the
                        real API at all (F1-MODEL ENTITY-SEC-003) —
                        this is not a permission-gated absence, it is
                        a structural one; do not conflate the two
  canApprove = n/a

SEC-IMPL-RULE-3: API-SEC-029 (search) is the only endpoint in this
  file with an explicit permission requirement (PERMISSION_VIEW);
  API-SEC-027/028 (update/create) carry no documented permission
  annotation at all in permissionmanagement.md — flagged here as a
  real, confirmed asymmetry (search is gated, write is not, per the
  doc) rather than assumed to be an oversight this plan should paper
  over.
```

