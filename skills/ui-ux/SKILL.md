---
name: ui-ux
description: "ERP UI/UX foundation for this codebase — how to review a screen, when to build a shared component vs. leave a screen alone, and the table/form/modal/message/loading/error/RTL standards proven while auditing and fixing the Security module. Use before touching any screen's UI, before adding a shared UI component, or when writing a user-facing message."
---

# Skill: ui-ux

This file is not a generic UI checklist. Every rule below was extracted from a real defect
found and fixed in this codebase (Security module: User Management, Roles & Permissions,
Permission Registry, Page Registry — see `UI-UX-AUDIT.md` at the repo root for the full
audit this skill was built from). Update it the same way: find something real, fix it,
confirm the pattern repeats, then write the rule down here.

**Stack reality check first:** this app is React 18 + Vite + TanStack Query + Zustand,
styled with inline `style` objects reading CSS custom properties from
`src/styles/tokens/*.css` — no Tailwind, no CSS-in-JS library, no dark mode, no test runner.

**The whole `governance/.github/skills/frontend/` pack describes a different, aspirational
architecture that was never built here** — confirmed by reading the pack's `README.md`,
`enforce-ui-ux`, `enforce-reusability`, and `create-error-handling` in full, not just one
file. It specifies React Router v7 (`src/routes/`, `PATHS`), React Hook Form + Zod 4,
Vitest + RTL + MSW + Playwright, a component library that does not exist here (`DataTable`,
`Shutter`, `NotificationCenter`, `ErpTabs`, `<Can>`, `LookupField`), URL-search-param-owned
list state, and a `src/features/<entity>/{model,api,hooks}.ts` layout. The real app has none
of this: no router (`useNavigationStore` + a `switch` in `App.tsx`), hand-rolled `useState`
forms with Zod `safeParse`, no test runner configured, and a `src/{users,roles,permissions,
pageRegistry}/` layout with a "Facade hook" per screen. **Do not retrofit the pack's
architecture to close this gap** — that is a rewrite, not a UI/UX pass, and nothing about it
was requested. Instead: (a) never cite the pack's specific APIs/commands as if they exist,
(b) where its *intent* is sound and already achievable with what's actually here, build that
intent using the real primitives — see "Message / feedback standards" below for the one
clear case of this so far (`create-error-handling`'s "errors normalize to 8 kinds, backend
message never rendered" principle, which the real `ApiError` class already implements almost
verbatim; only the code→message mapping layer it describes was missing, and was added using
real backend error codes, not invented ones), (c) update *this* file when you learn something
new — never add a second skill file for it.

## Before touching any UI

1. **Run the app and use the screen as the user would** before reading a line of its code.
   Log in, submit the real form, trigger a real validation error, deactivate a real record,
   switch to Arabic, resize to mobile. Reading `Users.tsx` would not have surfaced that a
   403 from `/api/users/search` rendered as "No records found" — only watching the network
   tab while looking at the empty state did. The running UI is the primary evidence; the
   source is how you explain what you saw.
2. **Read the facade hook the screen calls**, not just the screen. This codebase's bugs
   were consistently one layer down: `Users.tsx` looked fine; `useUserManagementFacade()` was
   the file silently defaulting a failed load to `[]`. A screen-only review will miss this
   class of bug every time.
3. **Grep for the same shape elsewhere before proposing a fix.** If a table, confirm dialog,
   or error-handling block looks hand-rolled, check the other 3 Security screens (and the 7
   Organization/Notifications screens) for the identical shape before deciding whether to
   fix it locally or extract it. See "When to build a shared component" below.

## Avoiding feature creep

- A UI/UX pass fixes how existing functionality communicates with the user. It does not add
  screens, fields, filters, or business rules the backend doesn't already support.
- The one carve-out: a genuinely **missing UX state** for functionality that already exists
  is a correction, not a feature. Concretely, in this codebase that meant: adding a loading
  skeleton to a table that already fetched data asynchronously (the fetch existed; the
  loading state did not), adding a success toast after a save that already succeeded
  server-side (the mutation existed; the feedback did not), and adding a confirm step to
  Page Registry's deactivate/reactivate — justified only because the *identical action* on
  the *sibling* Roles screen already had one, making its absence here an inconsistency in an
  existing pattern rather than a new capability.
