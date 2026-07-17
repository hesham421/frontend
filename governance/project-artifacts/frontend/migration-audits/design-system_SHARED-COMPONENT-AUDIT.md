> Relocated from `frontend/design-system/SHARED-COMPONENT-AUDIT.md` on 2026-07-06 as part of the non-functional artifact consolidation.
> See `governance-repo/project-artifacts/CONSOLIDATION-INVENTORY.md`.

# Shared Component Audit (Phase 4, Step 1)

Read in full before any implementation. Each section lists the component's
public API (to be preserved unless a deviation is called out in the
end-of-phase report), its current Bootstrap dependencies (to remove), and
the AVELYNQ primitive(s) it will be rebuilt on top of.

New primitives live in `src/app/shared/{buttons,forms,data-display,feedback,
navigation}/` — sibling folders to Phase 3's `src/app/shared/overlay/`.

---

## erp-readonly-hint

**API:** `@Input() labelKey`, `@Input() value: string|number|null`,
`@Input() placeholderKey`. No outputs, no forms integration.

**Bootstrap:** none — already a pure token-styled div (dashed border).

**Composition:** no primitive needed structurally; will restyle its own
dashed "value" box to reuse `--border-subtle`/`--radius-md` exactly as
today. Trivial pass — mostly a no-op confirmation.

---

## erp-empty-state

**API:** `@Input() titleKey`, `messageKey`, `icon?`, `actionLabelKey?`;
`@Output() actionClicked`.

**Bootstrap:** `btn btn-primary` on the action button.

**Composition:** `AvlEmptyStateComponent` (feedback/EmptyState) content
projected via an action `<avl-button>`, wired 1:1 — near-identical prop
shape to the AVELYNQ spec (`icon`/`title`/`message`/`action`).

---

## erp-back-button

**API:** `@Output() backClicked`. No inputs beyond template constants.

**Bootstrap:** `btn btn-outline-secondary btn-sm`.

**Composition:** `AvlButtonComponent` variant `secondary` size `sm`,
`iconLeft="ti ti-arrow-left"`.

---

## erp-form-actions

**API:** `saveKey`, `cancelKey`, `loadingKey`, `showSave`, `showCancel`,
`loading`, `disabled`; `@Output() saveClicked`, `cancelClicked`.

**Bootstrap:** `btn btn-secondary`, `btn btn-primary`,
`spinner-border spinner-border-sm`.

**Composition:** two `<avl-button>`s (`secondary` for cancel, `primary` for
save), using `AvlButtonComponent`'s own `loading` input instead of a
hand-rolled spinner span.

---

## erp-action-bar

**API:** `saveKey`, `cancelKey`, `loadingKey`, `showSave`, `showCancel`,
`showBack`, `loading`, `disabled`; `@Output() saveClicked`, `cancelClicked`,
`backClicked`. Two projection slots: `[actionBarStart]`, `[actionBarEnd]`.

**Bootstrap:** `btn btn-outline-secondary btn-sm` (back + cancel),
`btn btn-primary` (save), `spinner-border`.

**Composition:** three `<avl-button>`s (`secondary`/`sm` for back+cancel,
`primary` for save with `iconLeft="ti ti-device-floppy"` when not loading).
Projection slots preserved unchanged.

---

## erp-section

**API:** `titleKey`, `descriptionKey?`. Single default content slot.

**Bootstrap:** none — already token-styled bordered box.

**Composition:** `AvlCardComponent` (`padding="md"`), mapping
`titleKey`→`title`, `descriptionKey`→`subtitle`. Body content stays
projected via `<ng-content>`.

---

## erp-page-header

**API:** `titleKey`, `showAdd`, `showRefresh`, `addPermission`;
`@Output() addClicked`, `refreshClicked`.

**Bootstrap:** `btn btn-outline-secondary btn-sm` (refresh),
`btn btn-primary btn-sm` (add), plus `d-none d-sm-inline` utility classes.

**Composition:** `<avl-button>` (`secondary`/`sm` for refresh,
`primary`/`sm` for add) + optionally `AvlBreadcrumbComponent` if a
`breadcrumb` input is later desired (not in current API — not added here,
no consumer need identified). `erpPermission` directive kept as-is
(unrelated to design system).

---

## erp-form-field

**API:** `labelKey`, `control: AbstractControl|null`, `required`,
`hintKey?`. Single projection slot for the actual control. Depends on
`ErpUiMessageResolverService` for error resolution — untouched (business
logic, not UI).

**Bootstrap:** none directly — pure label/hint/error wrapper.

