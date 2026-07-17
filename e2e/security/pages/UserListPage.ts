import { Page, expect } from '@playwright/test';

export interface UserFormData {
  username: string;
  password?: string;
  enabled?: boolean;
}

/**
 * POM for /security/users (search grid) AND its create/edit drawer +
 * inline roles dual-list modal — there is no separate route/form page
 * (user-list.component.ts opens both via DrawerService templates), so all
 * drawer interactions live on this one POM per the brief.
 */
export class UserListPage {
  constructor(private page: Page) {}

  async gotoList() {
    await this.page.goto('/security/users');
    await this.page.waitForLoadState('networkidle');
  }

  // ---- Create/Edit drawer ----
  async openCreateDrawer() {
    await this.page.getByRole('button', { name: 'Add User' }).click();
    await this.page.waitForSelector('#username input');
  }

  /** Row's Edit icon-button (aria-label "Edit") opens the same drawer, prefilled.
   *  Sorts newest-first (see `sortNewestFirst`) so this works regardless of
   *  the target row's page position. */
  async openEditDrawer(username: string) {
    await this.sortNewestFirst();
    await this.row(username).getByRole('button', { name: 'Edit' }).click();
    await this.page.waitForSelector('#username input');
  }

  private get usernameInput() {
    return this.page.locator('#username input');
  }
  private get passwordInput() {
    return this.page.locator('#password input');
  }
  private get enabledSwitch() {
    return this.page.locator('#enabled input');
  }

  async fillForm(data: UserFormData) {
    if (data.username !== undefined) await this.usernameInput.fill(data.username);
    if (data.password !== undefined) await this.passwordInput.fill(data.password);
    if (data.enabled !== undefined) {
      // Neither a plain click (blocked by the sibling `.avl-switch__thumb`
      // "intercepting pointer events") nor a forced click/setChecked (the
      // real `<input>` sits fully outside the viewport — this design hides
      // the native checkbox entirely and renders the track/thumb as its
      // visual stand-in, a common accessible-custom-checkbox CSS pattern)
      // can reach this element through normal pointer interaction. Set the
      // DOM state directly and fire the exact `change` event Angular's
      // `(change)="onToggle($event)"` listens for — equivalent end effect to
      // a real click, without depending on geometry/visibility at all.
      await this.enabledSwitch.evaluate((el: HTMLInputElement, checked: boolean) => {
        el.checked = checked;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, data.enabled);
      await expect(this.enabledSwitch).toBeChecked({ checked: data.enabled });
    }
  }

  async save() {
    await this.page.getByRole('button', { name: /^(Save|Update)$/ }).click();
  }

  async dismissDrawer() {
    await this.page.locator('.modal-header .btn-close').click();
  }

  /** Scoped to `.avl-alert--danger` specifically — `.modal-body [class*="avl-alert"]`
   *  alone over-matches: the roles section's permission-notice info alert
   *  (`erpPermission="!ROLE.VIEW"`) and the alert's own child `.avl-alert__icon`/
   *  `.avl-alert__body` nodes also carry an `avl-alert*` class. */
  async expectFormError(pattern: RegExp | string) {
    await expect(this.page.locator('.modal-body .avl-alert--danger').first()).toContainText(pattern);
  }

  // ---- Roles dual-list modal (opened from inside the create/edit drawer) ----
  async openRolesPicker() {
    await this.page.getByRole('button', { name: /Select Roles/ }).click();
    await this.page.waitForSelector('.erp-dual-list');
  }

  /** Moves a role (matched by its code, shown as the item label/secondary label
   *  since PWTEST_ role codes have no ROLES.<code> i18n key — formatRoleName()
   *  falls back to the raw code) from Available to Selected. */
  async addRole(roleCode: string) {
    await this.page.locator('.erp-dual-list-panel', { hasText: 'Available Roles' })
      .locator('.erp-dual-list-item', { hasText: roleCode })
      .click();
    await this.page.getByRole('button', { name: 'Add selected' }).click();
  }

  async removeRole(roleCode: string) {
    await this.page.locator('.erp-dual-list-panel', { hasText: 'Selected Roles' })
      .locator('.erp-dual-list-item', { hasText: roleCode })
      .click();
    await this.page.getByRole('button', { name: 'Remove selected' }).click();
  }

  async removeAllRolesInPicker() {
    await this.page.getByRole('button', { name: 'Remove all' }).click();
  }

  async closeRolesPicker() {
    await this.page.getByRole('button', { name: 'Done' }).click();
  }

  /** Quick-remove chip on the main drawer (badge with an "x", no picker needed). */
  async quickRemoveRoleChip(roleCode: string) {
    await this.page.locator('avl-badge', { hasText: roleCode }).click();
  }

  // ---- List / rows ----
  row(username: string) {
    return this.page.locator('.ag-center-cols-container .ag-row', { hasText: username });
  }

  /** Grid default-sorts ascending by `id` with a 20-row page — a freshly
   *  created user (highest id) can land past page 1 once the table has more
   *  than one page of rows (this dev DB accumulates PWTEST rows across many
   *  concurrent E2E runs). Two other approaches were tried and abandoned —
   *  see the CONTRACT_BREAK finding in users.spec.ts's file header:
   *    1. AG Grid's own floating-filter row — DOM selector proved unreliable.
   *    2. The real "Advanced Filters" panel (erp-specification-filter) — this
   *       is a GENUINE, LIVE, VERIFIED BUG: `UserFacade
   *       .convertSpecFiltersToSearchFilters()` builds `{field, op, value}`
   *       (key `op`), but `/api/users/search`'s real contract needs `operator`
   *       — confirmed via curl: `{"field":"username","op":"LIKE",...}` 400s
   *       with `INVALID_JSON` because this backend enforces
   *       `spring.jackson.deserialization.fail-on-unknown-properties=true`
   *       globally. The Advanced Filters feature on THIS screen is broken for
   *       every user of the real app, not just this test.
   *  Sorting the `id` column to descending (clicking its header, a plain
   *  client-triggered `sortBy`/`sortDir` request — a code path that never
   *  touches the broken filter conversion) reliably puts the newest row on
   *  page 1 instead, sidestepping both issues entirely. */
  async sortNewestFirst() {
    // `[col-id="id"]` alone matches BOTH the real sortable header cell
    // (role=columnheader) AND the floating-filter row's cell for the same
    // column (role=gridcell) — scope to the header row via role.
    const header = this.page.getByRole('columnheader', { name: 'ID' });
    for (let attempt = 0; attempt < 3; attempt++) {
      if ((await header.getAttribute('aria-sort')) === 'descending') return;
      const searchRes = this.page
        .waitForResponse((r) => r.url().includes('/api/users/search') && r.request().method() === 'POST', {
          timeout: 15_000
        })
        .catch(() => null);
      await header.click();
      await searchRes;
    }
  }

  async expectRowVisible(username: string) {
    await this.sortNewestFirst();
    await expect(this.row(username)).toBeVisible({ timeout: 10_000 });
  }

  async expectRowNotVisible(username: string) {
    await this.sortNewestFirst();
    await expect(this.row(username)).toHaveCount(0);
  }

  async clickDelete(username: string) {
    await this.sortNewestFirst();
    await this.row(username).getByRole('button', { name: 'Delete' }).click();
  }

  /** Confirms the ErpDialogService confirmation dialog (title "Confirm Delete",
   *  confirm button text "Delete" per COMMON.DELETE). */
  async confirmDeleteDialog() {
    await this.page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  }
}
