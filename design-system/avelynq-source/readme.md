# AVELYNQ — Design System

> **Built to Grow. Designed to Endure.**
> صُمم لينمو. وبُني ليصمد.

The design system for **AVELYNQ**, a software company that builds enterprise systems engineered to scale for years — without the rework, conflicts, and costly rebuilds that growth usually forces. This repository encodes AVELYNQ's **future** brand identity as reusable tokens, components, and full-screen UI kits.

> **Brand note:** This project was originally authored under the name **AVEL▴ON** and was renamed to **AVELYNQ**. The rename is a brand transition only — the approved system design, philosophy, messaging, and positioning are unchanged. The compiler-generated runtime namespace remains `window.AVELONDesignSystem_a21abd` (an internal build identifier tied to the project ID); it is retained as-is for build stability and is not user-facing.

---

## Company & product context

AVELYNQ's flagship product is a multi-module **Enterprise Resource Planning (ERP)** system serving enterprise organizations, government, and semi-government entities operating in complex, continuity-critical environments.

> **⚠️ Observed Modules — provisional, not approved scope.** The modules below were identified during an early **discovery/exploration** phase from repository observations. They are **early hypotheses and observations only** — *not* finalized business decisions or confirmed product boundaries. The final product scope remains **under validation**; explicit user confirmation is required before any observed module is promoted to approved scope. *Discovery does not equal approval; observation does not equal commitment.*

| Observed Module | Scope (as observed in repository) |
|---|---|
| **Finance** | General Ledger — chart of accounts, journals, posting rules |
| **Human Resources** | Workforce records |
| **Inventory** | Stock and items |
| **Procurement** | Purchasing |
| **Sales** | Orders and receipts |
| **Maintenance** | Asset upkeep |
| **Master Data** | Lookups and references |
| **Organization** | Org structure |
| **Security** | Users, roles & access, pages registry |
| **Reports** | Financial and operational reporting |

The application is bilingual (**English / Arabic, full RTL**), data-dense, and built around list/search → form → modal workflows over a sidebar + topbar shell.

### ⚠️ Brand constitution — read first
AVELYNQ is in a **pre-brand** stage on the engineering side. The current Angular frontend uses **Angular Material + the Mantis admin template + Droid type** purely to accelerate development. **None of that is the AVELYNQ identity.** This system treats the codebase as the source of truth for *function, structure, and workflows* only, and defines an **original** visual language for *how the product should feel*: disciplined, structured, stable, composed, timeless, enterprise. When function and aesthetics conflict, brand principles win.

