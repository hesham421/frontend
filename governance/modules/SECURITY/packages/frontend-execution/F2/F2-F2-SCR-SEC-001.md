<!-- Source: PHASE:F2 / SUB:F2-SCR-SEC-001 -->
<!-- Context: see F2-HEADER.md for phase-level strategy, registry table, and intro -->


### F2 — SCR-SEC-001 — Authentication & Self-Service

```
Shell status: UNCONFIRMED (see 0.2.1 / F1-SCREEN SCR-SEC-001). The
request/response contracts below are sourced entirely from the real,
confirmed API docs (authentication.md) — only the Shell-side facade/
component wiring is unconfirmed, not the backend contracts themselves.
All 8 endpoints in this file are POST — there is no GET/list endpoint
on this screen, so there are no useQuery hooks here at all, only
useMutation hooks.
```

### F2-QUERY — API-SEC-001 — Self-registration sign up
```
HTTP method    : POST
Endpoint path  : /api/auth/signup
Request shape  : SignupRequest { username, email, password }
Response shape : SignupResponse { userId, username, enabled }
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline field errors (username/
                 email/password); 401 UNAUTHORIZED (global, see note*)
Invalidation   : none (no user is authenticated yet at signup)
Loading        : LOCAL
Caching        : n/a (mutation)
* NOTE carried once here for all SCR-SEC-001 blocks: authentication.md
  documents "Authentication Required (Bearer Authentication)" on every
  endpoint in this file, including signup/login themselves — a literal
  reading would be self-contradictory for pre-login flows. This is
  almost certainly an artifact of the auto-generator applying a
  blanket security-scheme annotation rather than a real per-endpoint
  auth requirement. Not silently resolved: flagged here as a doc-
  generation artifact, not corrected by inventing a "no-auth" flag that
  isn't in the source doc (HR-1) — F4/SEC-FE treat these 5 flows
  (signup, activate, reset-password, login, login-token, forgot-
  password) as pre-authentication by design intent (flow-diagram.md),
  not by literal doc field.
```

### F2-QUERY — API-SEC-002 — Activate a self-registered account
```
HTTP method    : POST
Endpoint path  : /api/auth/signup/activate
Request shape  : ActivateAccountRequest { token }
Response shape : 200 OK, no body documented
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 (see note above)
Invalidation   : none
Loading        : LOCAL
```

### F2-QUERY — API-SEC-003 — Reset password
```
HTTP method    : POST
Endpoint path  : /api/auth/reset-password
Request shape  : ResetPasswordRequest { token, newPassword }
Response shape : 200 OK, no body documented
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 (see note above)
Invalidation   : none
Loading        : LOCAL
```

### F2-QUERY — API-SEC-004 — Refresh access token
```
HTTP method    : POST
Endpoint path  : /api/auth/refresh
Request shape  : void (refresh token read from cookie, per description)
Response shape : AuthResponse { accessToken, expiresIn, refreshToken,
                 refreshExpiresIn }
Hook type      : useMutation
Errors         : 401 UNAUTHORIZED -> redirect to login (this is the one
                 SCR-SEC-001 call where 401 is a REAL, literal
                 expected outcome — an expired/invalid refresh token —
                 not the doc-generation artifact noted under API-001)
Invalidation   : none directly; a successful call updates the stored
                 access token used by every other authenticated call
Loading        : GLOBAL (blocks all other in-flight authenticated
                 calls until token refresh resolves — DRV-ID: standard
                 SPA refresh-token pattern, not stated verbatim in SRS,
                 inferred from AuthResponse shape + CORE-8 stack choice)
```

### F2-QUERY — API-SEC-005 — User logout
```
HTTP method    : POST
Endpoint path  : /api/auth/logout
Request shape  : void
Response shape : 204 No Content
Hook type      : useMutation
Errors         : 401 UNAUTHORIZED -> redirect to login (already logging
                 out, so this is effectively a no-op success path)
Invalidation   : entire query cache cleared on success (queryClient.
                 clear()) — DRV-ID: standard logout pattern, not
                 stated verbatim in SRS
Loading        : LOCAL
```

