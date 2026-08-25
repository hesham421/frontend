# UI/UX Component Specification — All Four Modules
## ui-ux-spec.md — SEC · ORG · FILE · NOTIF

```
File ID        : ui-ux-spec.md
Version        : 2.0 — English, AVELYNQ component-bound
Status         : RECONCILED — Reconciliation Gate ✓
Open Questions : OQ-ORG-002 (SCR-ORG-008 excluded)
Produced by    : UI/UX Design Engine (Project 2.5)
Stack          : AVELYNQ ERP · React 18 · TypeScript 5.9 · Zustand 5
                 Tabler icons (ti ti-*) · CSS design tokens
Governance     : Component names/layout in this file = PROPOSAL
                 Final technical decisions belong to P3.2 (F1/F4)
Source rule    : Every field in this spec traces to SRS B3.
                 Nothing is invented. Nothing is omitted.
```

---

## Pattern Reference

| Pattern | Description | Layout |
|---|---|---|
| PATTERN-1 | Search + Entry | Two states: Search screen → Entry screen (Drawer or full page) |
| PATTERN-2 | Inline / Modal | Single unified screen — Dialog or inline editing |
| PATTERN-3 | Specialized | Custom layout declared per screen |

---

## Shared Screen Anatomy (PATTERN-1 screens)

Every PATTERN-1 screen follows this consistent layout hierarchy (from PROJECT_SPEC Stage 4):

```
1. Header Bar    — Breadcrumb + h1 title + primary [+ New] Button
2. KPI Row       — 3–4 Stat cards (total · active · inactive · module-specific)
3. Filter Bar    — Input (search) + Select filters + optional view-toggle IconButton
4. Data Grid     — Card variant="flat" wrapping table with Badge status indicators
5. Detail Drawer — Drawer for create / edit
6. Dialog        — Confirmation dialogs (delete / deactivate / bulk)
7. Empty State   — EmptyState when list is empty or search returns nothing
```

---

# ══════════════════════════════════════════════════════════
# MODULE: SECURITY (SEC)
# ══════════════════════════════════════════════════════════

## SCR-SEC-001 — Authentication Shell

```
Screen     : SCR-SEC-001
Pattern    : PATTERN-3 — Specialized (5 linked public forms)
Permissions: Public — no RBAC, no Navigation Guard
Location   : Standalone — outside AppShell
File       : src/pages/Login.tsx (already exists — extend, do not replace)
```

### Layout Proposal

```
┌─────────────────────────────────────────────────────────┐
│  [AVELYNQ logo lockup — light/dark-aware]               │
│                                                         │
│  ┌─── Auth Card (Card variant="raised") ───────────┐   │
│  │  Tabs variant="underline"                        │   │
│  │  ├─ Sign In  ├─ Create Account                  │   │
│  │  ─────────────────────────────────────           │   │
│  │  [Active form — see sub-forms below]             │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Language toggle (already implemented)                  │
└─────────────────────────────────────────────────────────┘
```

### Sub-form 1 — Login
| Component | Props / Config | Source |
|---|---|---|
| `Input` | label="Username" iconLeft="ti ti-user" required | ENTITY-SEC-001 |
| `Input` | label="Password" type="password" iconLeft="ti ti-lock" required | ENTITY-SEC-001 |
| "Forgot password?" | `Button` variant="ghost" size="sm" → show ForgotPassword | — |
| `Button` | variant="primary" size="lg" block loading → Sign In | — |
| `Alert` | variant="danger" → credential error | — |

### Sub-form 2 — Self-Registration (Signup)
| Component | Props / Config | Source |
|---|---|---|
| `Input` | label="Username" required | ENTITY-SEC-001 |
| `Input` | label="Email" type="email" required | ENTITY-SEC-001 |
| `Input` | label="Password" type="password" required | ENTITY-SEC-001 |
| `Button` | variant="primary" block loading → Register | — |

### Sub-form 3 — Account Activation
| Component | Props / Config | Source |
|---|---|---|
| token | hidden — extracted from URL param | ENTITY-SEC-012 |
| `Alert` | variant="info" → instructions to user | — |
| `Button` | variant="primary" block loading → Activate Account | — |
| `Alert` | variant="warning" → token expired + resend link | — |

### Sub-form 4 — Forgot Password
| Component | Props / Config | Source |
|---|---|---|
| `Input` | label="Email" type="email" required | ENTITY-SEC-001 |
| `Button` | variant="primary" block loading → Send Reset Link | — |
| `Alert` | variant="info" → ambiguous success (RULE-SEC-038: no account leak) | — |

### Sub-form 5 — Reset Password
| Component | Props / Config | Source |
|---|---|---|
| token | hidden — from URL | ENTITY-SEC-011 |
| `Input` | label="New Password" type="password" required | ENTITY-SEC-011 |
| `Input` | label="Confirm Password" type="password" required | frontend validation only |
| `Button` | variant="primary" block loading → Set New Password | — |

### Screen States
| State | Behavior |
|---|---|
| Loading (submit) | Button loading=true |
| Auth error | `Alert` variant="danger" above form |
| Activation success | `Alert` variant="success" → redirect to Login |
| Reset success | `Alert` variant="success" → redirect to Login |

---

## SCR-SEC-002 — User Management

```
Screen     : SCR-SEC-002
Pattern    : PATTERN-1 — Search + Entry
Permissions: PERM_USER_VIEW (gateway) · CREATE · UPDATE · DELETE
Location   : Sidebar → Security → Users
File       : src/pages/Security/Users.tsx (new)
Store      : src/stores/useUsersStore.ts (new)
```

### Header Bar
```
Breadcrumb: Security > Users
h1: "User Management"
Action: Button variant="primary" iconLeft="ti ti-plus" → "New User" (PERM_USER_CREATE)
```

### KPI Row (Stat cards)
| Label | Icon | Change Type |
|---|---|---|
| Total Users | ti-users | neutral |
| Active | ti-user-check | positive |
| Disabled | ti-user-x | negative |

### Filter Bar
| Component | Props | Field |
|---|---|---|
| `Input` | iconLeft="ti ti-search" placeholder="Search by username" | username |
| `Select` | options=[All, Enabled, Disabled] | enabled |

