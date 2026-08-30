# UI Shell Manifest — ORG
Extracted: 2026-08-25
Source: frontend/src/pages/Organization/
GATE: UI SHELL COMPLETE confirmed: Unconfirmed (Step 0 note: No formal execution-state.json governance file found; scanned existing React UI Shell in frontend/src/pages/Organization/)

## Components

### Component: LegalEntitiesPage
- **Component name** : LegalEntitiesPage
- **File path**      : pages/Organization/LegalEntities.tsx
- **Type**           : Page component (route-mounted, "Page" suffix)
- **Props accepted** : `{}` (React.FC, no props)
- **Renders**        : Header bar with breadcrumb + KPI stats row (total, active, inactive) + filter bar (search, entity type, status) + legal entities table (code, bilingual names, entity type badge, status badge, action buttons) + create/edit drawer + cascade warning / deactivation dialog

### Component: BranchesPage
- **Component name** : BranchesPage
- **File path**      : pages/Organization/Branches.tsx
- **Type**           : Page component (route-mounted, "Page" suffix)
- **Props accepted** : `{}` (React.FC, no props)
- **Renders**        : Header bar with breadcrumb + KPI stats row (total, active, inactive) + filter bar (search, legal entity select, branch type select, status select) + branches table (code, bilingual names, parent entity, branch type badge, status badge, contextual navigation links to depts/cost centers/locations) + create/edit drawer + cascade deactivation dialog

### Component: RegionsPage
- **Component name** : RegionsPage
- **File path**      : pages/Organization/Regions.tsx
- **Type**           : Page component (route-mounted, "Page" suffix)
- **Props accepted** : `{}` (React.FC, no props)
- **Renders**        : Header bar with breadcrumb + KPI stats row (total, active, inactive) + filter bar (search, legal entity select, region type select, status select) + regions table (code, bilingual names, parent entity, region type badge, status badge, edit/deactivate actions) + create/edit drawer + deactivation dialog

### Component: DepartmentsPage
- **Component name** : DepartmentsPage
- **File path**      : pages/Organization/Departments.tsx
- **Type**           : Page component (route-mounted, "Page" suffix)
- **Props accepted** : `{}` (React.FC, no props)
- **Renders**        : Header bar with breadcrumb + KPI stats row (total, summary units, detail units) + required branch selector bar + two-column layout: collapsible hierarchical tree panel with expand/collapse/add-child/edit/deactivate actions (left) and node inspection / create / edit form (right) + deactivation dialog

### Component: CostCentersPage
- **Component name** : CostCentersPage
- **File path**      : pages/Organization/CostCenters.tsx
- **Type**           : Page component (route-mounted, "Page" suffix)
- **Props accepted** : `{}` (React.FC, no props)
- **Renders**        : Header bar with breadcrumb + KPI stats row (total, direct centers, shared overhead) + required branch selector bar + two-column layout: collapsible hierarchical tree panel with cost center type & summary/detail badges (left) and node inspection / create / edit form with costCenterTypeId select (right) + deactivation dialog

### Component: ProfitCentersPage
- **Component name** : ProfitCentersPage
- **File path**      : pages/Organization/ProfitCenters.tsx
- **Type**           : Page component (route-mounted, "Page" suffix)
- **Props accepted** : `{}` (React.FC, no props)
- **Renders**        : Header bar with breadcrumb + KPI stats row (total, active, inactive) + filter bar (search, legal entity select, status select) + profit centers table (code, bilingual names, legal entity, status badge, edit/deactivate actions) + create/edit drawer + deactivation dialog

### Component: LocationSitesPage
- **Component name** : LocationSitesPage
- **File path**      : pages/Organization/LocationSites.tsx
- **Type**           : Page component (route-mounted, "Page" suffix)
- **Props accepted** : `{}` (React.FC, no props)
- **Renders**        : Header bar with breadcrumb + KPI stats row (total, active, inactive) + filter bar (search, branch select, site type select, status select) + location sites table (code, bilingual names, assigned branch, site type badge, status badge, edit/deactivate actions) + create/edit drawer + deactivation dialog

## Routes

From `frontend/src/App.tsx` (state-based screen navigation mapped from `frontend/src/stores/useNavigationStore.ts` ScreenType union):

- **Route path**     : `org-entities`
  - **Component**      : LegalEntitiesPage
  - **Guard present**  : No (global isAuthenticated check in App.tsx; no per-route <ProtectedRoute .../> or PERM_ORG_* permission gate)
  - **Child routes**   : None

