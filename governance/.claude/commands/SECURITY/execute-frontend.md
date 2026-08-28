# /SECURITY/execute-frontend

Execute the current phase for SECURITY — with context safety check.

## Usage
/SECURITY/execute-frontend [PHASE]

---

## STEP 0 — Context Safety Assessment (MANDATORY)

### 0.1 — Read state, identify PENDING subs in the requested phase
### 0.2 — Look up each sub's weight from the Weight Map below
### 0.3 — Classify and decide chunking

| Total weight in phase | Action |
|---|---|
| All LIGHT/MEDIUM | Execute the whole phase in one pass |
| Any HEAVY present | Chunk — one sub (or a few LIGHT subs) per pass |
| Any XL present | That sub alone is one full pass |

### 0.4 — Print assessment, wait for confirmation
```
══════════════════════════════════════════════════════
PHASE ASSESSMENT — SECURITY / [PHASE]
══════════════════════════════════════════════════════
Subs pending : [list, weight + task count each]
Plan         : [one pass / chunked — list chunks]
══════════════════════════════════════════════════════
Proceed? [waits for confirmation]
```

---

## STEP 1 — Execution (after confirmation)

### Per sub:
1. Read `packages/frontend-execution/[PHASE]/[SUB].md` completely
2. Identify all tasks
2.5. **UI Shell reference check** — before writing any task's code,
     confirm whether a corresponding component/route already exists in
     the UI Shell. If it exists: CONFIRM/INTEGRATE, modify the existing
     file — never create a competing new one. If genuinely absent: flag
     it in the session report as a Shell gap, implement as an explicit addition.
3. **API Contract Resolution** [phases F1/F2/F3 only]: check
   `api_docs_path` first — treat it as the authoritative and only API
   contract. If an endpoint or contract detail is confirmed absent from
   api-docs, do not inspect backend source, controllers, services,
   repositories, or governance — record it in `api_doc_gaps[]` with
   resolution `"blocked pending frontend API contract clarification"`
   and continue with remaining tasks (same pattern as an OQ-blocked
   item below). Never invent the missing contract.
4. Map each task to the skill routing table in `GOVERNANCE-RULES.md`
5. Read required skills from `.github/skills/frontend/`
6. Execute all tasks in order
7. Run the phase's validation skill after the last task
8. Mark sub COMPLETE in `execution-state.json`

### Blocked items — OQ
OQ-blocked task → skip, add to `blocked[]`, mark:
`// TODO: OQ-[ID] — pending resolution`. Continue remaining tasks.

Never write an XM-related TODO in frontend code — XM-IDs are
exclusively a backend concern. If a task seems to need one, stop and
flag it instead of implementing it.

---

## STEP 2 — Session Report

Phase/sub completed, tasks executed, blocked items, any api_doc_gaps added.

---

## Weight Map — SECURITY