- If you're not sure whether something is a missing state or a new feature, ask: does the
  data/action already exist and just fail to communicate, or would this require a new
  endpoint, a new field, or a new business rule? The former is in scope; the latter is not.

## When to build a shared component (and when not to)

Progression that was actually followed for `Table`, `ConfirmDialog`, `Pagination`, and `Toast`:

```
Problem (403 on Users renders as "no data")
   ↓
Fix it on that one screen
   ↓
Grep the other 3 Security screens — same facade shape, same bug, same fix needed
   ↓
Extract once the 4th confirmation lands, not before
   ↓
Apply everywhere the pattern was confirmed (the 4 Security screens) —
not everywhere it merely *could* apply (the 7 Organization/Notifications
screens, which were not re-reviewed and were deliberately left alone)
```

- **Before adding a new file to `src/components/ui/`**, confirm the behavior is a *stable,
  repeated* pattern (2+ screens, same shape), not a one-off. `Table`/`ConfirmDialog`/
  `Pagination`/`Toast` were added because the same table markup, confirm-dialog shape, and
  "no success feedback" gap were independently confirmed in all 4 Security screens — not
  because a table or a toast seemed like a generically good idea.
- **Generalize only as far as you've verified.** `Table`/`ConfirmDialog`/`Pagination` were
  applied to the 4 Security screens where the pattern was confirmed. They were *not* rolled
  out to the 7 Organization/Notifications screens in the same pass, even though those screens
  visibly hand-roll the same table markup — because those screens run on a completely
  different data layer (mock Zustand stores with no async/loading/error states at all, vs.
  Security's TanStack Query + Facade-hook architecture) and were not read closely enough in
  this pass to guarantee the shared components fit without surprises. Rolling out a shared
  component to a screen you have not actually read is how "reusable" becomes "load-bearing
  guess."
- **A component that fixes a bug is worth extracting even if only one call site needs the
  fix today**, provided the *bug* (not just the component) is confirmed to repeat. The
  Zod-message fix (`roleCodeSchema`, `pageCodeSchema`, `usernameSchema`) was applied to 3
  schema files individually, *not* wrapped in a shared validator — because each field's
  correct message is domain-specific text, not shared behavior. Don't force an abstraction
  onto something that's just "the same category of mistake," only onto something that's
  "the same behavior."
- **Do not build Security-specific CSS or components for a problem that is really an app-wide
  gap.** The missing `@keyframes avl-spin` and the dormant `.avl-dialog`/`.avl-drawer`
  responsive/RTL CSS (built, but never wired into the `Dialog`/`Drawer` components) were both
  fixed at the shared-component/token level, not patched per-screen.
- **Consolidate the moment you notice the same logic written twice, even by yourself in the
  same pass.** `mapApiError()` (`src/lib/errors/mapApiError.ts`) exists because a first version
  of "map an `ApiError` to safe text" was written inline in `Table.tsx`, and a near-identical
  need then showed up in every page's mutation `catch` block and in two feature drawers — five
  independent call sites for one piece of logic. It was extracted to `lib/errors/` (matching
  where `ApiError`/`kindFromStatus` already live — a purpose-organized `lib/`, not a new
  `utils/` catch-all) the moment the second call site made the duplication concrete, not
  before and not after a third or fourth copy accumulated.
- **A shared component's config is a config, not a workaround.** `TableColumn.width` is an
  optional prop every table can use or ignore — adding it did not require touching any screen
  that doesn't set it. Prefer extending an existing shared component's props over adding a
  parallel `<table>` (or a wrapper around `Table` that reimplements it) when a screen needs one
  more degree of control the component doesn't yet expose.

## Table standards

- Every list screen backed by a paged search API renders three states the table component
  owns, not the page: a **loading skeleton** shaped like the real columns (not a blank
  Card), the **real data**, and — critically — a **load-error state visually distinct from
  "no data."** Before this pass, every Security screen's table showed the identical "No
  records found" empty state whether the list was genuinely empty or the request came back
  `403`/`400`. Never let a failed fetch and a successful-empty fetch render the same UI.
- If the search API returns `page`/`size`/`totalElements` (this backend's convention), the
  screen must render pagination. A table that silently shows only page 1 of paged data is not
  a finished screen — it's data loss with no visible symptom until someone's 21st record goes
  missing.
- Column headers must go through `t()`, no exceptions — `Roles.tsx`, `Permissions.tsx`, and
  `Pages.tsx` each shipped with 1–3 raw English header strings (`"Screen / Page"`,
  `"Target Page"`, `"Module"`) sitting next to a dozen correctly-translated ones in the exact
  same `<thead>`. These are the easiest i18n gaps to miss because the page *looks* fully
  translated at a glance — you have to switch to Arabic and read every header, not just skim.
- **Default page size is `DEFAULT_PAGE_SIZE` (7) from `src/data/searchContract.ts`** — every
  search-backed facade's `DEFAULT_FILTERS.size` reads this one constant, not a literal number.
  It replaced a page size of 20 that made every list screen a long, dense scroll; `Pagination`
  (already built) is how a user reaches the rest. If a screen genuinely needs a different
  default (rare — justify it in a comment), still import the constant and compute from it
  rather than writing a new bare number.
- **Give a column an explicit `width` on `TableColumn`** once its content is long/variable
  enough to make row heights uneven (a bilingual two-line name, a URL, a long description) —
  pair it with single-line ellipsis truncation (`overflow: hidden; textOverflow: ellipsis;
  whiteSpace: nowrap`) and a `title` attribute carrying the full value, rather than letting the
  cell wrap. `Table.tsx` switches to `table-layout: fixed` automatically the moment any column
  declares a `width`, and stays `auto` otherwise — don't hand-roll this per screen. Page
  Registry's Name/Route URL columns were the case that proved this: unconstrained wrapping
  made every row a different height, which is what actually read as "poor visual presentation"
  before the fix, more than any single color or spacing choice. Uneven row heights, not
  wrapped text per se, are the thing to fix — wrapping is fine when every row wraps the same
  amount; it isn't when row height becomes unpredictable.
- **A KPI/stat row repeated identically across sibling screens is not automatically useful.**
  All 4 Security screens carried the same 3-tile "Total / Active / Inactive" `Stat` row before
  this pass; it was removed everywhere at once (not cherry-picked) because (a) the total it
  showed is now redundant with `Pagination`'s own "Showing X–Y of N" line, (b) the
  active/inactive breakdown was silently wrong past page 1 (computed from `roleList.filter()`
  on the *loaded page only*, not the true dataset — a real accuracy bug, not just visual
  noise), and (c) removing it gave the actual content — the table — more of the screen. Don't
  reflexively keep a KPI row "because it's already there"; ask whether it says anything
  `Pagination` or the table's own status column doesn't already say, and whether every number
  in it is actually correct across the whole dataset, not just the current page.

## Form standards

- A validation library's default issue message (Zod's `"Invalid"` for a failed `.regex()`) is
  not user-facing copy — it's a placeholder that happens to render. Every `z.string()` /
  `.regex()` / `.min()` in a form schema needs an explicit message parameter. If you find one
  without it, that field will show "Invalid" the first time a user leaves it blank.
- Required-field asterisks and `helperText` for immutable/read-only fields (this codebase's
  `readOnlyCodeHint` pattern) are already consistent across the 4 Security screens — keep
  following that shape for new fields rather than inventing a new convention.

## Modal / dialog standards

- Confirmation copy must name the specific record, not describe the record class:
  `Deactivate role "Finance Approver"?`, not `"Are you sure you want to deactivate this
  record?"`. The generic version is what every screen shipped with; a user who has already
  looked away from the row they clicked gets nothing to re-confirm against.
- If one screen in a module confirms a state-changing action (Roles' activate/deactivate) and
  a sibling screen performs the *identical class of action* with zero confirmation (Page
  Registry's deactivate/reactivate did, before this pass), that's not two valid choices —
  it's a missing state on the second screen. Fix it with the same shared `ConfirmDialog`,
  don't invent a second confirmation pattern.
- `Dialog`/`Drawer` in `components/ui/OverlaysAndFeedback.tsx` own responsive and RTL
  positioning via the `avl-dialog`/`avl-drawer` CSS classes in
  `src/styles/tokens/responsive.css` (bottom-sheet on phones, RTL-aware slide direction).
  Don't reintroduce inline `position`/`inset`/`width`/`maxWidth` overrides on these — that's
  exactly the CSS-vs-component disconnect that left the mobile/RTL behavior dormant for
  however long it was built and unused before this pass. Inline `style` on `Dialog`/`Drawer`
  should carry color/surface concerns only (`background`, `boxShadow`) — never layout.
- **A record-picker or matrix embedded inline in a create/edit `Dialog` belongs in its own
  side `Drawer` once it can grow past a handful of rows** — not bounded with a small
  `maxHeight`/`overflowY` scroll box inside the dialog, and not left to grow the dialog itself
  without limit. Confirmed twice, same fix both times: `Users.tsx`'s Add/Edit dialog embedded
  a ~100-row role checklist with no bound at all (the dialog grew to fill and exceed the
  viewport, pushing Save/Cancel out of view); `Roles.tsx`'s Edit dialog embedded a
  ~150-row permission matrix. Both moved to their own `Drawer`
  (`components/features/RoleAssignmentDrawer.tsx`, `components/features/
  PermissionMatrixDrawer.tsx`) launched from a button, leaving the main dialog holding only
  the record's own small fields (name, code, description, active toggle — the things that fit
  in a glance). The trigger placement follows what's already true of the picker: if it's only
  meaningful once the record exists server-side (permissions on a role, data scope on a role —
  both need a real id), put the launcher in the dialog *footer* next to the existing
  edit-only actions (`Data Scope →` was already there — matched its exact style rather than
  inventing a new button shape); if it's needed during create too (roles on a brand-new user),
  put it in the dialog *body* as a compact summary (selected-item badges or a muted "none yet"
  line) plus a button, since footer-gating on `selectedX &&` isn't available yet. Either way the
  drawer receives the parent's already-fetched data and handlers as props (`roleOptions`/
  `onChange`, `matrixDraft`/`onTogglePermission`/`onSyncAll`/...) rather than re-fetching or
  re-deriving anything — it's a presentational relocation, not a new data-owning component.
  Give the picker drawer its own search filter (reusing the `Input` + lowercase `.includes()`
  pattern, `searchPlaceholder`, and the shared `noItemsMatchFilter` empty-state key — don't
  write a second "no X match your search" string per entity type) the moment the list is long
  enough that scrolling-and-reading beats typing a few letters; both confirmed instances needed
  one immediately.

## Choosing a create/edit container: Drawer vs. full page vs. tree master-detail

Three container patterns now coexist in this codebase, on purpose — the mistake that shipped
before this pass (Users/Roles/Permissions in `Dialog`, Page Registry in `Drawer`, no
documented reason for the split) was picking a container per screen instead of per content
shape. Match the content, not the screen's module:

- **Side `Drawer`** — the default for a single-entity form with a bounded field count and no
  repeating child rows (name, code, a few selects, a description, an active toggle). This is
  now the unified choice across all 4 Security screens (`Users.tsx`, `Roles.tsx`,
  `Permissions.tsx`, `Pages.tsx`) — match it for any new simple-entity CRUD screen rather than
  reaching for `Dialog` again. A record-picker or matrix that grows past a handful of rows
  still gets its own separate `Drawer` launched from this one (see "Modal / dialog standards"
  above) rather than inflating the entity Drawer itself.
- **Full page** — for a document-style entity: a header section plus one or more repeating
  line-item tables (add row / remove row) and a computed total, the shape `AccountForm.tsx`
  already established for Chart of Accounts entry. A Drawer cannot fit an editable line-items
  grid without becoming its own scroll-within-a-scroll problem; don't try. If a future entity
  needs this shape (an invoice, a purchase order), give it its own page like `AccountForm.tsx`,
  not a wide `Dialog`/`Drawer`. Within that full page, a supporting `Drawer` is still the right
  tool for a secondary lookup — e.g. an advanced product search with filters, opened from a
  line-item's field — because that lookup is itself a small, bounded, single-purpose
  interaction; it just isn't the primary edit surface.
- **Tree master-detail (custom, not a Drawer/Dialog at all)** — for genuinely hierarchical
  parent-child data, the inline two-column layout `Departments.tsx`/`CostCenters.tsx` already
  use (tree on the left, the selected node's form permanently visible on the right) beats any
  overlay, because the user needs the tree's context visible while editing. Don't convert this
  to a Drawer for consistency's sake — the inconsistency here is intentional and content-driven,
  not an oversight.

Decide by content shape, in this order: hierarchical parent-child data → tree master-detail;
repeating line items with a computed total → full page; otherwise → `Drawer`. If a screen
doesn't cleanly fit one of the three, that's a signal to look at what it actually contains
before picking, not to invent a fourth container.

## Message / feedback standards

- Every user-facing string answers "what happened" and, when relevant, "what should I do
  next." `"Invalid"` and `"Are you sure you want to deactivate this record?"` both fail this;
  `"Role code must start with a letter and contain only uppercase letters, numbers, and
  underscores."` and `Deactivate role "Finance Approver"?` both pass it.
- **Every mutation needs visible success feedback**, not just failure feedback. Before this
  pass, save/create/delete/activate/deactivate across the entire app produced *no visible
  confirmation on success* — only a red `Alert` on failure. Use `useToast()` from
  `components/ui/Toast.tsx` after every successful mutation. This was the single largest gap
  found in the whole audit precisely because it's invisible in a code read — you only notice
  a missing success toast by performing the action and watching nothing happen.
- Never surface a raw backend error as the *only* thing the user sees — not the response
  `message`, not `error.code`, not a stack trace. `"Permission already exists in tenant:
  PERM_AUDIT_QA_TEST_VIEW"` (the backend's literal 409 response body) was rendered verbatim
  in the Add Permission dialog, in Arabic mode, until this was fixed. Use `mapApiError(err,
  t)` from `src/lib/errors/mapApiError.ts` in every mutation `catch` and every list `loadError`
  — it maps a known `ApiError.code` (e.g. `PERMISSION_ALREADY_EXISTS`) to a specific business
  message, and falls back to one generic sentence per `ApiError.kind` (`errForbidden`,
  `errConflict`, `errValidation`, …) for everything else. Never call `err.message` directly in
  UI code again; `Table.tsx`'s error state and all 4 Security pages' catch blocks route through
  this one function now — that was itself a consolidation (the same kind-based fallback logic
  had been implemented twice, once inline in `Table.tsx` and once per-page) done the moment a
  second implementation of it was noticed, per "When to build a shared component" above.
- **Add a `CODE_KEYS` entry only for a code you have actually observed** in a live network
  response (check the Network tab, read `error.code` off the real payload) — never guess a
  backend code name. An unmapped code isn't a bug: it correctly falls through to its `kind`'s
  generic message, which is still safe and still never leaks backend internals.
- This applies to *every* place a mutation can fail, not just the 4 main list screens —
  `DataScopeDrawer.tsx` and `UserProfileDrawer.tsx` (both opened from `Users.tsx`/`Roles.tsx`)
  had `handleSave`/`handleDelete` with no `try/catch` at all before this pass: a failed save
  was a silently swallowed promise rejection with zero UI feedback, one level down from a raw
  backend message and worse. Grep for `await save`/`await delete`-shaped calls with no
  surrounding `try` when reviewing a feature area, not just its main screen.

## Loading / empty / error state standards

- Loading, empty, and error are three distinct states with three distinct renders. Collapsing
  error into empty (this codebase's original bug, everywhere) is the highest-severity mistake
  in this list — it actively hides backend and permission problems from the person best
  positioned to notice them.
- A KPI or count sourced from a different data layer than the screen it summarizes (the
  Dashboard's user/role counts came from an abandoned mock Zustand store while the real
  Users/Roles screens had long since moved to the live API) is a silent-drift bug, not a
  cosmetic one. If two places in the app claim to show the same number, verify they read
  from the same source before shipping either.

## RTL / Arabic / English standards

- Test Arabic by switching the running app's language toggle, not by reading the dictionary.
  The dictionary in `useLanguageStore.ts` was ~250 keys deep and genuinely well-translated;
  the bugs were entirely in call sites that bypassed `t()`, which only shows up by looking at
  the rendered screen in Arabic.
- RTL correctness includes *direction of motion*, not just text alignment — a drawer that
  mirrors its layout but still slides in from the same physical edge in Arabic as in English
  is still an RTL bug.
- Prefer logical CSS properties (`insetInlineStart`, `marginInlineStart`, `textAlign: 'start'`)
  over physical ones (`left`, `marginLeft`, `textAlign: 'left'`) in every new inline style —
  this codebase already does this consistently in the 4 Security pages; match it.

## Accessibility standards

- A validation error needs both a visible message (covered above) and, ideally, an
  `aria-invalid`/border-color signal on the specific offending field — this codebase's forms
  currently only do the former (a single top-of-form `Alert`, no field-level marker). This is
  a known, disclosed gap (see "Remaining Issues" in `UI-UX-AUDIT.md`), not a solved one —
  don't assume the top-banner pattern is sufficient just because it's what's there today.
- `IconButton` requires a `label` prop that becomes both `aria-label` and `title` — this is
  already enforced by the component's TypeScript signature. Keep using `IconButton` for
  icon-only actions rather than a raw `<button><i /></button>`, which has no such guardrail.

## Spacing / typography / design-token standards

- Design tokens in `src/styles/tokens/*.css` are real and complete (colors, spacing, radius,
  typography, elevation, breakpoints) — use `var(--token, fallback)` in every new inline
  style. Don't hardcode a hex color or a pixel value that already has a token.
- Don't invent a new token for a one-off value. Tokens in this codebase represent a design
  concept used in more than one place; a single screen's unique spacing need is just an
  inline number.

## Angular implementation standards

There is no Angular in this codebase — see the stack reality check at the top of this file.
If a future task genuinely does involve an Angular frontend (the unrelated project at
`~/System-main-main/frontend` on this machine, for example), this section and every React-
specific instruction above do not apply; re-derive standards from that project's actual
stack instead of assuming this file transfers.

## React/TanStack Query implementation standards (this project's actual stack)

- List screens use a "Facade hook" per screen (`useUserManagementFacade`, etc. — one per
  domain folder under `src/{users,roles,permissions,pageRegistry}/hooks.ts`) that composes
  TanStack Query hooks and returns everything the screen needs: `list`, `isListLoading`,
  `loadError`, `page`/`size`/`totalElements`, and the mutation actions. Add new fields to the
  facade, not ad-hoc `useQuery` calls inside the page component.
- The search endpoints in this backend are modeled as `useMutation` (POST-as-query
  convention, not `useQuery`), re-triggered manually on mount and on filter change. This
  means `search.isError`/`search.error` are mutation fields, not query fields — expose them
  explicitly from the facade (`isListLoading: search.isPending`, `loadError: search.isError ?
  search.error : null`) rather than assuming a `useQuery`-shaped hook already provides them.
- Standalone function components with `React.FC` typing, inline `style` objects reading CSS
  custom properties, and the existing `Button`/`Input`/`Select`/`Switch`/`Card`/`Stat`/`Badge`
  primitives in `components/ui/` are this project's established conventions — match them
  rather than introducing a styling approach (CSS Modules, styled-components, Tailwind) the
  rest of the codebase doesn't use.

## UI review checklist

Before calling a screen reviewed, confirm you have:

- [ ] Run the screen live, not just read its source
- [ ] Checked the Network tab for what happens on a failed load, not just a successful one
- [ ] Read the facade hook the screen calls, not just the screen component
- [ ] Switched to Arabic and read every visible string, not just skimmed the layout
- [ ] Resized to a mobile viewport and opened every dialog/drawer the screen has
- [ ] Grepped for the same UI shape (table/confirm-dialog/error-handling) in sibling screens
      before deciding to fix locally vs. extract a shared component
- [ ] Triggered at least one validation error and read the exact message shown
- [ ] Triggered at least one real backend error (a duplicate, a conflict — not just a client
      validation error) and confirmed the message shown is mapped, localized text, never the
      backend's own wording
- [ ] Performed at least one successful save/create/delete and confirmed visible feedback
- [ ] Checked every component that can trigger a save/delete for this feature, not just its
      main list screen — a drawer or sub-dialog with no `try/catch` around its mutation is a
      silent-failure bug the main screen's own review will never surface

## Definition of done

A UI/UX fix on this project is done when: the fix is verified live in the browser (not just
compiled), `npx tsc --noEmit` is clean, the fix was applied to every screen where the same
pattern was independently confirmed (no more, no less — see "When to build a shared
component"), no new business functionality was introduced, and — if a shared component was
touched or added — the audit/finding that justified it is written down somewhere a future
reviewer can find (this file, or `UI-UX-AUDIT.md`).
