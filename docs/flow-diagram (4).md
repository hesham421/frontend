# Navigation Flow Diagram — All Four Modules
## flow-diagram.md — SEC · ORG · FILE · NOTIF

```
File ID        : flow-diagram.md
Version        : 2.0 — English, AVELYNQ component-bound
Status         : RECONCILED — Reconciliation Gate ✓ (PRD + SRS present for all modules)
Open Questions : OQ-ORG-002 (SCR-ORG-008 RegionType admin screen — excluded)
Produced by    : UI/UX Design Engine (Project 2.5)
Stack binding  : AVELYNQ ERP Dashboard — React 18 · TypeScript 5.9 · Zustand 5
                 Primitives: Button, Input, Select, Dialog, Drawer, Tabs, Badge,
                             EmptyState, Card, Stat, Breadcrumb, Alert
```

---

## How to Read This File

Every FLOW block contains:

| Field | Meaning |
|---|---|
| **Screens involved** | SCR-IDs from SRS |
| **Sequence** | Step-by-step navigation path |
| **Trigger** | What causes the user to enter this flow |
| **Source US-ID(s)** | PRD user story traceability |
| **Source SCR-ID(s)** | SRS screen traceability |
| **AVELYNQ Components** | Which design-system primitives are used |
| **Status** | RECONCILED · BLOCKED-BY-OQ |

---

# ══════════════════════════════════════════════════════════
# MODULE: SECURITY (SEC)
# ══════════════════════════════════════════════════════════

## Application Entry Architecture

```
Public URL (unauthenticated)
        │
        ▼
  SCR-SEC-001 ── Login / Self-Registration / Password Recovery
        │
        │  JWT issued → useAuthStore.login()
        ▼
  App Shell (AppShell.tsx)
    ├── Sidebar navigation — built dynamically from API-SEC-048
    │   (only pages where user has VIEW permission appear)
    ├── Topbar — global search · notification bell (SCR-NOTIF-001) · lang toggle
    │
    ├── Security section ──┬── SCR-SEC-002  User Management
    │                      ├── SCR-SEC-003  Role & RBAC Management
    │                      ├── SCR-SEC-004  Permission Registry
    │                      └── SCR-SEC-005  Page Registry
    │
    └── [every screen] ── Header Bell ── SCR-NOTIF-001
```

---

## FLOW-SEC-001 — Login

```
FLOW-SEC-001
  Screens involved : SCR-SEC-001
  Sequence         : Public URL
                     → Login tab (username + password fields)
                     → [Sign In] button → POST /api/auth/login
                     → JWT stored in useAuthStore
                     → redirect to Dashboard (currentScreen = 'dashboard')
  Trigger          : User visits app without active session
  Source US-ID(s)  : US-SEC-001, US-SEC-002
  Source SCR-ID(s) : SCR-SEC-001
  Status           : RECONCILED
  AVELYNQ Components:
    - Login.tsx (existing page — extend, do not replace)
    - Button variant="primary" size="lg" block loading → Sign In action
    - Input type="text"  label="Username"
    - Input type="password" label="Password"
    - Alert variant="danger" → credential error display
    - Switch / language toggle in topbar corner → useLanguage()
  Navigation note  : No Navigation Guard — fully public route
                     On success: useNavigationStore.setCurrentScreen('dashboard')
```

---

## FLOW-SEC-002 — Self-Registration & Account Activation

```
FLOW-SEC-002
  Screens involved : SCR-SEC-001 (Signup + Activate sub-forms)
  Sequence         : Login page → "Create Account" tab
                     → Signup form (username · email · password)
                     → [Register] → POST /api/auth/signup
                     → Activation email sent (via AuthEventListener · US-SEC-018)
                     → User clicks activation link (deep URL with token param)
                     → Activate sub-form (token auto-extracted from URL)
                     → [Activate] → POST /api/auth/activate
                     → redirect to Login with success Alert
  Trigger          : New user needs an account
  Source US-ID(s)  : US-SEC-005, US-SEC-006, US-SEC-018
  Source SCR-ID(s) : SCR-SEC-001
  Status           : RECONCILED
  AVELYNQ Components:
    - Tabs variant="underline" items=[{id:'login'},{id:'register'}]
    - Input (username, email, password fields)
    - Button variant="primary" loading → Register / Activate
    - Alert variant="success" → activation confirmed
    - Alert variant="warning" → token expired + resend link
```

---

## FLOW-SEC-003 — Password Recovery

