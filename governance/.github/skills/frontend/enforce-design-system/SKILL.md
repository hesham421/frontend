---
name: enforce-design-system
description: "DESIGN SYSTEM ENFORCER — validates and guides AVELYNQ CSS token usage in frontend SCSS. Use when creating/editing component styles, reviewing SCSS for hardcoded values, or adding new design tokens. Provides full token reference, mapping tables, and examples."
---

# Skill: enforce-design-system

## Name
`enforce-design-system`

## Migration notice
As of the AVELYNQ design-system migration (see `design-system/` in the
frontend repo for the full audit trail), the legacy `--erp-*` token system
described in earlier versions of this skill has been **retired**. The
frontend now runs on AVELYNQ's own token system, sourced verbatim from
AVELYNQ's design files and re-exported at `src/scss/avelynq/tokens/`. This
skill has been rewritten to reflect that as ground truth. Do not generate
or accept any `--erp-spacing-*`, `--erp-font-*`, `--erp-radius-*`,
`--erp-shadow-*`, `--erp-transition-*`, or `--erp-color-*` token in new
code — none of those names exist in the codebase anymore except the
handful of explicitly-scoped exceptions listed under "Residual `--erp-*`
tokens" below.

## Description
Enforces the AVELYNQ design system by providing the complete token
reference, usage examples, mapping tables, and validation checks for all
SCSS in the frontend. This skill is the authoritative guide for using
AVELYNQ's `--brand-*`, `--text-*`, `--surface-*`, `--border-*`, `--space-*`,
`--radius-*`, `--fs-*`, `--fw-*`, `--shadow-*`, `--dur-*`/`--ease-*`, and
`--z-*` tokens correctly, and for knowing which of the small number of
residual `--erp-*` tokens are still legitimate.

## When to Use
- When creating new component SCSS files
- When editing existing component styles
- When reviewing SCSS for design system compliance
- When adding a new token that AVELYNQ doesn't define natively (an
  "extension" — see the Supplemental Tokens section)
- When unsure which token maps to a specific value

## When NOT to Use
- For TypeScript or HTML template files — this skill covers SCSS/CSS only
  (for which shared Angular component to use in a template, see
  `enforce-reusability`)
- For backend code or deploy configuration
- For Bootstrap's grid/layout utility classes (`row`, `col-*`, `offset-*`)
  — these are a deliberate, permanent, documented exception (layout
  mechanics with no brand identity) and are explicitly NOT covered or
  restricted by this skill; do not flag them as violations

## Responsibilities

- Validate all SCSS uses real AVELYNQ `var(--*)` tokens — no hardcoded
  px/rem/color values
