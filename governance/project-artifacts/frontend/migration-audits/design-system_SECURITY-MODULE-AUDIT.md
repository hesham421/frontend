> Relocated from `frontend/design-system/SECURITY-MODULE-AUDIT.md` on 2026-07-06 as part of the non-functional artifact consolidation.
> See `governance-repo/project-artifacts/CONSOLIDATION-INVENTORY.md`.

# Security Module Audit (Phase 6b, Step 1)

Full current file tree re-verified (not relying on any prior-phase count):

```
security/
  authentication/pages/auth-login/        (rebuilt in Phase 6a)
  authentication/pages/auth-register/
  authentication/pages/forgot-password/
  pages-registry/pages/pages-form/
  pages-registry/pages/pages-search/       (AG Grid)
  pages-registry/components/page-actions-cell/   (AG Grid cell renderer)
  role-access/pages/role-access-form/
  role-access/components/role-access-control/    (AG Grid)
  role-access/components/role-actions-cell/      (AG Grid cell renderer)
  user-management/pages/users-search/            (AG Grid — user-list.component.*)
  user-management/components/user-actions-cell/  (AG Grid cell renderer)
```

Three distinct forms mechanisms are in live use across this module — noted so migrations stay consistent with whichever a given screen already uses, not a single assumed convention:
- **Signal Forms** (`@angular/forms/signals`, `form()`/`Field`): `auth-login` (Phase 6a), `auth-register`.
- **Reactive Forms** (`FormGroup`/`formControlName`): `pages-form`, `role-access-form`'s top section.
- **Template-driven** (`[(ngModel)]` + template reference `#x="ngModel"`): `users-search`'s create/edit-user modal.

---

## auth-login *(already rebuilt — Phase 6a, no further work here)*

---

## auth-register

**API/logic:** Signal Forms (`form()`/`Field`), real validators (`required`/`email`/`minLength(8)`), calls `authenticationService.register()`, redirects to dashboard on success. Real, working feature — not a placeholder.

