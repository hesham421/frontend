<!-- Source: PHASE:SEC-FE / SUB:SEC-FE-SCR-SEC-005 -->
<!-- Context: see SEC-FE-HEADER.md for phase-level strategy, registry table, and intro -->


### SEC-FE — SCR-SEC-005 — Page Registry
```
Screen guard     : navigation to 'sec-pages' requires canView = true.
                   PERM_* literal unconfirmed (OQ-SEC-FE-003).

Permission-based UI behavior:
  canView    = false -> blocked at the switch-case level
  canCreate  = false -> "Add Page" entry point not shown (real:
                        PAGE_CREATE required, confirmed literal)
  canEdit    = false -> edit drawer read-only, save unavailable (real:
                        PAGE_UPDATE required, confirmed literal)
  canDelete  = false -> deactivate action not shown (real: PAGE_DELETE
                        required for deactivate specifically — NOT
                        PAGE_UPDATE, confirmed literal, see F4/F2
                        notes under API-SEC-033); reactivate uses
                        PAGE_UPDATE (confirmed literal, API-SEC-032)
  canApprove = n/a

SEC-IMPL-RULE-2/3: this screen has the clearest real permission-key
  confirmation of the four registry screens (PAGE_VIEW/PAGE_CREATE/
  PAGE_UPDATE/PAGE_DELETE are all literal, confirmed authority names
  from pagemanagement.md — distinct from the still-unconfirmed
  PERM_PAGE_* frontend-gating literal used for the switch-case guard
  itself, which is a separate concept per the SEC-FE governance note
  above).
```