- Provide complete token reference and mapping tables
- Guide conversion of hardcoded CSS values to correct tokens
- Verify any new "extension" token (one AVELYNQ doesn't define natively)
  is added to `src/scss/avelynq/tokens/supplemental.css`, not invented
  ad hoc in a component file, and is documented there with why it exists

## Constraints

- MUST NOT generate component TypeScript or template code — SCSS/CSS only
- MUST NOT reintroduce any `--erp-*` token that has a resolved AVELYNQ
  equivalent per this file's tables — that migration is complete and final
- MUST NOT create CSS classes that duplicate `erp-ui.scss`'s existing
  layout utility classes (`.erp-page`, `.erp-page-header`, etc. — these
  survived the migration and were re-pointed at AVELYNQ tokens internally,
  they were not replaced)
- MUST NOT modify `src/scss/avelynq/tokens/*.css` (these are verbatim
  copies of the upstream AVELYNQ design system — treat as read-only, like
  a third-party dependency) — new tokens only ever go in
  `src/scss/avelynq/tokens/supplemental.css`
- MUST NOT remove Bootstrap's grid/layout utility classes anywhere in the
  codebase — they remain a permanent, sanctioned exception

## Output

- Design system compliance report identifying:
  - Hardcoded values and their correct AVELYNQ token replacements
  - Any lingering `--erp-*` reference that should have been migrated
  - Duplicate CSS classes from `erp-ui.scss`
  - Any new extension token that should be moved to `supplemental.css`
- Token reference guidance for specific values

---

## TOKEN REFERENCE

### File Locations
- `src/scss/avelynq/tokens/colors.css` — brand/text/surface/border/status
  colors (verbatim AVELYNQ, read-only)
- `src/scss/avelynq/tokens/spacing.css` — spacing scale, radii, control
  heights, layout dimensions (verbatim AVELYNQ, read-only)
- `src/scss/avelynq/tokens/typography.css` — font families, weights, type
  scale, line heights, letter spacing (verbatim AVELYNQ, read-only)
- `src/scss/avelynq/tokens/elevation.css` — shadows, border widths, motion
  easing/duration (verbatim AVELYNQ, read-only)
- `src/scss/avelynq/tokens/breakpoints.css` — responsive breakpoints
  (verbatim AVELYNQ, read-only)
- `src/scss/avelynq/tokens/responsive.css` — `avl-*` layout utility
  classes (shell frame, grid, dialog/drawer scaffolding — verbatim
  AVELYNQ, read-only)
- `src/scss/avelynq/tokens/supplemental.css` — **the only file where new
  tokens are ever added.** Contains ERP-specific additions AVELYNQ doesn't
  define natively (see below).
- `src/scss/avelynq/tokens/index.css` — the single import manifest,
  pulling in all of the above in the correct order (fonts → colors →
  typography → spacing → elevation → breakpoints → responsive →
  supplemental).

### Import Chain
`styles.scss` imports `scss/avelynq/tokens/index` near the top of the
file, before the Bootstrap variable imports, so AVELYNQ tokens are
available to everything that follows, including Bootstrap's own variable
overrides.

---

## BASE TOKENS (verbatim from AVELYNQ — read-only source of truth)

### Spacing (4px base grid)

| Token | Value |
|---|---|
| `--space-0` | `0` |
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |
| `--space-7` | `32px` |
| `--space-8` | `40px` |
| `--space-9` | `48px` |
| `--space-10` | `64px` |
| `--space-11` | `80px` |
| `--space-12` | `96px` |

**Mapping guide** — when you see a hardcoded value, use the closest token
(AVELYNQ's own rule: when a value falls between two steps, round to the
smaller/tighter one — the system is deliberately dense, not spacious):

| Hardcoded | Use Token |
|---|---|
| `4px`, `0.25rem` | `--space-1` |
| `8px`, `0.5rem` | `--space-2` |
| `12px`, `0.75rem` | `--space-3` |
| `16px`, `1rem` | `--space-4` |
| `20px`, `1.25rem` | `--space-5` |
| `24px`, `1.5rem` | `--space-6` |
| `32px`, `2rem` | `--space-7` |
| `40px` | `--space-8` |
| `48px`, `3rem` | `--space-9` |
| `64px` | `--space-10` |

### Border Radius

| Token | Value |
|---|---|
| `--radius-xs` | `3px` |
| `--radius-sm` | `5px` |
| `--radius-md` | `7px` |
| `--radius-lg` | `10px` |
| `--radius-xl` | `14px` |
| `--radius-2xl` | `20px` |
| `--radius-pill` | `999px` |

Note: AVELYNQ's radii are intentionally "measured, architectural" — avoid
`--radius-pill` for data-dense UI (tables, forms); reserve it for true pill
badges/tags.

### Control Heights & Layout

| Token | Value |
|---|---|
| `--control-sm` | `30px` |
| `--control-md` | `38px` |
| `--control-lg` | `44px` |
| `--sidebar-width` | `264px` |
| `--sidebar-collapsed` | `72px` |
| `--topbar-height` | `60px` (responsive: 58px ≤1023px, 56px ≤767px) |
| `--container-max` | `1440px` |
| `--page-pad` | `24px` (responsive: 20px ≤1023px, 16px ≤767px, 13px ≤479px) |

### Typography — Families

| Token | Value | Use For |
|---|---|---|
| `--font-sans` | IBM Plex Sans (+ Arabic fallback) | Default UI text |
| `--font-mono` | IBM Plex Mono | Numeric/currency/GL figures, codes, IDs |
| `--font-arabic` | IBM Plex Sans Arabic | `[dir="rtl"]`/Arabic-locale text |
| `--font-display` | IBM Plex Sans | Large display headings |

### Typography — Weight / Size / Line-height

| Token | Value |
|---|---|
| `--fw-regular` | `400` |
| `--fw-medium` | `500` |
| `--fw-semibold` | `600` |
| `--fw-bold` | `700` |
| `--fs-display` | `clamp(28px, 3.6vw, 44px)` |
| `--fs-h1` | `clamp(24px, 2.7vw, 32px)` |
| `--fs-h2` | `clamp(21px, 2.2vw, 26px)` |
| `--fs-h3` | `clamp(19px, 1.7vw, 21px)` |
| `--fs-h4` | `18px` |
| `--fs-title` | `16px` |
| `--fs-body` | `14px` |
| `--fs-sm` | `13px` |
| `--fs-xs` | `12px` |
| `--fs-2xs` | `11px` |
| `--lh-tight` | `1.15` |
| `--lh-snug` | `1.3` |
| `--lh-normal` | `1.5` |
| `--lh-relaxed` | `1.65` |

### Shadows & Motion

| Token | Value |
|---|---|
| `--shadow-xs` | `0 1px 2px rgba(10,22,40,.06)` |
| `--shadow-sm` | `0 1px 3px rgba(10,22,40,.08), 0 1px 2px rgba(10,22,40,.04)` |
| `--shadow-md` | `0 4px 12px rgba(10,22,40,.08), 0 2px 4px rgba(10,22,40,.05)` |
| `--shadow-lg` | `0 12px 28px rgba(10,22,40,.12), 0 4px 10px rgba(10,22,40,.06)` |
| `--shadow-xl` | `0 24px 48px rgba(10,22,40,.18), 0 8px 16px rgba(10,22,40,.08)` |
| `--shadow-inset` | `inset 0 1px 2px rgba(10,22,40,.06)` |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0.1, 1)` |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--dur-fast` | `120ms` |
| `--dur-base` | `180ms` |
| `--dur-slow` | `280ms` |

