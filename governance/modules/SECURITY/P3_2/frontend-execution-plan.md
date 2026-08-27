# frontend-execution-plan.md — SECURITY — PLAN-ID: FE-SEC-001

```
Module            : Security & Access Control (SEC)
Pipeline stage    : Project 3.2 — PASS 2 (Frontend Execution Truth)
Source artifacts  : srs-SECURITY.md (v1.2, 2026-08-23)
                     Real API Docs: authentication.md, user-management.md,
                       role-access-control.md, permission-management.md,
                       page-management.md, menu-management.md,
                       security-datascope-role-branches.md,
                       security-datascope-user-profiles.md
                     flow-diagram.md / ui-ux-spec.md (v2.0, dashboard.zip/docs)
                     Real UI Shell: dashboard.zip/src (React 18 + TS 5.9 +
                       Zustand 5 + Vite, no React Router — see FINDING-002)
                     prd-SECURITY-2.md (reference only — superseded by real
                       API Docs wherever the two disagree, per RULE-15)
Status            : DRAFT — F1–F4 + SEC-FE + TEST-FE complete, ALIGN-FE run
GATE: BACKEND MODULE COMPLETE  : PASSED ✓ (31 real endpoints across 8 doc
                                  files, srs.md B1–B5 present)
GATE: UI SHELL COMPLETE        : PASSED ✓ (Shell implemented: Users.tsx,
                                  Roles.tsx, Permissions.tsx, Pages.tsx +
                                  UserProfileDrawer, DataScopeDrawer)
                                  ⚠ Human visual-fidelity sign-off not
                                  present in this session's uploads — not
                                  re-verified here, carried as an assumption
```

## Adaptation note (read first)

`srs-SECURITY.md` does not use the `ERR-[MOD]-[ID]` / `DBF-[ID]` identifier
schemes that the F3/F1 templates reference (Section A4 confirms: "هذا
القسم هو المصدر الوحيد لتعريف القواعد" — rules are identified by
`RULE-SEC-[N]` only, each carrying its own inline Message-AR/Message-EN
pair). This plan therefore binds F3 validators directly to `RULE-SEC-[N]`
+ its exact inline messages, in place of a separate Error Catalog lookup.
No DBF-IDs exist either; DB column names are taken from the entity tables
in SRS A3 (§ "الجدول"/"اسم الحقل الفعلي" columns) instead.

---

## FINDINGS LOG — real-artifact reconciliation (CONTRACT-12 / RULE-15)

These are discrepancies found between what `srs-SECURITY.md` / `prd-SECURITY-2.md`
assert about the live backend and what the **real, code-generated API docs**
actually show. Per RULE-15, the real API docs govern. Nothing below blocks
F1–F4 (all are resolvable in-plan); each is threaded into the relevant phase
below and is not re-explained there.

**FINDING-001 — Role activate/deactivate: real backend has ONE endpoint, not two**
`prd-SECURITY-2.md` (US-SEC-010) and `srs-SECURITY.md` (API-SEC-021/API-SEC-050,
both dated 2026-08-23) assert — each citing a direct `backend.zip` code read —
that `RoleController` exposes two separate methods, `activateRole()`
(`PUT /{roleId}/activate`) and `deactivateRole()` (`PUT /{roleId}/deactivate`).
The real, generated API doc (`role-access-control.md`) shows neither path.
It shows exactly one: `PUT /api/roles/{roleId}/toggle-active`
(operationId `toggleRoleActive`, body `{ active: boolean }`, permission
`ROLE_UPDATE`). No `/activate` or `/deactivate` path exists anywhere in the
real doc set.
→ **Resolution used in this plan:** F2-QUERY for role activation binds to
the real `toggle-active` endpoint. The Shell's existing two-button UX
(separate Activate / Deactivate actions — see `useSecurityStore.activateRole()`
/ `deactivateRole()`) is **kept as-is** (v2.1 "document, don't redesign") —
both buttons call the same real mutation with a different `active` boolean
payload. See F2-QUERY — API-SEC-021 below.

