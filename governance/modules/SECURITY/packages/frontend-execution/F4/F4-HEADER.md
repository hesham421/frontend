<!-- Source: PHASE:F4 / PREAMBLE (before first SUB) -->

## PHASE F4 — Routing & Component Structure

```
GOVERNANCE DECISION POINT (read before the per-screen blocks below —
this reshapes every F4-SCREEN block in this phase and is the single
most consequential AS-IS finding in this plan):

CORE-8 mandates React Router; F4-RULE-1/2/3 assume a route config with
path slugs, code-split chunks, and <ProtectedRoute> guards. The real,
Shell-confirmed navigation mechanism (shell-manifest-SECURITY.md,
Section "Routes" + "Gaps") is a `switch (currentScreen)` in
src/App.tsx, where `currentScreen` is a plain string held in a Zustand
store (`useNavigationStore`, `setCurrentScreen`) — there is NO React
Router anywhere in this module: no `<Routes>`/`<Route>` tree, no route
config file, no URL-path-based navigation, no per-screen guard
component (`<ProtectedRoute>` does not exist in this codebase). Only
ONE global check exists: `if (!isAuthenticated) return <Login .../>` in
App.tsx, gating the entire authenticated app shell as a single unit,
not per-screen.

Per CONTRACT-12 v2.1, F4's role on this module is to CONFIRM and
DOCUMENT the real Shell's existing structure and add only flagged
integration gaps — never to redesign it from scratch. This plan does
NOT invent a React Router config, route paths, or `<ProtectedRoute>`
elements that do not exist in the real code (HR-8). Every F4-SCREEN
block below is therefore reshaped from the engine's standard template:
"Route path" becomes "Screen key" (the real switch-case string),
"Route guard" is reported as its TRUE current state (NONE, except the
one global isAuthenticated check) rather than assumed present, and is
then given as an explicit FLAGGED ADDITION (a permission-gated render
inside the switch case, using the SEC-FE phase's permission hooks) —
this is the concrete form F4-RULE-3's guard requirement takes in a
router-less architecture, added on top of what the Shell has, not
silently fabricated as a route-level guard that could never exist here.

COMPOUND INCONSISTENCY (carried from 0.2 / F1-MODEL ENTITY-SEC-004
correction #7 / F2's menu cross-cutting note — resolved as a decision
HERE, not deferred further): THREE independent real, backend-confirmed
fields all imply URL-based routing that the Shell does not use —
AppScreen.route (Page Registry, ENTITY-SEC-004), MenuItemDto.routePath
(API-SEC-048/049), and the Shell's own now-orphaned `AppScreen.route`
mock values (/security/users, etc., per shell-manifest). This plan's
decision: treat `route`/`routePath` as REAL, BACKEND-REQUIRED,
VALIDATED data (RULE-SEC-046 still applies — the field must be
populated correctly on every Page create/update) that is CURRENTLY
UNCONSUMED by this module's frontend, rather than either (a) silently
wiring it into a router that doesn't exist, or (b) recommending its
removal from the backend schema, which is out of scope for a frontend
plan. This is flagged as a genuine, unresolved product/architecture
decision for a human to make (introduce real routing vs. formally
deprecate the field) — OQ-SEC-FE-001 already covers SCR-SEC-001's
Shell-state gap; this is tracked separately as a structural note, not
given its own new OQ-ID, since no further frontend action is blocked
by leaving it unconsumed (the field still round-trips correctly
through F2's Create/Update Page mutations regardless).

PERM_* SOURCING GAP (raise, do not invent — HR-8): RULE-SEC-047
confirms real pages have auto-generated PERM_<PAGE_CODE>_<TYPE>
permission records, and permissionmanagement.md's own response example
confirms one real literal value: PERM_USER_VIEW (pageCode: "USER").
No other screen's real pageCode string (for Role/Permission/Page
Registry/Profile/DataScope/Menu) was confirmed by literal example
anywhere in the attached artifacts this session — shell-manifest's mock
data uses placeholder ids like 'SCR-SEC-002', which is this SRS's
SCR-ID, NOT necessarily the real backend `pageCode` value. This plan
does NOT invent PERM_ROLE_VIEW / PERM_PAGE_VIEW / etc. as literal
strings. Raised as OQ-SEC-FE-003 (NEW, this session): the real pageCode
per screen (beyond the one confirmed "USER") must be resolved from the
live Page Registry (GET /api/pages/active, API-SEC-036) at
implementation time — SEC-FE's permission hooks reference PERM_*
values by looking up the current user's `permissions: string[]` array
(returned by login-token/UserDto) against the real pageCode-derived
names, not by any hardcoded string this plan supplies for the
unconfirmed screens.
```