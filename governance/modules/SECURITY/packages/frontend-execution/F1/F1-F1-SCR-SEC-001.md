<!-- Source: PHASE:F1 / SUB:F1-SCR-SEC-001 -->
<!-- Context: see F1-HEADER.md for phase-level strategy, registry table, and intro -->


### F1-SCREEN — SCR-SEC-001 — Authentication & Self-Service

```
Shell status: UNCONFIRMED (see 0.2.1 — src/pages/Login.tsx is outside
shell-manifest-SECURITY.md's declared scope; no real component fields
were available to confirm against this session). Built from
flow-diagram.md / ui-ux-spec.md design intent per the CONTRACT-12
fallback for an ambiguous Shell state — carried as OQ-SEC-FE-001.

Entity model touched: ENTITY-SEC-001 (UserAccount) only, at the level
of individual real request/response DTOs already confirmed above
(AuthRequest, SignupRequest, ActivateAccountRequest,
ForgotPasswordRequest, ResetPasswordRequest, AuthResponse/UserInfo) —
these are plain per-form field sets, not a single shared screen model:
  Login          : username, password           -> AuthRequest / login-token
  Self-signup    : username, email, password     -> SignupRequest
  Activate       : token (from email link)       -> ActivateAccountRequest
  Forgot password: email                         -> ForgotPasswordRequest
  Reset password : token, newPassword             -> ResetPasswordRequest

No local Shell TS interface exists in-scope to confirm against. This
plan does NOT define a new Shell-facing model here beyond the request/
response shapes already given by the real API docs above — inventing a
richer local model for an unconfirmed screen would violate HR-1.
```

