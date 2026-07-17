> Relocated from `frontend/design-system/NGB-USAGE-INVENTORY.md` on 2026-07-06 as part of the non-functional artifact consolidation.
> See `governance-repo/project-artifacts/CONSOLIDATION-INVENTORY.md`.

# ng-bootstrap Usage Inventory (Phase 3, Step 1)

Full search of `src/app/` for every `ngb*` directive/component, `Ngb*`
TypeScript import, and any raw `data-bs-*`/manual Bootstrap JS usage.
Element-selector forms (`<ngb-pagination>`) were checked in addition to
attribute-directive forms (`ngbDropdown`) — an early attribute-only pass
missed the one real `<ngb-pagination>` usage.

## Modal (`NgbModal` / `NgbActiveModal`)

| File | Pattern | Notes |
|---|---|---|
| `src/app/shared/services/erp-dialog.service.ts` | `NgbModal.open(ConfirmDialogComponent, {...})`, `modalRef.result` promise | **The** real confirm-dialog service. 11 consumers across 6 modules (role-access, pages-registry, user-management, master-lookups, finance/gl) via direct calls + 3 `*-confirm-actions.ts` helper files. `confirm()`/`confirmDelete()`/`confirmDiscard()` all return `Promise<boolean>`. |
| `src/app/core/services/confirm-dialog.service.ts` | Same `NgbModal.open(ConfirmDialogComponent,...)` pattern, near-identical API | **Dead code** — zero consumers found anywhere in `src/app`. A duplicate of `ErpDialogService` from before it existed. Must still be migrated off `NgbModal` (not deleted) since Step 7 requires zero `ngb-*` references repo-wide, and static analysis can't fully rule out a future/dynamic caller. |
| `src/app/core/components/confirm-dialog/confirm-dialog.component.ts` | `NgbActiveModal.close(true)` / `.dismiss()` | The dialog **content** both services above open. Inline `styles:[]` already reference several non-existent/mismatched tokens (`--yellow-500`, `--surface-border`, `--text-color`) — pre-Phase-1 leftovers that Phase 1's `--erp-*`-only audit didn't catch. Will be corrected as part of this rewrite. |
| `src/app/shared/components/erp-lookup-field/erp-lookup-field.component.ts` | `NgbModal.open(ErpLookupDialogComponent, {size:'lg', centered:true})`, `.result.then(...)` | Opens the "advanced" lookup dialog (component-based, not template-based). |
| `src/app/shared/components/erp-lookup-field/erp-lookup-dialog/erp-lookup-dialog.component.ts` | `NgbActiveModal` injected, closes with selected `LookupItem` | The dialog content opened above. **Also** imports `NgbPaginationModule` — see Pagination row below. |
| `src/app/modules/security/role-access/pages/role-access-form/role-access-form.component.ts` | `NgbModal.open(<TemplateRef>, {size, centered})` — **template-ref pattern**, not component-based | Two separate modals: "Add Pages" (`size:'lg'`) and "Copy From" (`size:'md'`). Content is inline `<ng-template #content let-modal>` in the component's own `.html`, tightly coupled to form state — **flagged as risky, handle carefully** (Step 6). |
| `src/app/modules/master-data/master-lookups/components/lookup-detail-form-modal/lookup-detail-form-modal.component.ts` | `NgbModal.open(<TemplateRef>, {...})` | Detail edit form modal, template-ref pattern, form logic inline in template — **flagged as risky**. |
| `src/app/modules/security/user-management/pages/users-search/user-list.component.ts` | `NgbModal.open(<TemplateRef>, {size, centered, scrollable})` ×3 (create-user, assign-roles, one more) | Three separate template-ref modals with inline form/list logic — **flagged as risky**, most template-refs of any single file. |

## Dropdown (`ngbDropdown` / `ngbDropdownToggle` / `ngbDropdownMenu` / `ngbDropdownItem`)