### Data Grid
`Card` variant="flat" containing table:
| Column | Component | Source |
|---|---|---|
| Username | text | ENTITY-SEC-001 |
| Email | text | ENTITY-SEC-001 |
| Status | `Badge` variant="success" (Enabled) / "neutral" (Disabled) | ENTITY-SEC-001.enabled |
| Roles | `Badge` variant="ghost" count | ENTITY-SEC-002 |
| Actions | `IconButton` icon="ti-edit" · "ti-trash" | — |

### Create / Edit Dialog
`Dialog` title="New User" / "Edit User" width="md"

**Form fields:**
| Component | Props | Source | Notes |
|---|---|---|---|
| `Input` | label="Username" required | ENTITY-SEC-001 | |
| `Input` | label="Email" type="email" | ENTITY-SEC-001 | |
| `Input` | label="Password" type="password" required | ENTITY-SEC-001 | Hidden in Edit mode |
| `Switch` | label="Account Enabled" | ENTITY-SEC-001.enabled | |
| `Select` | label="Assign Roles" multiple options from role list | ENTITY-SEC-002 | Full replacement on save |

**Footer buttons:**
- `Button` variant="primary" → Save (RULE-SEC-049)
- `Button` variant="ghost" → Cancel
- `Button` variant="danger" → Delete (Edit mode only, PERM_USER_DELETE)

**Additional links inside Edit Dialog:**
- `Button` variant="secondary" iconRight="ti ti-chevron-right" → "User Profile" → opens `Drawer` (SCR-SEC-006)
- `Button` variant="secondary" iconRight="ti ti-chevron-right" → "Data Scope" → opens `Drawer` (SCR-SEC-007)

### Empty State
`EmptyState` icon="ti-users" title="No users found" description="Try adjusting your search filters"

---

## SCR-SEC-003 — Role & RBAC Management

```
Screen     : SCR-SEC-003
Pattern    : PATTERN-1 — Search + Entry (+ embedded Permission Matrix)
Permissions: PERM_ROLE_VIEW · CREATE · UPDATE · DELETE
Location   : Sidebar → Security → Roles
File       : src/pages/Security/Roles.tsx (new)
Store      : src/stores/useRolesStore.ts (new)
```

### Header Bar
```
Breadcrumb: Security > Roles
h1: "Role Management"
Action: Button variant="primary" iconLeft="ti ti-plus" → "New Role"
```

### KPI Row
| Label | Icon |
|---|---|
| Total Roles | ti-shield |
| Active Roles | ti-shield-check |
| Assigned Roles (has users) | ti-users |

### Filter Bar
| Component | Props | Field |
|---|---|---|
| `Input` | iconLeft="ti ti-search" placeholder="Search by role name" | roleName (only filter per SRS B2) |

### Data Grid
| Column | Component | Source |
|---|---|---|
| Role Code | `Badge` variant="ghost" | ENTITY-SEC-002.roleCode |
| Role Name | text | ENTITY-SEC-002.roleName |
| Description | text secondary | ENTITY-SEC-002.description |
| Active | `Badge` variant="success"/"neutral" | ENTITY-SEC-002.IS_ACTIVE |
| Actions | Edit · Activate/Deactivate · Delete buttons | — |

**Activate / Deactivate:** Two separate `IconButton`s — NOT a toggle. (2026-08-23 correction)

### Create / Edit Dialog
`Dialog` title="New Role" / "Edit Role" width="lg"

**Header section:**
| Component | Props | Source | Notes |
|---|---|---|---|
| `Input` | label="Role Code" required | ENTITY-SEC-002.roleCode | Read-Only after first save |
| `Input` | label="Role Name" required | ENTITY-SEC-002.roleName | |
| `Input` | label="Description" | ENTITY-SEC-002.description | |
| `Switch` | label="Active" | ENTITY-SEC-002.IS_ACTIVE | |

**Permission Matrix sub-panel (inside same Dialog — CORE-9: no separate SCR-ID):**

```
┌─────────────────────────────────────────────────────────────────┐
│ Page Permissions                  [+ Add Page] [Sync] [Copy ▾] │
│─────────────────────────────────────────────────────────────────│
│ Page Name          VIEW  CREATE  UPDATE  DELETE                 │
│─────────────────────────────────────────────────────────────────│
│ User Management     ☑     ☑      ☐       ☐     [× Remove]      │
│ Role Management     ☑     ☐      ☑       ☐     [× Remove]      │
│─────────────────────────────────────────────────────────────────│
│ Note: VIEW is auto-checked when any page is added (RULE-SEC-042)│
└─────────────────────────────────────────────────────────────────┘
```

| Component | Purpose |
|---|---|
| `Checkbox` | Per permission cell (VIEW/CREATE/UPDATE/DELETE) |
| `Button` variant="secondary" size="sm" | + Add Page |
| `Button` variant="ghost" size="sm" | Sync All (full replace) |
| `Button` variant="ghost" size="sm" iconRight="ti ti-chevron-down" | Copy From Role (dropdown) |
| `IconButton` icon="ti ti-x" variant="ghost" | Remove page from role |

**Data Scope link:**
- `Button` variant="secondary" iconRight="ti ti-chevron-right" → "Branch Data Scope" → `Drawer` (SCR-SEC-007)

### Confirmation Dialogs
- Delete role: `Dialog` → `Alert` variant="warning" if role has assigned users (RULE-SEC-048)
- Copy permissions: `Dialog` → confirm source role before overwriting

### Empty State
`EmptyState` icon="ti-shield-lock" title="No roles configured"

---

## SCR-SEC-004 — Permission Registry

```
Screen     : SCR-SEC-004
Pattern    : PATTERN-2 — Inline with Dialog
Permissions: PERM_PERMISSION_VIEW · CREATE · UPDATE
             (No DELETE — endpoint not confirmed AS-IS)
Location   : Sidebar → Security → Permissions
File       : src/pages/Security/Permissions.tsx (new)
```

### Layout
Single card with filter bar + inline table + create/edit Dialog.

### Filter Bar
| Component | Props | Field |
|---|---|---|
| `Input` | iconLeft="ti ti-search" placeholder="Search by name" | name |
| `Input` | placeholder="Filter by module" | module |