**FINDING-002 — Shell routing is not React Router**
The F4 template in PROJECT-3-FRONTEND-ENGINE.md assumes URL-based React
Router routes (`/users`, `/users/:id`, `<ProtectedRoute>`, `React.lazy()`
code-split chunks). The real, confirmed UI Shell (`App.tsx`) instead uses a
single Zustand store (`useNavigationStore`) holding a `currentScreen` string
key, with `App.tsx` doing a `switch` to decide which page component to
render inside `<AppShell>`. There are no URLs, no route guards, no lazy
chunks. Per v2.1 ("F4 DOCUMENTS the real Shell's existing structure... adds
missing integration wiring... never a silent redesign"), F4 below documents
this real navigation-key architecture instead of inventing route paths that
do not exist in the Shell.

**FINDING-003 — Composite Screen pattern implemented as single component + Dialog/Drawer, not routed Search/Entry pages**
F4-RULE-5 (CORE-9) calls for Search and Entry as separate routed
components. The real Shell instead implements each SCR-ID as ONE page
component (e.g. `UsersPage`) that renders the search grid AND an inline
`Dialog`/`Drawer` for create/edit, toggled by Zustand boolean state
(`isUserDialogOpen`, etc.) — confirmed in `Users.tsx`, `Roles.tsx`,
`Permissions.tsx`, `Pages.tsx`. This is consistent with FINDING-002 (no
router to put a second route on) and is documented as-is, not redesigned.

**FINDING-004 — No permission-gating wired in the Shell yet**
`useAuthStore.ts`'s `UserProfile` carries only a coarse
`role: 'admin' | 'finance' | 'hr'` field — no `permissions: string[]` array,
and no component in `pages/Security/*` reads or checks a `PERM_*` value
anywhere (confirmed by search). The real `POST /api/auth/login-token`
response (`UserInfo` shape) already returns a flattened `permissions:
array<string>` field that is sufficient to drive this. This is a real
Shell gap, not a design decision — flagged as an explicit F4/SEC-FE
integration addition (store the array on login, gate UI reads from it),
not a redesign of anything that already exists.

**FINDING-005 — User CRUD and Role copy-from show no permission annotation in the real API docs**
`srs-SECURITY.md` B4 tables state `PERM_USER_VIEW/CREATE/UPDATE/DELETE`
gate the User Management endpoints, and that `PERM_ROLE_UPDATE` gates
"copy permissions from another role." The real, code-scanned API docs
(`user-management.md`, `role-access-control.md`) show **no**
`Required permission(s)` line for `POST /api/users`, `PUT /api/users/{userId}`,
`DELETE /api/users/{userId}`, `GET /api/users`, `POST /api/users/search`,
or `POST /api/roles/{roleId}/copy-from/{sourceRoleId}` — only "Authentication
Required." Only `PUT /api/users/{userId}/roles` shows an explicit permission
(`USER_MANAGE_ROLES`). This means these operations, as currently deployed,
are enforced only by authentication, not by permission, at the API layer.
→ **Resolution used in this plan:** the frontend still gates these actions
in the UI per the SRS's intended `PERM_USER_*`/`PERM_ROLE_UPDATE` names
(correct, defense-in-depth UX — hiding a button a user shouldn't see is
still correct behavior even if the backend enforcement is currently
missing). This plan does **not** claim the backend enforces it. This is a
backend-scope gap (Project 3.1 territory) — noted here for the record, not
resolved by this engine (Section 10 boundary: this engine does not touch
backend phase content).

---

<!-- PHASE:F1:START -->
# PHASE F1 — Frontend Model Specifications (confirm + correct, v2.1)

GATE: BACKEND MODULE COMPLETE + GATE: UI SHELL COMPLETE both confirmed. Proceeding.

## F1-MODEL — ENTITY-SEC-001 — UserAccount

```
### F1-MODEL — ENTITY-SEC-001 — AppUser
─────────────────────────────────────────────────────────────────
Model name       : AppUser (maps to DTO: UserDto / UserInfo)
Source DTO       : user-management.md UserDto; authentication.md UserInfo
Shell status     : Already implemented in UI Shell (data/mockData.ts) —
                    2 corrections required (below)

Fields (confirmed against real UserDto):
  id             : number      — PK — system only, never displayed
                    ⚠ CORRECTION: Shell's AppUser.id is `string`
                    (e.g. "usr-1234567890"). Real UserDto.id is
                    integer(int64). Change to `number`.
  username       : string      — mandatory, 3–80 chars (UK_USERS_USERNAME)
                    — RULE-SEC-049
  email          : string      — optional, max 150 chars — not required by
                    UserDto/CreateUserRequest despite being a create field
                    on the Shell's dialog; real CreateUserRequest only
                    requires username+password (see F1-SCREEN below)
  enabled        : boolean     — maps to `enabled` column, default true
                    (false only immediately after self-signup — RULE-SEC-030)
  roles          : string[]    — ⚠ CORRECTION: Shell stores this as an
                    array of internal Role IDs (e.g. "role-2") selected
                    from the local roles list. Real UserDto.roles /
                    AssignRolesRequest.roleNames is an array of role
                    NAME strings (matches RoleDto.roleName, not an id).
                    The role multi-select must submit `roleNames: string[]`
                    (role display names), not internal IDs.
  permissions    : string[]    — NEW, not in current Shell AppUser type —
                    present on UserDto/UserInfo, flattened permission
                    names from all assigned roles' page grants. Not
                    needed on the User screen itself, but this is the
                    field FINDING-004 needs on the *session* user — see
                    F1-MODEL below for the session/auth model.
  password       : string      — write-only, never present on read DTOs;
                    Shell already handles this correctly (local component
                    state only, never stored in AppUser)
  createdAt/updatedAt/createdBy/updatedBy : NOT on UserDto's own shape in
                    user-management.md's CreateUserRequest/UpdateUserRequest,
                    but ARE present on UserDto's read shape (confirmed).
                    Keep as optional display-only fields (Shell doesn't
                    render them yet — no action needed, not a gap for a
                    Search/Entry screen).

Readonly fields  : id (never shown), createdAt/createdBy/updatedAt/updatedBy
⚠ Agent: this entity uses the actual code column names per SRS's
  PERMANENT EXCEPTION note (Security entities are exempt from the
  entityPk/isActiveFl naming convention) — `enabled`, not `isActiveFl`.
DEFERRED fields  : none

F1 Governance:
  ✓ No Business Code on this entity (documented deviation — `username`
    is the natural key, user-entered, not auto-generated — SRS A3 note)
  ✓ All LOV fields: n/a (roles is a plain string array, not a LOV)
  ✓ PK field: number after correction — never shown to user
  ✓ `enabled` boolean — EXCEPTION module naming (not isActiveFl) — see
    SRS A3 PERMANENT EXCEPTION note, this deviation is intentional
  ✗ orgUnitId: not present — compliant
─────────────────────────────────────────────────────────────────
```

## F1-MODEL — ENTITY-SEC-001b — Session/Auth model (UserInfo)

```
### F1-MODEL — Session model — UserInfo (login-token response)
─────────────────────────────────────────────────────────────────
Model name       : SessionUser (NEW — not currently in useAuthStore)
Source DTO       : authentication.md UserInfo (POST /api/auth/login-token)
Shell status      : Missing from Shell — flagged addition (FINDING-004).
                    useAuthStore's UserProfile has no permissions array.

Fields:
  userId         : number
  username       : string
  enabled        : boolean
  roles          : string[]   — role names
  permissions    : string[]   — flattened PERM_* codes from all roles —
                    THIS is what every SEC-FE canView/canCreate/canEdit/
                    canDelete check in this plan reads from
  accessToken / refreshToken / expiresIn / refreshExpiresIn : session
                    tokens — stored per this project's existing token
                    handling (Shell doesn't yet call a real API; when
                    wired, tokens are the responsibility of the shared
                    Axios/fetch layer, declared once in CORE phase, not
                    duplicated here)

Required Shell change (integration gap, not redesign):
  useAuthStore.UserProfile gains `permissions: string[]`, populated from
  `POST /api/auth/login-token`'s response on login. All PERM_* checks in
  SEC-FE phase read `useAuthStore((s) => s.user.permissions)`.
─────────────────────────────────────────────────────────────────
```

## F1-MODEL — ENTITY-SEC-002 — Role

```
### F1-MODEL — ENTITY-SEC-002 — AppRole
─────────────────────────────────────────────────────────────────
Model name       : AppRole (maps to DTO: RoleDto)
Source DTO       : role-access-control.md RoleDto
Shell status     : Already implemented — 2 corrections required

Fields (confirmed against real RoleDto):
  id             : number      — PK — ⚠ CORRECTION: Shell uses `string`
                    ("role-1730..."). Real RoleDto.id is integer(int64).
  roleCode       : string      — pattern `^[A-Z][A-Z0-9_]*$` — Business
                    Code-like field: user-entered at create (NOT
                    auto-generated — documented deviation from BC-RULE-2),
                    but immutable after creation (matches BC-RULE-4) —
                    readonly on EDIT, editable on CREATE only
  roleName       : string      — mandatory, unique (UK_ROLES_NAME)
  description    : string      — optional, max 500
  active         : boolean     — ⚠ SRS A3 PERMANENT EXCEPTION: actual
                    DB column is `IS_ACTIVE`, field name on the DTO is
                    `active` (not `isActive`/`isActiveFl`) — Shell's
                    `AppRole.isActive` should be renamed `active` to match
                    the wire field exactly (avoids a silent mapping bug)
  createdAt/createdBy/updatedAt/updatedBy : present on RoleDto — Shell
                    doesn't render them; no action needed

Readonly fields  : id, roleCode (EDIT mode only — editable on CREATE)
DEFERRED fields  : none

F1 Governance:
  ✓ roleCode: readonly on EDIT — see F1-SCREEN below for CREATE behavior
    (deviation from standard Business Code: user-entered, not system-
    generated — documented in SRS A3, kept as-is)
  ✓ PK: number after correction
  ✗ NO orgUnitId — compliant
─────────────────────────────────────────────────────────────────
```

## F1-MODEL — ENTITY-SEC-002b — Role↔Page permission assignment (RolePagesMatrixResponse)

```
### F1-MODEL — Role permission matrix — RolePageAssignment
─────────────────────────────────────────────────────────────────
Model name       : RolePageAssignment (replaces Shell's RolePermission)
Source DTO       : role-access-control.md PageAssignmentResponse /
                    PageAssignmentDto
Shell status     : Already implemented, shape mismatch — correction
                    required (not a rewrite, a field-shape fix)

Shell's current shape (mockData.ts RolePermission):
  { pageId: string; canView: boolean; canCreate: boolean;
    canUpdate: boolean; canDelete: boolean }

Real shape (PageAssignmentResponse):
  { pageCode: string; pageName: string; pageNameAr: string;
    permissions: string[] }   ← subset of ['CREATE','UPDATE','DELETE']
                                 VIEW is IMPLICIT — the real API never
                                 returns 'VIEW' in this array (RULE-SEC-042)
                                 and never accepts it in requests either

⚠ CORRECTION — two shape differences, both required:
  1. Key by `pageCode` (string, e.g. "USER"), not `pageId`. The Shell's
     mock `AppScreen.id` values ("SCR-SEC-...") don't correspond to any
     real field — the real join key is the Page's `pageCode`.
  2. Represent CRUD grants as `permissions: string[]` (a list containing
     only whichever of CREATE/UPDATE/DELETE are granted), not four
     independent booleans. VIEW is never stored/sent explicitly — the
     Facade Hook derives "has VIEW" from "row exists in assignments at
     all" (RULE-SEC-042: VIEW is auto-added the moment a page is
     assigned, and cannot be removed independently of the whole row).

Matrix checkbox UI on SCR-SEC-003 continues to show 4 columns (View /
Create / Update / Delete) — View's checkbox is always checked+disabled
when a page row exists (derived, not a real field), matching RULE-SEC-042.
─────────────────────────────────────────────────────────────────
```

## F1-MODEL — ENTITY-SEC-003 — Permission

```
### F1-MODEL — ENTITY-SEC-003 — AppPermission
─────────────────────────────────────────────────────────────────
Model name       : AppPermission (maps to DTO: PermissionDto)
Source DTO       : permission-management.md PermissionDto
Shell status     : Already implemented — 2 corrections required

Fields:
  id             : number      — PK — ⚠ CORRECTION: Shell uses `string`
  name           : string      — mandatory, unique, pattern
                    `PERM_<PAGE_CODE>_<TYPE>` (UK_PERMS_NAME)
  permissionType : string | null — LOV-SEC-002... wait, LOV-SEC-001 (see
                    below) — ⚠ CORRECTION: Shell's union type includes a
                    `'SYSTEM'` member that does not exist as a real value.
                    LOV-SEC-001 has exactly 4 codes: VIEW / CREATE /
                    UPDATE / DELETE. A "system, not page-scoped"
                    permission is represented by `pageId: null`, NOT by
                    a `permissionType: 'SYSTEM'` sentinel. Remove
                    'SYSTEM' from the type union; treat "system
                    permission" as a derived UI label (`pageId == null`),
                    not a stored enum value.
  pageId         : number | null — FK to Page — ⚠ CORRECTION: Shell names
                    this field the same (`pageId`) which is correct here
                    (unlike RolePageAssignment above, PermissionDto really
                    does use `pageId`/`pageCode` — confirmed both appear:
                    `pageId` in the request/creation shape, `pageCode` in
                    the read `PermissionDto` shown in permission-
                    management.md). Use `pageCode: string | null` on the
                    read model (matches the documented response shape)
                    and `pageId: number | null` only on the create/update
                    request shape.
  module         : NOT a field on the real PermissionDto — ⚠ CORRECTION:
                    Shell's AppPermission carries a `module: string`
                    field with no real backing column. `module` is
                    filterable via API-SEC-028's search (an indirect
                    filter through the related Page, per SRS B2 note:
                    "فلتر غير مباشر"), but it is not a real field to
                    store/display on the entity itself. Remove `module`
                    from AppPermission; treat the Permission Registry's
                    "module" search filter as a search-only pass-through
                    filter field (see F1-SCREEN below), not an entity
                    field.

F1 Governance:
  ✓ LOV field permissionType: string (not TS enum with invented values)
  ✓ PK: number after correction
─────────────────────────────────────────────────────────────────
```

## F1-MODEL — ENTITY-SEC-004 — Page

```
### F1-MODEL — ENTITY-SEC-004 — AppScreen
─────────────────────────────────────────────────────────────────
Model name       : AppScreen (maps to DTO: PageResponse)
Source DTO       : page-management.md PageResponse
Shell status     : Already implemented — 3 corrections required

Fields:
  id             : number      — PK — ⚠ CORRECTION: Shell uses `string`
                    (e.g. "SCR-SEC-173...") for the id AND reuses that
                    same synthetic id as the join key elsewhere (see
                    ENTITY-SEC-002b above) — both must change: `id`
                    becomes `number` (real PK), and any code that joined
                    on `AppScreen.id` must instead join on `pageCode`.
  pageCode       : string      — pattern `^[A-Z0-9_]+$`, 2–50 chars,
                    unique (UK_PAGES_CODE), auto-uppercased on save —
                    RULE-SEC-046
  nameAr/nameEn  : string      — both mandatory, max 100
  route          : string      — pattern `^/[a-zA-Z0-9/_-]+$`, unique
                    (UK_PAGES_ROUTE) — RULE-SEC-046. Note: this "route"
                    is Page-registry metadata only — it does NOT
                    correspond to an actual React Router path in this
                    Shell (FINDING-002); it's stored/displayed as a plain
                    text field with pattern validation, not wired to
                    real navigation.
  icon           : string | null — optional, max 50
  module         : string | null — optional, max 50 — free-text
                    classification (e.g. "SECURITY"), NOT an FK to any
                    other module's table (confirmed in SRS A3) — ⚠
                    CORRECTION: Shell's `AppScreen.module` is typed as a
                    closed union (`'SEC'|'ORG'|'FILE'|...`) using short
                    codes. Real values are free text and use full words
                    per the real doc's example (`"SECURITY"`, not
                    `"SEC"`). Widen the type to `string` and use the
                    real long-form values.
  parentId       : number | null — self-referencing FK — MUST NOT equal
                    own id (RULE-SEC-046)
  displayOrder   : number | null
  active         : boolean     — default true — ⚠ same naming note as
                    Role: field is `active`, not `isActiveFl` (EXCEPTION
                    entity)
  description    : string | null — max 500
  permissionKeys : object      — NEW, not in Shell's AppScreen — read-only,
                    auto-generated VIEW/CREATE/UPDATE/DELETE keys returned
                    by the API on read; informational display only, not
                    a form field

Readonly fields  : id, pageCode (readonly on EDIT — "pageCode cannot be
                    changed" per page-management.md's updatePage doc)
─────────────────────────────────────────────────────────────────
```

## F1-MODEL — ENTITY-SEC-009 — SecUserProfile

```
### F1-MODEL — ENTITY-SEC-009 — UserProfile (Drawer model)
─────────────────────────────────────────────────────────────────
Model name       : UserProfile (maps to DTO: SecUserProfileDto)
Source DTO       : security-datascope-user-profiles.md SecUserProfileDto
Shell status     : Already implemented (as AppUser.profile sub-object) —
                    2 corrections required

Fields:
  userIdFk       : number      — PK, shared with Users (not independently
                    generated) — Shell nests this implicitly as the
                    parent AppUser.id; no separate field needed as long
                    as the Drawer is always opened from a specific user
  branchIdFk     : number      — mandatory — external FK (ENTITY-ORG-002,
                    Organization module) — validated cross-module,
                    active-only — RULE-SEC-034 — ⚠ CORRECTION: Shell's
                    `UserProfile.branchId` is `string` ("br-1"); real
                    field is `number`.
  fullNameAr     : string | null — max 200
  fullNameEn     : string | null — max 100
  preferredLang  : string | null — max 10 — FREE TEXT, permanently (SRS
                    OQ-001 CLOSED — will never become a LOV/dropdown) —
                    ⚠ CORRECTION: Shell types this as a closed union
                    `'ar' | 'en'`, implying a 2-option dropdown. Per the
                    architect's final, closed decision this must be a
                    free-text `<Input>`, not a `<Select>`. Widen to
                    `string`.
  employeeIdFk   : number | null — UNCONSTRAINED, permanently (SRS
                    OQ-002 CLOSED — no HR module exists yet, will not
                    get an FK until one does) — plain number input, no
                    lookup/select
  isActiveFl     : boolean     — standard naming (this ONE field on this
                    ONE entity is NOT an EXCEPTION — SRS A3 explicitly
                    calls this out: matches the general convention)

No Delete on this entity — deactivation is via isActiveFl/UPDATE only
(documented, intentional exception — RULE-SEC-047 footnote). No delete
action anywhere in this Drawer's spec.
─────────────────────────────────────────────────────────────────
```

## F1-MODEL — ENTITY-SEC-010 — SecRoleBranch

```
### F1-MODEL — ENTITY-SEC-010 — DataScope
─────────────────────────────────────────────────────────────────
Model name       : DataScope (maps to DTO: SecRoleBranchDto)
Source DTO       : security-datascope-role-branches.md SecRoleBranchDto
Shell status     : Already implemented — 3 corrections required
                    (composite key, field names, LOV codes)

Fields:
  roleIdFk       : number      — PK part 1 (composite) — ⚠ CORRECTION:
                    Shell's `DataScope.roleId: string`. Real field name
                    is `roleIdFk`, type `number`.
  branchIdFk     : number      — PK part 2 (composite), external FK
                    (ENTITY-ORG-002) — ⚠ CORRECTION: Shell's
                    `DataScope.branchId: string` → `branchIdFk: number`
  dataAccessLevel: string      — LOV-SEC-002, exactly 3 codes —
                    ⚠ CORRECTION (values, not just field name): Shell's
                    union is `'BRANCH' | 'CHILDREN' | 'ALL'`. Real codes
                    are `BRANCH_ONLY` / `BRANCH_AND_CHILDREN` / `ALL`.
                    `'ALL'` happens to already match; the other two do
                    not — this WILL silently fail validation against the
                    live LOV endpoint if not corrected. RULE-SEC-035.
  isActiveFl     : boolean     — standard naming, correct as-is in Shell

⚠ CORRECTION (structural) — there is NO single synthetic `id` field on
the real entity. Shell's `DataScope.id: string` ("ds-173...") does not
exist on SecRoleBranchDto — the composite key (roleIdFk, branchIdFk) IS
the identity. React list rendering `key` props should use a derived
composite key (`` `${roleIdFk}-${branchIdFk}` ``) instead of a stored id
field; API calls (GET/PUT/DELETE) address a row by both path params,
never by a single id.

DEFERRED: none. No DEFERRED XM-IDs block any field here — XM-SEC-001/002
(the Branch cross-module FK) are APPROVED WITH DOCUMENTED EXCEPTION per
SRS A7/OQ-007, not blocking.
─────────────────────────────────────────────────────────────────
```

---

## F1-SCREEN blocks — one per SCR-ID

```
### F1-SCREEN — SCR-SEC-001 — Authentication & Self-Service
─────────────────────────────────────────────────────────────────
Screen type      : SPECIAL (public, unauthenticated — no Search/Entry
                    split applies; 5 linked forms)
Entity           : ENTITY-SEC-001, ENTITY-SEC-011, ENTITY-SEC-012

Sub-forms (each its own Zod schema + submit handler, per SRS B3):
  LoginForm            : { username: string; password: string }
  SignupForm           : { username: string; email: string;
                            password: string }
  ActivateForm         : { token: string }   — token read from URL query
                            param /route param in most SPAs; since this
                            Shell has no router (FINDING-002), token is
                            read from `window.location.search` directly,
                            or the activation link opens the app with
                            the token embedded and passed as an initial
                            prop — declared once in CORE, not re-decided
                            per form
  ForgotPasswordForm   : { email: string }
  ResetPasswordForm    : { token: string; newPassword: string }

Excluded from every form: no PK, no audit fields — all fields above are
already the complete input set (confirmed against AuthRequest /
SignupRequest / ActivateAccountRequest / ForgotPasswordRequest /
ResetPasswordRequest in authentication.md — no extra fields to add or
remove).
─────────────────────────────────────────────────────────────────
```

```
### F1-SCREEN — SCR-SEC-002 — User Management
─────────────────────────────────────────────────────────────────
Screen type      : SEARCH + ENTRY (single component + Dialog — FINDING-003)
Entity           : ENTITY-SEC-001

Search Filter Model — UserSearchFilter:
  Filter fields  :
    username     : string  OPTIONAL  Filter type: LIKE
    enabled      : boolean OPTIONAL  Filter type: EXACT
  Pagination     : page (number), size (number)
  Sort           : allowed fields id, username, enabled, createdAt,
                    updatedAt only (user-management.md `all` endpoint doc)

Result columns   : username, email, enabled (Badge), roles (count Badge)

Form Model — UserFormModel:
  Form fields    :
    username     : string  REQUIRED (create) — 3–80 chars
    password     : string  REQUIRED on CREATE only, hidden entirely on
                    EDIT (never re-sent unless the admin explicitly wants
                    to change it — real UpdateUserRequest allows an
                    OPTIONAL password field for exactly this case: show
                    a "change password" toggle on Edit that reveals the
                    field only when checked)
    email        : string  OPTIONAL — ⚠ NOTE: `email` does not appear on
                    CreateUserRequest/UpdateUserRequest at all in the
                    real API doc (only `username`, `password`, `enabled`,
                    `roleNames` on Update; only `username`+`password` on
                    Create). The Shell's dialog currently collects an
                    email field with no real endpoint to persist it to.
                    → Flagged as a plan gap, not silently dropped: either
                    (a) email capture is removed from this dialog, or
                    (b) email belongs on signup only (API-SEC-005, which
                    does accept email) and the admin-create path
                    (API-SEC-009) genuinely has no email field. Raise as
                    OQ-FE-SEC-001 for product decision — this plan does
                    not invent a resolution.
    enabled      : boolean OPTIONAL — Switch, defaults true
    roleNames    : string[] OPTIONAL — multi-select of role NAMES (not
                    IDs — see F1-MODEL correction above), full replace
                    on save
  Excluded       : id (system-managed)
  Read-only on EDIT: none (username IS editable per real
                    UpdateUserRequest — unlike Role's roleCode, User has
                    no immutable natural key field)
─────────────────────────────────────────────────────────────────
```

```
### F1-SCREEN — SCR-SEC-003 — Role & RBAC Management
─────────────────────────────────────────────────────────────────
Screen type      : SEARCH + ENTRY (single component + Dialog containing
                    an embedded permission matrix sub-panel — FINDING-003)
Entity           : ENTITY-SEC-002 (+ ENTITY-SEC-002b matrix)

Search Filter Model — RoleSearchFilter:
  Filter fields  :
    roleName     : string  OPTIONAL  Filter type: LIKE (only allowed
                    filter field per role-access-control.md search doc)
  Pagination/Sort: page, size; sort fields id, roleName only

Result columns   : roleCode (Badge), roleName, active (Badge)

Form Model — RoleFormModel:
  Form fields    :
    roleCode     : string  REQUIRED on CREATE, pattern `^[A-Z][A-Z0-9_]*$`
                    — becomes READ-ONLY the moment the record exists
                    (EDIT mode: display only, never resubmitted — real
                    UpdateRoleRequest has no roleCode field at all)
    roleName     : string  REQUIRED
    description  : string  OPTIONAL
    active       : boolean OPTIONAL — Switch — NOTE: `active` is
                    accepted on UpdateRoleRequest too, but per
                    FINDING-001 the Shell's dedicated Activate/Deactivate
                    buttons are the actual UX for changing this — the
                    Switch inside the main form, if kept, must trigger
                    the SAME toggle-active mutation on save, not a
                    silent field on the general PUT
  Excluded       : id (system-managed)

Sub-panel — Permission Matrix (embedded in same Dialog, per SRS B3):
  Rows           : one per active Page (pageCode, nameEn/nameAr)
  Columns        : View (derived/disabled, see F1-MODEL ENTITY-SEC-002b),
                    Create, Update, Delete (real checkboxes)
  Row actions    : [+ Add Page] (API-SEC-023), row checkbox changes call
                    sync (API-SEC-024) or individual add/remove
                    (API-SEC-023/API-SEC-025) — see F2 for exact binding
  Panel actions  : [Sync All] (bulk full-replace, API-SEC-024),
                    [Copy From Role] (API-SEC-026, opens a role picker)
─────────────────────────────────────────────────────────────────
```

```
### F1-SCREEN — SCR-SEC-004 — Permission Registry
─────────────────────────────────────────────────────────────────
Screen type      : SEARCH + ENTRY (Modal — small entity, ≤8 fields)
Entity           : ENTITY-SEC-003

Search Filter Model — PermissionSearchFilter:
  Filter fields  :
    name         : string  OPTIONAL  Filter type: LIKE
    module       : string  OPTIONAL  Filter type: LIKE (indirect,
                    pass-through — see F1-MODEL correction: not stored
                    on the entity itself)
  Pagination/Sort: page, size; sort fields id, name, module, createdAt,
                    updatedAt

Result columns   : name, permissionType (Badge), pageCode

Form Model — PermissionFormModel:
  Form fields    :
    name         : string  REQUIRED — hint text: "PERM_<CODE>_<TYPE>"
                    pattern, not a hard Zod regex (SRS documents this as
                    a naming convention, not a DB constraint beyond
                    uniqueness)
    permissionType: string OPTIONAL — Select, LOV-SEC-001 (hardcoded 4
                    values — see F2-LOV-QUERY, this one is NOT a runtime
                    lookup call)
    page (pageId): number OPTIONAL — Select of active Pages; empty =
                    system permission
  Excluded       : id
  No Delete button — SRS B3 confirms no delete endpoint exists for this
                    entity despite a `PERM_PERMISSION_DELETE` constant
                    existing in code (NOT VERIFIABLE / not wired) — do
                    not add a delete action.
─────────────────────────────────────────────────────────────────
```

```
### F1-SCREEN — SCR-SEC-005 — Page Registry
─────────────────────────────────────────────────────────────────
Screen type      : SEARCH + ENTRY (flat list — NOT a tree; SRS OQ-013
                    finalized this as PATTERN-1/flat after finding no
                    tree component exists anywhere in the real frontend)
Entity           : ENTITY-SEC-004

Search Filter Model — PageSearchFilter:
  Filter fields  :
    pageCode     : string  OPTIONAL  Filter type: LIKE
    module       : string  OPTIONAL  Filter type: LIKE
    active       : boolean OPTIONAL  Filter type: EXACT
  Pagination/Sort: page, size; sort fields id, pageCode, nameAr, nameEn,
                    module, displayOrder, createdAt, updatedAt

Result columns   : pageCode (Badge), nameEn, module (Badge), route
                    (mono), active (Badge)

Form Model — PageFormModel (Drawer — larger form, per ui-ux-spec intent):
  Form fields    :
    pageCode     : string  REQUIRED on CREATE, pattern `^[A-Z0-9_]+$`,
                    2–50 chars, auto-uppercased — READ-ONLY on EDIT
                    ("pageCode cannot be changed" — page-management.md)
    nameAr/nameEn: string  REQUIRED, max 100 each
    route        : string  REQUIRED, pattern `^/[a-zA-Z0-9/_-]+$`,
                    max 200
    icon         : string  OPTIONAL, max 50
    module       : string  OPTIONAL, max 50 — free text (see F1-MODEL)
    parentId     : number  OPTIONAL — Select, self-referencing, must not
                    equal the record's own id
    displayOrder : number  OPTIONAL
    description  : string  OPTIONAL, max 500
  Excluded       : id, pageCode (on EDIT), active, permissionKeys
                    (system-managed — active toggled via dedicated
                    deactivate/reactivate actions, not this form)
  UI note (from ui-ux-spec / EXECUTION-PROMPT.md): show a note near the
    save button on CREATE — "Saving will auto-create VIEW/CREATE/UPDATE/
    DELETE permissions" (RULE-SEC-047)
─────────────────────────────────────────────────────────────────
```

```
### F1-SCREEN — SCR-SEC-006 — User Profile
─────────────────────────────────────────────────────────────────
Screen type      : ENTRY only (Drawer, opened from SCR-SEC-002 — no
                    independent Search view; this is a 1:1 extension of
                    an already-selected User)
Entity           : ENTITY-SEC-009

Form Model — UserProfileFormModel:
  Form fields    :
    branchIdFk   : number  REQUIRED — Select, cross-module (Organization
                    branches), active only — RULE-SEC-034
    fullNameAr   : string  OPTIONAL, max 200
    fullNameEn   : string  OPTIONAL, max 100
    preferredLang: string  OPTIONAL — free-text Input, NOT a Select
                    (permanent decision — see F1-MODEL correction)
    employeeIdFk : number  OPTIONAL — plain number Input, no lookup
    isActiveFl   : boolean OPTIONAL — Switch
  Excluded       : userIdFk (implicit — this Drawer is always opened for
                    a specific, already-known user)
  No Delete button anywhere on this screen (documented, intentional —
    see F1-MODEL ENTITY-SEC-009 note)
─────────────────────────────────────────────────────────────────
```

```
### F1-SCREEN — SCR-SEC-007 — Role Data Scope (Branch Assignment)
─────────────────────────────────────────────────────────────────
Screen type      : SEARCH + ENTRY (Modal — small entity, opened as a
                    sub-panel from SCR-SEC-003, per SRS B1 "روابط من")
Entity           : ENTITY-SEC-010

Search Filter Model — DataScopeSearchFilter:
  Filter fields  :
    roleIdFk     : number  OPTIONAL  Filter type: EXACT
    branchIdFk   : number  OPTIONAL  Filter type: EXACT (cross-module)
    dataAccessLevel: string OPTIONAL Filter type: EXACT (LOV-SEC-002)
    isActiveFl   : boolean OPTIONAL  Filter type: EXACT
  Pagination/Sort: page, size; sort fields roleIdFk, branchIdFk,
                    dataAccessLevel, isActiveFl, createdAt

Result columns   : roleIdFk (resolved to role name), branchIdFk (resolved
                    to branch name), dataAccessLevel (Badge), isActiveFl
                    (Badge)

Form Model — DataScopeFormModel:
  Form fields    :
    roleIdFk     : number  REQUIRED — Select — part of composite key,
                    LOCKED (read-only) on EDIT (composite PK, cannot be
                    repointed after creation — matches RULE-SEC-036's
                    duplicate-prevention intent)
    branchIdFk   : number  REQUIRED — Select, cross-module, active-only
                    — LOCKED on EDIT, same reason
    dataAccessLevel: string REQUIRED — Select, LOV-SEC-002 (3 codes,
                    exact values — see F1-MODEL correction)
    isActiveFl   : boolean REQUIRED — Switch
  Excluded       : none beyond the composite key lock above
  Delete button present (PERM_ROLE_UPDATE reused — no independent
    permission), per SRS B4 note.
─────────────────────────────────────────────────────────────────
```
---

<!-- PHASE:F1:END -->
<!-- PHASE:F2:START -->
# PHASE F2 — Frontend Data & Facade Hook Specifications

**Shared error routing (declared once, referenced by every hook below):**
```
HTTP 400 (field validation)  → inline under the triggering field (setError)
HTTP 401                     → redirect to login (session expired)
HTTP 403                     → redirect to unauthorized
HTTP 404                     → user toast, "record not found" — Search
                                 screen refetches to drop the stale row
HTTP 409                     → business-rule conflict → user toast, via
                                 shared error mapper (e.g. ROLE_IN_USE,
                                 USER_HAS_ACTIVE_REFRESH_TOKENS,
                                 PERMISSION_ALREADY_EXISTS)
HTTP 429                     → rate-limit (RULE-SEC-050, auth endpoints
                                 only) → inline banner on the form:
                                 Message-AR/EN "تجاوزت الحد المسموح من
                                 المحاولات — حاول لاحقاً" / "Too many
                                 attempts — please try again later"
HTTP 500                     → generic message only, no technical detail

Pre-deactivation/delete usage checks (declared per operation below where
they apply — RULE-SEC-048 role delete, RULE-SEC-049 user delete):
  If blocked (409 ROLE_IN_USE / USER_HAS_ACTIVE_REFRESH_TOKENS) → reason
    shown to user, no confirmation dialog opened
  If allowed → confirmation dialog → proceed
```

## F2-QUERY — SCR-SEC-001 (Authentication & Self-Service)

```
<!-- API:API-SEC-001:START -->
### F2-QUERY — API-SEC-001 — Login
─────────────────────────────────────────────────────────────────
HTTP method      : POST        Endpoint : /api/auth/login
Request shape    : AuthRequest { username, password }
Response shape   : AuthResponse { accessToken, expiresIn, refreshToken,
                    refreshExpiresIn }
Hook type        : useMutation
Errors this call can produce:
  HTTP 401 → INVALID_CREDENTIALS → inline form error (not a toast — this
    is a login form, error belongs on the form itself)
  HTTP 429 → rate limit, RULE-SEC-050 → inline banner (see shared table)
─────────────────────────────────────────────────────────────────

<!-- API:API-SEC-001:END -->
<!-- API:API-SEC-002:START -->
### F2-QUERY — API-SEC-002 — Login (with full user info)
─────────────────────────────────────────────────────────────────
HTTP method      : POST        Endpoint : /api/auth/login-token
Request shape    : AuthRequest { username, password }
Response shape   : UserInfo { accessToken, expiresIn, refreshToken,
                    refreshExpiresIn, userId, username, enabled, roles[],
                    permissions[] }
Hook type        : useMutation
Used by          : LoginForm — THIS is the call the Shell should wire
                    (not API-SEC-001), because `permissions[]` is what
                    FINDING-004 needs stored in useAuthStore on success.
Errors           : same as API-SEC-001
─────────────────────────────────────────────────────────────────

<!-- API:API-SEC-002:END -->
<!-- API:API-SEC-005:START -->
### F2-QUERY — API-SEC-005/006/007/008 — Signup / Activate / Forgot / Reset
─────────────────────────────────────────────────────────────────
API-SEC-005  POST /api/auth/signup            { username, email, password }
             → { userId, username, enabled=false }
             Errors: 409 SIGNUP_USERNAME_ALREADY_EXISTS /
                     SIGNUP_EMAIL_ALREADY_EXISTS → inline field errors
                     (RULE-SEC-040/041) → toast for the generic case,
                     inline setError when the field is identifiable
API-SEC-006  POST /api/auth/signup/activate    { token } → 200 OK
             Errors: 400/409 invalid-or-used token → inline banner,
                     Message-AR/EN from RULE-SEC-032/033
API-SEC-007  POST /api/auth/forgot-password    { email } → 200 OK ALWAYS
             (RULE-SEC-038 anti-enumeration — never branch UI on
             success/failure content, always show the same generic
             confirmation regardless of response)
API-SEC-008  POST /api/auth/reset-password     { token, newPassword }
             → 200 OK
             Errors: same token-invalid class as API-SEC-006
All 4        : Hook type useMutation, no LOV/query-key concerns (public,
               unauthenticated forms)
─────────────────────────────────────────────────────────────────

<!-- API:API-SEC-005:END -->
<!-- API:API-SEC-006:START -->
### F2-QUERY — API-SEC-005/006/007/008 — Signup / Activate / Forgot / Reset
─────────────────────────────────────────────────────────────────
API-SEC-005  POST /api/auth/signup            { username, email, password }
             → { userId, username, enabled=false }
             Errors: 409 SIGNUP_USERNAME_ALREADY_EXISTS /
                     SIGNUP_EMAIL_ALREADY_EXISTS → inline field errors
                     (RULE-SEC-040/041) → toast for the generic case,
                     inline setError when the field is identifiable
API-SEC-006  POST /api/auth/signup/activate    { token } → 200 OK
             Errors: 400/409 invalid-or-used token → inline banner,
                     Message-AR/EN from RULE-SEC-032/033
API-SEC-007  POST /api/auth/forgot-password    { email } → 200 OK ALWAYS
             (RULE-SEC-038 anti-enumeration — never branch UI on
             success/failure content, always show the same generic
             confirmation regardless of response)
API-SEC-008  POST /api/auth/reset-password     { token, newPassword }
             → 200 OK
             Errors: same token-invalid class as API-SEC-006
All 4        : Hook type useMutation, no LOV/query-key concerns (public,
               unauthenticated forms)
─────────────────────────────────────────────────────────────────

<!-- API:API-SEC-006:END -->
<!-- API:API-SEC-007:START -->
### F2-QUERY — API-SEC-005/006/007/008 — Signup / Activate / Forgot / Reset
─────────────────────────────────────────────────────────────────
API-SEC-005  POST /api/auth/signup            { username, email, password }
             → { userId, username, enabled=false }
             Errors: 409 SIGNUP_USERNAME_ALREADY_EXISTS /
                     SIGNUP_EMAIL_ALREADY_EXISTS → inline field errors
                     (RULE-SEC-040/041) → toast for the generic case,
                     inline setError when the field is identifiable
API-SEC-006  POST /api/auth/signup/activate    { token } → 200 OK
             Errors: 400/409 invalid-or-used token → inline banner,
                     Message-AR/EN from RULE-SEC-032/033
API-SEC-007  POST /api/auth/forgot-password    { email } → 200 OK ALWAYS
             (RULE-SEC-038 anti-enumeration — never branch UI on
             success/failure content, always show the same generic
             confirmation regardless of response)
API-SEC-008  POST /api/auth/reset-password     { token, newPassword }
             → 200 OK
             Errors: same token-invalid class as API-SEC-006
All 4        : Hook type useMutation, no LOV/query-key concerns (public,
               unauthenticated forms)
─────────────────────────────────────────────────────────────────

<!-- API:API-SEC-007:END -->
<!-- API:API-SEC-008:START -->
### F2-QUERY — API-SEC-005/006/007/008 — Signup / Activate / Forgot / Reset
─────────────────────────────────────────────────────────────────
API-SEC-005  POST /api/auth/signup            { username, email, password }
             → { userId, username, enabled=false }
             Errors: 409 SIGNUP_USERNAME_ALREADY_EXISTS /
                     SIGNUP_EMAIL_ALREADY_EXISTS → inline field errors
                     (RULE-SEC-040/041) → toast for the generic case,
                     inline setError when the field is identifiable
API-SEC-006  POST /api/auth/signup/activate    { token } → 200 OK
             Errors: 400/409 invalid-or-used token → inline banner,
                     Message-AR/EN from RULE-SEC-032/033
API-SEC-007  POST /api/auth/forgot-password    { email } → 200 OK ALWAYS
             (RULE-SEC-038 anti-enumeration — never branch UI on
             success/failure content, always show the same generic
             confirmation regardless of response)
API-SEC-008  POST /api/auth/reset-password     { token, newPassword }
             → 200 OK
             Errors: same token-invalid class as API-SEC-006
All 4        : Hook type useMutation, no LOV/query-key concerns (public,
               unauthenticated forms)
─────────────────────────────────────────────────────────────────

<!-- API:API-SEC-008:END -->
<!-- API:API-SEC-003:START -->
### F2-QUERY — API-SEC-003/004 — Refresh / Logout
─────────────────────────────────────────────────────────────────
API-SEC-003  POST /api/auth/refresh  (refresh cookie) → AuthResponse
             Hook type: useMutation, called by the shared Axios/fetch
             401-interceptor (CORE phase), not directly by any screen
API-SEC-004  POST /api/auth/logout   → 204
             Hook type: useMutation, called by useAuthStore.logout()
─────────────────────────────────────────────────────────────────
```

<!-- API:API-SEC-003:END -->
<!-- API:API-SEC-004:START -->
### F2-QUERY — API-SEC-003/004 — Refresh / Logout
─────────────────────────────────────────────────────────────────
API-SEC-003  POST /api/auth/refresh  (refresh cookie) → AuthResponse
             Hook type: useMutation, called by the shared Axios/fetch
             401-interceptor (CORE phase), not directly by any screen
API-SEC-004  POST /api/auth/logout   → 204
             Hook type: useMutation, called by useAuthStore.logout()
─────────────────────────────────────────────────────────────────
```

<!-- API:API-SEC-004:END -->
## F2-QUERY — SCR-SEC-002 (User Management)

```
<!-- API:API-SEC-009:START -->
### F2-QUERY — API-SEC-009 — Create user
─────────────────────────────────────────────────────────────────
HTTP method      : POST   Endpoint : /api/users
Request shape    : CreateUserRequest { username, password }
                    ⚠ per F1-SCREEN OQ-FE-SEC-001: no `email` field
                    exists on this request — do not submit one
Response shape   : UserDto
Hook type        : useMutation
Errors           : 409 username exists → inline field error
                    (RULE-SEC-049)
On success       : invalidate ['users', filters] query key

<!-- API:API-SEC-009:END -->
<!-- API:API-SEC-010:START -->
### F2-QUERY — API-SEC-010/011 — Search / List users
─────────────────────────────────────────────────────────────────
API-SEC-010  POST /api/users/search  UserSearchContractRequest
             { filters[{field: username|LIKE / enabled|EQ}], page, size,
               sorts }
             → Page<UserDto>
API-SEC-011  GET  /api/users?page&size&sort  → Page<UserDto>
Hook type    : useQuery (both)
Query key    : ['users', { username, enabled, page, size, sortBy,
                sortDir }] — page/size live INSIDE this object (F2 rule),
                never separate useState
Which to use : API-SEC-010 (search) is the one bound to the Search
                screen's filter bar (it supports the username/enabled
                filters the screen actually has); API-SEC-011 (plain
                list) is not used by this screen — no filters to lose by
                preferring search.