Shadows are cool/navy-tinted, not neutral-gray — never hand-roll a
`rgba(0,0,0,...)` shadow; always use the token.

### Semantic Colors

| Token | Resolves To | Use For |
|---|---|---|
| `--brand-primary` | `--blue-500` (`#2466D8`) | Primary actions, links, focus |
| `--brand-primary-hover` | `--blue-600` | Primary hover state |
| `--brand-primary-active` | `--blue-700` | Primary active/pressed state |
| `--brand-accent` | `--teal-500` (`#12A99B`) | Secondary emphasis, growth/positive accents |
| `--brand-secondary` | `--steel-400` (`#AEB4BF`) *(supplemental — see below)* | Secondary buttons/controls |
| `--text-strong` | `--slate-900` | Headings, high-emphasis text |
| `--text-body` | `--slate-700` | Default body text |
| `--text-muted` | `--slate-500` | Secondary/muted text |
| `--text-subtle` | `--slate-400` | Placeholder-level text |
| `--text-onbrand` | `#FFFFFF` | Text on solid brand-colored backgrounds |
| `--text-link` | `--blue-600` | Hyperlinks |
| `--text-disabled` | `--slate-400` | Disabled control text |
| `--surface-page` | `--slate-50` | App/page background |
| `--surface-card` | `#FFFFFF` | Card/panel background |
| `--surface-sunken` | `--slate-100` | Recessed areas, table header bg |
| `--surface-hover` | `--slate-50` | Row/item hover background |
| `--surface-inverse` | `--navy-850` | Dark surfaces (sidebar, tooltips) |
| `--surface-brand-subtle` | `--blue-50` | Tinted brand backgrounds |
| `--surface-accent-subtle` | `--teal-50` | Tinted accent backgrounds |
| `--border-subtle` | `--slate-200` | Light dividers |
| `--border-default` | `--slate-300` | Standard borders |
| `--border-strong` | `--slate-400` | Emphasized borders |
| `--border-brand` | `--blue-500` | Brand-colored borders |
| `--status-success` / `--status-success-bg` | `--green-600` / `--green-50` | Success states |
| `--status-warning` / `--status-warning-bg` | `--amber-600` / `--amber-50` | Warning states |
| `--status-danger` / `--status-danger-bg` | `--red-600` / `--red-50` | Danger/error states |
| `--status-info` / `--status-info-bg` | `--info-600` / `--info-50` | Info states |
| `--focus-ring` | `0 0 0 3px color-mix(in srgb, var(--blue-500) 35%, transparent)` | Focus-visible outline (use as `box-shadow`) |