### Sources used
- **Brand concept:** `uploads/AVELON-Brand-Concept-Summary.md` (+ the full Design Constitution and the AVELYNQ rename amendment provided by the client)
- **Official logo:** the approved AVELYNQ logo sheet (provided in conversation, saved as `assets/avelynq-brand-sheet.png`) → cropped into the lockup / mark / app-icon assets in `assets/`.
- **Frontend codebase (function reference):** the attached Angular app at `frontend/` — an ERP named `n-erp-system` v2.4.0 (Angular 21, ag-grid, ng-bootstrap, ngx-translate, Tabler + FontAwesome icons).
- **GitHub:** [`hesham421/System-main`](https://github.com/hesham421/System-main) — the full-stack ERP monorepo (the `frontend/` folder mirrors the attached codebase). Explore it for deeper backend/workflow context. *(Per the brand constitution and the rename amendment, repository artifacts reflect intermediate states and do not override approved decisions.)*
- **Figma:** `Mantis-v2.2.4.fig` — implementation reference only; **not** a brand reference.

---

## Content fundamentals

How AVELYNQ writes, observed from the product's i18n strings and brand copy.

- **Voice:** strategic, reliable, composed, confident — never playful or hype-driven. "Many companies promise innovation. Few promise continuity."
- **Person:** product UI is **impersonal and instructional** ("Manage system users and their accounts", "Configure roles and access control"). Brand/marketing copy addresses the customer as **"you"** ("Grows with you — never against you"). Never first-person "I".
- **Casing:** **Title Case** for labels, buttons, nav, and card titles ("Chart of Accounts", "Add Account", "Advanced Filters"). **Sentence case** for descriptions, hints, and helper text ("Here is your ERP system overview."). Eyebrows/section dividers may be **UPPERCASE** with wide tracking.
- **Tone of microcopy:** plain, precise, operational. Verbs first on actions (Save, Post, Refresh, Export). No exclamation marks in UI. Numbers and codes are exact.
- **Terminology:** enterprise/accounting vocabulary — Journal, Posting Rule, Chart of Accounts, General Ledger, Reconcile, Period, Specification filter.
- **Bilingual:** every label has an Arabic counterpart; Arabic is set RTL with IBM Plex Sans Arabic. Keep parity — never ship an English-only screen.
- **Emoji:** **never** in product UI.
- **Taglines:** Primary — *Built to Grow. Designed to Endure.* (rendered two-tone in the logo: **GROW** in teal, **ENDURE** in blue). Alternates — *Scale without the rebuild · Systems that age well · Grows with you — never against you.*

---

## Visual foundations

The identity derives directly from the mark: an ascending **triangle / "A"** rising from a stable steel **arch** — "intentional ascent on a stable foundation."

- **Color vibe:** a **deep navy foundation** (`#0A1628`) carries authority and calm; **Avelynq Blue** (`#2466D8`) is trust and primary action; **Avelynq Teal** (`#12A99B`) is the growth/ascent accent (positive metrics, highlights); **Steel** (`#AEB4BF`) echoes the arch. Neutrals are a **cool slate** scale tuned to sit with navy. Semantic status colors are **restrained and desaturated** (enterprise green/amber/red), never neon. The official logo uses exactly this teal→blue gradient mark on a near-black navy field, confirming the palette.
- **Color usage:** solid colors lead. Blue for actions and selection, teal sparingly for growth/accent moments. The **brand gradient** (teal→blue, 135°) is reserved for brand expression — login panel, dashboard banner, logo — *not* for buttons, cards, or backgrounds at large.
- **Backgrounds:** flat surfaces. Page is `--surface-page` (slate-50), cards are white. Dark/brand surfaces (sidebar, login panel, welcome banner) use navy with subtle, low-opacity **radial gradient glows** (teal/blue) for depth — never busy. No textures, no photographic backgrounds, no decorative illustration.
- **Type:** **IBM Plex Sans** for UI + display (engineered, neutral, timeless — chosen over Inter/Roboto); **IBM Plex Mono** for all data (GL codes, amounts, counts, pagination); **IBM Plex Sans Arabic** for RTL parity. Display tightens tracking (`-0.02em`) and uses 600/700; body is 14px, dense-friendly. *(The logo wordmark uses a custom geometric display face; IBM Plex is the system/UI type, not a substitute for the logo art.)*
- **Spacing & layout:** strict **4px grid**. Fixed 264px sidebar, 60px topbar, slate-50 content canvas. Generous but disciplined padding; tables are dense (11px row padding). Max content width ~1280–1440px.
- **Radii:** measured and architectural — 7px controls, 10px cards, never pill-soft for data. Pills only for avatars, toggles, and status chips.
- **Borders:** 1px hairlines in slate-200/300 carry most separation. Focus uses a 3px blue ring at 35% (`--focus-ring`) plus a solid border.
- **Shadows:** **navy-tinted, low, and disciplined** — `--shadow-sm` on cards, `--shadow-md` on hover, larger only for popovers/modals. Composure over drama; no heavy or colored drop-shadows.
- **Cards:** white surface, 1px slate-200 border, 10px radius, `--shadow-sm`. Optional header (title/subtitle/actions) divided by a hairline. Hover variants lift 2px with `--shadow-md`.
- **Elevation accents:** KPI tiles carry a 3px brand-colored left rail; sidebar active items carry a teal inset rail.
- **Motion:** composed, **no bounce**. Standard ease `cubic-bezier(0.2,0,0.1,1)`, 120–280ms. Screens fade-and-rise 6px on mount. Hovers shift background/elevation; presses are subtle. Respect reduced-motion.
- **Hover/press:** buttons darken one step (`--brand-primary-hover`); ghost/icon buttons gain a faint slate wash; cards lift. Selection uses blue-50 fill + blue border.
- **Transparency/blur:** used sparingly — low-opacity white borders on navy, `color-mix` glows. No frosted-glass everywhere.

---

## Iconography

- **System:** [**Tabler Icons**](https://tabler.io/icons) (webfont, `ti ti-*`) is the primary set — a clean, even-stroke, outline family that matches AVELYNQ's disciplined, engineered tone. It is already used across the codebase alongside FontAwesome; we standardize on **Tabler** going forward for consistency.
- **Loading:** linked from CDN in cards and kits — `@tabler/icons-webfont@3.24.0`. For production, install `@tabler/icons-webfont` and self-host.
- **Style rules:** outline (not filled), 1.5–2px stroke, 18px default in controls, 16px inline. Single-color, inheriting `currentColor`. Never mix icon families on one surface.
- **The brand mark:** the AVELYNQ symbol is a teal→blue ascending **triangle / "A"** resting on a steel **arch** — the carrier of the brand's meaning (intentional ascent on a stable foundation). It is a fixed logo asset in `assets/`; it is **not** a generic UI glyph and must never be redrawn, recolored, rotated, or restyled. Place only on the deep-navy brand field or on white, with clear space ≥ the mark's height.
- **Logos:** in `assets/` — official lockup (dark + light), mark, app icon, and the full brand sheet. The approved logo is final; do not reinterpret or propose alternatives.
- **Emoji / unicode as icons:** not used in the interface.

---

## Responsive system

AVELYNQ is a **production responsive foundation** for the Angular ERP — desktop, laptop, tablet, and mobile from the same tokens and utility classes. There is no separate "mobile design"; the approved desktop layout *is* the layout at `≥1024px`, and it reflows gracefully below that.

**Breakpoints** (`tokens/breakpoints.css` — mirror verbatim in Angular SCSS):

- `sm` ≥ 480px — large phone
- `md` ≥ 768px — tablet
- `lg` ≥ 1024px — laptop *(sidebar becomes a static rail at/above this)*
- `xl` ≥ 1280px — desktop
- `2xl` ≥ 1536px — wide desktop

**How responsiveness is delivered** (no JS except toggling one class):

- **Reflowing tokens** — `--page-pad` and `--topbar-height` tighten at each breakpoint, so every surface that references them adjusts automatically. Large type (`--fs-display/h1/h2/h3`) is `clamp()`-fluid: identical to the approved values on desktop, scaling down on small screens.
- **Layout utilities** (`tokens/responsive.css`, shipped in `styles.css`) — apply these classes directly in Angular templates:
  - `avl-app` / `avl-app__body` / `avl-app__main` — the shell flex frame.
  - `avl-sidebar` — static rail at `≥lg`; **off-canvas drawer below lg**. Toggle `.is-open`; pair with `avl-scrim.is-open` (tap-to-close) and a `avl-menu-btn` hamburger (auto-shown below lg). RTL-aware.
  - `avl-grid` + `avl-grid--stats | --3 | --2 | --split | --auto` — responsive column sets that collapse at lg/md/sm. `--auto` is a no-media-query `auto-fill minmax` wall.
  - `avl-pagehead`, `avl-cluster` — page-header and toolbar rows that wrap on small screens.
  - `avl-table-scroll` — dense data tables stay tabular and scroll horizontally on narrow viewports (enterprise-correct; no column crushing).
  - `avl-dialog` / `avl-dialog__scrim` / `avl-dialog__panel` (+ `--sm/--md/--lg`) / `avl-dialog__body` / `avl-dialog__footer` — modal centered on desktop/laptop/tablet, **bottom sheet on phones**, body scrolls within a capped height, footer actions stack full-width.
  - `avl-drawer` / `avl-drawer__scrim` / `avl-drawer__panel` (+ `--sm/--md/--lg`) / `avl-drawer__body` / `avl-drawer__footer` — side panel sliding in from the **inline-end (right LTR / left RTL)**, **full-screen on phones**. For record details, create/edit forms, filter panels, and contextual workflows.
  - `avl-split` / `avl-split__aside` / `avl-split__main` — two-pane auth/marketing layout; the aside hides below md.
  - Helpers: `avl-hide-lg-down`, `avl-hide-md-down`, `avl-hide-sm-down`, `avl-only-md-down`, `avl-only-lg-down`; `avl-touch-target` raises a control to the 44px AA target on coarse pointers.
- **Logical properties throughout** (`inset-inline-*`, `margin-inline`, `padding-inline`) so the entire responsive system works unchanged in RTL/Arabic.
- **Reduced motion** honored — the drawer/scrim drop their transitions under `prefers-reduced-motion`.

All component primitives are fluid by construction (fields fill their container; `Tabs` scrolls horizontally; `Card` headers wrap; `Dialog` centers on desktop/laptop/tablet and docks as a bottom sheet on phones; `Drawer` slides in from the inline-end and goes full-screen on phones — both with scrollable bodies and full-width stacked actions). The `ui_kits/erp` recreation demonstrates the full system end-to-end across every breakpoint.

---

## Index / manifest

**Root**
- `styles.css` — global entry point (consumers link this). `@import`s the token files below.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `breakpoints.css`, `spacing.css`, `elevation.css`, `responsive.css`
- `assets/` — `avelynq-lockup-dark.png`, `avelynq-lockup-light.png`, `avelynq-mark-dark.png`, `avelynq-appicon.png`, `avelynq-brand-sheet.png`
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand) for the Design System tab
- `SKILL.md` — Agent Skill manifest (for use in Claude Code)

**Components** (`components/`, namespace `window.AVELONDesignSystem_a21abd` — see brand note above)
- `buttons/` — `Button`, `IconButton`
- `forms/` — `Input`, `Select`, `Checkbox`, `Switch`
- `data-display/` — `Card`, `Stat`, `Badge`, `Avatar`
- `feedback/` — `Alert`, `EmptyState`
- `navigation/` — `Tabs`, `Breadcrumb`
- `overlays/` — `Dialog` (responsive modal / bottom sheet), `Drawer` (responsive side panel / slide-over)

**UI kits** (`ui_kits/`)
- `erp/` — the AVELYNQ ERP application recreation (login → dashboard → chart of accounts → account form). See `ui_kits/erp/README.md`.

---

## Using the system
Link `styles.css` and reference semantic tokens (`var(--brand-primary)`, `var(--text-body)`, `var(--surface-card)`, `var(--font-mono)`). Pull React primitives from the compiled bundle: `const { Button, Card } = window.AVELONDesignSystem_a21abd`. For throwaway artifacts (slides, mocks), copy assets out and build static HTML; for production, lift the token values and component patterns.
