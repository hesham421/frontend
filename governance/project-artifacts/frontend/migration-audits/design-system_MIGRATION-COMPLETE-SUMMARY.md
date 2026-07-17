> Relocated from `frontend/design-system/MIGRATION-COMPLETE-SUMMARY.md` on 2026-07-06 as part of the non-functional artifact consolidation.
> See `governance-repo/project-artifacts/CONSOLIDATION-INVENTORY.md`.

# AVELYNQ Design System Migration — Complete (Phase 7 close-out)

This is the final report for the multi-phase migration from the Mantis
Bootstrap theme to the AVELYNQ design system. Phases 0–6d migrated every
routed screen and shared component; this phase (7) fixed the last blocking
test-suite issue, removed confirmed dead code, closed a real shared-primitive
gap, and ran the final verification gate.

## What changed, end to end

- **Foundation (Phase 0–1):** Tabler icon font upgraded to v3.44.0
  (`src/scss/fonts/tabler-icons-v3.min.css`), design tokens (`src/scss/avelynq/tokens/`)
  established, ~92 `--erp-*` custom properties migrated to AVELYNQ tokens
  (4 genuinely-unmappable ones deliberately kept — see below), raw hardcoded
  hex colors traced to tokens.
- **RTL fix (Phase 2):** `rtl.scss`'s ~300 lines of `pc-sidebar`/`coded-*`
  physical-property overrides removed — dead against the new logical-
  property/flexbox shell, and actively conflicting for real Arabic-language
  users.
- **ng-bootstrap removal (Phase 3):** `@ng-bootstrap/ng-bootstrap` fully
  removed; `Dialog`/`Drawer`/`Dropdown`/`Tooltip`/`Typeahead`/`Pagination`/
  `Toast` overlay primitives built to replace it (see "needs human review"
  below).
- **Shared component library (Phase 4):** `Button`, `IconButton`, `Input`,
  `Select`, `Checkbox`, `Switch`, `Card`, `Badge`, `Avatar`, `Alert`,
  `EmptyState`, `Breadcrumb` built under `src/app/shared/`, composed into
  `erp-*` wrapper components (`erp-form-field`, `erp-crud-actions-cell`,
  `erp-empty-state`, `erp-action-bar`, etc.).
- **AG Grid theming (Phase 5):** all 4 grid instances re-themed via the JS
  Theming API (`themeQuartz.withParams()`), tokens throughout.
- **Module migrations (Phase 6a–6d):** Security (auth, pages registry,
  role access, user management), Master Data (master lookups), and Finance
  (GL chart of accounts) — every real screen migrated screen-by-screen,
  preserving business logic exactly. The critical login/register native-
  form-submit bug (`FORM-SUBMIT-AUDIT.md`) was found and fixed during this
  work.
- **Final cleanup (Phase 7, this phase):** see below.

## Phase 7 — what was done

