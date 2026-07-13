import { Page, expect } from '@playwright/test';
import { forceEnglishLocale } from '../support/auth';

/**
 * POM for /sign-up (sign-up.component.html). ONE route, two states:
 *  - default: the signup form
 *  - `?token=...` present: activation step (auto-triggers facade.activate() in the
 *    component constructor — no button to click, just navigate and wait).
 *
 * Selectors: no data-testid / id on these fields (formControlName only, no
 * matching `id`/`for`), per the brief's selector-strategy tier 3 — CSS fallback
 * via `avl-input[formcontrolname="..."] input`.
 *
 * Reached with no session (guest route) — LanguageService defaults to Arabic
 * (DEFAULT_LANGUAGE = 'ar'), which breaks every text-based selector here
 * (button names, "Check Your Email", etc.). forceEnglishLocale() is seeded
 * before every navigation so this doesn't silently time out.
 */
export class SignUpPage {
  constructor(private page: Page) {}

  async goto() {
    await forceEnglishLocale(this.page);
    await this.page.goto('/sign-up');
    await this.page.waitForSelector('avl-input[formcontrolname="username"] input', { timeout: 15000 });
  }

  /** Navigates straight to the activation step (emailed-link simulation). */
  async gotoActivation(token: string) {
    await forceEnglishLocale(this.page);
    await this.page.goto(`/sign-up?token=${encodeURIComponent(token)}`);
  }

  private get usernameInput() {
    return this.page.locator('avl-input[formcontrolname="username"] input');
  }

  private get emailInput() {
    return this.page.locator('avl-input[formcontrolname="email"] input');
  }

  private get passwordInput() {
    return this.page.locator('avl-input[formcontrolname="password"] input');
  }

  private get submitButton() {
    return this.page.getByRole('button', { name: 'Create Account' });
  }

  async fillForm(username: string, email: string, password: string) {
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  /** Post-submit success state: "Check Your Email" (account created, disabled pending activation). */
  async expectCheckYourEmail() {
    await expect(this.page.getByText('Check Your Email')).toBeVisible({ timeout: 10000 });
  }

  /** Inline alert-danger shown above the form on a submit-time backend error (e.g. duplicate username/email). */
  async expectSubmitError(): Promise<string> {
    const alert = this.page.locator('.alert-danger');
    await expect(alert).toBeVisible({ timeout: 10000 });
    return (await alert.textContent()) ?? '';
  }

  /** Activation step: success ("Account Activated"). */
  async expectActivated() {
    await expect(this.page.getByText('Account Activated')).toBeVisible({ timeout: 10000 });
  }

  /** Activation step: failure ("Activation Failed" + mapped error message). */
  async expectActivationFailed(): Promise<string> {
    await expect(this.page.getByText('Activation Failed')).toBeVisible({ timeout: 10000 });
    const hint = this.page.locator('.text-muted.mb-3');
    return (await hint.textContent()) ?? '';
  }
}