```
FLOW-SEC-003
  Screens involved : SCR-SEC-001 (ForgotPassword + ResetPassword sub-forms)
  Sequence         : Login tab → "Forgot password?" link
                     → ForgotPassword form (email field)
                     → [Send Reset Link] → POST /api/auth/forgot-password
                     → Ambiguous success message (RULE-SEC-038 — no account existence leak)
                     → Reset email sent (via US-SEC-018)
                     → User clicks reset link (token in URL)
                     → ResetPassword form (newPassword + confirmPassword)
                     → [Reset Password] → POST /api/auth/reset-password
                     → redirect to Login
  Trigger          : User cannot recall credentials
  Source US-ID(s)  : US-SEC-007, US-SEC-008, US-SEC-018
  Source SCR-ID(s) : SCR-SEC-001
  Status           : RECONCILED
  AVELYNQ Components:
    - Input (email · password · confirm)
    - Button variant="primary" loading
    - Alert variant="info" → ambiguous success ("If your email exists…")
```

---

## FLOW-SEC-004 — User Management (Admin)

```
FLOW-SEC-004
  Screens involved : SCR-SEC-002 → SCR-SEC-006 (Profile Modal)
                                 → SCR-SEC-007 (DataScope Modal)
  Sequence         :
    Sidebar → Security → Users
        │
        ├─ [Search bar] — filter: username · enabled dropdown
        │   Table: username · email · enabled Badge · actions
        │
        ├─ [+ New User] (PERM_USER_CREATE)
        │     Dialog opens →
        │       Input: username* · email · password*
        │       Switch: enabled
        │       Select (multi): roles[]
        │     [Save] → POST /api/users → close Dialog → refresh list
        │
        ├─ [Edit] row action (PERM_USER_UPDATE)
        │     Same Dialog, password field hidden
        │     [Save] → PUT /api/users/{id}
        │
        ├─ [Delete] row action (PERM_USER_DELETE)
        │     Confirmation Dialog → DELETE /api/users/{id}
        │
        ├─ [Profile →] link inside Edit Dialog (PERM_USER_PROFILE_*)
        │     → Drawer opens: SCR-SEC-006 fields
        │         Select: branchIdFk (cross-module LOV, active only)
        │         Input: fullNameEn · fullNameAr · preferredLang · employeeIdFk
        │         Switch: isActiveFl
        │         NO Delete button (RULE-SEC-047 intentional exception)
        │     [Save] → PUT /api/v1/security/user-profiles/{userId}
        │
        └─ [Data Scope →] link inside Edit Dialog (PERM_ROLE_UPDATE)
              → Drawer opens: SCR-SEC-007 fields
                  Select: roleIdFk · branchIdFk · dataAccessLevel
                  Switch: isActiveFl
              [Save] → POST/PUT /api/v1/security/role-branches

  Trigger          : Admin navigates to Security > Users
  Source US-ID(s)  : US-SEC-009, US-SEC-017, US-SEC-016
  Source SCR-ID(s) : SCR-SEC-002, SCR-SEC-006, SCR-SEC-007
  Status           : RECONCILED
  AVELYNQ Components:
    - Breadcrumb items=[{label:'Security'},{label:'Users'}]
    - Stat cards: total users · active · disabled (summary row)
    - Input iconLeft="ti ti-search" → search filter
    - Select → enabled filter
    - Card variant="flat" → table wrapper
    - Badge variant="success"|"neutral" → enabled/disabled status
    - Dialog (create/edit user)
    - Drawer (profile · data scope)
    - Button variant="danger" → delete
    - Alert variant="warning" → deactivation blocked
    - EmptyState icon="ti-users" → no results
```

---

## FLOW-SEC-005 — Role & RBAC Management (Admin)

```
FLOW-SEC-005
  Screens involved : SCR-SEC-003 → SCR-SEC-007 (DataScope sub-panel)
  Sequence         :
    Sidebar → Security → Roles
        │
        ├─ [Search] — filter: roleName (only allowed field per SRS B2)
        │   Table: roleCode · roleName · description · active Badge
        │
        ├─ [+ New Role] (PERM_ROLE_CREATE)
        │     Dialog →
        │       Input: roleCode* · roleName* · description
        │       Switch: IS_ACTIVE
        │     [Save] → role created, permissions matrix now empty
        │
        ├─ [Edit] → same Dialog + Permission Matrix panel below form
        │     Permission Matrix (sub-panel inside Dialog):
        │       Table: Page Name × VIEW × CREATE × UPDATE × DELETE (checkboxes)
        │       VIEW auto-checked when any page is added (RULE-SEC-042)
        │       Actions: [+ Add Page] [Sync All] [Copy From Role ▾]
        │
        ├─ [Activate] / [Deactivate] — separate buttons (2026-08-23 correction)
        │     PUT /api/roles/{id}/activate  or  /deactivate
        │
        ├─ [Delete] (PERM_ROLE_DELETE, RULE-SEC-048)
        │     Confirmation Dialog — warns if role is assigned to users
        │
        └─ [Branch Data Scope →] inside Edit Dialog
              → Drawer: SCR-SEC-007 (same as FLOW-SEC-004)

  Trigger          : Admin navigates to Security > Roles
  Source US-ID(s)  : US-SEC-010, US-SEC-011, US-SEC-016
  Source SCR-ID(s) : SCR-SEC-003, SCR-SEC-007
  Status           : RECONCILED
  AVELYNQ Components:
    - Breadcrumb → Security > Roles
    - Input iconLeft="ti ti-search"
    - Badge variant="success"|"neutral" → active status
    - Dialog (role form + embedded permission matrix)
    - Checkbox → per-permission cell
    - Alert variant="warning" → copy-from confirmation
    - Drawer → DataScope (SCR-SEC-007)
    - EmptyState icon="ti-shield-lock"
```

