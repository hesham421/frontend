> Relocated from `frontend/design-system/AG-GRID-THEMING-AUDIT.md` on 2026-07-06 as part of the non-functional artifact consolidation.
> See `governance-repo/project-artifacts/CONSOLIDATION-INVENTORY.md`.

# AG Grid Theming Audit (Phase 5, Step 1)

## Which theming system is active

**The new JS Theming API (`themeQuartz.withParams()`)**, not the legacy
`ag-theme-*` CSS-class system — confirmed, not assumed:

- `src/app/shared/ag-grid/agGridTableStyle.ts` calls
  `themeQuartz.withParams({...})` and exports `createAgGridTheme(isDark)`.
- Every one of the 4 real `<ag-grid-angular>` consumers binds `[theme]`
  (or `[theme]="theme()"`) to the result of that function.
- `ag-grid-angular`/`ag-grid-community` are both pinned to `35.0.0`
  (checked `node_modules/*/package.json` directly), which ships the
  Theming API as the primary/recommended mechanism.

**Anti-pattern found (not touched — cosmetic, not functional):** 3 of the
4 consumers (`role-access-control`, `pages-search`, `master-lookup-search`)
still carry a leftover `class="ag-theme-alpine"` on the `<ag-grid-angular>`
element alongside the `[theme]` binding. AG Grid's own docs call mixing
the legacy class with the Theming API an anti-pattern. In practice it's
inert here — `pages-search.component.scss`'s only rule under
`.ag-theme-alpine` is `width: 100%` (a layout hook, not a color override),
and the class contributes no legacy stylesheet since none of
`ag-theme-alpine.css`/etc. is imported anywhere in `styles.scss` or
`angular.json`. `user-list.component.html` has already dropped the class
and uses `[theme]="theme()"` alone — the "correct" pattern. Left as-is per
the modules/ guardrail; worth a Phase 6 cleanup pass.

## Every `<ag-grid-angular>` instance (exactly 4, not 5)

1. `src/app/modules/security/role-access/components/role-access-control/role-access-control.component.html`
2. `src/app/modules/security/pages-registry/pages/pages-search/pages-search.component.html`
3. `src/app/modules/security/user-management/pages/users-search/user-list.component.html`
4. `src/app/modules/master-data/master-lookups/pages/master-lookup-search/master-lookup-search.component.html`

**Correction to the Phase 5 brief's premise:** the GL Chart of Accounts
screen (`src/app/modules/finance/gl/pages/accounts-tree/`) does **not**
use AG Grid at all — it's a hand-rolled recursive `<ng-template>` tree
(plain divs/buttons, its own `.scss`), not AG Grid's tree-data feature.
There is no grid there to theme, and no tree-indent/expand-icon AG Grid
concern to check. (This is the third time in this migration a phase brief
assumed a component's implementation that didn't match reality — same
category of mismatch as Phase 4's `erp-crud-actions-cell`/AG-Grid-cell-
renderer assumption.)

Theme applied **uniformly**: all 4 call the same shared
`createAgGridTheme(isDark)` factory — a single change to that one file
reaches every grid with zero per-template edits.

## Manual RTL `!important` overrides found in `src/styles.scss`

Inside the existing `body.mantis-rtl { ... }` block (lines 98–113),
scoped specifically to AG Grid:

```scss
.ag-root-wrapper,
.ag-root,
ag-grid-angular {
  direction: rtl !important;
}

.ag-header-cell-label {
  flex-direction: row-reverse;
}

.ag-cell,
.ag-header-cell-text,
.ag-floating-filter-input {
  text-align: right;
}
```

The rest of that `body.mantis-rtl` block (icon mirroring, button icon
spacing, `.modal-header` reversal) is unrelated to AG Grid and stays.

## Current RTL mechanism — already correctly wired, not missing

`enableRtl` is confirmed still valid in AG Grid 35
(`gridOptions.d.ts` — `@default false` / `@initial`). The `@initial` tag
means it is read once at grid construction and **cannot** be changed live
via `setGridOption()` — the grid must be destroyed and recreated for a
runtime RTL flip to take effect.

All 4 consumers already implement exactly that, independently:

- Each grid's own `*-grid.config.ts` computes
  `enableRtl: translate.currentLang === 'ar'` (or an `isRtl` local) at
  `gridOptions` construction time.
- Each component subscribes to `translate.onLangChange`, and on every
  change: recomputes filter options, column defs, and grid options, then
  forces the `<ag-grid-angular>` to unmount/remount via a `showGrid`
  boolean (`role-access-control`, `pages-search`, `master-lookup-search`)
  or `signal<boolean>` (`user-list`) toggled `false` → `true` across a
  `setTimeout`/tick, gated by `@if (showGrid)` / `@if (showGrid())` in
  each template.

This is a real, working solution to the exact "initial-only property +
runtime direction switching" problem the brief anticipated — it predates
this phase and required no new plumbing. The app-wide `body.mantis-rtl`/
`mantis-ltr` toggle (Phase 2, driven by `LanguageService.direction()`) is
independent of this — it's what the manual CSS overrides above hook into,
separately from AG Grid's own `enableRtl`.
