> Relocated from `frontend/design-system/FINANCE-MODULE-AUDIT.md` on 2026-07-06 as part of the non-functional artifact consolidation.
> See `governance-repo/project-artifacts/CONSOLIDATION-INVENTORY.md`.

# Finance Module Audit (Phase 6d, Step 1)

Full current file tree re-verified (not relying on prior phases' stated
count):

```
finance/
  finance-routing.module.ts   (1 route: gl/accounts → redirect to tree)
  finance.module.ts
  gl/
    pages/accounts-tree/       (single real screen)
    facades/gl.facade.ts       (no template)
    services/gl-api.service.ts (no template)
    models/gl.model.ts         (no template)
```

Confirmed: **exactly one real screen** (`accounts-tree`), matching every
prior phase's finding. No account create/edit *modal* or *dialog* exists —
create/edit is done via **inline expand-panels** directly in the tree (no
`<form>` element anywhere in the template — confirmed via grep, zero matches
for `<form`/`ngSubmit`/`type="submit"`). This makes the submit-interception
class of bug structurally impossible here: there is no native form to
intercept in the first place.

## Forms mechanism — new finding, does not match Master Data's pattern

Unlike Master Data (100% Reactive Forms), `accounts-tree` uses **plain
`[(ngModel)]` bindings directly on raw elements, with no `<form>`/`NgForm`/
`FormGroup` anywhere** — the loosest of the three mechanisms seen across this
engagement (looser even than Security's `users-search` modal, which at least
had `FormsModule` + a real `<form>` tag). State lives in two plain component
fields (`editState: InlineEditState`, `addState: InlineAddState`), validated
via getters (`editFormValid`, `addFormValid`) checked before the button
click handler proceeds — not via Angular forms validation at all.

## Icon fix verification (Phase 1.5's four "previously invisible" icons)

`ti-arrows-exchange`, `ti-binary-tree`, `ti-filter-search`, `ti-search-off` —
confirmed still used in exactly the same 4 spots
(`accounts-tree.component.ts`'s `accountTypeIcons.INTERNAL`, and 3 places in
`accounts-tree.component.html`: root-count label, empty-state icon,
no-results icon).

**Verified via stylesheet glyph lookup** (no browser available in this
session, same limitation as Phase 1.5 itself — but this is the same
verification method `TABLER-VERSION-AUDIT.md` itself used, not a weaker
substitute): `src/styles.scss:77` currently imports
`scss/fonts/tabler-icons-v3.min.css` (confirmed via `grep`), superseding the
old v1.41.1 file `TABLER-VERSION-AUDIT.md` flagged these 4 icons as missing
from. Checked `src/scss/fonts/tabler-icons-v3.min.css` directly: all 4
`.ti-<name>:before` glyph rules **are present** (`ti-arrows-exchange`,
`ti-binary-tree`, `ti-filter-search`, `ti-search-off` all found). **Confirmed
fixed** — these icons now have real glyphs and are not empty boxes. Still
flagged for a live visual spot-check per the report's request, since glyph
presence in the stylesheet doesn't rule out a wrong-looking glyph shape.

## accounts-tree — full screen breakdown

**API/logic (untouched, presentation-only pass):** Recursive
`ng-template`-based tree (`treeTemplate` invoking itself via
`ngTemplateOutlet` with `{ nodes, depth }` context) — this recursion, the
`expandedNodes: Set<number>` expand/collapse state, `selectNode`/
`isSelected`, quick-filter (`filterNodes`, recursive, auto-expands parents of
matches), spec-filter (`applySpecFilters`, same recursive-keep-if-descendant-
matches shape), inline add/edit state machines, the parent-type-inheritance
rule (`editTypeLockedByParent`/`editTypeDisabled` — child accounts inherit
and lock their parent's `accountType`), and the deactivate-blocked-by-active-
children rule (`hasActiveChildren`) are all **accounting/GL domain logic —
none of it touched**.

**No monetary/balance figures exist in this screen.** `AccountChartTreeNode`
(`gl.model.ts`) has no balance/amount field at all — this is a *structural*
Chart-of-Accounts tree (code/name/type/hierarchy), not a trial balance or
ledger listing. The brief's "GL figures/account balances → `--font-mono`"
instruction is applied to the one genuinely code-like numeric-ish value that
actually exists: `accountChartNo` (the account code, e.g. `1000.01`), which
already had a **hardcoded** monospace font stack
(`.tree-node-code { font-family: 'SFMono-Regular', Consolas, ... }`) — this
gets routed through the `--font-mono` token instead, which is the correct,
narrow reading of the instruction rather than inventing a balance column
that doesn't exist in the data model.

### Bootstrap inventory and planned mapping

**Header toolbar:** `btn btn-info btn-sm` + `[class.active]` (Advanced
Filters, with an embedded `badge bg-light text-dark` count) → `avl-button
variant="secondary" size="sm"` with an `avl-badge tone="neutral"` projected
inside its content for the count. **Flagged:** `AvlButtonComponent` has no
pressed/active visual state, so the `[class.active]` highlight is dropped —
the button's label text already communicates the toggle state (same as
Master Data/Security's equivalent toggle, neither of which had this extra
active-class affordance either).
`btn btn-success btn-sm` (Add Root, permission-gated) → `avl-button
variant="accent"`. `btn btn-outline-success btn-sm` (Add Child, requires
selection) → `avl-button variant="secondary"` (no outline-success variant
exists; secondary is the established less-prominent-action mapping used
everywhere else in this engagement). `btn btn-primary btn-sm` (Refresh) →
`avl-button variant="primary"`.