**Bootstrap:** `form-control` ×4, `btn btn-primary`, `alert alert-danger`, `spinner-border`, plus decorative Google/Twitter/Facebook buttons (no click handlers — same non-functional-placeholder pattern as auth-login's social buttons, not gated by any feature flag here though) and a `card` via `<app-card>` (a different, older card component than `AvlCardComponent` — not itself in scope, only its content).

**Planned mapping:** same treatment as auth-login — `AvlInputComponent` (`[field]="registerForm.x"`) for the 4 fields, `AvlButtonComponent` (`type="submit"`, `loading`) for submit, `AvlAlertComponent` for the error banner. Social buttons restyled only (still decorative, not wired — not this phase's job to build OAuth).

## forgot-password

**API/logic:** `ForgotPasswordComponent` class is **completely empty** (`{}`) — the email input has no binding, the submit button is `type="button"` with no click handler at all. This is a static, non-functional placeholder screen, not a real feature with logic to preserve.

**Bootstrap:** `card`, `form-control`, `btn btn-primary`.

**Planned mapping:** restyle only (`AvlCardComponent`-equivalent layout via the same `avl-split`/plain card markup pattern as auth-login, `AvlInputComponent`, `AvlButtonComponent`) — purely cosmetic since there's no logic to preserve either way.

## pages-form

**API/logic:** Reactive Forms (`FormGroup`/`formControlName`), full create/edit flow via `PagesFacade`, permission checks (`PERM_PAGE_CREATE`/`PERM_PAGE_UPDATE`) redirect-and-notify on failure, `pageCode` disabled in edit mode. Already uses `erp-form-field`/`erp-section`/`erp-action-bar` (Phase 4) as the wrapping convention — raw `<input class="form-control" formControlName="x">`/`<select class="form-select">` nested inside `erp-form-field`.

**Bootstrap:** `form-control` ×6, `form-select` ×2, `form-check`/`form-check-input`/`form-check-label` (an Active-status switch), `spinner-border` (loading state), Bootstrap grid (`row`/`col-md-6` — kept, per policy).

**Planned mapping:** swap the raw inputs/selects for **bare** `AvlInputComponent`/`AvlSelectComponent` (no `label`/`error` props set on them — `erp-form-field` already renders label/hint/error from the bound `AbstractControl`, so the primitive here is used purely for its input-box chrome, exactly like the `specification-filter` pattern established in Phase 4). This is the first real exercise of Phase 4's CVA under **classic Reactive Forms /`formControlName`** specifically (Phase 6a exercised it under the newer Signal Forms interop bridge). Active-status switch → `AvlSwitchComponent` (single immediate-effect setting, matches the Switch spec's own guidance over Checkbox).

## pages-search

**API/logic:** `ErpListComponent`-based list screen, AG Grid (theme from Phase 5, untouched), `erp-specification-filter` advanced filters, permission-gated create button, inline activate/deactivate confirm via `ErpDialogService`. Same shape as `role-access-control` below.

**Bootstrap:** `btn btn-info/success/primary btn-sm` (toolbar), `badge bg-primary`/`bg-secondary` (active-filter pills), `alert alert-info`.

**Planned mapping:** toolbar buttons → `AvlButtonComponent` (`secondary`/`primary` per role), filter-pill badges → `AvlBadgeComponent`, `alert-info` → `AvlAlertComponent`. AG Grid itself and `page-actions-cell` handled separately (Step 2 / actions-cell section below).

## page-actions-cell / role-actions-cell / user-actions-cell — vs. `erp-crud-actions-cell`

All three implement AG Grid's real `ICellRendererAngularComp` contract (`agInit(params)`/`refresh(params)`, receiving row data + callbacks via `cellRendererParams`). **`erp-crud-actions-cell` (Phase 4) does not implement this contract at all** — it's a plain `@Input()`/`@Output()` component meant for direct template use, not an AG Grid cell renderer, and has zero consumers anywhere in the app (confirmed in Phase 4). Swapping any of these three to literally use `<erp-crud-actions-cell>` as `cellRenderer:` would require first adding `ICellRendererAngularComp` support to it — a change to a file outside `src/app/modules/security/`, which this phase's guardrail excludes.

Behavior comparison:
- `user-actions-cell`: edit + delete only — the one that's *closest* in shape to `erp-crud-actions-cell`'s edit/delete pattern.
- `role-actions-cell`: edit + **toggle-active** (dynamic icon/color/label) + delete — a third action `erp-crud-actions-cell` has no equivalent for.
- `page-actions-cell`: edit + **toggle-active** (deactivate/activate) — no delete button at all.

**Decision:** keep all three as separate, dedicated AG Grid cell renderers (none can be cleanly retired given the contract mismatch and, for two of them, genuinely different action sets) — rebuild each one's internal buttons with `AvlIconButtonComponent` directly, per the brief's own fallback instruction for this exact case.

## role-access-form

**API/logic:** Reactive Forms for the name/active section (`FormGroup`), plus a permission-grid `<table>` bound via plain per-cell `[checked]`/`(change)` handlers (no forms directive at all today) for create/update/delete/all-columns, and two `Drawer`/`Dialog`-opened `<ng-template>`s (Add Pages → Drawer with `erp-dual-list`; Copy From → Dialog with a role `<select>`) — both **already** on the legacy `.modal-header`/`.modal-body`/`.modal-footer` self-rendered pattern from Phase 3's swap.

**Bootstrap:** `form-control`, `form-select` ×2 (one inside the Copy-From template), `form-check`/`form-check-input`/`form-check-label` ×5 (the Active switch + 4 permission-grid checkbox columns, per row), `btn btn-success/outline-secondary/outline-primary/outline-danger/primary` in various places, `modal-header`/`modal-body`/`modal-footer` ×2 (Add Pages, Copy From), `table table-sm table-hover align-middle`.

**Planned mapping:**
- Name field → bare `AvlInputComponent` inside existing `erp-form-field` (same pattern as pages-form).
- Active switch → `AvlSwitchComponent`.
- Permission-grid per-row checkboxes (create/update/delete) → `AvlCheckboxComponent` bound via `[(ngModel)]` (this table has no `FormGroup` of its own — plain component-array state — `ngModel` is the correct, minimal way to get 2-way binding onto a CVA-based component here without inventing a new output; the "select all" column uses split `[ngModel]`/`(ngModelChange)` since it's a derived value with custom handling, not a plain property).
- Remove-page button (`btn-outline-danger btn-sm`) → `AvlIconButtonComponent`.
- **Both `<ng-template>` modals stay on the legacy `.modal-header`/`.modal-body`/`.modal-footer` trio** — same direct-child-selector conflict Phase 4 found for `erp-lookup-dialog` applies identically here (Drawer's `.avl-drawer__panel > .modal-footer` is just as much a direct-child rule as Dialog's). Only the buttons/`<select>` *inside* them get swapped to `AvlButtonComponent`/`AvlSelectComponent`; `erp-dual-list` is already migrated (Phase 4).

## role-access-control

Same shape as `pages-search`: toolbar buttons (`btn-info/success/primary btn-sm`) → `Button`; AG Grid + `role-actions-cell` handled separately.

## users-search (`user-list.component.*`)

**API/logic:** `ErpListComponent`-based list, AG Grid, `erp-specification-filter`. Two `<ng-template>` modals opened via `DrawerService` (confirmed Phase 3): `createUserModal` (template-driven `ngModel` form, create/edit user, role multi-select via a nested `erp-dual-list` opened from a *second* modal `rolesModal`) and implicitly `rolesModal` itself. Both already on the legacy `.modal-header`/`.modal-body`/`.modal-footer` trio (same conflict as above — kept).

**Bootstrap:** `badge` ×6 (active-filter pills, role chips, selected-count pill), `btn btn-primary/success/secondary/outline-primary` ×~8, `alert alert-info` ×3, `alert alert-warning` ×2, `modal-header`/`modal-body`/`modal-footer` ×2, `form-control` ×2 (username/password in the modal), `form-check`/`form-check-input`/`form-check-label` (enabled switch), Bootstrap grid/position utilities (`position-relative`, `position-absolute`, spinner overlay — kept, layout mechanics).

**Planned mapping:** toolbar buttons → `Button`; role-chip/count/filter badges → `Badge`; `alert-info`/`alert-warning` → `Alert`; username/password/enabled fields inside the modal → `AvlInputComponent` (bound via `[(ngModel)]`, the **first real exercise of CVA under template-driven forms** specifically — a third forms mechanism, distinct from Phase 6a's Signal Forms interop and pages-form's Reactive Forms) and `AvlSwitchComponent`; "select roles"/"done" buttons → `Button`; role chips (`<span class="badge" (click)="quickRemoveRole(role)">`) → `Badge` (still clickable, `Badge` has no built-in click output so the `(click)` stays a plain host binding — acceptable, `Badge` is a presentational primitive, not an interactive one, and this remains a valid native-event usage same as before).
