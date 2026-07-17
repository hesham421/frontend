> Relocated from `frontend/design-system/TOKEN-MIGRATION-MAP.md` on 2026-07-06 as part of the non-functional artifact consolidation.
> See `governance-repo/project-artifacts/CONSOLIDATION-INVENTORY.md`.

# AVELYNQ Token Migration Map

**Phase:** 0 — Analysis & Documentation only (no source files modified)
**Generated:** 2026-07-04
**Source design system:** `design-system/avelynq-source/` (copied verbatim from `~/Downloads/AVELON Design System`)
**Scope:** Every `--erp-*` token definition/consumer, every raw hardcoded hex color, and every Bootstrap SASS/CSS-var usage found under `src/`.

> Counts were produced with `grep`/`find` over `src/` on 2026-07-04. "Consumers (count)" is the number of **files** referencing the old name/value outside its own definition site, unless noted otherwise. Re-run the searches before Phase 1 execution if the branch has moved since this snapshot.

---

## 1. Colors

| Old Name | Old Value | New AVELYNQ Token | New Value | Consumers (count) | Consumer File Paths | Notes |
|---|---|---|---|---|---|---|
| `--erp-color-border` | `var(--bs-border-color, #dee2e6)` | `--border-subtle` | `var(--slate-200)` = `#D4DDE7` | 6 | `erp-ui.scss`; `erp-action-bar.component.scss`; `erp-section.component.scss`; `erp-readonly-hint.component.scss`; `erp-empty-state.component.scss`; `erp-autocomplete.component.scss` | Value delta: `#dee2e6` vs `#D4DDE7` (close, cool-gray family). |
| `--erp-color-text` | `var(--bs-body-color, #212529)` | `--text-strong` | `var(--slate-900)` = `#14222F` | 5 | `erp-ui.scss`; `erp-section.component.scss`; `erp-readonly-hint.component.scss`; `erp-empty-state.component.scss`; `erp-form-field.component.scss` | Old value is neutral gray-black; AVELYNQ strong text is navy-tinted — visible hue shift on migration. |
| `--erp-color-text-muted` | `var(--bs-secondary-color, #6c757d)` | `--text-muted` | `var(--slate-500)` = `#647488` | 5 | `erp-ui.scss`; `erp-section.component.scss`; `erp-readonly-hint.component.scss`; `erp-empty-state.component.scss`; `erp-form-field.component.scss` | Close match, both mid-gray. |
| `--erp-color-danger` | `var(--bs-danger, #dc3545)` | `--status-danger` | `var(--red-600)` = `#A92E23` | 2 (+3 raw-hex sites below) | `erp-ui.scss`; `erp-form-field.component.scss` | Bootstrap red is brighter/more saturated than AVELYNQ's restrained red-600. |
| `--erp-color-bg` | `var(--bs-body-bg, #ffffff)` | `--surface-card` | `#FFFFFF` | 3 (+4 raw-hex `#fff` sites below) | `erp-ui.scss`; `erp-autocomplete.component.scss`; `erp-lookup-dialog.component.scss` | Exact value match. |
| `--erp-color-bg-subtle` | `var(--bs-tertiary-bg, #f8f9fa)` | `--surface-hover` | `var(--slate-50)` = `#F1F5F9` | 3 | `erp-ui.scss`; `erp-autocomplete.component.scss`; `erp-lookup-dialog.component.scss` | `--surface-page` (also slate-50) is an equally valid candidate — role (hover vs page bg) must be confirmed per usage site in Phase 1. |
| `--erp-color-primary` | `var(--bs-primary, #0d6efd)` | `--brand-primary` | `var(--blue-500)` = `#2466D8` | 2 (+6 raw-hex `var(--bs-primary,#0d6efd)` sites in `accounts-tree.component.scss`) | `erp-ui.scss`; `erp-autocomplete.component.scss` | Largest brand-defining delta in the map: Bootstrap blue `#0d6efd` (bright/saturated) → AVELYNQ blue-500 `#2466D8` (deeper, enterprise navy-blue). All primary-colored UI will visibly shift. |
| `--erp-color-bg-muted` | `var(--bs-secondary-bg, #e9ecef)` | `--surface-sunken` | `var(--slate-100)` = `#E6ECF3` | 1 | `erp-ui.scss` | Close match. |
| `--erp-color-warning` | `var(--bs-warning, #ffc107)` | `--status-warning` | `var(--amber-600)` = `#A4640A` | 1 (+1 raw-hex site in `accounts-tree.component.scss`) | `erp-ui.scss` | Large delta: Bootstrap warning is a bright yellow; AVELYNQ warning is a muted amber — deliberate "no startup styling" brand choice. |
| `--erp-color-success` | `var(--bs-success, #198754)` | `--status-success` | `var(--green-600)` = `#17804D` | 1 (+4 raw-hex sites in `accounts-tree.component.scss`) | `erp-ui.scss` | Close match. |
| `--erp-color-info` | `var(--bs-info, #0dcaf0)` | `--status-info` | `var(--info-600)` = `#1B54BC` | 1 | `erp-ui.scss` | **NEEDS DECISION** — Bootstrap info is cyan; AVELYNQ has no cyan semantic, `--status-info` is blue-family. Large hue delta; confirm this is acceptable or if a new `--status-info-cyan` alias is needed. |
| `--erp-color-text-light` | `var(--bs-tertiary-color, #adb5bd)` | `--text-subtle` | `var(--slate-400)` = `#8C9AAC` | 0 | *(none — defined, unused)* | Zero real consumers found; safe to migrate or drop. |
| `--erp-color-secondary` | `var(--bs-secondary, #6c757d)` | `NEEDS DECISION` | — | 0 (+12 raw-hex `#6c757d` sites, see below) | *(token itself unused; raw hex used directly instead)* | No dedicated AVELYNQ "secondary" semantic exists — closest is `--text-muted` (slate-500) but that collides with the `--erp-color-text-muted` mapping above. Needs a naming decision before Phase 1. |
| `--erp-color-border-light` | `var(--bs-border-color-translucent, rgba(0,0,0,0.175))` | `NEEDS DECISION` | — | 0 | *(none)* | AVELYNQ has no translucent/alpha border token. Could compose via `color-mix()` off `--border-subtle`, but no existing token to map to 1:1. |

