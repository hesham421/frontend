<!-- Source: PHASE:F1 / PREAMBLE (before first SUB) -->

## PHASE F1 — Frontend Model Specifications

```
CONTRACT-12 v2.1 role for F1 on this module: CONFIRM the Shell's existing
TypeScript models against the real API DTOs (srs.md entity tables +
api-doc-generator output). Correct genuine mismatches. Never invent a
model the Shell doesn't already have and no screen needs. Every
correction below is sourced to a specific real field in a specific
endpoint doc or srs.md entity table — none are speculative.

Field-naming baseline (confirmed from srs.md + real DTOs, this session):
  ENTITY-SEC-001 (User)          -> `enabled`      (standard-shaped, matches Shell)
  ENTITY-SEC-002 (Role)          -> `active`/IS_ACTIVE  (PERMANENT EXCEPTION)
  ENTITY-SEC-004 (Page)          -> `active`            (PERMANENT EXCEPTION)
  ENTITY-SEC-009 (SecUserProfile)-> `isActiveFl`   (standard naming — NOT an exception)
  ENTITY-SEC-010 (SecRoleBranch) -> `isActiveFl`   (standard naming — NOT an exception)
All entity `id` fields are BIGINT (number) on the wire; the Shell
currently types every `id`/`*Id` field as `string`. This plan does not
force a wholesale type-widening op across every field below individually
— it is called out once here and only re-flagged per entity where the
PK shape itself changes (composite keys, shared keys).
```

### F1-MODEL — ENTITY-SEC-001 — UserAccount

```
Shell model  (mockData.ts AppUser)
  id: string; username: string; email: string; enabled: boolean;
  roles: string[] (Role IDs); profile?: UserProfile

Real API model (UserDto — usermanagement.md, authentication.md)
  id: number; username: string; email: string; enabled: boolean;
  roles: string[]; permissions: string[];
  createdAt, createdBy, updatedAt, updatedBy

CORRECTIONS REQUIRED (F1, applied in this plan):
1. id: number, not string (BIGINT on the wire).
2. roles is an array of role NAME strings (e.g. "ADMIN"), NOT role IDs.
   Confirmed by GET /api/users/{userId}/roles ("Returns list of role
   names") and PUT /api/users/{userId}/roles (body: roleNames: string[]).
   The Shell's inline comment "(Role IDs)" is incorrect and is corrected
   here — assigning roles must send role NAMES, never numeric IDs.
3. `profile` is NOT embedded on UserDto. It does not exist as a nested
   object anywhere in the real API. It is a separate resource
   (SecUserProfileDto, ENTITY-SEC-009) fetched by userId via its own
   5 endpoints. The Shell model's optional nested `profile` field is
   removed; SCR-SEC-002/SCR-SEC-006 must join it client-side (F2 concern).
4. `permissions: string[]` exists on the real DTO with no Shell
   counterpart — added as an optional field (flattened permissions
   across the user's roles; available for future client-side gating,
   not required by any confirmed screen today).
5. Audit fields (createdAt/createdBy/updatedAt/updatedBy) exist on the
   real DTO with no Shell counterpart — added as optional, display-only.
6. POST /api/users (CreateUserRequest) accepts ONLY username + password.
   No email, no roleNames, no enabled at creation. A new user cannot be
   given an email, role, or explicit enabled state at creation time via
   the API — those require a follow-up PUT /api/users/{userId}.
7. PUT /api/users/{userId} (UpdateUserRequest) accepts username,
   password, enabled, roleNames — all optional. There is still no
   `email` field on this or any other write endpoint (see OQ-SEC-FE-002).

GOVERNANCE NOTE — svc-notification seed row: a non-human service-account
user row exists in production data (username 'svc-notification', zero
roles by design, RULE-SEC-053). It is not distinguished from a normal
user anywhere in the real API and will appear as an ordinary row in
SCR-SEC-002. This plan does not add special-case UI for it — AS-IS,
documented, no invention (HR-1).

OQ-SEC-FE-002 (NEW, this session): srs.md B2 (SCR-SEC-002 field table,
line 1052) and ui-ux-spec.md both call for an editable `email` field on
the Users Create/Edit dialog. No real endpoint (POST /api/users, PUT
/api/users/{userId}, or any other) exposes an email write path anywhere
in the 50-endpoint API surface. UserDto.email is read-only from the
API's perspective. This plan does not invent a workaround. Resolution
deferred to product/backend; F3 (validation) renders this field
disabled/read-only pending that decision rather than silently allowing
a save that the backend would ignore.
```

