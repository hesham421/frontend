> Relocated from `frontend/design-system/FORM-SUBMIT-AUDIT.md` on 2026-07-06 as part of the non-functional artifact consolidation.
> See `governance-repo/project-artifacts/CONSOLIDATION-INVENTORY.md`.

# Form Submit-Interception Audit

Full inventory of every `<form>` element in `src/app/`, checked against the
rule established by the login bug:

- `[formGroup]` (FormGroupDirective) or a plain `<form>` matched by `NgForm`
  (requires `FormsModule` imported, no `[formGroup]`/`ngNoForm` present) —
  **SAFE by construction**. Both directives carry a `@HostListener('submit')`
  that returns `false`, which Angular's event-plugin turns into
  `event.preventDefault()` — this happens regardless of whether the template
  also has an explicit `(ngSubmit)` binding.
- `(ngSubmit)="handler()"` on a `<form>` with **no** `[formGroup]` and **no**
  `FormsModule` import (so `NgForm` is never instantiated on that form) —
  looks correct, but `ngSubmit` is not a recognized directive output in that
  case. Angular silently treats it as a raw DOM event listener for an event
  named `"ngSubmit"`, which nothing ever dispatches. The handler never
  fires, and the native submit is never intercepted. **This is the exact bug
  class as the original login report — both `auth-login` and
  `auth-register` are currently in this state.**
- A `<form>` with no directive and no submit button inside it — not at risk,
  since there's nothing to trigger native submission.

## Table

| # | File | Mechanism | Submit binding on `<form>` | `type="submit"` button inside form? | Verdict |
|---|------|-----------|------------------------------|--------------------------------------|---------|
| 1 | `security/authentication/pages/auth-login/auth-login.component.html` | Signal Forms (`[field]`), no `[formGroup]`/`FormsModule` | `(ngSubmit)="onSubmit()"` — **dead**, `Field`/Signal-Forms imports don't provide `NgForm` | Yes (`avl-button type="submit"`) | **AT RISK — CONFIRMED BROKEN** (same class as originally reported; `(ngSubmit)` binding added since gives false confidence but doesn't work) |
| 2 | `security/authentication/pages/auth-register/auth-register.component.html` | Signal Forms (`[field]`); `ReactiveFormsModule` is imported in the `.ts` but that module does **not** export `NgForm` | `(ngSubmit)="onSubmit()"` — **dead**, same reason as #1 | Yes (`avl-button type="submit"`) | **AT RISK — CONFIRMED BROKEN** |
| 3 | `security/pages-registry/pages/pages-form/pages-form.component.html` | Reactive Forms, `[formGroup]="pageForm"`, `ReactiveFormsModule` imported | `(ngSubmit)="onSave()"` (also redundant — real save button is `erp-action-bar`'s `(saveClicked)`) | No (`erp-action-bar`'s button defaults to `type="button"`) | SAFE — `FormGroupDirective` always preventDefaults |
| 4 | `security/role-access/pages/role-access-form/role-access-form.component.html` | Reactive Forms, `[formGroup]="roleForm"`, `ReactiveFormsModule` imported | none | No (`avl-button` default `type="button"`) | SAFE — `[formGroup]` present; also no submit button present |
| 5 | `master-data/master-lookups/pages/master-lookup-entry/master-lookup-entry.component.html` | Reactive Forms, `[formGroup]="lookupForm"`, `ReactiveFormsModule` imported | `(ngSubmit)="save()"` | No — the only save button (`erp-action-bar`) lives outside `</form>` | SAFE — `[formGroup]` present; also no submit button inside form |
| 6 | `master-data/master-lookups/components/lookup-detail-form-modal/lookup-detail-form-modal.component.html` | Reactive Forms, `[formGroup]="detailForm"`, `ReactiveFormsModule` imported | none | No — Save/Cancel buttons are in `modal-footer`, outside `</form>`, both `type="button"` | SAFE |
| 7 | `security/user-management/pages/users-search/user-list.component.html` (create/edit user modal) | Template-driven (`[(ngModel)]` + `[name]`), plain `<form autocomplete="off">`, `FormsModule` imported, no `[formGroup]`/`ngNoForm` | none | No — Save/Cancel buttons are in `modal-footer`, outside `</form>`, both invoked via `avl-button`'s `(clicked)` output | SAFE — `NgForm` auto-attaches (`FormsModule` imported); also no submit button inside form |
| 8 | `shared/components/erp-lookup-field/_example/invoice-form-example.component.ts` (inline template) | Reactive Forms, `[formGroup]="invoiceForm"` | none | No button in the template at all | SAFE (also: explicitly a doc/reference file, not wired into routing) |

Note: `security/authentication/pages/forgot-password/forgot-password.component.html`
was flagged by git status as modified but contains **no `<form>` element at
all** (just an `avl-input` and an `avl-button type="button"` with no click
handler) — out of scope for this audit since there's no form to intercept,
but flagged separately below since the button does nothing.

## Counts

- Total `<form>` elements found: **8**
- SAFE: **6** (#3, #4, #5, #6, #7, #8)
- AT RISK — CONFIRMED BROKEN: **2** (#1 auth-login, #2 auth-register)
- AT RISK — UNVERIFIED: **0**

## Governance note (out of scope, flagged for visibility)

`governance-repo`'s `enforce-frontend-architecture` and `create-components`
skills mandate Reactive Forms (`FormGroup + FormBuilder`) exclusively and
list Signal Forms as an automatic rejection trigger (rule F.5.9 / B.4.8).
`auth-login` and `auth-register` use Signal Forms (`@angular/forms/signals`),
which is a pre-existing governance violation predating this engagement. Per
this task's explicit guardrails, the fix below is scoped strictly to
submit-interception — it does not migrate these two screens to Reactive
Forms. That migration would be a separate, larger effort.

## Fixes applied

### 1. `auth-login.component.html` / `.ts`
- **What was wrong:** `<form (ngSubmit)="onSubmit()">` with no `FormsModule`
  import — `(ngSubmit)` never fires, native submit reloads the page.
- **Fix:** Replaced the binding with `(submit)="onSubmit($event)"` and added
  `event.preventDefault()` as the first line of the existing `onSubmit()`
  method (renamed its parameter list to accept the `Event`). No other logic
  changed.

### 2. `auth-register.component.html` / `.ts`
- **What was wrong:** Same class of bug as #1 — `(ngSubmit)="onSubmit()"`
  with only `ReactiveFormsModule` imported (which does not export `NgForm`).
- **Fix:** Same pattern — `(submit)="onSubmit($event)"` +
  `event.preventDefault()` as the first line of `onSubmit()`.

No form was found with a completely missing handler method — both `AT RISK`
forms already had a fully-implemented `onSubmit()` calling the real
`AuthenticationService` login/register endpoints; they were only ever
missing the actual interception wiring.

## Build status

See final report in conversation — `ng build --configuration development`
run after the fixes above.