- **Route path**     : `org-branches`
  - **Component**      : BranchesPage
  - **Guard present**  : No
  - **Child routes**   : None

- **Route path**     : `org-regions`
  - **Component**      : RegionsPage
  - **Guard present**  : No
  - **Child routes**   : None

- **Route path**     : `org-departments`
  - **Component**      : DepartmentsPage
  - **Guard present**  : No
  - **Child routes**   : None

- **Route path**     : `org-cost-centers`
  - **Component**      : CostCentersPage
  - **Guard present**  : No
  - **Child routes**   : None

- **Route path**     : `org-profit-centers`
  - **Component**      : ProfitCentersPage
  - **Guard present**  : No
  - **Child routes**   : None

- **Route path**     : `org-locations`
  - **Component**      : LocationSitesPage
  - **Guard present**  : No
  - **Child routes**   : None

## Existing Models/Interfaces

### Type: LegalEntity
- **Name**   : LegalEntity
- **Source** : frontend/src/data/mockData.ts
- **Fields**:
  - `id`: string
  - `legalEntityCode`: string
  - `nameEn`: string
  - `nameAr`: string
  - `entityTypeId`: 'HEAD_OFFICE' | 'BRANCH_OFFICE' | 'SUBSIDIARY' | 'REP_OFFICE'
  - `notes?`: string
  - `isActive`: boolean
  - `activeBranchesCount?`: number

### Type: Branch
- **Name**   : Branch
- **Source** : frontend/src/data/mockData.ts
- **Fields**:
  - `id`: string
  - `branchCode`: string
  - `nameEn`: string
  - `nameAr`: string
  - `legalEntityFk`: string
  - `branchTypeId`: 'MAIN' | 'SUB' | 'OPERATIONS' | 'ADMIN'
  - `notes?`: string
  - `isActive`: boolean

### Type: Region
- **Name**   : Region
- **Source** : frontend/src/data/mockData.ts
- **Fields**:
  - `id`: string
  - `regionCode`: string
  - `nameEn`: string
  - `nameAr`: string
  - `legalEntityFk`: string
  - `regionTypeIdFk`: 'CENTRAL' | 'WESTERN' | 'EASTERN' | 'SOUTHERN' | 'NORTHERN'
  - `notes?`: string
  - `isActive`: boolean

### Type: DepartmentNode
- **Name**   : DepartmentNode
- **Source** : frontend/src/data/mockData.ts
- **Fields**:
  - `id`: string
  - `deptCode`: string
  - `nameEn`: string
  - `nameAr`: string
  - `branchFk`: string
  - `parentDepartmentFk?`: string | null
  - `nodeTypeId`: 'SUMMARY' | 'DETAIL'
  - `notes?`: string
  - `isActive`: boolean
  - `children?`: DepartmentNode[]

### Type: CostCenterNode
- **Name**   : CostCenterNode
- **Source** : frontend/src/data/mockData.ts
- **Fields**:
  - `id`: string
  - `costCenterCode`: string
  - `nameEn`: string
  - `nameAr`: string
  - `branchFk`: string
  - `parentCostCenterFk?`: string | null
  - `costCenterTypeId`: 'DIRECT' | 'INDIRECT' | 'SHARED'
  - `nodeTypeId`: 'SUMMARY' | 'DETAIL'
  - `notes?`: string
  - `isActive`: boolean
  - `children?`: CostCenterNode[]

### Type: ProfitCenter
- **Name**   : ProfitCenter
- **Source** : frontend/src/data/mockData.ts
- **Fields**:
  - `id`: string
  - `profitCenterCode`: string
  - `nameEn`: string
  - `nameAr`: string
  - `legalEntityFk`: string
  - `notes?`: string
  - `isActive`: boolean

### Type: LocationSite
- **Name**   : LocationSite
- **Source** : frontend/src/data/mockData.ts
- **Fields**:
  - `id`: string
  - `locationSiteCode`: string
  - `nameEn`: string
  - `nameAr`: string
  - `branchFk`: string
  - `siteTypeId`: 'OFFICE' | 'WAREHOUSE' | 'FACTORY' | 'SITE' | 'RETAIL'
  - `notes?`: string
  - `isActive`: boolean