Raw color scales (`--blue-50..900`, `--teal-50..700`, `--steel-300..500`,
`--slate-0..950`, `--green/amber/red/info-*`) exist and may be used
directly for a specific shade a semantic alias doesn't cover (e.g. a
per-category accent color in a dashboard card), but **prefer the semantic
alias whenever one applies** — it's what stays correct if the palette is
ever retuned.

---

## SUPPLEMENTAL TOKENS (`src/scss/avelynq/tokens/supplemental.css`)

These exist ONLY because AVELYNQ's own token files don't cover them. Do
not confuse them for upstream AVELYNQ tokens — they're ERP-specific
extensions, each documented with why it exists:

| Token | Value | Why It's Not Upstream AVELYNQ |
|---|---|---|
| `--z-dropdown` | `1000` | AVELYNQ ships no z-index scale at all |
| `--z-sticky` | `1020` | (same) |
| `--z-fixed` | `1030` | (same) |
| `--z-modal-backdrop` | `1040` | (same) |
| `--z-modal` | `1050` | (same) |
| `--z-popover` | `1060` | (same) |
| `--z-tooltip` | `1070` | (same) |
| `--z-toast` | `1080` | (same) |
| `--brand-secondary` | `var(--steel-400)` | AVELYNQ never promotes a secondary-button semantic alias the way it does primary/accent |
| `--brand-secondary-hover` | `#99A1AF` | Derived via the same HSL-lightness step AVELYNQ uses between its own `--blue-500→600` |
| `--brand-secondary-active` | `#858E9E` | Same derivation, one more step |

**Adding a new supplemental token:** only when a real need arises AND no
existing AVELYNQ token or composition of tokens covers it. Add it to
`supplemental.css` with a comment explaining why it's not upstream — never
invent a one-off custom property inside a component file.

---

## RESIDUAL `--erp-*` TOKENS (the only legitimate exceptions)

A small number of `--erp-*` tokens remain in
`src/scss/erp/erp-tokens.scss` — NOT because they were missed, but because
they have no resolved AVELYNQ equivalent yet and still have live
consumers. Do not "fix" these by inventing a mapping yourself; they are
open governance questions, not oversights:

| Token | Consumer(s) | Status |
|---|---|---|
| `--erp-color-border-light` | `erp-dual-list` | No AVELYNQ translucent/alpha border token exists |
| `--erp-autocomplete-max-height` | `erp-autocomplete` | Component-owned literal (280px), not a spacing-scale value |
| `--erp-lookup-max-height` | `erp-lookup-dialog` | Component-owned literal (400px) |
| `--erp-notification-width` | `erp-notification-container` | Component-owned literal |

Every other `--erp-*` token that ever existed (spacing, font-size,
font-weight, line-height, radius, shadow, transition, z-index, and
semantic colors) has been fully migrated and deleted — if you see one
referenced anywhere outside the table above, that is a regression, not a
legitimate exception, and must be fixed by mapping to the correct AVELYNQ
token per the tables in this file.

---

## USAGE EXAMPLES

### ✅ Correct — real AVELYNQ tokens

```scss
.my-component {
  padding: var(--space-4);
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  border-radius: var(--radius-lg);
  color: var(--text-muted);
  border: 1px solid var(--border-default);
  background: var(--surface-card);
  box-shadow: var(--shadow-sm);
  z-index: var(--z-modal);
  transition: opacity var(--dur-fast) var(--ease-standard);
}
```

Note: AVELYNQ tokens are consumed WITHOUT a hardcoded CSS fallback value
(unlike the old `--erp-*` convention) — they're guaranteed present because
`tokens/index.css` is imported unconditionally near the top of
`styles.scss`. Do not add `var(--space-4, 16px)`-style fallbacks; it
implies the token might be missing, which it structurally cannot be.

### ❌ Wrong — hardcoded values

```scss
.my-component {
  padding: 1rem;                    // ❌ use --space-4
  font-size: 13px;                  // ❌ use --fs-sm
  font-weight: 600;                 // ❌ use --fw-semibold
  border-radius: 10px;              // ❌ use --radius-lg
  color: #647488;                   // ❌ use --text-muted
  border: 1px solid #B7C3D1;        // ❌ use --border-default
  z-index: 1050;                    // ❌ use --z-modal
}
```

### ❌ Wrong — legacy `--erp-*` token (fully migrated, no longer exists)

