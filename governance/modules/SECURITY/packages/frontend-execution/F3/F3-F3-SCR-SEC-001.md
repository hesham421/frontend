<!-- Source: PHASE:F3 / SUB:F3-SCR-SEC-001 -->
<!-- Context: see F3-HEADER.md for phase-level strategy, registry table, and intro -->


### F3 — SCR-SEC-001 — Authentication & Self-Service

### F3-VALIDATION — RULE-SEC-030 — Self-registered account disabled by default
```
RULE SOURCE:
  Statement  : The system MUST create self-registered accounts with
               enabled = false until activated
  Message-AR : حسابك قيد التفعيل — يرجى تأكيد بريدك الإلكتروني أولاً
  Message-EN : Your account is pending activation — please confirm
               your email first
  ERR-ID     : ERR-SEC-030 (synthetic, see governance gap note above)
  Scope      : post-signup display only
VALIDATION SPEC: not a form-input Zod rule — this is a POST-SUBMIT
  DISPLAY requirement on the Signup sub-form: after a successful
  SignupRequest (API-SEC-001), the UI must show ERR-SEC-030's message
  (not a generic "success" toast) and route the user toward the
  Activate sub-form/flow, not toward Login.
```

### F3-VALIDATION — RULE-SEC-032 — Activation/reset token validity
```
RULE SOURCE:
  Statement  : The system MUST reject activation/reset if the token is
               invalid, expired, or already used
  Message-AR : الرمز غير صالح أو منتهي الصلاحية
  Message-EN : Token is invalid or has expired
  ERR-ID     : ERR-SEC-032
  Scope      : Activate, Reset Password sub-forms
VALIDATION SPEC:
  Field            : token (both sub-forms)
  Validation type  : BUSINESS_RULE — cannot be checked client-side
                     (token opacity is intentional); surfaced via the
                     shared error mapper on the mutation's error
                     response (API-SEC-002 / API-SEC-003), routed per
                     PHASE F2 global error routing (400/401 -> see
                     note under API-SEC-001 on the auth-doc-generator
                     artifact; practically this is a business-rule
                     rejection -> toast, per the 409/422 fallback route
                     since no literal token-invalid HTTP code is
                     documented in authentication.md's structured
                     table)
  Evaluation timing : ON_SUBMIT only (server round-trip required)
```

### F3-VALIDATION — RULE-SEC-033 — Token single-use
```
RULE SOURCE:
  Statement  : The system MUST mark the token as used immediately on
               success and MUST reject any further use of the same
               token
  Message-AR : هذا الرمز مُستخدَم مسبقاً
  Message-EN : This token has already been used
  ERR-ID     : ERR-SEC-033
  Scope      : Activate, Reset Password sub-forms
VALIDATION SPEC:
  Field            : token
  Validation type  : BUSINESS_RULE — same handling as RULE-SEC-032
                     (server round-trip only); UX implication: once a
                     token-consuming mutation succeeds, the Facade must
                     not allow the same sub-form to be resubmitted with
                     the same token (disable the submit action after
                     success, not just after error)
  Evaluation timing : ON_SUBMIT only
```

### F3-VALIDATION — RULE-SEC-038 — Anti-enumeration on forgot-password
```
RULE SOURCE:
  Statement  : The system MUST return an identical response regardless
               of whether the submitted email exists
  Message-AR : إذا كان بريدك مسجَّلاً لدينا، ستصلك رسالة استعادة كلمة
               المرور
  Message-EN : If your email is registered, you will receive a
               password reset message
  ERR-ID     : ERR-SEC-038
  Scope      : Forgot Password sub-form
VALIDATION SPEC: not a rejection rule — this is a DISPLAY CONSTRAINT:
  the UI MUST show ERR-SEC-038's message on every successful
  ForgotPasswordRequest submission (API-SEC-008) and MUST NOT branch UI
  behavior on whether the email was found (there is nothing in the
  response to branch on — RULE-SEC-038 guarantees an identical
  response either way). Field-level: `email` itself is REQUIRED +
  well-formed email FORMAT (client-side format check only — existence
  is intentionally never revealed).
```

### F3-VALIDATION — RULE-SEC-040 — Username uniqueness on signup
```
RULE SOURCE:
  Statement  : The system MUST require globally unique username on
               signup
  Message-AR : اسم المستخدم مستخدَم بالفعل
  Message-EN : Username already exists
  ERR-ID     : ERR-SEC-040
  Scope      : CREATE (Signup sub-form only — srs.md B2/B5 note this
               source constant is SIGNUP_USERNAME_ALREADY_EXISTS,
               distinct from the admin-side user-creation path)
VALIDATION SPEC:
  Field            : username
  DB Column        : USERNAME (VARCHAR(80), UK_USERS_USERNAME)
  Validation type  : REQUIRED + LENGTH(3,80) (from SignupRequest's own
                     documented constraints) + UNIQUE_CHECK
  Zod primitive     : z.string().min(3).max(80)
  Evaluation timing : ON_BLUR (format/length) + ON_SUBMIT (uniqueness,
                     server round-trip — no client-side pre-check
                     endpoint exists)
```

### F3-VALIDATION — RULE-SEC-041 — Email uniqueness on signup
```
RULE SOURCE:
  Statement  : The system MUST require globally unique email on signup
  Message-AR : البريد الإلكتروني مستخدَم بالفعل
  Message-EN : Email already exists
  ERR-ID     : ERR-SEC-041
  Scope      : CREATE (Signup sub-form only)
VALIDATION SPEC:
  Field            : email
  DB Column        : EMAIL (VARCHAR(150), UK_USERS_EMAIL)
  Validation type  : REQUIRED + LENGTH(max 150) + FORMAT(email) +
                     UNIQUE_CHECK
  Zod primitive     : z.string().email().max(150)
  Evaluation timing : ON_BLUR (format/length) + ON_SUBMIT (uniqueness)
```

### F3-VALIDATION — RULE-SEC-050 — Rate limiting on auth endpoints
```
RULE SOURCE:
  Statement  : The system MUST block further attempts for the same
               ip|identifier key after a configured maximum within a
               configured lockout window, on login/signup/forgot-
               password/reset-password
  Message-AR : تجاوزت الحد المسموح من المحاولات — حاول لاحقاً
  Message-EN : Too many attempts — please try again later
  ERR-ID     : ERR-SEC-050
  Scope      : ALL 4 sub-forms (Login, Signup, Forgot Password, Reset
               Password)
VALIDATION SPEC: not a field-level rule — a RESPONSE-HANDLING
  requirement. GOVERNANCE GAP: neither authentication.md's structured
  error tables nor srs.md's rule entry states the literal HTTP status
  this filter returns (commonly 429, but not confirmed in the attached
  docs — HR-1: not assumed). This plan routes it through the generic
  business-error -> toast path (PHASE F2 global error routing) using
  ERR-SEC-050's message text, and flags the exact status code as
  unconfirmed rather than guessing 429 outright.
```

