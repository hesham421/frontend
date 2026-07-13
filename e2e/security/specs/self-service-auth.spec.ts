import { test, expect } from '@playwright/test';
import { SignUpPage } from '../pages/SignUpPage';
import { PasswordRecoveryPage } from '../pages/PasswordRecoveryPage';
import { SECURITY_API_URL } from '../support/auth';

/**
 * Group 3 — Self-Service Auth (TC-SSA-001..024).
 *
 * Signup (`/sign-up`) and the password-recovery REQUEST step (`/password-recovery`,
 * step 1) are driven through the real UI via SignUpPage/PasswordRecoveryPage, since
 * those screens exist and are wired to the real endpoints (SignUpApiService /
 * ForgotPasswordApiService — see facades). `/forgot-password` is dead legacy
 * markup per the brief; not used anywhere here.
 *
 * All four /api/auth/** endpoints in this group are PUBLIC (no Bearer token) —
 * same convention as auth.spec.ts's TC-AUTH-001..005: boundary/exploratory/negative
 * cases hit the endpoint directly via the `request` fixture rather than
 * SecurityApiClient (which exists to attach an Authorization header these calls
 * don't need).
 *
 * DB-token-dependent happy paths (activate, reset-password, "new token invalidates
 * prior", already-used-token negatives): confirmed via manual mcp__postgres__query +
 * curl exploration during test authoring that `account_activation_token` /
 * `password_reset_token` store the raw token in plaintext and ARE queryable —
 * so the doc's "no DB/log access" assumption is only half true. However this
 * Playwright harness has no Postgres client wired into the Node runtime (no `pg`
 * dependency in package.json, no support/db.ts) — only the *authoring agent* can
 * read the token via the mcp__postgres__query tool, not the spec at test-run time.
 * Automating the true end-to-end happy path would require adding DB connectivity
 * to the e2e harness itself, which is new test infrastructure, not test-writing —
 * out of scope here. These are marked SKIPPED/DB_PRECONDITION below with what was
 * manually verified instead (all matched the doc exactly: enabled flips 0->1 on
 * activate, RULE-SEC-039 old-token invalidation confirmed, login with new password
 * succeeds / old password fails after reset).
 */

