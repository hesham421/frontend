import { Page, Locator, expect } from '@playwright/test';

/**
 * POM for /security/role-access (list) + /security/role-access/create +
 * /security/role-access/edit/:roleId (role-access-form.component.html).
 *
 * Selector strategy per the shared brief: this screen has real `data-testid`
 * attributes (use them for every button/select that has one). The role
 * name/description inputs use `formControlName` WITHOUT an `id`, so they
 * fall back to the CSS anchor `avl-input[formcontrolname="..."] input`
 * (Emulated view encapsulation keeps the custom element in light DOM).
 *
 * Two overlay families are involved, distinguished by CDK `panelClass`
 * (see DialogService/DrawerService):
 *  - Dialog (Copy From / Assign Branch / confirm prompts): `.avl-dialog-overlay-pane`
 *  - Drawer (Add Page dual-list):                          `.avl-drawer-overlay-pane`
 */
export class RoleAccessPage {
  constructor(private page: Page) {}

  // ───────────────────── List screen ─────────────────────

  async gotoList() {
    await this.page.goto('/security/role-access');
    await this.page.waitForLoadState('networkidle');
  }

  get addRoleButton(): Locator {
    return this.page.getByTestId('role-access-add-role');
  }

  get refreshButton(): Locator {
    return this.page.getByTestId('role-access-refresh');
  }

  /**
   * Narrows the grid to rows matching `name` via the real Advanced Filters panel
   * (erp-specification-filter) — needed because the environment accumulates dozens of
   * PWTEST_* roles and the grid's default page size (20, sorted by roleName ASC) can
   * push a freshly created row off the first page.
   *
   * FINDING: the filter row's Field <select> does NOT default to 'search' — SpecificationFilterComponent's
   * `rows` field initializer runs before Angular binds the `availableFields` @Input, so
   * `createRow()` sees an empty array and sets `field: ''`. An untouched row's field stays ''
   * forever (nothing re-derives it later), and `toSpecFilters()` drops any row with a falsy
   * `field` — so simply typing into the value box and clicking Apply silently sends `filters: []`.
   * The Field dropdown must be explicitly set to 'search' first.
   */
  async filterByRoleName(name: string) {
    const toggle = this.page.getByRole('button', { name: /Advanced Filters|Hide Filters/ });
    if ((await toggle.textContent())?.includes('Advanced Filters')) {
      await toggle.click();
    }
    const filterRow = this.page.locator('erp-specification-filter .row.g-2').first();
    await filterRow.locator('.col-md-4').nth(0).locator('select').selectOption('search');
    await filterRow.locator('.col-md-4').nth(1).locator('input').fill(name);

    const searchRes = this.page.waitForResponse(
      (r) => r.url().includes('/api/roles/search') && r.request().method() === 'POST'
    );
    await this.page.getByRole('button', { name: 'Apply' }).click();
    await searchRes;
  }

  row(roleName: string): Locator {
    return this.page.locator('.ag-center-cols-container .ag-row', { hasText: roleName });
  }

  async expectRowVisible(roleName: string) {
    await expect(this.row(roleName)).toBeVisible({ timeout: 10000 });
  }

  async expectRowNotVisible(roleName: string) {
    await expect(this.row(roleName)).toHaveCount(0);
  }

  /**
   * FINDING: role-access-grid.config.ts pins the Actions column `pinned: 'right'` — AG Grid
   * renders pinned columns in a SEPARATE DOM container (`.ag-pinned-right-cols-container`) from
   * the scrollable center columns (`.ag-center-cols-container`, where Role Name/Status live), one
   * `.ag-row` per container per logical row. `row()` (scoped to the center container, matching the
   * brief's generic AG Grid guidance) finds the role by name but never contains the Edit/Toggle/
   * Delete buttons — they live in the pinned-right row with the same `row-index` attribute. Bridge
   * the two via that shared attribute rather than clicking inside `row()` directly.
   */
  private async actionsRow(roleName: string): Promise<Locator> {
    const rowIndex = await this.row(roleName).getAttribute('row-index');
    if (rowIndex === null) {
      throw new Error(`RoleAccessPage.actionsRow: no grid row found for "${roleName}"`);
    }
    return this.page.locator(`.ag-pinned-right-cols-container .ag-row[row-index="${rowIndex}"]`);
  }