```scss
.my-component {
  padding: var(--erp-spacing-md);      // ❌ token deleted — use --space-4
  color: var(--erp-color-text-muted);  // ❌ token deleted — use --text-muted
}
```

---

## VALIDATION CHECKLIST

| # | Check | Pass | Fail |
|---|---|---|---|
| DS.1 | Spacing values use `--space-*` | `var(--space-4)` | `1rem` or `16px` |
| DS.2 | Font sizes use `--fs-*` | `var(--fs-sm)` | `13px` |
| DS.3 | Font weights use `--fw-*` | `var(--fw-semibold)` | `600` |
| DS.4 | Border radius uses `--radius-*` | `var(--radius-lg)` | `10px` |
| DS.5 | Colors use semantic `--text-*`/`--surface-*`/`--border-*`/`--brand-*` (or a raw scale color when no semantic alias fits) | `var(--text-muted)` | `#647488` |
| DS.6 | Z-index uses `--z-*` (supplemental) | `var(--z-modal)` | `1050` |
| DS.7 | Shadows use `--shadow-*` | `var(--shadow-sm)` | hand-rolled `box-shadow` |
| DS.8 | Transitions use `--dur-*`/`--ease-*` | `var(--dur-fast) var(--ease-standard)` | `150ms ease-in-out` |
| DS.9 | No hardcoded fallback appended to `var()` | `var(--space-4)` | `var(--space-4, 1rem)` |
| DS.10 | No duplicate `erp-ui.scss` classes | Uses existing `.erp-page` | New `.my-card` duplicating layout |
| DS.11 | No `--erp-*` token outside the residual exceptions table | N/A | `var(--erp-spacing-md)` anywhere |
| DS.12 | New extension tokens live in `supplemental.css` only | Added there with a comment | One-off custom property in a component file |
| DS.13 | No inline styles in templates | SCSS file with tokens | `[style]="..."` or `style="..."` |
| DS.14 | RTL uses logical properties | `padding-inline`, `inset-inline-start` | `padding-left`, `left: 10px` |

---

## ARCHITECTURE NOTES

- **Brand voice/identity** (governs judgment calls not covered by a token
  table — e.g. copy tone, whether an emoji/playful element belongs
  anywhere in the UI): AVELYNQ is disciplined, structured, stable,
  composed, timeless, enterprise-grade. No startup/consumer styling, no
  emoji anywhere in the UI, no playful/casual microcopy. Bilingual EN/AR
  with full RTL parity is a baseline requirement, not a nice-to-have.
