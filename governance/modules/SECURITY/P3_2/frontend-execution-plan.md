<!-- ═══════════════════════════════════════════════════════════ -->
<!-- frontend-execution-plan.md — SECURITY                       -->
<!-- Governed by: PROJECT-3-FRONTEND-ENGINE.md (Project 3.2, PASS 2) -->
<!-- Companion  : PROJECT-3-REGISTRY.md, SHARED-GOVERNANCE-CORE.md, -->
<!--              SHARED-GOVERNANCE-RULES.md, SHARED-ARTIFACT-CONTRACTS.md -->
<!-- ═══════════════════════════════════════════════════════════ -->

# frontend-execution-plan.md — SECURITY
## PLAN-SEC-FE-001 — Project 3.2, PASS 2, Stage 1

```
Module          : Security & Access Control (SEC prefix)
Plan tracking ID: PLAN-SEC-FE-001
                  ⚠ PLAN-ID is formally a Project 3.1 (Backend PASS 1)
                  namespace (PROJECT-3-REGISTRY.md Sec.4). No P3.1
                  backend-execution-plan.md was ever generated for this
                  module — SECURITY is a registry-declared EXCEPTION
                  module (srs.md header, module-registry-SECURITY.md,
                  platform-standards.md M.A.4): it was implemented
                  directly (Layer 4.1) without the forward P0→P1→P2→P3.1
                  pipeline, then reverse-documented. This tracking ID is
                  issued by this engine (P3.2) only for cross-reference
                  inside this artifact — it is not a claim on the
                  PLAN-ID namespace.
DB_TARGET       : POSTGRESQL_16 (srs.md A1 — confirmed independently by
                  master-registry.md system-wide PG migration note)
Truth Layer     : Layer 3.2 — Frontend Execution Truth (CORE-1)
Status          : DRAFT — pending ALIGN-FE
Open Questions  : 0 blocking this plan / 3 informational carryovers
                  (OQ-014, OQ-015, OQ-016 — none SEC-frontend-blocking)
                  / 3 new session-local OQs (OQ-SEC-FE-001..003, none
                  blocking — see Section 0.4) — see srs.md OQ Log
                  (canonical) for the carryovers
```

---

## 0.1 — GATE: BACKEND MODULE COMPLETE (CONTRACT-12 §1 — evaluated first)

```
╔══════════════════════════════════════════════════════════════════╗
║        GATE: BACKEND MODULE COMPLETE (must PASS before PASS 2)   ║
╠════════════════════════════════╦═════════════════════════════════╣
║ Backend 100% implemented       ║ Yes — EXCEPTION module, already   ║
║ (whole module, no partial)     ║ live in production (erp-security, ║
║                                 ║ srs.md A2 "الوضع الحالي"). Not a  ║
║                                 ║ partial/in-progress build.        ║
║ Real API Docs attached          ║ Yes — 9 auto-generated API-doc    ║
║ (from api-doc-generator)        ║ files (index.md + 8 endpoint      ║
║                                 ║ groups), header "AUTO-GENERATED   ║
║                                 ║ by api-doc-generator — do not     ║
║                                 ║ edit manually" on each. 50/50     ║
║                                 ║ endpoints present (see 0.1.1).    ║
║ flow-diagram.md attached        ║ Yes — v2.0, header "Status:       ║
║ (Project 2.5, human-approved)  ║ RECONCILED — Reconciliation Gate  ║
║                                 ║ ✓ (PRD + SRS present for all      ║
║                                 ║ modules)"                         ║
║ ui-ux-spec.md attached          ║ Yes — v2.0, header "Status:       ║
║ (Project 2.5, human-approved)  ║ RECONCILED — Reconciliation Gate  ║
║                                 ║ ✓". Open Questions: OQ-ORG-002    ║
║                                 ║ only — scoped to ORG module       ║
║                                 ║ (SCR-ORG-008), does not touch     ║
║                                 ║ SECURITY.                         ║
╠══════════════════════════════════════════════════════════════════╣
║ SWAGGER ↔ SRS RECONCILIATION (0.1.1 below)                        ║
╠══════════════════════════════════════════════════════════════════╣
║ GATE RESULT: PASSED ✓                                              ║
╚══════════════════════════════════════════════════════════════════╝
```

### 0.1.1 — Swagger ↔ SRS Reconciliation

```
srs.md B5 declares API-SEC-001 through API-SEC-050 (50 API-IDs,
across SCR-SEC-001..007 + the standalone Menu block) — count verified
by direct tally against every B5 table in srs.md.

Real API Docs (api-doc-generator output) declare 50 endpoints, tallied
across the 8 endpoint-group files:
  authentication.md                    8   (API-SEC-001..008)
  usermanagement.md                    7   (API-SEC-009..015)
  roleaccesscontrol.md                12   (API-SEC-016..026, 050)
  permissionmanagement.md              3   (API-SEC-027..029)
  pagemanagement.md                    7   (API-SEC-030..036)
  securitydatascopeuserprofiles.md     5   (API-SEC-037..041)
  securitydatascoperolebranches.md     6   (API-SEC-042..047)
  menumanagement.md                    2   (API-SEC-048..049)
  ──────────────────────────────────────
  TOTAL                               50

Result: 50/50 matched — every API-ID in srs.md B5 has a matching real
endpoint (method + path identical); every real endpoint has a
corresponding API-ID. No orphan endpoint, no missing API-ID.
No DRV-ID or OQ required from this reconciliation.
```

---

## 0.2 — GATE: UI SHELL COMPLETE (CONTRACT-12 §2, v2.1 — evaluated second)

```
╔══════════════════════════════════════════════════════════════════╗
║        GATE: UI SHELL COMPLETE (must PASS before PASS 2)         ║
╠════════════════════════════════╦═════════════════════════════════╣
║ UI Shell implemented           ║ Yes, for SCR-SEC-002/003/004/005  ║
║ (Claude Code, real React       ║ — shell-manifest-SECURITY.md      ║
║ components + routing +         ║ documents real, existing files:  ║
║ styling — no data binding yet) ║ Users.tsx, Roles.tsx,             ║
║                                 ║ Permissions.tsx, Pages.tsx, plus  ║
║                                 ║ shared UserProfileDrawer.tsx /    ║
║                                 ║ DataScopeDrawer.tsx (used as      ║
║                                 ║ SCR-SEC-006 / SCR-SEC-007). All   ║
║                                 ║ mock/local-state only (no API     ║
║                                 ║ calls) — consistent with "no data ║
║                                 ║ binding yet."                     ║
║                                 ║ ⚠ SCR-SEC-001 (Auth) NOT covered  ║
║                                 ║ — see 0.2.1 below.                ║
║ Visual fidelity to approved    ║ Yes, for the manifest's scope —   ║
║ mockups confirmed by human     ║ shell-manifest-SECURITY.md header ║
║ review                         ║ states "confirmed verbally by     ║
║                                 ║ user in this session" (no         ║
║                                 ║ execution-state.json exists to    ║
║                                 ║ check programmatically — governance║
║                                 ║ tracking data for SECURITY was    ║
║                                 ║ removed in commit 29f8587).        ║
╠══════════════════════════════════════════════════════════════════╣
║ GATE RESULT: PASSED ✓ — WITH A DOCUMENTED SCOPE GAP (0.2.1)       ║
╚══════════════════════════════════════════════════════════════════╝
```

### 0.2.1 — SCR-SEC-001 (Authentication) Shell status — flagged, not assumed

```
⚠ shell-manifest-SECURITY.md declares its own scope explicitly:
  "Source: src/pages/Security/ (+ shared components in
  src/components/features/ used exclusively by this module)"
This scope does NOT include src/pages/Login.tsx. ui-ux-spec.md
(SCR-SEC-001) separately notes: "File: src/pages/Login.tsx (already
exists — extend, do not replace)" — but its current implementation
state (which of the 5 sub-forms — Login/Signup/Activate/Forgot/Reset —
already exist, and whether they visually match the approved mockup)
is NOT confirmed by any artifact in this session.

Per HR-1 (No Invention Beyond Source Artifacts), this plan does NOT
assume Login.tsx's shell state. SCR-SEC-001's F1/F4 blocks below are
built from flow-diagram.md/ui-ux-spec.md design intent — the CONTRACT-12
fallback explicitly permitted "if the Shell itself is ambiguous" —
and are marked "Shell status: UNCONFIRMED" throughout, never "Already
implemented." This is raised as OQ-SEC-FE-001 (new, this session) —
see Section 0.4.

This does not fail GATE: UI SHELL COMPLETE for the module as a whole:
CONTRACT-12 gates on the module's implementation being complete and
approved, which is true for SCR-SEC-002/003/004/005/006/007 (6 of 7
screens, all confirmed). SCR-SEC-001 proceeds under the documented
fallback rather than blocking the other six screens' planning.
```

---

## 0.3 — PASS 2 Entry Gate (Section 2.1)

```
╔══════════════════════════════════════════════════════════════════╗
║                  PASS 2 (FRONTEND) — ENTRY GATE                  ║
╠════════════════════════════════╦═════════════════════════════════╣
║ SRS attached + feature code?   ║ Yes — srs.md, Feature Code SEC-001║
║ Real API Docs attached          ║ Yes — 50/50 reconciled (0.1.1)   ║
║ flow-diagram.md + ui-ux-spec.md ║ Yes — both RECONCILED ✓          ║
║ Real UI Shell code accessible   ║ Yes, 6/7 screens (0.2.1 notes    ║
║ (v2.1)                          ║ SCR-SEC-001 gap)                 ║
║ Registry loaded, no conflicts? ║ N/A this session — no             ║
║                                 ║ master-registry.md/MGI uploaded;  ║
║                                 ║ proceeding on srs.md's own        ║
║                                 ║ embedded registry reconciliation  ║
║                                 ║ (srs.md "MASTER-REGISTRY           ║
║                                 ║ ALIGNMENT REVIEW" block, dated    ║
║                                 ║ 2026-07-22) as the best-available ║
║                                 ║ record — GOVERNANCE state carried ║
║                                 ║ forward, not silently assumed     ║
║                                 ║ clean.                            ║
╠══════════════════════════════════════════════════════════════════╣
║ Extracted: 7 screens (SCR-SEC-001..007), 50 real endpoints,       ║
║ 1 runtime LOV (LOV-SEC-002) + 1 hardcoded-enum pseudo-LOV          ║
║ (LOV-SEC-001, documented deviation, no API), 0 blocking OQs,       ║
║ 3 informational OQ carryovers (0.4), 1 new session OQ (0.2.1)      ║
╠══════════════════════════════════════════════════════════════════╣
║ PROCEED: Yes                                                       ║
╚══════════════════════════════════════════════════════════════════╝
```

## 0.4 — Open Questions carried into this plan (reference only — canonical log is srs.md)

```
Open Questions: 4 total referenced / 0 blocking F1-F4 generation
  OQ-014 (srs.md) — no periodic cleanup job for PASSWORD_RESET_TOKEN /
    ACCOUNT_ACTIVATION_TOKEN. Backend/ops concern — no frontend impact.
  OQ-015 (srs.md) — JWT allowedBranches[] claim (RULE-SEC-037) is
    issued but NEVER consumed anywhere in the backend to restrict data
    access. FRONTEND IMPACT: SCR-SEC-006/SCR-SEC-007 (Profile / Data
    Scope admin screens) correctly present DataScope as configuration
    data only — this plan does NOT specify any frontend-side data
    filtering by allowedBranches, because none exists to consume.
    Flagged again at F1/SEC-FE for those two screens so the gap is not
    silently assumed solved by the UI layer.
  OQ-016 (srs.md) — conflict about master-registry.md Conflict #20
    OPEN/CLOSED status, tied to BLK-SEC-002 (Security↔Notification
    dependency cycle). Backend/registry concern — RULE-SEC-031/053
    (Notification event dispatch) are documented AS-IS regardless;
    no frontend screen surfaces this directly.
  OQ-SEC-FE-001 (NEW, this session, see 0.2.1) — SCR-SEC-001 Shell
    implementation state unconfirmed. Carried into F1/F4 blocks below
    as an explicit per-block flag, not silently resolved.
  OQ-SEC-FE-002 (NEW, this session, see PHASE F1 ENTITY-SEC-001) — the
    Users Create/Edit dialog's Email field (called for by srs.md B2 and
    ui-ux-spec.md) has no backing write path anywhere in the real API
    (CreateUserRequest/UpdateUserRequest both lack an email field).
    Rendered read-only/disabled in F3 pending a product/backend
    decision; not silently allowed to submit.
  OQ-SEC-FE-003 (NEW, this session, see PHASE F4 governance note) — the
    real backend `pageCode` value is confirmed by literal API-doc
    example for only ONE of this module's screens ("USER" ->
    PERM_USER_VIEW). The remaining screens' real pageCode strings (and
    therefore their PERM_<PAGE_CODE>_<TYPE> literals) are not
    confirmed by any attached artifact. F4 does not invent them (HR-8)
    — SEC-FE/implementation must resolve them against the live Page
    Registry (GET /api/pages/active) rather than a guessed literal.
```

---
<!-- PHASE:F1:START -->

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

<!-- SUB:F1-SCR-SEC-001:START -->

### F1-SCREEN — SCR-SEC-001 — Authentication & Self-Service

```
Shell status: UNCONFIRMED (see 0.2.1 — src/pages/Login.tsx is outside
shell-manifest-SECURITY.md's declared scope; no real component fields
were available to confirm against this session). Built from
flow-diagram.md / ui-ux-spec.md design intent per the CONTRACT-12
fallback for an ambiguous Shell state — carried as OQ-SEC-FE-001.

Entity model touched: ENTITY-SEC-001 (UserAccount) only, at the level
of individual real request/response DTOs already confirmed above
(AuthRequest, SignupRequest, ActivateAccountRequest,
ForgotPasswordRequest, ResetPasswordRequest, AuthResponse/UserInfo) —
these are plain per-form field sets, not a single shared screen model:
  Login          : username, password           -> AuthRequest / login-token
  Self-signup    : username, email, password     -> SignupRequest
  Activate       : token (from email link)       -> ActivateAccountRequest
  Forgot password: email                         -> ForgotPasswordRequest
  Reset password : token, newPassword             -> ResetPasswordRequest

No local Shell TS interface exists in-scope to confirm against. This
plan does NOT define a new Shell-facing model here beyond the request/
response shapes already given by the real API docs above — inventing a
richer local model for an unconfirmed screen would violate HR-1.
```

<!-- SUB:F1-SCR-SEC-001:END -->

<!-- SUB:F1-SCR-SEC-002:START -->

### F1-SCREEN — SCR-SEC-002 — User Management

```
Shell status: CONFIRMED (Users.tsx, shell-manifest-SECURITY.md).

Entities touched:
  ENTITY-SEC-001 (UserAccount)   - primary list/create/edit subject
  ENTITY-SEC-002 (Role)          - roles multi-select options (by name,
                                    per ENTITY-SEC-001 correction #2)
  ENTITY-SEC-009 (SecUserProfile)- via UserProfileDrawer (SCR-SEC-006)
  ENTITY-SEC-010 (SecRoleBranch) - via DataScopeDrawer (SCR-SEC-007) —
    NOTE: DataScope is Role+Branch-scoped, not User-scoped. The Shell
    opens DataScopeDrawer from this Users screen too (shell-manifest:
    "opens ... DataScopeDrawer as a sub-flow"), which is a real
    navigational nuance already reflected in the Shell's own
    `DataScopeDrawerProps.roleId?: string` (optional, not required) —
    F4 must confirm/document exactly which role's scope is being edited
    when launched from a user context rather than a role context.

Local UI state (not entity-backed): search text, status filter,
create/edit dialog open state, delete-confirm dialog state, KPI
aggregate values (total/active/inactive users).

GAP (confirmed, not invented): no lightweight count/summary endpoint
exists anywhere in usermanagement.md. The KPI row (total/active/
inactive) has no backing summary API — it can only be derived from the
paginated list response's own metadata/full-fetch, which is a real,
confirmed limitation of the backend surface, carried forward for F2.
```

<!-- SUB:F1-SCR-SEC-002:END -->

<!-- SUB:F1-SCR-SEC-003:START -->

### F1-SCREEN — SCR-SEC-003 — Role & RBAC Management

```
Shell status: CONFIRMED (Roles.tsx, shell-manifest-SECURITY.md).

Entities touched:
  ENTITY-SEC-002 (Role)          - primary list/create/edit subject
  ENTITY-SEC-004 (Page)          - permission-matrix rows (pageCode-
                                    keyed, per ENTITY-SEC-002 correction #3)
  ENTITY-SEC-010 (SecRoleBranch) - via DataScopeDrawer (SCR-SEC-007)

Local UI state (not entity-backed): search text, status filter,
create/edit dialog with embedded permission matrix (VIEW column
checked+disabled per RULE-SEC-042; CREATE/UPDATE/DELETE columns map to
presence in the real `permissions: string[]` array), "sync all" action
state, "copy from another role" action state (source-role picker),
activate/deactivate confirm dialog, KPI aggregate values.

GAP (confirmed, not invented): same as SCR-SEC-002 — searchRoles has no
dedicated count/summary endpoint either; KPI values are derived from
the paginated fetch.
```

<!-- SUB:F1-SCR-SEC-003:END -->

<!-- SUB:F1-SCR-SEC-004:START -->

### F1-SCREEN — SCR-SEC-004 — Permission Registry

```
Shell status: CONFIRMED (Permissions.tsx, shell-manifest-SECURITY.md).

Entities touched:
  ENTITY-SEC-003 (Permission)    - primary list/create/edit subject
  ENTITY-SEC-004 (Page)          - "associated screen" field on the
                                    create/edit dialog; indirect module
                                    filter (see ENTITY-SEC-003 correction #1)

Local UI state (not entity-backed): search text, module filter (indirect,
confirmed AS-IS backend behavior — do not bind to a PermissionDto field),
create/edit dialog state. No delete action (confirmed, no correction —
matches real API's absence of a delete endpoint exactly).

FLAGGED (secondary point under the module gap already raised at
F1-MODEL ENTITY-SEC-003, not a new OQ): the shell-manifest's own
Renders line for this dialog lists "module" as one of its fields (name,
type, module, associated screen), but PermissionDto carries no writable
module field. SEC-FE must decide whether this dialog field is dropped
from the write payload entirely or repurposed as a page-search-only
filter feeding the "associated screen" picker.
```

