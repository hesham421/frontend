> Relocated from `frontend/design-system/PHASE-1-EXCEPTIONS.md` on 2026-07-06 as part of the non-functional artifact consolidation.
> See `governance-repo/project-artifacts/CONSOLIDATION-INVENTORY.md`.

# Phase 1 Exceptions — Items Requiring Human Confirmation

Per the Phase 1 resolved governance decision: "One-off custom hex colors with
no origin in Bootstrap or AVELYNQ: do not force a token mapping." Every item
below was left **untouched in code** — only the token *name* was migrated
where applicable, never the flagged fallback/literal value. Each needs a
one-line decision before these files can be fully cleaned up in a later phase.

---

## One-off custom colors (no origin in Bootstrap defaults or AVELYNQ scale)

| Color | File(s) | Usage | Suggested nearest AVELYNQ token | Delta |
|---|---|---|---|---|
| `#4680ff` | `src/app/layout/dashboard/dashboard.component.scss` (`.welcome-icon`, `.dashboard-card:focus-visible`, `.card-users .card-icon`, `.card-users:hover`)<br>`src/app/shared/components/erp-lookup-field/erp-autocomplete/erp-autocomplete.component.scss` (`.active` state) | Icon/accent color, focus outline, active-row background | `--blue-400` (`#4078E2`) | Brighter/more saturated than any AVELYNQ blue step — likely a legacy brand color from before this design-system adoption. |
| `#17a2b8` | `src/app/layout/dashboard/dashboard.component.scss` (`.card-roles .card-icon`, `.card-roles:hover`) | Icon/accent color for the "Roles" quick-access card | `--status-info` (`#1B54BC`) | Large hue delta — old value is cyan (Bootstrap 4 `info`), AVELYNQ has no cyan family at all. |
| `#d4a005` | `src/app/layout/dashboard/dashboard.component.scss` (`.card-master .card-icon`, `.card-master:hover`) — paired with an already-mismatched `rgba(255, 193, 7, 0.12)` background tint (itself derived from old Bootstrap `warning` `#ffc107`, not from `#d4a005`) | Icon/accent color for the "Master Data" quick-access card | `--amber-500` (`#C77D11`) | Custom gold/yellow with no scale match; the background tint and icon color in the source were already inconsistent with each other before this migration — worth deciding both together. |

**Decision needed:** confirm whether these three dashboard quick-access-card
accents (`users`=blue, `roles`=cyan, `master`=gold) should adopt the closest
AVELYNQ scale step above, a different AVELYNQ color entirely, or stay as
brand-approved one-off exceptions permanently. Until decided, these six call
sites (2 files) still contain hardcoded hex and are not part of the token
system.

---

## Unresolved tokens remaining in `src/scss/erp/erp-tokens.scss`

These four still have live consumers and no AVELYNQ equivalent exists (or no
resolution was provided in the Phase 1 "Resolved governance decisions"
section), so they were **not** deleted or renamed:

| Token | Value | Consumer(s) | Why unresolved |
|---|---|---|---|
| `--erp-color-border-light` | `var(--bs-border-color-translucent, rgba(0,0,0,0.175))` | `src/app/shared/components/erp-dual-list/erp-dual-list.component.ts` | AVELYNQ has no translucent/alpha border semantic token. Could be composed via `color-mix()` off `--border-subtle`, but that's a new design decision, not a mechanical rename. |
| `--erp-notification-width` | `min(420px, calc(100vw - 2rem))` | `erp-notification-container.component.scss` | Component-owned literal; no AVELYNQ layout token represents a toast max-width. |
| `--erp-lookup-max-height` | `400px` | `erp-lookup-dialog.component.scss` | Component-owned literal; no AVELYNQ layout token represents this. |
| `--erp-autocomplete-max-height` | `280px` | `erp-autocomplete.component.scss` | Same as above. |

**Decision needed:** either accept these as permanent ERP-specific
supplemental tokens (move them into `src/scss/avelynq/tokens/supplemental.css`
with a documented rationale, same treatment as the z-index scale) or design
proper AVELYNQ-derived replacements. `erp-tokens.scss` cannot be fully
deleted until this is resolved.

---

## Also found but not blocking (already resolved, listed for visibility)

- `--erp-color-secondary` had zero direct consumers (only its raw fallback
  hex `#6c757d` was used directly in several files) — resolved per governance
  decision to `--brand-secondary` (Steel-derived) and applied everywhere
  `#6c757d`/`--bs-secondary` appeared as an accent/icon color. Not an
  exception — already migrated.
- Two paired rgba()-format status-color hardcodes in `erp-ui.scss` and
  `erp-dual-list.component.ts` (e.g. `rgba(13, 110, 253, 0.1)` for a
  brand-tinted background) were **not** in the original Phase 0 migration map
  (that audit only searched for hex-format colors) but were found and
  migrated during Phase 1 execution since they were clear derivatives of
  colors already in the map (e.g. primary-tinted, success-tinted). Not an
  exception — already migrated.