---

## FLOW-SEC-006 — Permission Registry (Admin)

```
FLOW-SEC-006
  Screens involved : SCR-SEC-004
  Sequence         :
    Sidebar → Security → Permissions
        │
        ├─ Inline table with filter bar
        │   Filters: name (text) · module (text)
        │   Table: name · permissionType · page · actions
        │
        ├─ [+ New Permission] (PERM_PERMISSION_CREATE)
        │     Dialog →
        │       Input: name* (pattern PERM_<CODE>_<TYPE>)
        │       Select: permissionType (Java enum via LOV-SEC-001)
        │       Select: page (optional — empty = system-level)
        │     [Save] → POST /api/permissions
        │
        └─ [Edit] row action (PERM_PERMISSION_UPDATE)
              Same Dialog → PUT /api/permissions/{id}
              ⚠ No Delete endpoint confirmed (AS-IS)

  Trigger          : Admin navigates to Security > Permissions
  Source US-ID(s)  : US-SEC-013
  Source SCR-ID(s) : SCR-SEC-004
  Status           : RECONCILED
  AVELYNQ Components:
    - Card variant="flat" → inline table wrapper
    - Dialog → create/edit form
    - Input · Select fields
    - EmptyState icon="ti-key"
```

---

## FLOW-SEC-007 — Page Registry (Admin)

```
FLOW-SEC-007
  Screens involved : SCR-SEC-005
  Sequence         :
    Sidebar → Security → Pages
        │
        ├─ [Search] filters: pageCode · module · active dropdown
        │   Table: pageCode · nameEn · module · route · active Badge
        │   ⚠ Flat list — NO tree view (OQ-013 final: PATTERN-1 matches AS-IS build)
        │
        ├─ [+ New Page] (PERM_PAGE_CREATE)
        │     Drawer →
        │       Input: pageCode* (auto-uppercase, ^[A-Z0-9_]+$)
        │       Input: nameEn* · nameAr*
        │       Input: route* (must start with /)
        │       Input: icon · module
        │       Select: parentId (self-referencing, cannot point to self)
        │       Input: displayOrder · description
        │     [Save] → auto-generates 4 permissions (RULE-SEC-047)
        │
        ├─ [Edit] → same Drawer → PUT /api/pages/{id}
        │
        ├─ [Deactivate] (PERM_PAGE_DELETE)
        │     PUT /api/pages/{id}/deactivate
        │
        └─ [Reactivate] (PERM_PAGE_UPDATE)
              PUT /api/pages/{id}/reactivate

  Trigger          : Admin navigates to Security > Pages
  Source US-ID(s)  : US-SEC-012
  Source SCR-ID(s) : SCR-SEC-005
  Status           : RECONCILED
  AVELYNQ Components:
    - Input iconLeft="ti ti-search"
    - Select → active filter
    - Badge variant="success"|"neutral"
    - Drawer → create/edit (large form, Drawer preferred over Dialog)
    - Button variant="danger" → Deactivate
    - Button variant="accent" → Reactivate
    - EmptyState icon="ti-layout-grid"
```

---

## FLOW-SEC-008 — Dynamic Navigation Menu

```
FLOW-SEC-008
  Screens involved : (no independent SCR-ID — runtime build)
  Sequence         : After login JWT issued
                     → GET /api/menu/user-menu (API-SEC-048)
                     → MenuItemDto[] tree received
                     → Sidebar.tsx renders only VIEW-permitted items
                     Admin tool: GET /api/menu/user-menu/{userId} (PERM_USER_VIEW)
  Trigger          : Every authenticated session start
  Source US-ID(s)  : US-SEC-014, US-SEC-015
  Source SCR-ID(s) : (SRS B5 only — no standalone SCR-ID)
  Status           : RECONCILED
  Note             : Sidebar is already implemented — extend to consume
                     the dynamic menu API response instead of static config
```

---

## SEC Module Flow Summary

