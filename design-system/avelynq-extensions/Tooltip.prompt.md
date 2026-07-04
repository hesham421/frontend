A small dark hover/focus label — e.g. "You do not have permission to access
this page" on a disabled sidebar item. Dark surface (matches the sidebar's
own navy, so it reads as an inverse/high-contrast affordance against light
page backgrounds), fast to appear, no scrim, never traps focus (it's
informational, not interactive).

```html
<a class="nav-link" [avlTooltip]="'You do not have permission to access this page'" [avlTooltipDisabled]="isEnabled">
  ...
</a>
```

Tokens reused: surface `--surface-inverse` (navy-850, same as the sidebar and
Dialog/Drawer's dark surfaces elsewhere in the system — deliberately not a
new "tooltip black", reuses the inverse-surface role already defined for
dark chrome), text `--text-onbrand`, radius `--radius-sm`, elevation
`--shadow-sm`, motion `--dur-fast` / `--ease-standard`. Padding `--space-1`
block / `--space-2` inline, text size `--fs-2xs`.

Positioning: CDK connected-position, default `top` with `bottom` fallback.
Shows on `mouseenter`/`focus`, hides on `mouseleave`/`blur`/Escape/scroll.
RTL-safe automatically (CDK connected-position + logical offset, no
left/right hardcoding).