<!-- SUB:F1-SCR-SEC-004:END -->

<!-- SUB:F1-SCR-SEC-005:START -->

### F1-SCREEN — SCR-SEC-005 — Page Registry

```
Shell status: CONFIRMED (Pages.tsx, shell-manifest-SECURITY.md).

Entities touched:
  ENTITY-SEC-004 (Page) - sole subject.

Local UI state (not entity-backed): search/module/status filter,
create/edit DRAWER (confirmed shell-manifest terminology — drawer, not
dialog) state, activate/deactivate action state, KPI aggregate values
(same no-summary-endpoint gap as SCR-SEC-002/003).

Fields confirmed 1:1 against CreatePageRequest/UpdatePageRequest:
pageCode (create-only, immutable after), nameEn, nameAr, route, icon,
module, parentId, displayOrder, description, active — including `route`,
whose runtime relevance to actual navigation is disputed (see F1-MODEL
ENTITY-SEC-004 correction #7); it remains a real, required, validated
field on the write payload regardless of that dispute.

CONFIRMED, NO CORRECTION: flat (non-tree) rendering despite `parentId`
existing on the model — matches the Shell's own in-code "per OQ-013"
comment; not changed here (HR-1).
```

<!-- SUB:F1-SCR-SEC-005:END -->

<!-- SUB:F1-SCR-SEC-006:START -->

### F1-SCREEN — SCR-SEC-006 — User Profile [AS-BUILT identity preserved]

```
Shell status: CONFIRMED (UserProfileDrawer.tsx, shell-manifest-SECURITY.md).
Launched from SCR-SEC-002.

Entities touched: ENTITY-SEC-009 (SecUserProfile) exclusively.

Fields confirmed 1:1 against Create/UpdateSecUserProfileRequest:
fullNameEn, fullNameAr, branchId(->branchIdFk), preferredLang,
employeeId(->employeeIdFk), active switch(->isActiveFl). No structural
gap beyond the field renames/type corrections already listed under
F1-MODEL ENTITY-SEC-009.

OQ-015 CARRYOVER (repeated here per 0.4 — frontend impact is concrete on
this exact screen): RULE-SEC-037's allowedBranches[] JWT claim is issued
but never consumed anywhere in the backend to restrict data access. This
screen presents branch assignment as configuration data only. This plan
does not add, and does not claim, any frontend-side enforcement or
filtering by allowedBranches — none exists on the backend to consume.
```

<!-- SUB:F1-SCR-SEC-006:END -->

<!-- SUB:F1-SCR-SEC-007:START -->

### F1-SCREEN — SCR-SEC-007 — Role Data Scope (Branch Assignment)

```
Shell status: CONFIRMED (DataScopeDrawer.tsx, shell-manifest-SECURITY.md).
Launched from both SCR-SEC-002 (Users) and SCR-SEC-003 (Roles) — Shell's
own DataScopeDrawerProps (scope, roleId?) already reflects this dual
entry point.

Entities touched: ENTITY-SEC-010 (SecRoleBranch) exclusively.

Fields confirmed against Create/UpdateSecRoleBranchRequest: role select
(->roleIdFk), branch select(->branchIdFk), data access level select
(->dataAccessLevel, corrected enum values per F1-MODEL ENTITY-SEC-010
correction #3 — this is the highest-stakes correction in this plan,
since the Shell's current values would fail every save), active switch
(->isActiveFl), conditional delete button (->DELETE endpoint, confirmed
to exist).

OQ-015 CARRYOVER (repeated here per 0.4 — this is the primary screen
where a user could reasonably assume the configured scope is enforced):
same allowedBranches[]-never-consumed gap as SCR-SEC-006. This plan does
not claim data-access enforcement exists anywhere in the frontend or
backend for this module.
```

<!-- SUB:F1-SCR-SEC-007:END -->

<!-- PHASE:F1:END -->

---

<!-- PHASE:F2:START -->

## PHASE F2 — Data & Facade Hook Specifications

```
GLOBAL DECLARATIONS (apply to every F2-QUERY/F2-FACADE-HOOK below,
referenced by name rather than repeated per block):

State ownership:
  currentPage / pageSize live inside each screen's `searchFilters`
  object, which IS the query key's filter param — never a standalone
  useState. TanStack Query refetches automatically when searchFilters
  changes.

Error routing (shared Axios/fetch response interceptor, declared once
here — CORE phase for this module was never generated, since SECURITY
is a registry EXCEPTION module with no P3.1; this plan asserts the
mechanism per CORE-8/CONTRACT-12 defaults rather than inventing a
project-specific one):
  HTTP 400 (BAD_REQUEST / INVALID_JSON) -> inline, under the triggering
    field, via React Hook Form's setError (see F3)
  HTTP 401 (UNAUTHORIZED)  -> redirect to login
  HTTP 403 (FORBIDDEN)     -> redirect to unauthorized
  HTTP 409 / 422           -> shared error mapper -> user toast
    (NOTE: no endpoint in this module's real API docs documents a 409
    or 422 response explicitly in its "Other Possible Responses" table
    — every endpoint's documented error surface is limited to
    UNAUTHORIZED / FORBIDDEN / BAD_REQUEST-INVALID_JSON. Real business-
    rule conflicts almost certainly exist at runtime — e.g. DELETE
    /api/roles/{roleId}'s own description states "Returns 409 if role
    has user assignments" in prose, and DELETE /api/users/{userId}'s
    description references "child relationships" — but the auto-
    generated doc's structured error table does not capture these as
    machine-readable entries for either endpoint. This plan does not
    invent a specific ERR-ID/message for them; the shared 409/422 ->
    toast route is declared as the fallback and is sufficient to not
    leave these cases unhandled, but the exact toast copy is deferred to
    implementation using the shared error mapper's generic business-
    error text.)
  HTTP 500                 -> generic message only, no technical detail

Pre-deactivation check pattern: applies only where the target entity
supports a distinct deactivate/reactivate action (Role, Page,
SecRoleBranch/SecUserProfile via isActiveFl toggle). None of the real
endpoints in this module's docs expose a dedicated "check usage before
deactivate" pre-flight endpoint — deactivation is a direct PUT call in
every case (PUT .../deactivate for Role/Page; a plain UPDATE with
isActiveFl:false for SecUserProfile/SecRoleBranch, which have no
separate deactivate endpoint at all). This plan does NOT invent a
usage-check pre-flight call that doesn't exist: the confirmation dialog
fires directly before the mutation; if the backend itself rejects the
operation (e.g. DELETE /api/roles/{roleId} returning 409 for
role-with-assignments, per its own description), that is handled via
the 409->toast route above, not a separate pre-check call.

Caching defaults (no project-wide CORE declaration exists for this
EXCEPTION module — this plan asserts TanStack Query framework defaults
unless a specific block below states otherwise): staleTime 0,
gcTime 5 minutes. Any deviation is called out per-block with a DRV-ID.
```

<!-- SUB:F2-SCR-SEC-001:START -->

### F2 — SCR-SEC-001 — Authentication & Self-Service

```
Shell status: UNCONFIRMED (see 0.2.1 / F1-SCREEN SCR-SEC-001). The
request/response contracts below are sourced entirely from the real,
confirmed API docs (authentication.md) — only the Shell-side facade/
component wiring is unconfirmed, not the backend contracts themselves.
All 8 endpoints in this file are POST — there is no GET/list endpoint
on this screen, so there are no useQuery hooks here at all, only
useMutation hooks.
```

### F2-QUERY — API-SEC-001 — Self-registration sign up
```
HTTP method    : POST
Endpoint path  : /api/auth/signup
Request shape  : SignupRequest { username, email, password }
Response shape : SignupResponse { userId, username, enabled }
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline field errors (username/
                 email/password); 401 UNAUTHORIZED (global, see note*)
Invalidation   : none (no user is authenticated yet at signup)
Loading        : LOCAL
Caching        : n/a (mutation)
* NOTE carried once here for all SCR-SEC-001 blocks: authentication.md
  documents "Authentication Required (Bearer Authentication)" on every
  endpoint in this file, including signup/login themselves — a literal
  reading would be self-contradictory for pre-login flows. This is
  almost certainly an artifact of the auto-generator applying a
  blanket security-scheme annotation rather than a real per-endpoint
  auth requirement. Not silently resolved: flagged here as a doc-
  generation artifact, not corrected by inventing a "no-auth" flag that
  isn't in the source doc (HR-1) — F4/SEC-FE treat these 5 flows
  (signup, activate, reset-password, login, login-token, forgot-
  password) as pre-authentication by design intent (flow-diagram.md),
  not by literal doc field.
```

### F2-QUERY — API-SEC-002 — Activate a self-registered account
```
HTTP method    : POST
Endpoint path  : /api/auth/signup/activate
Request shape  : ActivateAccountRequest { token }
Response shape : 200 OK, no body documented
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 (see note above)
Invalidation   : none
Loading        : LOCAL
```

### F2-QUERY — API-SEC-003 — Reset password
```
HTTP method    : POST
Endpoint path  : /api/auth/reset-password
Request shape  : ResetPasswordRequest { token, newPassword }
Response shape : 200 OK, no body documented
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 (see note above)
Invalidation   : none
Loading        : LOCAL
```

### F2-QUERY — API-SEC-004 — Refresh access token
```
HTTP method    : POST
Endpoint path  : /api/auth/refresh
Request shape  : void (refresh token read from cookie, per description)
Response shape : AuthResponse { accessToken, expiresIn, refreshToken,
                 refreshExpiresIn }
Hook type      : useMutation
Errors         : 401 UNAUTHORIZED -> redirect to login (this is the one
                 SCR-SEC-001 call where 401 is a REAL, literal
                 expected outcome — an expired/invalid refresh token —
                 not the doc-generation artifact noted under API-001)
Invalidation   : none directly; a successful call updates the stored
                 access token used by every other authenticated call
Loading        : GLOBAL (blocks all other in-flight authenticated
                 calls until token refresh resolves — DRV-ID: standard
                 SPA refresh-token pattern, not stated verbatim in SRS,
                 inferred from AuthResponse shape + CORE-8 stack choice)
```

### F2-QUERY — API-SEC-005 — User logout
```
HTTP method    : POST
Endpoint path  : /api/auth/logout
Request shape  : void
Response shape : 204 No Content
Hook type      : useMutation
Errors         : 401 UNAUTHORIZED -> redirect to login (already logging
                 out, so this is effectively a no-op success path)
Invalidation   : entire query cache cleared on success (queryClient.
                 clear()) — DRV-ID: standard logout pattern, not
                 stated verbatim in SRS
Loading        : LOCAL
```

### F2-QUERY — API-SEC-006 — User login
```
HTTP method    : POST
Endpoint path  : /api/auth/login
Request shape  : AuthRequest { username, password }
Response shape : AuthResponse { accessToken, expiresIn, refreshToken,
                 refreshExpiresIn }
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 (see note under
                 API-001 — also plausibly a REAL bad-credentials
                 signal here, not just the doc-artifact; both readings
                 route to the same place in practice: inline/toast
                 "invalid credentials", not a redirect, since the user
                 is already on the login screen)
Invalidation   : none
Loading        : LOCAL
```

### F2-QUERY — API-SEC-007 — User login with complete user information
```
HTTP method    : POST
Endpoint path  : /api/auth/login-token
Request shape  : AuthRequest { username, password }
Response shape : UserInfo { accessToken, expiresIn, refreshToken,
                 refreshExpiresIn, userId, username, enabled, roles,
                 permissions }
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 (bad credentials,
                 same handling as API-SEC-006)
Invalidation   : none — but the response's `roles`/`permissions`
                 arrays are the intended source for client-side
                 permission gating (see SEC-FE phase) once this call
                 replaces or supplements API-SEC-006 in the real login
                 flow
Loading        : LOCAL
GOVERNANCE NOTE: two functionally overlapping login endpoints exist
(API-SEC-006 plain login, API-SEC-007 login-with-user-info). Neither
flow-diagram.md nor ui-ux-spec.md was read as specifying which one the
real Login.tsx calls (SCR-SEC-001 is Shell-UNCONFIRMED — OQ-SEC-FE-001).
This plan does not guess which one is wired up; F4 flags this as
something to confirm once Login.tsx's real state is available, and
recommends API-SEC-007 (login-token) as the better fit for CORE-8's
permission-gated routing model, since it returns roles/permissions in
one round trip.
```

### F2-QUERY — API-SEC-008 — Forgot password
```
HTTP method    : POST
Endpoint path  : /api/auth/forgot-password
Request shape  : ForgotPasswordRequest { email }
Response shape : 200 OK, no body documented
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 (see note under
                 API-001)
Invalidation   : none
Loading        : LOCAL
GOVERNANCE NOTE: endpoint description confirms RULE-SEC-038 (anti-
enumeration) — "Always returns a generic success response regardless
of whether the email exists." The UI must not attempt to distinguish
"email not found" from "email sent" — there is no such distinction to
surface, by design.
```

### F2-SCREEN-INIT — SCR-SEC-001 — Authentication & Self-Service
```
On mount: no permission hook (pre-authentication screen, not gated by
PERM_* — see SEC-FE phase). No LOV hooks. No entity-by-PK query (this
is not an Entry screen against a persisted record in the usual F1-ENTRY
sense — each sub-form posts directly).
Screen state (per sub-form, all local — UNCONFIRMED against real
component since Shell status is unconfirmed, built from flow-diagram.md
design intent per 0.2.1): activeSubForm ('login'|'signup'|'activate'|
'forgot'|'reset'), plus each sub-form's own field values.
```

### F2-FACADE-HOOK — SCR-SEC-001 — Authentication & Self-Service
```
Facade Hook name : useAuthFacade()
Composes         : useLoginMutation (API-SEC-006 or -007, see
                   governance note above — F4 to confirm), useSignup
                   Mutation (API-SEC-001), useActivateMutation
                   (API-SEC-002), useForgotPasswordMutation
                   (API-SEC-008), useResetPasswordMutation (API-SEC-
                   003), useRefreshMutation (API-SEC-004), useLogout
                   Mutation (API-SEC-005)
STATE OWNED: isAuthenticated (derived from stored access-token
  presence + validity — this is the Shell's existing single global
  gate per shell-manifest 0.2/Gaps: "one global isAuthenticated check
  in App.tsx"), isLoading (derived from the active mutation's own
  isLoading).
OPERATIONS EXPOSED: login(credentials), signup(data), activate(token),
  forgotPassword(email), resetPassword(token, newPassword), logout().
BOUNDARIES: components call this Facade only; this Facade composes the
  8 mutations above only.
```

<!-- SUB:F2-SCR-SEC-001:END -->

<!-- SUB:F2-SCR-SEC-002:START -->

### F2 — SCR-SEC-002 — User Management

```
Shell status: CONFIRMED. Entity: ENTITY-SEC-001 (UserAccount), plus
cross-references to ENTITY-SEC-002 (roles by name) and, via the two
drawers, ENTITY-SEC-009/ENTITY-SEC-010 (their own F2 blocks live under
SCR-SEC-006/SCR-SEC-007 respectively — this screen's Facade Hook only
launches those drawers, it does not compose their query hooks).
```

### F2-QUERY — API-SEC-009 — Update user
```
HTTP method    : PUT
Endpoint path  : /api/users/{userId}
Request shape  : UpdateUserRequest { username?, password?, enabled?,
                 roleNames?: string[] } (all optional)
Response shape : UserDto
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login
Invalidation   : ['users'] (list/search), ['users', userId] (detail,
                 if a by-id query is ever added — none exists today,
                 see API-SEC-013 note)
Loading        : LOCAL
```

### F2-QUERY — API-SEC-010 — Delete user
```
HTTP method    : DELETE
Endpoint path  : /api/users/{userId}
Request shape  : void
Response shape : 204 No Content
Hook type      : useMutation
Errors         : 401 -> login; 409/422 -> toast (endpoint description:
                 "if they have no child relationships" implies a real
                 conflict path not captured in the doc's structured
                 error table — see PHASE F2 global 409/422 note)
Invalidation   : ['users']
Loading        : LOCAL
GOVERNANCE NOTE: RULE-SEC-049 (srs.md ENTITY-SEC-001, "Delete مقيَّد")
confirms deletion is restricted — consistent with this endpoint's own
"if they have no child relationships (e.g., active refresh tokens)"
description. No pre-flight check endpoint exists (see PHASE F2 global
pre-deactivation note) — the delete call itself is the check.
```

### F2-QUERY — API-SEC-011 — Get user roles
```
HTTP method    : GET
Endpoint path  : /api/users/{userId}/roles
Request shape  : void
Response shape : array of role-name strings (undocumented element
                 shape beyond "Returns list of role names")
Hook type      : useQuery
Query key      : ['users', userId, 'roles']
Errors         : 401 -> login
Loading        : LOCAL
Caching        : defaults
```

### F2-QUERY — API-SEC-012 — Assign roles to user
```
HTTP method    : PUT
Endpoint path  : /api/users/{userId}/roles
Request shape  : AssignRolesRequest { roleNames: string[] } (full
                 replace — removes existing roles not in the array)
Response shape : UserDto
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login;
                 403 FORBIDDEN -> unauthorized (requires
                 USER_MANAGE_ROLES permission — confirmed, only
                 endpoint in this file with an explicit permission
                 requirement)
Invalidation   : ['users'], ['users', userId, 'roles']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-013 — List all users
```
HTTP method    : GET
Endpoint path  : /api/users
Request shape  : pageable (sort format 'fieldName,asc|desc'; allowed
                 sort fields: id, username, enabled, createdAt, updated
                 At)