### Table
| Column | Component | Source |
|---|---|---|
| Name | text mono | ENTITY-SEC-003.name |
| Type | `Badge` variant="ghost" | ENTITY-SEC-003.permissionType |
| Page | text | ENTITY-SEC-004.pageCode |
| Actions | `IconButton` icon="ti-edit" | — |

### Create / Edit Dialog
`Dialog` title="New Permission" / "Edit Permission" width="sm"

| Component | Props | Source | Notes |
|---|---|---|---|
| `Input` | label="Permission Name" hint="Pattern: PERM_<CODE>_<TYPE>" required | ENTITY-SEC-003.name | |
| `Select` | label="Permission Type" options from LOV-SEC-001 | ENTITY-SEC-003.permissionType | Java enum |
| `Select` | label="Associated Page" options from active pages (optional) | ENTITY-SEC-004 | Empty = system-level |

**Footer:** [Save] [Cancel]

### Empty State
`EmptyState` icon="ti-key" title="No permissions registered"

---

## SCR-SEC-005 — Page Registry

```
Screen     : SCR-SEC-005
Pattern    : PATTERN-1 — Search + Entry (flat list — AS-IS, OQ-013 final)
Permissions: PERM_PAGE_VIEW · CREATE · UPDATE · DELETE (deactivation)
Location   : Sidebar → Security → Pages
File       : src/pages/Security/Pages.tsx (new)
Note       : Flat AG Grid pattern confirmed by code inspection.
             NO tree view — tree component does not exist in frontend (OQ-013 closed).
```

### Header Bar
```
Breadcrumb: Security > Page Registry
h1: "Page Registry"
Action: Button variant="primary" iconLeft="ti ti-plus" → "Register Page"
```

### Filter Bar
| Component | Props | Field |
|---|---|---|
| `Input` | iconLeft="ti ti-search" placeholder="Search by page code" | pageCode |
| `Input` | placeholder="Filter by module" | module |
| `Select` | options=[All, Active, Inactive] | active |

### Data Grid
| Column | Component | Source |
|---|---|---|
| Page Code | `Badge` variant="ghost" font mono | ENTITY-SEC-004.pageCode |
| Name (EN) | text | ENTITY-SEC-004.nameEn |
| Module | `Badge` variant="neutral" | ENTITY-SEC-004.module |
| Route | text secondary mono | ENTITY-SEC-004.route |
| Status | `Badge` variant="success"/"neutral" | ENTITY-SEC-004.active |
| Actions | Edit · Deactivate/Reactivate | — |

### Create / Edit Drawer
`Drawer` title="Register New Page" / "Edit Page" (Drawer preferred — many fields)

| Component | Props | Source | Notes |
|---|---|---|---|
| `Input` | label="Page Code" hint="Uppercase, A-Z 0-9 _" required | ENTITY-SEC-004.pageCode | Auto-uppercase |
| `Input` | label="Name (English)" required | ENTITY-SEC-004.nameEn | |
| `Input` | label="Name (Arabic)" required | ENTITY-SEC-004.nameAr | |
| `Input` | label="Route" hint="Must start with /" required | ENTITY-SEC-004.route | |
| `Input` | label="Icon" hint="Tabler icon class e.g. ti-home" | ENTITY-SEC-004.icon | |
| `Input` | label="Module" | ENTITY-SEC-004.module | |
| `Select` | label="Parent Page" options from active pages (self-ref) | ENTITY-SEC-004.parentId | Cannot point to self |
| `Input` | label="Display Order" type="number" | ENTITY-SEC-004.displayOrder | |
| `Input` | label="Description" | ENTITY-SEC-004.description | |

**Footer:** [Save — auto-creates 4 permissions (RULE-SEC-047)] [Cancel] + [Deactivate/Reactivate] in edit mode

### Empty State
`EmptyState` icon="ti-layout-grid" title="No pages registered"

---

## SCR-SEC-006 — User Profile (Modal/Drawer)

```
Screen     : SCR-SEC-006
Pattern    : PATTERN-2 — Drawer (opened from SCR-SEC-002)
Permissions: PERM_USER_PROFILE_VIEW · CREATE · UPDATE
             NO DELETE — intentional exception (RULE-SEC-047)
Location   : Opened from SCR-SEC-002 "User Profile →" link
Note       : Deactivation uses isActiveFl = false (not delete)
```

### Search / List Header (inside Drawer)
| Component | Props | Field |
|---|---|---|
| `Select` | label="Filter by Branch" | branchIdFk (cross-module LOV, active only) |
| `Input` | placeholder="Search name (EN or AR)" | fullNameEn / fullNameAr |
| `Select` | options=[All, Active, Inactive] | isActiveFl |

### Form Fields
| Component | Props | Source | Notes |
|---|---|---|---|
| `Select` | label="Branch" required iconLeft="ti ti-building-skyscraper" | ENTITY-SEC-009.branchIdFk | Cross-module — active only (RULE-SEC-034) |
| `Input` | label="Full Name (English)" | ENTITY-SEC-009.fullNameEn | |
| `Input` | label="Full Name (Arabic)" | ENTITY-SEC-009.fullNameAr | |
| `Input` | label="Preferred Language" hint="Free text (e.g. en, ar)" | ENTITY-SEC-009.preferredLang | OQ-001 CLOSED: free text, no LOV |
| `Input` | label="Employee ID" hint="Optional reference" | ENTITY-SEC-009.employeeIdFk | OQ-002 CLOSED: no FK (no HR module yet) |
| `Switch` | label="Profile Active" | ENTITY-SEC-009.isActiveFl | Deactivation instead of delete |

**Footer:** [Save] [Cancel] — **NO Delete button**

### Screen States
| State | Behavior |
|---|---|
| Branch not found | `Alert` variant="warning" "Selected branch is inactive" |
| Save success | Drawer closes, success toast |

---

## SCR-SEC-007 — Role Data Scope — Branch Assignment (Drawer)

```
Screen     : SCR-SEC-007
Pattern    : PATTERN-2 — Drawer (opened from SCR-SEC-003 or SCR-SEC-002)
Permissions: Reuses PERM_ROLE_* — no new permissions
             VIEW = PERM_ROLE_VIEW | Create/Edit/Delete = PERM_ROLE_UPDATE
Location   : Opened from Role Edit Dialog or User Edit Dialog
```

