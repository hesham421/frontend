<!-- Source: PHASE:SEC-FE -->

# PHASE SEC-FE — Frontend Security Specifications

**Prerequisite integration (applies once, referenced by every block
below — FINDING-004):** `useAuthStore`'s `UserProfile` gains a
`permissions: string[]` field, populated from `POST /api/auth/login-token`
on login (F1-MODEL "Session model" above). Every `canView`/`canCreate`/
`canEdit`/`canDelete`/`canApprove` flag below is derived as
`user.permissions.includes('PERM_X_Y')` — a plain array check, no new
infra needed beyond storing the array.

```
### SEC-FE — SCR-SEC-001 — Authentication & Self-Service
─────────────────────────────────────────────────────────────────
Screen guard     : NONE — public by design (SRS B4). No canView check
                    applies; this screen is reachable whenever
                    `isAuthenticated === false`.
Permission-based UI behavior: n/a — no permission-gated actions exist
                    on this screen (Login/Signup/Activate/Forgot/Reset
                    are all unauthenticated by definition)
EXCEPTION module scope: n/a
─────────────────────────────────────────────────────────────────

### SEC-FE — SCR-SEC-002 — User Management
─────────────────────────────────────────────────────────────────
Screen guard     : navigation to 'sec-users' requires
                    permissions.includes('PERM_USER_VIEW')
                    canView = false → do not render the Sidebar nav item
                    for this screen at all (Sidebar.tsx currently always
                    renders `navItem('sec-users', ...)` unconditionally —
                    integration gap, wrap in the same permission check),
                    AND if `currentScreen === 'sec-users'` is somehow
                    reached anyway (e.g. stale state), App.tsx's render
                    switch redirects to 'dashboard' instead

Permission-based UI behavior:
  canCreate = false → "New" button (opens create Dialog) not rendered
  canEdit   = false → all Dialog fields become disabled; "Save" button
                       not rendered; row click still opens the Dialog in
                       a read-only VIEW mode (not blocked entirely — SRS
                       doesn't distinguish a separate VIEW permission
                       from Edit here, VIEW-only access still permits
                       opening the Dialog to inspect a record)
  canDelete = false → "Delete" row action not rendered
  Roles multi-select → additionally requires PERM_USER_UPDATE (SRS B2
                       note: "PERM_USER_MANAGE_ROLES مطابقة لنفس القيمة
                       فعلياً" — i.e. this is NOT an independent
                       permission despite the real endpoint's separate
                       `USER_MANAGE_ROLES` name found in the API doc;
                       gate on canEdit, not a fifth flag)
EXCEPTION module scope: n/a
─────────────────────────────────────────────────────────────────

### SEC-FE — SCR-SEC-003 — Role & RBAC Management
─────────────────────────────────────────────────────────────────
Screen guard     : navigation to 'sec-roles' requires PERM_ROLE_VIEW
                    (same Sidebar-gap pattern as SCR-SEC-002)

Permission-based UI behavior:
  canCreate = false → "New" button not rendered
  canEdit   = false → all Dialog fields (incl. the permission matrix
                       checkboxes) disabled; Save not rendered
  canDelete = false → "Delete" row action not rendered
  Activate/Deactivate buttons → require PERM_ROLE_UPDATE (both — not
                       split into separate activate/deactivate
                       permissions; matches SRS B2/B4, and is consistent
                       with FINDING-001's single real endpoint)
  "Copy From Role" button → requires PERM_ROLE_UPDATE (per SRS intent;
                       see FINDING-005 — backend enforcement of this
                       specific action is unconfirmed in the real docs,
                       gate anyway)
  "Branch Data Scope →" link → requires PERM_ROLE_VIEW at minimum to be
                       shown; the Drawer it opens (SCR-SEC-007) applies
                       its own canEdit/canDelete on top (PERM_ROLE_UPDATE)
EXCEPTION module scope: n/a
─────────────────────────────────────────────────────────────────

### SEC-FE — SCR-SEC-004 — Permission Registry
─────────────────────────────────────────────────────────────────
Screen guard     : navigation to 'sec-permissions' requires
                    PERM_PERMISSION_VIEW

Permission-based UI behavior:
  canCreate = false → "New" not rendered
  canEdit   = false → Modal fields disabled, Save not rendered
  canDelete            → n/a, no delete action exists on this screen at
                       all regardless of permission (F1-SCREEN note) —
                       do not add a delete button gated on a permission
                       that has no backing endpoint
EXCEPTION module scope: n/a
─────────────────────────────────────────────────────────────────

### SEC-FE — SCR-SEC-005 — Page Registry
─────────────────────────────────────────────────────────────────
Screen guard     : navigation to 'sec-pages' requires PERM_PAGE_VIEW

Permission-based UI behavior:
  canCreate = false → "New" not rendered
  canEdit   = false → Drawer fields disabled, Save not rendered
  canDelete = false → "Deactivate" action not rendered (per SRS B2, the
                       DELETE permission specifically gates deactivate,
                       not a hard delete — this entity has no hard
                       delete endpoint at all, only deactivate/reactivate)
  "Reactivate" action → gated on canEdit (PERM_PAGE_UPDATE), per SRS B2
                       ("إعادة تفعيل | ... | PERM_PAGE_UPDATE")
EXCEPTION module scope: n/a
─────────────────────────────────────────────────────────────────

### SEC-FE — SCR-SEC-006 — User Profile
─────────────────────────────────────────────────────────────────
Screen guard     : the "User Profile →" button on SCR-SEC-002 requires
                    PERM_USER_PROFILE_VIEW to be shown at all; opening
                    the Drawer without this permission is not otherwise
                    reachable (no independent nav entry — F4)

Permission-based UI behavior:
  canCreate = false → n/a for a Drawer that always operates on an
                       existing user; "Save" acts as create-or-update
                       transparently (F2-FACADE-HOOK) — gate the whole
                       Save action on (profile == null ? canCreate :
                       canEdit), i.e. still respect both permissions
                       depending on which branch actually fires
  canEdit   = false → fields disabled, Save not rendered (when a profile
                       already exists)
  canDelete            → n/a, intentionally no delete action exists
                       (F1-MODEL note — do not add one)
EXCEPTION module scope: n/a
─────────────────────────────────────────────────────────────────

### SEC-FE — SCR-SEC-007 — Role Data Scope
─────────────────────────────────────────────────────────────────
Screen guard     : opened only from SCR-SEC-003 (which already requires
                    PERM_ROLE_VIEW) or SCR-SEC-002 (which requires
                    PERM_USER_VIEW to reach, though this Drawer's own
                    actions are gated on PERM_ROLE_* regardless of which
                    parent screen opened it — SRS B4 is explicit that
                    this screen reuses PERM_ROLE_* only, not a blend)

Permission-based UI behavior:
  canCreate = false → "New" (add branch assignment) not rendered —
                       gated on PERM_ROLE_UPDATE (not a separate CREATE
                       permission — SRS B4: "إنشاء | PERM_ROLE_UPDATE")
  canEdit   = false → fields disabled (dataAccessLevel Select,
                       isActiveFl Switch), Save not rendered — gated on
                       PERM_ROLE_UPDATE
  canDelete = false → "Delete" not rendered — gated on PERM_ROLE_UPDATE
                       (again, reused — SRS B4 shows PERM_ROLE_UPDATE
                       across Create/Edit/Delete for this screen, not
                       PERM_ROLE_DELETE)
EXCEPTION module scope: n/a
─────────────────────────────────────────────────────────────────
```

**SEC-FE Governance Rules:**
```
SEC-IMPL-RULE-2 — All show/hide decisions read `user.permissions`
                   loaded at login (F1-MODEL Session model) — not a
                   per-screen refetch; the array is loaded once per
                   session
SEC-IMPL-RULE-3 — HTTP 403 responses (should the backend later add the
                   enforcement noted as missing in FINDING-005) are
                   caught and shown as a localized toast, routed per the
                   shared F2 error-routing table — no separate handling
                   needed per screen
```

**Note on PERMISSIONS seed data:** the `PERM_USER_*`, `PERM_ROLE_*`,
`PERM_PERMISSION_*`, `PERM_PAGE_*`, `PERM_USER_PROFILE_*` names used
throughout this phase are declared once as backend seed data in
PROJECT-3-BACKEND-ENGINE.md's Phase SEC-BE (out of this engine's scope
per Section 10) — this plan only *references* them, sourced from
srs.md B4's Permissions Summary table (reproduced in FINDINGS/F1 above),
and never invents a new PERM_* name anywhere in this document.
---