### F1-MODEL — ENTITY-SEC-002 — Role

```
Shell model (mockData.ts AppRole + RolePermission)
  AppRole: id: string; roleCode: string (read-only after first save);
    roleName: string; description: string; isActive: boolean;
    permissions: RolePermission[]
  RolePermission: pageId: string; canView: boolean; canCreate: boolean;
    canUpdate: boolean; canDelete: boolean

Real API model (RoleDto — roleaccesscontrol.md)
  id: number; roleCode: string; roleName: string; description: string;
  active: boolean; createdAt, createdBy, updatedAt, updatedBy
  -- NO embedded permissions/pages array of any kind.

Real page-permission matrix (separate resource, RolePagesMatrixResponse
via GET/PUT /api/roles/{roleId}/pages)
  roleId: number; roleName: string;
  assignments: [{ pageCode: string; pageName: string; pageNameAr: string;
    permissions: string[] (subset of 'CREATE'|'UPDATE'|'DELETE';
    VIEW is implicit and never appears in this array) }]

CORRECTIONS REQUIRED (F1, applied in this plan):
1. `isActive` -> `active` (PERMANENT EXCEPTION naming, IS_ACTIVE column).
2. `permissions` is REMOVED from the Role model entirely. It is not
   part of RoleDto. It is fetched/saved as its own resource, keyed by
   roleId, via GET/PUT /api/roles/{roleId}/pages (full-replace),
   POST /api/roles/{roleId}/pages (add one), and
   DELETE /api/roles/{roleId}/pages/{pageCode} (remove one).
3. RolePermission's shape is corrected to match PageAssignmentResponse:
   - keyed by `pageCode` (string business code, e.g. "USER"), NOT
     `pageId`. The Shell's per-row key must change accordingly.
   - permission flags are NOT four independent booleans. The real shape
     is `permissions: string[]` containing only 'CREATE'/'UPDATE'/
     'DELETE'. VIEW is auto-granted the instant a page is assigned to a
     role (RULE-SEC-042, confirmed in both PUT and POST docs: "VIEW is
     ALWAYS added automatically") and cannot be independently toggled
     off. srs.md B2 (SCR-SEC-003, line 1166) confirms this same rule
     from the SRS side ("VIEW تلقائية عند إضافة صفحة"). The permission
     matrix UI's "View" column must render checked+disabled, not as a
     normal checkbox; canCreate/canUpdate/canDelete map to presence/
     absence of the corresponding string in the `permissions` array.
4. id: number, not string.
CONFIRMED, NO CORRECTION:
5. "Sync all" Shell action -> PUT /api/roles/{roleId}/pages (full
   replace). "Copy from another role" Shell action ->
   POST /api/roles/{roleId}/copy-from/{sourceRoleId}. Both map exactly.
6. Activate/Deactivate are two separate endpoints (PUT .../activate,
   PUT .../deactivate) — matches the Shell's single confirm dialog
   driving two distinct actions; srs.md itself notes this was "two
   separate paths — corrected 2026-08-23" on the backend side. No
   further correction needed.
7. roleCode is real-API-enforced read-only after creation
   (UpdateRoleRequest has no roleCode field at all) — matches Shell's
   own "read-only after first save" comment exactly.
```

### F1-MODEL — ENTITY-SEC-003 — Permission

```
Shell model (mockData.ts AppPermission)
  id: string; name: string; permissionType: 'VIEW'|'CREATE'|'UPDATE'|
  'DELETE'|'SYSTEM'; pageId?: string; module: string

Real API model (PermissionDto — permissionmanagement.md)
  id: number; name: string; description: string; pageId: number|null;
  pageCode: string|null; permissionType: string
  (documented values: VIEW, CREATE, UPDATE, DELETE — no SYSTEM value
  anywhere in the real API or in LOV-SEC-001)

CORRECTIONS REQUIRED (F1, applied in this plan):
1. `module` has NO basis on PermissionDto — module is a Page-level
   field (ENTITY-SEC-004), not a Permission-level one. Removed from the
   Shell model as a bound field. srs.md B2 (SCR-SEC-004, line 1263)
   confirms the screen's module filter is an INDIRECT filter — "فلتر
   غير مباشر — موثَّق في API-SEC-028 فقط" — i.e. POST /api/permissions
   /search (API-SEC-028) accepts `module` as an allowed filter field
   even though it is not a column on PermissionDto (the search resolves
   it via the related Page). This is a real, confirmed AS-IS backend
   behavior, not a fabrication: keep the filter-bar UI, do not bind
   `module` as a display column or a create/edit form field.
2. permissionType's `'SYSTEM'` value is removed from the TS union — no
   real API value or LOV-SEC-001 entry supports it. The real meaning
   the Shell was reaching for ("a permission with no associated page")
   is represented by `permissionType` (and `pageId`/`pageCode`) being
   `null`, not by a literal 'SYSTEM' string. Corrected union:
   `'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | null`.