### Filter Bar (inside Drawer)
| Component | Props | Field |
|---|---|---|
| `Select` | label="Role" | roleIdFk |
| `Select` | label="Branch" | branchIdFk (cross-module) |
| `Select` | label="Access Level" options from LOV-SEC-002 | dataAccessLevel |
| `Select` | options=[All, Active, Inactive] | isActiveFl |

### Form Fields
| Component | Props | Source | Notes |
|---|---|---|---|
| `Select` | label="Role" required | ENTITY-SEC-010.roleIdFk | Part of composite PK |
| `Select` | label="Branch" required iconLeft="ti ti-building-skyscraper" | ENTITY-SEC-010.branchIdFk | Part of composite PK, cross-module |
| `Select` | label="Data Access Level" required options=[Branch Only, Branch & Children, All] | LOV-SEC-002 | |
| `Switch` | label="Active" | ENTITY-SEC-010.isActiveFl | |

**Footer:** [Save — RULE-SEC-035/036] [Cancel] [Delete — PERM_ROLE_UPDATE]

---

# ══════════════════════════════════════════════════════════
# MODULE: ORGANIZATION (ORG)
# ══════════════════════════════════════════════════════════

## Design Note — ORG Screens

All five PATTERN-1 ORG screens share the same anatomy. Key conventions:
- **business_code** (e.g. `legal_entity_code`) is auto-generated: hidden in Create, Read-Only in Edit.
- **Deactivate vs Delete**: ORG uses Deactivate (soft) not hard-delete. Cascade checks fire before deactivation.
- **Bilingual names**: `nameEn` and `nameAr` are always shown side-by-side in Drawer or in labelled tabs.

---

## SCR-ORG-001 — Legal Entities

```
Screen     : SCR-ORG-001
Pattern    : PATTERN-1 — Search + Entry
Permissions: PAGE_CODE = LEGAL_ENTITY
             VIEW (SysAdmin, OrgAdmin) · CREATE/UPDATE/DELETE = SysAdmin
Location   : Sidebar → Organization → Legal Entities
File       : src/pages/Organization/LegalEntities.tsx (new — extend Organization.tsx pattern)
Store      : src/stores/useOrganizationStore.ts (extend existing)
```

### Header Bar
```
Breadcrumb: Organization > Legal Entities
h1: "Legal Entities"
Action: Button variant="primary" iconLeft="ti ti-plus" → "New Legal Entity"
```

### KPI Row
| Label | Icon | Value |
|---|---|---|
| Total Entities | ti-building | count |
| Active | ti-check-circle | active count |
| Inactive | ti-circle-x | inactive count |

### Filter Bar
| Component | Props | Field |
|---|---|---|
| `Input` | iconLeft="ti ti-search" placeholder="Search by code or name" | legal_entity_code / name_en |
| `Select` | label="Type" options from LOV-ORG-001 | entity_type_id |
| `Select` | label="Status" options=[All, Active, Inactive] | is_active_fl |

### Data Grid
| Column | Component | Source |
|---|---|---|
| Code | `Badge` variant="ghost" mono | ENTITY-ORG-001.legal_entity_code |
| Name (EN) | text bold | ENTITY-ORG-001.name_en |
| Name (AR) | text secondary | ENTITY-ORG-001.name_ar |
| Type | `Badge` variant="neutral" | LOV-ORG-001 value |
| Status | `Badge` variant="success"/"neutral" | is_active_fl |
| Actions | Edit · Deactivate/Activate · View Branches | — |

### Create / Edit Drawer
`Drawer` title="New Legal Entity" / "Edit Legal Entity"

| Component | Props | Source | Notes |
|---|---|---|---|
| `Input` | label="Entity Code" | ENTITY-ORG-001.legal_entity_code | Read-Only in Edit (auto-generated) |
| `Input` | label="Name (English)" required | ENTITY-ORG-001.name_en | |
| `Input` | label="Name (Arabic)" required | ENTITY-ORG-001.name_ar | |
| `Select` | label="Entity Type" required options from LOV-ORG-001 | entity_type_id | Head Office / Branch Office / Subsidiary / Representative Office |
| `Input` | label="Notes" hint="Optional" | ENTITY-ORG-001.notes | multiline |

**Footer:** [Save] [Cancel] + [Deactivate/Activate] in Edit mode

### Deactivation State
`Alert` variant="warning" → "Cannot deactivate — [N] active branches depend on this entity" (RULE-ORG-001/002)

### Empty State
`EmptyState` icon="ti-building" title="No legal entities" description="Add your first legal entity to start building the org structure" action={NewEntityButton}

---

## SCR-ORG-002 — Branches

```
Screen     : SCR-ORG-002
Pattern    : PATTERN-1 — Search + Entry
Permissions: PAGE_CODE = BRANCH
Location   : Sidebar → Organization → Branches  or context link from SCR-ORG-001
File       : src/pages/Organization/Branches.tsx (new)
```

### Header / KPI / Filter — same anatomy as SCR-ORG-001

### Filter Bar
| Component | Field |
|---|---|
| `Input` search | branch_code / name_en |
| `Select` | legal_entity_fk (LOV from Legal Entities) |
| `Select` | branch_type_id (LOV-ORG-002: Main/Sub/Operations/Admin) |
| `Select` | is_active_fl |

### Data Grid
Adds column: **Legal Entity** — linked badge to parent entity.

### Create / Edit Drawer
| Component | Props | Source | Notes |
|---|---|---|---|
| `Input` | label="Branch Code" | ENTITY-ORG-002.branch_code | Read-Only in Edit |
| `Input` | label="Name (English)" required | ENTITY-ORG-002.name_en | |
| `Input` | label="Name (Arabic)" required | ENTITY-ORG-002.name_ar | |
| `Select` | label="Legal Entity" required | ENTITY-ORG-001 LOV | Active only |
| `Select` | label="Branch Type" required options from LOV-ORG-002 | branch_type_id | |
| `Input` | label="Notes" | ENTITY-ORG-002.notes | |