| Flow | Screens | Pattern | Gate Permission |
|---|---|---|---|
| FLOW-SEC-001 | SCR-SEC-001 (Login) | PATTERN-3 | Public |
| FLOW-SEC-002 | SCR-SEC-001 (Signup) | PATTERN-3 | Public |
| FLOW-SEC-003 | SCR-SEC-001 (Reset) | PATTERN-3 | Public |
| FLOW-SEC-004 | SCR-SEC-002, 006, 007 | P1 + P2 | PERM_USER_VIEW |
| FLOW-SEC-005 | SCR-SEC-003, 007 | P1 + P2 | PERM_ROLE_VIEW |
| FLOW-SEC-006 | SCR-SEC-004 | PATTERN-2 | PERM_PERMISSION_VIEW |
| FLOW-SEC-007 | SCR-SEC-005 | PATTERN-1 | PERM_PAGE_VIEW |
| FLOW-SEC-008 | (dynamic sidebar) | — | JWT |

---

# ══════════════════════════════════════════════════════════
# MODULE: ORGANIZATION (ORG)
# ══════════════════════════════════════════════════════════

## ORG Hierarchy Overview

```
Sidebar → Organization
        │
        ├── SCR-ORG-001  Legal Entities  ──────────────────────────┐
        │         └──→  SCR-ORG-002  Branches ──────────────────┐  │
        │                      ├──→  SCR-ORG-004  Departments    │  │
        │                      │     (tree view)                 │  │
        │                      ├──→  SCR-ORG-005  Cost Centers   │  │
        │                      │     (tree view)                 │  │
        │                      └──→  SCR-ORG-007  Location Sites │  │
        │                                                         │  │
        ├── SCR-ORG-003  Regions ←───────────────────────────────│──┘
        │                 (legal_entity_fk + region_type_id_fk)   │
        │                                                         │
        └── SCR-ORG-006  Profit Centers ←───────────────────────-┘
                          (legal_entity_fk)

Hierarchy: LegalEntity → Branch → (Departments | CostCenters | LocationSites)
           LegalEntity → (Regions | ProfitCenters) [direct]
```

---

## FLOW-ORG-001 — Legal Entities

```
FLOW-ORG-001
  Screens involved : SCR-ORG-001
  Sequence         :
    Sidebar → Organization → Legal Entities
        │
        ├─ Filter bar: legal_entity_code · name_en · name_ar
        │              entity_type_id Select · is_active_fl Select
        │   Table: code · nameEn · nameAr · entityType · status Badge
        │   Actions: [New] [Edit] [Deactivate/Activate] [Export]
        │
        ├─ [+ New Legal Entity] (PERM_LEGAL_ENTITY_CREATE)
        │     Drawer →
        │       Input: nameEn* · nameAr*
        │       Select: entityTypeId* (Head Office / Branch Office /
        │                              Subsidiary / Representative Office)
        │       Input: notes (multiline)
        │       [code auto-generated — not shown in Create]
        │     [Save] → POST /api/v1/org/legal-entities
        │
        ├─ [Edit] → same Drawer, code shown Read-Only
        │     [Deactivate] → PUT …/deactivate
        │       Alert variant="warning" if active branches exist (RULE-ORG-001/002)
        │     [Activate] → PUT …/activate
        │
        └─ Context link: [View Branches →] → navigates to SCR-ORG-002
                          filtered by this legalEntityId

  Trigger          : PERM_LEGAL_ENTITY_VIEW
  Source US-ID(s)  : US-ORG-001, US-ORG-008, US-ORG-015, US-ORG-016, US-ORG-019
  Source SCR-ID(s) : SCR-ORG-001
  Status           : RECONCILED
  AVELYNQ Components:
    - Breadcrumb → Organization > Legal Entities
    - Stat row: total · active · inactive
    - Input iconLeft="ti ti-search"
    - Select (entity type filter · status filter)
    - Card variant="flat" → table
    - Badge variant="success"|"neutral"
    - Drawer width="lg" → create/edit form
    - Alert variant="warning" → cascade deactivation blocked
    - EmptyState icon="ti-building"
```

---

## FLOW-ORG-002 — Branches

```
FLOW-ORG-002
  Screens involved : SCR-ORG-002
  Sequence         :
    Sidebar → Organization → Branches   [or context link from SCR-ORG-001]
        │
        ├─ Filters: branch_code · name_en · legal_entity_fk Select
        │            branch_type_id Select · is_active_fl Select
        │   Table: code · nameEn · legalEntity · branchType · status
        │
        ├─ [+ New Branch] →
        │     Drawer → nameEn* · nameAr* · legalEntityFk* (active only LOV)
        │              branchTypeId* (Main/Sub/Operations/Admin) · notes
        │     [Save] → POST /api/v1/org/branches
        │
        ├─ [Edit] → same Drawer
        │     [Deactivate] → cascade check: Departments | CostCenters |
        │                     LocationSites active? (RULE-ORG-003/004/005)
        │
        └─ Context links in Edit:
               [View Departments →] → SCR-ORG-004 filtered by branchId
               [View Cost Centers →] → SCR-ORG-005 filtered by branchId
               [View Location Sites →] → SCR-ORG-007 filtered by branchId

  Trigger          : PERM_BRANCH_VIEW
  Source US-ID(s)  : US-ORG-002, US-ORG-009, US-ORG-015, US-ORG-016, US-ORG-019
  Source SCR-ID(s) : SCR-ORG-002
  Status           : RECONCILED
  AVELYNQ Components:
    - Breadcrumb → Organization > Branches
    - Input · Select filters
    - Drawer → create/edit
    - Alert variant="warning" → cascade deactivation blocked
    - EmptyState icon="ti-building-skyscraper"
```