  async clickEditRow(roleName: string) {
    await (await this.actionsRow(roleName)).getByRole('button', { name: 'Edit' }).click();
  }

  async clickToggleActiveRow(roleName: string) {
    await (await this.actionsRow(roleName)).getByRole('button', { name: /Deactivate|Activate/ }).click();
  }

  async clickDeleteRow(roleName: string) {
    await (await this.actionsRow(roleName)).getByRole('button', { name: 'Delete' }).click();
  }

  // ───────────────────── Confirm dialog (ErpDialogService) ─────────────────────

  private get dialogPane(): Locator {
    return this.page.locator('.avl-dialog-overlay-pane');
  }

  /** Clicks the confirm button inside whichever confirm-dialog is currently open. */
  async confirmDialog(buttonName: string | RegExp) {
    await this.dialogPane.getByRole('button', { name: buttonName }).click();
  }

  // ───────────────────── Create / Edit form ─────────────────────

  async gotoCreate() {
    await this.page.goto('/security/role-access/create');
    await this.page.waitForSelector('avl-input[formcontrolname="name"] input');
  }

  async gotoEdit(roleId: number | string) {
    await this.page.goto(`/security/role-access/edit/${roleId}`);
    await this.page.waitForSelector('[role="tablist"]');
  }

  get nameInput(): Locator {
    return this.page.locator('avl-input[formcontrolname="name"] input');
  }

  get descriptionInput(): Locator {
    return this.page.locator('avl-input[formcontrolname="description"] input');
  }

  get activeSwitchInput(): Locator {
    return this.page.locator('avl-switch input[type="checkbox"]');
  }

  get createRoleButton(): Locator {
    return this.page.getByTestId('role-access-create-role');
  }

  get saveButton(): Locator {
    return this.page.getByRole('button', { name: 'Save' });
  }

  async fillCreateForm(data: { name: string; description?: string }) {
    await this.nameInput.fill(data.name);
    if (data.description !== undefined) {
      await this.descriptionInput.fill(data.description);
    }
  }

  // ───────────────────── Tabs (edit mode only) ─────────────────────

  get pagesTab(): Locator {
    return this.page.getByRole('tab', { name: 'Pages Access' });
  }

  get branchScopeTab(): Locator {
    return this.page.getByRole('tab', { name: 'Branch Scope' });
  }

  async switchToBranchScopeTab() {
    await this.branchScopeTab.click();
  }

  async switchToPagesTab() {
    await this.pagesTab.click();
  }

  // ───────────────────── Pages tab ─────────────────────

  get addPageButton(): Locator {
    return this.page.getByTestId('role-access-add-page');
  }

  get copyFromButton(): Locator {
    return this.page.getByTestId('role-access-copy-from');
  }

  pageRow(pageCode: string): Locator {
    return this.page.locator('tbody tr', { hasText: pageCode });
  }

  async expectPageRowVisible(pageCode: string) {
    await expect(this.pageRow(pageCode)).toBeVisible({ timeout: 10000 });
  }

  async removePageRow(pageCode: string) {
    await this.pageRow(pageCode).getByRole('button', { name: 'Remove' }).click();
  }

  /** Checkbox columns, in template order: Create(1) / Update(2) / Delete(3) / All(4). */
  private pageRowCheckbox(pageCode: string, columnIndex: 1 | 2 | 3 | 4): Locator {
    return this.pageRow(pageCode).locator('td').nth(columnIndex).locator('input[type="checkbox"]');
  }