### Deactivation State
`Alert` variant="warning" → cascade: active Departments | CostCenters | LocationSites (RULE-ORG-003/004/005)

### Empty State
`EmptyState` icon="ti-building-skyscraper" title="No branches" action={NewBranchButton}

---

## SCR-ORG-003 — Regions

```
Screen     : SCR-ORG-003
Pattern    : PATTERN-1 — Search + Entry
Permissions: PAGE_CODE = REGION
Location   : Sidebar → Organization → Regions
File       : src/pages/Organization/Regions.tsx (new)
⚠ OQ-ORG-002: regionTypeIdFk is a read-only LOV until SCR-ORG-008 is specified
```

### Filter Bar
| Component | Field |
|---|---|
| `Input` search | region_code / name_en |
| `Select` | legal_entity_fk |
| `Select` | region_type_id_fk (active types only — SCR-ORG-008 BLOCKED-BY-OQ) |
| `Select` | is_active_fl |

### Create / Edit Drawer
| Component | Props | Source | Notes |
|---|---|---|---|
| `Input` | label="Region Code" | ENTITY-ORG-003.region_code | Read-Only in Edit |
| `Input` | label="Name (English)" required | ENTITY-ORG-003.name_en | |
| `Input` | label="Name (Arabic)" required | ENTITY-ORG-003.name_ar | |
| `Select` | label="Legal Entity" required | ENTITY-ORG-001 LOV | Active only |
| `Select` | label="Region Type" required | ENTITY-ORG-008 LOV | Active only — read-only source per OQ-ORG-002 |
| `Input` | label="Notes" | ENTITY-ORG-003.notes | |

### Empty State
`EmptyState` icon="ti-map-pin" title="No regions defined"

---

## SCR-ORG-004 — Departments (Tree)

```
Screen     : SCR-ORG-004
Pattern    : PATTERN-3 — Specialized (Tree Hierarchy)
Permissions: PAGE_CODE = DEPARTMENT
Location   : Sidebar → Organization → Departments
File       : src/pages/Organization/Departments.tsx (new)
Note       : Organization.tsx already implements an org-unit tree — reuse
             that tree interaction pattern and visual style for consistency
```

### Layout Proposal
```
┌──────────────────────────────────────────────────────────────────┐
│ Breadcrumb: Organization > Departments                           │
│ h1: "Department Hierarchy"                                       │
├──────────────────────────────────────────────────────────────────┤
│ Branch filter (Required Select) + name search + node type filter │
├─────────────────────────────────┬────────────────────────────────┤
│ TREE PANEL                      │ ENTRY PANEL                   │
│                                 │                                │
│ ▼ Engineering (SUMMARY)         │ [Selected node form]           │
│   ├─ Frontend (DETAIL)          │  or                            │
│   └─ Backend (DETAIL)           │  [New Department form]         │
│ ▼ Operations (SUMMARY)          │                                │
│   └─ Logistics (DETAIL)         │                                │
│                                 │                                │
│ [+ Root Department]             │ [Save] [Cancel] [Deactivate]  │
└─────────────────────────────────┴────────────────────────────────┘
```

### Filter Row (above layout)
| Component | Props | Field | Notes |
|---|---|---|---|
| `Select` | label="Branch" required iconLeft="ti ti-building-skyscraper" | branch_fk | Mandatory — no tree without this |
| `Input` | placeholder="Search department name" | name_en | Filters within visible tree |
| `Select` | label="Node Type" options=[All, Summary, Detail] | node_type_id | LOV-ORG-003 |
| `Select` | label="Status" options=[All, Active, Inactive] | is_active_fl | |

### Tree Panel
- Expandable/collapsible rows
- Per-node `Badge` variant="warning" label="SUMMARY" — no-posting indicator (US-ORG-010)
- Node actions: `IconButton` icon="ti-plus" (add child) · "ti-edit" (edit) · "ti-trash" (deactivate)
- `Button` variant="secondary" iconLeft="ti ti-circle-plus" → "+ Root Department"

### Entry Panel Fields
| Component | Props | Source | Notes |
|---|---|---|---|
| `Input` | label="Department Code" | ENTITY-ORG-004.department_code | Auto-generated, shown Read-Only in Edit |
| `Input` | label="Name (English)" required | ENTITY-ORG-004.name_en | |
| `Input` | label="Name (Arabic)" required | ENTITY-ORG-004.name_ar | |
| `Select` | label="Branch" required | ENTITY-ORG-002 LOV | Active only |
| `Select` | label="Parent Department" | ENTITY-ORG-004 self-ref | Auto-filled from tree selection |
| `Select` | label="Node Type" required options=[Summary, Detail] | LOV-ORG-003 | Locked after first save (RULE-ORG-020) |
| `Input` | label="Notes" | ENTITY-ORG-004.notes | |

### Empty State (no branch selected)
`Alert` variant="info" title="Select a branch" description="Choose a branch from the filter above to view its department hierarchy"

### Empty State (branch selected, no departments)
`EmptyState` icon="ti-sitemap" title="No departments yet" description="Start building your org structure" action={AddRootDeptButton}

---

## SCR-ORG-005 — Cost Centers (Tree)

```
Screen     : SCR-ORG-005
Pattern    : PATTERN-3 — Specialized (Tree) — identical structure to SCR-ORG-004
Permissions: PAGE_CODE = COST_CENTER
             VIEW (SysAdmin, Finance, OrgAdmin) · CREATE/UPDATE (SysAdmin, Finance)
File       : src/pages/Organization/CostCenters.tsx (new)
```

### Differences from SCR-ORG-004
Additional filter: `Select` label="Cost Center Type" options=[All, Direct, Indirect, Shared] (LOV-ORG-005)

### Entry Panel — additional field vs ORG-004
| Component | Props | Source | Notes |
|---|---|---|---|
| `Select` | label="Cost Center Type" required options=[Direct, Indirect, Shared] | LOV-ORG-005 | |

All other fields and behavior identical to SCR-ORG-004.

### Empty States
Same pattern as SCR-ORG-004 — icon="ti-chart-pie-2"

---

## SCR-ORG-006 — Profit Centers