### Type: OrganizationState
- **Name**   : OrganizationState
- **Source** : frontend/src/stores/useOrganizationStore.ts
- **Fields**:
  - `legalEntities`: LegalEntity[]
  - `branches`: Branch[]
  - `regions`: Region[]
  - `departments`: DepartmentNode[]
  - `costCenters`: CostCenterNode[]
  - `profitCenters`: ProfitCenter[]
  - `locationSites`: LocationSite[]
  - `selectedLegalEntity`: LegalEntity | null
  - `selectedBranch`: Branch | null
  - `selectedRegion`: Region | null
  - `selectedDepartment`: DepartmentNode | null
  - `selectedCostCenter`: CostCenterNode | null
  - `selectedProfitCenter`: ProfitCenter | null
  - `selectedLocationSite`: LocationSite | null
  - `entitySearch`: string
  - `entityTypeFilter`: string
  - `entityStatusFilter`: string
  - `branchSearch`: string
  - `branchEntityFilter`: string
  - `branchTypeFilter`: string
  - `branchStatusFilter`: string
  - `regionSearch`: string
  - `regionEntityFilter`: string
  - `regionTypeFilter`: string
  - `regionStatusFilter`: string
  - `deptBranchFilter`: string
  - `deptSearch`: string
  - `costCenterBranchFilter`: string
  - `costCenterTypeFilter`: string
  - `costCenterSearch`: string
  - `profitSearch`: string
  - `profitEntityFilter`: string
  - `profitStatusFilter`: string
  - `locationSearch`: string
  - `locationBranchFilter`: string
  - `locationTypeFilter`: string
  - `locationStatusFilter`: string
  - `isEntityDrawerOpen`: boolean
  - `isBranchDrawerOpen`: boolean
  - `isRegionDrawerOpen`: boolean
  - `isProfitDrawerOpen`: boolean
  - `isLocationDrawerOpen`: boolean
  - `isConfirmDialogOpen`: boolean
  - `confirmActionType`: 'DEACTIVATE_ENTITY' | 'DEACTIVATE_BRANCH' | 'DEACTIVATE_REGION' | 'DEACTIVATE_DEPT' | 'DEACTIVATE_COST_CENTER' | 'DEACTIVATE_PROFIT' | 'DEACTIVATE_LOCATION' | null
  - `confirmTargetId`: string | null
  - `cascadeWarningMessage`: string | null
  - `setEntitySearch`: (query: string) => void
  - `setEntityTypeFilter`: (type: string) => void
  - `setEntityStatusFilter`: (status: string) => void
  - `setBranchSearch`: (query: string) => void
  - `setBranchEntityFilter`: (entityId: string) => void
  - `setBranchTypeFilter`: (type: string) => void
  - `setBranchStatusFilter`: (status: string) => void
  - `setRegionSearch`: (query: string) => void
  - `setRegionEntityFilter`: (entityId: string) => void
  - `setRegionTypeFilter`: (type: string) => void
  - `setRegionStatusFilter`: (status: string) => void
  - `setDeptBranchFilter`: (branchId: string) => void
  - `setDeptSearch`: (query: string) => void
  - `setCostCenterBranchFilter`: (branchId: string) => void
  - `setCostCenterTypeFilter`: (type: string) => void
  - `setCostCenterSearch`: (query: string) => void
  - `setProfitSearch`: (query: string) => void
  - `setProfitEntityFilter`: (entityId: string) => void
  - `setProfitStatusFilter`: (status: string) => void
  - `setLocationSearch`: (query: string) => void
  - `setLocationBranchFilter`: (branchId: string) => void
  - `setLocationTypeFilter`: (type: string) => void
  - `setLocationStatusFilter`: (status: string) => void
  - `openEntityDrawer`: (entity?: LegalEntity | null) => void
  - `closeEntityDrawer`: () => void
  - `saveLegalEntity`: (data: Partial<LegalEntity>) => void
  - `deactivateLegalEntity`: (id: string) => void
  - `openBranchDrawer`: (branch?: Branch | null) => void
  - `closeBranchDrawer`: () => void
  - `saveBranch`: (data: Partial<Branch>) => void
  - `deactivateBranch`: (id: string) => void
  - `openRegionDrawer`: (region?: Region | null) => void
  - `closeRegionDrawer`: () => void
  - `saveRegion`: (data: Partial<Region>) => void
  - `deactivateRegion`: (id: string) => void
  - `setSelectedDepartment`: (dept: DepartmentNode | null) => void
  - `saveDepartment`: (deptData: Partial<DepartmentNode>) => void
  - `deactivateDepartment`: (id: string) => void
  - `setSelectedCostCenter`: (cc: CostCenterNode | null) => void
  - `saveCostCenter`: (ccData: Partial<CostCenterNode>) => void
  - `deactivateCostCenter`: (id: string) => void
  - `openProfitDrawer`: (profit?: ProfitCenter | null) => void
  - `closeProfitDrawer`: () => void
  - `saveProfitCenter`: (data: Partial<ProfitCenter>) => void
  - `deactivateProfitCenter`: (id: string) => void
  - `openLocationDrawer`: (loc?: LocationSite | null) => void
  - `closeLocationDrawer`: () => void
  - `saveLocationSite`: (data: Partial<LocationSite>) => void
  - `deactivateLocationSite`: (id: string) => void
  - `openConfirmDialog`: (type: OrganizationState['confirmActionType'], targetId: string, warning?: string | null) => void
  - `closeConfirmDialog`: () => void
  - `executeConfirmAction`: () => void