<!-- API:API-SEC-010:END -->
<!-- API:API-SEC-011:START -->
### F2-QUERY — API-SEC-010/011 — Search / List users
─────────────────────────────────────────────────────────────────
API-SEC-010  POST /api/users/search  UserSearchContractRequest
             { filters[{field: username|LIKE / enabled|EQ}], page, size,
               sorts }
             → Page<UserDto>
API-SEC-011  GET  /api/users?page&size&sort  → Page<UserDto>
Hook type    : useQuery (both)
Query key    : ['users', { username, enabled, page, size, sortBy,
                sortDir }] — page/size live INSIDE this object (F2 rule),
                never separate useState
Which to use : API-SEC-010 (search) is the one bound to the Search
                screen's filter bar (it supports the username/enabled
                filters the screen actually has); API-SEC-011 (plain
                list) is not used by this screen — no filters to lose by
                preferring search.

<!-- API:API-SEC-011:END -->
<!-- API:API-SEC-012:START -->
### F2-QUERY — API-SEC-012 — Update user
─────────────────────────────────────────────────────────────────
HTTP method      : PUT   Endpoint : /api/users/{userId}
Request shape    : UpdateUserRequest { username?, password?, enabled?,
                    roleNames? } — ALL optional, partial update
Response shape   : UserDto
Hook type        : useMutation
Errors           : 409 username exists (if changed) → inline field error
On success       : invalidate ['users', *] and, if roleNames changed,
                    invalidate ['users', userId, 'roles']

<!-- API:API-SEC-012:END -->
<!-- API:API-SEC-013:START -->
### F2-QUERY — API-SEC-013 — Delete user
─────────────────────────────────────────────────────────────────
HTTP method      : DELETE   Endpoint : /api/users/{userId}
Response shape   : 204
Hook type        : useMutation
Pre-deactivation/delete check: RULE-SEC-049 — backend rejects with 409
  USER_HAS_ACTIVE_REFRESH_TOKENS if the user has active sessions. Per
  the shared contract: attempt the delete, and on 409 show the reason
  (no separate pre-check call exists in the real API — there is no
  "can I delete this user" endpoint — so the check IS the delete
  attempt itself; do not open a confirmation dialog promising success,
  phrase the confirmation as "Delete this user?" and handle 409
  gracefully as a distinct toast, not a generic error)
On success       : invalidate ['users', *]

<!-- API:API-SEC-013:END -->
<!-- API:API-SEC-014:START -->
### F2-QUERY — API-SEC-014/015 — Assign roles / Get user roles
─────────────────────────────────────────────────────────────────
API-SEC-014  PUT /api/users/{userId}/roles  { roleNames: string[] }
             → UserDto   Hook type: useMutation (full replace)
API-SEC-015  GET /api/users/{userId}/roles  → string[]  (role names)
             Hook type: useQuery, query key ['users', userId, 'roles'],
             enabled: !!userId — used to pre-populate the multi-select
             on Edit
```

<!-- API:API-SEC-014:END -->
<!-- API:API-SEC-015:START -->
### F2-QUERY — API-SEC-014/015 — Assign roles / Get user roles
─────────────────────────────────────────────────────────────────
API-SEC-014  PUT /api/users/{userId}/roles  { roleNames: string[] }
             → UserDto   Hook type: useMutation (full replace)
API-SEC-015  GET /api/users/{userId}/roles  → string[]  (role names)
             Hook type: useQuery, query key ['users', userId, 'roles'],
             enabled: !!userId — used to pre-populate the multi-select
             on Edit
```

<!-- API:API-SEC-015:END -->
## F2-QUERY — SCR-SEC-003 (Role & RBAC Management)