- Tokens are the **single source of visual truth** — Bootstrap's own SCSS
  variables/CSS custom properties (`$primary`, `--bs-primary`, etc.) are
  NOT the source of truth for anything anymore; if you find a component
  still deriving color from a `--bs-*` variable, that's a regression to
  flag, not an acceptable pattern (this was fully eliminated in the
  AVELYNQ migration's foundation phase).
- Bootstrap's grid/layout utility classes (`row`, `col-*`, `offset-*`) are
  the one deliberate, permanent exception — they carry no visual identity
  and remain in use for layout mechanics.
- `erp-ui.scss` provides layout utility classes (`.erp-page`,
  `.erp-page-header`, etc.) that survived the migration — they're
  internally re-pointed at AVELYNQ tokens. Use them instead of creating
  new layout classes.
- **RTL is the default**, not an edge case — the app's default `dir`
  attribute is `rtl`. Always use logical properties
  (`padding-inline`/`margin-inline`/`inset-inline-start`/`inset-inline-end`)
  — never physical `left`/`right`/`margin-left`/`margin-right`.
- **Dark mode is NOT currently supported.** `dark.scss` still contains
  pre-AVELYNQ selectors targeting markup the current shell no longer
  emits, and no AVELYNQ dark palette has been defined. Do not attempt to
  "fix" dark mode piecemeal — it needs its own dedicated token-mapping
  project. `ThemeService.toggleDarkMode()` currently has zero callers.
- **`AvlIconButtonComponent`'s `label` input** auto-wires the shared
  `Tooltip` overlay directive — prefer this over a manual `title`
  attribute for icon-only buttons.
- **Font family**: `--font-sans` for the default/LTR context,
  `--font-arabic` for `[dir="rtl"]`/Arabic content — both defined in
  `tokens/typography.css`. No component SCSS may declare a competing
  `[lang="ar"] { font-family: ... }` rule; the Arabic font association
  point is `body.mantis-rtl`/`mantis-ltr`, not a per-component override.

---

## SHARED SCSS & UTILITY CLASS CONSUMPTION

| # | Check | Shared Resource | Violation |
|---|-------|----------------|-----------|
| DS.15 | Layout utility classes | Use `.erp-page`, `.erp-page-header` from `erp-ui.scss`, or `avl-*` shell classes from `tokens/responsive.css` | Creating new `.my-card`, `.feature-container` |
| DS.16 | All AVELYNQ tokens stay in `src/scss/avelynq/tokens/` | Untouched upstream files + `supplemental.css` for additions | Feature-specific `_my-tokens.scss` files |
| DS.17 | No duplicate utility classes | Verify against existing `.erp-*`/`avl-*` classes before adding | Duplicating an existing layout class |
| DS.18 | Shared component styles | Shared AVELYNQ-based components (`avl-button`, `avl-input`, `erp-form-field`, `erp-section`, etc.) style via tokens — do not override from a feature file | Feature CSS overriding shared component internals |

**Rule:** Every new SCSS class or token must be verified against
`src/scss/avelynq/tokens/` and `erp-ui.scss` first. If an equivalent
exists, use it — do NOT create a new one.

> **Cross-reference:** This skill validates SCSS token and utility
> consumption. For which Angular component to use in a template, run
> [`enforce-reusability`](../enforce-reusability/SKILL.md).

---

## RELATED SKILLS

| Skill | Purpose |
|-------|---------|
| `enforce-reusability` | Validates that shared TypeScript/component code (`shared/`, `core/`) is consumed — no duplicated logic across features |
| `enforce-ui-ux` | Validates UI/UX display patterns, readability, and i18n compliance |

---

## CARD LAYOUT RULES (legacy Mantis `.card` only — not `avl-card`)

Most modules generated before the AVELYNQ migration (and most modules not
yet touched by it — this is still the majority of the codebase: only
Security, Master Data, and Finance's Chart of Accounts have been migrated
so far) use Mantis's raw `.card`/`.card-header-right` markup. For any of
that legacy markup, the flexbox rule below still applies in full:

### ✅ Correct — flexbox card header (handled by `card.scss` globally)

```scss
.card-header-right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  position: static !important;
}
```

### ❌ FORBIDDEN — absolute positioning via `::ng-deep`

```scss
// ❌ Breaks RTL overlap — NEVER do this in component SCSS
::ng-deep {
  .card-header-right {
    position: absolute;
    left: 20px;
    top: 15px;
    z-index: 1;
  }
}
```

**If the component you're generating uses `avl-card` instead** (the real
AVELYNQ `Card` component, available for any newly-built AVELYNQ-composed
screen): none of this applies — `avl-card`'s header/actions slot already
handles flexbox layout and RTL internally. This section only governs
components still using the legacy Mantis `.card` markup.

| # | Check | Pass | Fail |
|---|---|---|---|
| DS.19 | Legacy `.card` header uses flexbox | Global `card.scss` flexbox applied | Component overrides with `position: absolute` |
| DS.20 | No `::ng-deep` for `.card-header-right` positioning | No `::ng-deep` override | `::ng-deep { .card-header-right { position: absolute } }` |
| DS.21 | RTL card header uses `justify-content` | `justify-content: flex-start` | `left: 10px; right: auto;` |

---

## ANGULAR/SKILLS COMPATIBILITY

> This section documents how this skill relates to the official
> `angular/skills` guidance. **ERP contracts always take precedence.**

### What angular/skills adds that is SAFE to use alongside this skill
- No conflict — angular/skills does not cover CSS token systems
- Tailwind CSS patterns from angular/skills are NOT used in this project

### What angular/skills suggests that this skill OVERRIDES
- Tailwind CSS utility classes → PROHIBITED. Use AVELYNQ's token system
  instead (DS.1–DS.14)
- Inline styles → PROHIBITED regardless of angular/skills guidance (DS.13)

### Conflict resolution trigger
If any angular/skills guidance contradicts a rule in this skill:
1. Apply the ERP rule
2. Log: `CONFLICT RESOLVED: angular/skills suggests [X], ERP rule [RULE_ID] requires [Y]. Applied [Y].`
3. Do NOT ask the user — apply ERP rule silently
