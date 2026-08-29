# UI Shell Manifest — ORG
Extracted: 2026-08-29
Source: frontend/src/pages/Organization/
GATE: UI SHELL COMPLETE confirmed: Yes — confirmed by user 2026-08-29. No `governance/modules/ORG/execution-state.json` exists to record this in the module's own state file; that recording is outside the scope of this extraction.

**Structural note:** This repo does not use the `frontend/src/features/[module-kebab]/` layout the extraction prompt assumes. There is no `src/features/` directory at all. The ORG module's UI Shell instead lives at `frontend/src/pages/Organization/`, and per user instruction this was treated as the equivalent source for module code ORG. There is also no `react-router`-style route config file — navigation is a single in-memory state machine (`currentScreen` in `useNavigationStore`) switched over in `frontend/src/App.tsx`, not a declarative route tree. The "Routes" section below is adapted to this reality: "screen key" stands in for "route path."

---

## Components

### LegalEntitiesPage
Component name : `LegalEntitiesPage`
File path      : `src/pages/Organization/LegalEntities.tsx`
Type           : Page component (screen-mounted, "Page" suffix)
Props accepted : None — `React.FC` with no props; all data/state comes from `useOrganizationStore()` and `useLanguage()`
Renders        : Search/type/status filter bar + legal entities data table + create/edit drawer + cascade-warning deactivation confirm dialog

### BranchesPage
Component name : `BranchesPage`
File path      : `src/pages/Organization/Branches.tsx`
Type           : Page component (screen-mounted, "Page" suffix)
Props accepted : None — `React.FC` with no props
Renders        : Search/entity/type/status filter bar + branches data table (with per-row links to Departments/Cost Centers/Location Sites filtered by branch) + create/edit drawer + cascade-warning deactivation confirm dialog

### RegionsPage
Component name : `RegionsPage`
File path      : `src/pages/Organization/Regions.tsx`
Type           : Page component (screen-mounted, "Page" suffix)
Props accepted : None — `React.FC` with no props
Renders        : Search/entity/type/status filter bar + regions data table + create/edit drawer + deactivation confirm dialog

### DepartmentsPage
Component name : `DepartmentsPage`
File path      : `src/pages/Organization/Departments.tsx`
Type           : Page component (screen-mounted, "Page" suffix)
Props accepted : None — `React.FC` with no props
Renders        : Branch-filter requirement bar + two-column layout: recursive tree panel (department hierarchy, expand/collapse, add-child/add-root) + entry/inspection form panel + deactivation confirm dialog

### CostCentersPage
Component name : `CostCentersPage`
File path      : `src/pages/Organization/CostCenters.tsx`
Type           : Page component (screen-mounted, "Page" suffix)
Props accepted : None — `React.FC` with no props
Renders        : Branch-filter requirement bar + two-column layout: recursive tree panel (cost center hierarchy, expand/collapse, add-child/add-root) + entry/inspection form panel + deactivation confirm dialog

### ProfitCentersPage
Component name : `ProfitCentersPage`
File path      : `src/pages/Organization/ProfitCenters.tsx`
Type           : Page component (screen-mounted, "Page" suffix)
Props accepted : None — `React.FC` with no props
Renders        : Search/entity/status filter bar + profit centers data table + create/edit drawer + deactivation confirm dialog

### LocationSitesPage
Component name : `LocationSitesPage`
File path      : `src/pages/Organization/LocationSites.tsx`
Type           : Page component (screen-mounted, "Page" suffix)
Props accepted : None — `React.FC` with no props
Renders        : Search/branch/type/status filter bar + location sites data table + create/edit drawer + deactivation confirm dialog

---

## Routes

No route config file exists (no `react-router`, no path strings). Navigation is a `currentScreen` string held in `useNavigationStore`, switched over in `src/App.tsx`'s `renderCurrentScreen()`. Screen-key order below is preserved exactly as declared in that `switch` statement (App.tsx:116-130).

Route path     : `org-entities` (screen key, not a URL path)
Component      : `LegalEntitiesPage`
Guard present  : No — no permission check wired around this case in `App.tsx`'s switch (contrast with `sec-users`, which is gated by `can('PERM_USER_VIEW')`). This is a gap for F4 to flag.
Child routes   : None

Route path     : `org-branches`
Component      : `BranchesPage`
Guard present  : No
Child routes   : None

Route path     : `org-regions`
Component      : `RegionsPage`
Guard present  : No
Child routes   : None

Route path     : `org-departments`
Component      : `DepartmentsPage`
Guard present  : No
Child routes   : None

Route path     : `org-cost-centers`
Component      : `CostCentersPage`
Guard present  : No
Child routes   : None

Route path     : `org-profit-centers`
Component      : `ProfitCentersPage`
Guard present  : No
Child routes   : None

Route path     : `org-locations`
Component      : `LocationSitesPage`
Guard present  : No
Child routes   : None

---

## Existing Models/Interfaces

All declared in `src/data/mockData.ts` (lines 200-279), under the file's own `MODULE 2: ORGANIZATION (ORG)` section header.

Name    : `LegalEntity`
Fields  : `id: string`, `legalEntityCode: string` (auto-generated / read-only in edit), `nameEn: string`, `nameAr: string`, `entityTypeId: 'HEAD_OFFICE' | 'BRANCH_OFFICE' | 'SUBSIDIARY' | 'REP_OFFICE'`, `notes?: string`, `isActive: boolean`, `activeBranchesCount?: number`
Source  : `src/data/mockData.ts:200-209`