| Phase / Sub | Weight | Basis |
|---|---|---|
| F1 / SCR-SEC-001 (Authentication & Self-Service) | XL | Shell status UNCONFIRMED (OQ-SEC-FE-001) — no in-scope Shell model; must be built from 5 distinct auth forms (Login, Signup, Activate, Forgot password, Reset password), each backed by its own request/response DTO |
| F1 / SCR-SEC-002 (User Management) | HEAVY | 4 entities touched (UserAccount, Role, SecUserProfile, SecRoleBranch); list + create/edit dialog + delete-confirm + KPI row + 2 drawer sub-flows (UserProfileDrawer, DataScopeDrawer); no summary endpoint (KPI derived client-side) |
| F1 / SCR-SEC-003 (Role & RBAC Management) | HEAVY | 3 entities touched (Role, Page, SecRoleBranch); list + create/edit dialog with embedded permission matrix + sync-all + copy-from-role + activate/deactivate + KPI row |
| F1 / SCR-SEC-004 (Permission Registry) | MEDIUM | 2 entities touched (Permission, Page); create/edit dialog + indirect module filter; no delete action |
| F1 / SCR-SEC-005 (Page Registry) | MEDIUM | 1 entity (Page); create/edit drawer + filters + activate/deactivate + KPI row; flat (non-tree) rendering |
| F1 / SCR-SEC-006 (User Profile drawer) | LIGHT | 1 entity (SecUserProfile); single drawer, fields confirmed 1:1, only renames/type corrections |
| F1 / SCR-SEC-007 (Role Data Scope drawer) | MEDIUM | 1 entity (SecRoleBranch); single drawer, 5 fields incl. a high-stakes `dataAccessLevel` enum-value correction, conditional delete |
| F2 / SCR-SEC-001 (Authentication & Self-Service) | MEDIUM | 10 tasks (8 useMutation hooks — no queries, all pre-auth — + 1 facade hook + 1 screen-init); single facade (`useAuthFacade`), Shell wiring itself UNCONFIRMED but out of scope for F2 |
| F2 / SCR-SEC-002 (User Management) | MEDIUM | 9 tasks (7 hooks + facade + screen-init); entity UserAccount + cross-refs to Role/SecUserProfile/SecRoleBranch (owned by other subs) |
| F2 / SCR-SEC-003 (Role & RBAC Management) | HEAVY | 14 tasks (12 hooks + facade + screen-init) — highest hook count in the module; Role entity + separate Role-Pages-Matrix join resource |
| F2 / SCR-SEC-004 (Permission Registry) | MEDIUM | 6 tasks (3 hooks + facade + screen-init + 1 LOV-query); single entity (Permission) |
| F2 / SCR-SEC-005 (Page Registry) | MEDIUM | 9 tasks (7 hooks + facade + screen-init); single entity (Page) |
| F2 / SCR-SEC-006 (User Profile drawer) | MEDIUM | 7 tasks (5 hooks + facade + screen-init); single entity (SecUserProfile) |
| F2 / SCR-SEC-007 (Role Data Scope drawer) | MEDIUM | 9 tasks (6 hooks + facade + screen-init + 1 LOV-query); single entity (SecRoleBranch), composite-key query |
| F3 / SCR-SEC-001 (Authentication & Self-Service) | MEDIUM | 7 RULE-SEC blocks (030,032,033,038,040,041,050) spanning 5 auth sub-forms; mostly business-rule/server-round-trip validations |
| F3 / SCR-SEC-002 (User Management) | LIGHT | 1 RULE-SEC block (049) — consolidated username-uniqueness + delete-protection + default-role note |
| F3 / SCR-SEC-003 (Role & RBAC Management) | MEDIUM | 4 RULE-SEC blocks (042,043,045,048) — VIEW-lock matrix rule, CRUD-value restriction, copy-role rules, code/name uniqueness+immutability |
| F3 / SCR-SEC-005 (Page Registry) | LIGHT | 2 RULE-SEC blocks (046,047) — pageCode/route/parent validation, auto-gen-permissions info note |
| F3 / SCR-SEC-006 (User Profile) | LIGHT | 1 RULE-SEC block (034) — cross-module active-branch validation |
| F3 / SCR-SEC-007 (Role Data Scope) | LIGHT | 2 RULE-SEC blocks (035,036) — corrected dataAccessLevel enum (high-stakes), duplicate-assignment check |
| F4 / SCR-SEC-001 (Authentication & Self-Service) | XL | Shell status UNCONFIRMED, same basis as F1's XL call — potentially up to 5 distinct sub-form components (Login/Signup/Activate/Forgot/Reset), only Login.tsx confirmed as entry |
| F4 / SCR-SEC-002 (User Management) | MEDIUM | Guard (flagged addition) + UsersPage wiring + composite-screen doc + 2 shared-drawer launch integrations (UserProfileDrawer, DataScopeDrawer) + PERM_USER_* pattern mapping; touches 3 components though only 1 built here |
| F4 / SCR-SEC-003 (Role & RBAC Management) | MEDIUM | Guard (flagged addition) + RolesPage wiring w/ embedded permission-matrix composite + DataScopeDrawer launch integration; PERM_ROLE_* pageCode unconfirmed (OQ) |
| F4 / SCR-SEC-004 (Permission Registry) | LIGHT | Guard + PermissionsPage wiring + composite screen (no delete action); single component, ~3 items |
| F4 / SCR-SEC-005 (Page Registry) | LIGHT | Guard + PagesRegistryPage wiring + composite drawer-entry + flat(non-tree)-rendering confirmation; single component |
| F4 / SCR-SEC-006 (User Profile drawer) | LIGHT | Single shared component (UserProfileDrawer); guard addition + facade wiring only |
| F4 / SCR-SEC-007 (Role Data Scope drawer) | LIGHT | Single shared component (DataScopeDrawer); guard addition + facade wiring, 4 confirmed PERM_ROLE_* literals |
| SEC-FE / SCR-SEC-001 (Authentication & Self-Service) | LIGHT | n/a-by-design — no canView gate, no permission-gated behavior pre-authentication; essentially a documentation no-op |
| SEC-FE / SCR-SEC-002 (User Management) | MEDIUM | 4 core flags (canView/Create/Edit/Delete, canApprove n/a) + SEC-IMPL-RULE-2 (load-once-at-init) + SEC-IMPL-RULE-3 (403 routing) = 6 items |
| SEC-FE / SCR-SEC-003 (Role & RBAC Management) | MEDIUM | 4 core flags + FIELD-LEVEL EXCEPTION (VIEW column always checked+disabled, independent of canEdit) + SEC-IMPL-RULE-3 (403s across 10 endpoints) = 6 items |
| SEC-FE / SCR-SEC-004 (Permission Registry) | LIGHT | 3 core flags (canDelete n/a — structural, no delete endpoint) + 1 asymmetry note (search gated, write ungated) = 4 items |
| SEC-FE / SCR-SEC-005 (Page Registry) | MEDIUM | 4 core flags incl. deactivate/reactivate using two different real permission keys (PAGE_DELETE vs PAGE_UPDATE) + SEC-IMPL note = 5 items |
| SEC-FE / SCR-SEC-006 (User Profile drawer) | LIGHT | 3 core flags, notably canCreate is a THIRD distinct real permission (USER_PROFILE_CREATE) separate from canEdit's USER_PROFILE_UPDATE — single composed `saveProfile()` op must branch correctly |
| SEC-FE / SCR-SEC-007 (Role Data Scope drawer) | LIGHT | 4 core flags, all 4 confirmed literal permissions (ROLE_VIEW/CREATE/UPDATE/DELETE), no extra nuance beyond the flags themselves |
| ALIGN-FE / ALIGN-FE (Gate Summary) | LIGHT | Not an implementation task set — pre-passed 19-row cross-phase audit checklist (7 Screen Structure + 4 LOV/Lookup + 3 Business Code + 1 Localization + 2 Security + 2 TEST-FE Coverage rows) to read/acknowledge; no code to write |

