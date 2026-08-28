<!-- Source: PHASE:F4 / SUB:F4-SCR-SEC-001 -->
<!-- Context: see F4-HEADER.md for phase-level strategy, registry table, and intro -->


### F4-SCREEN — SCR-SEC-001 — Authentication & Self-Service
```
Shell status     : UNCONFIRMED (0.2.1 / OQ-SEC-FE-001) — src/pages/
                   Login.tsx exists per ui-ux-spec.md ("already exists
                   — extend, do not replace") but is outside shell-
                   manifest-SECURITY.md's declared scope; its internal
                   structure (sub-form components, current guard
                   state) was not confirmed this session.
Screen key       : n/a — this screen is reached BEFORE the
                   isAuthenticated gate, not via a `currentScreen`
                   switch case (it IS what renders when
                   isAuthenticated is false)
Component file   : src/pages/Login.tsx (per ui-ux-spec.md; internal
                   sub-form breakdown UNCONFIRMED — do not invent
                   sub-component file paths beyond this one confirmed
                   entry file)
Guard            : n/a (this screen has no guard — it IS the
                   unauthenticated-state render path)
PERM_*           : none (pre-authentication)
COMPONENTS: UNCONFIRMED beyond the single Login.tsx entry file — this
  plan does not invent a file-per-sub-form breakdown (Signup.tsx,
  ActivateAccount.tsx, etc.) that no artifact confirms exists. If
  Login.tsx renders all 5 flows internally (single-file, tab/state-
  switched) or as separate files is unknown pending Shell confirmation
  (OQ-SEC-FE-001).
Facade Hook      : useAuthFacade() (F2-FACADE-HOOK SCR-SEC-001)
Shared UI imports: UNCONFIRMED (Shell state unknown)
```