Name    : `Branch`
Fields  : `id: string`, `branchCode: string` (auto-generated / read-only in edit), `nameEn: string`, `nameAr: string`, `legalEntityFk: string` (ref `LegalEntity.id`), `branchTypeId: 'MAIN' | 'SUB' | 'OPERATIONS' | 'ADMIN'`, `notes?: string`, `isActive: boolean`
Source  : `src/data/mockData.ts:211-220`

Name    : `Region`
Fields  : `id: string`, `regionCode: string` (auto-generated / read-only in edit), `nameEn: string`, `nameAr: string`, `legalEntityFk: string` (ref `LegalEntity.id`), `regionTypeIdFk: 'CENTRAL' | 'WESTERN' | 'EASTERN' | 'SOUTHERN' | 'NORTHERN'`, `notes?: string`, `isActive: boolean`
Source  : `src/data/mockData.ts:222-231`

Name    : `DepartmentNode`
Fields  : `id: string`, `deptCode: string` (auto-generated), `nameEn: string`, `nameAr: string`, `branchFk: string` (ref `Branch.id`), `parentDepartmentFk?: string | null`, `nodeTypeId: 'SUMMARY' | 'DETAIL'` (locked post-save), `notes?: string`, `isActive: boolean`, `children?: DepartmentNode[]`
Source  : `src/data/mockData.ts:233-244`

Name    : `CostCenterNode`
Fields  : `id: string`, `costCenterCode: string` (auto-generated), `nameEn: string`, `nameAr: string`, `branchFk: string` (ref `Branch.id`), `parentCostCenterFk?: string | null`, `costCenterTypeId: 'DIRECT' | 'INDIRECT' | 'SHARED'`, `nodeTypeId: 'SUMMARY' | 'DETAIL'` (locked post-save), `notes?: string`, `isActive: boolean`, `children?: CostCenterNode[]`
Source  : `src/data/mockData.ts:246-258`

Name    : `ProfitCenter`
Fields  : `id: string`, `profitCenterCode: string` (auto-generated), `nameEn: string`, `nameAr: string`, `legalEntityFk: string` (ref `LegalEntity.id`), `notes?: string`, `isActive: boolean`
Source  : `src/data/mockData.ts:260-268`

Name    : `LocationSite`
Fields  : `id: string`, `locationSiteCode: string` (auto-generated), `nameEn: string`, `nameAr: string`, `branchFk: string` (ref `Branch.id`), `siteTypeId: 'OFFICE' | 'WAREHOUSE' | 'FACTORY' | 'SITE' | 'RETAIL'`, `notes?: string`, `isActive: boolean`
Source  : `src/data/mockData.ts:270-279`

---

## Data Sources (pre-integration)

All seven pages read exclusively through `useOrganizationStore()` (Zustand) — none embed a hardcoded array literal locally and none are unbound placeholders. The store's initial state is itself seeded from static arrays imported from `src/data/mockData.ts` (`mockLegalEntities`, `mockBranches`, `mockRegions`, `mockDepartments`, `mockCostCenters`, `mockProfitCenters`, `mockLocationSites` — `src/stores/useOrganizationStore.ts:10-17,250-256`). All CRUD actions (`saveBranch`, `saveLegalEntity`, `executeConfirmAction`, etc.) mutate this in-memory store only — no HTTP/API calls exist anywhere in this module's Shell.

Component      : `LegalEntitiesPage`
Data source    : Imported mock JSON-like array, via store (`legalEntities` from `useOrganizationStore`)
Shape observed : Array of `LegalEntity`

Component      : `BranchesPage`
Data source    : Imported mock array, via store (`branches`, `legalEntities` from `useOrganizationStore`)
Shape observed : Array of `Branch`; joins against `legalEntities` client-side for display

Component      : `RegionsPage`
Data source    : Imported mock array, via store (`regions`, `legalEntities` from `useOrganizationStore`)
Shape observed : Array of `Region`

Component      : `DepartmentsPage`
Data source    : Imported mock array, via store (`departments`, `branches` from `useOrganizationStore`)
Shape observed : Array of `DepartmentNode`, pre-nested via `children` (tree already shaped in mock data, not built client-side)

Component      : `CostCentersPage`
Data source    : Imported mock array, via store (`costCenters`, `branches` from `useOrganizationStore`)
Shape observed : Array of `CostCenterNode`, pre-nested via `children`

Component      : `ProfitCentersPage`
Data source    : Imported mock array, via store (`profitCenters`, `legalEntities` from `useOrganizationStore`)
Shape observed : Array of `ProfitCenter`

Component      : `LocationSitesPage`
Data source    : Imported mock array, via store (`locationSites`, `branches` from `useOrganizationStore`)
Shape observed : Array of `LocationSite`

---

## Gaps (not found — expected integration work for P3.2 F4)

- No route guard wired on any of the 7 `org-*` screens — `App.tsx`'s switch statement applies zero `can()`/permission checks for Organization screens, unlike `sec-users` (`can('PERM_USER_VIEW')`). All seven are open to any authenticated user regardless of permission.
- No routing file / declarative route tree exists for this module (or any module) — navigation is an ad-hoc `currentScreen` string switch in `App.tsx`, not path-based routing. F4's route-ordering rule (tree routes before `/:id/*`) has no literal target here; F4 will need to decide how (or whether) to map this screen-switch pattern onto real routes during integration.
- No API/HTTP data binding anywhere — all data is static, seeded once from `mockData.ts` into a Zustand store, and all "saves" are in-memory only. Every one of the 7 screens is an integration gap for real API wiring.
- `GATE: UI SHELL COMPLETE` was confirmed for ORG by the user directly (2026-08-29) during this extraction, not via a `governance/modules/ORG/execution-state.json` record — no such file exists for this module. If the project convention requires that file for a durable record, creating it is separate follow-up work, not part of this extraction.