**Composition:** this component stays a thin label/error *wrapper*; it does
not itself become an `<avl-input>` because it's control-agnostic (wraps
`erp-lookup-field`, native inputs, `erp-autocomplete`, etc. — not always an
`AvlInputComponent`). Only its label/required-asterisk/hint/error typography
is restyled to match `Input`'s label treatment (`--fs-xs`/`--fw-medium` for
the label, `--red-500` for the asterisk and error) so a native `erp-form-
field` wrapping an `<avl-input>` looks seamless (no doubled label/border).

---

## erp-crud-actions-cell

**API:** `showEdit`, `showDelete`, `editPermission`, `deletePermission`,
`disabled`; `@Output() editClicked`, `deleteClicked`. Extra `<ng-content>`
slot for custom actions. **Used as an AG Grid cell renderer component** —
AG Grid instantiates it directly (not via a parent template binding), so
its selector/standalone bootstrapping contract must not change.

**Bootstrap:** none — already custom `.erp-action-btn` classes, just needs
token/primitive alignment.

**Composition:** two `<avl-icon-button>`s (`variant="ghost"` `size="sm"`,
`icon="ti ti-pencil"` / `"ti ti-trash"`, `label` bound to translated
Edit/Delete for the auto-tooltip). AG Grid's cell-renderer contract (no
special inputs beyond what's already there) is unaffected since this
component is still standalone with the same selector and `@Input`s.

---

## erp-notification-container

**API:** no inputs/outputs — reads `ErpNotificationService.notifications`
signal directly, calls `.dismiss(id)`.

**Triggering API to preserve exactly:** `ErpNotificationService.show()` /
`.success()` / `.error()` / `.warning()` / `.info()` / `.dismiss(id)` /
`.dismissAll()` — all consumers across the app call these methods; none of
this changes.

**Bootstrap:** `alert`, `alert-success/danger/warning/info`, `btn-close`,
`shadow-sm`.

**Composition:** rebuilt on the new `AvlToastComponent`/`AvlToastContainer`
(Step 3) which reuses `AvlAlertComponent`'s tone system exactly. The
*container* component keeps its selector/behavior (still just renders
`ErpNotificationService.notifications()`), only the per-item visual markup
changes from Bootstrap `.alert` to the AVELYNQ toast card.

---

## erp-lookup-field

**API:** `@Input({required}) config: LookupConfig`; `@Output() itemSelected`.
Implements `ControlValueAccessor` (stores selected ID). Delegates to
`erp-autocomplete` (quick mode) or opens `erp-lookup-dialog` via
`DialogService` (advanced mode, already CDK from Phase 3).

**Bootstrap:** `input-group`, `form-control`, `btn btn-outline-primary`,
`btn btn-outline-secondary` (advanced-mode search/clear buttons).

**Composition:** advanced-mode input row rebuilt as `<avl-input readOnly
[value]="displayText()" suffix="…">` is awkward for the search/clear button
duo, so instead: `AvlInputComponent` for the display field
(`readOnly`, `iconLeft="ti ti-search"`) + two `<avl-icon-button>`s
(search-trigger, clear) placed via the Input's own layout — see
`erp-lookup-field`'s own template composing them side-by-side rather than
forcing them inside `AvlInputComponent`'s suffix slot (that slot is
text-only per spec, not action buttons). CVA contract unchanged.

---

## erp-autocomplete

**API:** `@Input({required}) config`, `displayValue`; `@Output()
itemSelected`, `cleared`. Not CVA (wrapped by `erp-lookup-field`, which is).

**Bootstrap:** `input-group`, `form-control`, `btn btn-outline-secondary`,
`input-group-text`, `list-group`, `list-group-item`, `spinner-border`.

**Composition:** `AvlInputComponent` for the search box (bound via
`[value]`/`(valueChange)` — see CVA section below for why Input exposes a
plain value/valueChange pair in addition to CVA) + clear `<avl-icon-button>`
+ loading spinner reused from `AvlButtonComponent`'s spinner styling
(extracted as a tiny shared `.avl-spinner` class). Dropdown results panel
restyled to reuse the Dropdown extension's `.avl-dropdown__panel`/`__item`
classes from Phase 3 (`src/scss/avelynq/shell/overlays.scss`) instead of
Bootstrap `list-group`, but kept as a plain absolutely-positioned div (not
migrated onto the CDK `AvlDropdownDirective`) since this component's
keyboard-nav/highlight logic is hand-rolled and tightly coupled to the
existing markup — rewiring it onto the directive is a bigger, riskier
change than a visual reskin and is not required by this phase's brief.

---

## erp-lookup-dialog

**API:** `@Input() config`; injects `AvlOverlayRef<LookupItem|undefined>`
(already migrated in Phase 3). Opened via `DialogService`.

