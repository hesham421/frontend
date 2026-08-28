# SECURITY — SEC-FE Session Report

**Phase:** SEC-FE (Frontend Security Specifications) — all 7 pending subs executed in one pass (all LIGHT/MEDIUM weight).

## Foundation added (not sub-specific)

- `src/auth/permissions.ts` — `usePermission().can(literal)`, reading the one real
  permission source in the app: `useAuthStore.user.permissions` (flattened
  `permissions: string[]` from the login-token response). No new session/
  Context layer was introduced — this reuses the store that already existed.
- `src/pages/Unauthorized.tsx` — the `<Unauthorized/>` component every F4 TODO
  referenced; wired into `App.tsx`'s `sec-users` switch case only (see below).
- Two new i18n keys (`unauthorizedTitle`, `backToDashboard`) in `useLanguageStore.ts`.

## Subs completed

| Sub | Screen guard | canCreate/canEdit/canDelete | Files |
|---|---|---|---|
| SCR-SEC-001 | n/a-by-design (pre-auth) | n/a | none — documentation-only, confirmed in the spec itself |
| SCR-SEC-002 | **Implemented** — `PERM_USER_VIEW` (confirmed literal, `App.tsx`) | `PERM_USER_CREATE/UPDATE/DELETE` | `src/users/hooks.ts`, `src/pages/Security/Users.tsx` |
| SCR-SEC-003 | **Blocked** (OQ-SEC-FE-003) | `ROLE_CREATE/UPDATE/DELETE` (real, confirmed) | `src/roles/hooks.ts`, `src/pages/Security/Roles.tsx`, `src/components/features/PermissionMatrixDrawer.tsx` |
| SCR-SEC-004 | **Blocked** (OQ-SEC-FE-003) | Not gated — confirmed asymmetry, see below | `src/permissions/hooks.ts` (doc comment only) |
| SCR-SEC-005 | **Blocked** (OQ-SEC-FE-003) | `PAGE_CREATE/UPDATE/DELETE` (real, confirmed) | `src/pageRegistry/hooks.ts`, `src/pages/Security/Pages.tsx` |
| SCR-SEC-006 | `USER_PROFILE_VIEW` gates the launch button in Users.tsx | `USER_PROFILE_CREATE`/`USER_PROFILE_UPDATE` (branch-specific) | `src/userProfiles/hooks.ts`, `src/components/features/UserProfileDrawer.tsx` |
| SCR-SEC-007 | `ROLE_VIEW` gates the launch buttons in Users.tsx and Roles.tsx | `ROLE_CREATE/UPDATE/DELETE` (branch-specific) | `src/roleDataScope/hooks.ts`, `src/components/features/DataScopeDrawer.tsx` |

## Key scoping decision: two distinct kinds of permission literal

The API docs (`governance/modules/SECURITY/api-docs/endpoints/*.md`) confirm real,
literal `@PreAuthorize`-derived authority strings per endpoint (e.g. `ROLE_VIEW`,
`PAGE_CREATE`, `USER_PROFILE_UPDATE`, `PERMISSION_VIEW`). These are separate from
the `PERM_<PAGE_CODE>_<TYPE>` convention F4 assumed drives the switch-case screen
guard itself (RULE-SEC-047's auto-generated per-page CRUD set). Only one pageCode
was ever confirmed by literal example (`"USER"`, in permissionmanagement.md's
response sample) — so only `sec-users` got its screen-level guard implemented.
Roles/Permissions/Pages' own pageCode remains unconfirmed (OQ-SEC-FE-003); per
the constraint against inventing a `PERM_*` literal, those three switch cases
were left open, each with a `BLOCKED (OQ-SEC-FE-003)` comment in `App.tsx`.

This did **not** leave those three screens unprotected: every mutation on them
already carries its own real, confirmed, server-enforced authority check
(`ROLE_*`, `PAGE_*`), which is what action-level `canCreate`/`canEdit`/`canDelete`
gating uses directly — those literals were never in question, only the
frontend-only screen-entry convention was.

## Confirmed asymmetry: Permission Registry (SCR-SEC-004)

`permission-management.md` confirms `POST /api/permissions` (create) and
`PUT /api/permissions/{id}` (update) carry **no** permission annotation at all —
only `POST /api/permissions/search` requires `PERMISSION_VIEW`. Per AD-6, gating
a frontend control on a permission the backend doesn't actually check would
imply protection that doesn't exist, so `PermissionsPage` was intentionally left
ungated (documented, not treated as an oversight to silently correct).

## Not done / gaps

- **canDelete for Roles** (`ROLE_DELETE`) is computed in `useRoleManagementFacade`
  but has no UI home — `RolesPage` only exposes activate/deactivate (both
  confirmed to carry no permission requirement server-side), never a hard
  delete button. Flagged here rather than adding a new delete action, which
  would be outside SEC-FE's gating-only scope.
- SEC-IMPL-RULE-3 (403 → localized message) required no new code: every mutation
  across these screens already routes through `mapApiError`/`errForbidden`
  (built prior to this phase), which already produces the correct message on
  any 403.

## Verification

`npx tsc --noEmit` passes clean across every changed file.

## Blocked

- **OQ-SEC-FE-003** — `sec-roles`, `sec-permissions`, `sec-pages` switch-case
  screen guards in `App.tsx` remain unimplemented pending confirmation of each
  screen's real Page Registry `pageCode` (needed to construct the correct
  `PERM_<PAGE_CODE>_VIEW` literal without inventing one).