function uniqueId(): string {
  return `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function pwtestUsername(): string {
  return `pwtest_${uniqueId()}`;
}

function pwtestEmail(): string {
  return `pwtest_${uniqueId()}@example.com`;
}

/** Builds a username of exactly `len` characters, still starting with the pwtest_ prefix where it fits. */
function usernameOfLength(len: number): string {
  const base = `pwtest${uniqueId()}`;
  if (base.length >= len) return base.slice(0, len);
  return (base + 'x'.repeat(len - base.length)).slice(0, len);
}

/** Builds a syntactically-valid email of exactly `len` characters. */
function exactLengthEmail(len: number): string {
  const domain = '@example.com'; // 12 chars
  const localLen = len - domain.length;
  if (localLen < 1) throw new Error('length too short for a valid email shape');
  return 'a'.repeat(localLen) + domain;
}

test.describe('TC-SSA — Self-Service Auth', () => {
  // ---------------------------------------------------------------------
  // UI-driven: Signup (/sign-up)
  // ---------------------------------------------------------------------

  test('TC-SSA-001 — Signup happy path (UI)', async ({ page }) => {
    const signUp = new SignUpPage(page);
    await signUp.goto();
    const username = pwtestUsername();
    const email = pwtestEmail();
    await signUp.fillForm(username, email, 'password123');
    await signUp.submit();
    await signUp.expectCheckYourEmail();
    // DB validation (enabled === false / 0 per RULE-SEC-030) performed via
    // mcp__postgres__query by the authoring/execution agent outside this spec
    // (see report) — confirmed: users.enabled = 0 for the created row.
  });

  test('TC-SSA-002 — Signup duplicate username (UI)', async ({ page, request }) => {
    const username = pwtestUsername();
    const firstEmail = pwtestEmail();
    // Baseline user created via API (fast) — the thing under test is the UI's
    // handling of the *second*, colliding attempt.
    const baseline = await request.post(`${SECURITY_API_URL}/api/auth/signup`, {
      data: { username, email: firstEmail, password: 'password123' }
    });
    expect(baseline.status()).toBe(200);

    const signUp = new SignUpPage(page);
    await signUp.goto();
    await signUp.fillForm(username, pwtestEmail(), 'password123');
    await signUp.submit();
    const alertText = await signUp.expectSubmitError();
    expect(alertText).toContain('Username already in use');
  });

  test('TC-SSA-003 — Signup duplicate email (UI)', async ({ page, request }) => {
    const email = pwtestEmail();
    const baseline = await request.post(`${SECURITY_API_URL}/api/auth/signup`, {
      data: { username: pwtestUsername(), email, password: 'password123' }
    });
    expect(baseline.status()).toBe(200);

    const signUp = new SignUpPage(page);
    await signUp.goto();
    await signUp.fillForm(pwtestUsername(), email, 'password123');
    await signUp.submit();
    const alertText = await signUp.expectSubmitError();
    expect(alertText).toContain('Email address already in use');
  });

  // ---------------------------------------------------------------------
  // Boundary / exploratory: Signup, via direct API call (public endpoint,
  // no screen-specific behavior to verify beyond what 001-003 already cover)
  // ---------------------------------------------------------------------

  test('TC-SSA-004 — Signup username under minLength (2 chars)', async ({ request }) => {
    const res = await request.post(`${SECURITY_API_URL}/api/auth/signup`, {
      data: { username: 'ab', email: pwtestEmail(), password: 'password123' }
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  test('TC-SSA-005 — Signup username at maxLength (80 chars)', async ({ request }) => {
    const username = usernameOfLength(80);
    expect(username.length).toBe(80);
    const res = await request.post(`${SECURITY_API_URL}/api/auth/signup`, {
      data: { username, email: pwtestEmail(), password: 'password123' }
    });
    expect(res.status()).toBe(200);
  });

  test('TC-SSA-006 — Signup username over maxLength (81 chars)', async ({ request }) => {
    const username = usernameOfLength(81);
    expect(username.length).toBe(81);
    const res = await request.post(`${SECURITY_API_URL}/api/auth/signup`, {
      data: { username, email: pwtestEmail(), password: 'password123' }
    });
    expect(res.status()).toBe(400);
  });

  test('TC-SSA-007 — Signup password under minLength (5 chars)', async ({ request }) => {
    const res = await request.post(`${SECURITY_API_URL}/api/auth/signup`, {
      data: { username: pwtestUsername(), email: pwtestEmail(), password: 'abcde' }
    });
    expect(res.status()).toBe(400);
  });

  test('TC-SSA-008 — Signup email over maxLength (151 chars)', async ({ request }) => {
    const email = exactLengthEmail(151);
    expect(email.length).toBe(151);
    const res = await request.post(`${SECURITY_API_URL}/api/auth/signup`, {
      data: { username: pwtestUsername(), email, password: 'password123' }
    });
    expect(res.status()).toBe(400);
  });

  test('TC-SSA-009 — Signup omit required email (exploratory)', async ({ request }) => {
    const res = await request.post(`${SECURITY_API_URL}/api/auth/signup`, {
      data: { username: pwtestUsername(), password: 'password123' }
    });
    console.log('TC-SSA-009 observed status:', res.status());
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error.fieldErrors?.[0]?.field).toBe('email');
  });

  test('TC-SSA-010 — Signup malformed email format (exploratory)', async ({ request }) => {
    const res = await request.post(`${SECURITY_API_URL}/api/auth/signup`, {
      data: { username: pwtestUsername(), email: 'not-an-email', password: 'password123' }
    });
    console.log('TC-SSA-010 observed status:', res.status());
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error.fieldErrors?.[0]?.field).toBe('email');
  });

  // ---------------------------------------------------------------------
  // Activate — DB-token-dependent happy path: SKIPPED (see file header)
  // ---------------------------------------------------------------------

  test('TC-SSA-011 — Activate happy path — SKIPPED', async () => {
    test.skip(
      true,
      'DB_PRECONDITION: activation token only exists in account_activation_token, not returned by any API. ' +
        'e2e harness has no DB client wired in to read it at run time. Manually verified via mcp__postgres__query ' +
        '+ curl during authoring: token is plaintext/queryable, POST /api/auth/signup/activate flips users.enabled 0->1, ' +
        'subsequent login-token succeeds. Functionality confirmed correct; just not automatable in this harness as-is.'
    );
  });

  test('TC-SSA-012 — Activate invalid/unknown token (UI)', async ({ page }) => {
    const signUp = new SignUpPage(page);
    await signUp.gotoActivation('00000000-0000-0000-0000-000000000000');
    const errorText = await signUp.expectActivationFailed();
    // ACTIVATION_TOKEN_INVALID_OR_EXPIRED has no entry in ErpErrorMapperService's
    // code map (only SIGNUP_USERNAME/EMAIL_ALREADY_EXISTS are mapped) — the facade
    // falls back to the generic 'ERRORS.OPERATION_FAILED' key ("The operation failed.
    // Please try again."). Documenting as an undocumented-behavior finding: the user
    // sees a generic message instead of a specific "token invalid or expired" one.
    expect(errorText).toContain('The operation failed');
  });

  test('TC-SSA-013 — Activate already-used token — SKIPPED', async () => {
    test.skip(
      true,
      'DB_PRECONDITION: requires the real value of a token already consumed via TC-SSA-011-equivalent flow; ' +
        'same DB-read limitation as TC-SSA-011. Manually verified via curl: re-POSTing a consumed activation ' +
        'token returns 400 TOKEN_ALREADY_USED, matching the doc exactly.'
    );
  });

  test('TC-SSA-014 — Activate expired token — SKIPPED', async () => {
    test.skip(
      true,
      'DB_PRECONDITION: requires either waiting past the 24h activation-expiration-seconds default or a ' +
        'short-TTL test environment override, neither available here. Not automated.'
    );
  });

  test('TC-SSA-015 — Activate omit token field (exploratory)', async ({ request }) => {
    const res = await request.post(`${SECURITY_API_URL}/api/auth/signup/activate`, { data: {} });
    console.log('TC-SSA-015 observed status:', res.status());
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  // ---------------------------------------------------------------------
  // Forgot Password — request step, UI-driven
  // ---------------------------------------------------------------------

  test('TC-SSA-016 — Forgot Password existing email (UI)', async ({ page, request }) => {
    const email = pwtestEmail();
    const signupRes = await request.post(`${SECURITY_API_URL}/api/auth/signup`, {
      data: { username: pwtestUsername(), email, password: 'password123' }
    });
    expect(signupRes.status()).toBe(200);

    const recovery = new PasswordRecoveryPage(page);
    await recovery.gotoRequest();
    await recovery.submitRequest(email);
    await recovery.expectRequestSuccess();
  });

  test('TC-SSA-017 — Forgot Password nonexistent email (UI, anti-enumeration)', async ({ page, request }) => {
    // RULE-SEC-038: response must be identical in shape whether or not the email
    // exists. Assert both API responses (status + empty body) match, AND that the
    // UI renders the same success view for a nonexistent email as for an existing one.
    const existingEmail = pwtestEmail();
    await request.post(`${SECURITY_API_URL}/api/auth/signup`, {
      data: { username: pwtestUsername(), email: existingEmail, password: 'password123' }
    });

    const resExisting = await request.post(`${SECURITY_API_URL}/api/auth/forgot-password`, { data: { email: existingEmail } });
    const resNonexistent = await request.post(`${SECURITY_API_URL}/api/auth/forgot-password`, {
      data: { email: 'no_such_email_pwtest_xyz@example.com' }
    });
    expect(resExisting.status()).toBe(resNonexistent.status());
    expect(resExisting.status()).toBe(200);
    const bodyExisting = await resExisting.text();
    const bodyNonexistent = await resNonexistent.text();
    expect(bodyExisting).toBe(bodyNonexistent); // both empty

    const recovery = new PasswordRecoveryPage(page);
    await recovery.gotoRequest();
    await recovery.submitRequest('another_no_such_email_pwtest@example.com');
    await recovery.expectRequestSuccess(); // same "Check Your Email" view as TC-SSA-016
  });

  test('TC-SSA-018 — Forgot Password: new token invalidates prior (RULE-SEC-039) — SKIPPED', async () => {
    test.skip(
      true,
      'DB_PRECONDITION: requires reading the FIRST issued reset token value to attempt reusing it after the ' +
        'second forgot-password call, which needs DB access at run time (see file header). Manually verified via ' +
        'mcp__postgres__query + curl during authoring: calling forgot-password a second time immediately flips ' +
        'the prior password_reset_token row to used_fl=1, and re-POSTing that prior token to /api/auth/reset-password ' +
        'returns 400 TOKEN_ALREADY_USED — RULE-SEC-039 confirmed working exactly as documented.'
    );
  });

  // ---------------------------------------------------------------------
  // Reset Password — DB-token-dependent happy path: SKIPPED (see file header)
  // ---------------------------------------------------------------------

  test('TC-SSA-019 — Reset Password happy path — SKIPPED', async () => {
    test.skip(
      true,
      'DB_PRECONDITION: same DB-read limitation as TC-SSA-011/018. Manually verified via mcp__postgres__query + ' +
        'curl during authoring: valid reset token -> 200 empty body -> login with new password succeeds, login with ' +
        'old password returns 401 INVALID_CREDENTIALS. Functionality confirmed correct.'
    );
  });

  test('TC-SSA-020 — Reset Password invalid/unknown token (UI)', async ({ page }) => {
    const recovery = new PasswordRecoveryPage(page);
    await recovery.gotoReset('00000000-0000-0000-0000-000000000000');
    await recovery.submitReset('newpassword123', 'newpassword123');
    const errorText = await recovery.expectResetError();
    // Same mapper gap as TC-SSA-012: RESET_TOKEN_INVALID_OR_EXPIRED isn't in
    // ErpErrorMapperService's map either, so this also falls back to the generic
    // 'ERRORS.OPERATION_FAILED' text rather than a reset-specific message.
    expect(errorText).toContain('The operation failed');
  });

  test('TC-SSA-021 — Reset Password already-used token — SKIPPED', async () => {
    test.skip(
      true,
      'DB_PRECONDITION: requires the real value of an already-consumed reset token; same DB-read limitation as ' +
        'TC-SSA-011/018/019. Manually verified via curl during authoring: re-POSTing a consumed reset token returns ' +
        '400 TOKEN_ALREADY_USED, matching the doc exactly.'
    );
  });

  // Boundary cases below don't need a real token: confirmed via curl exploration
  // that @Valid bean validation on ResetPasswordRequest runs BEFORE any token
  // lookup — a bogus token + an invalid-length password returns 400 VALIDATION_ERROR
  // on `newPassword`, never a token error. So these isolate password-length
  // validation without needing DB access.
  test('TC-SSA-022 — Reset Password newPassword under minLength (5 chars)', async ({ request }) => {
    const res = await request.post(`${SECURITY_API_URL}/api/auth/reset-password`, {
      data: { token: '00000000-0000-0000-0000-000000000000', newPassword: 'abcde' }
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.fieldErrors?.[0]?.field).toBe('newPassword');
  });

  test('TC-SSA-023 — Reset Password newPassword over maxLength (121 chars)', async ({ request }) => {
    const res = await request.post(`${SECURITY_API_URL}/api/auth/reset-password`, {
      data: { token: '00000000-0000-0000-0000-000000000000', newPassword: 'a'.repeat(121) }
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.fieldErrors?.[0]?.field).toBe('newPassword');
  });

  // ---------------------------------------------------------------------
  // Rate limiting — exploratory, observe only (security-registry.md §5.8: only
  // login/signup are confirmed covered by LoginRateLimitFilter; forgot/reset are
  // "planned" per that doc, not confirmed shipped).
  // ---------------------------------------------------------------------

  test('TC-SSA-024 — Rate limiting on signup/login/forgot-password/reset-password (exploratory)', async ({ request }) => {
    const endpoints: Array<{ path: string; data: unknown }> = [
      { path: '/api/auth/login', data: { username: 'admin', password: 'wrong-rate-limit-probe' } },
      { path: '/api/auth/signup', data: { username: pwtestUsername(), email: pwtestEmail(), password: 'password123' } },
      { path: '/api/auth/forgot-password', data: { email: 'rate_limit_probe_pwtest@example.com' } },
      { path: '/api/auth/reset-password', data: { token: 'rate-limit-probe', newPassword: 'password123' } }
    ];

    for (const { path, data } of endpoints) {
      const statuses: number[] = [];
      for (let i = 0; i < 15; i++) {
        const res = await request.post(`${SECURITY_API_URL}${path}`, { data });
        statuses.push(res.status());
      }
      const saw429 = statuses.includes(429);
      console.log(`TC-SSA-024 [${path}] statuses:`, statuses.join(','), '-> 429 observed:', saw429);
      // Observational only — not asserting either way per the doc's exploratory framing.
    }
  });
});