### F2-QUERY — API-SEC-006 — User login
```
HTTP method    : POST
Endpoint path  : /api/auth/login
Request shape  : AuthRequest { username, password }
Response shape : AuthResponse { accessToken, expiresIn, refreshToken,
                 refreshExpiresIn }
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 (see note under
                 API-001 — also plausibly a REAL bad-credentials
                 signal here, not just the doc-artifact; both readings
                 route to the same place in practice: inline/toast
                 "invalid credentials", not a redirect, since the user
                 is already on the login screen)
Invalidation   : none
Loading        : LOCAL
```

### F2-QUERY — API-SEC-007 — User login with complete user information
```
HTTP method    : POST
Endpoint path  : /api/auth/login-token
Request shape  : AuthRequest { username, password }
Response shape : UserInfo { accessToken, expiresIn, refreshToken,
                 refreshExpiresIn, userId, username, enabled, roles,
                 permissions }
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 (bad credentials,
                 same handling as API-SEC-006)
Invalidation   : none — but the response's `roles`/`permissions`
                 arrays are the intended source for client-side
                 permission gating (see SEC-FE phase) once this call
                 replaces or supplements API-SEC-006 in the real login
                 flow
Loading        : LOCAL
GOVERNANCE NOTE: two functionally overlapping login endpoints exist
(API-SEC-006 plain login, API-SEC-007 login-with-user-info). Neither
flow-diagram.md nor ui-ux-spec.md was read as specifying which one the
real Login.tsx calls (SCR-SEC-001 is Shell-UNCONFIRMED — OQ-SEC-FE-001).
This plan does not guess which one is wired up; F4 flags this as
something to confirm once Login.tsx's real state is available, and
recommends API-SEC-007 (login-token) as the better fit for CORE-8's
permission-gated routing model, since it returns roles/permissions in
one round trip.
```

### F2-QUERY — API-SEC-008 — Forgot password
```
HTTP method    : POST
Endpoint path  : /api/auth/forgot-password
Request shape  : ForgotPasswordRequest { email }
Response shape : 200 OK, no body documented
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 (see note under
                 API-001)
Invalidation   : none
Loading        : LOCAL
GOVERNANCE NOTE: endpoint description confirms RULE-SEC-038 (anti-
enumeration) — "Always returns a generic success response regardless
of whether the email exists." The UI must not attempt to distinguish
"email not found" from "email sent" — there is no such distinction to
surface, by design.
```

### F2-SCREEN-INIT — SCR-SEC-001 — Authentication & Self-Service
```
On mount: no permission hook (pre-authentication screen, not gated by
PERM_* — see SEC-FE phase). No LOV hooks. No entity-by-PK query (this
is not an Entry screen against a persisted record in the usual F1-ENTRY
sense — each sub-form posts directly).
Screen state (per sub-form, all local — UNCONFIRMED against real
component since Shell status is unconfirmed, built from flow-diagram.md
design intent per 0.2.1): activeSubForm ('login'|'signup'|'activate'|
'forgot'|'reset'), plus each sub-form's own field values.
```

### F2-FACADE-HOOK — SCR-SEC-001 — Authentication & Self-Service
```
Facade Hook name : useAuthFacade()
Composes         : useLoginMutation (API-SEC-006 or -007, see
                   governance note above — F4 to confirm), useSignup
                   Mutation (API-SEC-001), useActivateMutation
                   (API-SEC-002), useForgotPasswordMutation
                   (API-SEC-008), useResetPasswordMutation (API-SEC-
                   003), useRefreshMutation (API-SEC-004), useLogout
                   Mutation (API-SEC-005)
STATE OWNED: isAuthenticated (derived from stored access-token
  presence + validity — this is the Shell's existing single global
  gate per shell-manifest 0.2/Gaps: "one global isAuthenticated check
  in App.tsx"), isLoading (derived from the active mutation's own
  isLoading).
OPERATIONS EXPOSED: login(credentials), signup(data), activate(token),
  forgotPassword(email), resetPassword(token, newPassword), logout().
BOUNDARIES: components call this Facade only; this Facade composes the
  8 mutations above only.
```