```
<!-- API:API-SEC-016:START -->
### F2-QUERY — API-SEC-016 — Create role
─────────────────────────────────────────────────────────────────
HTTP method      : POST   Endpoint : /api/roles
Request shape    : CreateRoleRequest { roleCode, roleName, description?,
                    active? }
Response shape   : RoleDto
Hook type        : useMutation
Errors           : 409 roleCode/roleName exists → inline field error
                    (RULE-SEC-048)

<!-- API:API-SEC-016:END -->
<!-- API:API-SEC-017:START -->
### F2-QUERY — API-SEC-017 — Search roles
─────────────────────────────────────────────────────────────────
HTTP method      : POST   Endpoint : /api/roles/search
Request shape    : { filters[{field: roleName|LIKE}], page, size,
                    sorts[{field: id|roleName}] }
Response shape   : Page<RoleDto>
Hook type        : useQuery, query key ['roles', { roleName, page, size,
                    sortBy, sortDir }]

<!-- API:API-SEC-017:END -->
<!-- API:API-SEC-018:START -->
### F2-QUERY — API-SEC-018 — Get role by id
─────────────────────────────────────────────────────────────────
HTTP method      : GET   Endpoint : /api/roles/{roleId}
Response shape   : RoleDto
Hook type        : useQuery, query key ['roles', roleId], enabled: !!roleId
                    — fires on EDIT mode entry only

<!-- API:API-SEC-018:END -->
<!-- API:API-SEC-019:START -->
### F2-QUERY — API-SEC-019 — Update role
─────────────────────────────────────────────────────────────────
HTTP method      : PUT   Endpoint : /api/roles/{roleId}
Request shape    : UpdateRoleRequest { roleName, description?, active? }
                    — no roleCode field (immutable, F1 confirms)
Response shape   : RoleDto
Hook type        : useMutation
Errors           : 409 roleName exists → inline field error
On success       : invalidate ['roles', *]

<!-- API:API-SEC-019:END -->
<!-- API:API-SEC-020:START -->
### F2-QUERY — API-SEC-020 — Delete role
─────────────────────────────────────────────────────────────────
HTTP method      : DELETE   Endpoint : /api/roles/{roleId}
Response shape   : 204
Hook type        : useMutation
Pre-deactivation/delete check: RULE-SEC-048 — 409 ROLE_IN_USE if the role
  has user assignments. Same pattern as API-SEC-013: no separate
  pre-check endpoint exists — attempt delete, surface 409 as the block
  reason, do not pre-promise success.

<!-- API:API-SEC-020:END -->
<!-- API:API-SEC-021:START -->
### F2-QUERY — API-SEC-021 — Activate / Deactivate role  [FINDING-001]
─────────────────────────────────────────────────────────────────
HTTP method      : PUT   Endpoint : /api/roles/{roleId}/toggle-active
                    ⚠ NOT /activate or /deactivate — see FINDING-001.
                    srs.md's API-SEC-021 (`.../activate`) and API-SEC-050
                    (`.../deactivate`) do not exist in the real, deployed
                    backend; both SRS entries are superseded here by the
                    single real endpoint below, per RULE-15.
Request shape    : ToggleRoleActiveRequest { active: boolean }
Response shape   : RoleDto
Hook type        : useMutation — TWO call-sites, same mutation:
                    activateRole(id)   → mutate({ roleId, active: true })
                    deactivateRole(id) → mutate({ roleId, active: false })
                    (preserves the Shell's existing two-button UX exactly
                    — see useSecurityStore.activateRole/deactivateRole)
On success       : invalidate ['roles', *]

<!-- API:API-SEC-021:END -->
<!-- API:API-SEC-022:START -->
### F2-QUERY — API-SEC-022 through API-SEC-026 — Role↔Page matrix
─────────────────────────────────────────────────────────────────
API-SEC-022  GET  /api/roles/{roleId}/pages
             → RolePagesMatrixResponse { roleId, roleName, assignments[] }
             Hook type: useQuery, key ['roles', roleId, 'pages'],
             enabled: !!roleId — feeds the permission matrix panel

API-SEC-023  POST /api/roles/{roleId}/pages
             { pageCode, permissions: string[] } → PageAssignmentResponse
             Hook type: useMutation — "Add Page" row action
             Applies: RULE-SEC-042 (VIEW auto-added, not sent explicitly),
             RULE-SEC-043 (permissions[] restricted to CREATE/UPDATE/
             DELETE — Zod: z.array(z.enum(['CREATE','UPDATE','DELETE'])))
             On success: invalidate ['roles', roleId, 'pages']

API-SEC-024  PUT  /api/roles/{roleId}/pages
             { assignments: PageAssignmentDto[] } (FULL REPLACE)
             → RolePagesMatrixResponse
             Hook type: useMutation — "Sync All" panel action
             Applies: RULE-SEC-044 (full replace of page-scoped grants
             only; system-level permissions untouched — the frontend
             never needs to reason about "system-level" here, this is a
             backend invariant, just send the page assignments as shown)
             On success: invalidate ['roles', roleId, 'pages']

API-SEC-025  DELETE /api/roles/{roleId}/pages/{pageCode} → 204
             Hook type: useMutation — "remove page" row action
             Applies: RULE-SEC-042 (removes the whole row, VIEW included
             — there is no partial removal; UI must not offer "remove
             VIEW only")
             On success: invalidate ['roles', roleId, 'pages']

API-SEC-026  POST /api/roles/{roleId}/copy-from/{sourceRoleId}
             → CopyPermissionsResponse { roleId, roleName, copiedFrom,
               assignments[] }
             Hook type: useMutation — "Copy From Role" panel action
             Applies: RULE-SEC-045 (rejects self-copy and copying from a
             role with zero page-scoped permissions — surfaced as a 409
             toast: "No permissions to copy from this role" /
             "Cannot copy from the same role")
             ⚠ per FINDING-005: the real doc shows no permission
             annotation on this endpoint (only "Authentication
             Required") — gate the button in the UI per PERM_ROLE_UPDATE
             anyway (SRS intent), but do not assume a 403 will ever come
             back from this specific call today.
             On success: invalidate ['roles', roleId, 'pages']
```

<!-- API:API-SEC-022:END -->
<!-- API:API-SEC-023:START -->
### F2-QUERY — API-SEC-022 through API-SEC-026 — Role↔Page matrix
─────────────────────────────────────────────────────────────────
API-SEC-022  GET  /api/roles/{roleId}/pages
             → RolePagesMatrixResponse { roleId, roleName, assignments[] }
             Hook type: useQuery, key ['roles', roleId, 'pages'],
             enabled: !!roleId — feeds the permission matrix panel

API-SEC-023  POST /api/roles/{roleId}/pages
             { pageCode, permissions: string[] } → PageAssignmentResponse
             Hook type: useMutation — "Add Page" row action
             Applies: RULE-SEC-042 (VIEW auto-added, not sent explicitly),
             RULE-SEC-043 (permissions[] restricted to CREATE/UPDATE/
             DELETE — Zod: z.array(z.enum(['CREATE','UPDATE','DELETE'])))
             On success: invalidate ['roles', roleId, 'pages']

API-SEC-024  PUT  /api/roles/{roleId}/pages
             { assignments: PageAssignmentDto[] } (FULL REPLACE)
             → RolePagesMatrixResponse
             Hook type: useMutation — "Sync All" panel action
             Applies: RULE-SEC-044 (full replace of page-scoped grants
             only; system-level permissions untouched — the frontend
             never needs to reason about "system-level" here, this is a
             backend invariant, just send the page assignments as shown)
             On success: invalidate ['roles', roleId, 'pages']