**Advanced filter panel:** `alert alert-info` → `avl-alert tone="info"`
(dropping the manual `ti-info-circle` icon — `avl-alert` renders its own,
same as `pages-search`'s precedent). `badge bg-primary`/`badge bg-secondary`
(filter pills / overflow) → `avl-badge tone="info"`/`tone="neutral"`, same
exact mapping `pages-search` already established.

**Quick-filter + expand/collapse toolbar:** the quick-filter input currently
hand-rolls an icon-inside-input + overlapping clear-button via absolute
positioning (`.quick-filter-wrapper`/`.quick-filter-icon`/`.quick-filter-
clear`). Found the exact established precedent for this in
`erp-autocomplete.component.html` (referenced directly in `AvlInputComponent`'s
own doc comment as its "hand-rolled search box" use case): `avl-input` (using
its built-in `iconLeft` for the search icon) placed in a flex row **beside** a
conditionally-rendered `avl-icon-button` (`icon="ti ti-x"`) for clear —
not overlapping. Adopted that exact layout here instead of the old absolute-
positioning hack, since `AvlInputComponent` has no right-side action slot to
replicate the overlap cleanly. Expand All / Collapse All (`btn btn-sm
btn-outline-secondary`) → `avl-button variant="secondary" size="sm"`.

**Inline Add Root / Add Child / Edit panels:** `form-control`/`form-select` →
bare `avl-input`/`avl-select` bound via plain `[(ngModel)]` (this component's
only forms mechanism); `form-check`/`form-switch` (Is Active) → `avl-switch`
with `[(ngModel)]`; Save/Cancel buttons → `avl-button` (`primary`/
`secondary`), Save's `[loading]="isSaving"` replaces the manual
`spinner-border`. The "inherited from parent, read-only" boxes (styled to
look like a disabled `form-control`, containing a `badge bg-info-subtle`
"inherited" pill) are **not real form controls** — restyled as a plain
token-based div (no Bootstrap `form-control`/`bg-light` classes) with the
pill converted to `avl-badge tone="info"`; no existing shared "locked-value"
primitive fits this shape closely enough to force it in (checked
`erp-readonly-hint` — stacked label-above-value layout, zero other consumers
in the app, wrong shape for an inline field-replacement box).

**Flagged (pre-existing, cross-cutting, not new to this phase):**
`AvlInputComponent`'s CVA (`onInput` reads `HTMLInputElement.value`, always a
string) has no `type="number"` → number coercion. This exact gap already
exists in already-committed work (`pages-form.component.html`'s
`displayOrder` field, and this engagement's own Phase 6c
`sortOrder` field) — using `avl-input type="number"` for `addState.
organizationFk` here is consistent with that established precedent, not a
new risk being introduced. Flagged again here for visibility since
`organizationFk` feeds directly into the `CreateAccountRequest` payload;
a proper fix belongs in `AvlInputComponent` itself (outside every module's
scope so far, including this one).

**Tree node row:** Account-type icon color utility classes
(`text-primary`/`text-danger`/etc.) — left untouched; there is no
"Icon-with-tone" primitive in the delivered component set, and every other
migrated module in this engagement leaves equivalent icon-tint utility
classes alone for the same reason. Node badges: Account Type
(`badge bg-primary-subtle text-primary`) → `avl-badge tone="info"`; Level
(`badge bg-light text-dark border`) → `avl-badge tone="neutral"
variant="outline"`; Child Count (`badge bg-info-subtle text-info`) →
`avl-badge tone="info"`; Leaf (`badge bg-outline-secondary` — actually a
**custom** class defined in this component's own `.scss`, not a real
Bootstrap class, mimicking an outline badge) → `avl-badge tone="neutral"
variant="outline"` (lets the now-redundant custom `.bg-outline-secondary`
SCSS rule be deleted); Inactive (`badge bg-danger`) → `avl-badge
tone="danger" variant="solid"`.

**Row action buttons** (Edit / Add Child / Toggle-status — hover-revealed,
`btn btn-sm btn-link tree-action-btn`, positioned in the `.tree-badges`
flex area, not part of the depth-indent chain) → `avl-icon-button`
(`variant="ghost"`, `size="sm"`), same convention as every actions-cell in
this engagement.

**Flagged — kept raw, real alignment risk:** the per-node expand/collapse
chevron toggle (`btn btn-sm btn-link tree-toggle`) is **not** migrated to
`avl-icon-button`. Its `min-width: 22px` is hand-tuned to exactly match the
leaf-node spacer's `22px` width so expandable and leaf rows' content lines up
at every recursion depth; `avl-icon-button`'s smallest fixed size is 30×30px,
which would misalign that indentation grid across the whole tree — a real
visual regression in a component whose entire purpose is showing hierarchy
correctly, not a cosmetic nicety like the dropped active-state highlight
above. Left as the existing lightweight `btn-link`, restyled nowhere (no
Bootstrap classes worth replacing here beyond what's already bespoke CSS).

**Empty states:** the zero-accounts case already uses `erp-empty-state` —
untouched. The "no results for current filters" block
(`ti-search-off` + text + a `btn btn-sm btn-link` Clear button) was **not**
previously using it — migrated to `erp-empty-state` (`icon="ti ti-search-
off"`, `titleKey="COMMON.NO_RESULTS"`, `actionLabelKey="COMMON.CLEAR"`,
`(actionClicked)="clearAllFilters()"`), preserving the exact same trigger
and translation keys the raw markup already used.

**Not touched:** Bootstrap grid/layout classes (`row`, `col-md-*`, `g-2`,
`d-flex`, `gap-*`, etc.) — out of scope per policy. Numeric badges (Level,
Child Count) are small counters, not "GL figures" in the monetary sense the
mono-font instruction targets — left on the default sans font, only
`accountChartNo` gets `--font-mono`.