  async toggleCreatePermission(pageCode: string) {
    await this.pageRowCheckbox(pageCode, 1).click();
  }

  async toggleUpdatePermission(pageCode: string) {
    await this.pageRowCheckbox(pageCode, 2).click();
  }

  async toggleDeletePermission(pageCode: string) {
    await this.pageRowCheckbox(pageCode, 3).click();
  }

  // ---- Add Pages modal (Drawer, `.avl-drawer-overlay-pane`, erp-dual-list) ----

  private get drawerPane(): Locator {
    return this.page.locator('.avl-drawer-overlay-pane');
  }

  async selectAvailablePageByLabel(label: string) {
    await this.drawerPane.getByRole('option', { name: new RegExp(label) }).first().click();
  }

  /**
   * Moves the currently-selected "available" item(s) into the "selected" panel (client-side
   * only). `exact: true` disambiguates this dual-list transfer icon-button ("Add selected")
   * from the drawer's own primary submit button ("Add Selected") — Playwright's default
   * role-name matching is case-insensitive, so the two collide without it.
   */
  async moveSelectedPagesToSelectedPanel() {
    await this.drawerPane.getByRole('button', { name: 'Add selected', exact: true }).click();
  }

  /** Submits the dual-list selection — POSTs each page via addRolePages. */
  async confirmAddSelectedPages() {
    await this.page.getByTestId('role-access-add-selected-pages').click();
  }

  /** Convenience: open modal already assumed open, pick a page by its nameEn label, add it. */
  async addPageViaModal(pageLabel: string) {
    await this.selectAvailablePageByLabel(pageLabel);
    await this.moveSelectedPagesToSelectedPanel();
    await this.confirmAddSelectedPages();
  }

  // ---- Copy From modal (Dialog, `.avl-dialog-overlay-pane`) ----

  async selectCopySourceRole(roleName: string) {
    // data-testid sits on the <avl-select> custom host element — the actual
    // selectable control is its inner native <select>.
    await this.page.getByTestId('role-access-copy-source').locator('select').selectOption({ label: roleName });
  }

  async confirmCopyFrom() {
    await this.page.getByTestId('role-access-copy-confirm').click();
  }

  // ───────────────────── Branch scope tab ─────────────────────

  get assignBranchButton(): Locator {
    return this.page.getByTestId('role-access-assign-branch');
  }

  branchRow(branchLabel: string): Locator {
    return this.page.locator('tbody tr', { hasText: branchLabel });
  }

  async expectBranchRowVisible(branchLabel: string) {
    await expect(this.branchRow(branchLabel)).toBeVisible({ timeout: 10000 });
  }

  async removeBranchRow(branchLabel: string) {
    await this.branchRow(branchLabel).getByRole('button', { name: 'Remove' }).click();
  }

  /** The row's own dataAccessLevel <select> (native `avl-select`, no id — target via row scope). */
  branchRowLevelSelect(branchLabel: string): Locator {
    return this.branchRow(branchLabel).locator('select');
  }

  async changeBranchRowLevel(branchLabel: string, level: string) {
    await this.branchRowLevelSelect(branchLabel).selectOption(level);
  }

  // ---- Assign Branch modal (Dialog, `.avl-dialog-overlay-pane`) ----

  async selectAssignBranch(branchLabel: string) {
    await this.page.getByTestId('role-access-assign-branch-select').locator('select').selectOption({ label: branchLabel });
  }

  async selectAssignLevel(level: string) {
    await this.page.getByTestId('role-access-assign-branch-level').locator('select').selectOption(level);
  }

  async confirmAssignBranch() {
    await this.page.getByTestId('role-access-assign-branch-confirm').click();
  }

  async assignBranchViaModal(branchLabel: string, level: string) {
    await this.assignBranchButton.click();
    await this.selectAssignBranch(branchLabel);
    await this.selectAssignLevel(level);
    await this.confirmAssignBranch();
  }
}