Response shape : paginated list of UserDto
Hook type      : useQuery
Query key      : ['users', { page, size, sort }] — see API-SEC-015 for
                 the filtered variant this screen actually uses; this
                 plain-list endpoint is the fallback with no filter
                 support (no search fields) — SCR-SEC-002's search bar
                 requires API-SEC-015 (search), not this endpoint
Errors         : 401 -> login
Loading        : LOCAL
Caching        : defaults
```

### F2-QUERY — API-SEC-014 — Create new user
```
HTTP method    : POST
Endpoint path  : /api/users
Request shape  : CreateUserRequest { username, password } — see F1-
                 MODEL ENTITY-SEC-001 correction #6: no email, no
                 roleNames, no enabled at creation
Response shape : UserDto
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login
Invalidation   : ['users']
Loading        : LOCAL
FLOW IMPLICATION: since Create cannot set roles or enabled state, the
Create dialog's "save" action in this plan is a two-step sequence:
(1) POST /api/users, then (2) if the form captured roles, immediately
follow with PUT /api/users/{newUserId}/roles (API-SEC-012) using the
returned id. This is not optional UX polish — it is required to match
what ui-ux-spec.md's single-dialog Create form implies the user
experiences, given the real API has no single-call equivalent. Flagged
here rather than silently assumed: the Facade Hook (below) must expose
this as one composed operation, not two independent ones the component
has to sequence itself (F4-RULE-6 boundary).
```

### F2-QUERY — API-SEC-015 — Dynamic search for users
```
HTTP method    : POST
Endpoint path  : /api/users/search
Request shape  : UserSearchContractRequest { filters[] (field: id|
                 username|enabled|createdAt, operator, value), sorts[],
                 page, size } — operators: EQ/NE/GT/GE/LT/LE/LIKE/IN/
                 IS_NULL/IS_NOT_NULL/BETWEEN
Response shape : paginated list of UserDto
Hook type      : useMutation (POST-as-query pattern — this endpoint is
                 semantically a read but is a POST; TanStack Query
                 still models it as useMutation per this project's
                 established convention for *-search endpoints,
                 declared once here and reused by every other -search
                 endpoint below without repeating this note)
Effective "query key" equivalent : searchFilters object lives in
                 Facade state exactly as a GET query key would (PHASE
                 F2 global State ownership note) even though the call
                 itself is a mutation — currentPage/pageSize still live
                 inside this same object, never separate useState
Errors         : 400 INVALID_JSON -> inline; 401 -> login
Loading        : LOCAL
Caching        : n/a (mutation pattern) — component-level manual
                 re-trigger on searchFilters change (not automatic
                 TanStack refetch-on-key-change, since this is a
                 mutation not a query) — DRV-ID: consequence of the
                 backend exposing search as POST rather than GET with
                 query params; not a deviation this plan introduces,
                 it is forced by the real endpoint shape
```

### F2-SCREEN-INIT — SCR-SEC-002 — User Management
```
On mount:
  1. Permission hook for SCR-SEC-002 -> canView, canCreate, canEdit,
     canDelete (canApprove: n/a, no approval workflow on this screen)
  2. No LOV hooks directly (roles multi-select sources from
     SCR-SEC-003's role list — see Facade below, not a formal LOV)
  3. Not an Entry screen with a single by-PK query — this is a
     Composite Screen (CORE-9): Search+Entry under one SCR-ID, entry
     dialog opens from a row/action, not from a route param
Search screen state: searchFilters (incl. currentPage/pageSize) drives
  API-SEC-015 per the global State ownership rule.
```

### F2-FACADE-HOOK — SCR-SEC-002 — User Management
```
Facade Hook name : useUserManagementFacade()
Composes         : useSearchUsers (API-SEC-015), useCreateUser
                   (API-SEC-014), useUpdateUser (API-SEC-009),
                   useDeleteUser (API-SEC-010), useAssignRoles
                   (API-SEC-012), plus a read-only useRolesOptions
                   composed from SCR-SEC-003's role-search hook (for
                   the roles multi-select — roles are looked up by
                   name, per F1-MODEL ENTITY-SEC-001 correction #2)

STATE OWNED:
  userList          — from useSearchUsers' data — not duplicated
  selectedUser       — local useState (null if none)
  isLoading          — derived from composed hooks' isLoading/
                       isFetching
  searchFilters      — local useState; currentPage/pageSize inside it
  roleOptions        — from the composed role-list hook's data (for
                       the roles multi-select and, indirectly, for
                       resolving role NAME <-> role display label)
  kpiCounts          — DERIVED client-side from the currently loaded
                       page's data, NOT from a dedicated summary
                       endpoint (see F1-SCREEN SCR-SEC-002 GAP note —
                       no count/summary endpoint exists). This is an
                       explicit, imperfect approximation carried
                       forward, not silently presented as exact totals
                       across all pages.

OPERATIONS EXPOSED:
  createUser(data)          -> composed 2-step: POST /api/users, then
                                (if roles selected) PUT .../roles —
                                exposed as ONE operation per the Flow
                                Implication note under API-SEC-014
  updateUser(id, data)      -> PUT /api/users/{userId}
  deleteUser(id)            -> DELETE (409/422 handled via toast, no
                                separate pre-check call — see PHASE F2
                                global pre-deactivation note)
  assignRoles(userId, names)-> PUT /api/users/{userId}/roles
  selectUser(user)          -> updates selectedUser — no API call
  setSearchFilters(filters) -> triggers useSearchUsers re-invocation

BOUNDARIES: components call this Facade only; this Facade composes the
  F2-QUERY hooks above only, plus the cross-screen role-options read.
