> Relocated from `frontend/design-system/MASTER-DATA-MODULE-AUDIT.md` on 2026-07-06 as part of the non-functional artifact consolidation.
> See `governance-repo/project-artifacts/CONSOLIDATION-INVENTORY.md`.

# Master Data Module Audit (Phase 6c, Step 1)

Full current file tree re-verified (not relying on the prompt's stated count):

```
master-data/
  master-lookups/
    pages/master-lookup-search/        (Page A — Search/List, AG Grid)
    pages/master-lookup-entry/         (Page B — Entry/Form, Reactive Forms)
    components/master-lookup-actions-cell/   (AG Grid cell renderer, module-owned)
    components/lookup-details-section/       (dumb/presentational, nested in Page B)
    components/lookup-detail-form-modal/     (Drawer-opened, Reactive Forms)
    facades/, services/, models/, helpers/   (no templates — out of scope)
```

5 components confirmed — matches the prompt's stated count. Only one routed
module (`master-lookups`); no other feature area exists under `master-data/`.

Forms mechanism: **Reactive Forms** (`FormGroup`/`FormBuilder`/`formControlName`)
exclusively, used consistently in both `master-lookup-entry` and
`lookup-detail-form-modal` — no Signal Forms or template-driven forms in this
module (unlike Security, which had all three).

AG Grid: **1** instance (`master-lookup-search`) — confirms Phase 5's note
that `master-lookup-search` accounts for one of the grid instances not
covered by Security's 3. Grid theming itself untouched (Phase 5), only
surrounding chrome and the actions-cell in scope here.

---

## master-lookup-search (Page A)

**API/logic:** `ErpListComponent`-based list, AG Grid, `erp-specification-filter`
advanced filters, permission-gated create button (`PERM_MASTER_LOOKUP_CREATE`),
inline activate/deactivate/delete via `ErpDialogService` (in the confirm-actions
helper, not the template). Already uses `erp-empty-state` for both the error
and no-data states — **already on the shared component**, no change needed
there. Same shape as Security's `pages-search`/`role-access-control`.

**Bootstrap:** `btn btn-info btn-sm` (Advanced Filters toggle), `btn btn-success
btn-sm` (Create, permission-gated), `btn btn-primary btn-sm` (Refresh).

**Planned mapping:** toolbar buttons → `avl-button`, same variant convention
established in Security's `pages-search`: `btn-info` → `variant="secondary"`,
`btn-success` → `variant="accent"`, `btn-primary` → `variant="primary"`, all
`size="sm"` with `iconLeft` carrying the existing `ti-*` icon. No form in this
screen — no submit-button re-check applies here.

## master-lookup-actions-cell vs. `erp-crud-actions-cell`

Same resolution as Security's three bespoke cells (Phase 6b): `erp-crud-actions-cell`
does not implement AG Grid's `ICellRendererAngularComp` contract at all — it's
a plain `@Input()`/`@Output()` component for direct template use, not a cell
renderer. `master-lookup-actions-cell` correctly implements
`agInit(params)`/`refresh(params)` and receives row data + callbacks via
`cellRendererParams`, exactly like `role-actions-cell`/`page-actions-cell`.

Behavior comparison: `master-lookup-actions-cell` has **edit + toggle-active +
delete** — the same three-action shape as `role-actions-cell` (not the
edit/delete-only shape `erp-crud-actions-cell` supports even if it did
implement the AG Grid contract).

**Decision:** keep as a separate, dedicated AG Grid cell renderer (cannot be
retired — contract mismatch plus a third action `erp-crud-actions-cell` has no
equivalent for). Rebuild its internal buttons with `avl-icon-button` directly,
mirroring `role-actions-cell`'s/`page-actions-cell`'s exact template shape
(`variant="ghost"`, `size="sm"`, dynamic icon/label for the toggle). Permission
strings preserved exactly as they exist today: edit and toggle both gated on
`PERM_MASTER_LOOKUP_UPDATE`, delete on `PERM_MASTER_LOOKUP_DELETE` (this
differs from `role-actions-cell`'s choice to gate its toggle on the *delete*
permission — that was a role-specific business decision made in 6b, not a
convention to import here; master-lookup's original per-action permissions are
preserved as-is).

## master-lookup-entry (Page B)

**API/logic:** Reactive Forms (`FormGroup`/`FormBuilder`), full create/edit
flow via `MasterLookupFacade`, permission checks
(`PERM_MASTER_LOOKUP_CREATE`/`PERM_MASTER_LOOKUP_UPDATE`) redirect-and-notify
on failure, `lookupKey` disabled + forced-uppercase in edit mode (via a
dedicated `(input)` handler — real business logic, not presentational).
Already uses `erp-form-field`/`erp-section`/`erp-action-bar` as the wrapping
convention, same as `pages-form`. The `<form>` here wraps only the
`erp-section`; `erp-action-bar` (the only real save trigger) lives **outside**
`</form>` — already confirmed SAFE by `FORM-SUBMIT-AUDIT.md` (#5). This
structure is preserved unchanged; only the inputs inside get swapped.

**Bootstrap:** `form-control` ×3 (`lookupKey`, `lookupName`, `lookupNameEn`),
`form-control` on a `<textarea>` (`description`), Bootstrap grid (`row`/
`col-md-4`/`col-12` — kept, per policy), `spinner-border` (loading state).

**Planned mapping:** `lookupKey`/`lookupName`/`lookupNameEn` → bare `avl-input`
(no `label`/`error` — `erp-form-field` already renders those from the bound
`AbstractControl`, same convention as `pages-form`'s `pageCode`/`nameEn`
fields). `lookupKey` keeps its `(input)="onLookupKeyInput($event)"` handler
(forces uppercase — real validator-adjacent logic, preserved verbatim) and
`[mono]="true"` (matches `pages-form`'s treatment of its own code-like field).

**Flagged gap (not guessed around):** `lookupKey`/`lookupName`/`lookupNameEn`
currently carry native `maxlength` attributes (50/200/200) with no backing
Angular `Validators.maxLength` — i.e. client-side truncation only, not a real
validation rule. `AvlInputComponent` has no `maxLength` input and does not
forward arbitrary attributes to its internal `<input>`, so this truncation is
lost on migration. This is not a novel decision: the identical situation
already occurred in `pages-form`'s prior migration (`displayOrder`'s
`min="0"` and `nameAr`'s `dir="rtl"` were both dropped for the same reason,
verified via `git diff HEAD`), so dropping the unsupported attributes here is
consistent with established precedent rather than a new risk being
introduced silently.

**Flagged gap #2:** `description` is a `<textarea>` — there is no AVELYNQ
Textarea primitive in the delivered set (Button/IconButton/Input/Select/
Checkbox/Switch/Card/Badge/Avatar/Alert/EmptyState/Breadcrumb/Dialog/Drawer/
Tabs/Dropdown/Tooltip/Typeahead/Pagination/Toast — no Textarea). Kept as a raw
`<textarea class="form-control">` inside `erp-form-field`, same treatment as
any other primitive genuinely not yet built — restyling it as a bare
`form-control` is out of scope for a phase that must not invent new shared
components outside this module.

## lookup-details-section (nested in Page B)

**API/logic:** Dumb/presentational component — `@Input() details/loading/
currentSort`, `@Output()` for add/edit/toggle/delete/sort. No forms, no
services. Sortable `<th>` headers (click-to-sort, real behavior — preserved).

**Bootstrap:** `btn btn-success btn-sm` (Add Detail, permission-gated), `table
table-hover`, `badge bg-success`/`bg-secondary` (status pill), `btn-group
btn-group-sm` containing `btn-outline-primary`/`btn-outline-warning`/
`btn-outline-success`/`btn-outline-danger` (row actions, each individually
permission-gated via `*erpPermission`).

**Planned mapping:** Add Detail → `avl-button variant="accent" size="sm"`.
Status badge → `avl-badge` (`tone="success"`/`tone="neutral"` for
active/inactive, matching the grid's own active-column convention). Row
action buttons → `avl-icon-button` (`variant="ghost"`, `size="sm"`), same
shape as the actions-cell components — dropping the `btn-group` wrapper for a
plain flex `gap-1` div, consistent with every other actions-cell in the app.
Table itself (`table table-hover`) and sortable-header click behavior are
presentational/behavioral and stay as-is — no shared "DataTable" primitive
exists to replace a plain `<table>`.

## lookup-detail-form-modal

**Question from the brief:** is this the same component Phase 4 already
handled for `erp-lookup-dialog`, or a separate module-level component needing
its own check? **Confirmed separate** — `erp-lookup-dialog` is a shared
component under `src/app/shared/components/erp-lookup-field/erp-lookup-dialog/`
(an autocomplete-with-inline-create widget); `lookup-detail-form-modal` is a
module-owned component under `master-lookups/components/` with no relation
beyond the naming coincidence.

**Its own conflict check:** it opens via `DrawerService.open(this.detailModalRef,
{ size: 'md', closeOnScrim: false, closeOnEscape: false, viewContainerRef })`
— no `title`/`icon`/`showClose` passed in the config. Per
`DrawerContainerComponent`'s own branch logic (`drawer-container.component.ts`):
when none of `config.title`/`config.icon`/`config.showClose` are set, the
portal outlet is placed directly in the panel with no native `avl-drawer__header`/
`avl-drawer__body` wrapper — i.e. exactly the same "legacy content that
self-renders Bootstrap `.modal-header`/`.modal-body`/`.modal-footer` markup
keeps working unchanged" branch documented in `DialogContainerComponent`'s
comment and already relied on by `role-access-form`'s and `users-search`'s
modals. **Conflict confirmed present, same as those two** — the legacy trio
markup stays.

**API/logic:** Reactive Forms (`FormGroup`), `code` disabled + forced-uppercase
on edit (same pattern as the parent's `lookupKey`), `sortOrder` numeric with
`Validators.min(0)`. Emits `DetailFormSaveEvent` to the parent (dumb w.r.t.
persistence — the parent facade actually saves). Already confirmed SAFE by
`FORM-SUBMIT-AUDIT.md` (#6): no `(ngSubmit)`/`[formGroup]` submit-button risk,
Save/Cancel are both `type="button"` inside `.modal-footer`, outside any
native-submit path.

**Bootstrap:** `.modal-header`/`.modal-body`/`.modal-footer` (kept, per the
conflict above), `form-control` ×5 (`code`, `sortOrder`, `nameAr`, `nameEn`,
`extraValue`), `btn btn-secondary` (Cancel), `btn btn-primary` (Save),
`spinner-border spinner-border-sm` (saving state), `btn-close`.

**Planned mapping:** the 5 fields → bare `avl-input` inside `erp-form-field`
(same maxlength-drop precedent as Page B, plus `sortOrder`'s `min="0"` dropped
for the identical reason `pages-form`'s `displayOrder` already dropped it —
`Validators.min(0)` remains the real enforcement point, unaffected). Cancel/Save
buttons → `avl-button` (`variant="secondary"`/`variant="primary"`), `[loading]`
replaces the manual `spinner-border` for the Save button (`AvlButtonComponent`
already renders its own spinner when `loading`). `.modal-header`/`.modal-body`/
`.modal-footer` divs and the `btn-close` stay raw, matching the established
legacy-trio pattern.

---

## Screens NOT requiring any change

None outside the above — all 5 components have real Bootstrap surface area to
migrate.