```
Screen     : SCR-ORG-006
Pattern    : PATTERN-1 — Search + Entry
Permissions: PAGE_CODE = PROFIT_CENTER
             VIEW (SysAdmin, Finance, OrgAdmin) · CREATE/UPDATE (SysAdmin, Finance)
File       : src/pages/Organization/ProfitCenters.tsx (new)
```

### Filter Bar
| Component | Field |
|---|---|
| `Input` search | profit_center_code / name_en |
| `Select` | legal_entity_fk |
| `Select` | is_active_fl |

### Create / Edit Drawer
| Component | Props | Source |
|---|---|---|
| `Input` | label="Profit Center Code" Read-Only in Edit | ENTITY-ORG-006.profit_center_code |
| `Input` | label="Name (English)" required | ENTITY-ORG-006.name_en |
| `Input` | label="Name (Arabic)" required | ENTITY-ORG-006.name_ar |
| `Select` | label="Legal Entity" required | ENTITY-ORG-001 LOV (active only) |
| `Input` | label="Notes" | ENTITY-ORG-006.notes |

### Empty State
`EmptyState` icon="ti-trending-up" title="No profit centers defined"

---

## SCR-ORG-007 — Location Sites

```
Screen     : SCR-ORG-007
Pattern    : PATTERN-1 — Search + Entry
Permissions: PAGE_CODE = LOCATION_SITE
Location   : Sidebar → Organization → Location Sites  or context from SCR-ORG-002
File       : src/pages/Organization/LocationSites.tsx (new)
```

### Filter Bar
| Component | Field |
|---|---|
| `Input` search | location_site_code / name_en |
| `Select` | branch_fk (LOV from Branches) |
| `Select` | site_type_id (LOV-ORG-006: Office/Warehouse/Factory/Site/Retail) |
| `Select` | is_active_fl |

### Create / Edit Drawer
| Component | Props | Source | Notes |
|---|---|---|---|
| `Input` | label="Site Code" Read-Only in Edit | ENTITY-ORG-007.location_site_code | |
| `Input` | label="Name (English)" required | ENTITY-ORG-007.name_en | |
| `Input` | label="Name (Arabic)" required | ENTITY-ORG-007.name_ar | |
| `Select` | label="Branch" required | ENTITY-ORG-002 LOV | Active only |
| `Select` | label="Site Type" required options from LOV-ORG-006 | site_type_id | Office/Warehouse/Factory/Site/Retail |
| `Input` | label="Notes" | ENTITY-ORG-007.notes | |

### Empty State
`EmptyState` icon="ti-map-pin-2" title="No location sites"

---

# ══════════════════════════════════════════════════════════
# MODULE: FILE SERVICE (FILE)
# ══════════════════════════════════════════════════════════

## SCR-FILE-001 — File Attachment Panel (Embedded Widget)

```
Screen     : SCR-FILE-001
Pattern    : PATTERN-2 — Inline Panel (embedded into host screens)
Permissions: PERM_FILE_ATTACHMENT_VIEW · CREATE · DELETE
             UPDATE: auto-generated, not functionally used (no update API)
             DELETE: requires PERM_FILE_ATTACHMENT_DELETE + ownership or Admin (RULE-FILE-007)
Location   : Injected as a React component into any host screen
File       : src/components/features/FileAttachmentPanel.tsx (new — shared component)
Props      : { ownerId: string, ownerType: string, moduleCode: string }
Note       : ownerId · ownerType · moduleCode are context-passed — never user-entered
```

### Panel Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Attachments                         [↑ Upload File]             │
│─────────────────────────────────────────────────────────────────│
│ File Name          Category    Type   Size      Date    Actions │
│─────────────────────────────────────────────────────────────────│
│ invoice.pdf        Attachment  PDF    1.2 MB    Jan 5   [⬇][🗑] │
│ photo.jpg          Image       JPEG   450 KB    Jan 3   [⬇][🗑] │
│─────────────────────────────────────────────────────────────────│
│ [Drag & drop zone or click to browse]                           │
│ Max 5 MB · Type validated from file content                     │
└─────────────────────────────────────────────────────────────────┘
```

### File List Area
| Component | Props | Source |
|---|---|---|
| `Card` | variant="flat" padding="sm" → panel wrapper | — |
| File name | text mono | ENTITY-FILE-001.fileNameOriginal |
| Category | text | ENTITY-FILE-002.categoryName |
| Type | `Badge` variant="neutral" | LOV-FILE-001 |
| Size | text secondary | ENTITY-FILE-001.fileSizeBytes (formatted KB/MB) |
| Upload date | text secondary | ENTITY-FILE-001.createdAt |
| Download | `IconButton` icon="ti ti-download" variant="ghost" | — |
| Delete | `IconButton` icon="ti ti-trash" variant="danger" | PERM_FILE_ATTACHMENT_DELETE |

### Upload Sub-area
| Component | Props | Source | Notes |
|---|---|---|---|
| `Select` | label="Category" required | ENTITY-FILE-002 | Filtered by moduleCode |
| File picker | drag & drop zone (custom styled div) | — | Visual matches AVELYNQ token palette |
| Progress bar | upload progress 0–100% | — | Visible during upload in progress |
| `Button` | variant="primary" iconLeft="ti ti-upload" → "Upload" | — | 2-step token flow |

### Upload Flow (2-step Encrypted Token)
```
1. User selects file + category → [Upload]
2. POST /api/v1/files/upload-token → receives encryptedToken
3. POST /upload/{encryptedToken} → file upload
4. On success: refresh file list
```

### Delete Flow
```
1. [🗑] → Dialog opens (confirmation)
   Dialog: "Are you sure? This action cannot be undone."
   [Delete] [Cancel]
