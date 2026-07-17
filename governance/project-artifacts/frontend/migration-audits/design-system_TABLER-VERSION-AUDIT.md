> Relocated from `frontend/design-system/TABLER-VERSION-AUDIT.md` on 2026-07-06 as part of the non-functional artifact consolidation.
> See `governance-repo/project-artifacts/CONSOLIDATION-INVENTORY.md`.

# Tabler Icon Version Audit — v1.41.1 (bundled) vs v3.44.0 (npm)

Full inventory of every `ti-[a-z0-9-]+` class used across `src/app/` (`.html`
templates and `.ts` inline templates/icon-name strings), checked against the
real icon definitions in both stylesheets:

- **v1** = `src/scss/fonts/tabler-icons.min.css` (Tabler Icons 1.41.1, the
  version bundled and actively used before this phase)
- **v3** = `node_modules/@tabler/icons-webfont/dist/tabler-icons.min.css`
  (Tabler Icons 3.44.0, installed in Phase 1)

Existence was checked by searching each stylesheet's actual `.ti-<name>:before`
glyph rules — not from memory of Tabler's icon set. 54 distinct classes found
across 244 template/`.ts` files scanned.

## Needs Human Decision

**None.** Every icon class currently used in the app exists in v3.44.0 under
the exact same class name — there are zero `renamed` and zero `removed` rows.

## Notable finding: 4 icons were already broken under v1, unrelated to this migration

`ti-arrows-exchange`, `ti-binary-tree`, `ti-filter-search`, and `ti-search-off`
do **not exist anywhere** in the bundled v1.41.1 stylesheet (verified with
both exact and broad substring search — zero matches). These four classes
are used in `accounts-tree.component.html`/`.ts` (the GL Chart of Accounts
screen) and would have been rendering as empty/missing-glyph icons in the
app **before this phase started**, independent of anything Phase 1 did. They
are marked `safe*` below because the v3 swap requires no code change and
incidentally fixes this pre-existing gap — but it means these 4 icons will
be **visibly new** after this phase (previously invisible, now rendering),
which is why they're called out specifically in the spot-check list.

## Full audit table

