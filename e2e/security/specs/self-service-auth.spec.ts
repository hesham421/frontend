import * as fs from 'fs';
import * as path from 'path';
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
 * prior", already-used-token negatives): `account_activation_token`/
 * `password_reset_token` store the raw token in plaintext and are queryable, but this
 * Playwright harness has no Postgres client wired into the Node runtime itself (no
 * `pg` dependency, no support/db.ts) — so the token can't be read from inside the
 * spec at run time. Automated via the same filesystem-handoff + env-var pattern as
 * e2e-flows.spec.ts's TC-E2E-004/005: a first test/phase drives the signup/activate/
 * forgot-password step and writes state to a JSON file in the scratchpad dir; between
 * runs the real token is fetched with one `mcp__postgres__query` SELECT (done by the
 * test-execution agent) and passed in via an env var; the next phase reads the
 * handoff back and completes the flow. TC-SSA-014 (expired token) is the one
 * exception left genuinely unautomatable — it needs either a real 24h wait or a
 * short-TTL config override, neither available here.
 */
const HANDOFF_DIR = path.join(__dirname, '..', '..', '..', '.tmp-e2e-handoff');
fs.mkdirSync(HANDOFF_DIR, { recursive: true });
const HANDOFF_ACTIVATE = path.join(HANDOFF_DIR, 'ssa-activate.json');
const HANDOFF_FORGOT = path.join(HANDOFF_DIR, 'ssa-forgot.json');
const HANDOFF_RESET = path.join(HANDOFF_DIR, 'ssa-reset.json');

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

  test('TC-SSA-011 — Activate happy path', async ({ page, request }) => {
    // Two-phase, filesystem-handoff pattern (see file header): reuse the pending
    // signup across re-runs so a token fetched from a PRIOR run's DB row stays
    // valid for whichever run actually supplies it via env var.
    const existing = fs.existsSync(HANDOFF_ACTIVATE) ? JSON.parse(fs.readFileSync(HANDOFF_ACTIVATE, 'utf-8')) : null;
    const reuse = existing?.stage === 'signed-up';
    const username = reuse ? existing.username : pwtestUsername();
    const email = reuse ? existing.email : pwtestEmail();
    const password = 'password123';

    if (!reuse) {
      const signupRes = await request.post(`${SECURITY_API_URL}/api/auth/signup`, { data: { username, email, password } });
      expect(signupRes.status()).toBe(200);
      fs.writeFileSync(HANDOFF_ACTIVATE, JSON.stringify({ username, email, password, stage: 'signed-up' }));
    }

    test.skip(
      !process.env['PWTEST_SSA011_TOKEN'],
      'Supply PWTEST_SSA011_TOKEN from: ' +
        `SELECT token FROM account_activation_token WHERE user_id_fk = (SELECT users_pk FROM users WHERE username = '${username}') ` +
        'AND used_fl = 0 ORDER BY created_at DESC LIMIT 1; (then re-run this test)'
    );
    const token = process.env['PWTEST_SSA011_TOKEN']!;

    const signUp = new SignUpPage(page);
    await signUp.gotoActivation(token);
    await signUp.expectActivated();

    const loginRes = await request.post(`${SECURITY_API_URL}/api/auth/login-token`, { data: { username, password } });
    expect(loginRes.status()).toBe(200); // RULE-SEC-030: enabled flips 0->1 on activate

    // TC-SSA-013 reuses this now-consumed token to hit the already-used guard.
    fs.writeFileSync(HANDOFF_ACTIVATE, JSON.stringify({ username, email, password, token, stage: 'activated' }));
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

  test('TC-SSA-013 — Activate already-used token', async ({ request }) => {
    test.skip(!fs.existsSync(HANDOFF_ACTIVATE), 'Run TC-SSA-011 to completion first (need an already-consumed token).');
    const { token, stage } = JSON.parse(fs.readFileSync(HANDOFF_ACTIVATE, 'utf-8'));
    test.skip(stage !== 'activated', 'Run TC-SSA-011 to completion first (need an already-consumed token).');

    const res = await request.post(`${SECURITY_API_URL}/api/auth/signup/activate`, { data: { token } });
    expect(res.status()).toBe(400);
    const body = await res.json();
    console.log('TC-SSA-013 observed error.code:', body?.error?.code);
    if (body?.error?.code) expect(body.error.code).toBe('TOKEN_ALREADY_USED');
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

  test('TC-SSA-018 — Forgot Password: new token invalidates prior (RULE-SEC-039)', async ({ request }) => {
    // Needs an activated user with a real email — reuses TC-SSA-011's handoff'd account.
    test.skip(!fs.existsSync(HANDOFF_ACTIVATE), 'Run TC-SSA-011 to completion first (need an activated user).');
    const { email, stage } = JSON.parse(fs.readFileSync(HANDOFF_ACTIVATE, 'utf-8'));
    test.skip(stage !== 'activated', 'Run TC-SSA-011 to completion first (need an activated user).');

    const existingForgot = fs.existsSync(HANDOFF_FORGOT) ? JSON.parse(fs.readFileSync(HANDOFF_FORGOT, 'utf-8')) : null;
    if (!existingForgot || existingForgot.email !== email) {
      // First forgot-password call — issues reset-token-1.
      const first = await request.post(`${SECURITY_API_URL}/api/auth/forgot-password`, { data: { email } });
      expect(first.status()).toBe(200);
      fs.writeFileSync(HANDOFF_FORGOT, JSON.stringify({ email, stage: 'first-requested' }));
    }

    test.skip(
      !process.env['PWTEST_SSA018_FIRST_TOKEN'],
      'Supply PWTEST_SSA018_FIRST_TOKEN from: ' +
        `SELECT token FROM password_reset_token WHERE user_id_fk = (SELECT users_pk FROM users WHERE email = '${email}') ` +
        'AND used_fl = 0 ORDER BY created_at DESC LIMIT 1; (then re-run this test)'
    );
    const firstToken = process.env['PWTEST_SSA018_FIRST_TOKEN']!;

    // Second forgot-password call — issues reset-token-2 and flips token-1 to used_fl=1.
    const second = await request.post(`${SECURITY_API_URL}/api/auth/forgot-password`, { data: { email } });
    expect(second.status()).toBe(200);

    // Re-using the now-invalidated first token must fail.
    const resetRes = await request.post(`${SECURITY_API_URL}/api/auth/reset-password`, {
      data: { token: firstToken, newPassword: 'password456' }
    });
    expect(resetRes.status()).toBe(400);
    const body = await resetRes.json();
    console.log('TC-SSA-018 observed error.code:', body?.error?.code);
    if (body?.error?.code) expect(body.error.code).toBe('TOKEN_ALREADY_USED');
  });

  // ---------------------------------------------------------------------
  // Reset Password — DB-token-dependent happy path: SKIPPED (see file header)
  // ---------------------------------------------------------------------

  test('TC-SSA-019 — Reset Password happy path', async ({ request }) => {
    // Self-contained (its own signup/activate/forgot-password chain, own handoff file)
    // rather than reusing TC-SSA-011/018's account, so it doesn't depend on those tests'
    // run order or leave TC-SSA-021 fighting over the same reset token.
    const existing = fs.existsSync(HANDOFF_RESET) ? JSON.parse(fs.readFileSync(HANDOFF_RESET, 'utf-8')) : null;

    let username: string, email: string;
    if (!existing) {
      username = pwtestUsername();
      email = pwtestEmail();
      const signupRes = await request.post(`${SECURITY_API_URL}/api/auth/signup`, { data: { username, email, password: 'password123' } });
      expect(signupRes.status()).toBe(200);
      fs.writeFileSync(HANDOFF_RESET, JSON.stringify({ username, email, stage: 'signed-up' }));
      test.skip(
        true,
        'Supply PWTEST_SSA019_ACTIVATION_TOKEN from: ' +
          `SELECT token FROM account_activation_token WHERE user_id_fk = (SELECT users_pk FROM users WHERE username = '${username}') ` +
          'AND used_fl = 0 ORDER BY created_at DESC LIMIT 1; (then re-run this test)'
      );
      return;
    }
    ({ username, email } = existing);

    if (existing.stage === 'signed-up') {
      test.skip(
        !process.env['PWTEST_SSA019_ACTIVATION_TOKEN'],
        'Supply PWTEST_SSA019_ACTIVATION_TOKEN from: ' +
          `SELECT token FROM account_activation_token WHERE user_id_fk = (SELECT users_pk FROM users WHERE username = '${username}') ` +
          'AND used_fl = 0 ORDER BY created_at DESC LIMIT 1; (then re-run this test)'
      );
      const activateRes = await request.post(`${SECURITY_API_URL}/api/auth/signup/activate`, {
        data: { token: process.env['PWTEST_SSA019_ACTIVATION_TOKEN'] }
      });
      expect(activateRes.status()).toBeLessThan(300);

      const forgotRes = await request.post(`${SECURITY_API_URL}/api/auth/forgot-password`, { data: { email } });
      expect(forgotRes.status()).toBe(200);
      fs.writeFileSync(HANDOFF_RESET, JSON.stringify({ username, email, stage: 'reset-requested' }));
      test.skip(
        true,
        'Supply PWTEST_SSA019_RESET_TOKEN from: ' +
          `SELECT token FROM password_reset_token WHERE user_id_fk = (SELECT users_pk FROM users WHERE username = '${username}') ` +
          'AND used_fl = 0 ORDER BY created_at DESC LIMIT 1; (then re-run this test)'
      );
      return;
    }

    test.skip(
      !process.env['PWTEST_SSA019_RESET_TOKEN'],
      'Supply PWTEST_SSA019_RESET_TOKEN from: ' +
        `SELECT token FROM password_reset_token WHERE user_id_fk = (SELECT users_pk FROM users WHERE username = '${username}') ` +
        'AND used_fl = 0 ORDER BY created_at DESC LIMIT 1; (then re-run this test)'
    );
    const resetToken = process.env['PWTEST_SSA019_RESET_TOKEN']!;
    const newPassword = 'newpassword456';

    const resetRes = await request.post(`${SECURITY_API_URL}/api/auth/reset-password`, {
      data: { token: resetToken, newPassword }
    });
    expect(resetRes.status()).toBe(200);

    const oldLogin = await request.post(`${SECURITY_API_URL}/api/auth/login-token`, { data: { username, password: 'password123' } });
    expect(oldLogin.status()).toBe(401);

    const newLogin = await request.post(`${SECURITY_API_URL}/api/auth/login-token`, { data: { username, password: newPassword } });
    expect(newLogin.status()).toBe(200);

    // TC-SSA-021 reuses this now-consumed token to hit the already-used guard.
    fs.writeFileSync(HANDOFF_RESET, JSON.stringify({ username, email, resetToken, stage: 'reset-done' }));
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

  test('TC-SSA-021 — Reset Password already-used token', async ({ request }) => {
    test.skip(!fs.existsSync(HANDOFF_RESET), 'Run TC-SSA-019 to completion first (need an already-consumed reset token).');
    const { resetToken, stage } = JSON.parse(fs.readFileSync(HANDOFF_RESET, 'utf-8'));
    test.skip(stage !== 'reset-done', 'Run TC-SSA-019 to completion first (need an already-consumed reset token).');

    const res = await request.post(`${SECURITY_API_URL}/api/auth/reset-password`, {
      data: { token: resetToken, newPassword: 'yetanotherpassword789' }
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    console.log('TC-SSA-021 observed error.code:', body?.error?.code);
    if (body?.error?.code) expect(body.error.code).toBe('TOKEN_ALREADY_USED');
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