2. On confirm: issue delete token → DELETE /{token}
3. On 403: Alert variant="danger" "You don't have permission to delete this file"
```

### Screen States
| State | Component |
|---|---|
| Loading list | skeleton rows |
| Empty panel | `EmptyState` icon="ti-paperclip" title="No attachments" description="Upload files to attach them to this record" |
| Uploading | Progress bar + disabled Upload button |
| File > 5 MB | `Alert` variant="warning" "File exceeds the 5 MB limit" (pre-upload check) |
| Invalid file type | `Alert` variant="danger" "File type not permitted" (post-upload from server) |
| Delete success | List refreshes + toast |
| Ownership error | `Alert` variant="danger" "You can only delete files you uploaded (or contact an Admin)" |

---

# ══════════════════════════════════════════════════════════
# MODULE: NOTIFICATION SERVICE (NOTIF)
# ══════════════════════════════════════════════════════════

## SCR-NOTIF-001 — Notification Bell & History

```
Screen     : SCR-NOTIF-001
Pattern    : PATTERN-3 — Specialized (Bell Dropdown + History Page)
Permissions: PERM_NOTIFICATION_INBOX_VIEW (all authenticated users)
             UPDATE: PERM_NOTIFICATION_INBOX_UPDATE (mark as read)
Location   : App Shell topbar (Bell) — already has notification counter
             History: currentScreen = 'notifications-inbox'
File       : Bell → extend existing topbar notification component
             History → src/pages/Notifications/NotificationInbox.tsx (new)
```

### Component 1 — Bell Dropdown (topbar)

**Trigger:** `IconButton` icon="ti ti-bell" (already in topbar — add unread `Badge` overlay)

**Dropdown panel (`Card` variant="raised"):**

```
┌─────────────────────────────────────────────────────────────┐
│  Notifications                         [Mark All Read]      │
│─────────────────────────────────────────────────────────────│
│  [● blue dot] Account activated    Email  · 2 min ago       │
│  [✓ grey]    Password reset sent  Email  · 1 hr ago        │
│  [● blue dot] New role assigned   System · Yesterday        │
│─────────────────────────────────────────────────────────────│
│                        [View All Notifications →]           │
└─────────────────────────────────────────────────────────────┘
```

| Component | Props | Source |
|---|---|---|
| Unread count | `Badge` variant="danger" dot overlay on bell icon | API-NOTIF-004 |
| Type icon | `Badge` variant="primary"/"neutral"/"ghost" | LOV-NOTIF-001 |
| Subject | text bold (unread) / text secondary (read) | ENTITY-NOTIF-001.subject |
| Channel | `Badge` variant="ghost" size="sm" | notificationType |
| Time | text caption | ENTITY-NOTIF-001.sentAt relative |
| Mark All Read | `Button` variant="ghost" size="sm" | — |
| View All | `Button` variant="secondary" size="sm" iconRight="ti ti-chevron-right" | → History page |

### Component 2 — History Page (full screen)

**Header Bar:**
```
Breadcrumb: Notifications > Inbox
h1: "My Notifications"
```

**Filter Bar:**
| Component | Props | Field |
|---|---|---|
| `Select` | label="Type" options from LOV-NOTIF-001 | notificationType |
| `Select` | label="Status" options=[All, Unread, Read] | notificationStatus |
| `Input` | type="date" label="From" | date range start |
| `Input` | type="date" label="To" | date range end |

**Data Grid** (`Card` variant="flat"):
| Column | Component | Source |
|---|---|---|
| Status dot | `Badge` variant="primary" (unread) / "ghost" (read) | ENTITY-NOTIF-001.isReadFl |
| Type | `Badge` variant="neutral" | LOV-NOTIF-001 |
| Subject | text (bold if unread) | ENTITY-NOTIF-001.subject |
| Preview | text secondary truncated | ENTITY-NOTIF-001.bodyPreview |
| Status | `Badge` | LOV-NOTIF-002 |
| Sent At | text secondary | ENTITY-NOTIF-001.sentAt |
| Actions | `IconButton` icon="ti-check" → Mark Read | — |

**Row click:** navigates to linked entity via referenceId/referenceType

**Empty State:**
`EmptyState` icon="ti-bell-off" title="All caught up" description="No notifications match your current filters"

---

## SCR-NOTIF-002 — Notification Template Management (Admin)

```
Screen     : SCR-NOTIF-002
Pattern    : PATTERN-1 — Search + Entry
Permissions: PAGE_CODE = NOTIFICATION_TEMPLATE (Admin only)
Location   : Sidebar → Notification Settings → Templates
File       : src/pages/Notifications/NotificationTemplates.tsx (new)
Store      : src/stores/useNotificationTemplatesStore.ts (new)
```

### Header Bar
```
Breadcrumb: Notification Settings > Templates
h1: "Notification Templates"
Action: Button variant="primary" iconLeft="ti ti-plus" → "New Template"
```

### KPI Row
| Label | Icon |
|---|---|
| Total Templates | ti-template |
| Active | ti-check |
| By Channel (Email/SMS/…) | ti-mail |

### Filter Bar
| Component | Field |
|---|---|
| `Input` search | templateCode |
| `Select` | channelTypeId (Email/SMS/WhatsApp/Push/Internal) |
| `Input` | moduleCode |
| `Select` | isActiveFl |

### Data Grid
| Column | Component | Source |
|---|---|---|
| Template Code | `Badge` variant="ghost" mono | ENTITY-NOTIF-002.templateCode |
| Name (EN) | text | ENTITY-NOTIF-002.templateNameEn |
| Channel | `Badge` variant="primary"/"accent"/"neutral" | LOV-NOTIF-001 |
| Module | `Badge` variant="ghost" | ENTITY-NOTIF-002.moduleCode |
| Active | `Badge` variant="success"/"neutral" | ENTITY-NOTIF-002.isActiveFl |
| Actions | Edit · Deactivate | — |

### Create / Edit Drawer
`Drawer` title="New Template" / "Edit Template" width="lg" (large because bilingual body fields)

| Component | Props | Source | Notes |
|---|---|---|---|
| `Input` | label="Template Code" required hint="Unique identifier, immutable after create" | ENTITY-NOTIF-002.templateCode | Read-Only in Edit (RULE-NOTIF-007) |
| `Input` | label="Template Name (English)" required | ENTITY-NOTIF-002.templateNameEn | |
| `Input` | label="Template Name (Arabic)" required | ENTITY-NOTIF-002.templateNameAr | |
| `Select` | label="Channel" required | LOV-NOTIF-001 | Email/SMS/WhatsApp/Push/Internal |
| `Input` | label="Module Code" required hint="e.g. SEC, ORG, FILE" | ENTITY-NOTIF-002.moduleCode | |
| `Tabs` | items=[{id:'en', label:'English Body'}, {id:'ar', label:'Arabic Body'}] | — | Tab between language bodies |
| Textarea | label="Body (English)" required — placeholder-aware | ENTITY-NOTIF-002.templateBodyEn | Use monospace Input — supports {{placeholders}} |
| Textarea | label="Body (Arabic)" required | ENTITY-NOTIF-002.templateBodyAr | |
| `Switch` | label="Active" | ENTITY-NOTIF-002.isActiveFl | |
| `Alert` | variant="info" "Both English and Arabic bodies are required (RULE-NOTIF-006)" | — | Shown above body tabs |

**Footer:** [Save — RULE-NOTIF-006/007] [Cancel] + [Deactivate] in Edit mode

### Empty State
`EmptyState` icon="ti-template" title="No notification templates" description="Create templates to enable automated messaging"

---

## SCR-NOTIF-003 — Channel Configuration (Admin)

```
Screen     : SCR-NOTIF-003
Pattern    : PATTERN-2 — Inline Toggle List
Permissions: PAGE_CODE = NOTIFICATION_CHANNEL_CONFIG (Admin)
             VIEW · UPDATE only — 5 fixed seed rows, no create/delete
