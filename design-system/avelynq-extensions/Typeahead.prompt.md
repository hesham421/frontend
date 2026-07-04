A text input paired with a floating suggestion panel, filtered as the user
types. No real usage exists in the app today (`erp-autocomplete` is a
hand-rolled implementation, not built on this), but is designed now for
future adoption per the migration brief. The suggestion panel reuses
`Dropdown`'s panel styling exactly — same surface, border, radius, shadow —
so a Typeahead and a Dropdown opened side-by-side look like one family.

```html
<input
  type="text"
  class="form-control"
  [avlTypeahead]="search"
  (avlTypeaheadSelect)="onSelect($event)"
  placeholder="Search accounts..."
/>
```

Where `search` is `(term: string) => Observable<T[]>` and each result renders
via a default `{{ item }}` template or a caller-supplied `<ng-template
avlTypeaheadItem let-item>`.

Tokens reused: panel — surface `--surface-card`, border `--border-subtle`,
radius `--radius-md`, elevation `--shadow-md` (identical to Dropdown, by
design). Result rows: padding `--space-2`/`--space-4`, text `--fs-sm`,
hover/active background `--surface-hover`, active-match highlight color
`--brand-primary`. Motion `--dur-fast` / `--ease-standard` for panel
show/hide, matching Dropdown and Tooltip.

Behavior: debounced input (consumer supplies the debounce via their
`search` function/pipe, matching how `erp-autocomplete` already does this
with RxJS — the directive itself stays a thin CDK-positioning + keyboard-nav
layer, not a data-fetching layer), Up/Down arrow-key navigation, Enter to
select, Escape to close.
