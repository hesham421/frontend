import { Page, expect } from '@playwright/test';
import { forceEnglishLocale } from '../support/auth';

/**
 * POM for /password-recovery (password-recovery.component.html). ONE route,
 * two steps: request form (default), reset form (`?token=...` present).
 *
 * Same selector situation as SignUpPage: formControlName only, CSS fallback
 * via `avl-input[formcontrolname="..."] input`.
 *
 * Reached with no session (guest route) — same Arabic-default issue as
 * SignUpPage; forceEnglishLocale() seeded before every navigation.
 */
export class PasswordRecoveryPage {
  constructor(private page: Page) {}

  async gotoRequest() {
    await forceEnglishLocale(this.page);
    await this.page.goto('/password-recovery');
    await this.page.waitForSelector('avl-input[formcontrolname="email"] input', { timeout: 15000 });
  }

  async gotoReset(token: string) {
    await forceEnglishLocale(this.page);
    await this.page.goto(`/password-recovery?token=${encodeURIComponent(token)}`);
    await this.page.waitForSelector('avl-input[formcontrolname="newPassword"] input', { timeout: 15000 });
  }

  private get emailInput() {
    return this.page.locator('avl-input[formcontrolname="email"] input');
  }

  private get newPasswordInput() {
    return this.page.locator('avl-input[formcontrolname="newPassword"] input');
  }

  private get confirmPasswordInput() {
    return this.page.locator('avl-input[formcontrolname="confirmPassword"] input');
  }

  private get sendResetLinkButton() {
    return this.page.getByRole('button', { name: 'Send Reset Link' });
  }

  private get resetPasswordButton() {
    return this.page.getByRole('button', { name: 'Reset Password', exact: true });
  }

  async submitRequest(email: string) {
    await this.emailInput.fill(email);
    await this.sendResetLinkButton.click();
  }

  async submitReset(newPassword: string, confirmPassword: string) {
    await this.newPasswordInput.fill(newPassword);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.resetPasswordButton.click();
  }

  /** RULE-SEC-038 anti-enumeration: identical success view whether or not the email exists. */
  async expectRequestSuccess() {
    await expect(this.page.getByText('Check Your Email')).toBeVisible({ timeout: 10000 });
  }

  async expectRequestError(): Promise<string> {
    const alert = this.page.locator('.alert-danger');
    await expect(alert).toBeVisible({ timeout: 10000 });
    return (await alert.textContent()) ?? '';
  }

  async expectResetSuccess() {
    await expect(this.page.getByText('Your password has been reset')).toBeVisible({ timeout: 10000 });
  }

  async expectResetError(): Promise<string> {
    const alert = this.page.locator('.alert-danger');
    await expect(alert).toBeVisible({ timeout: 10000 });
    return (await alert.textContent()) ?? '';
  }
}