3. `pageId` becomes `number | null`; real DTO also carries a redundant
   `pageCode: string | null` for the same relation — Shell should treat
   pageCode as the canonical join key when cross-referencing
   ENTITY-SEC-004, consistent with the pageCode-keyed Role-Pages-Matrix.
4. Real DTO carries a `description: string` field with no Shell
   counterpart — added as optional; shell-manifest's create/edit dialog
   (name, type, module, associated screen) does not currently surface
   it — available-but-unused, not required to add to F3 unless product
   asks.
CONFIRMED, NO CORRECTION:
5. No individual GET or DELETE endpoint exists for Permission at all
   (only PUT, POST, search) — matches the Shell's own in-code comment
   "No Delete button per spec" exactly.
```

### F1-MODEL — ENTITY-SEC-004 — Page

```
Shell model (mockData.ts AppScreen)
  id: string; pageCode: string; nameEn: string; nameAr: string;
  module: 'SEC'|'ORG'|'FILE'|'NOTIF'|'FIN'|'HR'|'INV'; route: string;
  icon?: string; parentId?: string; displayOrder?: number;
  description?: string; isActive: boolean

Real API model (PageResponse — pagemanagement.md)
  id: number; pageCode: string; nameAr: string; nameEn: string;
  route: string; icon: string; module: string; parentId: number|null;
  displayOrder: number; active: boolean; description: string;
  permissionKeys: object; createdAt, createdBy, updatedAt, updatedBy

CORRECTIONS REQUIRED (F1, applied in this plan):
1. `isActive` -> `active` (PERMANENT EXCEPTION naming; ENTITY-SEC-002
   carries the same exception, ENTITY-SEC-004 does too per this table).
2. `module` is a free VARCHAR(50) on the wire, confirmed by srs.md
   ("تصنيفي نصّي... وليس FK حقيقياً" — categorical text, not a real
   FK). The Shell's closed TS union is a reasonable frontend narrowing
   (it matches the module codes actually seeded) but is NOT enforced by
   the backend — a value outside the union would not be rejected
   server-side. Documented here as a frontend-only convention, not a
   real contract constraint, so F4/F3 do not present it as validated.
3. `permissionKeys: object` (the four auto-generated permission-name
   keys for this page) has no Shell counterpart — added as optional,
   read-only. Useful for F2 facades that need a page's own permission
   names without a second lookup; not required by any confirmed screen.
4. Audit fields (createdAt/createdBy/updatedAt/updatedBy) added as
   optional, display-only (same pattern as ENTITY-SEC-001/002).
5. id / parentId: number, not string.
CONFIRMED, NO CORRECTION:
6. SCR-SEC-005 renders this as a FLAT table, not a tree, despite
   `parentId` existing on the model — matches the Shell's own in-code
   comment "per OQ-013". This plan does not add tree-rendering; the
   flat presentation is documented AS-IS (HR-1).
7. **Carried forward for F4 (routing decision, not resolved here):**
   `route` is real, required, unique (UK_PAGES_ROUTE), and regex-
   validated (^/[a-zA-Z0-9/_-]+$) server-side — but the Shell's actual
   navigation (App.tsx switch/Zustand, see 0.2.1/shell-manifest) never
   reads it. Both sides are independently confirmed real; this is a
   genuine architecture mismatch, not a documentation error. F4 must
   surface this as an explicit decision point rather than silently
   wiring `route` into navigation or silently dropping it from forms.
```

### F1-MODEL — ENTITY-SEC-009 — SecUserProfile

```
Shell model (mockData.ts UserProfile, nested under AppUser.profile)
  fullNameAr: string; fullNameEn: string; branchId: string;
  preferredLang: 'ar'|'en'; employeeId: string; isActive: boolean

Real API model (SecUserProfileDto — securitydatascopeuserprofiles.md)
  userIdFk: number (PK, shared with USERS via @MapsId — no separate id);
  branchIdFk: number; fullNameAr: string; fullNameEn: string;
  preferredLang: string; employeeIdFk: number|null; isActiveFl: boolean;
  createdAt, createdBy, updatedAt, updatedBy

