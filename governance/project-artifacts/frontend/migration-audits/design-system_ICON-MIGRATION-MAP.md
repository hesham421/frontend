> Relocated from `frontend/design-system/ICON-MIGRATION-MAP.md` on 2026-07-06 as part of the non-functional artifact consolidation.
> See `governance-repo/project-artifacts/CONSOLIDATION-INVENTORY.md`.

# Icon Migration Map — Font Awesome / Feather → Tabler

Scope: every static icon-class usage found under `src/app/` (templates and
inline component styles/markup). Confidence is `high` only for unambiguous
semantic/visual matches; `needs-review` rows are **left untouched in code**.

All target classes below were verified to exist in the currently-active
bundled `src/scss/fonts/tabler-icons.min.css` (**v1.41.1** — see version-delta
note at the end) before being applied.

| Old Class/Usage | File Paths | Count | Suggested Tabler Equivalent | Confidence |
|---|---|---|---|---|
| `fas fa-tachometer-alt` | `dashboard.component.html` | 1 | `ti ti-dashboard` | high |
| `fas fa-chevron-right` | `dashboard.component.html` | 1 | `ti ti-chevron-right` | high |
| `fas fa-lock` | `dashboard.component.html` | 1 | `ti ti-lock` | high |
| `fas fa-users` | `dashboard.component.ts` (icon string) | 1 | `ti ti-users` | high |
| `fas fa-user-shield` | `dashboard.component.ts` (icon string) | 1 | `ti ti-shield` | needs-review |
| `fas fa-file-alt` | `dashboard.component.ts` (icon string) | 1 | `ti ti-file-text` | high |
| `fas fa-database` | `dashboard.component.ts` (icon string) | 1 | `ti ti-database` | high |
| `fas fa-calculator` | `dashboard.component.ts` (icon string) | 1 | `ti ti-calculator` | high |
| `fas fa-balance-scale` | `dashboard.component.ts` (icon string) | 1 | `ti ti-scale` | needs-review |
| `fas fa-exclamation-triangle` | `confirm-dialog.component.ts` (icon string, `warning` variant) | 1 | `ti ti-alert-triangle` | high |
| `fas fa-info-circle` | `confirm-dialog.component.ts` (icon string, `info` variant) | 1 | `ti ti-info-circle` | high |
| `fas fa-question-circle` | `confirm-dialog.component.ts` (icon string, `question` variant) | 1 | `ti ti-help` | needs-review |
| `fas fa-sync-alt` | `erp-page-header.component.ts` | 1 | `ti ti-refresh` | high |
| `fas fa-plus` | `erp-page-header.component.ts` | 1 | `ti ti-plus` | high |
| `fas fa-pencil-alt` | `erp-crud-actions-cell.component.ts` | 1 | `ti ti-pencil` | high |
| `fas fa-trash-alt` | `erp-crud-actions-cell.component.ts` | 1 | `ti ti-trash` | high |
| `feather icon-home` | `breadcrumb.component.html` | 1 | `ti ti-home` | high |
| `fa-2x` (FontAwesome size utility, not an icon glyph) | `dashboard.component.html` (paired with `fa-lock`) | 1 | *(no Tabler equivalent — Tabler sizes via `font-size`, not a `-2x` class)* | needs-review |

**Applied:** all 12 `high` confidence rows were swapped directly in their
source files. The 4 `needs-review` rows (`fa-user-shield`, `fa-balance-scale`,
`fa-question-circle`, `fa-2x`) were left untouched in code — they're
compound/stylized glyphs or a FontAwesome-specific sizing utility with no
clean 1:1 Tabler equivalent, and are listed here for a human decision before
Phase 4 rebuilds these shared components anyway.

---

## `@ant-design/icons-angular` — found, deliberately not touched

`@ant-design/icons-angular` (`IconService`) is a real, actively-used
dependency — imported in `nav-content.component.ts`, `nav-right.component.ts`,
`nav-left.component.ts`, `breadcrumb.component.ts`, `auth-login.component.ts`,
and `shared.module.ts`. Its actual exposed API is the `IconService` class
(icon sets registered programmatically), not a template directive like
`<i nz-icon nzType="...">`. No `nz-icon`/`nzType` template usage was found
anywhere in `src/app/`.

The real integration point is `src/app/theme/shared/pipes/safe-ant-icon.pipe.ts`
— a dedicated `SafeAntIconPipe` that dynamically translates legacy/DB-stored
icon strings (including `ti ti-*` class strings) into Ant Design SVG icon
names at runtime, for the dynamic, database-driven navigation menu system.
This is a deliberate compatibility/translation layer, not static template
markup, and rebuilding or touching it is out of scope for a foundation-layer
token/font/icon-class phase — it already handles `ti-*` inputs gracefully.
Left entirely untouched.

## `ag-grid` theme classes — found, out of scope (already flagged in Phase 0)

`ag-theme-alpine` (3 occurrences) confirmed still present; this is the future
AG Grid theming phase's concern, not this one.

## Material icon ligatures (`mat-icon` / `material-icons`) — none found

No usage of Material Design icon ligature syntax was found anywhere in
`src/app/`. `src/scss/fonts/material.css` appears to be an unused leftover
from the Mantis template scaffold.

---

## Version delta — bundled vs. npm package

- **Bundled and currently active:** `src/scss/fonts/tabler-icons.min.css`,
  Tabler Icons **v1.41.1**.
- **Newly installed:** `@tabler/icons-webfont@3.44.0` (via `npm install
  @tabler/icons-webfont --save`, per this phase's instructions).
- **Decision made:** kept the bundled v1.41.1 stylesheet active in
  `src/styles.scss` rather than swapping to the npm package's stylesheet.
  Between v1 and v3 Tabler renamed/removed a meaningful number of icons: an
  automatic swap could silently break some of the ~133 existing `ti-*`
  template references with no build-time error (a missing icon glyph just
  renders as an empty box, which isn't checked by TypeScript/Angular
  compilation). All 18 target classes above were verified present in the
  bundled v1.41.1 file before being applied, so this phase's changes are safe
  regardless of which stylesheet is eventually adopted. Swapping the full
  icon set to the npm package (and re-auditing every existing `ti-*`
  reference against v3.44.0's class names) is a separate, larger task —
  flagged for a future phase, not done here.
