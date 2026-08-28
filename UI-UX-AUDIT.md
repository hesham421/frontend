# UI/UX Audit — Security Module & ERP Foundation

**Scope reviewed:** Security & RBAC module (User Management, Roles & Permissions, Permission Registry, Page Registry) at `http://localhost:4200`, plus the shared UI infrastructure it draws on.

**Stack correction:** this brief was written assuming Angular 21. The actual app at the given path/URL (`/Users/ezzat/my project/frontend`, port 4200) is **React 18 + Vite + TanStack Query + Zustand**, confirmed by `package.json`, the running process, and the source tree. There is no Angular code anywhere in this repo (a *separate*, unrelated Angular project exists elsewhere on this machine at `~/System-main-main/frontend`, but it is not what's running on port 4200 and was not touched). All findings and fixes below are React-native. Two files (`responsive.css`, `breakpoints.css`) contain header comments literally referring to "the Angular ERP shell" — these are themselves an audit finding (§Visual/Consistency) and were corrected.

**Method:** read the source tree end-to-end (components, hooks, stores, styles, i18n); ran the app in a real browser as `admin`/`admin` (seeded SUPER_ADMIN); clicked through all four Security screens; inspected network/console traffic; tested create/validate/save/confirm/deactivate flows; switched language to Arabic and checked RTL; resized to a mobile viewport.

---

## Executive Summary

The Security module sits on a genuinely solid foundation: real design tokens, a complete bilingual (EN/AR) dictionary, consistent TanStack Query + Zod + "Facade hook" architecture, and RTL-aware logical CSS in most places. The four screens (Users, Roles, Permissions, Pages) are near-identical in structure, which is good news for reuse — the same fix, applied once to a shared component, fixes all four at once.

But that identical structure is currently *duplicated*, not *shared*: every screen hand-rolls its own `<table>`, its own confirm dialog, its own error handling. That duplication is why real problems are also identical across all four screens:

1. **A failed data load looks identical to "there is no data."** When `/api/users/search` returns `403 Forbidden` (a real, live backend permission gap in this environment) or `/api/roles/search` returns `400` on a bad request, the page renders the same "No records found" empty state it would show for a genuinely empty table. The user has no way to tell "you have no users" from "the server just refused this request." This is the highest-impact finding in the audit.
2. **No success feedback exists anywhere in the app.** Save, create, delete, activate, deactivate all complete silently — confirmed both by clicking through the UI and by an explicit code comment repeated in every Facade hook: *"No toasts, dialogs, or navigation here."* Toasts were deferred, never built.
3. **Validation errors are not human-readable.** Submitting the "Add Role" form empty shows a banner reading exactly **"Invalid"** — Zod's default message for a regex mismatch, never overridden with real copy.
4. **A dashboard KPI actively lies.** The Overview page reads user/role counts from a leftover mock Zustand store (`useSecurityStore`) that no live Security screen uses any more; the real Users/Roles screens read from the real API. In this environment that means Overview says "4 Total Users" while the Users screen — hitting the same backend — shows 0 (masked by finding #1). Two numbers, same app, same moment, no relationship.
5. **No shared `Table`, `Pagination`, or `ConfirmDialog` component exists.** 11 files across the app (all 4 Security screens included) independently reimplement the same table markup and the same confirm-dialog shape. The search API already returns `page`/`size`/`totalElements`; nothing renders pagination controls, so a role list beyond one page would silently truncate.

None of the fixes below add product functionality. They make functionality that already exists (search, save, validate, confirm, paginate) actually communicate its result to the user — and they do it once, in shared components, instead of four times.

---

## User Experience Findings

### F1 — Failed loads are indistinguishable from empty data (Critical)
**Location:** `src/pages/Security/Users.tsx:225`, `Roles.tsx:266`, `Permissions.tsx:176`, `Pages.tsx:260`; root cause in `src/users/hooks.ts:139`, `src/roles/hooks.ts:229`, `src/permissions/hooks.ts:73`, `src/pageRegistry/hooks.ts:144`.
**Observed:** Logging in as the seeded SUPER_ADMIN and opening User Management shows "No records found" with a "Try adjusting your search criteria or add a new record" hint. The Overview dashboard, one click away, says "4 Total Users." Network inspection shows `POST /api/users/search → 403 FORBIDDEN` ("You don't have permission to access this resource") and, on the Roles screen's dashboard widget, `POST /api/roles/search → 400` ("Page size must not exceed 100"). The Facade hooks' `search` is a `useMutation`, which already exposes `.isError`/`.error` — the page components simply never read it. `userList`/`roleList`/etc. default to `[]` on error, which is structurally identical to a real empty result.
**Why it's a UX problem:** The user (even a SUPER_ADMIN) cannot tell "there is nothing here" from "something is broken and hidden from you." A real empty state invites "add a new record"; a permission or server error needs a completely different message and, ideally, a retry action. Silently swallowing a 403 on a security-permissions screen is especially bad — it's the one place in the app where "you don't have permission" is exactly the information a user needs.
**Severity:** Critical (broken UX, actively misleading).
**Proposed solution:** Expose `loadError` from each Facade hook; add an error-state affordance to the shared empty-state component so screens can render "Unable to load — [reason]" with a Retry button, distinct from the genuine empty state.
**Reusable pattern?** Yes — identical root cause, identical fix, across all 4 Security screens (and, by extension, any future TanStack-Query-backed list screen).

### F2 — No success feedback for any action (Critical)
**Location:** All 4 Security screens; explicitly deferred by design per repeated comment in `src/users/hooks.ts:101`, `src/roles/hooks.ts:176`, `src/permissions/hooks.ts:52`, `src/pageRegistry/hooks.ts:111` ("No toasts, dialogs, or navigation here").
**Observed:** Saving a role, deactivating a role, creating a user — all close their dialog (or don't, on error) with zero visible confirmation. The only feedback path in the whole app is a red `Alert` banner, and only on failure.
**Why it's a UX problem:** Violates the brief's own "Save → Processing → Success/Failure → Clear feedback" lifecycle. A user who deactivates a role and sees the dialog simply close cannot be sure the action registered versus silently failing before the dialog-close line even ran.
**Severity:** Critical.
**Proposed solution:** A shared toast/notification system (new — nothing like it exists), wired into save/create/update/delete/activate/deactivate across the 4 screens.
**Reusable pattern?** Yes — this is the single highest-leverage shared component the audit identified.

### F3 — Non-descriptive validation error text ("Invalid")
**Location:** `src/roles/roles.schema.ts:7` (`roleCodeSchema = z.string().regex(/^[A-Z][A-Z0-9_]*$/)`), same pattern in `src/pageRegistry/pageRegistry.schema.ts:8-17`; surfaced via `parsed.error.issues[0]?.message` in every page's `handleSave`.
**Observed:** Opening "Add New" on Roles and clicking "Save Changes" with empty fields shows a single-word banner: **"Invalid."** This is Zod's built-in default message for a failed `.regex()` check — no custom message was ever supplied.
**Why it's a UX problem:** Fails the brief's own UX Language Standard outright: it answers neither "what happened" nor "what should I do next." It also isn't associated with the specific field that's wrong (no `aria-invalid`, no red border on Code/Name — confirmed via DOM inspection).
**Severity:** High.
**Proposed solution:** Add real `.regex(pattern, 'message')` / `.min(1, 'message')` text to every Zod schema field; keep the existing single-banner presentation (matches the rest of the app) rather than inventing new per-field UI.
**Reusable pattern?** The *bug* (unmessaged Zod validators) is repeated in `users.schema.ts`, `roles.schema.ts`, `pageRegistry.schema.ts` — same fix, applied everywhere it appears.

### F4 — Dashboard KPI numbers don't match the module they summarize
**Location:** `src/pages/Dashboard.tsx:21-22` (`useSecurityStore((s) => s.users.length)` / `.roles.length`) vs. `src/stores/useSecurityStore.ts` (420-line mock CRUD store) vs. `src/users/hooks.ts` / `src/roles/hooks.ts` (real API-backed facades used by the actual Users/Roles screens).
**Observed:** Overview shows "4 Total Users" / "4 Configured Roles" (hardcoded mock data). Navigating into User Management (real API) shows 0 (see F1); Roles & Permissions (real API) shows 20. `useSecurityStore` is otherwise dead code — a repo-wide search shows no Security screen imports it any more.
**Why it's a UX problem:** A dashboard KPI's entire job is to be a trustworthy preview of the module behind it. Once a user notices the mismatch once, they stop trusting every number on the dashboard, not just these two.
**Severity:** High.
**Proposed solution:** Point Dashboard's user/role counts at the real Security API (lightweight count queries) instead of the mock store; delete the now-fully-dead `useSecurityStore` import from `Dashboard.tsx`. (Organization/Notifications KPIs on the same dashboard have the identical problem via `useOrganizationStore`/`useNotificationsStore`, but those modules are out of this audit's stated scope — flagged under "Issues That Should NOT Be Generalized" below, not fixed here.)
**Reusable pattern?** No — one-off data-source fix, not a component.

### F5 — Generic, non-specific confirmation copy
**Location:** `confirmActionTitle` / `confirmDeactivate` / `confirmReactivate` keys in `useLanguageStore.ts`, used verbatim in all 4 Security screens' confirm dialogs.
**Observed:** Deactivating any role shows the same dialog regardless of which role: title "Confirm Required Action," body "Are you sure you want to deactivate this record?" — no role name, no code, no statement of consequence (e.g., does deactivating a role affect users currently holding it?).
**Why it's a UX problem:** Generic confirmation copy is a known source of accidental-action risk in dense admin tables — the user has already looked away from the row they clicked by the time the dialog appears, and the dialog gives them nothing to re-confirm against.
**Severity:** Medium.
**Proposed solution:** Interpolate the record's own name/code into the confirmation body (e.g., "Deactivate role **Finance Approver**? Users assigned to it keep the role but lose its permissions immediately.").
**Reusable pattern?** Yes, once a shared `ConfirmDialog` exists (see Modal Findings) — give it a `subject` prop.

---

## Visual Findings

### F6 — Missing `@keyframes avl-spin` — every loading spinner is static
**Location:** `src/components/ui/Button.tsx:158` references `animation: 'avl-spin 0.7s linear infinite'`; no matching `@keyframes` exists anywhere in `src/styles`.
**Observed:** Every "Save" button's loading state renders a circle with a transparent top border — intended to spin, but never animates, because the keyframe was never defined.
**Why it's a UX problem:** A non-spinning "loading" indicator reads as broken, not busy — actively worse than no indicator, since it looks like the button is stuck.
**Severity:** Low (cosmetic) but trivial to fix and visibly broken once you know to look.
**Proposed solution:** Add the missing `@keyframes avl-spin` (one-line CSS addition).
**Reusable pattern?** N/A — global CSS bug, one fix covers every instance.

### F7 — Dead CSS: a complete responsive/RTL dialog & drawer system sits unused
**Location:** `src/styles/tokens/responsive.css:153-265` defines `.avl-dialog`/`.avl-dialog__panel` (centered on desktop, **bottom-sheet on phones**) and `.avl-drawer`/`.avl-drawer__panel` (**RTL-aware slide direction** — from the left in Arabic, right in English), complete with `prefers-reduced-motion` handling. `src/components/ui/OverlaysAndFeedback.tsx`'s actual `Dialog`/`Drawer` components reimplement positioning from scratch with inline styles and never reference any of these classes.
**Observed:** On a mobile viewport, the "Add New" dialog stays a small centered box rather than docking as a bottom sheet; in Arabic, the Page Registry drawer still slides in from the same physical edge as in English rather than mirroring.
**Why it's a UX problem:** This is a "missed reuse," not a missing feature — someone already designed and built the correct mobile/RTL modal behavior; it's simply disconnected from the components that render dialogs and drawers.
**Severity:** Medium.
**Proposed solution:** Wire `Dialog`/`Drawer` to use these classes (`avl-dialog`, `avl-dialog__scrim`, `avl-dialog__panel`, etc.) for positioning/animation, keeping only color/surface concerns inline.
**Reusable pattern?** Yes — fixing the 2 shared components fixes every dialog/drawer in the app at once, Security included.

### F8 — Attached class names with no matching CSS
**Location:** `Button.tsx`, `Card`/`Badge` in `DataDisplay.tsx`, `IconButton` all attach `avl-btn`/`avl-card`/`avl-badge`/`avl-icon-btn` classes; no CSS rule anywhere in `src/styles` targets any of them (all visual styling is inline `style` objects).
**Observed:** Confirmed via repo-wide grep — zero matches.
**Why it's a UX problem:** Not user-visible today (inline styles fully cover it), but it's a maintainability trap: a future engineer who edits `.avl-btn` in CSS, expecting it to change button appearance, will see nothing happen.
**Severity:** Low.
**Proposed solution:** Left as-is — removing the class names is riskier (possible e2e-test selector dependency, per `testsprite_tests/`) than leaving inert hooks; noted here for awareness, not fixed in this pass.
**Reusable pattern?** N/A.

### F9 — Inconsistent Arabic column-header translation
**Location:** `src/pages/Security/Pages.tsx:279-283` ("Module", "Route URL" hardcoded), `Roles.tsx:453` ("Screen / Page" hardcoded), `Permissions.tsx:195,276` ("Target Page", "Associated Screen" hardcoded).
**Observed:** Switching the app to Arabic translates every other column header and all sidebar/breadcrumb text correctly (the dictionary is genuinely complete for ~250 other keys), but these specific headers stay in English because they bypass `t()` entirely.
**Why it's a UX problem:** Breaks the RTL/Arabic experience's credibility in exactly the screens (Security tables) this audit is scoped to — a few stray English words in an otherwise fully Arabic table read as unfinished, not intentional.
**Severity:** Medium.
**Proposed solution:** Add the missing translation keys and route these labels through `t()`.
**Reusable pattern?** No — targeted string fixes, not a component change.

### F10 — Stale "Angular" references in a React codebase's own design-token comments
**Location:** `src/styles/tokens/responsive.css:3` ("Production utilities for the Angular ERP shell"), `src/styles/tokens/breakpoints.css:4` ("mirror them verbatim in Angular SCSS").
**Observed:** Both files are pure CSS consumed only by this React app; nothing Angular exists downstream of them.
**Why it's a UX problem:** Not user-facing, but exactly the kind of stale documentation that misleads whoever touches these tokens next (as it briefly did for this audit, before the running app was inspected directly) — worth correcting as part of establishing a trustworthy foundation.
**Severity:** Low.
**Proposed solution:** Correct the comments to describe the React app accurately.
**Reusable pattern?** N/A.

---

## Interaction Findings

### F11 — No pagination anywhere, despite the API supporting it
**Location:** All 4 Security screens; `totalElements`/`page`/`size` are already present on every search response type (`RoleSearchFilters`, `UserSearchFilters`, etc. in the respective `hooks.ts` files) but never rendered.
**Observed:** Roles & Permissions currently lists all 20 roles in one unpaginated scroll (confirmed via the accessibility tree — no "next," no page-size control, no truncation). At 20 rows this is merely inconvenient; in production RBAC data (hundreds of roles/permissions across a real ERP) it would mean the UI silently returns only page 1's worth of `size: 20` records with **no way to reach the rest**.
**Why it's a UX problem:** This isn't a future scaling concern — the search endpoint is already page-limited server-side (`size: 20` default), so data *is already being hidden* the moment a table exceeds one page; there is simply no visible sign of it.
**Severity:** High (silent data loss at scale, not just inconvenience).
**Proposed solution:** A shared pagination control reading `page`/`size`/`totalElements` from the Facade hooks (all of which already carry this data) and calling the existing `setSearchFilters({ page })`.
**Reusable pattern?** Yes — identical shape across all 4 screens' search state.

### F12 — Duplicated `branchIdToNumber()` helper
**Location:** `src/components/features/DataScopeDrawer.tsx:21-23` and `src/components/features/UserProfileDrawer.tsx:21-23` — same function, same explanatory comment, copy-pasted.
**Observed:** Confirmed via direct read of both files.
**Why it's a UX problem:** Not user-facing directly, but a correctness/maintainability risk: the two copies can silently drift.
**Severity:** Low.
**Proposed solution:** Extract to one shared utility.
**Reusable pattern?** Trivial extraction, not a "pattern" per se.

---

## Responsive Findings

Covered primarily under F7 (dead responsive dialog/drawer CSS). Beyond that: the app shell itself (`AppShell`/`Sidebar`/`Topbar`) already has correct, working off-canvas mobile navigation via `responsive.css`'s `.avl-sidebar`/`.avl-scrim` classes — confirmed by direct testing at a 375px viewport (sidebar opens as an overlay, closes on scrim tap). This part of the foundation works today and needed no fix. Security screens' own tables already wrap in `overflow-x: auto` for narrow viewports (functional, if not elegant — see "Issues That Should NOT Be Generalized").

---

## Accessibility Findings

### F13 — Validation errors have no accessible field association
**Location:** Same forms as F3 — confirmed via direct DOM inspection (`aria-invalid` is `null` on every input in the Add Role dialog after a failed submit; no border-color change on the actual invalid fields).
**Why it's a UX problem:** A screen-reader user gets no signal at all that a field is invalid — only sighted users scanning for the (currently unhelpful) banner text would even know a validation error occurred.
**Severity:** Medium.
**Proposed solution:** Out of scope to fully rebuild field-level error UI in this pass (would touch every form field across 4 screens); tracked as a remaining issue. The message-text fix (F3) at least makes the one banner that does exist say something real.

### F14 — Icon-only close/RTL affordances rely on `aria-label`, present and correct
**Observed (positive finding):** `IconButton` requires a `label` prop used for both `aria-label` and `title`; Dialog/Drawer close buttons and table row actions all pass one. No missing-label issue found in the Security screens.
**Why this matters:** Called out explicitly so this isn't lost — the accessibility foundation for icon buttons is already sound and should be the standard other new components follow, not something to "fix."

---

## Arabic / English Findings

Summarized: dictionary itself is complete and high quality (~250 keys × 2 languages, natural phrasing, not machine-translated placeholders); RTL flips the layout, sidebar position, and text alignment correctly on live testing; logical CSS properties (`insetInlineStart`, `marginInlineStart`, `textAlign: 'start'`) are used consistently in the 4 Security page components. The concrete gaps are F9 (hardcoded English table headers) and F7's RTL-drawer-direction half (dead CSS). No other issues found beyond those two.

---

## Table Findings

Consolidated: F1 (errors masquerading as empty), F11 (no pagination), plus the underlying structural issue — **11 files, including all 4 Security screens, hand-roll the same `<table>` markup** (identical inline header styles, identical row-hover transition, identical `overflowX: 'auto'` wrapper) instead of sharing one component. This is the single largest duplication surface in the codebase and the basis for the `Table` component built in this pass (see Reusable Patterns below).

## Form Findings

Covered by F3 (message text) and F13 (accessible association). Structurally, forms are consistent and reasonably good: consistent `Input`/`Select`/`Switch` usage, consistent `*` required-marker convention, consistent `helperText` pattern for read-only/immutable fields. No form-layout issues found beyond the two above.

## Modal Findings

Covered by F7 (dead responsive/RTL CSS) and the "no shared `ConfirmDialog`" duplication noted in the Executive Summary (11 files reimplement the same confirm-dialog shape via the generic `Dialog` + local state). One additional observation: Page Registry uses `Drawer` for its create/edit form while the other 3 Security screens use `Dialog` for the same job — not a bug (a wider form arguably suits a drawer better), but worth naming as an intentional inconsistency rather than an accidental one, since it wasn't obviously deliberate from the code.

## Feedback / Messaging Findings

Covered by F2 (no success feedback at all) and F3 (unreadable validation text).

---

## Repeated Patterns

| Pattern | Where it repeats | Fixed via |
|---|---|---|
| Hand-rolled `<table>` markup | All 4 Security screens (+ 7 more outside scope) | New shared `Table` component |
| Confirm dialog built from generic `Dialog` + local state | All 4 Security screens (+ 7 more outside scope) | New shared `ConfirmDialog` component |
| Search-load error silently dropped | All 4 Security Facade hooks | `loadError` exposed from each Facade + error-state UI |
| No success feedback after mutation | All 4 Security screens | New shared toast system |
| No pagination despite paged API | All 4 Security screens | New shared `Pagination` component |
| Zod schema with no custom messages | `users.schema.ts`, `roles.schema.ts`, `pageRegistry.schema.ts` | Added messages to each |

---

## Reusability Opportunities

1. **`Table` component** (new, `src/components/ui/Table.tsx`) — column-driven, accepts a `loadError` + `isLoading` + empty-state trio so F1's fix ships everywhere the table ships. Proven reusable: applied to all 4 Security screens in this pass with no per-screen visual regressions (verified in-browser).
2. **`ConfirmDialog` component** (new, built on the existing `Dialog`) — collapses the repeated Cancel/Confirm footer + local `confirm*` state pattern; takes a `subject` for F5's specific-copy fix.
3. **Toast system** (new, `src/components/ui/Toast.tsx` + a small provider) — the only genuinely new piece of client infrastructure added. Justified because *zero* prior art existed to reuse (confirmed: no toast component, no dependency for one) and the need is identical across every mutating action in the app.
4. **`Pagination` component** (new) — thin, reads `page`/`size`/`totalElements`, calls back with the next page.
5. **Dialog/Drawer responsive CSS wiring** — not a new component, but connecting F7's already-built CSS system to the 2 existing shared components benefits every current and future modal in the app.

---

## Recommended Changes

Implemented in this pass, in priority order: F1, F2, F3, F4, F11 (broken/confusing UX and data-loss-risk items first), then F5, F6, F7, F9, F10, F12 (consistency, polish, maintainability). F8 and F13 are documented but intentionally not touched — see below.

## Issues That Should NOT Be Generalized

- **Organization/Notifications modules' identical mock-data problem (F4's sibling).** `useOrganizationStore` and `useNotificationsStore` have the exact same "mock store powers the dashboard, real screens would use something else" shape `useSecurityStore` did — but Organization/Notifications screens *themselves* still run entirely on mock Zustand stores with no async/loading/error states at all (confirmed by the architecture review). Fixing their dashboard KPIs alone, without fixing the screens behind them, would just move the trust-mismatch rather than remove it. Out of this audit's Security-module scope; flagged for a dedicated pass once (or if) those modules get real backends.
- **`Table`/`ConfirmDialog` rollout to Organization/Notifications screens.** The components built here are generic and would work there too, but migrating those 7 additional screens was not attempted — doing so now, sight-unseen against their specific column/action needs, risks exactly the "guess → generic component → overengineering" failure mode the brief warns against. Recommended as a fast-follow once someone has actually looked at those screens with the same scrutiny this audit gave Security.
- **`avl-btn`/`avl-card`/`avl-badge` dead class names (F8).** Left alone rather than stripped, since a test suite (`testsprite_tests/`) exists in this repo and may depend on these selectors — removing them without checking every test file first is a needless risk for a purely cosmetic cleanup.
- **Field-level accessible validation (F13).** Real fix requires touching the `Input`/`Select` error-display contract itself and every call site; scoped out of this pass to avoid a form-behavior rewrite riding along with the error/toast/table work above.
