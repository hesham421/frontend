import { test, expect } from '@playwright/test';

/**
 * Phase 6b Step 0 — regression triage repro for:
 *  1. Login: request completes but navigation never happens.
 *  2. User Management: error appears, no data loads.
 *
 * Uses the real dev backend (http://localhost:7272) confirmed reachable
 * with seeded admin/admin123 credentials.
 */

test('login navigates to dashboard after successful submit', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push('PAGEERROR: ' + err.message));

  const responses: { url: string; status: number }[] = [];
  page.on('response', (res) => {
    responses.push({ url: res.url(), status: res.status() });
  });

  await page.goto('/security/login');
  await page.waitForSelector('input#username, avl-input#username input', { timeout: 15000 });

  // Fill via the real DOM input regardless of wrapper component
  const usernameInput = page.locator('#username input, input#username').first();
  const passwordInput = page.locator('#password input, input#password').first();
  await usernameInput.fill('admin');
  await passwordInput.fill('admin123');

  await page.click('button[type="submit"]');

  await page.waitForTimeout(3000);

  console.log('URL after submit:', page.url());
  console.log('Console errors:', JSON.stringify(consoleErrors, null, 2));
  console.log('Login-related responses:', JSON.stringify(responses.filter(r => r.url.includes('/api/auth')), null, 2));

  expect(page.url()).toContain('/dashboard');
});

test('user management screen loads data without error', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const responses: { url: string; status: number; body?: string }[] = [];
  page.on('response', async (res) => {
    if (res.url().includes('/api/users')) {
      let body = '';
      try { body = await res.text(); } catch { /* ignore */ }
      responses.push({ url: res.url(), status: res.status(), body });
    }
  });

  // Log in first
  await page.goto('/security/login');
  await page.waitForSelector('#username input, input#username', { timeout: 15000 });
  await page.locator('#username input, input#username').first().fill('admin');
  await page.locator('#password input, input#password').first().fill('admin123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  await page.goto('/security/users');
  await page.waitForTimeout(3000);

  console.log('URL:', page.url());
  console.log('Console errors:', JSON.stringify(consoleErrors, null, 2));
  console.log('User-search responses:', JSON.stringify(responses, null, 2));

  const bodyText = await page.textContent('body');
  console.log('Page contains error indicators:', bodyText?.includes('ERRORS.') || bodyText?.includes('error'));
});
