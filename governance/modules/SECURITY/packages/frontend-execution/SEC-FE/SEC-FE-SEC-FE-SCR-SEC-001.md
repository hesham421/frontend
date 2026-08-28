<!-- Source: PHASE:SEC-FE / SUB:SEC-FE-SCR-SEC-001 -->
<!-- Context: see SEC-FE-HEADER.md for phase-level strategy, registry table, and intro -->


### SEC-FE — SCR-SEC-001 — Authentication & Self-Service
```
Screen guard     : n/a — this screen IS the unauthenticated state; it
                   has no canView gate of its own (everyone reaches it
                   when isAuthenticated is false).
Permission-based UI behavior: n/a — no permission-gated fields/actions
  exist pre-authentication.
EXCEPTION module scope: SCR-SEC-001's own Shell status is UNCONFIRMED
  (OQ-SEC-FE-001) — this block cannot confirm real guard code either;
  documented as n/a-by-design (pre-auth) rather than "missing."
```

