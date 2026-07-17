> Relocated from `frontend/design-system/AVELYNQ-EXTENSIONS-PROPOSAL.md` on 2026-07-06 as part of the non-functional artifact consolidation.
> See `governance-repo/project-artifacts/CONSOLIDATION-INVENTORY.md`.

# AVELYNQ Extensions Proposal (Phase 3 + Phase 4)

**Status: proposed, pending human design review.** These five primitives
have no upstream AVELYNQ spec. Phase 3 needed the first four to fully
retire ng-bootstrap's interactive components; Phase 4 added `Toast` to
retire `erp-notification-container`'s Bootstrap `.alert` markup. All were
designed under strict discipline: every value reuses an existing token from
`src/scss/avelynq/tokens/` (colors, radii, shadows, motion, control
heights). No new color/spacing/radius value was invented anywhere in this
set. They are already wired into the app, but should be reviewed by whoever
owns the AVELYNQ system before being considered a permanent part of it.

## Dropdown

Spec: `design-system/avelynq-extensions/Dropdown.prompt.md` / `.d.ts`
Implementation: `src/app/shared/overlay/dropdown/dropdown.directive.ts`

Floating menu anchored to a trigger — replaces
`ngbDropdown`/`ngbDropdownToggle`/`ngbDropdownMenu`/`ngbDropdownItem` with a
matching three-part attribute API (`avlDropdown`/`avlDropdownToggle`/
`avlDropdownItem`, menu content in a plain `<ng-template>`) for a minimal
swap at every existing call site. Reuses Dialog's surface treatment
(`--surface-card`, `--border-subtle`, `--radius-md`) at a smaller footprint
with `--shadow-md` instead of `--shadow-xl`, and a transparent backdrop
(outside-click detection) instead of a scrim. CDK `flexibleConnectedTo`
positioning with 4-way viewport-edge fallback; `Directionality` is read and
passed to the overlay so start/end positions flip correctly in RTL.

## Tooltip

Spec: `design-system/avelynq-extensions/Tooltip.prompt.md` / `.d.ts`
Implementation: `src/app/shared/overlay/tooltip/tooltip.directive.ts`

Small dark hover/focus label — replaces `ngbTooltip`. Uses
`--surface-inverse` (the same navy surface as the sidebar and Dialog/
Drawer's dark chrome — deliberately not a new "tooltip black"),
`--text-onbrand`, `--radius-sm`, `--shadow-sm`, `--dur-fast` motion. Shows
on hover/focus, hides on leave/blur/Escape. Never focusable/interactive
itself (informational only, matching the one real usage — a disabled
sidebar item's permission message).

## Pagination

Spec: `design-system/avelynq-extensions/Pagination.prompt.md` / `.d.ts`
Implementation: `src/app/shared/components/avl-pagination/avl-pagination.component.ts`

Token-styled prev/next + page-number row — replaces the single real
`<ngb-pagination>` usage (`erp-lookup-dialog`). No CDK Overlay needed.
`--control-sm`/`--control-md` heights (sm for compact dialog-footer
contexts, md for standalone toolbars), `--radius-md` buttons,
`--brand-primary` active state, max 7 controls total (5 page-number slots +
prev/next) with ellipsis truncation for larger result sets.

## Typeahead

Spec: `design-system/avelynq-extensions/Typeahead.prompt.md` / `.d.ts`
Implementation: `src/app/shared/overlay/typeahead/typeahead.directive.ts`

Input + floating suggestion panel, reusing Dropdown's exact panel styling.
**No real usage exists in the app** — Step 1's inventory confirmed
`erp-autocomplete` (flagged by name in Phase 0's original audit) is a
hand-rolled RxJS implementation, not built on `ngbTypeahead`. Designed and
built per the Phase 3 brief's unconditional instruction to spec/implement
it regardless, for future adoption. **Not wired into `erp-autocomplete` in
this phase** — rebuilding that shared component is Phase 4 territory, and
swapping its internals wasn't part of this phase's inventory-driven
replacement work.

## Toast

Spec: `design-system/avelynq-extensions/Toast.prompt.md` / `.d.ts`
Implementation: `src/app/shared/feedback/avl-toast/`

Stacked, auto-dismissing notification — replaces
`erp-notification-container`'s Bootstrap `.alert`/`.btn-close` markup.
Reuses `AvlAlertComponent`'s exact tone/icon system (same 4 tones, same
default icon per tone) inside a fixed, inline-end-corner stack so a toast
and an inline `Alert` read as one family. `--shadow-lg` (above a `Dropdown`
panel's `--shadow-md`, below a Dialog/Drawer scrim), `--z-toast` (`1080`,
already defined and previously consumed directly by
`erp-notification-container`), slide/fade motion on `--dur-base`/
`--ease-out`. `ErpNotificationService`'s public API
(`show`/`success`/`error`/`warning`/`info`/`dismiss`/`dismissAll`) is
unchanged — only the container's internal per-item markup was rebuilt.

## What review should focus on

1. Whether `Dropdown`'s panel treatment (Dialog surface at a smaller scale)
   is the right visual language, or whether dropdowns should look more
   distinct from Dialog/Drawer.
2. Whether `Tooltip`'s dark-navy treatment reads correctly against light
   page backgrounds in practice — this is a judgment call made without the
   ability to visually render and check it live.
3. Whether `Pagination`'s 7-control cap and ellipsis placement matches how
   AVELYNQ would want dense financial-app pagination to look — this table
   context (`erp-lookup-dialog`) is fairly cramped.
4. Whether `Typeahead` should exist as designed at all, given it still has
   zero consumers after Phase 4 — `erp-autocomplete` was visually reskinned
   in Phase 4 to reuse the Dropdown/Typeahead panel classes, but its
   hand-rolled keyboard-nav logic was deliberately left on its own RxJS
   implementation rather than rewired onto `AvlTypeaheadDirective` (see
   `design-system/SHARED-COMPONENT-AUDIT.md`, erp-autocomplete section) —
   it may be worth deferring this primitive's future indefinitely, or
   revisiting `erp-autocomplete`'s internals specifically to finally use it.
5. Whether `Toast`'s inline-end-corner stack position and 5s/8s default
   durations (carried over unchanged from `ErpNotificationService`) still
   match what AVELYNQ would want, now that they're expressed as design
   tokens (`--dur-base`/`--ease-out`/`--shadow-lg`) rather than ad hoc CSS.