### Raw hardcoded hex colors (migration candidates, not routed through `--erp-*` at all)

| Old Name | Old Value | New AVELYNQ Token | New Value | Consumers (count) | Consumer File Paths | Notes |
|---|---|---|---|---|---|---|
| `#dee2e6` (raw + `var(--bs-border-color, #dee2e6)`) | `#dee2e6` | `--border-subtle` | `#D4DDE7` | 7 files | `dashboard.component.scss`; `accounts-tree.component.scss`; `erp-action-bar.component.scss`; `erp-section.component.scss`; `erp-readonly-hint.component.scss`; `erp-empty-state.component.scss`; `erp-autocomplete.component.scss` | 13 total line occurrences. `dashboard` and `accounts-tree` bypass `--erp-color-border` and fall back straight to `--bs-border-color` — these should be re-routed through the `--erp-*` (then AVELYNQ) layer, not just re-valued. |
| `#6c757d` | `#6c757d` | `--text-muted` (or the `NEEDS DECISION` secondary alias above) | `#647488` | 3 files (12 line occurrences) | `dashboard.component.scss` (2 bare hardcodes); `accounts-tree.component.scss` (9× as `var(--bs-secondary, #6c757d)` fallback); `access-denied.component.scss` (1 bare hardcode) | Mixed pattern: bare hardcode in 2 files, Bootstrap-var-fallback in 1. |
| `#dc3545` | `#dc3545` | `--status-danger` | `#A92E23` | 5 files (9 occurrences) | `dashboard.component.scss`; `accounts-tree.component.scss`; `access-denied.component.scss`; `erp-form-field.component.scss`; `pages-form.component.scss` | `erp-form-field.component.scss` already also uses `--erp-color-danger` — this file has both a token reference and an independent bare hardcode; needs line-level review in Phase 1. |
| `#fff` / `#ffffff` | `#fff` | `--surface-card` | `#FFFFFF` | 5 files (8 occurrences) | `dashboard.component.scss`; `accounts-tree.component.scss`; `erp-action-bar.component.scss`; `erp-lookup-field.component.scss`; `erp-autocomplete.component.scss` | Exact value match, purely a token-routing exercise. |
| `#4680ff` | `#4680ff` | `NEEDS DECISION` (closest: `--blue-400` `#4078E2`) | — | 2 files (6 occurrences) | `dashboard.component.scss`; `erp-autocomplete.component.scss` | Not a Bootstrap fallback — an independently chosen custom blue. Closest AVELYNQ scale color is `blue-400`, delta is visible (`#4680ff` is brighter/more saturated). Needs a design decision, not an automatic swap. |
| `#0d6efd` | `#0d6efd` | `--brand-primary` | `#2466D8` | 1 file (6 occurrences, all as `var(--bs-primary, #0d6efd)`) | `accounts-tree.component.scss` | Same brand-primary delta noted above; this file bypasses `--erp-color-primary` entirely. |
| `#f8f9fa` | `#f8f9fa` | `--surface-hover` / `--surface-page` | `#F1F5F9` | 3 files (5 occurrences) | `accounts-tree.component.scss` (2×, via `var(--bs-light, #f8f9fa)`); `erp-autocomplete.component.scss`; `erp-lookup-dialog.component.scss` | Same ambiguity as `--erp-color-bg-subtle` above — confirm hover vs page role per site. |
| `#212529` | `#212529` | `--text-strong` | `#14222F` | 2 files (3 occurrences, all as `var(--bs-body-color, #212529)`) | `dashboard.component.scss`; `accounts-tree.component.scss` | Bypasses `--erp-color-text`. |
| `#d4a005` | `#d4a005` | `NEEDS DECISION` (closest: `--amber-500` `#C77D11`) | — | 1 file (2 occurrences) | `dashboard.component.scss` | Custom gold/yellow accent with no clean AVELYNQ match — `amber-500` is the nearest scale step but the hue/saturation delta is large. |
| `#28a745` | `#28a745` | `--status-success` (closest: `--green-600` `#17804D`) | `#17804D` | 1 file (1 occurrence) | `dashboard.component.scss` | Old Bootstrap 4-era success green; delta is moderate. |
| `#17a2b8` | `#17a2b8` | `NEEDS DECISION` | — | 1 file (1 occurrence) | `dashboard.component.scss` | Old Bootstrap 4-era cyan "info" — AVELYNQ has no cyan family at all; closest is `--status-info` (blue-family, `#1B54BC`), large hue delta. |
| `#ffc107` | `#ffc107` | `--status-warning` | `#A4640A` | 1 file (1 occurrence, via `var(--bs-warning, #ffc107)`) | `accounts-tree.component.scss` | Same delta as `--erp-color-warning` above. |
| `#f5f7fa` | `#f5f7fa` | `--surface-page` (closest: `slate-50` `#F1F5F9`) | `#F1F5F9` | 1 file | `access-denied.component.scss` | Part of a fully custom, non-token error page (see note below). |
| `#c3cfe2` | `#c3cfe2` | `NEEDS DECISION` | — | 1 file | `access-denied.component.scss` | Decorative gradient stop on the 404/403 error page — no semantic AVELYNQ token represents a gradient stop; would need to move to `--brand-gradient` or be redesigned. |
| `#777` | `#777777` | `--text-muted` (closest: `slate-500` `#647488`) | `#647488` | 1 file | `access-denied.component.scss` | |
| `#5a6268` | `#5a6268` | `--text-muted` (closest: `slate-600` `#4A5A6E`) | `#4A5A6E` | 1 file | `access-denied.component.scss` | |
| `#555` | `#555555` | `--text-body` (closest: `slate-700` `#354456`) | `#354456` | 1 file | `access-denied.component.scss` | |
| `#333` | `#333333` | `--text-strong` (closest: `slate-800` `#20303F`) | `#20303F` | 1 file | `spinner.component.scss` | |
| `#2c3e50` | `#2c3e50` | `--brand-ink` (closest: `navy-850` `#0A1628`) or `--text-strong` | — | 1 file | `access-denied.component.scss` | **NEEDS DECISION** — this is a dark navy-ish slate not on either the `slate-*` or `navy-*` scale exactly; delta is large either way. |
| `#007bff` | `#007bff` | `--brand-primary` (closest: `blue-500` `#2466D8`) | `#2466D8` | 1 file | `access-denied.component.scss` | Old Bootstrap 4 primary blue — same brand delta as `#0d6efd` above. |
| `#0056b3` | `#0056b3` | `--brand-primary-hover` (closest: `blue-700` `#16459C`) | `#16459C` | 1 file | `access-denied.component.scss` | Old Bootstrap 4 primary-hover — `access-denied.component.scss` is an isolated Bootstrap-4-era hardcoded page (10 distinct hex values, all 1 occurrence each); flagged as a single-file rewrite candidate for Phase 1 rather than a token-by-token migration. |
| `#f1f1f1` | `#f1f1f1` | `--surface-sunken` (closest: `slate-100` `#E6ECF3`) | `#E6ECF3` | 1 file | `spinner.component.scss` | Spinner track color. |