API-SEC-025  DELETE /api/roles/{roleId}/pages/{pageCode} → 204
             Hook type: useMutation — "remove page" row action
             Applies: RULE-SEC-042 (removes the whole row, VIEW included
             — there is no partial removal; UI must not offer "remove
             VIEW only")
             On success: invalidate ['roles', roleId, 'pages']

API-SEC-026  POST /api/roles/{roleId}/copy-from/{sourceRoleId}
             → CopyPermissionsResponse { roleId, roleName, copiedFrom,
               assignments[] }
             Hook type: useMutation — "Copy From Role" panel action
             Applies: RULE-SEC-045 (rejects self-copy and copying from a
             role with zero page-scoped permissions — surfaced as a 409
             toast: "No permissions to copy from this role" /
             "Cannot copy from the same role")
             ⚠ per FINDING-005: the real doc shows no permission
             annotation on this endpoint (only "Authentication
             Required") — gate the button in the UI per PERM_ROLE_UPDATE
             anyway (SRS intent), but do not assume a 403 will ever come
             back from this specific call today.
             On success: invalidate ['roles', roleId, 'pages']
```

<!-- API:API-SEC-023:END -->
<!-- API:API-SEC-024:START -->
### F2-QUERY — API-SEC-022 through API-SEC-026 — Role↔Page matrix
─────────────────────────────────────────────────────────────────
API-SEC-022  GET  /api/roles/{roleId}/pages
             → RolePagesMatrixResponse { roleId, roleName, assignments[] }
             Hook type: useQuery, key ['roles', roleId, 'pages'],
             enabled: !!roleId — feeds the permission matrix panel

API-SEC-023  POST /api/roles/{roleId}/pages
             { pageCode, permissions: string[] } → PageAssignmentResponse
             Hook type: useMutation — "Add Page" row action
             Applies: RULE-SEC-042 (VIEW auto-added, not sent explicitly),
             RULE-SEC-043 (permissions[] restricted to CREATE/UPDATE/
             DELETE — Zod: z.array(z.enum(['CREATE','UPDATE','DELETE'])))
             On success: invalidate ['roles', roleId, 'pages']

API-SEC-024  PUT  /api/roles/{roleId}/pages
             { assignments: PageAssignmentDto[] } (FULL REPLACE)
             → RolePagesMatrixResponse
             Hook type: useMutation — "Sync All" panel action
             Applies: RULE-SEC-044 (full replace of page-scoped grants
             only; system-level permissions untouched — the frontend
             never needs to reason about "system-level" here, this is a
             backend invariant, just send the page assignments as shown)
             On success: invalidate ['roles', roleId, 'pages']

API-SEC-025  DELETE /api/roles/{roleId}/pages/{pageCode} → 204
             Hook type: useMutation — "remove page" row action
             Applies: RULE-SEC-042 (removes the whole row, VIEW included
             — there is no partial removal; UI must not offer "remove
             VIEW only")
             On success: invalidate ['roles', roleId, 'pages']

API-SEC-026  POST /api/roles/{roleId}/copy-from/{sourceRoleId}
             → CopyPermissionsResponse { roleId, roleName, copiedFrom,
               assignments[] }
             Hook type: useMutation — "Copy From Role" panel action
             Applies: RULE-SEC-045 (rejects self-copy and copying from a
             role with zero page-scoped permissions — surfaced as a 409
             toast: "No permissions to copy from this role" /
             "Cannot copy from the same role")
             ⚠ per FINDING-005: the real doc shows no permission
             annotation on this endpoint (only "Authentication
             Required") — gate the button in the UI per PERM_ROLE_UPDATE
             anyway (SRS intent), but do not assume a 403 will ever come
             back from this specific call today.
             On success: invalidate ['roles', roleId, 'pages']
```

<!-- API:API-SEC-024:END -->
<!-- API:API-SEC-025:START -->
### F2-QUERY — API-SEC-022 through API-SEC-026 — Role↔Page matrix
─────────────────────────────────────────────────────────────────
API-SEC-022  GET  /api/roles/{roleId}/pages
             → RolePagesMatrixResponse { roleId, roleName, assignments[] }
             Hook type: useQuery, key ['roles', roleId, 'pages'],
             enabled: !!roleId — feeds the permission matrix panel

API-SEC-023  POST /api/roles/{roleId}/pages
             { pageCode, permissions: string[] } → PageAssignmentResponse
             Hook type: useMutation — "Add Page" row action
             Applies: RULE-SEC-042 (VIEW auto-added, not sent explicitly),
             RULE-SEC-043 (permissions[] restricted to CREATE/UPDATE/
             DELETE — Zod: z.array(z.enum(['CREATE','UPDATE','DELETE'])))
             On success: invalidate ['roles', roleId, 'pages']

API-SEC-024  PUT  /api/roles/{roleId}/pages
             { assignments: PageAssignmentDto[] } (FULL REPLACE)
             → RolePagesMatrixResponse
             Hook type: useMutation — "Sync All" panel action
             Applies: RULE-SEC-044 (full replace of page-scoped grants
             only; system-level permissions untouched — the frontend
             never needs to reason about "system-level" here, this is a
             backend invariant, just send the page assignments as shown)
             On success: invalidate ['roles', roleId, 'pages']

API-SEC-025  DELETE /api/roles/{roleId}/pages/{pageCode} → 204
             Hook type: useMutation — "remove page" row action
             Applies: RULE-SEC-042 (removes the whole row, VIEW included
             — there is no partial removal; UI must not offer "remove
             VIEW only")
             On success: invalidate ['roles', roleId, 'pages']

API-SEC-026  POST /api/roles/{roleId}/copy-from/{sourceRoleId}
             → CopyPermissionsResponse { roleId, roleName, copiedFrom,
               assignments[] }
             Hook type: useMutation — "Copy From Role" panel action
             Applies: RULE-SEC-045 (rejects self-copy and copying from a
             role with zero page-scoped permissions — surfaced as a 409
             toast: "No permissions to copy from this role" /
             "Cannot copy from the same role")
             ⚠ per FINDING-005: the real doc shows no permission
             annotation on this endpoint (only "Authentication
             Required") — gate the button in the UI per PERM_ROLE_UPDATE
             anyway (SRS intent), but do not assume a 403 will ever come
             back from this specific call today.
             On success: invalidate ['roles', roleId, 'pages']
```

<!-- API:API-SEC-025:END -->
<!-- API:API-SEC-026:START -->
### F2-QUERY — API-SEC-022 through API-SEC-026 — Role↔Page matrix
─────────────────────────────────────────────────────────────────
API-SEC-022  GET  /api/roles/{roleId}/pages
             → RolePagesMatrixResponse { roleId, roleName, assignments[] }
             Hook type: useQuery, key ['roles', roleId, 'pages'],
             enabled: !!roleId — feeds the permission matrix panel

API-SEC-023  POST /api/roles/{roleId}/pages
             { pageCode, permissions: string[] } → PageAssignmentResponse
             Hook type: useMutation — "Add Page" row action
             Applies: RULE-SEC-042 (VIEW auto-added, not sent explicitly),
             RULE-SEC-043 (permissions[] restricted to CREATE/UPDATE/
             DELETE — Zod: z.array(z.enum(['CREATE','UPDATE','DELETE'])))
             On success: invalidate ['roles', roleId, 'pages']

API-SEC-024  PUT  /api/roles/{roleId}/pages
             { assignments: PageAssignmentDto[] } (FULL REPLACE)
             → RolePagesMatrixResponse
             Hook type: useMutation — "Sync All" panel action
             Applies: RULE-SEC-044 (full replace of page-scoped grants
             only; system-level permissions untouched — the frontend
             never needs to reason about "system-level" here, this is a
             backend invariant, just send the page assignments as shown)
             On success: invalidate ['roles', roleId, 'pages']

API-SEC-025  DELETE /api/roles/{roleId}/pages/{pageCode} → 204
             Hook type: useMutation — "remove page" row action
             Applies: RULE-SEC-042 (removes the whole row, VIEW included
             — there is no partial removal; UI must not offer "remove
             VIEW only")
             On success: invalidate ['roles', roleId, 'pages']

API-SEC-026  POST /api/roles/{roleId}/copy-from/{sourceRoleId}
             → CopyPermissionsResponse { roleId, roleName, copiedFrom,
               assignments[] }
             Hook type: useMutation — "Copy From Role" panel action
             Applies: RULE-SEC-045 (rejects self-copy and copying from a
             role with zero page-scoped permissions — surfaced as a 409
             toast: "No permissions to copy from this role" /
             "Cannot copy from the same role")
             ⚠ per FINDING-005: the real doc shows no permission
             annotation on this endpoint (only "Authentication
             Required") — gate the button in the UI per PERM_ROLE_UPDATE
             anyway (SRS intent), but do not assume a 403 will ever come
             back from this specific call today.
             On success: invalidate ['roles', roleId, 'pages']
```

<!-- API:API-SEC-026:END -->
## F2-QUERY — SCR-SEC-004 (Permission Registry)

```
<!-- API:API-SEC-027:START -->
### F2-QUERY — API-SEC-027 — Create permission
─────────────────────────────────────────────────────────────────
POST /api/permissions   { name, pageId?, permissionType? }
→ PermissionDto     Hook type: useMutation
On success: invalidate ['permissions', *]

<!-- API:API-SEC-027:END -->
<!-- API:API-SEC-028:START -->
### F2-QUERY — API-SEC-028 — Search permissions
─────────────────────────────────────────────────────────────────
POST /api/permissions/search
{ filters[{field: name|LIKE, module|LIKE}], page, size, sorts }
→ Page<PermissionDto>
Hook type: useQuery, key ['permissions', { name, module, page, size,
sortBy, sortDir }]

<!-- API:API-SEC-028:END -->
<!-- API:API-SEC-029:START -->
### F2-QUERY — API-SEC-029 — Update permission
─────────────────────────────────────────────────────────────────
PUT /api/permissions/{id}   { name }   → PermissionDto
Hook type: useMutation
Errors: 409 PERMISSION_ALREADY_EXISTS → inline field error
On success: invalidate ['permissions', *]
No delete mutation exists for this screen (F1-SCREEN note).
```

<!-- API:API-SEC-029:END -->
## F2-QUERY — SCR-SEC-005 (Page Registry)

```
<!-- API:API-SEC-030:START -->
### F2-QUERY — API-SEC-030 — Create page
─────────────────────────────────────────────────────────────────
POST /api/pages
{ pageCode, nameAr, nameEn, route, icon?, module?, parentId?,
  displayOrder?, active?, description? }
→ PageResponse (includes auto-generated permissionKeys)
Hook type: useMutation
Errors: 409/400 duplicate pageCode/route, invalid parentId (self-ref) →
  inline field errors (RULE-SEC-046)
On success: invalidate ['pages', *] AND ['permissions', *] (4 new
  permission rows are created server-side as a side effect — the
  Permission Registry's cached list is now stale too)

<!-- API:API-SEC-030:END -->
<!-- API:API-SEC-031:START -->
### F2-QUERY — API-SEC-031/032 — Search / Active pages
─────────────────────────────────────────────────────────────────
API-SEC-031  POST /api/pages/search
             { filters[{pageCode|LIKE, module|LIKE, active|EQ}], page,
               size, sorts } → Page<PageResponse>
             Hook type: useQuery, key ['pages', { pageCode, module,
             active, page, size, sortBy, sortDir }] — bound to this
             screen's Search view
API-SEC-032  GET  /api/pages/active  → PageResponse[]
             Hook type: useQuery, key ['pages', 'active'], long
             staleTime — this is the LOV-like source used by every
             OTHER screen's "select a parent page" dropdown (SCR-SEC-005
             itself), and by SCR-SEC-003's "Add Page" picker — see
             F2-LOV-QUERY below, this is effectively a lookup source
             even though it is a Page-domain endpoint, not a
             `/lookups/*` one.

<!-- API:API-SEC-031:END -->
<!-- API:API-SEC-032:START -->
### F2-QUERY — API-SEC-031/032 — Search / Active pages
─────────────────────────────────────────────────────────────────
API-SEC-031  POST /api/pages/search
             { filters[{pageCode|LIKE, module|LIKE, active|EQ}], page,
               size, sorts } → Page<PageResponse>
             Hook type: useQuery, key ['pages', { pageCode, module,
             active, page, size, sortBy, sortDir }] — bound to this
             screen's Search view
API-SEC-032  GET  /api/pages/active  → PageResponse[]
             Hook type: useQuery, key ['pages', 'active'], long
             staleTime — this is the LOV-like source used by every
             OTHER screen's "select a parent page" dropdown (SCR-SEC-005
             itself), and by SCR-SEC-003's "Add Page" picker — see
             F2-LOV-QUERY below, this is effectively a lookup source
             even though it is a Page-domain endpoint, not a
             `/lookups/*` one.

<!-- API:API-SEC-032:END -->
<!-- API:API-SEC-033:START -->
### F2-QUERY — API-SEC-033 — Get page by id
─────────────────────────────────────────────────────────────────
GET /api/pages/{id} → PageResponse
Hook type: useQuery, key ['pages', id], enabled: !!id (Edit mode entry)

<!-- API:API-SEC-033:END -->
<!-- API:API-SEC-034:START -->
### F2-QUERY — API-SEC-034 — Update page
─────────────────────────────────────────────────────────────────
PUT /api/pages/{id}   { nameAr, nameEn, route, icon?, module?,
parentId?, displayOrder?, description? }   (no pageCode — immutable)
→ PageResponse    Hook type: useMutation
Errors: 400/409 duplicate route, invalid parentId → inline field errors
On success: invalidate ['pages', *]

<!-- API:API-SEC-034:END -->
<!-- API:API-SEC-035:START -->
### F2-QUERY — API-SEC-035/036 — Deactivate / Reactivate page
─────────────────────────────────────────────────────────────────
API-SEC-035  PUT /api/pages/{id}/deactivate → PageResponse
API-SEC-036  PUT /api/pages/{id}/reactivate → PageResponse
Hook type (both): useMutation, no request body
On success (both): invalidate ['pages', *]
```

<!-- API:API-SEC-035:END -->
<!-- API:API-SEC-036:START -->
### F2-QUERY — API-SEC-035/036 — Deactivate / Reactivate page
─────────────────────────────────────────────────────────────────
API-SEC-035  PUT /api/pages/{id}/deactivate → PageResponse
API-SEC-036  PUT /api/pages/{id}/reactivate → PageResponse
Hook type (both): useMutation, no request body
On success (both): invalidate ['pages', *]
```

<!-- API:API-SEC-036:END -->
## F2-QUERY — SCR-SEC-006 (User Profile)

```
<!-- API:API-SEC-037:START -->
### F2-QUERY — API-SEC-037 — Create profile
─────────────────────────────────────────────────────────────────
POST /api/v1/security/user-profiles
{ userIdFk, branchIdFk, fullNameAr?, fullNameEn?, preferredLang?,
  employeeIdFk? }
→ SecUserProfileDto   Hook type: useMutation
Applies: RULE-SEC-034 (branchIdFk validated active + exists cross-module
  — server-side; frontend does NOT duplicate this check, it just surfaces
  the 400/404 the server returns as an inline field error on branchIdFk)
On success: invalidate ['user-profiles', userIdFk]

<!-- API:API-SEC-037:END -->
<!-- API:API-SEC-038:START -->
### F2-QUERY — API-SEC-038/039/040 — List / Search / Get profile
─────────────────────────────────────────────────────────────────
API-SEC-038  GET  /api/v1/security/user-profiles?page&size
             → Page<SecUserProfileDto>   Hook type: useQuery — NOT used
             by this screen directly (this Drawer is always scoped to
             one user); listed for completeness only.
API-SEC-039  POST /api/v1/security/user-profiles/search
             { filters, page, size, sorts } → Page<SecUserProfileDto>
             Hook type: useQuery — same note as API-SEC-038: not bound
             to this Drawer's single-record flow. (No independent search
             UI exists for this entity per F1-SCREEN — it's always
             reached via a specific user.)
API-SEC-040  GET  /api/v1/security/user-profiles/{userId}
             → SecUserProfileDto   Hook type: useQuery, key
             ['user-profiles', userId], enabled: !!userId — THIS is the
             one the Drawer actually calls, to prefill on open.

<!-- API:API-SEC-038:END -->
<!-- API:API-SEC-039:START -->
### F2-QUERY — API-SEC-038/039/040 — List / Search / Get profile
─────────────────────────────────────────────────────────────────
API-SEC-038  GET  /api/v1/security/user-profiles?page&size
             → Page<SecUserProfileDto>   Hook type: useQuery — NOT used
             by this screen directly (this Drawer is always scoped to
             one user); listed for completeness only.
API-SEC-039  POST /api/v1/security/user-profiles/search
             { filters, page, size, sorts } → Page<SecUserProfileDto>
             Hook type: useQuery — same note as API-SEC-038: not bound
             to this Drawer's single-record flow. (No independent search
             UI exists for this entity per F1-SCREEN — it's always
             reached via a specific user.)
API-SEC-040  GET  /api/v1/security/user-profiles/{userId}
             → SecUserProfileDto   Hook type: useQuery, key
             ['user-profiles', userId], enabled: !!userId — THIS is the
             one the Drawer actually calls, to prefill on open.

<!-- API:API-SEC-039:END -->
<!-- API:API-SEC-040:START -->
### F2-QUERY — API-SEC-038/039/040 — List / Search / Get profile
─────────────────────────────────────────────────────────────────
API-SEC-038  GET  /api/v1/security/user-profiles?page&size
             → Page<SecUserProfileDto>   Hook type: useQuery — NOT used
             by this screen directly (this Drawer is always scoped to
             one user); listed for completeness only.
API-SEC-039  POST /api/v1/security/user-profiles/search
             { filters, page, size, sorts } → Page<SecUserProfileDto>
             Hook type: useQuery — same note as API-SEC-038: not bound
             to this Drawer's single-record flow. (No independent search
             UI exists for this entity per F1-SCREEN — it's always
             reached via a specific user.)
API-SEC-040  GET  /api/v1/security/user-profiles/{userId}
             → SecUserProfileDto   Hook type: useQuery, key
             ['user-profiles', userId], enabled: !!userId — THIS is the
             one the Drawer actually calls, to prefill on open.

<!-- API:API-SEC-040:END -->
<!-- API:API-SEC-041:START -->
### F2-QUERY — API-SEC-041 — Update profile
─────────────────────────────────────────────────────────────────
PUT /api/v1/security/user-profiles/{userId}
{ branchIdFk, fullNameAr?, fullNameEn?, preferredLang?, employeeIdFk? }
→ SecUserProfileDto   Hook type: useMutation
On success: invalidate ['user-profiles', userId]
```

<!-- API:API-SEC-041:END -->
## F2-QUERY — SCR-SEC-007 (Role Data Scope)

```
<!-- API:API-SEC-042:START -->
### F2-QUERY — API-SEC-042 — Create role-branch assignment
─────────────────────────────────────────────────────────────────
POST /api/v1/security/role-branches
{ roleIdFk, branchIdFk, dataAccessLevel } → SecRoleBranchDto
Hook type: useMutation
Errors: 409 duplicate (roleIdFk, branchIdFk) pair → inline banner
  (RULE-SEC-036: "This branch is already assigned to this role")
On success: invalidate ['role-branches', *]

<!-- API:API-SEC-042:END -->
<!-- API:API-SEC-043:START -->
### F2-QUERY — API-SEC-043/044 — List / Search role-branches
─────────────────────────────────────────────────────────────────
API-SEC-043  GET  /api/v1/security/role-branches?page&size
             → Page<SecRoleBranchDto>
API-SEC-044  POST /api/v1/security/role-branches/search
             { filters[{roleIdFk, branchIdFk, dataAccessLevel,
               isActiveFl}], page, size, sorts } → Page<SecRoleBranchDto>
Hook type (both): useQuery — API-SEC-044 is the one bound to this
  screen's Search view (has the actual filter fields); API-SEC-043
  listed for completeness only.
Query key: ['role-branches', { roleIdFk, branchIdFk, dataAccessLevel,
  isActiveFl, page, size, sortBy, sortDir }]

<!-- API:API-SEC-043:END -->
<!-- API:API-SEC-044:START -->
### F2-QUERY — API-SEC-043/044 — List / Search role-branches
─────────────────────────────────────────────────────────────────
API-SEC-043  GET  /api/v1/security/role-branches?page&size
             → Page<SecRoleBranchDto>
API-SEC-044  POST /api/v1/security/role-branches/search
             { filters[{roleIdFk, branchIdFk, dataAccessLevel,
               isActiveFl}], page, size, sorts } → Page<SecRoleBranchDto>
Hook type (both): useQuery — API-SEC-044 is the one bound to this
  screen's Search view (has the actual filter fields); API-SEC-043
  listed for completeness only.
Query key: ['role-branches', { roleIdFk, branchIdFk, dataAccessLevel,
  isActiveFl, page, size, sortBy, sortDir }]

<!-- API:API-SEC-044:END -->
<!-- API:API-SEC-045:START -->
### F2-QUERY — API-SEC-045 — Get role-branch by composite key
─────────────────────────────────────────────────────────────────
GET /api/v1/security/role-branches/{roleId}/{branchId}
→ SecRoleBranchDto
Hook type: useQuery, key ['role-branches', roleId, branchId],
enabled: !!roleId && !!branchId (Edit mode entry)

<!-- API:API-SEC-045:END -->
<!-- API:API-SEC-046:START -->
### F2-QUERY — API-SEC-046 — Update role-branch
─────────────────────────────────────────────────────────────────
PUT /api/v1/security/role-branches/{roleId}/{branchId}
{ dataAccessLevel } → SecRoleBranchDto
⚠ NOTE: the real request schema (UpdateSecRoleBranchRequest) only takes
  `dataAccessLevel` — NOT `isActiveFl`. If the form's isActiveFl Switch
  needs to persist, this plan flags it as a gap: there is no field for
  it on the real Update endpoint. Raise as OQ-FE-SEC-002 — do not send
  isActiveFl on this PUT; it will be silently ignored by the server.
Hook type: useMutation
On success: invalidate ['role-branches', *]

<!-- API:API-SEC-046:END -->
<!-- API:API-SEC-047:START -->
### F2-QUERY — API-SEC-047 — Delete role-branch
─────────────────────────────────────────────────────────────────
DELETE /api/v1/security/role-branches/{roleId}/{branchId} → 204
Hook type: useMutation, no pre-check endpoint — straightforward delete,
no known business-rule block documented for this one (unlike Role/User
delete) — standard confirm-then-delete flow.
On success: invalidate ['role-branches', *]
```

<!-- API:API-SEC-047:END -->
## F2-QUERY — Shared/global (not owned by a single SCR-ID)

```
<!-- API:API-SEC-048:START -->
### F2-QUERY — API-SEC-048/049 — Menu
─────────────────────────────────────────────────────────────────
API-SEC-048  GET /api/menu/user-menu           → MenuItemDto[]
             Hook type: useQuery, key ['menu', 'current'], long
             staleTime — called once by AppShell/Sidebar at session
             start, not owned by any SCR-ID (SRS confirms: no SEC_PAGES
             row, no dedicated admin screen exists for this)
API-SEC-049  GET /api/menu/user-menu/{userId}  → MenuItemDto[]
             Hook type: useQuery — admin diagnostic tool only, PERM_
             USER_VIEW-gated; no screen in this plan's 7 SCR-IDs
             surfaces it. Out of scope for F1–F4 (no SCR-ID owns it per
             SRS's own note) — recorded here only so the API-ID isn't
             silently missing from this plan.
```

<!-- API:API-SEC-048:END -->
<!-- API:API-SEC-049:START -->
### F2-QUERY — API-SEC-048/049 — Menu
─────────────────────────────────────────────────────────────────
API-SEC-048  GET /api/menu/user-menu           → MenuItemDto[]
             Hook type: useQuery, key ['menu', 'current'], long
             staleTime — called once by AppShell/Sidebar at session
             start, not owned by any SCR-ID (SRS confirms: no SEC_PAGES
             row, no dedicated admin screen exists for this)
API-SEC-049  GET /api/menu/user-menu/{userId}  → MenuItemDto[]
             Hook type: useQuery — admin diagnostic tool only, PERM_
             USER_VIEW-gated; no screen in this plan's 7 SCR-IDs
             surfaces it. Out of scope for F1–F4 (no SCR-ID owns it per
             SRS's own note) — recorded here only so the API-ID isn't
             silently missing from this plan.
```

<!-- API:API-SEC-049:END -->
## F2-LOV-QUERY

```
### F2-LOV-QUERY — LOV-SEC-001 — Permission Type
─────────────────────────────────────────────────────────────────
⚠ NOT a runtime lookup call — LOV-SEC-001 is a hardcoded Java enum
  (`@Enumerated(STRING)`), confirmed as a documented deviation from the
  standard MD_LOOKUP_DETAIL pattern (SRS A5). No GET /api/v1/sys/lookups/*
  call exists or is needed for this one.
Hook name        : none — use a static, hardcoded const array:
                    PERMISSION_TYPE_OPTIONS = [
                      { code: 'VIEW',   nameAr: 'عرض',   nameEn: 'View' },
                      { code: 'CREATE', nameAr: 'إنشاء', nameEn: 'Create' },
                      { code: 'UPDATE', nameAr: 'تعديل', nameEn: 'Update' },
                      { code: 'DELETE', nameAr: 'حذف',   nameEn: 'Delete' },
                    ]
Used by field    : permissionType on AppPermission (SCR-SEC-004)
─────────────────────────────────────────────────────────────────

### F2-LOV-QUERY — LOV-SEC-002 — Data Access Level
─────────────────────────────────────────────────────────────────
Hook name        : useDataAccessLevelOptions()
Endpoint         : GET /api/lookups/DATA_ACCESS_LEVEL?active=true
                    (per SRS A5 — routed through MasterDataLookupClient
                    server-side; NOT one of the 31 endpoints in this
                    session's Security API docs — it is a MasterData-
                    module endpoint. Flagged: confirm this exact path
                    against MasterData's own real API docs when
                    available; not verifiable from this session's
                    uploads alone.)
Query key        : [ ['lookups', 'DATA_ACCESS_LEVEL'] ]
Returns          : [{ code: 'BRANCH_ONLY', nameAr: 'الفرع فقط',
                    nameEn: 'Branch Only' },
                    { code: 'BRANCH_AND_CHILDREN', ... },
                    { code: 'ALL', ... }]  — exactly 3 values (see
                    F1-MODEL ENTITY-SEC-010 correction — these codes,
                    not BRANCH/CHILDREN/ALL)
Used by field    : dataAccessLevel on DataScope (SCR-SEC-007), also the
                    matching field shown read-only inside SCR-SEC-003's
                    "Branch Data Scope →" link-out
Caching          : staleTime 10+ minutes — stable reference data
Reuse rule       : ONE hook, shared — same query key dedupes automatically
─────────────────────────────────────────────────────────────────

### F2-LOV-QUERY — Active Pages (used as a lookup, not a true LOV)
─────────────────────────────────────────────────────────────────
Hook name        : useActivePagesOptions()
Endpoint         : GET /api/pages/active  (= API-SEC-032 — reused, not
                    a duplicate call; TanStack Query dedupes on identical
                    query key regardless of which screen fires it first)
Query key        : ['pages', 'active']
Used by fields   : parentId on AppScreen (SCR-SEC-005 self-select), and
                    the "Add Page" pageCode picker on SCR-SEC-003's matrix
Caching          : medium staleTime (pages change more often than a true
                    LOV, but still reference-data-like)
─────────────────────────────────────────────────────────────────

### F2-LOV-QUERY — Branch (external, Organization module)
─────────────────────────────────────────────────────────────────
Hook name        : useActiveBranchesOptions()  — owned by the
                    Organization module's own F2 spec (this plan
                    references it, does not define it — cross-module
                    boundary per RULE-SEC-034/branchIdFk on
                    SecUserProfile and SecRoleBranch)
Used by fields   : branchIdFk on SecUserProfile (SCR-SEC-006) and
                    SecRoleBranch (SCR-SEC-007)
Note             : this plan does not have Organization's real API docs
                    in this session's uploads — the exact endpoint path
                    is NOT verified here. Do not invent one; when the
                    Organization module's frontend-execution-plan.md is
                    generated, cross-check the hook name/endpoint match
                    exactly.
─────────────────────────────────────────────────────────────────
```
---

## F2-SCREEN-INIT + F2-FACADE-HOOK — one pair per SCR-ID

```
### F2-SCREEN-INIT — SCR-SEC-001 — Authentication & Self-Service
─────────────────────────────────────────────────────────────────
On mount: no permission hook (public screen — no canView/canCreate/etc.
  gating applies here at all, per SEC-FE below). No LOV hooks. Which
  sub-form is visible is local component state (Tabs: Login/Signup),
  or derived from the presence of a token in the URL/init prop for
  Activate/Reset flows.
Search screen state: n/a (no search view on this screen)
─────────────────────────────────────────────────────────────────

### F2-FACADE-HOOK — SCR-SEC-001 — useAuthFacade()
─────────────────────────────────────────────────────────────────
Composes: API-SEC-002 (login-token, useMutation), API-SEC-005..008
  (useMutation ×4)
STATE OWNED: activeTab ('login'|'signup') — local useState, UI only
OPERATIONS EXPOSED:
  login(username, password)   → API-SEC-002 mutation → on success,
    stores { userId, username, roles, permissions } into useAuthStore
    (FINDING-004 wiring point) and navigates to 'dashboard' via
    useNavigationStore.setCurrentScreen (FINDING-002: no router push)
  signup(username, email, password) → API-SEC-005 mutation
  activate(token)              → API-SEC-006 mutation
  requestPasswordReset(email)  → API-SEC-007 mutation → always shows the
    same generic success message regardless of mutation success payload
    content (RULE-SEC-038 — but a genuine network/500 failure still
    shows the generic 500 message per shared error routing, since that's
    a transport failure, not an enumeration signal)
  resetPassword(token, newPassword) → API-SEC-008 mutation
BOUNDARIES: Login/Signup/Activate/Forgot/Reset components call this
  Facade Hook only.
─────────────────────────────────────────────────────────────────
```

```
### F2-SCREEN-INIT — SCR-SEC-002 — User Management
─────────────────────────────────────────────────────────────────
On mount:
  1. Permission hook → canView/canCreate/canEdit/canDelete for USER page
     (see SEC-FE)
  2. LOV hooks: none direct — role multi-select uses API-SEC-017 (role
     search, unpaginated large page-size) as its options source, not a
     true LOV
  3. Edit mode: API-SEC-015 (get user roles), enabled: !!id, to prefill
     the multi-select
Search screen state: currentPage/pageSize live in the search query key
  (see F2-QUERY API-SEC-010) — never separate useState
─────────────────────────────────────────────────────────────────

### F2-FACADE-HOOK — SCR-SEC-002 — useUsersFacade()
─────────────────────────────────────────────────────────────────
Composes: API-SEC-010 (search, useQuery), API-SEC-009 (create),
  API-SEC-012 (update), API-SEC-013 (delete), API-SEC-014 (assign
  roles) — all useMutation
STATE OWNED/EXPOSED:
  users            — from search useQuery's `data.content`
  selectedUser     — local useState
  isLoading        — derived from search query's isLoading/isFetching
  searchFilters    — local useState { username, enabled, page, size,
                      sortBy, sortDir }
  roleNameOptions  — from role-search LOV-like query's `data`
OPERATIONS EXPOSED:
  createUser(data)             → API-SEC-009
  updateUser(id, data)         → API-SEC-012
  deleteUser(id)               → API-SEC-013 — if blocked (409), surface
    reason via toast, no confirm dialog opened; if the confirm dialog was
    already open (user clicked delete, confirm shown, user confirmed),
    the 409 still just shows the reason toast and closes the dialog
    without a false "deleted" state
  assignRoles(id, roleNames)   → API-SEC-014
  selectUser(user)             → local only
  setSearchFilters(filters)    → local only, triggers refetch via query
    key change
BOUNDARIES: UsersPage calls this Facade Hook only; no direct useQuery/
  useMutation inside UsersPage.
─────────────────────────────────────────────────────────────────
```

```
### F2-SCREEN-INIT — SCR-SEC-003 — Role & RBAC Management
─────────────────────────────────────────────────────────────────
On mount:
  1. Permission hook → canView/canCreate/canEdit/canDelete for ROLE page
  2. LOV hooks: useActivePagesOptions() (for "Add Page" picker),
     role-search (unpaginated) for the "Copy From Role" source picker
  3. Edit mode: API-SEC-018 (get role by id) + API-SEC-022 (get role
     pages matrix), both enabled: !!id
Search screen state: currentPage/pageSize in query key (API-SEC-017)
─────────────────────────────────────────────────────────────────

### F2-FACADE-HOOK — SCR-SEC-003 — useRolesFacade()
─────────────────────────────────────────────────────────────────
Composes: API-SEC-017 (search), API-SEC-016 (create), API-SEC-019
  (update), API-SEC-020 (delete), API-SEC-021 (toggle-active —
  FINDING-001), API-SEC-022 (get pages matrix), API-SEC-023 (add page),
  API-SEC-024 (sync pages), API-SEC-025 (remove page), API-SEC-026
  (copy from role)
STATE OWNED/EXPOSED:
  roles, selectedRole, isLoading, searchFilters — same pattern as Users
  pageMatrix           — from API-SEC-022 query's `data.assignments`
  activePageOptions    — from useActivePagesOptions()
OPERATIONS EXPOSED:
  createRole/updateRole/deleteRole  → API-SEC-016/019/020 (delete: same
    409-surfacing pattern as user delete, RULE-SEC-048)
  activateRole(id)    → mutate toggle-active with { active: true }
  deactivateRole(id)  → mutate toggle-active with { active: false }
    (both keep the Shell's existing two separate call-sites —
    FINDING-001; only the underlying endpoint changes)
  addPageToRole(roleId, pageCode, perms)   → API-SEC-023
  syncRolePages(roleId, assignments)       → API-SEC-024
  removePageFromRole(roleId, pageCode)     → API-SEC-025
  copyFromRole(roleId, sourceRoleId)       → API-SEC-026
BOUNDARIES: RolesPage (incl. the embedded matrix sub-panel) calls this
  Facade Hook only.
─────────────────────────────────────────────────────────────────
```

```
### F2-SCREEN-INIT — SCR-SEC-004 — Permission Registry
─────────────────────────────────────────────────────────────────
On mount: 1. Permission hook (PERMISSION page). 2. LOV: hardcoded
  PERMISSION_TYPE_OPTIONS const (no call), plus useActivePagesOptions()
  for the "page" select. No edit-mode prefetch beyond the search list
  itself (Modal edit opens with the already-loaded row from the grid,
  no separate get-by-id call needed since PermissionDto has no fields
  the search response doesn't already include).
Search screen state: currentPage/pageSize in query key (API-SEC-028)
─────────────────────────────────────────────────────────────────

### F2-FACADE-HOOK — SCR-SEC-004 — usePermissionsFacade()
─────────────────────────────────────────────────────────────────
Composes: API-SEC-028 (search), API-SEC-027 (create), API-SEC-029
  (update)
STATE/OPS: same shape as Users Facade (permissions, selectedPermission,
  isLoading, searchFilters; createPermission/updatePermission). No
  delete operation exposed (none exists — F1-SCREEN note).
─────────────────────────────────────────────────────────────────
```

```
### F2-SCREEN-INIT — SCR-SEC-005 — Page Registry
─────────────────────────────────────────────────────────────────
On mount: 1. Permission hook (PAGE page). 2. LOV: useActivePagesOptions()
  reused for the parentId self-select (excluding the record's own id on
  Edit — client-side filter after fetch, not a server param). 3. Edit
  mode: API-SEC-033 (get by id), enabled: !!id.
Search screen state: currentPage/pageSize in query key (API-SEC-031)
─────────────────────────────────────────────────────────────────

### F2-FACADE-HOOK — SCR-SEC-005 — usePagesFacade()
─────────────────────────────────────────────────────────────────
Composes: API-SEC-031 (search), API-SEC-030 (create), API-SEC-034
  (update), API-SEC-035 (deactivate), API-SEC-036 (reactivate),
  useActivePagesOptions() (parentId select)
STATE/OPS: same shape as Users Facade, plus:
  deactivatePage(id) → API-SEC-035, reactivatePage(id) → API-SEC-036
  (both simple mutations, no pre-check endpoint exists — direct call)
─────────────────────────────────────────────────────────────────
```

```
### F2-SCREEN-INIT — SCR-SEC-006 — User Profile (Drawer)
─────────────────────────────────────────────────────────────────
On mount (Drawer open, not page mount): 1. Permission hook (USER_PROFILE
  page). 2. LOV: Organization's useActiveBranchesOptions() (cross-module,
  see F2-LOV-QUERY note). 3. API-SEC-040 (get profile by userId),
  enabled: !!userId && isOpen — only fires once the Drawer is actually
  opened for a specific user, not on the parent Users screen's mount.
Search screen state: n/a (no independent search view — F1-SCREEN)
─────────────────────────────────────────────────────────────────

### F2-FACADE-HOOK — SCR-SEC-006 — useUserProfileFacade(userId)
─────────────────────────────────────────────────────────────────
Composes: API-SEC-040 (get, enabled: !!userId), API-SEC-037 (create —
  used the FIRST time a profile is saved for a user with none yet),
  API-SEC-041 (update — used thereafter)
STATE OWNED: profile (from get query's data, or null if 404/none yet —
  a 404 here means "create" branch, not an error state to show the user)
OPERATIONS EXPOSED:
  saveProfile(data) → if `profile` is null, calls create (API-SEC-037)
    with userIdFk = userId; otherwise calls update (API-SEC-041). This
    branch lives in the Facade Hook, not the component.
─────────────────────────────────────────────────────────────────
```

```
### F2-SCREEN-INIT — SCR-SEC-007 — Role Data Scope
─────────────────────────────────────────────────────────────────
On mount (opened from SCR-SEC-003's "Branch Data Scope →" link, scoped
  to a roleId): 1. Permission hook — reuses ROLE page's canView/
  canEdit (no independent PERM_* — F1-SCREEN/SEC-FE note). 2. LOV:
  useDataAccessLevelOptions() (LOV-SEC-002), Organization's
  useActiveBranchesOptions(). 3. API-SEC-044 (search, filtered to the
  given roleId) drives the list; no separate get-by-id prefetch needed
  for the list view (Edit opens with the row already in hand from the
  list).
Search screen state: currentPage/pageSize in query key (API-SEC-044)
─────────────────────────────────────────────────────────────────

### F2-FACADE-HOOK — SCR-SEC-007 — useDataScopeFacade(roleId?)
─────────────────────────────────────────────────────────────────
Composes: API-SEC-044 (search, pre-filtered by roleId when scoped),
  API-SEC-042 (create), API-SEC-046 (update), API-SEC-047 (delete),
  useDataAccessLevelOptions(), Organization's useActiveBranchesOptions()
STATE/OPS: same shape as Users Facade. `update` sends only
  `dataAccessLevel` on the wire (see F2-QUERY API-SEC-046 note re:
  isActiveFl not being accepted by the real endpoint — OQ-FE-SEC-002).
  `delete` — plain confirm-then-delete, no known blocking rule.
─────────────────────────────────────────────────────────────────
```
---

<!-- PHASE:F2:END -->
<!-- PHASE:F3:START -->
# PHASE F3 — Frontend Validation Rule Specifications

Rules with no Message-AR/Message-EN in SRS A4 (RULE-SEC-031, 037, 039,
044, 047, 051, 052, 053) are internal/architectural — no UI validator, no
form-facing behavior. Not specified below; listed once here so their
absence from F3 isn't mistaken for a gap.

```
### F3-VALIDATION — RULE-SEC-030 — Self-registered account disabled by default
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST create self-registered accounts with
               `enabled = false` until activated
  Message-AR : حسابك قيد التفعيل — يرجى تأكيد بريدك الإلكتروني أولاً
  Message-EN : Your account is pending activation — please confirm your
               email first
  Scope      : CREATE (signup only)
VALIDATION SPEC:
  Field            : n/a — not a field validator, a post-submit outcome
                       message shown on SignupForm's success state
                       (informational banner, not an error)
  ERR-ID           : none in SRS — bind directly to RULE-SEC-030's
                       messages per this plan's Adaptation Note
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-SEC-032/033 — Token invalid/expired/already used
─────────────────────────────────────────────────────────────────
RULE SOURCE (RULE-SEC-032):
  Statement  : The system MUST reject activation/reset if the token is
               invalid, expired, or already used
  Message-AR : الرمز غير صالح أو منتهي الصلاحية
  Message-EN : Token is invalid or has expired
  Scope      : ALL (Activate, Reset)
RULE SOURCE (RULE-SEC-033):
  Statement  : The system MUST mark the token as used immediately on
               success and MUST reject any further use of the same token
  Message-AR : هذا الرمز مُستخدَم مسبقاً
  Message-EN : This token has already been used
VALIDATION SPEC:
  Field            : token (ActivateForm, ResetPasswordForm)
  Validation type  : server-side only — no client-side format check is
                       specified in SRS (token is an opaque string)
  When evaluated   : ON_SUBMIT (server round-trip is the only check)
  Message shown    : inline banner on the form, not a field-level error
                       (there's no "correct" client-checkable shape for
                       the token to validate against before submit)
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-SEC-034 — Branch must exist and be active
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST validate that branchIdFk references an
               existing, active ORG_BRANCH row via cross-module call
               before saving
  Message-AR : الفرع المحدَّد غير موجود أو غير نشط
  Message-EN : Selected branch does not exist or is not active
  Scope      : CREATE, UPDATE (SecUserProfile — SCR-SEC-006)
VALIDATION SPEC:
  Field            : branchIdFk
  DB Column        : SEC_USER_PROFILE.BRANCH_ID_FK
  Validation type  : LOV_VALID (against useActiveBranchesOptions(),
                       cross-module) — client-side pre-check possible
                       (value must be in the loaded active-branches
                       options) AND the server re-validates
                       authoritatively regardless
  Zod primitive    : z.number().refine(v => activeBranchIds.includes(v))
  When evaluated   : ON_SUBMIT (options loaded on screen init)
  Message shown    : inline under branchIdFk field if the client-side
                       refine fails; server 400/404 mapped to the same
                       field via setError if it somehow slips past
                       (e.g. branch deactivated between load and submit)
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-SEC-035 — dataAccessLevel required + valid
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST require dataAccessLevel and MUST validate
               it is an active LOV-SEC-002 code
  Message-AR : مستوى الوصول للبيانات إلزامي ويجب أن يكون قيمة معتمَدة
  Message-EN : Data access level is required and must be a valid, active
               value
  Scope      : CREATE, UPDATE (SecRoleBranch — SCR-SEC-007)
VALIDATION SPEC:
  Field            : dataAccessLevel
  DB Column        : SEC_ROLE_BRANCH.DATA_ACCESS_LEVEL
  Validation type  : REQUIRED + LOV_VALID
  LOV-ID           : LOV-SEC-002
  LOV hook         : useDataAccessLevelOptions()
  Endpoint bound   : GET /api/lookups/DATA_ACCESS_LEVEL?active=true
  Zod primitive    : z.string().min(1).refine(v =>
                       loadedOptions.some(o => o.code === v))
  When evaluated   : ON_SUBMIT
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-SEC-036 — No duplicate role-branch pair
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent duplicate (roleIdFk, branchIdFk)
               assignments
  Message-AR : هذا الفرع مُسنَد بالفعل لهذا الدور
  Message-EN : This branch is already assigned to this role
  Scope      : CREATE only
VALIDATION SPEC:
  Field            : branchIdFk (paired with roleIdFk)
  Validation type  : UNIQUE_CHECK (composite)
  API call         : API-SEC-042 create — server enforces via composite
                       PK + explicit check (SecRoleBranchService.create())
  When             : server round-trip on submit (no live "on blur"
                       async check specified — the composite nature and
                       small option set make a pre-check less valuable
                       than for a single-column uniqueness check;
                       server 409 mapped to a form-level banner, not a
                       specific field, since the conflict is the PAIR)
  Edit exception    : n/a — roleIdFk/branchIdFk are both LOCKED on EDIT
                       (F1-SCREEN), so this only fires on CREATE
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-SEC-038 — Anti-enumeration on forgot-password
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST return an identical response regardless
               of whether the submitted email exists
  Message-AR : إذا كان بريدك مسجَّلاً لدينا، ستصلك رسالة استعادة كلمة
               المرور
  Message-EN : If your email is registered, you will receive a password
               reset message
  Scope      : ALL (forgot-password only)
VALIDATION SPEC:
  Field            : email — format-only client validation (z.string()
                       .email()); NO existence check is ever performed
                       or surfaced client-side (that is the entire point
                       of this rule)
  When evaluated   : ON_SUBMIT for format; the ALWAYS-200 success
                       message above is shown regardless of what the
                       server actually did — F3-SEC note: do not add any
                       "email not found" branch anywhere in this form's
                       error handling, even defensively
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-SEC-040 — Username unique on signup
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST require globally unique username on
               signup
  Message-AR : اسم المستخدم مستخدَم بالفعل
  Message-EN : Username already exists
  Scope      : CREATE (signup only)
VALIDATION SPEC:
  Field            : username         DB Column: USERS.USERNAME
  Validation type  : UNIQUE_CHECK
  API call         : API-SEC-005 signup — 409
                       SIGNUP_USERNAME_ALREADY_EXISTS
  When             : on submit (no dedicated "check availability"
                       endpoint documented — do not invent an on-blur
                       async check against a non-existent endpoint;
                       surface the 409 via setError on submit instead)
  Edit exception    : n/a (signup is create-only)
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-SEC-041 — Email unique on signup
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST require globally unique email on signup
  Message-AR : البريد الإلكتروني مستخدَم بالفعل
  Message-EN : Email already exists
  Scope      : CREATE (signup only)
VALIDATION SPEC:
  Field            : email            DB Column: USERS.EMAIL
  Validation type  : UNIQUE_CHECK, same pattern as RULE-SEC-040
                       (409 SIGNUP_EMAIL_ALREADY_EXISTS, on-submit only)
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-SEC-042 — VIEW auto-add, not independently removable
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST auto-add VIEW permission whenever a Page
               is assigned to a Role, and MUST NOT allow VIEW to be
               removed independently of the full CRUD set for that page
  Message-AR : صلاحية العرض تُضاف تلقائياً ولا يمكن إزالتها بمفردها
  Message-EN : VIEW permission is added automatically and cannot be
               removed independently
  Scope      : ALL (role-page matrix, SCR-SEC-003)
VALIDATION SPEC:
  Field            : n/a — UI behavior constraint, not a submitted field
  Validation type  : BUSINESS_RULE
  Logic            : the View column checkbox in the permission matrix
                       is always rendered checked+disabled for any row
                       that exists; the only way to remove VIEW is to
                       remove the entire row (API-SEC-025), which is a
                       distinct, explicit "Remove page" action, never a
                       checkbox uncheck
  Dependent fields  : the row's Create/Update/Delete checkboxes remain
                       independently togglable
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-SEC-043 — CRUD permission values restricted
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST restrict permission values in role-page
               assignment requests to CREATE, UPDATE, DELETE only
  Message-AR : نوع الصلاحية غير صالح
  Message-EN : Invalid permission type
  Scope      : ALL (Add Page, Sync Pages)
VALIDATION SPEC:
  Field            : permissions[] (per matrix row)
  Validation type  : LOV_VALID (closed set, hardcoded — not a runtime
                       lookup, same class as LOV-SEC-001)
  Zod primitive    : z.array(z.enum(['CREATE','UPDATE','DELETE']))
  When evaluated   : ON_CHANGE (checkbox state can only ever represent
                       these 3 values structurally — the UI makes an
                       invalid value unrepresentable, this Zod check is
                       a defensive backstop before the API call)
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-SEC-045 — Role permission copy rules
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST copy only page-scoped permissions from
               the source role, MUST NOT overwrite the target role's
               system-level permissions, MUST reject copying from a
               role with zero page-scoped permissions, and MUST reject
               self-copy
  Message-AR : لا توجد صلاحيات لنسخها من هذا الدور / لا يمكن النسخ من
               نفس الدور
  Message-EN : No permissions to copy from this role / Cannot copy from
               the same role
  Scope      : ALL (Copy From Role action, SCR-SEC-003)
VALIDATION SPEC:
  Field            : sourceRoleId (role picker)
  Validation type  : BUSINESS_RULE
  Logic            : client-side pre-check disables the source-role
                       picker's own row for the currently-open role
                       (cannot even select self — cheap UX win, though
                       the server also enforces it); the "zero
                       permissions" case cannot be pre-checked
                       client-side without an extra fetch, so it is
                       surfaced purely via the 409 → toast on submit
  Dependent fields  : the currently-open roleId (excluded from the
                       picker's own option list)
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-SEC-046 — Page code/route format + uniqueness + parent
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST require pageCode to match ^[A-Z0-9_]+$
               (2-50 chars) and route to start with / and match
               ^/[a-zA-Z0-9/_-]+$; both MUST be unique; parentId, if
               given, MUST reference an existing page and MUST NOT
               self-reference
  Message-AR : رمز أو مسار الشاشة غير صالح، أو مستخدَم بالفعل، أو الشاشة
               الأب غير صحيحة
  Message-EN : Invalid or duplicate page code/route, or invalid parent
               page
  Scope      : CREATE, UPDATE (SCR-SEC-005)
VALIDATION SPEC:
  Field            : pageCode         DB Column: SEC_PAGES.PAGE_CODE
  Validation type  : PATTERN + LENGTH(2,50) + UNIQUE_CHECK
  Zod primitive    : z.string().min(2).max(50)
                       .regex(/^[A-Z0-9_]+$/)
                       — input auto-uppercased before validation
                       (`.toUpperCase()` transform, not a separate rule)
  Field            : route            DB Column: SEC_PAGES.ROUTE
  Validation type  : PATTERN + LENGTH(≤200) + UNIQUE_CHECK
  Zod primitive    : z.string().max(200).regex(/^\/[a-zA-Z0-9/_-]+$/)
  Field            : parentId         DB Column: SEC_PAGES.PARENT_ID
  Validation type  : BUSINESS_RULE — must not equal the record's own id
                       (Edit mode only; meaningless on Create, field is
                       simply excluded from that self-check)
  Zod primitive    : z.number().nullable().refine(v =>
                       v == null || v !== currentPageId)
  When evaluated   : pattern/length ON_CHANGE or ON_BLUR (per this
                       project's declared form mode); uniqueness
                       ON_SUBMIT (server 400/409 → setError on the
                       specific field when the server response
                       disambiguates which one collided, else a
                       form-level banner)
  Edit exception    : pageCode excluded entirely on EDIT (read-only
                       display, not resubmitted — see F1-SCREEN)
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-SEC-048 — Role code/name unique, immutable, delete-protected
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST require unique roleCode and roleName,
               MUST treat roleCode as immutable after creation, and
               MUST prevent deletion of a role that has existing user
               assignments
  Message-AR : رمز أو اسم الدور مستخدَم بالفعل / لا يمكن حذف دور له
               مستخدمون مُسنَدون
  Message-EN : Role code or name already exists / Cannot delete a role
               with assigned users
  Scope      : CREATE, UPDATE, DELETE (SCR-SEC-003)
VALIDATION SPEC:
  Field            : roleCode   DB Column: ROLES.ROLE_CODE
  Validation type  : PATTERN + UNIQUE_CHECK — CREATE ONLY (field is
                       excluded from the form entirely on EDIT — F1)
  Zod primitive    : z.string().regex(/^[A-Z][A-Z0-9_]*$/)
  Field            : roleName   DB Column: ROLES.NAME
  Validation type  : REQUIRED + UNIQUE_CHECK — CREATE and UPDATE
  Zod primitive    : z.string().min(1)
  When evaluated   : ON_SUBMIT (server 409 → setError on the
                       disambiguated field, or a form banner if the
                       server error doesn't distinguish which one)
  Delete guard     : DELETE — 409 ROLE_IN_USE → toast (see F2-QUERY
                       API-SEC-020 pre-check note — no separate check
                       endpoint, the delete attempt IS the check)
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-SEC-049 — Username unique (admin path), delete-protected, default role
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST require unique username (case-
               insensitive) on create and update, MUST prevent deletion
               of a user with active refresh tokens, and MUST
               auto-assign the default ROLE_USER role on creation if it
               exists (silently skipped otherwise)
  Message-AR : اسم المستخدم مستخدَم بالفعل / لا يمكن حذف مستخدم لديه
               جلسات نشطة
  Message-EN : Username already exists / Cannot delete a user with
               active sessions
  Scope      : CREATE, UPDATE, DELETE (SCR-SEC-002)
VALIDATION SPEC:
  Field            : username   DB Column: USERS.USERNAME
  Validation type  : REQUIRED + UNIQUE_CHECK (case-insensitive)
  Zod primitive    : z.string().min(3).max(80)
  When evaluated   : ON_SUBMIT (server 409 → setError on username)
  Delete guard     : DELETE — 409 USER_HAS_ACTIVE_REFRESH_TOKENS →
                       toast, same no-pre-check-endpoint pattern as Role
  Default-role auto-assign : purely server-side, no frontend behavior —
                       do not show a "role auto-assigned" message; the
                       created UserDto's `roles[]` in the response
                       already reflects it and the UI just displays
                       whatever comes back
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-SEC-050 — Rate limiting on sensitive auth endpoints
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST block further attempts for the same
               ip|identifier key after a configured maximum within a
               configured lockout window
  Message-AR : تجاوزت الحد المسموح من المحاولات — حاول لاحقاً
  Message-EN : Too many attempts — please try again later
  Scope      : ALL (login, signup, forgot-password, reset-password —
               all 4, per the corrected 2026-08-23 SRS note, not login
               alone)
VALIDATION SPEC:
  Field            : n/a — HTTP 429 response handling, not a field rule
  Validation type  : n/a (server-enforced only, no client-side
                       pre-emptive throttling specified)
  When evaluated   : on any 429 response from any of the 4 endpoints
  Message shown    : inline banner on the relevant form (see shared
                       error-routing table in F2 — this is the one
                       addition beyond the standard 400/409/401/403/500
                       set, specific to these 4 public endpoints)
─────────────────────────────────────────────────────────────────
```

**F3 Business Code Rules (applied to roleCode, pageCode — the two
fields in this module closest to a Business Code, both documented
deviations from the standard auto-generated pattern):**
```
F3-BC-RULE-1 — roleCode / pageCode: user-entered at CREATE (not
               auto-generated — deviation from BC-RULE-2, documented
               in SRS A3), but immutable thereafter
F3-BC-RULE-2 — On CREATE: shown as an editable text input (not the
               standard "hidden, system-generates" pattern — this
               module's deviation is real and intentional, not an
               oversight)
F3-BC-RULE-3 — On EDIT: value from the GET response — shown, read-only,
               never editable, never resubmitted on the UPDATE call
```

**F3 Localization Rules:**
```
F3-LOC-RULE-1 — No hardcoded message text — every message above is
                keyed by its RULE-SEC-ID (this module's Error Catalog
                substitute, per Adaptation Note)
F3-LOC-RULE-2 — nameAr/nameEn (Page), fullNameAr/fullNameEn (Profile):
                separate inputs, RTL/LTR aware
F3-LOC-RULE-3 — Locale detection: session preference → browser locale →
                default AR (module-wide convention, not SEC-specific)
```

**F3 Permission-Based Field Behavior:**
```
F3-SEC-RULE-1 — Field visibility/editability governed by SEC-FE's
                canView/canCreate/canEdit/canDelete flags (see Phase
                SEC-FE below) — canEdit=false disables all fields on
                every Entry form/Dialog/Drawer in this plan;
                canCreate=false hides every "New"/"+" entry point
```
---

<!-- PHASE:F3:END -->
<!-- PHASE:F4:START -->
# PHASE F4 — Frontend Routing & Component Structure (documented, v2.1)

**Governing note (see FINDING-002/003):** the default F4 template in
PROJECT-3-FRONTEND-ENGINE.md assumes React Router (URL routes,
`<ProtectedRoute>`, `React.lazy()` chunks per module, `useParams()`-driven
CREATE/EDIT/VIEW mode). The real, confirmed UI Shell uses none of that —
it uses a single `ScreenType` union in `useNavigationStore` and a `switch`
in `App.tsx`. Every F4-SCREEN block below documents the REAL structure
(screen-key based) instead. F4-RULE-1/2/7 (path slugs, code-splitting,
useParams-based mode resolution) do not apply to this Shell as written and
are not enforced below; F4-RULE-3 (every screen guarded), F4-RULE-4
(component naming), F4-RULE-6 (Facade Hook only, no direct query/mutation
in a page component), and F4-RULE-8 (import only what's used) still apply
and are checked per screen.

```
### F4-SCREEN — SCR-SEC-001 — Authentication & Self-Service
─────────────────────────────────────────────────────────────────
Shell status     : Already exists — `Login.tsx`, rendered by a dedicated
                    `if (!isAuthenticated)` branch in App.tsx, OUTSIDE the
                    ScreenType switch entirely (not a `currentScreen`
                    value at all — confirmed: `'login'` is not a member
                    of the ScreenType union). This is correct and
                    intentional: this screen has no navigation guard by
                    definition (SRS B1: "بلا حارس تنقّل").
Screen key       : n/a (pre-auth gate, not a ScreenType)
File             : src/pages/Login.tsx
Guard            : NONE — public, matches SRS B4 ("عام، بلا صلاحية")
Facade Hook      : useAuthFacade()
Components       :
  LoginPage (existing) — currently Login-only per PROJECT_SPEC_AND_
    AI_PROMPT.md's "already implemented" table; Signup/Activate/Forgot/
    Reset sub-forms are flagged as an ADDITION to this existing file per
    EXECUTION-PROMPT.md's own SCR-SEC-001 spec ("extend existing
    Login.tsx" — 5 linked forms, Tabs variant="underline" to switch
    Login/Create Account)
Shared UI imports: Input, Button, Tabs (per EXECUTION-PROMPT.md's own
  SCR-SEC-001 spec — not re-derived here, already the governed intent)
─────────────────────────────────────────────────────────────────

### F4-SCREEN — SCR-SEC-002 — User Management
─────────────────────────────────────────────────────────────────
Shell status     : Already exists
Screen key       : 'sec-users'
File             : src/pages/Security/Users.tsx  (exports `UsersPage`)
Guard            : ⚠ MISSING — integration gap (FINDING-004). No
                    component currently checks a PERM_* value before
                    rendering. Add a guard check at the top of
                    `UsersPage` (or at the Sidebar nav-item level, see
                    SEC-FE below) reading canView from the Facade Hook's
                    permission check — NOT a redesign of the routing
                    (there's no router to add a `<ProtectedRoute>` to),
                    just an added conditional render.
PERM_* required  : PERM_USER_VIEW / PERM_USER_CREATE / PERM_USER_UPDATE /
                    PERM_USER_DELETE (sourced from srs.md B4 — pre-bound
                    Permissions Matrix; per FINDING-005, backend
                    enforcement of these on the CRUD endpoints themselves
                    is unconfirmed in the real API docs — frontend gates
                    regardless, per SRS intent)
Facade Hook      : useUsersFacade()
COMPONENTS (single-file pattern — FINDING-003, not split into Search/
  Entry pages):
  UsersPage
    Path       : src/pages/Security/Users.tsx
    Renders    : search grid (Card + table + filter bar) AND the
                  create/edit Dialog, both driven by useSecurityStore's
                  `isUserDialogOpen` boolean — NOT two components on two
                  routes
    Facade Hook: useUsersFacade()
  UserProfileDrawer (existing, separate file, opened FROM UsersPage)
    Path       : src/components/features/UserProfileDrawer.tsx
    Opens for  : SCR-SEC-006 (see that block below)
  DataScopeDrawer (existing, separate file, opened FROM UsersPage)
    Path       : src/components/features/DataScopeDrawer.tsx
    Opens for  : SCR-SEC-007 (see that block below)
Shared UI imports: Breadcrumb, Dialog, EmptyState (confirmed from actual
  file), plus Button/Input/Select/Switch/Card/Stat/Badge per the
  standard layout hierarchy
─────────────────────────────────────────────────────────────────

### F4-SCREEN — SCR-SEC-003 — Role & RBAC Management
─────────────────────────────────────────────────────────────────
Shell status     : Already exists
Screen key       : 'sec-roles'
File             : src/pages/Security/Roles.tsx  (exports `RolesPage`)
Guard            : ⚠ MISSING — same integration gap as SCR-SEC-002
PERM_* required  : PERM_ROLE_VIEW / CREATE / UPDATE / DELETE
Facade Hook      : useRolesFacade()
COMPONENTS (single-file pattern):
  RolesPage
    Path       : src/pages/Security/Roles.tsx
    Renders    : search grid + create/edit Dialog with an EMBEDDED
                  permission-matrix sub-panel (Page × VIEW/CREATE/
                  UPDATE/DELETE checkboxes, confirmed at Roles.tsx:334+)
                  — no separate SCR-ID or route for the matrix (SRS B1:
                  "لا SCR-ID منفصل للمصفوفة")
    Facade Hook: useRolesFacade()
Shared UI imports: as confirmed in file (Dialog, Card, table, Switch,
  Button, Badge)
─────────────────────────────────────────────────────────────────

### F4-SCREEN — SCR-SEC-004 — Permission Registry
─────────────────────────────────────────────────────────────────
Shell status     : Already exists
Screen key       : 'sec-permissions'
File             : src/pages/Security/Permissions.tsx (exports
                    `PermissionsPage`)
Guard            : ⚠ MISSING — same gap
PERM_* required  : PERM_PERMISSION_VIEW / CREATE / UPDATE (no DELETE —
                    F1-SCREEN note)
Facade Hook      : usePermissionsFacade()
⚠ CORRECTION for this file specifically: `permissionType` filter/display
  currently includes a `'SYSTEM'` branch (Permissions.tsx lines ~209,
  ~282) — per F1-MODEL ENTITY-SEC-003 correction, remove the 'SYSTEM'
  case; a system-scoped permission is one with `pageCode == null`,
  shown via a derived Badge label, not a stored/selectable
  permissionType value.
─────────────────────────────────────────────────────────────────

### F4-SCREEN — SCR-SEC-005 — Page Registry
─────────────────────────────────────────────────────────────────
Shell status     : Already exists
Screen key       : 'sec-pages'
File             : src/pages/Security/Pages.tsx (exports
                    `PagesRegistryPage`)
Guard            : ⚠ MISSING — same gap
PERM_* required  : PERM_PAGE_VIEW / CREATE / UPDATE / DELETE (DELETE
                    permission gates the Deactivate action — SRS B2 note:
                    "استخدام موثَّق في الكود لتعطيل الشاشة")
Facade Hook      : usePagesFacade()
Not tree-bearing in the UI sense despite `parentId` being a real
  self-reference — SRS OQ-013 finalized this as a flat list (AG Grid in
  the AS-BUILT reference), so no TreeComponent applies here (F4 Gate
  Checklist's tree-entity rule is N/A for this screen — documented, not
  silently skipped)
─────────────────────────────────────────────────────────────────

### F4-SCREEN — SCR-SEC-006 — User Profile
─────────────────────────────────────────────────────────────────
Shell status     : Already exists
Screen key       : n/a — not an independent screen, a Drawer opened from
                    'sec-users' (matches F1-SCREEN: ENTRY only, no
                    independent Search view)
File             : src/components/features/UserProfileDrawer.tsx
Guard            : opened only from within UsersPage, which itself needs
                    the SCR-SEC-002 guard (above) — additionally gate the
                    "User Profile →" button itself on PERM_USER_PROFILE_
                    VIEW before it's even shown (⚠ MISSING today, same
                    FINDING-004 gap)
PERM_* required  : PERM_USER_PROFILE_VIEW / CREATE / UPDATE (no DELETE)
Facade Hook      : useUserProfileFacade(userId)
─────────────────────────────────────────────────────────────────

### F4-SCREEN — SCR-SEC-007 — Role Data Scope
─────────────────────────────────────────────────────────────────
Shell status     : Already exists
Screen key       : n/a — Drawer opened from 'sec-roles' (via "Branch
                    Data Scope →") AND from 'sec-users' (via "Data Scope
                    →" — confirmed at Users.tsx:305, opened with a null
                    scope from the Users screen too; per SRS B1, the
                    canonical entry point is SCR-SEC-003, but the Shell
                    also exposes it from Users — documented as-is, not a
                    contradiction: RULE-SEC-035/036 apply identically
                    regardless of entry point since both ultimately open
                    the same DataScopeDrawer)
File             : src/components/features/DataScopeDrawer.tsx
Guard            : reuses PERM_ROLE_* — no independent gate
PERM_* required  : PERM_ROLE_VIEW (view) / PERM_ROLE_UPDATE
                    (create/edit/delete — reused, no new permission,
                    per SRS B4)
Facade Hook      : useDataScopeFacade(roleId?)
─────────────────────────────────────────────────────────────────
```

**F4 Gate Checklist (self-check, adapted to this Shell's real architecture):**
```
[✓] Every SCR-ID has exactly one F4-SCREEN block (7/7)
[n/a] Tree-bearing entity check — Page's parentId is self-referencing but
      SRS OQ-013 finalized a flat (non-tree) UI — documented above, not
      silently skipped
[✗] Every route element wrapped in a guard — NONE currently are
      (FINDING-004). Flagged consistently across all 5 gated screens
      above (SCR-SEC-002/003/004/005/006 — SCR-SEC-007 is a Drawer
      reusing its parent's implicit gate, and SCR-SEC-001 is
      intentionally public). This is the plan's single largest
      integration gap — see SEC-FE phase for the exact fix shape.
[✓] Every PERM_* referenced above traces to srs.md B4 (the pre-bound
      Permissions Matrix) — none invented
[✓] Route-level components use existing, confirmed names (UsersPage,
      RolesPage, PermissionsPage, PagesRegistryPage) — Page suffix
      already present in the real Shell, not imposed by this plan
[n/a] PATTERN-1 Search/Entry as separate components — FINDING-003
      documents the real single-component-plus-Dialog pattern instead;
      not re-litigated per screen
[✓] EntryPage mode (CREATE/EDIT) resolution — resolved from
      `selectedUser`/`selectedRole`/etc. being null vs populated in
      Zustand state (the Shell's real equivalent of a route param —
      confirmed: `openUserDialog(user = null)` sets CREATE vs EDIT via
      this exact mechanism), not a URL param (no router — FINDING-002)
```
---

<!-- PHASE:F4:END -->
<!-- PHASE:SEC-FE:START -->
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

<!-- PHASE:SEC-FE:END -->
# PHASE TEST-FE — TC Coverage Matrix Summary (Frontend)

```
TC COVERAGE MATRIX SUMMARY (FRONTEND) — SECURITY — PLAN-ID: FE-SEC-001
══════════════════════════════════════════════════════════════════
NOTE: TC-IDs below are placeholders — assigned for real in
frontend-test-plan.md after Gate ALIGN-FE ✓ (this document only reserves
the sequence).

SCR-ID COVERAGE:
SCR-ID         │ Happy path UI TC     │ Rule violation TC       │ Status
───────────────┼──────────────────────┼──────────────────────────┼───────
SCR-SEC-001    │ TC-FE-SEC-001        │ TC-FE-SEC-002 (RULE-SEC- │ COVERED ✓
               │ (login success)      │ 050 rate-limit banner)  │
SCR-SEC-002    │ TC-FE-SEC-003        │ TC-FE-SEC-004 (RULE-SEC- │ COVERED ✓
               │ (search + create)    │ 049 duplicate username) │
SCR-SEC-003    │ TC-FE-SEC-005        │ TC-FE-SEC-006 (RULE-SEC- │ COVERED ✓
               │ (search + matrix     │ 048 duplicate roleCode) │
               │ edit)                │                          │
SCR-SEC-004    │ TC-FE-SEC-007        │ TC-FE-SEC-008 (RULE-SEC- │ COVERED ✓
               │ (search + create)    │ 043 invalid perm value) │
SCR-SEC-005    │ TC-FE-SEC-009        │ TC-FE-SEC-010 (RULE-SEC- │ COVERED ✓
               │ (search + create)    │ 046 duplicate pageCode) │
SCR-SEC-006    │ TC-FE-SEC-011        │ TC-FE-SEC-012 (RULE-SEC- │ COVERED ✓
               │ (open + save)        │ 034 inactive branch)    │
SCR-SEC-007    │ TC-FE-SEC-013        │ TC-FE-SEC-014 (RULE-SEC- │ COVERED ✓
               │ (open + save)        │ 036 duplicate pair)     │

MODULE INTEGRATION FLOW COVERAGE:
SEC lifecycle  │ TC-FE-SEC-015 (create role → search → verify appears)
               │ TC-FE-SEC-016 (update role → search → verify updated)
               │ TC-FE-SEC-017 (deactivate role → search → verify
               │                removed from active-only view, via
               │                FINDING-001's real toggle-active call)

══════════════════════════════════════════════════════════════════
Total: 17 TC-FE placeholders (7 SCR-IDs × 2 + 3 integration flow) —
within the 8–15 target guidance for a mid-complexity module on a
per-SCR-ID basis is naturally exceeded here since SEC has 7 screens
(more than the "typical" module this guidance was sized for); no
over-engineering trim applied since none of the 17 are duplicative
(each maps to a distinct RULE-ID or lifecycle step, per the
OVER-ENGINEERING GUARD's own "no duplicate RULE-ID coverage" test).
Gate rule: COVERED ✓ / PARTIAL ⚠ / GAP ✗ — all 7 SCR-IDs COVERED ✓,
no PARTIAL or GAP entries.
══════════════════════════════════════════════════════════════════
```

**Table — Operations Coverage (screen-key view, adapted from F4's route
view per FINDING-002 — there is no F4 Route column to populate, so this
column is replaced with the real screen key / component):**
```
Operation  │ API-ID       │ UI Action (SCR-ID)                │ Screen key / Component      │ TC-FE-ID      │ Status
───────────┼──────────────┼────────────────────────────────────┼──────────────────────────────┼───────────────┼───────
Create     │ API-SEC-009  │ SCR-SEC-002 "New" (Dialog)         │ sec-users / UsersPage        │ TC-FE-SEC-003 │ ✓
Search     │ API-SEC-010  │ SCR-SEC-002 filter bar              │ sec-users / UsersPage        │ TC-FE-SEC-003 │ ✓
Create     │ API-SEC-016  │ SCR-SEC-003 "New" (Dialog)         │ sec-roles / RolesPage        │ TC-FE-SEC-005 │ ✓
Toggle     │ API-SEC-021  │ SCR-SEC-003 Activate/Deactivate btn │ sec-roles / RolesPage        │ TC-FE-SEC-017 │ ✓
Create     │ API-SEC-027  │ SCR-SEC-004 "New" (Modal)          │ sec-permissions / Perms Page │ TC-FE-SEC-007 │ ✓
Create     │ API-SEC-030  │ SCR-SEC-005 "New" (Drawer)         │ sec-pages / PagesRegistryPage│ TC-FE-SEC-009 │ ✓
Update     │ API-SEC-041  │ SCR-SEC-006 Save (Drawer)          │ UserProfileDrawer            │ TC-FE-SEC-011 │ ✓
Create     │ API-SEC-042  │ SCR-SEC-007 "New" (Drawer)         │ DataScopeDrawer              │ TC-FE-SEC-013 │ ✓
```
A row missing its screen-key column while other columns are populated
would be a gap — none found; all 17 placeholder TCs above trace to a
real, confirmed screen-key/component pair.

---

<!-- PHASE:ALIGN-FE:START -->
# ALIGN-FE GATE — SECURITY — PLAN-ID: FE-SEC-001

```
═══════════════════════════════════════════════════════════════════════════
SCREEN STRUCTURE CHECKS                                     │ Status
──────────────────────────────────────────────────────────┼──────────────
All SCR-IDs from SRS appear in Screen Registry               │ ✓ (7/7)
Every SCR-ID has F1 model specification                      │ ✓ (7/7)
Every SCR-ID has F2 screen init specification                 │ ✓ (7/7)
Every SCR-ID has F2 facade specification                      │ ✓ (7/7)
Every SCR-ID has SEC-FE block defined                         │ ✓ (7/7)
Every SCR-ID has F4-SCREEN block defined                      │ ✓ (7/7)
Composite Screen UX separation declared for all entities      │ ⚠ DOCUMENTED
  (Search view ≠ Entry view — same SCR-ID per CORE-9)         │ DEVIATION —
                                                                │ FINDING-003:
                                                                │ Search+Entry
                                                                │ share ONE
                                                                │ component +
                                                                │ Dialog/Drawer
                                                                │ in the real
                                                                │ Shell, not
                                                                │ two separate
                                                                │ components.
                                                                │ Not
                                                                │ redesigned
                                                                │ per v2.1.
Every F1/F4 element traces to flow-diagram.md/ui-ux-spec.md   │ ✓ list — all
  or to srs.md B1-B4 directly — no untraceable UI decision    │ traced to SRS
                                                                │ B1-B5 or the
                                                                │ real Shell
                                                                │ code directly
──────────────────────────────────────────────────────────┼──────────────
LOV / LOOKUP CHECKS                                          │ Status
──────────────────────────────────────────────────────────┼──────────────
All LOV-IDs from SRS appear in LOV Registry                   │ ✓ (2/2:
                                                                │ LOV-SEC-001,
                                                                │ LOV-SEC-002)
Every LOV-ID has F2 LOV service method specification           │ ✓ — LOV-SEC-
                                                                │ 001 explicitly
                                                                │ documented as
                                                                │ NOT a runtime
                                                                │ call (hardcoded
                                                                │ enum, per SRS's
                                                                │ own documented
                                                                │ deviation)
No F1 model uses ENUM for LOV fields (all string)              │ ✓ — dataAccess-
                                                                │ Level, permission
                                                                │ Type both typed
                                                                │ string; the TS
                                                                │ union widened to
                                                                │ string in every
                                                                │ F1 correction
                                                                │ above
Every LOV F3 validator references runtime options              │ ✓ for LOV-SEC-002
                                                                │ (RULE-SEC-035);
                                                                │ LOV-SEC-001 has
                                                                │ no F3 validator
                                                                │ since it's a
                                                                │ hardcoded closed
                                                                │ set on a purely
                                                                │ optional field
                                                                │ (no REQUIRED/
                                                                │ LOV_VALID rule
                                                                │ exists for it in
                                                                │ SRS A4)
──────────────────────────────────────────────────────────┼──────────────
BUSINESS CODE CHECKS (frontend half)                          │ Status
──────────────────────────────────────────────────────────┼──────────────
Every master entity has Business Code field in F1              │ ⚠ N/A for 4 of
                                                                │ 6 entities —
                                                                │ SRS A3
                                                                │ documents NO
                                                                │ Business Code
                                                                │ on ANY Security
                                                                │ entity (module-
                                                                │ wide deviation,
                                                                │ not a plan gap)
                                                                │ — roleCode/
                                                                │ pageCode are the
                                                                │ closest analogs,
                                                                │ covered under
                                                                │ F3-BC-RULE-1..3
Business Code fields readonly where they exist (roleCode,      │ ✓ (EDIT mode
  pageCode)                                                    │ only, per F1)
Business Code shown read-only in F3 specs                      │ ✓
──────────────────────────────────────────────────────────┼──────────────
LOCALIZATION CHECKS (frontend half)                           │ Status
──────────────────────────────────────────────────────────┼──────────────
All F3 validators reference a message source (RULE-SEC-ID,     │ ✓ (all 15 F3
  per this plan's Adaptation Note substituting for ERR-ID)      │ blocks carry
                                                                │ exact AR/EN)
──────────────────────────────────────────────────────────┼──────────────
SECURITY CHECKS (frontend half)                               │ Status
──────────────────────────────────────────────────────────┼──────────────
Every SCR-ID has SEC-FE block                                  │ ✓ (7/7)
Every PERM_* in F4 also appears in SEC-BE's Permissions        │ ✓ — every
  Matrix for the same SCR-ID — no F4-only permission names     │ PERM_* used
                                                                │ traces to srs.md
                                                                │ B4's Permissions
                                                                │ Summary table;
                                                                │ none invented
──────────────────────────────────────────────────────────┼──────────────
TEST-FE COVERAGE CHECKS (Summary validation)                   │ Status
──────────────────────────────────────────────────────────┼──────────────
TC Coverage Matrix Summary (frontend) present                  │ ✓
No GAP ✗ entries in SCR-ID coverage without DEFERRED            │ ✓ (0 GAP, 0
                                                                │ PARTIAL)
═══════════════════════════════════════════════════════════════════════════
ALIGN-FE GATE RESULT: PASSED ✓
  (2 items marked ⚠ DOCUMENTED DEVIATION / N/A above are intentional,
  SRS-confirmed, real-Shell-confirmed facts about this module — not
  plan defects. They are carried forward exactly as v2.1 requires:
  documented, not silently absorbed, not blocking.)
Auto-correction applied: FINDING-001 (role activate/deactivate endpoint),
  6 F1 model shape/type corrections (User.id, Role.id, Permission.id,
  Page.id, DataScope composite key + LOV codes, RolePermission shape)
Findings requiring product/architect input (raised, not resolved here):
  OQ-FE-SEC-001 — User create/edit dialog collects `email` but no real
    endpoint persists it (F1-SCREEN SCR-SEC-002)
  OQ-FE-SEC-002 — DataScope edit form's isActiveFl Switch has no real
    field to submit to on the Update endpoint (F2-QUERY API-SEC-046)
```

---

<!-- PHASE:ALIGN-FE:END -->
# SECTION D — Agent Handoff Summary (Frontend)

## What the agent receives
```
✓ This file — frontend-execution-plan.md (SECURITY) — complete spec
✓ srs-SECURITY.md — functional requirements
✓ Real API Docs (8 files, 31 SEC endpoints + 2 menu endpoints)
✓ flow-diagram.md + ui-ux-spec.md (dashboard.zip/docs)
✓ Real UI Shell (dashboard.zip/src) — the actual code this plan
  documents and corrects
✓ FINDINGS LOG above — 5 findings, 2 open OQs — read before touching
  Roles.tsx (FINDING-001), Users.tsx (OQ-FE-SEC-001), or any
  permission-gating work (FINDING-004/005)
```

## Reading order
```
1. FINDINGS LOG (fixes/gaps that cut across every phase)
2. PHASE F1 — corrected TypeScript models (apply these type/shape fixes
   to mockData.ts and useSecurityStore.ts first — several F2/F3/F4
   blocks assume the corrected shapes, not the current ones)
3. PHASE F2 — service contracts + Facade Hook state (this is what
   actually replaces the mock Zustand actions with real API calls)
4. PHASE F3 — validation rules (Zod schemas + React Hook Form wiring)
5. PHASE F4 — confirmed component structure + the guard-integration gap
6. PHASE SEC-FE — permission-gating behavior (depends on the
   useAuthStore.permissions addition specified in F1's Session model)
7. SECTION TEST-FE — coverage summary only; full TC blocks come later
   in frontend-test-plan.md (separate file, generated after this plan
   is approved)
```

## Frontend Plan Completeness Self-Check
```
[✓] Every SCR-ID has F1 model spec (7/7)
[✓] Every SCR-ID has F2-SCREEN-INIT spec (7/7)
[✓] Every SCR-ID has F2-FACADE spec (7/7)
[✓] Every API-ID has F2-SERVICE spec matching a REAL endpoint (31/31 SEC
    endpoints + 2/2 menu endpoints = 33/33; FINDING-001 documents where
    the SRS's own API-ID↔endpoint mapping needed correcting)
[✓] Every LOV-ID has F2-LOV-SERVICE spec (2/2, one explicitly marked
    "not a runtime call" per its documented deviation)
[✓] Facade state: currentPage/pageSize declared as derived, never
    separate state (every F2-QUERY search/list block)
[✓] Error routing declared once, referenced everywhere (F2 header table)
[✓] Pre-deactivation/delete usage check declared for both entities that
    have one (Role — RULE-SEC-048, User — RULE-SEC-049); explicitly
    noted where NO such check exists (Page deactivate, DataScope delete)
[✓] Every F3 RULE-ID with a user-facing message is bound (15/24
    RULE-SEC-IDs relevant to this module carry an F3 block; the other 9
    are internal/architectural per SRS A4 and listed as such, not
    silently omitted)
[✓] Every SCR-ID has F4-SCREEN block (7/7), documented against the REAL
    Shell architecture (FINDING-002/003), not an invented React-Router
    structure
[n/a] Tree-bearing entity / /tree route ordering — no tree UI in this
    module (SRS OQ-013 final) — explicitly N/A, not skipped silently
[✓] All PERM_* codes sourced from SEC-BE's Permissions Matrix (srs.md
    B4) — none invented in F4/SEC-FE

CROSS-CUTTING CHECKS:
[✓] TC Coverage Matrix Summary (frontend) present in TEST-FE section
[✓] Derivation Log — every non-obvious inference carries its source
    inline (F1/F2/F4 blocks cite the exact SRS rule/API doc line or
    Shell file/line backing each correction)
[✓] ALIGN-FE gate passed ✓ (see above)
```

---
*End of frontend-execution-plan.md — SECURITY — PLAN-ID: FE-SEC-001*
*Next: frontend-test-plan.md (SECURITY) may be generated on request, now
that ALIGN-FE ✓ is confirmed — full TC-FE-SEC-001..017 Given/When/Then
blocks, per Section 12 of PROJECT-3-FRONTEND-ENGINE.md.*
*Companion: frontend-execution-plan.md (NOTIFICATION) — queued next per
this session's confirmed scope ("Both — Security first").*