CORRECTIONS REQUIRED (F1, applied in this plan):
1. NOT embedded on User (repeated from ENTITY-SEC-001 correction #3) —
   fetched/created/updated via its own 5 endpoints keyed by userId.
2. PK is `userIdFk`, not a generic `id` — this entity's primary key IS
   the shared FK to USERS (@MapsId, not independently generated). There
   is no separate identity column.
3. `branchId` -> `branchIdFk`, numeric not string.
4. `preferredLang` is genuinely free-text VARCHAR(10), NOT a closed
   'ar'|'en' union. srs.md is explicit and final on this: "نص حر بقرار
   نهائي — OQ-001 CLOSED" (Architect, 2026-07-22) — it will never become
   an LOV. F1 widens the wire type to `string`. F3 MAY still constrain
   the *input control* to ar/en as a pure UX choice, but that must be
   documented as a frontend design decision, not presented as a backend
   contract — the backend accepts any string up to 10 chars.
5. `employeeId` -> `employeeIdFk`, numeric (BIGINT) not string. Per
   srs.md OQ-002 CLOSED (final decision): permanently unconstrained —
   no FK validation exists or should be assumed client-side (no HR
   module is governed yet). Treat as an optional free numeric field.
6. `isActive` -> `isActiveFl`. Confirmed this entity DOES use the
   standard naming convention — srs.md explicitly notes this is NOT
   part of the SECURITY core's permanent naming exception.
CONFIRMED, NO CORRECTION:
7. `branchIdFk` options are cross-module (OrgBranchClient, XM-SEC-001,
   MODE 1.5) — the Shell already sources branch options from
   `useOrganizationStore`, which is the correct integration point once
   real data lands. No correction, noted for F2/F4 awareness.
```

### F1-MODEL — ENTITY-SEC-010 — SecRoleBranch

```
Shell model (mockData.ts DataScope)
  id: string; roleId: string; branchId: string;
  dataAccessLevel: 'BRANCH'|'CHILDREN'|'ALL'; isActive: boolean

Real API model (SecRoleBranchDto — securitydatascoperolebranches.md)
  roleIdFk: number (PK part 1); branchIdFk: number (PK part 2);
  dataAccessLevel: string (LOV-SEC-002); isActiveFl: boolean;
  createdAt, createdBy, updatedAt, updatedBy

CORRECTIONS REQUIRED (F1, applied in this plan):
1. **No `id` field exists.** The real entity has a COMPOSITE primary
   key (roleIdFk + branchIdFk together) — there is no synthetic single
   identity column anywhere on this entity, confirmed across all 6
   endpoints (all keyed by {roleId}/{branchId} path pairs, never a
   single id). The Shell's `id: string` field is removed. React list
   keys, TanStack Query cache keys, and every mutation (GET/PUT/DELETE
   /api/v1/security/role-branches/{roleId}/{branchId}) must use the
   composite (roleIdFk, branchIdFk) pair, never a synthetic id.
2. `roleId`/`branchId` -> `roleIdFk`/`branchIdFk`, numeric not string.
3. **`dataAccessLevel` enum values do not match and would break every
   save.** Shell declares `'BRANCH' | 'CHILDREN' | 'ALL'`. The real,
   seeded LOV-SEC-002 codes — confirmed identically in every request/
   response example across all 6 endpoints in
   securitydatascoperolebranches.md — are
   `'BRANCH_ONLY' | 'BRANCH_AND_CHILDREN' | 'ALL'`. Sending the Shell's
   current values would fail MasterDataLookupClient validation
   (RULE-SEC-035) on every create/update. Corrected here directly
   (unambiguous fix, no OQ needed): the TS union becomes
   `'BRANCH_ONLY' | 'BRANCH_AND_CHILDREN' | 'ALL'`, and the select
   options' underlying values (not necessarily their display labels)
   must change to match.
4. `isActive` -> `isActiveFl`. Confirmed standard naming (same as
   ENTITY-SEC-009 — not part of the SECURITY core's permanent
   exception).
CONFIRMED, NO CORRECTION:
5. `branchIdFk` is a cross-module SHARED-consumer reference to
   ORG_BRANCH (XM-SEC-002, MODE 1.5) — Shell already sources branch
   options from `useOrganizationStore`. No correction.
6. DELETE .../{roleId}/{branchId} exists and matches the Shell's
   "conditional delete button" in DataScopeDrawer exactly.
```

---