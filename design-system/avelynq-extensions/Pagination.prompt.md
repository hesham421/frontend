A token-styled page-control row for non-AG-Grid list screens — currently only
`erp-lookup-dialog`'s result table needs this (all other list screens use AG
Grid's own built-in pagination, out of scope). No overlay involved, just a
plain control row.

```html
<avl-pagination [page]="page" [pageSize]="20" [total]="total" (pageChange)="onPageChange($event)" />
```

Tokens reused: button height `--control-sm` (30px) for compact contexts like
a dialog footer, `--control-md` (38px) for standalone page toolbars — pick by
context, don't invent a third height. Buttons use `--radius-md`, `--border-
default`, `--surface-card` background, `--surface-hover` on hover. Active
page number: `--brand-primary` background, `--text-onbrand` text. Disabled
prev/next: `--text-subtle`, no hover state. Page-info text (e.g. "1-20 of
84"): `--fs-xs`, `--text-muted`.

Behavior: always shows prev/next chevrons; shows up to 5 page-number buttons
with ellipsis truncation for larger sets (never renders more than 7 controls
total, to stay usable inside a dialog footer's width). Emits `pageChange`
with the new 1-based page number; does not manage the data itself.