**Bootstrap:** `modal-header`/`modal-title`/`btn-close`/`modal-body`/
`modal-footer` (legacy passthrough markup per Phase 3's Dialog design),
`input-group`, `form-control`, `table table-hover table-sm`,
`table-light`, `table-primary`, `btn btn-outline-secondary`,
`btn btn-primary`.

**Composition (revised during Step 4 — see report point 9):** initially
planned to switch to Dialog's native header mode (`config.title`), but
`src/scss/avelynq/shell/overlays.scss` targets
`.avl-dialog__panel > .modal-footer` with a **direct-child** selector —
native-header mode nests all portal content one level deeper inside
`.avl-dialog__body`, which would silently strip the footer's
padding/border-top. Kept the legacy self-rendered `.modal-header`/
`.modal-body`/`.modal-footer` trio (already reskinned in Phase 3) and only
rebuilt what's *inside* it: `AvlInputComponent` for search
(`iconLeft="ti ti-search"`), results table kept as a plain `<table>`
(data-grid semantics, not a card), header row's sort triggers become
`<avl-icon-button size="sm" variant="ghost">`. Footer:
`<avl-button variant="secondary">` (cancel) + `<avl-button variant="primary"
[disabled]="!hasSelection()">` (select). Pagination unchanged (already
`avl-pagination` from Phase 3).

---

## erp-dual-list

**API:** `availableItems`/`selectedItems` (setter inputs), `disabled`,
`searchable`, `singleSelect`, `availableTitleKey`, `selectedTitleKey`;
`@Output() selectedChange`.

**Bootstrap:** `form-control form-control-sm` (search boxes),
`btn btn-outline-primary btn-sm` (transfer arrows).

**Composition:** two `AvlCardComponent`s (`padding="none"`, header via the
`header` slot for the title+count row) as the available/selected panels,
`AvlInputComponent` (no label, just `placeholder`) for search, four
`<avl-icon-button variant="outline" size="sm">` for the transfer arrows
(`ti ti-chevron-left/right`, `ti ti-chevrons-left/right`). List item rows
keep their existing custom `.erp-dual-list-item` classes (already
token-styled, not Bootstrap) — only wrapped inside the new Card shell.

---

## specification-filter

**API:** `@Input({required}) availableFields`, `availableOperators`;
`@Output() apply`, `clear`. `rows` is internal state (public property, used
by nothing outside — not part of the intentional API, left as-is).

**Bootstrap:** `btn btn-sm btn-outline-primary/secondary/danger`,
`form-select form-select-sm`, `form-control form-control-sm`, Bootstrap
grid (`row g-2`, `col-md-*`), `form-label small`, `form-text`.

**Composition:** `<avl-select>` (field/operator/dropdown-options value),
`<avl-input>` (free-text value), `<avl-button>` (Add/Clear/Apply, `sm`),
`<avl-icon-button>` (remove-row, `ti ti-trash`, `danger`-tinted via a
plain color override since IconButton has no danger variant in spec — kept
literal to spec's 4 variants, colored via a local class instead of adding
a 5th variant). Bootstrap's grid classes (`row`/`col-md-*`) are the one
exception left in place here — see report point 9, this is a layout
utility, not a themed component, and AVELYNQ has no grid primitive of its
own; removing it would require inventing a bespoke flex/grid layer out of
scope for this phase's primitive list.

---

## Primitives this audit requires (Step 2)

`Button`, `IconButton`, `Input` (CVA), `Select` (CVA), `Checkbox` (CVA,
used nowhere in Step 1's list directly, but required by the brief and by
`erp-dual-list`'s row-selection UX as a documented future improvement —
not retrofitted into dual-list's existing click-row-to-select interaction
in this pass, since that would change dual-list's interaction model beyond
a visual reskin), `Switch` (CVA, no direct consumer found either — built
per brief, available for Phase 6+ module adoption), `Card`, `Stat` (+
dashboard follow-up), `Badge` (no direct erp-* consumer found in Step 1's
list, but confirmed as available for `specification-filter`-style status
displays going forward), `Avatar` (no direct erp-* consumer either — built
per brief for future adoption, e.g. user lists), `Alert` (feeds `Toast`),
`EmptyState`, `Breadcrumb` (no direct consumer in the audited list; built
per brief).

## Reactive Forms usage confirmed

`erp-lookup-field` is the only shared component in this list implementing
`ControlValueAccessor` today. `erp-form-field` wraps `AbstractControl`
directly (reading `.invalid`/`.touched`/`.dirty`/`.events`) rather than
being a CVA itself. This confirms Input/Select/Checkbox/Switch's CVA
requirement is for *future* `formControlName` usage (Phase 6+ module
rebuilds), not a retrofit onto an existing broken integration — there is
no existing native `<input formControlName>` inside this shared-components
set to migrate.