## Data Sources (pre-integration)

- **Component**      : LegalEntitiesPage
  - **Data source**    : Local Zustand store (`useOrganizationStore.legalEntities`), seeded from `mockLegalEntities` in `src/data/mockData.ts`
  - **Shape observed** : Array of `LegalEntity` objects (`id`, `legalEntityCode`, `nameEn`, `nameAr`, `entityTypeId`, `notes`, `isActive`, `activeBranchesCount`)

- **Component**      : BranchesPage
  - **Data source**    : Local Zustand store (`useOrganizationStore.branches` and `useOrganizationStore.legalEntities`), seeded from `mockBranches` and `mockLegalEntities`
  - **Shape observed** : Array of `Branch` objects (`id`, `branchCode`, `nameEn`, `nameAr`, `legalEntityFk`, `branchTypeId`, `notes`, `isActive`)

- **Component**      : RegionsPage
  - **Data source**    : Local Zustand store (`useOrganizationStore.regions` and `useOrganizationStore.legalEntities`), seeded from `mockRegions` and `mockLegalEntities`
  - **Shape observed** : Array of `Region` objects (`id`, `regionCode`, `nameEn`, `nameAr`, `legalEntityFk`, `regionTypeIdFk`, `notes`, `isActive`)

- **Component**      : DepartmentsPage
  - **Data source**    : Local Zustand store (`useOrganizationStore.departments` and `useOrganizationStore.branches`), seeded from `mockDepartments` and `mockBranches`
  - **Shape observed** : Recursive tree array of `DepartmentNode` objects (`id`, `deptCode`, `nameEn`, `nameAr`, `branchFk`, `parentDepartmentFk`, `nodeTypeId`, `notes`, `isActive`, `children`)

- **Component**      : CostCentersPage
  - **Data source**    : Local Zustand store (`useOrganizationStore.costCenters` and `useOrganizationStore.branches`), seeded from `mockCostCenters` and `mockBranches`
  - **Shape observed** : Recursive tree array of `CostCenterNode` objects (`id`, `costCenterCode`, `nameEn`, `nameAr`, `branchFk`, `parentCostCenterFk`, `costCenterTypeId`, `nodeTypeId`, `notes`, `isActive`, `children`)

- **Component**      : ProfitCentersPage
  - **Data source**    : Local Zustand store (`useOrganizationStore.profitCenters` and `useOrganizationStore.legalEntities`), seeded from `mockProfitCenters` and `mockLegalEntities`
  - **Shape observed** : Array of `ProfitCenter` objects (`id`, `profitCenterCode`, `nameEn`, `nameAr`, `legalEntityFk`, `notes`, `isActive`)

- **Component**      : LocationSitesPage
  - **Data source**    : Local Zustand store (`useOrganizationStore.locationSites` and `useOrganizationStore.branches`), seeded from `mockLocationSites` and `mockBranches`
  - **Shape observed** : Array of `LocationSite` objects (`id`, `locationSiteCode`, `nameEn`, `nameAr`, `branchFk`, `siteTypeId`, `notes`, `isActive`)

## Gaps (not found — expected integration work for P3.2 F4)

- **No dedicated route file (`organization.routes.tsx`)**: Routes are declared as a switch-case inside `src/App.tsx` and keyed through `src/stores/useNavigationStore.ts`.
- **No route guards / permission checks wired**: No `<ProtectedRoute .../>` or PERM_ORG_* permission checks are wired on any route.
- **Directory placement**: Source files currently reside in `src/pages/Organization/` and `src/stores/useOrganizationStore.ts` rather than `src/features/organization/`.
- **No real API / TanStack Query client**: Data is stored and mutated purely in memory via Zustand; no HTTP client or asynchronous state fetching is wired.