## Phase Map — SECURITY

```
F1 (Frontend Model Specifications)                              [COMPLETE]
├── SCR-SEC-001 — Authentication & Self-Service     [XL]
├── SCR-SEC-002 — User Management                   [HEAVY]
├── SCR-SEC-003 — Role & RBAC Management             [HEAVY]
├── SCR-SEC-004 — Permission Registry                 [MEDIUM]
├── SCR-SEC-005 — Page Registry                       [MEDIUM]
├── SCR-SEC-006 — User Profile drawer                 [LIGHT]
└── SCR-SEC-007 — Role Data Scope drawer               [MEDIUM]

F2 (Data & Facade Hook Specifications)
├── SCR-SEC-001 — Authentication & Self-Service     [MEDIUM]
├── SCR-SEC-002 — User Management                   [MEDIUM]
├── SCR-SEC-003 — Role & RBAC Management             [HEAVY]
├── SCR-SEC-004 — Permission Registry                [MEDIUM]
├── SCR-SEC-005 — Page Registry                      [MEDIUM]
├── SCR-SEC-006 — User Profile drawer                [MEDIUM]
└── SCR-SEC-007 — Role Data Scope drawer             [MEDIUM]

F3 (Frontend Validation Rule Specifications)
├── SCR-SEC-001 — Authentication & Self-Service     [MEDIUM]
├── SCR-SEC-002 — User Management                   [LIGHT]
├── SCR-SEC-003 — Role & RBAC Management             [MEDIUM]
├── SCR-SEC-005 — Page Registry                      [LIGHT]
├── SCR-SEC-006 — User Profile                       [LIGHT]
└── SCR-SEC-007 — Role Data Scope                    [LIGHT]
    (no SCR-SEC-004 — Permission Registry has no frontend validation
    rule block, confirmed absent from the filesystem)

F4 (Routing & Component Structure)
├── SCR-SEC-001 — Authentication & Self-Service     [XL]
├── SCR-SEC-002 — User Management                   [MEDIUM]
├── SCR-SEC-003 — Role & RBAC Management             [MEDIUM]
├── SCR-SEC-004 — Permission Registry                [LIGHT]
├── SCR-SEC-005 — Page Registry                      [LIGHT]
├── SCR-SEC-006 — User Profile drawer                [LIGHT]
└── SCR-SEC-007 — Role Data Scope drawer             [LIGHT]
    (router-less architecture: no React Router; navigation is a
    `switch(currentScreen)` in App.tsx driven by a Zustand store)

SEC-FE (Frontend Security Specifications)
├── SCR-SEC-001 — Authentication & Self-Service     [LIGHT]
├── SCR-SEC-002 — User Management                   [MEDIUM]
├── SCR-SEC-003 — Role & RBAC Management             [MEDIUM]
├── SCR-SEC-004 — Permission Registry                [LIGHT]
├── SCR-SEC-005 — Page Registry                      [MEDIUM]
├── SCR-SEC-006 — User Profile drawer                [LIGHT]
└── SCR-SEC-007 — Role Data Scope drawer             [LIGHT]

ALIGN-FE (Cross-Phase Alignment Gate)
└── ALIGN-FE — Gate Summary     [LIGHT]  (19 checks, PASSED w/ 5 disclosed partials)
```

---

## Constraints (NON-NEGOTIABLE)

- NEVER skip STEP 0
- NEVER execute without confirmation after assessment
- NEVER invent a route path, component name, or PERM_* code — trace
  every value to an F4-SCREEN block, raise an OQ if none covers it
- NEVER redesign a component/route that already exists in the UI Shell
- NEVER call an endpoint not present in real API Docs
- NEVER consult backend source, controllers, services, repositories,
  or governance for an API detail — if missing from api-docs, record
  it in `api_doc_gaps[]` and continue
- NEVER write an XM-ID reference in frontend code
- NEVER advance phase without explicit instruction
- ALWAYS update execution-state.json after every sub