1. **Test suite unblocked.** `role-access-api.service.spec.ts` referenced a
   `getRoles` method that never existed on the real service (confirmed via
   git history — both files were introduced together in this mismatched
   state; not a regression). Fixed to call the real `searchRoles`/POST
   contract. Fixing this compile error exposed 3 further pre-existing
   runtime failures masked by it the whole time: a missing `RoleAccessApiService`
   provider in that same spec's `TestBed` config, a `MockRoleAccessFacade`
   missing a `clearCurrentEntity` spy (`role-access-form.component.spec.ts`),
   and `role-access.facade.spec.ts`'s mock/assertions also referencing the
   nonexistent `getRoles` API. All fixed as test-infrastructure repairs.
   **Full suite: 49/49 passing.**

   **Flagged, not fixed (business logic, out of this phase's scope):**
   `RoleAccessFacade.toContractFilters()` ignores the EQ/LIKE operator
   distinction entirely for the 'search' field — always emits `CONTAINS` —
   even though the real advanced-filter UI (`role-access-grid.config.ts`)
   offers a selectable "Equals" operator. A user picking "Equals" today
   silently gets a substring match instead. This is a real product gap,
   not test staleness; needs a human product decision, not a design-system
   fix.

2. **Dead code removed.** `<app-configuration/>` (Mantis theme-customizer
   panel, UI already stripped in Phase 2) removed from both
   `admin-layout.component.html` and `guest-layout.component.html`,
   including its imports and the entire
   `src/app/theme/layout/admin-layout/configuration/` directory (3 files:
   `.ts`, `.html`, `.scss`).

   **Bonus finding:** this component's `ngOnInit()` was adding a
   `body.public-sans` class on every page load (`MantisConfig.font_family`).
   Since Bootstrap's `$font-family-base` is already wired to the AVELYNQ
   `--font-sans` token, and `body.public-sans` is a more specific selector,
   this was **silently overriding the intended AVELYNQ font token with the
   legacy Mantis "Public Sans" Google Font on every page in the entire
   app**. Removing the component fixes this — not just cleanup, a real
   (if low-visibility) bug fix. `src/scss/theme/components/font-family.scss`
   (the `.public-sans`/`.Roboto`/`.Inter`/`.Poppins` rules + their Google
   Fonts `@import`s) is now fully dead code but was **not** deleted — out
   of this task's explicit file-deletion scope (component files only);
   flagged here for a follow-up cleanup pass.

3. **`dark.scss` — documented as out of scope, not touched.** Unlike
   `rtl.scss` (RTL is live/reachable via Arabic language support), dark
   mode has zero reachable UI entry points anywhere in the app
   (`ThemeService.toggleDarkMode()` has no callers — confirmed by Phase 5's
   own AG-Grid theming audit comment) and AVELYNQ has never defined a dark
   palette. Removing the file's `pc-sidebar`/`pc-header`/`coded-*` selectors
   wouldn't fix anything real, since there's no AVELYNQ dark styling to
   complete the picture — even for the one narrow edge case where a
   returning user's stale `localStorage` (`erp_dark_mode: true`, predating
   this migration) could still trigger `body.mantis-dark`, the result would
   render broken either way (the new shell's `avl-sidebar` etc. don't match
   this file's `pc-sidebar` selectors regardless). A header comment was
   added to `dark.scss` documenting this status for future maintainers. A
   real dark-mode migration is a separate project requiring its own
   token-mapping pass.

4. **`AvlInputComponent` attribute passthrough — fixed.** Added
   `maxlength`, `minlength`, `min`, `max`, `pattern`, `autocomplete`, `dir`
   as explicit `@Input()`s, forwarded to the internal native `<input>` via
   `[attr.*]` bindings (so unset inputs don't render the attribute at all).
   This was chosen over a generic "forward everything" approach for
   explicitness and because a real-consumer sweep
   (`grep` across every `avl-input` usage in `src/app/`) showed exactly
   this set in use — no more, no less.

   Restored the previously-dropped attributes on all 4 real consumers now
   that the primitive supports them (a strict improvement, not a behavior
   change to guard): `pages-form` (`min="0"` on displayOrder, `dir="rtl"`
   on nameAr), `master-lookup-entry` (`maxlength` on all 3 text fields),
   `lookup-detail-form-modal` (`maxlength` ×4, `min="0"` on sortOrder), and
   `accounts-tree` (`maxlength="200"` on all 3 accountChartName inputs).

   **Also fixes a live, more serious gap found during the sweep:**
   `user-list.component.html`'s username/password fields already had
   `autocomplete="off"`/`autocomplete="new-password"` set directly on
   `<avl-input>`, expecting real browser autofill-suppression behavior —
   which had zero effect until this fix, since the attribute sat on the
   custom element's host tag, never reaching the real `<input>` the browser
   inspects. This is now live and working, with no consumer-file change
   needed (the attributes were already there, just previously inert).

   Rebuilt and re-ran the full test suite after the primitive change —
   build clean, 49/49 tests passing, no downstream type-assumption breakage
   in any of the 4 consumers (all bind through `formControlName`/`ngModel`,
   none read `.maxLength`-style properties off the component directly).

5. **Lockfile.** `yarn.lock` deleted. `package.json` now declares
   `"engines": { "npm": ">=9.0.0" }`, and `CLAUDE.md`'s "Running Locally"
   section states npm as the standard package manager going forward.

6. **Icon rows — both already resolved (no action needed).** Re-checked
   `fa-question-circle` and `fa-2x` (the two `needs-review` rows Phase 1
   left open): `confirm-dialog.component.ts` already uses `ti ti-help` for
   the "question" tone; `dashboard.component.html`'s `fa-2x`-paired lock
   icon is already sized via a real CSS rule
   (`.dash-empty i { font-size: 2rem; }`) instead of the old FontAwesome
   utility class — consistent with the same hardcoded-icon-size pattern
   already used by the shared `avl-empty-state` primitive itself (`26px`,
   not a token either). Both were resolved by earlier phases; the map
   file's "needs-review" status was simply stale.

## Step 5 — final verification results (explicit, not just "clean")

- **`ng build --configuration production`:** passes. Zero TypeScript/AOT
  errors, zero budget violations (2MB initial / 8KB per-component-style
  budgets both configured as hard errors in `angular.json` — neither
  triggered). Only pre-existing, unrelated warnings (2 unused-import
  `NG8113` warnings, 1 optional-chaining `NG8107` hint, ~70 expected Sass
  `@import`-deprecation notices from Bootstrap's own source files).
- **`ng test` (ChromeHeadless, full suite):** **49/49 passing.**
- **`grep -rn -- "--erp-"` across `src/`:** **not zero — 4 tokens remain**,
  all pre-existing and explicitly documented as deliberate, unresolved
  `NEEDS DECISION` residuals in `TOKEN-MIGRATION-MAP.md` (down from an
  original 92): `--erp-color-border-light` (`erp-dual-list`),
  `--erp-autocomplete-max-height` (`erp-autocomplete`),
  `--erp-lookup-max-height` (`erp-lookup-dialog`), and
  `--erp-notification-width` (`erp-notification-container`) — each has no
  clean 1:1 AVELYNQ token equivalent (translucent-border semantic;
  component-owned literal max-heights/widths). **Confirmed: nothing new
  crept in** — this is the exact same residual set Phase 1 already flagged,
  unchanged. The `--erp-z-*` scale mentioned in the same map was fully
  renamed to `--z-*` and has zero remaining references.
- **`ngb-*`/`NgbModule`/`ng-bootstrap` search:** **zero live usage.**
  `@ng-bootstrap/ng-bootstrap` is not in `package.json`. The only textual
  matches (4 files) are comments *documenting* the historical removal
  (e.g. "previously ng-bootstrap's NgbModal") — no imports, no template
  tags.
- **Raw Bootstrap component classes inside `src/app/shared/components/`
  (`btn btn-*`, `.modal-*`, `.alert-*`, `.badge`, `.card`; grid/layout
  utilities excepted):** **one hit, and it's the documented Phase 4
  exception** — `erp-lookup-dialog.component.html` still uses the legacy
  `.modal-header`/`.modal-body`/`.modal-footer` trio, deliberately kept
  due to a direct-child CSS selector conflict with `Drawer`'s footer (the
  same conflict re-confirmed independently in both the Master Data and
  Finance module audits for their own legacy-trio modals).
- **`@ant-design/icons-angular` usage:** confirmed to **6 files**, all
  legitimately part of the one documented, permanent exception (the
  DB-driven dynamic navigation menu and its breadcrumb):
  `nav-content.component.ts`, `nav-right.component.ts`,
  `nav-left.component.ts`, `breadcrumb.component.ts`, `shared.module.ts`
  (exports `IconDirective`), and `safe-ant-icon.pipe.ts` (the dedicated
  `ti-*` → Ant SVG translation layer). `auth-login.component.ts` — cited
  as a consumer in the original Phase 1 audit — no longer references it at
  all (migrated away during Phase 6a's rebuild). No stray usage found
  anywhere in `src/app/modules/`.

## Permanently out of scope, and why

- **The DB-driven dynamic menu's `@ant-design/icons-angular` dependency** —
  the one deliberate, permanent exception in this entire migration. The
  menu system is driven by database-stored icon strings resolved at
  runtime via `SafeAntIconPipe`; rebuilding this is a data-model change,
  not a design-system change.
- **Dark mode** — never migrated, unreachable via any UI in the current
  app, no AVELYNQ dark palette exists. See item 3 above.
- **Bootstrap's grid/layout utility classes** (`row`, `col-*`, `g-*`,
  `offset-*`, flex/position utilities) — explicitly out of scope for
  removal in every phase of this engagement, by established policy. These
  are layout mechanics, not themed components.

## ⚠️ Needs real human design review — not an agent decision

Five AVELYNQ "extension" components were built during Phase 3 to replace
`ng-bootstrap` and avoid an indefinite dependency on it, **not** because
they were pre-approved, signed-off AVELYNQ components:

- `design-system/avelynq-extensions/Dropdown.prompt.md`
- `design-system/avelynq-extensions/Pagination.prompt.md`
- `design-system/avelynq-extensions/Toast.prompt.md`
- `design-system/avelynq-extensions/Tooltip.prompt.md`
- `design-system/avelynq-extensions/Typeahead.prompt.md`

They are built, shipped, and in active use across the app today (confirmed
throughout every module audit in this engagement). But their visual design,
interaction details, and API shape were derived by extrapolating from
AVELYNQ's existing component patterns under delivery pressure — they have
**not** received a real design review from a human with actual AVELYNQ
design authority. This is explicitly flagged as the one piece of this
entire migration that still needs a person's own design judgment before it
can be considered a genuinely "done" part of the design system, not
something any further agent work can resolve.
