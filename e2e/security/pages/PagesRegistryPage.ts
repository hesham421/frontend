import { Page, expect } from '@playwright/test';

export interface PageFormData {
  pageCode: string;
  nameEn: string;
  nameAr: string;
  route: string;
  /** Required by the form's Angular validators (though NOT by the backend) —
   *  omitting it leaves the Save button permanently disabled. Always pass one. */
  displayOrder: number;
  icon?: string;
}

/** POM for /security/pages-registry (search) and its create/edit form. */
export class PagesRegistryPage {
  constructor(private page: Page) {}

  async gotoList() {
    await this.page.goto('/security/pages-registry');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoCreate() {
    await this.page.goto('/security/pages-registry/create');
    await this.page.waitForSelector('#pageCode input');
  }

  async gotoEdit(id: number | string) {
    await this.page.goto(`/security/pages-registry/edit/${id}`);
    await this.page.waitForSelector('#nameEn input');
  }

  // ---- Form (create/edit) — real `id`s exist on every field ----
  async fillForm(data: PageFormData) {
    await this.page.locator('#pageCode input').fill(data.pageCode);
    await this.page.locator('#nameEn input').fill(data.nameEn);
    await this.page.locator('#nameAr input').fill(data.nameAr);
    await this.page.locator('#route input').fill(data.route);
    await this.page.locator('#displayOrder input').fill(String(data.displayOrder));
    if (data.icon !== undefined) {
      await this.page.locator('#icon input').fill(data.icon);
    }
  }

  async save() {
    const btn = this.page.getByRole('button', { name: /Save|Update/ });
    await expect(btn).toBeEnabled({ timeout: 10000 });
    await btn.click();
  }

  // ---- List / search ----
  // KNOWN LIMITATION: the pages table accumulates test data across runs (no delete
  // endpoint, only deactivate — see doc §13) and can hold 100+ rows; the default grid
  // view is paginated (20/page, no visible control over page size from here), so a
  // brand-new row is not reliably on the first page. ERP_DEFAULT_COL_DEF sets
  // floatingFilter:true, but no column in pages-grid.config.ts assigns a `filter` type,
  // so AG-Grid never actually renders a floating-filter row (confirmed via DOM dump —
  // no `.ag-header-row-column-filter` row exists). The only working filter is the
  // "Advanced Filters" panel (avl-select-based, not yet automated here). These
  // row-lookup helpers therefore only reliably find a row that's still on the grid's
  // current/first page — use them for small-dataset scenarios, and prefer direct API
  // calls (SecurityApiClient) to verify a specific record once accumulated data is large.
  private row(pageCode: string) {
    return this.page.locator('.ag-center-cols-container .ag-row', { hasText: pageCode });
  }

  async expectRowVisible(pageCode: string) {
    await expect(this.row(pageCode)).toBeVisible({ timeout: 10000 });
  }

  async expectRowNotVisible(pageCode: string) {
    await expect(this.row(pageCode)).toHaveCount(0);
  }

  async clickEdit(pageCode: string) {
    await this.row(pageCode).getByRole('button', { name: 'Edit' }).click();
  }

  async clickToggleActive(pageCode: string) {
    const row = this.row(pageCode);
    await row.getByRole('button', { name: /Deactivate|Activate/ }).click();
  }
}