Location   : Sidebar → Notification Settings → Channels
File       : src/pages/Notifications/NotificationChannels.tsx (new)
```

### Layout
Single `Card` — inline configuration table, no drawer needed.

```
┌─────────────────────────────────────────────────────────────────┐
│ Breadcrumb: Notification Settings > Channels                    │
│ h1: "Channel Configuration"                                     │
│─────────────────────────────────────────────────────────────────│
│ Channel       Enabled   Provider Config           Action       │
│─────────────────────────────────────────────────────────────────│
│ 📧 Email      [●──]     smtp.example.com:587      [Edit]       │
│ 📱 SMS        [●──]     ⚠ AQ-010 pending          [Edit]       │
│ 💬 WhatsApp   [○──]     ⚠ AQ-011 pending          [Edit]       │
│ 🔔 Push       [●──]     fcm_key: ••••••••         [Edit]       │
│ 🏠 Internal   [●──]     (no config required)      —            │
│─────────────────────────────────────────────────────────────────│
│                                         [Save All Changes]     │
└─────────────────────────────────────────────────────────────────┘
```

### Row Fields
| Component | Props | Source | Notes |
|---|---|---|---|
| Channel name | text with icon | ENTITY-NOTIF-003.channelTypeId | Read-Only |
| `Switch` | label="" | ENTITY-NOTIF-003.isEnabledFl | RULE-NOTIF-005 |
| Config preview | text secondary truncated | ENTITY-NOTIF-003.configJson | |
| `Button` | variant="secondary" size="sm" → "Edit" | — | Opens inline JSON editor for that row |

### Disable Channel Warning
When a channel `Switch` is turned OFF:
`Alert` variant="warning" "Notifications for this channel will be logged as CHANNEL_DISABLED. Existing queued messages will not be retried."

### AQ-010/011 Indicator
For SMS and WhatsApp rows (pending provider selection):
`Badge` variant="warning" label="Provider Pending" in Config column

### Save Action
`Button` variant="primary" iconLeft="ti ti-device-floppy" → "Save Changes"
Calls PUT /api/v1/notifications/channel-configs/{id} for each modified row.

---

# ══════════════════════════════════════════════════════════
# CROSS-CUTTING DESIGN RULES
# ══════════════════════════════════════════════════════════

## Shared Empty States Pattern

All list screens follow the same `EmptyState` logic:
- **No data at all** → EmptyState with create action button
- **Search returns nothing** → EmptyState without action, with "clear filters" link
- **Permission denied** → `Alert` variant="danger" "You don't have permission to view this content"

## LOV / Dropdown Rules

All Select / dropdown fields that reference another entity:
- Show only **active** records by default (`is_active_fl = 1`)
- In **Edit mode**: always show the current value even if it's now inactive — with `Badge` variant="warning" "Inactive" appended
- Support **type-to-search** for lists > 20 items (server-side search)
- Show **both EN and AR** name in the dropdown option label: `"Head Office · مكتب رئيسي"`

## Business Code Fields (auto-generated)

Fields like `legal_entity_code`, `branch_code`, `department_code`, etc.:
- **Hidden in Create form** (server generates on save)
- **Shown Read-Only in Edit form** — labeled "Code (auto-generated)" with mono font
- **Never editable** after creation (RULE-ORG-011/012)

## Bilingual Name Fields

Wherever `nameEn` + `nameAr` both exist:
- Preferred layout: **side-by-side** in 2-column grid if width allows
- Fallback: **Tabs** `items=[{id:'en', label:'English'}, {id:'ar', label:'Arabic'}]` if width is constrained

## RTL CSS Rules (mandatory — from PROJECT_SPEC)

```css
/* Always use logical properties: */
margin-inline-start  (not margin-left)
padding-inline-start (not padding-left)
border-inline-start  (not border-left)
inset-inline-start   (not left)
text-align: start    (not text-align: left)
```

## Deactivation vs Deletion

All ORG entities use **soft deactivation** (not hard delete):
- Button: `Button` variant="danger" → "Deactivate" (not "Delete")
- Confirm `Dialog` before any deactivation
- Cascade check fires first — show `Alert` variant="warning" if dependents exist
- Re-activation: `Button` variant="accent" → "Activate"

---

## Session Summary

```
══════════════════════════════════════════════════════════════════
UI/UX DESIGN ENGINE — ui-ux-spec.md Session Summary
══════════════════════════════════════════════════════════════════
Language          : English
Stack binding     : AVELYNQ ERP (React 18 / Zustand 5 / Tabler icons)
Screens specified : 18 (SEC:7 · ORG:7 · FILE:1 · NOTIF:3)
SCR-ORG-008       : BLOCKED-BY-OQ-ORG-002
Every field       : traces to SRS B3 — nothing invented
Component mapping : every field → specific AVELYNQ primitive
File proposals    : listed per screen (proposal — P3.2 decides final)
Governance note   : Component names, file paths, store names = PROPOSAL
                    Final authority: P3.2 (F1/F4 phases)
══════════════════════════════════════════════════════════════════
```
