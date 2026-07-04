A floating menu anchored to a trigger element — language switcher, notification
bell, user-profile menu, any "..." action menu. Mirrors `Dialog`'s surface
treatment at a smaller footprint: same card surface, border, and radius
language, just a lighter shadow tier and no scrim (dropdowns don't block the
page, they close on outside-click).

```html
<li avlDropdown>
  <a avlDropdownToggle class="pc-head-link"><i class="ti ti-language"></i></a>
  <ng-template>
    <div class="avl-dropdown__panel">
      <button avlDropdownItem (click)="useLanguage('en')">English</button>
      <button avlDropdownItem (click)="useLanguage('ar')">العربية</button>
    </div>
  </ng-template>
</li>
```

Tokens reused (no new values invented): surface `--surface-card`, border
`--border-subtle`, radius `--radius-md`, elevation `--shadow-md`, motion
`--dur-fast` / `--ease-standard`. Menu item padding `--space-2`/`--space-4`,
text `--fs-sm` / `--text-body`, hover background `--surface-hover`, divider
`--border-subtle`.

Positioning: CDK connected-position, default `bottom-start` with `top-start` /
`bottom-end` / `top-end` fallbacks so it never renders off-screen. Direction
(LTR/RTL) is read from Angular's `Directionality` service and passed to the
`OverlayConfig`, so "start"/"end" flip automatically per document direction —
no separate RTL positioning logic needed.

Behavior: click trigger toggles open, click outside or Escape closes, only
one `avlDropdownTrigger` panel open at a time per instance (multiple
independent triggers on a page are unaffected by each other).
