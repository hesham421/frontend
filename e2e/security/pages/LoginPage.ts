import { Page, expect } from '@playwright/test';
import { forceEnglishLocale } from '../support/auth';

/** POM for /login (auth-login.component.html). Real ids exist (`#username`, `#password`). */
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    // App defaults to Arabic (LanguageService.DEFAULT_LANGUAGE) — force English so
    // text-based selectors (button names, titles) match what this suite expects.
    await forceEnglishLocale(this.page);
    await this.page.goto('/security/login');
    await this.page.waitForSelector('#username input, input#username', { timeout: 15000 });
  }

  private get usernameInput() {
    return this.page.locator('#username input, input#username').first();
  }

  private get passwordInput() {
    return this.page.locator('#password input, input#password').first();
  }

  private get submitButton() {
    return this.page.locator('button[type="submit"]');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectLoginError() {
    await expect(this.page.locator('.avl-login-main__error, [class*="avl-alert"]')).toBeVisible({ timeout: 10000 });
  }

  async expectOnDashboard() {
    await expect(this.page).toHaveURL(/dashboard/, { timeout: 15000 });
  }

  /** Opens the top-bar profile dropdown and clicks "Logout" (NAVIGATION.LOGOUT). */
  async logoutViaUi() {
    await this.page.locator('.header-user-profile .user-login-info').click();
    await this.page.getByTitle('Logout').click();
  }
}