```

<!-- SUB:F2-SCR-SEC-002:END -->

<!-- SUB:F2-SCR-SEC-003:START -->

### F2 — SCR-SEC-003 — Role & RBAC Management

```
Shell status: CONFIRMED. Entity: ENTITY-SEC-002 (Role, primary) +
the separate Role-Pages-Matrix resource (ENTITY-SEC-004 join, per
F1-MODEL ENTITY-SEC-002 correction #2/#3).
```

### F2-QUERY — API-SEC-016 — Get role by ID
```
HTTP method    : GET
Endpoint path  : /api/roles/{roleId}
Response shape : RoleDto
Hook type      : useQuery
Query key      : ['roles', roleId]
Errors         : 401 -> login; 403 -> unauthorized (ROLE_VIEW required)
Loading        : LOCAL
Caching        : defaults
USAGE NOTE: this screen's own list comes from API-SEC-026 (search), not
this by-id GET — this hook is used by the cross-screen role-options
reads (SCR-SEC-002's roles multi-select resolution, SCR-SEC-007's role
select) when a single role needs re-confirming outside the list.
```

### F2-QUERY — API-SEC-017 — Update role
```
HTTP method    : PUT
Endpoint path  : /api/roles/{roleId}
Request shape  : UpdateRoleRequest { roleName (required), description?,
                 active? } — roleCode is immutable, confirmed absent
                 from this request shape
Response shape : RoleDto
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (ROLE_UPDATE required)
Invalidation   : ['roles']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-018 — Delete role
```
HTTP method    : DELETE
Endpoint path  : /api/roles/{roleId}
Response shape : 204 No Content
Hook type      : useMutation
Errors         : 401 -> login; 403 -> unauthorized (ROLE_DELETE
                 required); 409/422 -> toast (endpoint description:
                 "Returns 409 if role has user assignments" — same
                 undocumented-in-structured-table pattern as API-010)
Invalidation   : ['roles']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-019 — Get role pages matrix
```
HTTP method    : GET
Endpoint path  : /api/roles/{roleId}/pages
Response shape : RolePagesMatrixResponse { roleId, roleName,
                 assignments: [{ pageCode, pageName, pageNameAr,
                 permissions: string[] }] } — VIEW implicit, never in
                 the array (see F1-MODEL ENTITY-SEC-002 correction #3)
Hook type      : useQuery
Query key      : ['roles', roleId, 'pages']
Errors         : 401 -> login; 403 -> unauthorized (ROLE_VIEW required)
Loading        : LOCAL
Caching        : defaults
```

### F2-QUERY — API-SEC-020 — Bulk update role pages (replace mode)
```
HTTP method    : PUT
Endpoint path  : /api/roles/{roleId}/pages
Request shape  : SyncRolePagesRequest { assignments: [{ pageCode,
                 permissions: string[] }] } — full replace; VIEW
                 auto-added; empty array removes all pages
Response shape : RolePagesMatrixResponse
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (ROLE_UPDATE required)
Invalidation   : ['roles', roleId, 'pages']
Loading        : LOCAL
MAPS TO SHELL ACTION: "sync all" (per shell-manifest RolesPage.tsx
create/edit dialog description) — confirmed exact match, no correction.
```

### F2-QUERY — API-SEC-021 — Add page to role
```
HTTP method    : POST
Endpoint path  : /api/roles/{roleId}/pages
Request shape  : AddPageToRoleRequest { pageCode, permissions:
                 string[] } — VIEW auto-added
Response shape : PageAssignmentResponse
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (ROLE_UPDATE required)
Invalidation   : ['roles', roleId, 'pages']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-022 — Deactivate role
```
HTTP method    : PUT
Endpoint path  : /api/roles/{roleId}/deactivate
Response shape : RoleDto
Hook type      : useMutation
Errors         : 401 -> login
Invalidation   : ['roles']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-023 — Activate role
```
HTTP method    : PUT
Endpoint path  : /api/roles/{roleId}/activate
Response shape : RoleDto
Hook type      : useMutation
Errors         : 401 -> login
Invalidation   : ['roles']
Loading        : LOCAL
MAPS TO SHELL ACTION: single "activate/deactivate confirm dialog"
driving API-SEC-022/023 as two distinct calls — confirmed, no
correction (see F1-MODEL ENTITY-SEC-002 correction #6 — srs.md notes
these were unified into two proper separate paths on 2026-08-23).
```

### F2-QUERY — API-SEC-024 — Create new role
```
HTTP method    : POST
Endpoint path  : /api/roles
Request shape  : CreateRoleRequest { roleCode (pattern ^[A-Z][A-Z0-9_]
                 *$), roleName, description?, active? }
Response shape : RoleDto
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (ROLE_CREATE required)
Invalidation   : ['roles']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-025 — Copy page permissions from another role
```
HTTP method    : POST
Endpoint path  : /api/roles/{roleId}/copy-from/{sourceRoleId}
Response shape : CopyPermissionsResponse { roleId, roleName,
                 copiedFrom: { roleId, roleName }, assignments: [...] }
Hook type      : useMutation
Errors         : 401 -> login
Invalidation   : ['roles', roleId, 'pages']
Loading        : LOCAL
GOVERNANCE NOTE: endpoint description confirms only page-scoped
permissions (PAGE_ID_FK IS NOT NULL) are copied; any system-level
(page-less) permissions on the target role are explicitly left
untouched. No F1 model correction needed — this is a backend behavior
note the Facade/UI copy-confirmation text should reflect, not a data
shape issue.
MAPS TO SHELL ACTION: "copy from another role" — confirmed exact match.
```

### F2-QUERY — API-SEC-026 — Search roles
```
HTTP method    : POST
Endpoint path  : /api/roles/search
Request shape  : RoleSearchContractRequest { filters[] (allowed field:
                 roleName only), sorts[] (allowed: id, roleName), page,
                 size }
Response shape : paginated list of RoleDto
Hook type      : useMutation (POST-as-query pattern, see SCR-SEC-002
                 note under API-SEC-015)
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (ROLE_VIEW required)
Loading        : LOCAL
Caching        : n/a (mutation pattern)
GAP: allowed filter fields are roleName ONLY — no filter by `active`
status is documented, even though shell-manifest describes a
"search/status filter bar" on RolesPage. This plan does not invent a
server-side status filter that doesn't exist; the status filter must
be applied CLIENT-SIDE on the fetched page's results, which is a real,
confirmed limitation (results are only correct within the currently
loaded page, not across the full dataset) — carried forward, not
silently presented as a true server-side filter.
```

### F2-QUERY — API-SEC-050 — Remove page from role
```
HTTP method    : DELETE
Endpoint path  : /api/roles/{roleId}/pages/{pageCode}
Response shape : 204 No Content — removes VIEW + all CRUD permissions
                 for that page entirely
Hook type      : useMutation
Errors         : 401 -> login; 403 -> unauthorized (ROLE_UPDATE
                 required)
Invalidation   : ['roles', roleId, 'pages']
Loading        : LOCAL
```

### F2-SCREEN-INIT — SCR-SEC-003 — Role & RBAC Management
```
On mount:
  1. Permission hook for SCR-SEC-003 -> canView, canCreate, canEdit,
     canDelete
  2. No formal LOV hooks (permission-type values used inside the
     matrix are the LOV-SEC-001 Java-enum deviation — hardcoded client
     constants, not a runtime lookup call — see F2-LOV-QUERY note under
     SCR-SEC-004 where this is documented once in full)
  3. Composite Screen (CORE-9) — entry dialog opens from a row action,
     with a nested API-SEC-019 (get-pages-matrix) fetch once a role is
     selected for edit
Search screen state: searchFilters (incl. currentPage/pageSize) drives
  API-SEC-026; client-side status sub-filter applied to the loaded page
  (see GAP note under API-SEC-026).
```

### F2-FACADE-HOOK — SCR-SEC-003 — Role & RBAC Management
```
Facade Hook name : useRoleManagementFacade()
Composes         : useSearchRoles (API-SEC-026), useCreateRole
                   (API-SEC-024), useUpdateRole (API-SEC-017),
                   useDeleteRole (API-SEC-018), useActivateRole
                   (API-SEC-023), useDeactivateRole (API-SEC-022),
                   useRolePagesMatrix (API-SEC-019, enabled only when a
                   role is selected for edit), useSyncRolePages
                   (API-SEC-020), useAddPageToRole (API-SEC-021),
                   useRemovePageFromRole (API-SEC-050), useCopyFromRole
                   (API-SEC-025)

STATE OWNED:
  roleList         — from useSearchRoles' data
  selectedRole      — local useState (null if none)
  pageMatrix         — from useRolePagesMatrix's data, enabled: !!
                       selectedRole
  isLoading           — derived from composed hooks
  searchFilters       — local useState (currentPage/pageSize inside)

OPERATIONS EXPOSED:
  createRole(data), updateRole(id, data), deleteRole(id),
  activateRole(id), deactivateRole(id), syncRolePages(roleId,
  assignments) -> "sync all", copyFromRole(roleId, sourceRoleId) ->
  "copy from another role", addPageToRole(roleId, pageCode,
  permissions), removePageFromRole(roleId, pageCode),
  selectRole(role), setSearchFilters(filters)

BOUNDARIES: components call this Facade only; composes the F2-QUERY
  hooks above only.
```

<!-- SUB:F2-SCR-SEC-003:END -->

<!-- SUB:F2-SCR-SEC-004:START -->

### F2 — SCR-SEC-004 — Permission Registry

```
Shell status: CONFIRMED. Entity: ENTITY-SEC-003 (Permission, primary).
```

### F2-QUERY — API-SEC-027 — Update permission
```
HTTP method    : PUT
Endpoint path  : /api/permissions/{id}
Request shape  : UpdatePermissionRequest { name (required) } — only
                 `name` is writable; permissionType/pageId are NOT
                 updatable via this endpoint (confirmed — CORRECTION
                 for F3/F4: edit dialog fields beyond `name` must be
                 rendered read-only, not silently allowed to submit)
Response shape : PermissionDto
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login
Invalidation   : ['permissions']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-028 — Create new permission
```
HTTP method    : POST
Endpoint path  : /api/permissions
Request shape  : CreatePermissionRequest { name (required), pageId?,
                 permissionType? }
Response shape : PermissionDto
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login
Invalidation   : ['permissions']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-029 — Search permissions
```
HTTP method    : POST
Endpoint path  : /api/permissions/search
Request shape  : PermissionSearchContractRequest { filters[] (allowed:
                 name, module — module is the indirect join-filter, see
                 F1-MODEL ENTITY-SEC-003 correction #1), sorts[]
                 (allowed: id, name, module, createdAt, updatedAt),
                 page, size }
Response shape : paginated list of PermissionDto
Hook type      : useMutation (POST-as-query pattern)
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (PERMISSION_VIEW required)
Loading        : LOCAL
Caching        : n/a (mutation pattern)
```

### F2-SCREEN-INIT — SCR-SEC-004 — Permission Registry
```
On mount:
  1. Permission hook for SCR-SEC-004 -> canView, canCreate, canEdit
     (canDelete: n/a — no delete endpoint exists, confirmed match to
     Shell's own "No Delete button per spec")
  2. LOV-SEC-001 (permissionType) — see F2-LOV-QUERY block below: a
     genuine deviation, not a runtime lookup call
  3. Composite Screen (CORE-9) — entry dialog opens from a row/create
     action
Search screen state: searchFilters (incl. currentPage/pageSize) drives
  API-SEC-029.
```

### F2-LOV-QUERY — LOV-SEC-001 — Permission Type
```
LOV-ID           : LOV-SEC-001
LOOKUP_CODE      : NONE — this is a DOCUMENTED DEVIATION, not a real
                   MD_LOOKUP_DETAIL-backed LOV. srs.md ENTITY-SEC-003
                   is explicit: "permissionType مُخزَّن كـ Java enum عبر
                   @Enumerated(STRING)، وليس مقروءاً من MD_LOOKUP_DETAIL
                   كما تتطلب LOV-1/LOV-4 القياسية" — stored as a Java
                   enum, not read from the standard lookup table.
Hook name        : NONE — there is no runtime endpoint to call. This
                   plan does NOT invent a GET /api/v1/sys/lookups/...
                   call for this value set, since none exists (HR-1).
Values (hardcoded client-side constant, per confirmed real API/LOV-1
  deviation note): 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' — plus the
  `null` case representing a page-less "system permission" (see
  F1-MODEL ENTITY-SEC-003 correction #2 — NOT a literal 'SYSTEM' value)
Used by field    : permissionType in Permission (ENTITY-SEC-003)
Caching          : n/a — compile-time constant, not fetched
Reuse rule       : this constant array is the single shared source used
                   anywhere permissionType needs to be rendered/
                   selected — never re-declared ad hoc in a component
```

### F2-FACADE-HOOK — SCR-SEC-004 — Permission Registry
```
Facade Hook name : usePermissionRegistryFacade()
Composes         : useSearchPermissions (API-SEC-029), useCreate
                   Permission (API-SEC-028), useUpdatePermission
                   (API-SEC-027), plus the LOV-SEC-001 constant (not a
                   hook — a static import) and a read-only page-options
                   read composed from SCR-SEC-005 (for the "associated
                   screen" picker — see F1-SCREEN SCR-SEC-004's flagged
                   module-field ambiguity, unresolved here)

STATE OWNED: permissionList (from useSearchPermissions), selectedPerm
  (local useState), isLoading (derived), searchFilters (currentPage/
  pageSize inside), pageOptions (from the composed page-list read)

OPERATIONS EXPOSED: createPermission(data), updatePermission(id,
  { name }) — note the write surface is name-only, per API-SEC-027 —
  selectPermission(perm), setSearchFilters(filters)

BOUNDARIES: components call this Facade only; composes the F2-QUERY
  hooks above only.
```

<!-- SUB:F2-SCR-SEC-004:END -->

<!-- SUB:F2-SCR-SEC-005:START -->

### F2 — SCR-SEC-005 — Page Registry

```
Shell status: CONFIRMED. Entity: ENTITY-SEC-004 (Page, sole subject).
```

### F2-QUERY — API-SEC-030 — Get page by ID
```
HTTP method    : GET
Endpoint path  : /api/pages/{id}
Response shape : PageResponse
Hook type      : useQuery
Query key      : ['pages', id]
Errors         : 401 -> login; 403 -> unauthorized (PAGE_VIEW required)
Loading        : LOCAL
Caching        : defaults
USAGE NOTE: this screen's own list comes from API-SEC-035 (search);
this by-id GET is used for cross-screen page-options reads (SCR-SEC-
003's permission matrix, SCR-SEC-004's "associated screen" picker) when
a single page needs re-confirming outside a list.
```

### F2-QUERY — API-SEC-031 — Update page
```
HTTP method    : PUT
Endpoint path  : /api/pages/{id}
Request shape  : UpdatePageRequest { nameAr, nameEn, route (all
                 required), icon?, module?, parentId?, displayOrder?,
                 description? } — pageCode is NOT in this shape
                 (immutable after creation)
Response shape : PageResponse
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (PAGE_UPDATE required)
Invalidation   : ['pages']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-032 — Reactivate page
```
HTTP method    : PUT
Endpoint path  : /api/pages/{id}/reactivate
Response shape : PageResponse
Hook type      : useMutation
Errors         : 401 -> login; 403 -> unauthorized (PAGE_UPDATE
                 required)
Invalidation   : ['pages']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-033 — Deactivate page
```
HTTP method    : PUT
Endpoint path  : /api/pages/{id}/deactivate
Response shape : PageResponse — soft delete, sets active=false
Hook type      : useMutation
Errors         : 401 -> login; 403 -> unauthorized (PAGE_DELETE
                 required — NOTE: deactivate requires PAGE_DELETE, not
                 PAGE_UPDATE; confirmed from the doc, not obvious from
                 the action's name — flagged for SEC-FE's permission-
                 gating block so the deactivate button is gated on the
                 right PERM_*)
Invalidation   : ['pages']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-034 — Create new page
```
HTTP method    : POST
Endpoint path  : /api/pages
Request shape  : CreatePageRequest { pageCode (required, normalized
                 uppercase), nameAr, nameEn, route (all required),
                 icon?, module?, parentId?, displayOrder?, active?,
                 description?, suppressPermissionTypes?: string[] }
Response shape : PageResponse
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (PAGE_CREATE required)
Invalidation   : ['pages']
Loading        : LOCAL
GOVERNANCE NOTE: creating a page auto-generates 4 CRUD permission
records (RULE-SEC-047, confirmed by this endpoint's own description).
`suppressPermissionTypes` lets the caller skip generating specific
types (e.g. no DELETE permission for a page with no delete action) —
VIEW cannot be suppressed. shell-manifest does not document this field
on PagesRegistryPage's create/edit drawer; this plan surfaces it as an
available-but-currently-unused field, consistent with the "confirm,
don't redesign" mandate — F3/F4 may add it to the form only if product
asks, not required by this plan.
```

### F2-QUERY — API-SEC-035 — Search pages
```
HTTP method    : POST
Endpoint path  : /api/pages/search
Request shape  : PageSearchContractRequest { filters[] (allowed:
                 pageCode, nameAr, nameEn, module, active), sorts[]
                 (allowed: id, pageCode, nameAr, nameEn, module,
                 displayOrder, createdAt, updatedAt), page, size }
Response shape : paginated list of PageResponse
Hook type      : useMutation (POST-as-query pattern)
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (PAGE_VIEW required)
Loading        : LOCAL
Caching        : n/a (mutation pattern)
CONFIRMED, NO CORRECTION: unlike API-SEC-026 (roles search), `active`
IS an allowed filter field here — SCR-SEC-005's status filter maps to
a real server-side filter, not a client-side approximation.
```

### F2-QUERY — API-SEC-036 — Get active pages
```
HTTP method    : GET
Endpoint path  : /api/pages/active
Response shape : array of PageResponse (no pagination envelope — flat
                 array, per its own documented shape)
Hook type      : useQuery
Query key      : ['pages', 'active']
Errors         : 401 -> login; 403 -> unauthorized (PAGE_VIEW required)
Loading        : LOCAL
Caching        : staleTime 10 minutes — DRV-ID: this is reference data
                 explicitly described as "used in Role Access Control
                 'Add Page' dropdown" — stable-list caching is
                 justified by the endpoint's own stated purpose, per
                 the caching-deviation rule (SRS-implied stable
                 reference data)
USAGE NOTE: this is the real source for SCR-SEC-003's "add page" picker
in the permission matrix — not a generic pages list, and not paginated.
```

### F2-SCREEN-INIT — SCR-SEC-005 — Page Registry
```
On mount:
  1. Permission hook for SCR-SEC-005 -> canView, canCreate, canEdit
     (canDelete: n/a — deactivate/reactivate stand in for delete, per
     the entity's own operations set; gated on PAGE_DELETE for
     deactivate specifically, see API-SEC-033 note)
  2. No formal LOV hooks
  3. Composite Screen (CORE-9) — entry DRAWER opens from a row/create
     action (drawer, not dialog — confirmed shell-manifest terminology)
Search screen state: searchFilters (incl. currentPage/pageSize, module,
  active) drives API-SEC-035 — all real server-side filters.
```

### F2-FACADE-HOOK — SCR-SEC-005 — Page Registry
```
Facade Hook name : usePageRegistryFacade()
Composes         : useSearchPages (API-SEC-035), useCreatePage
                   (API-SEC-034), useUpdatePage (API-SEC-031),
                   useDeactivatePage (API-SEC-033), useReactivatePage
                   (API-SEC-032), useActivePages (API-SEC-036, for
                   cross-screen page pickers)

STATE OWNED: pageList (from useSearchPages), selectedPage (local
  useState), isLoading (derived), searchFilters (currentPage/pageSize/
  module/active inside), kpiCounts (DERIVED client-side — same
  no-summary-endpoint gap as SCR-SEC-002/003)

OPERATIONS EXPOSED: createPage(data), updatePage(id, data),
  deactivatePage(id) -> no separate pre-check call (direct mutation,
  409/422 -> toast if the backend rejects it), reactivatePage(id),
  selectPage(page), setSearchFilters(filters)

BOUNDARIES: components call this Facade only; composes the F2-QUERY
  hooks above only.
```

<!-- SUB:F2-SCR-SEC-005:END -->

<!-- SUB:F2-SCR-SEC-006:START -->

### F2 — SCR-SEC-006 — User Profile [AS-BUILT identity preserved]

```
Shell status: CONFIRMED (UserProfileDrawer.tsx). Entity: ENTITY-SEC-009
(SecUserProfile) exclusively. Launched from SCR-SEC-002.
```

### F2-QUERY — API-SEC-037 — Get user profile by user ID
```
HTTP method    : GET
Endpoint path  : /api/v1/security/user-profiles/{userId}
Response shape : SecUserProfileDto
Hook type      : useQuery
Query key      : ['user-profiles', userId]
Errors         : 401 -> login; 403 -> unauthorized (USER_PROFILE_VIEW
                 required)
Loading        : LOCAL
Caching        : defaults
Enabled         : !!userId (only fires once the drawer is opened for a
                 specific user — standard Entry-screen-by-PK pattern)
```

### F2-QUERY — API-SEC-038 — Update user profile
```
HTTP method    : PUT
Endpoint path  : /api/v1/security/user-profiles/{userId}
Request shape  : UpdateSecUserProfileRequest { branchIdFk (required,
                 RULE-SEC-034), fullNameAr?, fullNameEn?,
                 preferredLang?, employeeIdFk? }
Response shape : SecUserProfileDto
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (USER_PROFILE_UPDATE required)
Invalidation   : ['user-profiles', userId]
Loading        : LOCAL
```

### F2-QUERY — API-SEC-039 — List user profiles
```
HTTP method    : GET
Endpoint path  : /api/v1/security/user-profiles
Request shape  : pageable (allowed sort: userIdFk, branchIdFk,
                 isActiveFl, createdAt)
Response shape : paginated list of SecUserProfileDto
Hook type      : useQuery
Query key      : ['user-profiles', { page, size, sort }]
Errors         : 401 -> login
Loading        : LOCAL
Caching        : defaults
USAGE NOTE: not used by SCR-SEC-006 itself (which is a by-userId
drawer, API-SEC-037), listed here for completeness per the "every
API-ID has an F2 spec" self-check requirement — no confirmed screen
consumes this list endpoint directly today.
```

### F2-QUERY — API-SEC-040 — Create user profile
```
HTTP method    : POST
Endpoint path  : /api/v1/security/user-profiles
Request shape  : CreateSecUserProfileRequest { userIdFk (required),
                 branchIdFk (required, RULE-SEC-034), fullNameAr?,
                 fullNameEn?, preferredLang?, employeeIdFk? }
Response shape : SecUserProfileDto
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (USER_PROFILE_CREATE required)
Invalidation   : ['user-profiles', userIdFk]
Loading        : LOCAL
GOVERNANCE NOTE: a profile is a separate creatable resource, not
auto-created alongside a User (POST /api/users has no profile fields
at all — confirmed, see F1-MODEL ENTITY-SEC-001). The Facade must treat
"does this user have a profile yet" as a real branch: API-SEC-037
returning 404-equivalent-empty (not explicitly documented, but implied
by profile being create-or-update, not always-exists) determines
whether the drawer's save action calls API-SEC-040 (create) or
API-SEC-038 (update).
```

### F2-QUERY — API-SEC-041 — Search user profiles
```
HTTP method    : POST
Endpoint path  : /api/v1/security/user-profiles/search
Response shape : paginated list of SecUserProfileDto
Hook type      : useMutation (POST-as-query pattern)
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (USER_PROFILE_VIEW required)
Loading        : LOCAL
Caching        : n/a (mutation pattern)
USAGE NOTE: same as API-SEC-039 — no confirmed screen consumes this
directly; listed for completeness.
```

### F2-SCREEN-INIT — SCR-SEC-006 — User Profile
```
On mount (drawer open, not page mount):
  1. Permission hook for SCR-SEC-006 -> canView, canEdit (no canCreate/
     canDelete in the usual sense — create is implicit via the
     create-or-update branch under API-SEC-040/038)
  2. No formal LOV hooks (branchIdFk options come from Organization's
     own branch list, confirmed already sourced via useOrganizationStore
     in the Shell — cross-module read, not a Security-owned LOV)
  3. Entry-by-PK query: useUserProfile(userId) (API-SEC-037), enabled:
     !!userId, drives the create-vs-update branch on save
```

### F2-FACADE-HOOK — SCR-SEC-006 — User Profile
```
Facade Hook name : useUserProfileFacade(userId)
Composes         : useUserProfile (API-SEC-037), useCreateUserProfile
                   (API-SEC-040), useUpdateUserProfile (API-SEC-038)

STATE OWNED: profile (from useUserProfile's data), isLoading (derived)

OPERATIONS EXPOSED: saveProfile(data) -> branches to create (API-SEC-
  040) if no profile exists yet, else update (API-SEC-038) — exposed as
  ONE operation per the create-or-update note under API-SEC-040

BOUNDARIES: components call this Facade only; composes the F2-QUERY
  hooks above only.

OQ-015 CARRYOVER (repeated once more per 0.4/F1-SCREEN — no new
content, cross-referenced for completeness at the data layer too):
this Facade does not filter or restrict anything by allowedBranches[]
— nothing to consume.
```

<!-- SUB:F2-SCR-SEC-006:END -->

<!-- SUB:F2-SCR-SEC-007:START -->

### F2 — SCR-SEC-007 — Role Data Scope (Branch Assignment)

```
Shell status: CONFIRMED (DataScopeDrawer.tsx). Entity: ENTITY-SEC-010
(SecRoleBranch) exclusively. Launched from SCR-SEC-002 and SCR-SEC-003.
```

### F2-QUERY — API-SEC-042 — Get a role-branch assignment
```
HTTP method    : GET
Endpoint path  : /api/v1/security/role-branches/{roleId}/{branchId}
Response shape : SecRoleBranchDto
Hook type      : useQuery
Query key      : ['role-branches', roleId, branchId] — COMPOSITE key,
                 per F1-MODEL ENTITY-SEC-010 correction #1 (no single
                 id exists to key on)
Errors         : 401 -> login; 403 -> unauthorized (ROLE_VIEW required)
Loading        : LOCAL
Caching        : defaults
Enabled         : !!roleId && !!branchId
```

### F2-QUERY — API-SEC-043 — Update a role-branch assignment
```
HTTP method    : PUT
Endpoint path  : /api/v1/security/role-branches/{roleId}/{branchId}
Request shape  : UpdateSecRoleBranchRequest { dataAccessLevel
                 (required) } — see F1-MODEL ENTITY-SEC-010 correction
                 #3: values are BRANCH_ONLY/BRANCH_AND_CHILDREN/ALL,
                 NOT the Shell's original BRANCH/CHILDREN/ALL
Response shape : SecRoleBranchDto
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (ROLE_UPDATE required)
Invalidation   : ['role-branches', roleId, branchId], ['role-branches']
                 (list)
Loading        : LOCAL
```

### F2-QUERY — API-SEC-044 — Remove a role-branch assignment
```
HTTP method    : DELETE
Endpoint path  : /api/v1/security/role-branches/{roleId}/{branchId}
Response shape : 204 No Content
Hook type      : useMutation
Errors         : 401 -> login; 403 -> unauthorized (ROLE_DELETE
                 required)
Invalidation   : ['role-branches', roleId, branchId], ['role-branches']
Loading        : LOCAL
MAPS TO SHELL ACTION: "conditional delete button" in DataScopeDrawer —
confirmed exact match.
```

### F2-QUERY — API-SEC-045 — List role-branch assignments
```
HTTP method    : GET
Endpoint path  : /api/v1/security/role-branches
Request shape  : pageable (allowed sort: roleIdFk, branchIdFk,
                 dataAccessLevel, isActiveFl, createdAt)
Response shape : paginated list of SecRoleBranchDto
Hook type      : useQuery
Query key      : ['role-branches', { page, size, sort }]
Errors         : 401 -> login
Loading        : LOCAL
Caching        : defaults
```

### F2-QUERY — API-SEC-046 — Assign a branch scope to a role
```
HTTP method    : POST
Endpoint path  : /api/v1/security/role-branches
Request shape  : CreateSecRoleBranchRequest { roleIdFk (required),
                 branchIdFk (required), dataAccessLevel (required) }
Response shape : SecRoleBranchDto
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (ROLE_CREATE required)
Invalidation   : ['role-branches']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-047 — Search role-branch assignments
```
HTTP method    : POST
Endpoint path  : /api/v1/security/role-branches/search
Response shape : paginated list of SecRoleBranchDto
Hook type      : useMutation (POST-as-query pattern)
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (ROLE_VIEW required)
Loading        : LOCAL
Caching        : n/a (mutation pattern)
```

### F2-SCREEN-INIT — SCR-SEC-007 — Role Data Scope
```
On mount (drawer open):
  1. Permission hook for SCR-SEC-007 -> canView, canCreate, canEdit,
     canDelete
  2. LOV-SEC-002 (Data Access Level) — see F2-LOV-QUERY block below —
     a REAL master-data-validated LOV, unlike LOV-SEC-001
  3. Entry-by-PK query: useRoleBranch(roleId, branchId) (API-SEC-042),
     composite-key enabled, drives the create-vs-update branch
```

### F2-LOV-QUERY — LOV-SEC-002 — Data Access Level
```
LOV-ID           : LOV-SEC-002
LOOKUP_CODE      : DATA_ACCESS_LEVEL (per srs.md ENTITY-SEC-010 Cross-
                   Module note: "يستهلك DATA_ACCESS_LEVEL من MasterData
                   (MD_MASTER_LOOKUP)") — confirmed as a real
                   MasterDataLookupClient-validated value set, UNLIKE
                   LOV-SEC-001.
Hook name        : useDataAccessLevelOptions()
GAP (confirmed, not invented): no endpoint in this module's 50-endpoint
  real API surface returns the runtime OPTIONS LIST for this LOOKUP_
  CODE (only server-side VALIDATION against it is confirmed, via
  MasterDataLookupClient, on write). srs.md itself states the
  dependency is "SOFT-READ فقط، بلا XM-ID مؤكَّد بعد" (soft-read only,
  no confirmed XM-ID yet) — i.e. even the SRS does not point to a
  settled cross-module read contract for fetching this list. This plan
  does NOT invent a `GET /api/v1/sys/lookups/DATA_ACCESS_LEVEL` call
  that has no corresponding entry in the real API docs (HR-1).
Practical resolution (documented, not silently assumed): the 3 known
  values — BRANCH_ONLY, BRANCH_AND_CHILDREN, ALL — are confirmed
  identically across every request/response example in
  securitydatascoperolebranches.md. This plan hardcodes them as a
  client-side constant (same treatment as LOV-SEC-001), pending a real
  MasterData lookup-list endpoint. Unlike LOV-SEC-001 (a genuine,
  permanent Java-enum deviation), this is flagged as a TEMPORARY gap —
  if MD_MASTER_LOOKUP's read endpoint becomes available, this hardcoded
  list should be replaced with a real fetch; it is hardcoded here only
  because no such endpoint exists in the API surface confirmed this
  session.
Used by field    : dataAccessLevel in SecRoleBranch (ENTITY-SEC-010)
Caching          : n/a — compile-time constant (see GAP above)
```

### F2-FACADE-HOOK — SCR-SEC-007 — Role Data Scope
```
Facade Hook name : useRoleDataScopeFacade(roleId, branchId)
Composes         : useRoleBranch (API-SEC-042), useCreateRoleBranch
                   (API-SEC-046), useUpdateRoleBranch (API-SEC-043),
                   useDeleteRoleBranch (API-SEC-044), plus the
                   LOV-SEC-002 constant (static import, see GAP above)

STATE OWNED: scope (from useRoleBranch's data), isLoading (derived)

OPERATIONS EXPOSED: saveScope(data) -> branches to create (API-SEC-046)
  if no assignment exists for this (roleId, branchId) pair yet, else
  update (API-SEC-043); deleteScope() -> direct DELETE, no pre-check
  call (per PHASE F2 global pre-deactivation note)

BOUNDARIES: components call this Facade only; composes the F2-QUERY
  hooks above only.

OQ-015 CARRYOVER (repeated once more, data-layer completeness — no new
content): this Facade does not filter or restrict anything by
allowedBranches[] — nothing to consume, and this is the screen most
likely to be mistaken for enforcement.
```

<!-- SUB:F2-SCR-SEC-007:END -->

### F2 — Cross-Screen / App-Shell (not owned by a single SCR-ID)

```
API-SEC-048/049 (menumanagement.md) feed the app-shell's own navigation
menu, not any single one of the 7 SEC screens — listed here, unsubbed,
per the "every API-ID has an F2 spec" completeness requirement (§11.3).
```

### F2-QUERY — API-SEC-048 — Get user menu based on permissions
```
HTTP method    : GET
Endpoint path  : /api/menu/user-menu
Response shape : array of MenuItemDto { id, pageCode, nameAr, nameEn,
                 routePath, parentId, permCode, module, displayOrder,
                 icon, isActive, description } — "Shows only pages
                 where user has VIEW permission"
Hook type      : useQuery
Query key      : ['menu', 'user-menu']
Errors         : 401 -> login
Loading        : GLOBAL (app-shell-level — feeds the primary nav, not
                 a single screen's own loading state — DRV-ID: implied
                 by "used to render navigation before any screen
                 mounts", not stated verbatim in SRS)
Caching        : staleTime 10 minutes — DRV-ID: menu structure changes
                 infrequently relative to session length; same class
                 of justification as API-SEC-036 (active pages)
GOVERNANCE NOTE — F4 RELEVANCE: this endpoint's `routePath` field is
ANOTHER real, backend-confirmed URL-shaped field (like AppScreen.route,
ENTITY-SEC-004) that has no wiring to the Shell's actual switch-based
navigation. This compounds the "Inconsistency to flag for F4" already
raised in 0.2/F1-MODEL ENTITY-SEC-004 correction #7 — there are now TWO
independent real backend fields (Page.route, MenuItemDto.routePath)
both implying URL-based routing the Shell does not use. Not resolved
here; carried to F4 as part of the same routing-architecture decision.
```

### F2-QUERY — API-SEC-049 — Get menu for specific user (Admin)
```
HTTP method    : GET
Endpoint path  : /api/menu/user-menu/{userId}
Response shape : array of MenuItemDto (same shape as API-SEC-048)
Hook type      : useQuery
Query key      : ['menu', 'user-menu', userId]
Errors         : 401 -> login
Loading        : LOCAL
Caching        : staleTime 10 minutes (same justification as API-SEC-048)
USAGE NOTE: per its own description ("Admin: View menu structure for
any user. Useful for debugging permission issues") — no confirmed
screen in the 7 SEC screens exposes this; likely an admin/support
utility outside this plan's screen scope. Listed for completeness only.
```

<!-- PHASE:F2:END -->

---

<!-- PHASE:F3:START -->

## PHASE F3 — Frontend Validation Rule Specifications

```
ERR-ID GOVERNANCE GAP (disclosed once here, applies to every block
below): CONTRACT-4 requires F3 validators to reference an ERR-ID, never
redefine message text inline. srs.md's A4 section (RULE-SEC-030..053)
carries Message-AR/Message-EN pairs per rule, but — because SECURITY is
a reverse-documented EXCEPTION module that never passed through P1's
normal ERR-ID assignment step — no formal ERR-SEC-xxx registry exists
anywhere in the attached artifacts. This plan does NOT invent new
message text (HR-1 would be violated) — instead it assigns a synthetic
ERR-SEC-{NNN} id 1:1 with each RULE-SEC-{NNN} purely as an internal
cross-reference convenience for this document, sourcing the message
text verbatim from srs.md A4. This is a bookkeeping assignment by P3.2,
not a claim on a real backend error-code registry (same disclosure
pattern already used for PLAN-SEC-FE-001 in the Plan Header).

RULES WITH NO FRONTEND SURFACE (no user-facing message per srs.md A4,
purely internal/backend behavior — listed here once, not given a full
VALIDATION SPEC block, since there is no field/form for a Zod primitive
to attach to):
  RULE-SEC-031 (event-based notification dispatch — architectural)
  RULE-SEC-037 (JWT allowedBranches[] derivation — see OQ-015 carryover)
  RULE-SEC-039 (prior reset-token invalidation — transparent to user)
  RULE-SEC-051 (refresh token rotation — transparent to user)
  RULE-SEC-052 (scheduled refresh-token cleanup — no user interaction)
  RULE-SEC-053 (svc-notification cross-module auth — purely internal)
```

### F3-VALIDATION — RULE-SEC-044 — Full replacement on role-page sync

```
RULE SOURCE:
  Statement  : The system MUST fully replace the role's page-scoped
               permissions on sync, while leaving system-level
               permissions (no page FK) untouched
  Message-AR : (internal behavior — no user-facing message in srs.md)
  Message-EN : (internal behavior — no user-facing message in srs.md)
  Scope      : UPDATE (via "sync all" action, API-SEC-020)
VALIDATION SPEC: not a field-level Zod rule — this is a CONFIRMATION-
  COPY requirement: the "sync all" action's confirmation dialog (F2-
  FACADE-HOOK SCR-SEC-003) must warn the user this REPLACES all
  page-scoped assignments, since srs.md documents this as full-replace
  semantics, not additive. No ERR-ID applies (no rejection case) — this
  is a pre-action warning, not a validation error.
```

<!-- SUB:F3-SCR-SEC-001:START -->

### F3 — SCR-SEC-001 — Authentication & Self-Service

### F3-VALIDATION — RULE-SEC-030 — Self-registered account disabled by default
```
RULE SOURCE:
  Statement  : The system MUST create self-registered accounts with
               enabled = false until activated
  Message-AR : حسابك قيد التفعيل — يرجى تأكيد بريدك الإلكتروني أولاً
  Message-EN : Your account is pending activation — please confirm
               your email first
  ERR-ID     : ERR-SEC-030 (synthetic, see governance gap note above)
  Scope      : post-signup display only
VALIDATION SPEC: not a form-input Zod rule — this is a POST-SUBMIT
  DISPLAY requirement on the Signup sub-form: after a successful
  SignupRequest (API-SEC-001), the UI must show ERR-SEC-030's message
  (not a generic "success" toast) and route the user toward the
  Activate sub-form/flow, not toward Login.
```

### F3-VALIDATION — RULE-SEC-032 — Activation/reset token validity
```
RULE SOURCE:
  Statement  : The system MUST reject activation/reset if the token is
               invalid, expired, or already used
  Message-AR : الرمز غير صالح أو منتهي الصلاحية
  Message-EN : Token is invalid or has expired
  ERR-ID     : ERR-SEC-032
  Scope      : Activate, Reset Password sub-forms
VALIDATION SPEC:
  Field            : token (both sub-forms)
  Validation type  : BUSINESS_RULE — cannot be checked client-side
                     (token opacity is intentional); surfaced via the
                     shared error mapper on the mutation's error
                     response (API-SEC-002 / API-SEC-003), routed per
                     PHASE F2 global error routing (400/401 -> see
                     note under API-SEC-001 on the auth-doc-generator
                     artifact; practically this is a business-rule
                     rejection -> toast, per the 409/422 fallback route
                     since no literal token-invalid HTTP code is
                     documented in authentication.md's structured
                     table)
  Evaluation timing : ON_SUBMIT only (server round-trip required)
```

### F3-VALIDATION — RULE-SEC-033 — Token single-use
```
RULE SOURCE:
  Statement  : The system MUST mark the token as used immediately on
               success and MUST reject any further use of the same
               token
  Message-AR : هذا الرمز مُستخدَم مسبقاً
  Message-EN : This token has already been used
  ERR-ID     : ERR-SEC-033
  Scope      : Activate, Reset Password sub-forms
VALIDATION SPEC:
  Field            : token
  Validation type  : BUSINESS_RULE — same handling as RULE-SEC-032
                     (server round-trip only); UX implication: once a
                     token-consuming mutation succeeds, the Facade must
                     not allow the same sub-form to be resubmitted with
                     the same token (disable the submit action after
                     success, not just after error)
  Evaluation timing : ON_SUBMIT only
```

### F3-VALIDATION — RULE-SEC-038 — Anti-enumeration on forgot-password
```
RULE SOURCE:
  Statement  : The system MUST return an identical response regardless
               of whether the submitted email exists
  Message-AR : إذا كان بريدك مسجَّلاً لدينا، ستصلك رسالة استعادة كلمة
               المرور
  Message-EN : If your email is registered, you will receive a
               password reset message
  ERR-ID     : ERR-SEC-038
  Scope      : Forgot Password sub-form
VALIDATION SPEC: not a rejection rule — this is a DISPLAY CONSTRAINT:
  the UI MUST show ERR-SEC-038's message on every successful
  ForgotPasswordRequest submission (API-SEC-008) and MUST NOT branch UI
  behavior on whether the email was found (there is nothing in the
  response to branch on — RULE-SEC-038 guarantees an identical
  response either way). Field-level: `email` itself is REQUIRED +
  well-formed email FORMAT (client-side format check only — existence
  is intentionally never revealed).
```

### F3-VALIDATION — RULE-SEC-040 — Username uniqueness on signup
```
RULE SOURCE:
  Statement  : The system MUST require globally unique username on
               signup
  Message-AR : اسم المستخدم مستخدَم بالفعل
  Message-EN : Username already exists
  ERR-ID     : ERR-SEC-040
  Scope      : CREATE (Signup sub-form only — srs.md B2/B5 note this
               source constant is SIGNUP_USERNAME_ALREADY_EXISTS,
               distinct from the admin-side user-creation path)
VALIDATION SPEC:
  Field            : username
  DB Column        : USERNAME (VARCHAR(80), UK_USERS_USERNAME)
  Validation type  : REQUIRED + LENGTH(3,80) (from SignupRequest's own
                     documented constraints) + UNIQUE_CHECK
  Zod primitive     : z.string().min(3).max(80)
  Evaluation timing : ON_BLUR (format/length) + ON_SUBMIT (uniqueness,
                     server round-trip — no client-side pre-check
                     endpoint exists)
```

### F3-VALIDATION — RULE-SEC-041 — Email uniqueness on signup
```
RULE SOURCE:
  Statement  : The system MUST require globally unique email on signup
  Message-AR : البريد الإلكتروني مستخدَم بالفعل
  Message-EN : Email already exists
  ERR-ID     : ERR-SEC-041
  Scope      : CREATE (Signup sub-form only)
VALIDATION SPEC:
  Field            : email
  DB Column        : EMAIL (VARCHAR(150), UK_USERS_EMAIL)
  Validation type  : REQUIRED + LENGTH(max 150) + FORMAT(email) +
                     UNIQUE_CHECK
  Zod primitive     : z.string().email().max(150)
  Evaluation timing : ON_BLUR (format/length) + ON_SUBMIT (uniqueness)
```

### F3-VALIDATION — RULE-SEC-050 — Rate limiting on auth endpoints
```
RULE SOURCE:
  Statement  : The system MUST block further attempts for the same
               ip|identifier key after a configured maximum within a
               configured lockout window, on login/signup/forgot-
               password/reset-password
  Message-AR : تجاوزت الحد المسموح من المحاولات — حاول لاحقاً
  Message-EN : Too many attempts — please try again later
  ERR-ID     : ERR-SEC-050
  Scope      : ALL 4 sub-forms (Login, Signup, Forgot Password, Reset
               Password)
VALIDATION SPEC: not a field-level rule — a RESPONSE-HANDLING
  requirement. GOVERNANCE GAP: neither authentication.md's structured
  error tables nor srs.md's rule entry states the literal HTTP status
  this filter returns (commonly 429, but not confirmed in the attached
  docs — HR-1: not assumed). This plan routes it through the generic
  business-error -> toast path (PHASE F2 global error routing) using
  ERR-SEC-050's message text, and flags the exact status code as
  unconfirmed rather than guessing 429 outright.
```

<!-- SUB:F3-SCR-SEC-001:END -->

<!-- SUB:F3-SCR-SEC-002:START -->

### F3 — SCR-SEC-002 — User Management

### F3-VALIDATION — RULE-SEC-049 — Username uniqueness, delete protection, default role
```
RULE SOURCE:
  Statement  : The system MUST require unique username (case-
               insensitive) on create and update, MUST prevent
               deletion of a user with active refresh tokens, and MUST
               auto-assign the default ROLE_USER role on creation if
               it exists (silently skipped otherwise)
  Message-AR : اسم المستخدم مستخدَم بالفعل / لا يمكن حذف مستخدم لديه
               جلسات نشطة
  Message-EN : Username already exists / Cannot delete a user with
               active sessions
  ERR-ID     : ERR-SEC-049
  Scope      : CREATE, UPDATE, DELETE (admin-side, distinct from
               RULE-SEC-040's signup-side uniqueness — same underlying
               DB constraint, two different entry points)
VALIDATION SPEC:
  Field            : username
  DB Column        : USERNAME (VARCHAR(80), UK_USERS_USERNAME,
                     case-insensitive per rule statement)
  Validation type  : REQUIRED + LENGTH(3,80) + UNIQUE_CHECK
                     (case-insensitive)
  Zod primitive     : z.string().min(3).max(80)
  Evaluation timing : ON_BLUR (format) + ON_SUBMIT (uniqueness)
DELETE-PATH BEHAVIOR: deleteUser (API-SEC-010) must surface
  ERR-SEC-049's second message via the 409/422 -> toast route when the
  backend rejects a delete for active-refresh-token reasons — no
  client-side pre-check exists (confirmed, see F2 pre-deactivation
  note).
INFORMATIONAL, NOT A FRONTEND VALIDATION: default ROLE_USER
  auto-assignment on create happens silently server-side and is not
  observable/actionable from the Create form — not given a Zod rule,
  noted here only so it is not mistaken for a plan gap.
```

<!-- SUB:F3-SCR-SEC-002:END -->

<!-- SUB:F3-SCR-SEC-003:START -->

### F3 — SCR-SEC-003 — Role & RBAC Management

### F3-VALIDATION — RULE-SEC-042 — VIEW auto-added, not independently removable
```
RULE SOURCE:
  Statement  : The system MUST auto-add VIEW permission whenever a
               Page is assigned to a Role, and MUST NOT allow VIEW to
               be removed independently of the full CRUD set for that
               page
  Message-AR : صلاحية العرض تُضاف تلقائياً ولا يمكن إزالتها بمفردها
  Message-EN : VIEW permission is added automatically and cannot be
               removed independently
  ERR-ID     : ERR-SEC-042
  Scope      : CREATE, UPDATE (permission matrix in the Role dialog)
VALIDATION SPEC:
  Field            : the VIEW checkbox in each permission-matrix row
  Validation type  : BUSINESS_RULE (UI-enforced, not a Zod schema
                     rule in the usual sense — the checkbox itself is
                     rendered checked + disabled, so an invalid state
                     is structurally unreachable rather than caught at
                     submit time). Directly ties to F1-MODEL
                     ENTITY-SEC-002 correction #3 and F2's real
                     PageAssignmentResponse shape (VIEW never appears
                     in the `permissions` array at all).
  Evaluation timing : ON_CHANGE (checkbox is non-interactive for VIEW)
```

### F3-VALIDATION — RULE-SEC-043 — CRUD value restriction on page assignment
```
RULE SOURCE:
  Statement  : The system MUST restrict permission values in role-page
               assignment requests to CREATE, UPDATE, DELETE only
  Message-AR : نوع الصلاحية غير صالح
  Message-EN : Invalid permission type
  ERR-ID     : ERR-SEC-043
  Scope      : CREATE, UPDATE (add-page-to-role / sync-pages payloads)
VALIDATION SPEC:
  Field            : permissions[] (per page-assignment row)
  Validation type  : PATTERN / enum membership
  Zod primitive     : z.array(z.enum(['CREATE','UPDATE','DELETE']))
  Evaluation timing : ON_CHANGE (the matrix UI only ever renders these
                     3 togglable checkboxes per row — VIEW excluded
                     per RULE-SEC-042 — so client-side this is
                     structurally enforced, not just validated;
                     ON_SUBMIT as a defense-in-depth Zod check before
                     the mutation fires)
```

### F3-VALIDATION — RULE-SEC-045 — Role permission copy rules
```
RULE SOURCE:
  Statement  : The system MUST copy only page-scoped permissions from
               the source role, MUST NOT overwrite the target role's
               system-level permissions, MUST reject copying from a
               role with zero page-scoped permissions, and MUST reject
               self-copy
  Message-AR : لا توجد صلاحيات لنسخها من هذا الدور / لا يمكن النسخ من
               نفس الدور
  Message-EN : No permissions to copy from this role / Cannot copy
               from the same role
  ERR-ID     : ERR-SEC-045
  Scope      : the "copy from another role" action (API-SEC-025)
VALIDATION SPEC:
  Field            : sourceRoleId (source-role picker)
  Validation type  : BUSINESS_RULE, two sub-cases:
    (a) self-copy — CLIENT-SIDE PRE-CHECK POSSIBLE: the source-role
        picker must exclude the currently-selected target role from
        its own options list (the target role's id is already known
        client-side — this one sub-case does not need a server round
        trip to catch, though the server still enforces it too)
    (b) empty-source (zero page-scoped permissions) — NOT client-side
        checkable without an extra fetch; surfaced via the 409/422 ->
        toast route using ERR-SEC-045's first message on mutation
        failure
  Evaluation timing : ON_CHANGE (self-copy, via picker filtering) +
                     ON_SUBMIT (empty-source, server round-trip)
```

### F3-VALIDATION — RULE-SEC-048 — Role code/name uniqueness, immutability, delete protection
```
RULE SOURCE:
  Statement  : The system MUST require unique roleCode and roleName,
               MUST treat roleCode as immutable after creation, and
               MUST prevent deletion of a role that has existing user
               assignments
  Message-AR : رمز أو اسم الدور مستخدَم بالفعل / لا يمكن حذف دور له
               مستخدمون مُسنَدون
  Message-EN : Role code or name already exists / Cannot delete a role
               with assigned users
  ERR-ID     : ERR-SEC-048
  Scope      : CREATE (roleCode+roleName), UPDATE (roleName only),
               DELETE
VALIDATION SPEC:
  Field            : roleCode (CREATE only)
  DB Column        : ROLE_CODE (VARCHAR(60), UK_ROLES_ROLE_CODE)
  Validation type  : REQUIRED + PATTERN(^[A-Z][A-Z0-9_]*$) +
                     UNIQUE_CHECK
  Zod primitive     : z.string().regex(/^[A-Z][A-Z0-9_]*$/)
  Read-only on EDIT : yes — roleCode has no field at all in
                     UpdateRoleRequest (confirmed, F1-MODEL
                     ENTITY-SEC-002); the edit form must render it
                     display-only, not merely disabled-but-submitted
  Evaluation timing : ON_BLUR (pattern) + ON_SUBMIT (uniqueness)
  ---
  Field            : roleName
  DB Column        : NAME (VARCHAR(60), UK_ROLES_NAME)
  Validation type  : REQUIRED + LENGTH(max 60) + UNIQUE_CHECK
  Zod primitive     : z.string().min(1).max(60)
  Evaluation timing : ON_BLUR (length) + ON_SUBMIT (uniqueness)
DELETE-PATH BEHAVIOR: deleteRole (API-SEC-018) surfaces ERR-SEC-048's
  second message via 409/422 -> toast; no client-side pre-check exists.
```

<!-- SUB:F3-SCR-SEC-003:END -->

<!-- SUB:F3-SCR-SEC-005:START -->

### F3 — SCR-SEC-005 — Page Registry

### F3-VALIDATION — RULE-SEC-046 — Page code/route format, uniqueness, parent validity
```
RULE SOURCE:
  Statement  : The system MUST require pageCode to match ^[A-Z0-9_]+$
               (2-50 chars) and route to start with / and match
               ^/[a-zA-Z0-9/_-]+$; both MUST be unique; parentId, if
               given, MUST reference an existing page and MUST NOT
               self-reference
  Message-AR : رمز أو مسار الشاشة غير صالح، أو مستخدَم بالفعل، أو
               الشاشة الأب غير صحيحة
  Message-EN : Invalid or duplicate page code/route, or invalid parent
               page
  ERR-ID     : ERR-SEC-046
  Scope      : CREATE (pageCode), CREATE+UPDATE (route, parentId)
VALIDATION SPEC:
  Field            : pageCode (CREATE only — immutable after, no field
                     in UpdatePageRequest, same read-only pattern as
                     roleCode)
  DB Column        : PAGE_CODE (VARCHAR(50), UK_PAGES_CODE)
  Validation type  : REQUIRED + LENGTH(2,50) + PATTERN(^[A-Z0-9_]+$) +
                     UNIQUE_CHECK (server normalizes to uppercase —
                     client may mirror this for display but the
                     backend is authoritative)
  Zod primitive     : z.string().min(2).max(50).regex(/^[A-Z0-9_]+$/)
  Evaluation timing : ON_BLUR (pattern/length) + ON_SUBMIT (uniqueness)
  ---
  Field            : route
  DB Column        : ROUTE (VARCHAR(200), UK_PAGES_ROUTE)
  Validation type  : REQUIRED + LENGTH(max 200) +
                     PATTERN(^/[a-zA-Z0-9/_-]+$) + UNIQUE_CHECK
  Zod primitive     : z.string().max(200).regex(/^\/[a-zA-Z0-9/_-]+$/)
  Evaluation timing : ON_BLUR (pattern/length) + ON_SUBMIT (uniqueness)
  GOVERNANCE NOTE: this field is real, required, and validated
                     server-side regardless of the F4 routing-
                     architecture question raised under F1-MODEL
                     ENTITY-SEC-004 correction #7 — the form must
                     enforce it even though the Shell's own navigation
                     never reads it.
  ---
  Field            : parentId
  Validation type  : BUSINESS_RULE — REFERENCE_VALID (must reference
                     an existing page) + self-reference rejection.
                     Self-reference is CLIENT-SIDE PRE-CHECKABLE on
                     UPDATE (exclude the record's own id from the
                     parent picker's options, same pattern as
                     RULE-SEC-045's self-copy sub-case); reference
                     validity against a real existing page is server-
                     enforced (the picker's options already come from
                     a real page list, so an invalid reference should
                     be structurally unreachable in normal use, but the
                     server check remains authoritative)
  Evaluation timing : ON_CHANGE (self-reference, picker filtering) +
                     ON_SUBMIT (existence, server round-trip)
```

### F3-VALIDATION — RULE-SEC-047 — Auto-generate 4 permissions on page create
```
RULE SOURCE:
  Statement  : The system MUST auto-generate exactly 4 Permission
               records (VIEW/CREATE/UPDATE/DELETE) named
               PERM_<PAGE_CODE>_<TYPE> for every new Page
  Message-AR : (internal behavior — no user-facing message in srs.md)
  Message-EN : (internal behavior — no user-facing message in srs.md)
  ERR-ID     : ERR-SEC-047 (no rejection case — see below)
  Scope      : CREATE only
VALIDATION SPEC: not a rejection rule — an INFORMATIONAL/UX-COPY
  requirement: the Create Page form may inform the user that saving
  will auto-generate 4 permission records, and should surface the real
  `suppressPermissionTypes` field (F2-QUERY API-SEC-034 note) if
  product wants per-type suppression exposed in this form — not
  required by this plan today, available on the wire.
GOVERNANCE NOTE (documented AS-IS, not resolved here): srs.md records a
  confirmed production exception — SCR-SEC-006 (User Profile)'s
  permission set was seeded with only 3 permissions (no DELETE) via
  direct SQL, because PageService itself has no option to suppress
  DELETE generation for that specific historical page (GAP-SEC-03).
  Not actionable from this form; carried forward as a documented fact.
```

<!-- SUB:F3-SCR-SEC-005:END -->

<!-- SUB:F3-SCR-SEC-006:START -->

### F3 — SCR-SEC-006 — User Profile

### F3-VALIDATION — RULE-SEC-034 — Active branch validation (cross-module)
```
RULE SOURCE:
  Statement  : The system MUST validate that branchIdFk references an
               existing, active ORG_BRANCH row via cross-module call
               before saving
  Message-AR : الفرع المحدَّد غير موجود أو غير نشط
  Message-EN : Selected branch does not exist or is not active
  ERR-ID     : ERR-SEC-034
  Scope      : CREATE, UPDATE (SecUserProfile)
VALIDATION SPEC:
  Field            : branchIdFk (branch select)
  Validation type  : REQUIRED + BUSINESS_RULE (cross-module existence +
                     active-status check, XM-SEC-001 — see F1-MODEL
                     ENTITY-SEC-009 correction #7). The select's own
                     OPTIONS already come from Organization's live
                     branch list (useOrganizationStore, confirmed
                     Shell-compatible), so an inactive/nonexistent
                     branch should be structurally unreachable via the
                     picker in normal use — the server check remains
                     authoritative for race conditions (branch
                     deactivated between page load and submit).
  Zod primitive     : z.number() (required, no client-side enum — the
                     valid set is the dynamically loaded branch list,
                     not a fixed union)
  Evaluation timing : ON_CHANGE (picker only offers valid-looking
                     options) + ON_SUBMIT (server round-trip,
                     authoritative)
```

<!-- SUB:F3-SCR-SEC-006:END -->

<!-- SUB:F3-SCR-SEC-007:START -->

### F3 — SCR-SEC-007 — Role Data Scope (Branch Assignment)

### F3-VALIDATION — RULE-SEC-035 — Data access level required and valid
```
RULE SOURCE:
  Statement  : The system MUST require dataAccessLevel and MUST
               validate it is an active LOV-SEC-002 code
  Message-AR : مستوى الوصول للبيانات إلزامي ويجب أن يكون قيمة معتمَدة
  Message-EN : Data access level is required and must be a valid,
               active value
  ERR-ID     : ERR-SEC-035
  Scope      : CREATE, UPDATE (SecRoleBranch)
VALIDATION SPEC:
  Field            : dataAccessLevel
  DB Column        : DATA_ACCESS_LEVEL (VARCHAR(30))
  Validation type  : REQUIRED + LOV_VALID
  Zod primitive     : z.enum(['BRANCH_ONLY','BRANCH_AND_CHILDREN',
                     'ALL']) — CORRECTED values, per F1-MODEL
                     ENTITY-SEC-010 correction #3 / F2-LOV-QUERY
                     LOV-SEC-002. This is the single highest-stakes
                     validator in this plan: the Shell's original
                     ('BRANCH'|'CHILDREN'|'ALL') values would pass a
                     naively-copied client-side Zod check yet still
                     fail server-side on every save — this corrected
                     enum is what actually prevents that failure mode
                     at the form layer, before the request is even
                     sent.
  Evaluation timing : ON_CHANGE (select is constrained to the 3 valid
                     values) + ON_SUBMIT (defense-in-depth)
```

### F3-VALIDATION — RULE-SEC-036 — No duplicate role-branch assignment
```
RULE SOURCE:
  Statement  : The system MUST prevent duplicate (roleIdFk, branchIdFk)
               assignments
  Message-AR : هذا الفرع مُسنَد بالفعل لهذا الدور
  Message-EN : This branch is already assigned to this role
  ERR-ID     : ERR-SEC-036
  Scope      : CREATE only (the composite PK itself makes this
               structurally impossible to violate on UPDATE, since
               UPDATE targets an existing (roleId, branchId) pair by
               definition)
VALIDATION SPEC:
  Field            : the (roleIdFk, branchIdFk) pair as a whole
  Validation type  : UNIQUE_CHECK (composite)
  Evaluation timing : ON_SUBMIT only — no client-side pre-check exists
                     without fetching the full existing-assignments
                     list for the selected role first, which this plan
                     does not add as a mandatory pre-flight (would
                     require an extra round trip not called for by any
                     confirmed screen behavior); surfaced via 409/422
                     -> toast using ERR-SEC-036's message on failure
```

<!-- SUB:F3-SCR-SEC-007:END -->

<!-- PHASE:F3:END -->

---

<!-- PHASE:F4:START -->

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

<!-- SUB:F4-SCR-SEC-001:START -->

### F4-SCREEN — SCR-SEC-001 — Authentication & Self-Service
```
Shell status     : UNCONFIRMED (0.2.1 / OQ-SEC-FE-001) — src/pages/
                   Login.tsx exists per ui-ux-spec.md ("already exists
                   — extend, do not replace") but is outside shell-
                   manifest-SECURITY.md's declared scope; its internal
                   structure (sub-form components, current guard
                   state) was not confirmed this session.
Screen key       : n/a — this screen is reached BEFORE the
                   isAuthenticated gate, not via a `currentScreen`
                   switch case (it IS what renders when
                   isAuthenticated is false)
Component file   : src/pages/Login.tsx (per ui-ux-spec.md; internal
                   sub-form breakdown UNCONFIRMED — do not invent
                   sub-component file paths beyond this one confirmed
                   entry file)
Guard            : n/a (this screen has no guard — it IS the
                   unauthenticated-state render path)
PERM_*           : none (pre-authentication)
COMPONENTS: UNCONFIRMED beyond the single Login.tsx entry file — this
  plan does not invent a file-per-sub-form breakdown (Signup.tsx,
  ActivateAccount.tsx, etc.) that no artifact confirms exists. If
  Login.tsx renders all 5 flows internally (single-file, tab/state-
  switched) or as separate files is unknown pending Shell confirmation
  (OQ-SEC-FE-001).
Facade Hook      : useAuthFacade() (F2-FACADE-HOOK SCR-SEC-001)
Shared UI imports: UNCONFIRMED (Shell state unknown)
```

<!-- SUB:F4-SCR-SEC-001:END -->

<!-- SUB:F4-SCR-SEC-002:START -->

### F4-SCREEN — SCR-SEC-002 — User Management
```
Shell status     : CONFIRMED — component already exists and is
                   correctly wired into the switch.
Screen key       : 'sec-users' (App.tsx:49-57, confirmed)
Component file   : src/pages/Security/Users.tsx (confirmed)
Guard (AS-IS)    : NONE per-screen — only the single global
                   isAuthenticated check in App.tsx gates entry to the
                   whole authenticated shell, this screen included.
Guard (FLAGGED ADDITION — F4-RULE-3 equivalent in a router-less
  architecture): wrap this switch case's render with a permission
  check — `if (!canView) return <Unauthorized />` — sourced from
  SCR-SEC-002's permission hook (SEC-FE phase), itself checking the
  current user's permissions array for PERM_USER_VIEW (the one
  confirmed real PERM_* literal, per permissionmanagement.md's
  example). This does not exist in the Shell today; added here as an
  explicit, flagged gap per CONTRACT-12 v2.1, not silently assumed
  present.
PERM_* required  : PERM_USER_VIEW (list/search — CONFIRMED real
                   literal), PERM_USER_CREATE / PERM_USER_UPDATE /
                   PERM_USER_DELETE (inferred by the standard
                   PERM_<PAGE_CODE>_<TYPE> pattern from RULE-SEC-047,
                   using the confirmed pageCode "USER" — these three
                   specific literals are a direct, low-risk pattern
                   application, not a guess at an unconfirmed
                   pageCode, unlike the OQ-SEC-FE-003 cases)
COMPONENTS:
  UsersPage
    Path        : src/pages/Security/Users.tsx (confirmed)
    Screen key  : 'sec-users'
    Facade Hook : useUserManagementFacade()
  Composite Screen (CORE-9): Search+Entry live in ONE component
    (UsersPage renders both the search/table view and the create/edit
    dialog internally) — confirmed AS-IS, NOT split into separate
    Search/Entry route-level components per F4-RULE-5's usual pattern,
    because there is no router to place them on separate routes. This
    is documented as the real Shell's structure, not corrected —
    CONTRACT-12 v2.1's "confirm, don't redesign" mandate applies
    directly here: F4-RULE-5 assumes a routed architecture this module
    does not have.
  UserProfileDrawer (shared, launched from this screen)
    Path        : src/components/features/UserProfileDrawer.tsx
    Facade Hook : useUserProfileFacade() (SCR-SEC-006)
  DataScopeDrawer (shared, launched from this screen)
    Path        : src/components/features/DataScopeDrawer.tsx
    Facade Hook : useRoleDataScopeFacade() (SCR-SEC-007)
Shared UI imports: confirmed from shell-manifest description — data
  table, KPI stat row, search/status filter bar, dialogs (exact
  component-library names not enumerated in shell-manifest; not
  invented here)
```

<!-- SUB:F4-SCR-SEC-002:END -->

<!-- SUB:F4-SCR-SEC-003:START -->

### F4-SCREEN — SCR-SEC-003 — Role & RBAC Management
```
Shell status     : CONFIRMED.
Screen key       : 'sec-roles' (App.tsx:49-57, confirmed)
Component file   : src/pages/Security/Roles.tsx (confirmed)
Guard (AS-IS)    : NONE per-screen (same single global gate as
                   SCR-SEC-002).
Guard (FLAGGED ADDITION): same pattern as SCR-SEC-002 — permission
  check sourced from SCR-SEC-003's permission hook, checking against
  PERM_ROLE_* — see PERM_* note below.
PERM_* required  : real pageCode for the Role screen was NOT confirmed
                   by literal example this session (unlike "USER") —
                   covered by OQ-SEC-FE-003. This plan does not print a
                   guessed PERM_ROLE_VIEW/etc. literal; SEC-FE resolves
                   it against the live Page Registry at implementation
                   time.
COMPONENTS:
  RolesPage
    Path        : src/pages/Security/Roles.tsx (confirmed)
    Screen key  : 'sec-roles'
    Facade Hook : useRoleManagementFacade()
  Composite Screen (CORE-9): Search+Entry in ONE component (create/
    edit dialog with embedded permission matrix, "sync all"/"copy from
    role" actions, all internal to RolesPage) — confirmed AS-IS, same
    router-less rationale as SCR-SEC-002.
  DataScopeDrawer (shared, launched from this screen)
    Path        : src/components/features/DataScopeDrawer.tsx
    Facade Hook : useRoleDataScopeFacade() (SCR-SEC-007)
Shared UI imports: data table, KPI stat row, search/status filter bar,
  dialog with embedded permission-matrix sub-panel (not enumerated
  further by shell-manifest; not invented here)
```

<!-- SUB:F4-SCR-SEC-003:END -->

<!-- SUB:F4-SCR-SEC-004:START -->

### F4-SCREEN — SCR-SEC-004 — Permission Registry
```
Shell status     : CONFIRMED.
Screen key       : 'sec-permissions' (App.tsx:49-57, confirmed)
Component file   : src/pages/Security/Permissions.tsx (confirmed)
Guard (AS-IS)    : NONE per-screen (same single global gate).
Guard (FLAGGED ADDITION): same pattern — permission check against
  PERM_PERMISSION_* (pageCode unconfirmed, OQ-SEC-FE-003 applies here
  too).
PERM_* required  : unconfirmed pageCode — OQ-SEC-FE-003.
COMPONENTS:
  PermissionsPage
    Path        : src/pages/Security/Permissions.tsx (confirmed)
    Screen key  : 'sec-permissions'
    Facade Hook : usePermissionRegistryFacade()
  Composite Screen (CORE-9): Search+Entry in ONE component, no delete
    action (confirmed match to the real API's own absent delete
    endpoint — see F1-MODEL ENTITY-SEC-003) — AS-IS, router-less.
Shared UI imports: data table, KPI stat row, search/module filter bar,
  create/edit dialog (not enumerated further by shell-manifest)
```

<!-- SUB:F4-SCR-SEC-004:END -->

<!-- SUB:F4-SCR-SEC-005:START -->

### F4-SCREEN — SCR-SEC-005 — Page Registry
```
Shell status     : CONFIRMED.
Screen key       : 'sec-pages' (App.tsx:49-57, confirmed)
Component file   : src/pages/Security/Pages.tsx (confirmed)
Guard (AS-IS)    : NONE per-screen (same single global gate).
Guard (FLAGGED ADDITION): same pattern — permission check against
  PERM_PAGE_* (pageCode unconfirmed by literal example for THIS
  registry screen itself — the "PAGE" business concept is confirmed as
  a data type, ENTITY-SEC-004, but not as a literal pageCode string
  for the registry screen's own permission record — OQ-SEC-FE-003
  applies).
PERM_* required  : unconfirmed pageCode — OQ-SEC-FE-003. NOTE also that
                   deactivate specifically requires PAGE_DELETE per
                   API-SEC-033's real permission annotation (a backend
                   permission KEY name, not the same thing as this
                   screen's own PERM_PAGE_* frontend gating literal —
                   flagged so the two are not conflated during
                   implementation).
COMPONENTS:
  PagesRegistryPage
    Path        : src/pages/Security/Pages.tsx (confirmed)
    Screen key  : 'sec-pages'
    Facade Hook : usePageRegistryFacade()
  Composite Screen (CORE-9): Search+Entry in ONE component — entry is
    a DRAWER (confirmed shell-manifest terminology, not a dialog) —
    AS-IS, router-less. Flat (non-tree) rendering confirmed AS-IS
    despite parentId existing on the model (per-OQ-013 in-code
    comment, already noted at F1/F2) — this plan does NOT declare a
    PagesTreePage or a /tree route: no tree component exists in the
    Shell, and F4-RULE-1's tree-route-ordering requirement does not
    apply to a screen that was deliberately built flat.
Shared UI imports: data table, KPI stat row, search/module/status
  filter bar, create/edit drawer (not enumerated further by
  shell-manifest)
```

<!-- SUB:F4-SCR-SEC-005:END -->

<!-- SUB:F4-SCR-SEC-006:START -->

### F4-SCREEN — SCR-SEC-006 — User Profile [AS-BUILT identity preserved]
```
Shell status     : CONFIRMED.
Screen key       : n/a — not a top-level switch case; a shared drawer
                   opened from SCR-SEC-002's UsersPage.
Component file   : src/components/features/UserProfileDrawer.tsx
                   (confirmed)
Guard (AS-IS)    : none of its own — inherits SCR-SEC-002's (currently
                   also none beyond the global gate) context.
Guard (FLAGGED ADDITION): gate the drawer's OPEN action (not a
  separate render path) on PERM_USER_PROFILE_* (pageCode unconfirmed —
  OQ-SEC-FE-003), sourced from the drawer's own permission hook.
PERM_* required  : unconfirmed pageCode — OQ-SEC-FE-003.
COMPONENTS:
  UserProfileDrawer
    Path        : src/components/features/UserProfileDrawer.tsx
                   (confirmed)
    Props       : isOpen, onClose, user (confirmed, unchanged — see F1)
    Facade Hook : useUserProfileFacade(userId)
Shared UI imports: drawer form fields (fullNameEn, fullNameAr, branch
  select, preferred language, employee ID, active switch — confirmed
  field list, shell-manifest)
```

<!-- SUB:F4-SCR-SEC-006:END -->

<!-- SUB:F4-SCR-SEC-007:START -->

### F4-SCREEN — SCR-SEC-007 — Role Data Scope (Branch Assignment)
```
Shell status     : CONFIRMED.
Screen key       : n/a — shared drawer opened from both SCR-SEC-002
                   (Users) and SCR-SEC-003 (Roles).
Component file   : src/components/features/DataScopeDrawer.tsx
                   (confirmed)
Guard (AS-IS)    : none of its own — inherits whichever launching
                   screen's context (currently also none beyond the
                   global gate).
Guard (FLAGGED ADDITION): gate the drawer's OPEN action on
  PERM_ROLE_UPDATE (this one IS a confirmed real permission-check
  literal — RoleAccessService's SecRoleBranchService endpoints require
  ROLE_VIEW/ROLE_UPDATE/ROLE_CREATE/ROLE_DELETE per
  securitydatascoperolebranches.md's own "Required permission(s)"
  annotations — reuse those exact confirmed names rather than
  inventing a new PERM_DATASCOPE_* family this screen has no evidence
  of owning).
PERM_* required  : ROLE_VIEW (view), ROLE_CREATE (create), ROLE_UPDATE
                   (update), ROLE_DELETE (delete) — all four CONFIRMED
                   literal from securitydatascoperolebranches.md's
                   endpoint docs, not inferred/guessed.
COMPONENTS:
  DataScopeDrawer
    Path        : src/components/features/DataScopeDrawer.tsx
                   (confirmed)
    Props       : isOpen, onClose, scope, roleId? (confirmed, unchanged
                   — see F1)
    Facade Hook : useRoleDataScopeFacade(roleId, branchId)
Shared UI imports: drawer form fields (role select, branch select, data
  access level select, active switch, conditional delete button —
  confirmed field list, shell-manifest)
```

<!-- SUB:F4-SCR-SEC-007:END -->

<!-- PHASE:F4:END -->

---

<!-- PHASE:SEC-FE:START -->

## PHASE SEC-FE — Frontend Security Specifications

```
GOVERNANCE NOTE (applies to every block below): this module has no
PROJECT-3-BACKEND-ENGINE.md SEC-BE phase output to reference — SECURITY
is an EXCEPTION module that never passed through the forward P0->P1->
P2->P3.1 pipeline (0.1 GATE note), so no formal "Permissions Matrix"
artifact from a P3.1 plan exists. This plan substitutes the REAL,
confirmed permission-annotation strings found directly in the 8 API
doc files (@PreAuthorize/@Secured-derived "Required permission(s)"
lines) as the equivalent source of truth — never inventing a
PERM_[PAGE_CODE]_[TYPE] literal beyond what F4 already confirmed
(PERM_USER_VIEW) or what the API docs state as literal Spring Security
authority names (ROLE_VIEW, ROLE_UPDATE, USER_MANAGE_ROLES, etc. — note
these are NOT all in the PERM_<CODE>_<TYPE> shape; several endpoints
use short authority names like ROLE_VIEW/PAGE_UPDATE directly, which
this plan does not silently rewrite into the PERM_* shape it hasn't
confirmed for those authorities).
```

<!-- SUB:SEC-FE-SCR-SEC-001:START -->

### SEC-FE — SCR-SEC-001 — Authentication & Self-Service
```
Screen guard     : n/a — this screen IS the unauthenticated state; it
                   has no canView gate of its own (everyone reaches it
                   when isAuthenticated is false).
Permission-based UI behavior: n/a — no permission-gated fields/actions
  exist pre-authentication.
EXCEPTION module scope: SCR-SEC-001's own Shell status is UNCONFIRMED
  (OQ-SEC-FE-001) — this block cannot confirm real guard code either;
  documented as n/a-by-design (pre-auth) rather than "missing."
```

<!-- SUB:SEC-FE-SCR-SEC-001:END -->

<!-- SUB:SEC-FE-SCR-SEC-002:START -->

### SEC-FE — SCR-SEC-002 — User Management
```
Screen guard     : navigation to 'sec-users' requires canView = true
                   (sourced from PERM_USER_VIEW, CONFIRMED real
                   literal) -> canView = false: render <Unauthorized/>
                   in place of UsersPage for this switch case (FLAGGED
                   ADDITION per F4 — no guard exists in the Shell
                   today).

Permission-based UI behavior:
  canView    = false -> blocked at the switch-case level (see above)
  canCreate  = false -> "Add User" entry point not shown (PERM_USER_
                        CREATE, pattern-derived per RULE-SEC-047)
  canEdit    = false -> edit dialog fields read-only, save unavailable
                        (PERM_USER_UPDATE, pattern-derived)
  canDelete  = false -> delete action not shown (PERM_USER_DELETE,
                        pattern-derived)
  canApprove = n/a   -> no approval workflow on this screen

SEC-IMPL-RULE-2: all four flags above are loaded once at
  F2-SCREEN-INIT (SCR-SEC-002) and read from the Facade — never
  re-derived ad hoc inside a component.
SEC-IMPL-RULE-3: HTTP 403 from any of this screen's mutations (only
  API-SEC-012, assign-roles, has an explicit permission requirement —
  USER_MANAGE_ROLES) is caught and shown as a localized message via
  the PHASE F2 global 403 -> unauthorized-redirect route.

CROSS-SCREEN NOTE: this screen also launches UserProfileDrawer
  (SCR-SEC-006) and DataScopeDrawer (SCR-SEC-007) — each drawer's OWN
  SEC-FE block (below) governs its own guard, independent of
  SCR-SEC-002's canEdit/canDelete flags.
```

<!-- SUB:SEC-FE-SCR-SEC-002:END -->

<!-- SUB:SEC-FE-SCR-SEC-003:START -->

### SEC-FE — SCR-SEC-003 — Role & RBAC Management
```
Screen guard     : navigation to 'sec-roles' requires canView = true.
                   PERM_* literal unconfirmed for this screen's own
                   pageCode (OQ-SEC-FE-003) — implementation resolves
                   at runtime against the live Page Registry rather
                   than a literal this plan invents.

Permission-based UI behavior:
  canView    = false -> blocked at the switch-case level
  canCreate  = false -> "Add Role" entry point not shown
  canEdit    = false -> edit dialog (incl. permission matrix, "sync
                        all", "copy from role") read-only, save
                        unavailable
  canDelete  = false -> delete action not shown
  canApprove = n/a

FIELD-LEVEL EXCEPTION (does not follow the screen-wide canEdit flag):
  the VIEW column in the permission matrix is ALWAYS rendered
  checked+disabled regardless of canEdit's value — this is RULE-SEC-042
  (VIEW cannot be independently toggled), not a permission-gating
  concern; the two constraints are independent and both apply.

SEC-IMPL-RULE-3: 403s from API-SEC-016/017/018/019/020/021/024/025/026/
  050 (all of which carry explicit ROLE_VIEW/ROLE_UPDATE/ROLE_DELETE/
  ROLE_CREATE requirements per roleaccesscontrol.md) route through the
  same global 403 handler.

CROSS-SCREEN NOTE: also launches DataScopeDrawer (SCR-SEC-007) — its
  own SEC-FE block governs its guard independently.
```

<!-- SUB:SEC-FE-SCR-SEC-003:END -->

<!-- SUB:SEC-FE-SCR-SEC-004:START -->

### SEC-FE — SCR-SEC-004 — Permission Registry
```
Screen guard     : navigation to 'sec-permissions' requires canView =
                   true. PERM_* literal unconfirmed (OQ-SEC-FE-003).

Permission-based UI behavior:
  canView    = false -> blocked at the switch-case level
  canCreate  = false -> "Add Permission" entry point not shown
  canEdit    = false -> edit dialog's `name` field (the only writable
                        field, per API-SEC-027) read-only, save
                        unavailable
  canDelete  = n/a   -> confirmed no delete capability exists in the
                        real API at all (F1-MODEL ENTITY-SEC-003) —
                        this is not a permission-gated absence, it is
                        a structural one; do not conflate the two
  canApprove = n/a

SEC-IMPL-RULE-3: API-SEC-029 (search) is the only endpoint in this
  file with an explicit permission requirement (PERMISSION_VIEW);
  API-SEC-027/028 (update/create) carry no documented permission
  annotation at all in permissionmanagement.md — flagged here as a
  real, confirmed asymmetry (search is gated, write is not, per the
  doc) rather than assumed to be an oversight this plan should paper
  over.
```

<!-- SUB:SEC-FE-SCR-SEC-004:END -->

<!-- SUB:SEC-FE-SCR-SEC-005:START -->

### SEC-FE — SCR-SEC-005 — Page Registry
```
Screen guard     : navigation to 'sec-pages' requires canView = true.
                   PERM_* literal unconfirmed (OQ-SEC-FE-003).

Permission-based UI behavior:
  canView    = false -> blocked at the switch-case level
  canCreate  = false -> "Add Page" entry point not shown (real:
                        PAGE_CREATE required, confirmed literal)
  canEdit    = false -> edit drawer read-only, save unavailable (real:
                        PAGE_UPDATE required, confirmed literal)
  canDelete  = false -> deactivate action not shown (real: PAGE_DELETE
                        required for deactivate specifically — NOT
                        PAGE_UPDATE, confirmed literal, see F4/F2
                        notes under API-SEC-033); reactivate uses
                        PAGE_UPDATE (confirmed literal, API-SEC-032)
  canApprove = n/a

SEC-IMPL-RULE-2/3: this screen has the clearest real permission-key
  confirmation of the four registry screens (PAGE_VIEW/PAGE_CREATE/
  PAGE_UPDATE/PAGE_DELETE are all literal, confirmed authority names
  from pagemanagement.md — distinct from the still-unconfirmed
  PERM_PAGE_* frontend-gating literal used for the switch-case guard
  itself, which is a separate concept per the SEC-FE governance note
  above).
```

<!-- SUB:SEC-FE-SCR-SEC-005:END -->

<!-- SUB:SEC-FE-SCR-SEC-006:START -->

### SEC-FE — SCR-SEC-006 — User Profile [AS-BUILT identity preserved]
```
Screen guard     : opening the drawer requires canView = true (real:
                   USER_PROFILE_VIEW, confirmed literal).

Permission-based UI behavior:
  canView    = false -> drawer open action not shown from SCR-SEC-002
  canEdit    = false -> all fields read-only, save unavailable (real:
                        USER_PROFILE_UPDATE, confirmed literal)
  canCreate  = false -> save blocked on the create-branch of the
                        composed saveProfile() operation (real:
                        USER_PROFILE_CREATE, confirmed literal) —
                        NOTE this is a THIRD distinct permission from
                        canEdit's USER_PROFILE_UPDATE, since create and
                        update are genuinely separate real endpoints
                        (API-SEC-040 vs API-SEC-038) with separate
                        permission requirements — the Facade's single
                        saveProfile() operation (F2) must check the
                        RIGHT one of the two depending on which branch
                        it takes, not a single canEdit flag for both
  canDelete  = n/a   -> confirmed no delete capability (isActiveFl
                        toggle via update stands in for it)
  canApprove = n/a

OQ-015 CARRYOVER (final repetition, security-layer completeness): none
  of these permission flags relate to allowedBranches[] enforcement —
  that gap remains entirely unaddressed by any layer of this plan,
  frontend or backend, and is not claimed to be here.
```

<!-- SUB:SEC-FE-SCR-SEC-006:END -->

<!-- SUB:SEC-FE-SCR-SEC-007:START -->

### SEC-FE — SCR-SEC-007 — Role Data Scope (Branch Assignment)
```
Screen guard     : opening the drawer requires canView = true (real:
                   ROLE_VIEW, confirmed literal — reused from the Role
                   entity's own permission family, per the F4 note
                   that this screen has no PERM_DATASCOPE_* family of
                   its own).

Permission-based UI behavior:
  canView    = false -> drawer open action not shown from either
                        launching screen
  canCreate  = false -> save blocked on the create branch (real:
                        ROLE_CREATE, confirmed literal)
  canEdit    = false -> data access level field read-only, save
                        unavailable on the update branch (real:
                        ROLE_UPDATE, confirmed literal)
  canDelete  = false -> conditional delete button not shown (real:
                        ROLE_DELETE, confirmed literal)
  canApprove = n/a

OQ-015 CARRYOVER (final repetition): same as SCR-SEC-006 — this is the
  screen most likely to be mistaken for actual data-scope enforcement;
  it is configuration UI only, gated by ordinary CRUD permissions, not
  a data-filtering mechanism.
```

<!-- SUB:SEC-FE-SCR-SEC-007:END -->

<!-- PHASE:SEC-FE:END -->

---

<!-- PHASE:ALIGN-FE:START -->

## ALIGN-FE GATE — SECURITY — PLAN-ID: PLAN-SEC-FE-001

```
═══════════════════════════════════════════════════════════════════════════
SCREEN STRUCTURE CHECKS                                     │ Status
──────────────────────────────────────────────────────────┼──────────────
All SCR-IDs from SRS appear in Screen Registry              │ ✓ (7/7)
Every SCR-ID has F1 model specification                     │ ✓ (7/7)
Every SCR-ID has F2 screen init specification                │ ✓ (7/7)
Every SCR-ID has F2 facade specification                     │ ✓ (7/7)
Every SCR-ID has SEC-FE block defined                        │ ✓ (7/7)
Every SCR-ID has F4-SCREEN block defined                     │ ✓ (7/7 —
  reshaped for the router-less Shell per the F4 governance note; SCR-
  SEC-001's block is UNCONFIRMED-content but present, not missing)
Composite Screen UX separation declared for all entities     │ ⚠ PARTIAL
  (Search view = Entry view, SAME component, for all 4 registry
  screens — CORRECTLY documented as AS-IS per CORE-9's own "same
  SCR-ID" rule and CONTRACT-12 v2.1's confirm-don't-redesign mandate;
  flagged ⚠ rather than ✓ only because this deliberately departs from
  F4-RULE-5's usual separate-component pattern — the departure itself
  is the correct call for a router-less Shell, not a plan defect)
Every F1/F4 element traces to flow-diagram.md/ui-ux-spec.md or to    │ ✓
  srs.md B1-B4 directly — no untraceable UI decision                │
──────────────────────────────────────────────────────────┼──────────────
LOV / LOOKUP CHECKS                                         │ Status
──────────────────────────────────────────────────────────┼──────────────
All LOV-IDs from SRS appear in LOV Registry                 │ ✓ (2/2 —
  LOV-SEC-001, LOV-SEC-002)
Every LOV-ID has F2 LOV service method specification        │ ⚠ PARTIAL
  (both have F2-LOV-QUERY blocks; neither has a real runtime fetch —
  LOV-SEC-001 by permanent documented deviation, LOV-SEC-002 by a
  confirmed temporary gap, both disclosed in-block, not silently
  hardcoded without explanation)
No F1 model uses ENUM for LOV fields (all string)            │ ✓ (both
  are TS string unions, not TS/runtime enums)
Every LOV F3 validator references runtime options            │ ✓ (RULE-
  SEC-035/F3 uses the corrected LOV-SEC-002 values directly)
──────────────────────────────────────────────────────────┼──────────────
BUSINESS CODE CHECKS (frontend half)                        │ Status
──────────────────────────────────────────────────────────┼──────────────
Every master entity has Business Code field in F1            │ ⚠ N/A-BY-
  DESIGN for 4/6 entities — srs.md itself states Business Code is
  "NOT IMPLEMENTED" (ENTITY-SEC-001/002/004, deviation from BC-RULE-1/2,
  documented AS-IS) or "لا ينطبق" (ENTITY-SEC-003/009/010, genuinely
  not applicable). This is not a plan gap — it is a confirmed AS-BUILT
  characteristic of an EXCEPTION module; F1 does not fabricate a
  Business Code field none of these entities has.
Business Code fields are readonly in F1 specifications        │ ✓ (roleCode,
  pageCode both documented read-only-after-creation where a natural-key
  substitute exists)
Business Code shown as read-only display in F3 specs          │ ✓
  (RULE-SEC-048/046)
──────────────────────────────────────────────────────────┼──────────────
LOCALIZATION CHECKS (frontend half)                          │ Status
──────────────────────────────────────────────────────────┼──────────────
All F3 validators reference ERR-ID (no hardcoded messages)    │ ⚠ PARTIAL
  BY DISCLOSED SUBSTITUTION — every F3 block references a synthetic
  ERR-SEC-{NNN} id, 1:1 with its RULE-SEC-{NNN}, sourced verbatim from
  srs.md A4's Message-AR/Message-EN pairs (see PHASE F3's governance
  gap note) — no real ERR-ID registry exists for this EXCEPTION module
  to reference instead; this is the closest compliant approximation,
  not a silent hardcode
──────────────────────────────────────────────────────────┼──────────────
SECURITY CHECKS (frontend half)                              │ Status
──────────────────────────────────────────────────────────┼──────────────
Every SCR-ID has SEC-FE block                                 │ ✓ (7/7)
Every PERM_* in F4 also appears in [SEC-BE's Permissions Matrix]│ ⚠
  SUBSTITUTED SOURCE — no SEC-BE phase/Permissions Matrix artifact
  exists for this EXCEPTION module (see PHASE SEC-FE governance note).
  Cross-checked instead against the real API docs' own permission
  annotations: PERM_USER_VIEW (permissionmanagement.md example),
  ROLE_VIEW/ROLE_CREATE/ROLE_UPDATE/ROLE_DELETE (roleaccesscontrol.md +
  securitydatascoperolebranches.md annotations), PAGE_VIEW/PAGE_CREATE/
  PAGE_UPDATE/PAGE_DELETE (pagemanagement.md annotations),
  PERMISSION_VIEW (permissionmanagement.md), USER_MANAGE_ROLES/
  USER_PROFILE_VIEW/USER_PROFILE_CREATE/USER_PROFILE_UPDATE (usermanag
  ement.md/securitydatascopeuserprofiles.md). Every literal used in F4/
  SEC-FE traces to one of these confirmed sources. The remaining
  unconfirmed PERM_<PAGE_CODE>_<TYPE> literals (Role/Permission/Page
  registry screens' OWN view-gating permission, Profile/DataScope
  screens' own registry pageCode) are NOT invented — OQ-SEC-FE-003 —
  and this is why this row is ⚠, not ✓: some real values remain
  genuinely unconfirmed by this session's artifacts, not fabricated.
═══════════════════════════════════════════════════════════════════════════
```

```
TEST-FE COVERAGE CHECKS (Summary validation)                 │ Status
──────────────────────────────────────────────────────────┼──────────────
TC Coverage Matrix Summary (frontend) present                 │ ✓ (SECTION D
  below)
No GAP ✗ entries in SCR-ID coverage without DEFERRED           │ ✓ (all 7
  screens COVERED ✓ or explicitly DEFERRED — see SECTION D; none silently
  omitted)
NOTE: Full TC block validation is in Project 4.2 CHECK-4
═══════════════════════════════════════════════════════════════════════════
ALIGN-FE GATE RESULT: PASSED ✓ WITH 5 DISCLOSED SUBSTITUTIONS/PARTIALS
  (all ⚠ rows above) — none of the 5 are blocking: each has either a
  confirmed AS-BUILT rationale (Composite Screen non-separation,
  Business Code N/A) or an explicit OQ-ID / disclosed-substitution
  trail (LOV runtime fetch gaps, ERR-ID substitution, PERM_* sourcing
  substitution). No item was silently marked ✓ to force a pass.
Auto-correction applied: DRV-IDs implicitly assigned throughout F1-F4
  wherever a Shell/API mismatch was corrected in-place (e.g. F1-MODEL
  ENTITY-SEC-010's dataAccessLevel enum correction, F1-MODEL
  ENTITY-SEC-002's permission-matrix reshaping) — this plan uses
  inline "CORRECTIONS REQUIRED" numbered lists rather than a separate
  DRV-ID ledger, since every correction is already sourced and
  numbered at its point of use; no correction was left unsourced.
═══════════════════════════════════════════════════════════════════════════
```

<!-- PHASE:ALIGN-FE:END -->

---

## SECTION D — TC Coverage Matrix Summary (Frontend)

```
TC COVERAGE MATRIX SUMMARY (FRONTEND) — SECURITY — PLAN-ID: PLAN-SEC-FE-001
═══════════════════════════════════════════════════════════════════════════
NOTE: TC-IDs listed here are placeholders — full Given/When/Then blocks
are assigned in frontend-test-plan.md, generated after this ALIGN-FE ✓.

SCR-ID COVERAGE:
SCR-ID          │ Happy path UI TC        │ Rule violation TC        │ Status
────────────────┼─────────────────────────┼──────────────────────────┼────────
SCR-SEC-001     │ TC-FE-SEC-001 (login)   │ TC-FE-SEC-002 (bad creds)│ PARTIAL ⚠
                │ TC-FE-SEC-003 (signup)  │ TC-FE-SEC-004 (dup       │ (Shell
                │                          │   username/email)        │ UNCONFIRMED,
                │                          │                          │ OQ-SEC-FE-001)
SCR-SEC-002     │ TC-FE-SEC-005 (search)  │ TC-FE-SEC-006 (delete    │ COVERED ✓
                │ TC-FE-SEC-007 (create,  │   blocked, active tokens)│
                │   2-step incl. roles)   │ TC-FE-SEC-008 (email     │
                │                          │   field disabled, OQ-002)│
SCR-SEC-003     │ TC-FE-SEC-009 (search)  │ TC-FE-SEC-010 (delete    │ COVERED ✓
                │ TC-FE-SEC-011 (create)  │   blocked, has users)    │
                │ TC-FE-SEC-012 (sync     │ TC-FE-SEC-013 (VIEW      │
                │   pages, "sync all")    │   checkbox non-toggleable)│
                │ TC-FE-SEC-014 (copy     │ TC-FE-SEC-015 (self-copy │
                │   from role)            │   rejected client-side)  │
SCR-SEC-004     │ TC-FE-SEC-016 (search)  │ TC-FE-SEC-017 (create)   │ COVERED ✓
SCR-SEC-005     │ TC-FE-SEC-018 (search,  │ TC-FE-SEC-019 (dup       │ COVERED ✓
                │   incl. active filter)  │   pageCode/route)        │
                │ TC-FE-SEC-020 (create,  │ TC-FE-SEC-021 (self-     │
                │   flat list confirmed)  │   reference parentId)    │
SCR-SEC-006     │ TC-FE-SEC-022 (view/    │ TC-FE-SEC-023 (invalid   │ COVERED ✓
                │   edit profile)         │   branch)                │
SCR-SEC-007     │ TC-FE-SEC-024 (assign   │ TC-FE-SEC-025 (duplicate │ COVERED ✓
                │   scope)                │   role-branch, corrected │
                │                          │   enum values save OK)   │

MODULE INTEGRATION FLOW COVERAGE:
User lifecycle   │ TC-FE-SEC-026 (create->assign roles->search)
                 │ TC-FE-SEC-027 (update->search)
                 │ TC-FE-SEC-028 (delete->search, blocked case)
Role lifecycle   │ TC-FE-SEC-029 (create->assign pages->activate/
                 │   deactivate->search)
                 │ TC-FE-SEC-030 (copy-from-role->verify matrix)
Page lifecycle   │ TC-FE-SEC-031 (create->auto-4-permissions verify->
                 │   search)
                 │ TC-FE-SEC-032 (deactivate->reactivate->search)
Cross-screen     │ TC-FE-SEC-033 (Users->UserProfileDrawer save->
                 │   reflected on Users list)
                 │ TC-FE-SEC-034 (Users AND Roles->DataScopeDrawer,
                 │   both entry points verified)

═══════════════════════════════════════════════════════════════════════════
Gate rule: same COVERED ✓ / PARTIAL ⚠ / GAP ✗ semantics as backend.
SCR-SEC-001 is the only PARTIAL ⚠ — not a GAP ✗ — because the gap is
sourced to a disclosed, tracked cause (OQ-SEC-FE-001, Shell state
unconfirmed) rather than an omission; test cases are still placeholder-
listed against design intent so frontend-test-plan.md has something
real to expand once the Shell state is confirmed.
═══════════════════════════════════════════════════════════════════════════
```

---

## AGENT HANDOFF SUMMARY (not a phase — no marker)

### What the Agent Receives
```
AGENT INPUT PACKAGE:
  [x] frontend-execution-plan.md — this file (complete frontend spec)
  [x] srs.md (srsSECURITY.md) — functional requirements
  [x] real API Docs — index.md + 8 endpoint-group files (50 endpoints)
  [x] flow-diagram.md (flowdiagram2.md) + ui-ux-spec.md (uiuxspec2.md)
      — design intent reference
  [x] shell-manifest-SECURITY.md — real UI Shell state (CONTRACT-12 v2.1
      second gate input — not part of the engine's original v2.0 input
      package, added by the v2.1 gate)
  [x] OQ Log — srs.md's canonical OQ-001..016 (3 carried as
      informational: OQ-014/015/016) plus this plan's own
      OQ-SEC-FE-001/002/003 (new, session-local, none blocking)
```

### Agent Reading Order
```
1. Read PLAN HEADER (Section 0, incl. both CONTRACT-12 gates) —
   understand full scope and the SCR-SEC-001 Shell-state caveat
2. Read PHASE F1 — confirmed/corrected TypeScript models (pay close
   attention to ENTITY-SEC-010's dataAccessLevel enum correction — the
   highest-stakes fix in this plan)
3. Read PHASE F2 — Facade/query contracts; note the two LOV gaps
   (LOV-SEC-001 permanent, LOV-SEC-002 temporary) and the no-count-
   endpoint KPI-derivation gaps on 3 screens
4. Read PHASE F3 — validation rules; note the ERR-ID governance
   substitution declared once at the top of the phase
5. Read PHASE F4 — routing/component structure; READ THE GOVERNANCE
   DECISION POINT AT THE TOP FIRST — this module has no React Router,
   every F4-SCREEN block is reshaped accordingly, and F4-RULE-1/2/3/5
   as literally written in the engine spec do not apply verbatim here
6. Read PHASE SEC-FE — permission-based UI behavior; note the
   SEC-BE-substitution governance note at the top (no formal
   Permissions Matrix artifact exists for this EXCEPTION module)
7. Read SECTION D — TC Coverage Matrix Summary; SCR-SEC-001 is the
   only PARTIAL ⚠ row (tracked to OQ-SEC-FE-001)
   Full TC blocks: to be generated in frontend-test-plan.md, a
   SEPARATE file this session did not produce (out of scope for the
   single "execution plan" request this session responded to)
8. Cross-reference the real API Docs directly for exact endpoint/DTO
   shapes whenever implementing — this plan documents them accurately
   but the docs remain the authoritative source of truth (CONTRACT-12)
```

### Open items an implementing agent must NOT resolve unilaterally
```
OQ-SEC-FE-001 — SCR-SEC-001 (Login.tsx) real Shell state is unconfirmed.
  Do not assume any particular sub-form breakdown; confirm against the
  real file before generating code that touches it.
OQ-SEC-FE-002 — Users Email field has no backend write path. Do not
  silently add a hidden endpoint or silently drop the field from the
  UI without a product decision — render disabled per F3.
OQ-SEC-FE-003 — most screens' real backend pageCode (and therefore
  PERM_<PAGE_CODE>_<TYPE> literals) are unconfirmed beyond "USER". Do
  not invent literals — resolve against the live Page Registry.
OQ-014/015/016 (srs.md, informational carryovers) — not blocking, but
  do not silently claim allowedBranches[] enforcement exists anywhere
  (OQ-015) when implementing SCR-SEC-006/007.
```

## FRONTEND PLAN COMPLETENESS SELF-CHECK (not a phase — no marker)

```
FRONTEND PLAN CHECKS:
[x] Every SCR-ID has F1 model spec                      — 7/7
[x] Every SCR-ID has F2-SCREEN-INIT spec                — 7/7
[x] Every SCR-ID has F2-FACADE spec                     — 7/7
[x] Every API-ID has F2-SERVICE spec (matching a REAL   — 50/50
    endpoint)
[x] Every LOV-ID has F2-LOV-SERVICE spec                — 2/2 (both
    with disclosed runtime-fetch gaps, not silently hidden)
[x] Facade state: currentPage and pageSize declared as derived — not
    separate state                                       — confirmed
    throughout F2 (global rule + every Facade block)
[x] Error routing declared: 400->inline / 409->toast / 401->login /
    403->unauth                                          — PHASE F2
    global declaration, referenced throughout
[x] Pre-deactivation usage check declared for every deactivate
    operation                                             — PHASE F2
    global declaration: none exists in the real API for this module;
    documented as a confirmed absence, not silently assumed present
[x] Every F3 RULE-ID: references ERR-ID — no hardcoded message text
    — all 18 frontend-surfaced rules use synthetic ERR-SEC-{NNN}
    (disclosed substitution, PHASE F3 intro); 6 no-frontend-surface
    rules explicitly listed as such, not silently omitted
[x] Every SCR-ID has F4-SCREEN block (route path, guards, components,
    file paths)                                           — 7/7,
    reshaped per the router-less governance decision (screen key
    instead of route path — disclosed, not silently substituted)
[ ] Every tree-bearing entity (self-referencing FK) has a TreeComponent
    declared — N/A: ENTITY-SEC-004 (Page) IS self-referencing
    (parentId) but SCR-SEC-005 is confirmed AS-IS flat, not tree-
    rendered (per OQ-013 in-code comment) — no TreeComponent exists to
    declare; documenting this true absence is not the same as failing
    the check
[ ] /tree child routes declared BEFORE /:id/* routes — N/A, same
    reason (no routes of any kind exist in this module)
[x] All PERM_* codes in F4 blocks sourced from a real source — none
    invented; unconfirmed ones tracked as OQ-SEC-FE-003 rather than
    guessed

CROSS-CUTTING CHECKS:
[x] TC Coverage Matrix Summary (frontend) present in SECTION D
[x] Derivation/correction entries present for every non-obvious
    inference — inline "CORRECTIONS REQUIRED" / "DRV-ID" notes
    throughout F1-F4 rather than a separate ledger (see ALIGN-FE gate
    result note on this choice)
[x] ALIGN-FE gate passed (PASSED with 5 disclosed ⚠ substitutions/
    partials, none blocking)

STRUCTURAL SELF-CHECK (AMEND-P3-M):
[x] Every phase has exactly one PHASE:{key}:START and one matching
    :END, {key} one of the six canonical keys — verified below
[x] No section or heading label repeats anywhere in this document
[x] Trailing content (this Agent Handoff Summary, this Self-Check)
    sits after PHASE:ALIGN-FE:END, headings contain no "PHASE" word,
    carry no marker of their own
[x] Every SUB threshold was checked while writing each phase (F1-F4 at
    7 screens, ≥5 threshold triggered SUB splitting from the start —
    not retrofitted)
```

