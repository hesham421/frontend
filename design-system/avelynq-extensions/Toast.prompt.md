Transient, stacked, auto-dismissing notification — the ephemeral counterpart
to `Alert` (which is inline and page-embedded, not floating/timed). AVELYNQ
has no upstream spec for this pattern; designed here under the same
token-reuse discipline as Phase 3's Dropdown/Tooltip/Typeahead/Pagination.

```jsx
<ToastContainer>
  <Toast tone="success" title="Journal posted" message="Entry JV-2041 was posted to the general ledger." />
  <Toast tone="danger" message="Failed to save. Please retry." />
</ToastContainer>
```

Reuses `Alert`'s exact tone system: same 4 tones (`info`/`success`/
`warning`/`danger`), same per-tone color pairs (`--blue-700`/`--info-50`,
`--green-700`/`--green-50`, `--amber-700`/`--amber-50`, `--red-700`/
`--red-50`) and the same default icon per tone (`ti-info-circle`/
`ti-circle-check`/`ti-alert-triangle`/`ti-alert-circle`) — a toast and an
inline Alert are meant to read as the same family, just in a different
container/lifecycle.

**Stack position:** fixed, inline-end corner of the viewport
(`inset-inline-end`/`inset-inline-start` so it flips automatically under
`dir="rtl"`, matching the existing `erp-notification-container` RTL
override it replaces).

**Elevation:** `--shadow-lg` — a toast floats above ordinary page content
and above a `Dropdown` panel (which uses `--shadow-md`), but below a
Dialog/Drawer scrim; z-index `--z-toast` (already defined, `1080`,
currently consumed by the pre-Phase-4 `erp-notification-container`).

**Motion:** slide-and-fade in/out using `--dur-base`/`--ease-out` (the same
duration/easing pair the Drawer panel and Switch thumb already use for
"something entering the viewport" motion), sliding from the inline-end edge.

**Lifecycle:** each toast auto-dismisses after `duration` ms (default
5000ms, matching `ErpNotificationService`'s existing default; 0 disables
auto-dismiss, matching its existing `duration: 0` convention for
must-acknowledge messages). Manually dismissible via an `×` button when
`dismissible` (default true, matching the existing service default).

**Why not just `Alert` directly:** `Alert` has no stacking container, no
timer, and no fixed positioning — bolting those onto `Alert` itself would
make every inline usage carry toast-only concerns. `Toast` is a thin
wrapper that renders `Alert`'s visual body inside a floating, stacked,
timed shell.