---

## FLOW-ORG-003 — Regions

```
FLOW-ORG-003
  Screens involved : SCR-ORG-003
  Sequence         :
    Sidebar → Organization → Regions
        │
        ├─ Filters: region_code · name_en · legal_entity_fk Select
        │            region_type_id_fk Select · is_active_fl Select
        │
        ├─ [+ New Region] →
        │     Drawer → nameEn* · nameAr* · legalEntityFk* (active only)
        │              regionTypeIdFk* (active types only)
        │              notes
        │     [Deactivate] → RULE-ORG-006/017
        │
        └─ ⚠ OQ-ORG-002: SCR-ORG-008 (Region Type management screen)
               referenced in SRS A5 but has no B-blocks specification.
               regionTypeIdFk renders as a read-only LOV for now.
               BLOCKED-BY-OQ-ORG-002 — escalation required.

  Trigger          : PERM_REGION_VIEW
  Source US-ID(s)  : US-ORG-003, US-ORG-014, US-ORG-015, US-ORG-016, US-ORG-019
  Source SCR-ID(s) : SCR-ORG-003
  Status           : RECONCILED (SCR-ORG-008 carried → OQ-ORG-002)
  AVELYNQ Components:
    - Breadcrumb → Organization > Regions
    - Input · Select filters · Drawer form
    - EmptyState icon="ti-map-pin"
```

---

## FLOW-ORG-004 — Departments (Tree Hierarchy)

```
FLOW-ORG-004
  Screens involved : SCR-ORG-004 (PATTERN-3 Specialized Tree)
  Sequence         :
    Sidebar → Organization → Departments   [or context link from SCR-ORG-002]
        │
        ├─ [Branch selector — required filter]
        │   No tree renders until a branch is selected
        │   Additional filters: name_en · node_type_id · is_active_fl
        │
        ├─ Two-column layout:
        │   LEFT — Tree Panel
        │     Expandable/collapsible node tree
        │     Node types: Summary (folder icon) · Detail (leaf icon)
        │     Per-node actions: [+ Child] [Edit] [Deactivate]
        │     [+ Root Department] button at panel top
        │
        │   RIGHT — Entry Panel
        │     Populates when a node is selected or [+ New] clicked
        │     Fields: nameEn* · nameAr* · branchFk* ·
        │             parentDepartmentFk (auto-filled from selected node)
        │             nodeTypeId* (locked after first save — RULE-ORG-020)
        │             notes
        │     [code auto-generated]
        │     [Save] / [Cancel] / [Deactivate]
        │
        └─ Summary nodes display "SUMMARY" Badge (no-posting warning)

  Trigger          : PERM_DEPARTMENT_VIEW
  Source US-ID(s)  : US-ORG-004, US-ORG-010, US-ORG-015, US-ORG-016, US-ORG-019
  Source SCR-ID(s) : SCR-ORG-004
  Status           : RECONCILED
  AVELYNQ Components:
    - Breadcrumb → Organization > Departments
    - Select → branch filter (required — same pattern as existing Organization.tsx tree)
    - Card variant="default" padding="none" → tree panel
    - Card variant="flat" → entry panel
    - Badge variant="warning" → SUMMARY node indicator
    - Input · Select → entry fields
    - Alert variant="info" → "Select a branch to view the department tree"
    - EmptyState icon="ti-sitemap" → no departments yet
    Note: Organization.tsx already has an org-unit tree — reuse that
          tree interaction pattern for consistency
```

---

## FLOW-ORG-005 — Cost Centers (Tree Hierarchy)

```
FLOW-ORG-005
  Screens involved : SCR-ORG-005 (PATTERN-3 Specialized Tree — same as ORG-004)
  Sequence         : [Identical pattern to FLOW-ORG-004]
    Sidebar → Organization → Cost Centers
        │
        ├─ Required filter: branch_fk
        │   Additional: name_en · node_type_id · cost_center_type_id · is_active_fl
        │
        └─ Two-column Tree + Entry layout (same as Departments)
             Entry fields: nameEn* · nameAr* · branchFk* ·
                           parentCostCenterFk (from tree) ·
                           nodeTypeId* (locked post-save — RULE-ORG-020) ·
                           costCenterTypeId* (Direct / Indirect / Shared) ·
                           notes

  Trigger          : PERM_COST_CENTER_VIEW
  Source US-ID(s)  : US-ORG-005, US-ORG-011, US-ORG-012, US-ORG-015, US-ORG-016, US-ORG-019
  Source SCR-ID(s) : SCR-ORG-005
  Status           : RECONCILED
  AVELYNQ Components: Same as FLOW-ORG-004 + Badge variant="neutral" for cost center type
```