| Icon Class | File Paths | Count | Exists in v1.41.1? | Exists in v3.44.0? | Status |
|---|---|---|---|---|---|
| `ti-alert-circle` | `master-lookup-search.component.html`<br>`role-access-control.component.html`<br>`user-list.component.html`<br>`pages-search.component.html` | 5 | Yes | Yes | safe |
| `ti-alert-triangle` | `confirm-dialog.component.ts`<br>`accounts-tree.component.html` | 2 | Yes | Yes | safe |
| `ti-arrow-left` | `access-denied.component.html`<br>`erp-action-bar.component.html`<br>`erp-back-button.component.html` | 3 | Yes | Yes | safe |
| `ti-arrows-exchange` | `accounts-tree.component.ts` | 1 | **No** | Yes | safe* |
| `ti-arrows-maximize` | `accounts-tree.component.html` | 1 | Yes | Yes | safe |
| `ti-arrows-minimize` | `accounts-tree.component.html` | 1 | Yes | Yes | safe |
| `ti-arrows-sort` | `erp-lookup-dialog.component.ts` | 1 | Yes | Yes | safe |
| `ti-binary-tree` | `accounts-tree.component.html` | 2 | **No** | Yes | safe* |
| `ti-building-bank` | `accounts-tree.component.ts` | 1 | Yes | Yes | safe |
| `ti-calculator` | `dashboard.component.ts` | 1 | Yes | Yes | safe |
| `ti-chart-bar` | `accounts-tree.component.ts` | 1 | Yes | Yes | safe |
| `ti-check` | `specification-filter.component.html`<br>`accounts-tree.component.html` | 3 | Yes | Yes | safe |
| `ti-chevron-down` | `accounts-tree.component.html` | 1 | Yes | Yes | safe |
| `ti-chevron-left` | `erp-dual-list.component.ts` | 1 | Yes | Yes | safe |
| `ti-chevron-right` | `dashboard.component.html`<br>`erp-dual-list.component.ts`<br>`accounts-tree.component.html` | 3 | Yes | Yes | safe |
| `ti-chevrons-left` | `erp-dual-list.component.ts` | 1 | Yes | Yes | safe |
| `ti-chevrons-right` | `erp-dual-list.component.ts` | 1 | Yes | Yes | safe |
| `ti-copy` | `role-access-form.component.html` | 1 | Yes | Yes | safe |
| `ti-dashboard` | `dashboard.component.html` | 1 | Yes | Yes | safe |
| `ti-database` | `dashboard.component.ts`<br>`safe-ant-icon.pipe.ts`<br>`master-lookup-search.component.html`<br>`role-access-control.component.html`<br>`user-list.component.html`<br>`pages-search.component.html` | 6 | Yes | Yes | safe |
| `ti-device-floppy` | `erp-action-bar.component.html`<br>`accounts-tree.component.html` | 2 | Yes | Yes | safe |
| `ti-edit` | `master-lookup-actions-cell.component.ts`<br>`lookup-details-section.component.html`<br>`role-actions-cell.component.ts`<br>`page-actions-cell.component.ts`<br>`user-actions-cell.component.ts` | 5 | Yes | Yes | safe |
| `ti-file-invoice` | `accounts-tree.component.ts` | 1 | Yes | Yes | safe |
| `ti-file-text` | `dashboard.component.ts`<br>`accounts-tree.component.html`<br>`accounts-tree.component.ts` | 3 | Yes | Yes | safe |
| `ti-filter` | `master-lookup-search.component.html`<br>`role-access-control.component.html`<br>`accounts-tree.component.html`<br>`user-list.component.html`<br>`pages-search.component.html` | 6 | Yes | Yes | safe |
| `ti-filter-search` | `accounts-tree.component.html` | 1 | **No** | Yes | safe* |
| `ti-home` | `access-denied.component.html`<br>`breadcrumb.component.html` | 2 | Yes | Yes | safe |
| `ti-info-circle` | `confirm-dialog.component.ts`<br>`accounts-tree.component.html`<br>`user-list.component.html`<br>`pages-search.component.html` | 8 | Yes | Yes | safe |
| `ti-language` | `auth-login.component.html` | 1 | Yes | Yes | safe |
| `ti-list` | `safe-ant-icon.pipe.ts`<br>`menu.service.ts`<br>`lookup-details-section.component.html`<br>`user-list.component.html` | 6 | Yes | Yes | safe |
| `ti-list-check` | `user-list.component.html` | 1 | Yes | Yes | safe |
| `ti-list-search` | `safe-ant-icon.pipe.ts`<br>`menu.service.ts` | 3 | Yes | Yes | safe |
| `ti-lock` | `dashboard.component.html`<br>`access-denied.component.html`<br>`accounts-tree.component.html` | 5 | Yes | Yes | safe |
| `ti-lock-access` | `access-denied.component.html` | 1 | Yes | Yes | safe |
| `ti-package` | `accounts-tree.component.ts` | 1 | Yes | Yes | safe |
| `ti-pencil` | `erp-crud-actions-cell.component.ts`<br>`accounts-tree.component.html` | 2 | Yes | Yes | safe |
| `ti-plus` | `erp-page-header.component.ts`<br>`specification-filter.component.html`<br>`master-lookup-search.component.html`<br>`role-access-form.component.html`<br>`lookup-details-section.component.html`<br>`role-access-control.component.html`<br>`accounts-tree.component.html`<br>`user-list.component.html`<br>`pages-search.component.html` | 12 | Yes | Yes | safe |
| `ti-point` | `accounts-tree.component.html` | 1 | Yes | Yes | safe |
| `ti-receipt` | `accounts-tree.component.ts` | 1 | Yes | Yes | safe |
| `ti-refresh` | `erp-page-header.component.ts`<br>`master-lookup-search.component.html`<br>`role-access-control.component.html`<br>`accounts-tree.component.html`<br>`user-list.component.html`<br>`pages-search.component.html` | 6 | Yes | Yes | safe |
| `ti-search` | `nav-left.component.html`<br>`erp-lookup-field.component.html`<br>`accounts-tree.component.html`<br>`erp-lookup-dialog.component.html` | 4 | Yes | Yes | safe |
| `ti-search-off` | `accounts-tree.component.html` | 1 | **No** | Yes | safe* |
| `ti-shield-check` | `accounts-tree.component.ts`<br>`user-list.component.html` | 3 | Yes | Yes | safe |
| `ti-sitemap` | `accounts-tree.component.html` | 1 | Yes | Yes | safe |
| `ti-sort-ascending` | `lookup-details-section.component.html`<br>`erp-lookup-dialog.component.ts` | 6 | Yes | Yes | safe |
| `ti-sort-descending` | `lookup-details-section.component.html`<br>`erp-lookup-dialog.component.ts` | 6 | Yes | Yes | safe |
| `ti-subtask` | `accounts-tree.component.html` | 2 | Yes | Yes | safe |
| `ti-toggle-left` | `master-lookup-actions-cell.component.ts`<br>`lookup-details-section.component.html`<br>`role-actions-cell.component.ts`<br>`accounts-tree.component.html`<br>`page-actions-cell.component.ts` | 5 | Yes | Yes | safe |
| `ti-toggle-right` | `master-lookup-actions-cell.component.ts`<br>`lookup-details-section.component.html`<br>`role-actions-cell.component.ts`<br>`accounts-tree.component.html`<br>`page-actions-cell.component.ts` | 5 | Yes | Yes | safe |
| `ti-trash` | `erp-crud-actions-cell.component.ts`<br>`specification-filter.component.html`<br>`master-lookup-actions-cell.component.ts`<br>`lookup-details-section.component.html`<br>`role-actions-cell.component.ts`<br>`user-actions-cell.component.ts` | 6 | Yes | Yes | safe |
| `ti-trending-down` | `accounts-tree.component.ts` | 1 | Yes | Yes | safe |
| `ti-trending-up` | `accounts-tree.component.ts` | 1 | Yes | Yes | safe |
| `ti-users` | `dashboard.component.ts` | 1 | Yes | Yes | safe |
| `ti-x` | `erp-lookup-field.component.html`<br>`specification-filter.component.html`<br>`role-access-form.component.html`<br>`accounts-tree.component.html`<br>`erp-autocomplete.component.html` | 8 | Yes | Yes | safe |

**Totals: 54 checked — 50 `safe`, 4 `safe*` (missing in v1, present in v3 — no
code change needed), 0 `renamed`, 0 `removed`.**

## Base `.ti` rule comparison

No meaningful difference: v1 sets `font-weight: 400`, v3 sets
`font-weight: normal` (equivalent value). Font family name, `line-height: 1`,
antialiasing hints, and all other properties match. Confirmed both stylesheets
require the same two-class markup pattern (`class="ti ti-<name>"`), and the
app consistently uses that pattern everywhere — no bare `ti-<name>`-only
usages found that would have been missing the base font-family rule.