### Bootstrap SASS variables / `--bs-*` CSS custom properties

| Old Name | Old Value | New AVELYNQ Token | New Value | Consumers (count) | Consumer File Paths | Notes |
|---|---|---|---|---|---|---|
| `--bs-body-color` | Bootstrap-generated | `--text-strong` / `--text-body` | — | 58 total occurrences across 22 files | Mostly internal to `src/scss/theme/**` (Mantis theme engine — 17 files) | Only **3 app-level files** consume it directly, bypassing `--erp-color-text`: `dashboard.component.scss`, `accounts-tree.component.scss` (×3 combined), `erp-tokens.scss` (as the token's own delegation base, expected). |
| `--bs-border-color` | Bootstrap-generated | `--border-subtle` | — | 29 occurrences across the same 22-file set | See above | App-level direct consumers (bypassing `--erp-color-border`): `dashboard.component.scss`, `accounts-tree.component.scss` (×6). |
| `--bs-primary` | Bootstrap-generated, `#0d6efd` | `--brand-primary` | `#2466D8` | 20 occurrences | Theme-internal + `accounts-tree.component.scss` (×6), `dashboard.component.scss` (×2), `lookup-details-section.component.scss` (×1) | Highest-traffic Bootstrap-var bypass of the `--erp-*` layer; prioritize for Phase 1. |
| `--bs-primary-rgb` | Bootstrap-generated | `NEEDS DECISION` | — | 14 occurrences, theme-internal only | none at app level | No RGB-triplet variant exists among the AVELYNQ semantic aliases; would need a derived `color-mix()`/`rgb()` helper if an app-level consumer needs it later. |
| `--bs-secondary` | Bootstrap-generated, `#6c757d` | See `--erp-color-secondary` `NEEDS DECISION` above | — | 13 occurrences | Theme-internal + `accounts-tree.component.scss` (×9) | |
| `--bs-body-bg` | Bootstrap-generated, `#ffffff` | `--surface-card` | `#FFFFFF` | 11 occurrences | Theme-internal + `dashboard.component.scss`, `accounts-tree.component.scss` (×3), `erp-lookup-field.component.scss` | |
| `--bs-success` | Bootstrap-generated | `--status-success` | `#17804D` | 6 occurrences | Theme-internal + `accounts-tree.component.scss` (×4) | |
| `--bs-dropdown-link-color` | Bootstrap-generated | `NEEDS DECISION` | — | 6 occurrences, theme-internal only | none at app level | Dropdown internals owned by Mantis/ng-bootstrap theming, not an app-level token consumer — out of scope for this migration pass. |
| `--bs-secondary-color` | Bootstrap-generated | `--text-muted` | `#647488` | 3 occurrences | Theme-internal + `dashboard.component.scss` (×2) | |
| `--bs-danger` | Bootstrap-generated | `--status-danger` | `#A92E23` | 3 occurrences | Theme-internal + `accounts-tree.component.scss` (×1) | |
| `--bs-light` | Bootstrap-generated, `#f8f9fa` | `--surface-hover` / `--surface-page` | `#F1F5F9` | 2 occurrences, `accounts-tree.component.scss` only | `accounts-tree.component.scss` | |
| `--bs-card-bg` | Bootstrap-generated | `--surface-card` | `#FFFFFF` | 2 occurrences | Theme-internal + `erp-action-bar.component.scss` (×1) | |
| `--bs-warning` | Bootstrap-generated | `--status-warning` | `#A4640A` | 2 occurrences, theme-internal + `accounts-tree.component.scss` (×1) | | |
| `--bs-tertiary-color`, `--bs-tertiary-bg`, `--bs-secondary-bg`, `--bs-heading-color`, `--bs-pagination-border-radius`, `--bs-body-bg-rgb`, `--bs-btn-border-radius`, `--bs-border-width`, `--bs-list-group-bg`, `--bs-dropdown-link-hover-color`, `--bs-dropdown-link-hover-bg`, `--bs-table-*` | Bootstrap-generated | out of scope | — | ≤4 occurrences each, all theme-internal (`src/scss/theme/**`) | none at app level | Zero app-level (`src/app/**`) consumers — these live entirely inside the read-only Mantis theme layer per `enforce-design-system` skill constraints. Not migration candidates. |
| `$pc-primary` (SASS var) | Bootstrap-generated via Mantis preset engine | out of scope | — | 106 occurrences | `src/scss/theme/style-preset.scss`, `src/scss/theme/layouts/dark-mode/dark.scss` only | Zero `src/app/**` consumers — entirely internal to Mantis's theme-preset color-swapping engine. Confirmed **not dead** (actively drives preset/dark-mode theming) but **out of migration scope** — it is Mantis-internal machinery, not an app-facing design token. |
| `$pc-primary-light` (SASS var) | Bootstrap-generated | out of scope | — | 14 occurrences, same 2 files | none at app level | Same as above. |
| `$blue`, `$gray-100..900`, `$red`, `$green`, `$teal`, etc. (SASS palette vars) | e.g. `$blue: #1677ff` | out of scope for direct mapping | — | Defined in `color-variables.scss`; consumed only by `bootstrap-variables.scss` and `src/scss/theme/generic.scss` (Bootstrap color-map construction) | none at app level | These feed Bootstrap's own SASS color maps at build time — no `src/app/**` file references them directly. If/when Phase 1 repoints `--bs-primary` etc. at AVELYNQ values, these SASS source variables (e.g. `$blue: #1677ff`) are the actual place the color originates and would need updating for the `--bs-*` chain to reflect AVELYNQ colors app-wide. |

---

## 2. Spacing & Radii

| Old Name | Old Value | New AVELYNQ Token | New Value | Consumers (count) | Consumer File Paths | Notes |
|---|---|---|---|---|---|---|
| `--erp-spacing-md` | `1rem` (16px) | `--space-4` | `16px` | 1 (13 occurrences, all within `erp-ui.scss`) | `erp-ui.scss` | Exact px match. Highest-traffic spacing token — prioritize. |
| `--erp-spacing-sm` | `0.75rem` (12px) | `--space-3` | `12px` | 1 (10 occurrences) | `erp-ui.scss` | Exact match. |
| `--erp-spacing-xxs` | `0.25rem` (4px) | `--space-1` | `4px` | 5 (8 occurrences) | `erp-ui.scss`; `erp-section.component.scss`; `erp-readonly-hint.component.scss`; `erp-form-field.component.scss`; `nav-group.component.scss` | Exact match. |
| `--erp-spacing-xs` | `0.5rem` (8px) | `--space-2` | `8px` | 1 (6 occurrences) | `erp-ui.scss` | Exact match. |
| `--erp-spacing-lg` | `1.5rem` (24px) | `--space-6` | `24px` | 1 (4 occurrences) | `erp-ui.scss` | Exact match. |
| `--erp-radius-md` | `0.375rem` (6px) | `--radius-md` | `7px` | 1 (3 occurrences) | `erp-ui.scss` | 1px delta, negligible visually. |
| `--erp-spacing-xxl` | `3rem` (48px) | `--space-9` | `48px` | 1 (1 occurrence) | `erp-ui.scss` | Exact match. |
| `--erp-spacing-xl` | `2rem` (32px) | `--space-7` | `32px` | 1 (1 occurrence) | `erp-ui.scss` | Exact match. |
| `--erp-radius-full` | `9999px` | `--radius-pill` | `999px` | 1 (2 occurrences) | `erp-ui.scss` | Semantically identical (both "pill"); raw value differs by 10x but renders the same on any realistic element size. |
| `--erp-radius-sm` | `0.25rem` (4px) | `--radius-sm` | `5px` | 1 (1 occurrence) | `erp-ui.scss` | 1px delta. |
| `--erp-form-label-gap` | `var(--erp-spacing-xs)` = 8px | `--space-2` | `8px` | 2 (2 occurrences) | `erp-ui.scss`; `erp-form-field.component.scss` | Component-specific token — re-derive from `--space-2` once base tokens migrate. |
| `--erp-form-gap` | `var(--erp-spacing-md)` = 16px | `--space-4` | `16px` | 1 (2 occurrences) | `erp-ui.scss` | |
| `--erp-page-header-padding-block` | `var(--erp-spacing-md)` | `--space-4` | `16px` | 1 (1) | `erp-ui.scss` | |
| `--erp-page-header-gap` | `var(--erp-spacing-md)` | `--space-4` | `16px` | 1 (1) | `erp-ui.scss` | |
| `--erp-dialog-header-gap` | `var(--erp-spacing-md)` | `--space-4` | `16px` | 1 (1) | `erp-ui.scss` | |
| `--erp-dialog-footer-gap` | `var(--erp-spacing-sm)` | `--space-3` | `12px` | 1 (1) | `erp-ui.scss` | |
| `--erp-card-radius` | `var(--erp-radius-lg)` = 8px | `--radius-lg` | `10px` | 1 (1) | `erp-ui.scss` | 2px delta. |
| `--erp-card-padding` | `var(--erp-spacing-lg)` | `--space-6` | `24px` | 1 (1) | `erp-ui.scss` | |
| `--erp-autocomplete-radius` | `var(--erp-radius-md)` | `--radius-md` | `7px` | 1 (1) | `erp-autocomplete.component.scss` | |
| `--erp-autocomplete-item-padding-block` | `var(--erp-spacing-xs)` | `--space-2` | `8px` | 1 (1) | `erp-autocomplete.component.scss` | |
| `--erp-autocomplete-item-padding-inline` | `var(--erp-spacing-sm)` | `--space-3` | `12px` | 1 (1) | `erp-autocomplete.component.scss` | |
| `--erp-readonly-radius` | `var(--erp-radius-lg)` | `--radius-lg` | `10px` | 1 (2) | `erp-readonly-hint.component.scss` | |
| `--erp-readonly-padding-inline` | `var(--erp-spacing-sm)` | `--space-3` | `12px` | 1 (2) | `erp-readonly-hint.component.scss` | |
| `--erp-readonly-padding-block` | `var(--erp-spacing-xs)` | `--space-2` | `8px` | 1 (2) | `erp-readonly-hint.component.scss` | |
| `--erp-notification-offset` | `var(--erp-spacing-md)` | `--space-4` | `16px` | 1 (3) | `erp-notification-container.component.scss` | |
| `--erp-notification-gap` | `var(--erp-spacing-sm)` | `--space-3` | `12px` | 1 (1) | `erp-notification-container.component.scss` | |
| `--erp-notification-width` | `min(420px, calc(100vw - 2rem))` | `NEEDS DECISION` | — | 1 (1) | `erp-notification-container.component.scss` | No AVELYNQ layout token represents a component max-width like this; keep as a literal, component-owned value. |
| `--erp-section-radius` | `var(--erp-radius-lg)` | `--radius-lg` | `10px` | 1 (1) | `erp-section.component.scss` | |
| `--erp-section-padding` | `var(--erp-spacing-md)` | `--space-4` | `16px` | 1 (1) | `erp-section.component.scss` | |
| `--erp-section-header-gap` | `var(--erp-spacing-sm)` | `--space-3` | `12px` | 1 (1) | `erp-section.component.scss` | |
| `--erp-empty-state-radius` | `var(--erp-radius-xl)` = 12px | `--radius-xl` | `14px` | 1 (1) | `erp-empty-state.component.scss` | 2px delta. |
| `--erp-empty-state-padding` | `var(--erp-spacing-lg)` | `--space-6` | `24px` | 1 (1) | `erp-empty-state.component.scss` | |
| `--erp-empty-state-gap` | `var(--erp-spacing-sm)` | `--space-3` | `12px` | 1 (1) | `erp-empty-state.component.scss` | |
| `--erp-lookup-max-height` | `400px` | `NEEDS DECISION` | — | 1 (1) | `erp-lookup-dialog.component.scss` | Component-owned literal; no AVELYNQ layout token maps to it directly. |
| `--erp-autocomplete-max-height` | `280px` | `NEEDS DECISION` | — | 1 (1) | `erp-autocomplete.component.scss` | Same as above. |
| `--erp-radius-xl` | `0.75rem` (12px) | `NEEDS DECISION` (tie between `--radius-lg` 10px and `--radius-xl` 14px) | — | 0 | *(defined, unused directly — consumed only via `--erp-empty-state-radius`)* | Equidistant from both AVELYNQ steps (±2px); pick based on the empty-state's actual visual weight in Phase 1. |
| `--erp-radius-lg` | `0.5rem` (8px) | `--radius-md` | `7px` | 0 | *(defined, unused directly — consumed only via `--erp-card-radius`/`--erp-section-radius`)* | Closer to `radius-md` (1px) than `radius-lg` (2px) despite the name match — naming/value mismatch to flag for Phase 1 reviewers. |
| `--erp-radius-none` | `0` | *(no token needed)* | `0` | 0 | *(unused)* | AVELYNQ scale starts at `radius-xs` (3px); literal `0` has no semantic token and needs none. |
| `--erp-form-group-gap` | `var(--erp-spacing-lg)` | `--space-6` | `24px` | 0 | *(defined, unused)* | Dead token — zero consumers found. |
| `--erp-table-cell-padding-block` | `var(--erp-spacing-sm)` | `--space-3` | `12px` | 0 | *(defined, unused)* | Dead token. |
| `--erp-table-cell-padding-inline` | `var(--erp-spacing-md)` | `--space-4` | `16px` | 0 | *(defined, unused)* | Dead token. |
| `--erp-btn-padding-block` | `var(--erp-spacing-xs)` | `--space-2` | `8px` | 0 | *(defined, unused)* | Dead token. |
| `--erp-btn-padding-inline` | `var(--erp-spacing-md)` | `--space-4` | `16px` | 0 | *(defined, unused)* | Dead token. |
| `--erp-btn-gap` | `var(--erp-spacing-xs)` | `--space-2` | `8px` | 0 | *(defined, unused)* | Dead token. |
| `--erp-page-header-padding-inline` | `var(--erp-spacing-lg)` | `--space-6` | `24px` | 0 | *(defined, unused)* | Dead token. |

**Layout tokens (no current `--erp-*` equivalent, informational only):** AVELYNQ defines `--sidebar-width` (264px), `--sidebar-collapsed` (72px), `--topbar-height` (60px), `--container-max` (1440px), `--page-pad` (24px, responsive), and `--control-sm/md/lg` (30/38/44px). None of these have an existing `--erp-*` counterpart today — Phase 1 should check the Mantis layout SCSS (`sidebar.scss`, `pc-common.scss`) for literal px values that these could replace, since that wasn't in scope for this token-consumer sweep (SCSS `$` variables and hardcoded layout px values in the Mantis theme layer were excluded per the "read-only third-party" rule).

---

## 3. Typography

| Old Name | Old Value | New AVELYNQ Token | New Value | Consumers (count) | Consumer File Paths | Notes |
|---|---|---|---|---|---|---|
| `--erp-font-weight-semibold` | `600` | `--fw-semibold` | `600` | 6 (8 occurrences) | `erp-ui.scss`; `erp-section.component.scss`; `erp-readonly-hint.component.scss`; `erp-empty-state.component.scss`; `erp-form-field.component.scss`; `erp-lookup-dialog.component.scss` | Exact match. |
| `--erp-font-size-sm` | `0.875rem` (14px) | `--fs-body` | `14px` | 4 (7 occurrences) | `erp-ui.scss`; `specification-filter.component.scss`; `erp-autocomplete.component.scss`; `erp-lookup-dialog.component.scss` | Exact px match but semantic name mismatch (`sm` → AVELYNQ's default body size is named `fs-body`, and AVELYNQ's own `fs-sm` is 13px) — rename carefully, don't just alias. |
| `--erp-font-weight-medium` | `500` | `--fw-medium` | `500` | 1 (4 occurrences) | `erp-ui.scss` | Exact match. |
| `--erp-font-size-lg` | `1.125rem` (18px) | `--fs-h4` | `18px` | 1 (3 occurrences) | `erp-ui.scss` | Exact match. |
| `--erp-font-size-xs` | `0.75rem` (12px) | `--fs-xs` | `12px` | 1 (2 occurrences) | `erp-ui.scss` | Exact match. |
| `--erp-form-label-gap` | *(spacing, see above)* | — | — | — | — | *(listed under Spacing)* |
| `--erp-section-title-size` | `var(--erp-font-size-lg)` | `--fs-h4` | `18px` | 1 (1) | `erp-section.component.scss` | |
| `--erp-line-height-tight` | `1.25` | `--lh-snug` | `1.3` (closest) | 1 (1) | `erp-ui.scss` | `1.25` sits between `lh-tight` (1.15) and `lh-snug` (1.3); closer to `lh-snug`. |
| `--erp-line-height-normal` | `1.5` | `--lh-normal` | `1.5` | 1 (1) | `erp-ui.scss` | Exact match. |
| `--erp-font-size-md` | `1rem` (16px) | `--fs-title` | `16px` | 1 (1) | `erp-ui.scss` | Exact px match, but name mismatch (`md` → `title`). |
| `--erp-font-size-heading` | `1.75rem` (28px) | `--fs-display` | `clamp(28px, 3.6vw, 44px)` | 1 (1) | `erp-ui.scss` | Old value matches the AVELYNQ display size's floor exactly (28px) — migrating means the heading becomes fluid/responsive above 28px, a behavior change worth flagging to design. |
| `--erp-empty-state-icon-size` | `var(--erp-font-size-xxl)` = 24px | `--fs-h2` | `clamp(21px, 2.2vw, 26px)` (closest) | 1 (1) | `erp-empty-state.component.scss` | **NEEDS DECISION** — old value was a fixed 24px; AVELYNQ's nearest scale step is a fluid clamp, changing behavior on resize. |
| `--erp-font-size-xxl` | `1.5rem` (24px) | `--fs-h2` | `clamp(21px, 2.2vw, 26px)` (closest) | 0 | *(defined, unused directly — consumed only via `--erp-empty-state-icon-size`)* | Same fluid-vs-fixed caveat as above. |
| `--erp-font-size-xl` | `1.25rem` (20px) | `NEEDS DECISION` (between `fs-h4` 18px and `fs-h3` clamp 19-21px) | — | 0 | *(defined, unused)* | Dead token; no clean 1:1, tie between two candidates. |
| `--erp-line-height-relaxed` | `1.75` | `--lh-relaxed` | `1.65` | 0 | *(defined, unused)* | Dead token; close value match if ever adopted. |
| `--erp-font-weight-normal` | `400` | `--fw-regular` | `400` | 0 | *(defined, unused)* | Dead token; exact match if ever adopted. |
| `--erp-font-weight-bold` | `700` | `--fw-bold` | `700` | 0 | *(defined, unused)* | Dead token; exact match if ever adopted. |

**AVELYNQ-only additions with no current `--erp-*` counterpart:** `--font-sans`/`--font-mono`/`--font-arabic`/`--font-display` (IBM Plex family stack), `--fs-display`, `--fs-h1/h2/h3`, `--ls-*` (letter-spacing scale). The current `erp-tokens.scss` has **no font-family token at all** — font family is presumably set elsewhere (Mantis theme or global `styles.scss`); this is a gap Phase 1 should confirm before wiring IBM Plex in, since it's a brand-visible, repo-wide change.

---

## 4. Elevation

| Old Name | Old Value | New AVELYNQ Token | New Value | Consumers (count) | Consumer File Paths | Notes |
|---|---|---|---|---|---|---|
| `--erp-transition-fast` | `150ms ease-in-out` | `NEEDS DECISION` (equidistant between `--dur-fast` 120ms and `--dur-base` 180ms) | — | 2 (5 occurrences) | `erp-ui.scss`; `nav-group.component.scss` | Highest-traffic elevation/motion token; needs an explicit call on which duration bucket "fast" maps to. |
| `--erp-shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | `--shadow-xs` | `0 1px 2px rgba(10,22,40,0.06)` | 1 (1) | `erp-ui.scss` | Closest by blur/spread; color shifts from neutral black to AVELYNQ's signature navy-tinted shadow — intentional brand change, not a bug. |
| `--erp-transition-slow` | `350ms ease-in-out` | `NEEDS DECISION` (closest: `--dur-slow` 280ms) | — | 1 (1) | `nav-group.component.scss` | 70ms delta, no exact match — AVELYNQ's motion scale tops out at 280ms ("composed, no bounce" — deliberately snappier than 350ms). |
| `--erp-transition-normal` | `250ms ease-in-out` | `--dur-slow` (closest, 280ms) | `280ms` | 0 | *(defined, unused)* | Dead token; 30ms delta if ever adopted. |
| `--erp-shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | `--shadow-sm` (closest by blur radius) | `0 1px 3px rgba(10,22,40,0.08), 0 1px 2px rgba(10,22,40,0.04)` | 0 | *(defined, unused)* | **NEEDS DECISION** — AVELYNQ's `--shadow-md` (`0 4px 12px…`) is visually heavier than the old value; `--shadow-sm` is closer by blur/offset but the naming (`md`→`sm`) will confuse reviewers. Dead token currently, so low urgency. |
| `--erp-shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | `--shadow-md` (closest) | `0 4px 12px rgba(10,22,40,0.08), 0 2px 4px rgba(10,22,40,0.05)` | 0 | *(defined, unused)* | Same naming/weight mismatch as above; dead token. |

**Z-index tokens — no AVELYNQ equivalent exists at all.** `--erp-z-dropdown`, `--erp-z-sticky`, `--erp-z-fixed`, `--erp-z-modal-backdrop`, `--erp-z-modal`, `--erp-z-popover`, `--erp-z-tooltip`, `--erp-z-toast` are all defined in `erp-tokens.scss` and consumed (indirectly, via component tokens like `--erp-notification-z` and `--erp-autocomplete-z`) but **none of the four AVELYNQ token files** (`colors.css`, `spacing.css`, `typography.css`, `elevation.css`, `breakpoints.css`) define a z-index scale.

| Old Name | Old Value | New AVELYNQ Token | New Value | Consumers (count) | Consumer File Paths | Notes |
|---|---|---|---|---|---|---|
| `--erp-z-modal` | `1050` | `NEEDS DECISION` | — | 0 direct (1 indirect via `--erp-autocomplete-z`) | `erp-autocomplete.component.scss` (indirect) | No AVELYNQ source of truth for z-index exists; Phase 1 must either keep this scale as an ERP-owned addition on top of AVELYNQ, or design one from scratch. |
| `--erp-z-toast` | `1080` | `NEEDS DECISION` | — | 0 direct (1 indirect via `--erp-notification-z`) | `erp-notification-container.component.scss` (indirect) | Same as above. |
| `--erp-z-dropdown` / `-sticky` / `-fixed` / `-modal-backdrop` / `-popover` / `-tooltip` | `1000`/`1020`/`1030`/`1040`/`1060`/`1070` | `NEEDS DECISION` | — | 0 | *(unused directly)* | Same as above; entirely dead at the component level today, but keep — z-index scales are load-bearing even without direct references (used for overlay-stacking discipline). |

---

## 5. Breakpoints

The project's `erp-tokens.scss` defines **no breakpoint tokens today** — no `--erp-bp-*` or similar exists in the current design token file. Breakpoints, where used, are hardcoded directly in component/theme SCSS via `@media` queries (which is expected — CSS custom properties cannot be used inside `@media` conditions, exactly as AVELYNQ's own `breakpoints.css` comment notes).

| Old Name | Old Value | New AVELYNQ Token (reference value) | New Value | Consumers (count) | Consumer File Paths | Notes |
|---|---|---|---|---|---|---|
| *(none defined)* | — | `--bp-sm` | `480px` | — | — | AVELYNQ reference value; mirror verbatim in any new `$bp-sm` SASS variable per the design system's own instruction. |
| *(none defined)* | — | `--bp-md` | `768px` | — | — | |
| *(none defined)* | — | `--bp-lg` | `1024px` | — | — | Sidebar becomes static at this breakpoint per AVELYNQ spec. |
| *(none defined)* | — | `--bp-xl` | `1280px` | — | — | |
| *(none defined)* | — | `--bp-2xl` | `1536px` | — | — | |

**Action for Phase 1 (documentation only, not executed here):** a full separate sweep of every hardcoded `@media (max-width: …)` / `(min-width: …)` value across `src/` would be needed to build a real consumer-count table for breakpoints — that sweep was out of scope for this token/color-focused pass and should be its own Step in Phase 1 planning.

---

## Flags for Later Phases

- **Icon usage:** `ti-`/`ti ti-` (Tabler Icons — the AVELYNQ-recommended icon set) already in use, 25 files / ~133-134 occurrences. `fa-` (Font Awesome) still in use, 5 files / 17 occurrences (`dashboard.component.html` + `.ts`, `confirm-dialog.component.ts`, `erp-page-header.component.ts`, `erp-crud-actions-cell.component.ts`). `feather` icon class found in 2 spots (`menu.service.ts` icon-name mapping, `breadcrumb.component.html`). Three icon systems currently coexist — Phase 1 icon consolidation should standardize on `ti-` since it's already dominant and is what AVELYNQ's own guidance recommends.
- **`ngb-*` (ng-bootstrap) component usage found in templates:**
  - `ngbDropdown` (9), `ngbDropdownToggle` (7), `ngbDropdownMenu` (7), `ngbDropdownItem` (3) — dropdown family, highest-traffic ng-bootstrap dependency.
  - `ngbTooltip` (3)
  - `ngbNav` / `ngbNavItem` / `ngbNavLink` / `ngbNavContent` / `ngbNavOutlet` (2 each / 1) — tabs family.
  - No `ngbModal`, `ngbDatepicker`, `ngbAccordion`, `ngbTypeahead`, or `ngbPagination` usage found in the current codebase.
  - (File-level paths not enumerated here — re-run a targeted grep for `ngb[A-Z]` in `src/app/**/*.html` at Phase-2-planning time to get the full path list.)
- **AG Grid theme usage:** `ag-theme-alpine` found, 3 occurrences, across a total of 22 files referencing `ag-grid`/`ag-theme-` in some form (imports, config, module references) — full file-path enumeration deferred to the AG Grid theming phase.
- **Bootstrap JS-dependent behavior beyond ng-bootstrap:** `data-bs-toggle` found, 3 occurrences. No other `data-bs-*` attributes detected.
- **Inline `style="..."` attributes in templates** (relevant to design-system enforcement, DS.13 in `enforce-design-system`, not requested explicitly by this prompt's flag list but observed during the sweep): 11 occurrences across 3 files — `accounts-tree.component.html` (6), `user-list.component.html` (4), `erp-notification-container.component.html` (1). Worth folding into the same cleanup pass as the hardcoded hex colors in Phase 1, since several of these inline styles are font-size/spacing values that duplicate token concerns.

---

## Summary

- **Distinct old tokens/values found:** 92 `--erp-*` tokens (in `erp-tokens.scss`) + 21 distinct raw hardcoded hex colors (in `src/app/**`) + ~30 distinct `--bs-*`/`$` Bootstrap variables = **~143 distinct migration-relevant entries**.
- **Clean AVELYNQ match (exact or close, low-risk):** ~55 entries — nearly all spacing tokens (exact px matches), most font-weight tokens, several color tokens (`--erp-color-bg`→`--surface-card`, `--erp-color-bg-muted`→`--surface-sunken`, `--erp-color-success`→`--status-success`, etc.).
- **`NEEDS DECISION` (no clean 1:1, or ambiguous/tied match):** ~24 entries — most notably: all 8 z-index tokens (no AVELYNQ z-scale exists at all), `--erp-color-secondary`/`--erp-color-border-light` (no secondary/translucent-border semantic), the two custom non-Bootstrap hex colors (`#4680ff`, `#d4a005`, `#17a2b8`, `#c3cfe2`, `#2c3e50` — colors with no origin in either the old Bootstrap defaults or a clean AVELYNQ scale step), `--erp-transition-fast/slow/normal` (motion scale doesn't line up cleanly), and the `--erp-radius-lg/xl` naming-vs-value mismatches.
- **Top 5 highest-consumer-count items Phase 1 should prioritize first:**
  1. `--erp-color-border` / raw `#dee2e6` — 6-7 files, ~29 occurrences total (incl. `--bs-border-color` bypasses) — foundational, touches nearly every shared component.
  2. `--erp-color-text` / `--bs-body-color` / raw `#212529` — 5+ files, ~40+ occurrences combined with theme-internal — second most pervasive.
  3. `--erp-color-primary` / `--bs-primary` / raw `#0d6efd` — largest **visual** delta (brand blue rebrand) despite moderate file count (2-8 files) — highest risk-per-change, should be prioritized for design sign-off even though its raw count is lower than border/text.
  4. `--erp-spacing-md` (16px→`--space-4`) — single highest-occurrence spacing token (13 occurrences), zero-risk exact match — good "quick win" to sequence early and build Phase 1 confidence.
  5. `--erp-color-text-muted` / `--bs-secondary-color` / raw `#6c757d` — 5+ files, 22+ occurrences combined — second color priority after border/text/primary.

This document and the copied source at `design-system/avelynq-source/` are the full output of Phase 0. No file under `src/` was modified. Awaiting human review before Phase 1 (actual token replacement) is authorized.