---

## FLOW-ORG-006 — Profit Centers

```
FLOW-ORG-006
  Screens involved : SCR-ORG-006 (PATTERN-1)
  Sequence         :
    Sidebar → Organization → Profit Centers
        │
        ├─ Filters: profit_center_code · name_en · legal_entity_fk · is_active_fl
        │
        └─ [+ New] → Drawer → nameEn* · nameAr* · legalEntityFk* · notes

  Trigger          : PERM_PROFIT_CENTER_VIEW
  Source US-ID(s)  : US-ORG-006, US-ORG-015, US-ORG-016, US-ORG-019
  Source SCR-ID(s) : SCR-ORG-006
  Status           : RECONCILED
  AVELYNQ Components:
    - Breadcrumb · Input · Select · Drawer · EmptyState icon="ti-trending-up"
```

---

## FLOW-ORG-007 — Location Sites

```
FLOW-ORG-007
  Screens involved : SCR-ORG-007 (PATTERN-1)
  Sequence         :
    Sidebar → Organization → Location Sites   [or context link from SCR-ORG-002]
        │
        ├─ Filters: location_site_code · name_en · branch_fk Select
        │            site_type_id Select · is_active_fl Select
        │
        └─ [+ New] → Drawer → nameEn* · nameAr* · branchFk* (active only)
                               siteTypeId* (Office/Warehouse/Factory/Site/Retail)
                               notes

  Trigger          : PERM_LOCATION_SITE_VIEW
  Source US-ID(s)  : US-ORG-007, US-ORG-013, US-ORG-015, US-ORG-016, US-ORG-019
  Source SCR-ID(s) : SCR-ORG-007
  Status           : RECONCILED
  AVELYNQ Components:
    - Breadcrumb · Input · Select · Drawer · EmptyState icon="ti-map-pin-2"
```

---

## ORG Module Flow Summary

| Flow | Screen | Pattern | Permission Gate |
|---|---|---|---|
| FLOW-ORG-001 | SCR-ORG-001 | P1 | PERM_LEGAL_ENTITY_VIEW |
| FLOW-ORG-002 | SCR-ORG-002 | P1 | PERM_BRANCH_VIEW |
| FLOW-ORG-003 | SCR-ORG-003 | P1 | PERM_REGION_VIEW |
| FLOW-ORG-004 | SCR-ORG-004 | P3-Tree | PERM_DEPARTMENT_VIEW |
| FLOW-ORG-005 | SCR-ORG-005 | P3-Tree | PERM_COST_CENTER_VIEW |
| FLOW-ORG-006 | SCR-ORG-006 | P1 | PERM_PROFIT_CENTER_VIEW |
| FLOW-ORG-007 | SCR-ORG-007 | P1 | PERM_LOCATION_SITE_VIEW |

⚠ SCR-ORG-008 (Region Type) — BLOCKED-BY-OQ-ORG-002

---

# ══════════════════════════════════════════════════════════
# MODULE: FILE SERVICE (FILE)
# ══════════════════════════════════════════════════════════

## FILE Architecture Overview

```
FILE is a shared embedded widget — no independent navigation route.
It is injected into host screens across all modules.

  [Any host screen — e.g. Purchase Order, Sales Order]
        │
        └── File Attachment Panel (SCR-FILE-001 — PATTERN-2 Inline)
              ├── File list (by ownerId + ownerType)
              ├── [Upload] → token first → actual upload
              ├── [Download] → token → binary stream
              └── [Delete] → token → confirm → delete (owner or Admin)
```

---

## FLOW-FILE-001 — File Attachment Panel (Embedded)

