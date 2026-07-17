import { Page, expect } from '@playwright/test';

export interface UserProfileFormData {
  userIdFk?: number;
  branchIdFk?: number;
  fullNameEn?: string;
  fullNameAr?: string;
  preferredLang?: string;
  employeeIdFk?: number;
}

/**
 * POM for /security/user-profiles (search), /create and /edit/:id — real
 * routes (unlike Users). `user-profile-entry.component.html` uses
 * `formControlName` WITHOUT an explicit `id` for the avl-input fields (CSS
 * fallback per the brief), and `branchIdFk`/`preferredLang` are plain
 * `avl-select` (native `<select>` internally, no `formControlName` — glued
 * manually via `[value]`/`(valueChange)`), in DOM order branch then
 * preferredLang, so `select` `.nth(0)`/`.nth(1)` addresses them.
 *
 * NOTE: as of this writing, `/security/user-profiles` and its sub-routes are
 * blocked for EVERY user (including SUPER_ADMIN) by a route-level
 * `permissionGuard` requiring `PERM_USER_PROFILE_VIEW`/`_CREATE`/`_UPDATE` —
 * none of those permissions exist yet in the `permissions` table (confirmed
 * via SELECT). See user-profiles.spec.ts's file header for the full story.
 * This POM is written against the real template so it's ready to use the
 * moment that DB gap is closed.
 */
export class UserProfilePage {
  constructor(private page: Page) {}

  async gotoList() {
    await this.page.goto('/security/user-profiles');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoCreate() {
    await this.page.goto('/security/user-profiles/create');
    await this.page.waitForSelector('avl-input[formcontrolname="fullNameEn"] input');
  }

  async gotoEdit(userId: number | string) {
    await this.page.goto(`/security/user-profiles/edit/${userId}`);
    await this.page.waitForSelector('avl-input[formcontrolname="fullNameEn"] input');
  }

  private get userIdInput() {
    return this.page.locator('avl-input[formcontrolname="userIdFk"] input');
  }
  private get fullNameEnInput() {
    return this.page.locator('avl-input[formcontrolname="fullNameEn"] input');
  }
  private get fullNameArInput() {
    return this.page.locator('avl-input[formcontrolname="fullNameAr"] input');
  }
  private get employeeIdInput() {
    return this.page.locator('avl-input[formcontrolname="employeeIdFk"] input');
  }
  /** Branch is the 1st `<select>` on the form, Preferred Language the 2nd
   *  (neither has `formControlName`/`id` — both are plain avl-select glued
   *  via (valueChange), not part of the ReactiveForm's DOM). */
  private get branchSelect() {
    return this.page.locator('select').nth(0);
  }
  private get preferredLangSelect() {
    return this.page.locator('select').nth(1);
  }

  async fillForm(data: UserProfileFormData) {
    if (data.userIdFk !== undefined) await this.userIdInput.fill(String(data.userIdFk));
    if (data.branchIdFk !== undefined) await this.branchSelect.selectOption(String(data.branchIdFk));
    if (data.preferredLang !== undefined) await this.preferredLangSelect.selectOption(data.preferredLang);
    if (data.fullNameEn !== undefined) await this.fullNameEnInput.fill(data.fullNameEn);
    if (data.fullNameAr !== undefined) await this.fullNameArInput.fill(data.fullNameAr);
    if (data.employeeIdFk !== undefined) await this.employeeIdInput.fill(String(data.employeeIdFk));
  }

  async save() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  row(userId: number | string) {
    return this.page.locator('.ag-center-cols-container .ag-row', { hasText: String(userId) });
  }

  async expectRowVisible(userId: number | string) {
    await expect(this.row(userId)).toBeVisible({ timeout: 10_000 });
  }

  async expectRedirectedToAccessDenied() {
    await expect(this.page).toHaveURL(/\/access-denied/, { timeout: 10_000 });
  }
}
