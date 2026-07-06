import { themeQuartz } from 'ag-grid-community';

/**
 * AVELYNQ AG Grid theme (Phase 5) — built via AG Grid 35's JS Theming API
 * (`themeQuartz.withParams()`, confirmed as the mechanism already in use
 * across every grid consumer; no legacy `ag-theme-*` CSS-class theming is
 * active). Every value below traces to an existing token in
 * `src/scss/avelynq/tokens/` — none are new/hardcoded.
 *
 * `isDark` is preserved for signature compatibility with all 4 existing
 * call sites (avoids touching src/app/modules/ files for a purely visual
 * phase), but AVELYNQ has not defined a dark palette yet, and
 * `ThemeService.toggleDarkMode()` has zero callers anywhere in the app —
 * dark mode is unreachable/vestigial. Both branches apply the same
 * AVELYNQ light-mode token mapping until a real dark palette exists.
 */
export function createAgGridTheme(isDark: boolean) {
  void isDark; // see doc comment above — no AVELYNQ dark palette yet

  return themeQuartz.withParams({
    backgroundColor: 'var(--surface-card)',
    foregroundColor: 'var(--text-body)',
    borderColor: 'var(--border-default)',

    // surface-hover (slate-50) reads almost identical to surface-card
    // (white) — insufficient separation for a header band. surface-sunken
    // (slate-100) gives a clearly visible but still subtle tint, matching
    // the tinted <thead> band already used in erp-lookup-dialog's table.
    headerBackgroundColor: 'var(--surface-sunken)',
    headerTextColor: 'var(--text-strong)',

    // Flat rows (no zebra striping) — consistent with AVELYNQ's clean-
    // surface tables elsewhere (erp-lookup-dialog, erp-dual-list).
    oddRowBackgroundColor: 'var(--surface-card)',
    rowHoverColor: 'var(--surface-hover)',

    // Same low-opacity brand-tint technique as the dashboard's quick-
    // access tiles and Dialog/Drawer's icon tiles.
    selectedRowBackgroundColor: 'color-mix(in srgb, var(--brand-primary) 12%, var(--surface-card))',
    accentColor: 'var(--brand-primary)',

    fontFamily: 'var(--font-sans)',
    spacing: 'var(--space-2)',
    borderRadius: 'var(--radius-md)',

    // Dense-friendly row height per AVELYNQ's control-height scale.
    rowHeight: 'var(--control-md)',

    wrapperBorder: '1px solid var(--border-default)',
    wrapperBorderRadius: 'var(--radius-md)',
    rowBorder: '1px solid var(--border-subtle)',
    headerColumnBorder: '1px solid var(--border-subtle)'
  });
}