```
FLOW-FILE-001
  Screens involved : SCR-FILE-001 (inline panel embedded in host screen)
  Sequence         :
    [Host screen passes: ownerId · ownerType · moduleCode]
        │
        ├─ File list loaded (API-FILE-005)
        │   Columns: fileName · category · type Badge · size · uploadDate · actions
        │
        ├─ [Upload]
        │     Select: fileCategoryFk (filtered by moduleCode)
        │     File picker — drag & drop zone
        │     Step 1: issue upload token (API-FILE-001) — RULE-FILE-004
        │     Step 2: POST to /upload/{token} — RULE-FILE-001 (≤5MB)
        │                                       RULE-FILE-005 (MIME from content)
        │     Progress bar → list refresh on success
        │
        ├─ [Download ⬇] per row
        │     Step 1: issue download token (API-FILE-001 download variant, TTL 100min)
        │     Step 2: GET /download/{token} → binary stream → browser save-as
        │
        └─ [Delete 🗑] per row
              Confirmation Dialog — "This action is irreversible"
              Step 1: issue delete token
              Step 2: DELETE /{token} — RULE-FILE-006 (no recycle bin)
                                       RULE-FILE-007 (owner or Admin only)
              Error: 403 → Alert variant="danger" "You don't own this file"

  Trigger          : PERM_FILE_ATTACHMENT_VIEW + host screen permission
  Source US-ID(s)  : US-FILE-001 → US-FILE-008
  Source SCR-ID(s) : SCR-FILE-001
  Status           : RECONCILED
  AVELYNQ Components:
    - Card variant="flat" padding="sm" → panel wrapper
    - Badge variant="neutral" → file type
    - Select → fileCategoryFk (filtered)
    - Button variant="primary" iconLeft="ti ti-upload"
    - Button variant="ghost" iconLeft="ti ti-download"
    - IconButton icon="ti ti-trash" variant="danger"
    - Dialog → delete confirmation
    - Alert variant="danger" → 403 ownership error
    - Alert variant="warning" → file size exceeded (pre-upload check)
    - EmptyState icon="ti-paperclip" → no attachments yet
    Note: ownerId / ownerType / moduleCode are context props — hidden from user
```

---

# ══════════════════════════════════════════════════════════
# MODULE: NOTIFICATION SERVICE (NOTIF)
# ══════════════════════════════════════════════════════════

## NOTIF Architecture Overview

```
  ┌─── App Shell Header (every screen) ──────────────────────────────┐
  │   SCR-NOTIF-001 — Notification Bell (dropdown + history page)    │
  └───────────────────────────────────────────────────────────────────┘

  Sidebar → Notification Settings (Admin only)
        │
        ├── SCR-NOTIF-002  Notification Templates
        └── SCR-NOTIF-003  Channel Configuration

  Note: Actual sending (API-NOTIF-001/002) is system-triggered only —
        no direct UI button. Invoked by other modules via RabbitMQ.
```

---

## FLOW-NOTIF-001 — Notification Bell & History

```
FLOW-NOTIF-001
  Screens involved : SCR-NOTIF-001 (PATTERN-3 Specialized)
  Sequence         :
    App Shell Header (every screen)
        │
        ├─ Bell Icon with unread counter badge (API-NOTIF-004 polling)
        │
        ├─ [Click Bell] → Dropdown panel
        │     Shows last N notifications:
        │       type icon · subject · status dot · sentAt relative time
        │     [Mark All Read] → API-NOTIF-005 (bulk)
        │     [View All →] → navigates to full History page
        │
        └─ History Page (full screen)
               Filters: type Select · status Select · date range
               Table: type · subject · preview · status Badge · sentAt
               [Mark as Read ✓] per row → API-NOTIF-005
               Contextual link per row: referenceId/referenceType
               → navigates to the linked entity screen

  Trigger          : PERM_NOTIFICATION_INBOX_VIEW (every authenticated user)
                     User sees only their own notifications (implicit DataScope)
  Source US-ID(s)  : US-NOTIF-001, US-NOTIF-002, US-NOTIF-003,
                     US-NOTIF-004, US-NOTIF-007
  Source SCR-ID(s) : SCR-NOTIF-001
  Status           : RECONCILED
  AVELYNQ Components:
    - IconButton icon="ti ti-bell" → Bell trigger (topbar, already present)
    - Badge variant="danger" dot → unread count overlay
    - Card variant="raised" → dropdown panel
    - Badge variant="primary"|"neutral" → notification type
    - Badge variant="warning" → unread status dot
    - Button variant="ghost" → Mark All Read
    - [History Page]:
        - Breadcrumb → Notifications > Inbox
        - Select → type/status filters
        - Input → date range
        - Card variant="flat" → table
        - EmptyState icon="ti-bell-off" → no notifications
```

---

## FLOW-NOTIF-002 — Notification Template Management (Admin)

```
FLOW-NOTIF-002
  Screens involved : SCR-NOTIF-002 (PATTERN-1)
  Sequence         :
    Sidebar → Notification Settings → Templates
        │
        ├─ Filters: templateCode · channelTypeId Select · moduleCode · isActiveFl
        │   Table: templateCode · templateNameEn · channel Badge · module · active Badge
        │
        ├─ [+ New Template] (PERM_NOTIFICATION_TEMPLATE_CREATE)
        │     Drawer width="lg" →
        │       Input: templateCode* (immutable after create — RULE-NOTIF-007)
        │       Input: templateNameEn* · templateNameAr*
        │       Select: channelTypeId* (Email/SMS/WhatsApp/Push/Internal)
        │       Input: moduleCode*
        │       Textarea/Rich editor: templateBodyEn* — supports Placeholders
        │       Textarea/Rich editor: templateBodyAr* — supports Placeholders
        │       [Both EN and AR body required together — RULE-NOTIF-006]
        │       Switch: isActiveFl
        │     [Save] → POST /api/v1/notifications/templates
        │
        ├─ [Edit] → same Drawer, templateCode Read-Only
        │
        └─ [Deactivate] row action → PUT …/{id}/deactivate

  Trigger          : PERM_NOTIFICATION_TEMPLATE_VIEW (Admin)
  Source US-ID(s)  : US-NOTIF-004, US-NOTIF-005
  Source SCR-ID(s) : SCR-NOTIF-002
  Status           : RECONCILED
  AVELYNQ Components:
    - Breadcrumb → Notification Settings > Templates
    - Input iconLeft="ti ti-search"
    - Select → channel/status filters
    - Badge → channel type · active status
    - Drawer width="lg" → bilingual template form
    - Alert variant="warning" → "Both EN and AR bodies are required"
    - EmptyState icon="ti-template"
```

