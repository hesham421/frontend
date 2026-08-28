<!-- Source: PHASE:SEC-FE / SUB:SEC-FE-SCR-SEC-006 -->
<!-- Context: see SEC-FE-HEADER.md for phase-level strategy, registry table, and intro -->


### SEC-FE — SCR-SEC-006 — User Profile [AS-BUILT identity preserved]
```
Screen guard     : opening the drawer requires canView = true (real:
                   USER_PROFILE_VIEW, confirmed literal).

Permission-based UI behavior:
  canView    = false -> drawer open action not shown from SCR-SEC-002
  canEdit    = false -> all fields read-only, save unavailable (real:
                        USER_PROFILE_UPDATE, confirmed literal)
  canCreate  = false -> save blocked on the create-branch of the
                        composed saveProfile() operation (real:
                        USER_PROFILE_CREATE, confirmed literal) —
                        NOTE this is a THIRD distinct permission from
                        canEdit's USER_PROFILE_UPDATE, since create and
                        update are genuinely separate real endpoints
                        (API-SEC-040 vs API-SEC-038) with separate
                        permission requirements — the Facade's single
                        saveProfile() operation (F2) must check the
                        RIGHT one of the two depending on which branch
                        it takes, not a single canEdit flag for both
  canDelete  = n/a   -> confirmed no delete capability (isActiveFl
                        toggle via update stands in for it)
  canApprove = n/a

OQ-015 CARRYOVER (final repetition, security-layer completeness): none
  of these permission flags relate to allowedBranches[] enforcement —
  that gap remains entirely unaddressed by any layer of this plan,
  frontend or backend, and is not claimed to be here.
```