| File | Notes |
|---|---|
| `src/app/theme/layout/admin-layout/nav-bar/nav-right/nav-right.component.html` | Language switcher, notification bell, user-profile menu — reskinned in Phase 2, mechanism untouched. 3 dropdown instances. |
| `src/app/theme/layout/admin-layout/navigation/nav-content/nav-content.component.html` | **Newly discovered** — a redundant mini user-profile dropdown (logout/profile/account links) in the sidebar's bottom "user-profile-section", inside the *active* `layout === 'vertical'` branch (Phase 2 incorrectly assumed this block was compact-layout-only/dead; it is not — see report). Duplicates the topbar user menu built in Phase 2. |

## Tabs (`ngbNav` / `ngbNavItem` / `ngbNavLink` / `ngbNavContent` / `ngbNavOutlet`)

| File | Notes |
|---|---|
| `src/app/theme/layout/admin-layout/nav-bar/nav-right/nav-right.component.html` | The Profile/Settings tab strip inside the user-profile dropdown panel (Phase 2 kept this mechanism, reskinned visuals only). |

## Tooltip (`ngbTooltip`)

| File | Notes |
|---|---|
| `src/app/theme/layout/admin-layout/navigation/nav-content/nav-item/nav-item.component.html` | "You do not have permission to access this page" — shown only when `!isEnabled`. |
| `src/app/theme/layout/admin-layout/navigation/nav-content/nav-collapse/nav-collapse.component.html` | Same tooltip, on both the horizontal and vertical layout `<li>` variants (2 occurrences, 1 file). |

## Pagination (`<ngb-pagination>`)

| File | Notes |
|---|---|
| `src/app/shared/components/erp-lookup-field/erp-lookup-dialog/erp-lookup-dialog.component.html` | One real usage — page controls for the lookup-dialog's result table. Also the only `NgbPaginationModule` import in the repo. |

No other hand-rolled pagination markup exists outside AG Grid (checked `master-lookup-search` and all other list screens — they all use AG Grid's own built-in `paginationChanged` event, confirmed out of scope per the brief).

## Typeahead

**None found.** `erp-autocomplete.component.ts` (flagged by name in Phase 0's audit) does **not** use `ngbTypeahead` at all — it's a hand-rolled implementation using an RxJS `Subject` + `debounceTime(300)` + `distinctUntilChanged` + `switchMap`. Nothing to swap in Step 6. A `Typeahead` spec/component is still designed in Step 5 per the brief's unconditional instruction, for future adoption — not wired into `erp-autocomplete` in this phase (that component's rebuild is Phase 4 shared-component territory).

## Datepicker

**No real usage.** `NgbDatepickerModule` is imported in `src/app/theme/shared/shared.module.ts` but no `ngbDatepicker`/`<ngb-datepicker>` appears anywhere in any template. Dead import. **Not building a Datepicker component** per the brief's explicit instruction to skip it when no real usage exists. The dead `NgbDatepickerModule` import will be removed from `shared.module.ts` in Step 7.

## `data-bs-*` / raw Bootstrap JS

**None found.** (Phase 0 had flagged 3 occurrences of `data-bs-toggle` in the old `nav-left.component.html`/`nav-right.component.html` markup; that markup was already replaced in Phase 2's shell rebuild, and Phase 2's rewritten templates don't carry it forward.)

## Summary counts

| Type | Distinct files | Total usage sites |
|---|---|---|
| Modal | 7 | 12 (2 dialog-services + 1 dialog content + 2 component-based opens + 7 template-ref opens across 3 files) |
| Dropdown | 2 | 4 |
| Tabs | 1 | 1 (2-tab strip) |
| Tooltip | 2 | 3 |
| Pagination | 1 | 1 |
| Typeahead | 0 | 0 (spec designed anyway, per brief) |
| Datepicker | 0 | 0 (not building) |
| `data-bs-*` | 0 | 0 |