---

## FLOW-NOTIF-003 — Channel Configuration (Admin)

```
FLOW-NOTIF-003
  Screens involved : SCR-NOTIF-003 (PATTERN-2 Inline Toggle List)
  Sequence         :
    Sidebar → Notification Settings → Channels
        │
        └─ Inline configuration table (5 fixed seed rows — no add/delete)
               Columns: Channel (Read-Only) · Enabled Toggle · Provider Config (JSON editor)
               Row actions: [Edit Config] opens inline JSON editor per row
               [Save Changes] → PUT /api/v1/notifications/channel-configs/{id}
               → RULE-NOTIF-005 (disabling a channel → future sends = CHANNEL_DISABLED)

               ⚠ AQ-010/011: SMS/WhatsApp provider config fields
                  will be populated after provider selection is finalized.
                  configJson field rendered but empty until resolved.

  Trigger          : PERM_NOTIFICATION_CHANNEL_CONFIG_VIEW (Admin)
  Source US-ID(s)  : US-NOTIF-006
  Source SCR-ID(s) : SCR-NOTIF-003
  Status           : RECONCILED
  AVELYNQ Components:
    - Breadcrumb → Notification Settings > Channels
    - Card variant="flat" → table wrapper
    - Switch → isEnabledFl per row
    - Alert variant="warning" → shown when a channel is disabled
      ("Notifications for this channel will be logged as CHANNEL_DISABLED")
    - Button variant="secondary" size="sm" → "Edit Config" per row
    - Button variant="primary" → "Save Changes"
```

---

## NOTIF Module Flow Summary

| Flow | Screen | Pattern | User Level |
|---|---|---|---|
| FLOW-NOTIF-001 | SCR-NOTIF-001 | P3 | All users (own inbox) |
| FLOW-NOTIF-002 | SCR-NOTIF-002 | P1 | Admin |
| FLOW-NOTIF-003 | SCR-NOTIF-003 | P2 | Admin |

---

# ══════════════════════════════════════════════════════════
# CROSS-MODULE NAVIGATION MAP
# ══════════════════════════════════════════════════════════

```
Cross-module data dependencies visible in UI:

SCR-SEC-006 (User Profile)  ←── branchIdFk ──→ SCR-ORG-002 (Branches)
SCR-SEC-007 (DataScope)     ←── branchIdFk ──→ SCR-ORG-002 (Branches)
SCR-FILE-001 (Attachments)  ←── embedded in any module screen (host passes context)
SCR-NOTIF-001 (Bell)        ←── always present in App Shell Header

App Shell Frame:
  ┌──────────────────────────────────────────────────────────────┐
  │ Topbar: logo · global search · 🔔 SCR-NOTIF-001 · lang · user│
  ├──────────────────────────────────────────────────────────────┤
  │ Sidebar: dynamic from API-SEC-048 (VIEW permissions only)    │
  ├──────────────────────────────────────────────────────────────┤
  │ Main Content: active module screen                           │
  │   └─ may embed SCR-FILE-001 (File Attachment Panel)          │
  └──────────────────────────────────────────────────────────────┘
```

---

## Session Summary

```
══════════════════════════════════════════════════════════════════
UI/UX DESIGN ENGINE — flow-diagram.md Session Summary
══════════════════════════════════════════════════════════════════
Language         : English
Stack binding    : AVELYNQ ERP Dashboard (React 18 / Zustand 5)
Reconciled US-IDs: 52  (SEC:18 · ORG:19 · FILE:8 · NOTIF:7)
Blocked-by-OQ    : 1   (US-ORG-014 ← SCR-ORG-008 ← OQ-ORG-002)
FLOW blocks      : 18  (SEC:8 · ORG:7 · FILE:1 · NOTIF:3)
SCR-ORG-008      : BLOCKED-BY-OQ-ORG-002 (carried from prior session)
Open AQs (non-blocking): AQ-010 (SMS) · AQ-011 (WhatsApp)
Ready for ui-ux-spec.md: ✓ YES
══════════════════════════════════════════════════════════════════
```
