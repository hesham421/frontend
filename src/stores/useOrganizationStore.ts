import { create } from 'zustand';
import {
  LegalEntity,
  Branch,
  Region,
  DepartmentNode,
  CostCenterNode,
  ProfitCenter,
  LocationSite,
  mockLegalEntities,
  mockBranches,
  mockRegions,
  mockDepartments,
  mockCostCenters,
  mockProfitCenters,
  mockLocationSites,
} from '../data/mockData';

export interface OrganizationState {
  legalEntities: LegalEntity[];
  branches: Branch[];
  regions: Region[];
  departments: DepartmentNode[];
  costCenters: CostCenterNode[];
  profitCenters: ProfitCenter[];
  locationSites: LocationSite[];

  // Selected Entities for Drawers/Modals
  selectedLegalEntity: LegalEntity | null;
  selectedBranch: Branch | null;
  selectedRegion: Region | null;
  selectedDepartment: DepartmentNode | null;
  selectedCostCenter: CostCenterNode | null;
  selectedProfitCenter: ProfitCenter | null;
  selectedLocationSite: LocationSite | null;

  // Filters
  entitySearch: string;
  entityTypeFilter: string;
  entityStatusFilter: string;

  branchSearch: string;
  branchEntityFilter: string;
  branchTypeFilter: string;
  branchStatusFilter: string;

  regionSearch: string;
  regionEntityFilter: string;
  regionTypeFilter: string;
  regionStatusFilter: string;

  deptBranchFilter: string; // Required before tree displays
  deptSearch: string;

  costCenterBranchFilter: string; // Required before tree displays
  costCenterTypeFilter: string;
  costCenterSearch: string;

  profitSearch: string;
  profitEntityFilter: string;
  profitStatusFilter: string;

  locationSearch: string;
  locationBranchFilter: string;
  locationTypeFilter: string;
  locationStatusFilter: string;

  // Drawers & Dialogs
  isEntityDrawerOpen: boolean;
  isBranchDrawerOpen: boolean;
  isRegionDrawerOpen: boolean;
  isProfitDrawerOpen: boolean;
  isLocationDrawerOpen: boolean;

  isConfirmDialogOpen: boolean;
  confirmActionType: 'DEACTIVATE_ENTITY' | 'DEACTIVATE_BRANCH' | 'DEACTIVATE_REGION' | 'DEACTIVATE_DEPT' | 'DEACTIVATE_COST_CENTER' | 'DEACTIVATE_PROFIT' | 'DEACTIVATE_LOCATION' | null;
  confirmTargetId: string | null;
  cascadeWarningMessage: string | null;

  // Filter Setters
  setEntitySearch: (query: string) => void;
  setEntityTypeFilter: (type: string) => void;
  setEntityStatusFilter: (status: string) => void;

  setBranchSearch: (query: string) => void;
  setBranchEntityFilter: (entityId: string) => void;
  setBranchTypeFilter: (type: string) => void;
  setBranchStatusFilter: (status: string) => void;

  setRegionSearch: (query: string) => void;
  setRegionEntityFilter: (entityId: string) => void;
  setRegionTypeFilter: (type: string) => void;
  setRegionStatusFilter: (status: string) => void;

  setDeptBranchFilter: (branchId: string) => void;
  setDeptSearch: (query: string) => void;

  setCostCenterBranchFilter: (branchId: string) => void;
  setCostCenterTypeFilter: (type: string) => void;
  setCostCenterSearch: (query: string) => void;

  setProfitSearch: (query: string) => void;
  setProfitEntityFilter: (entityId: string) => void;
  setProfitStatusFilter: (status: string) => void;

  setLocationSearch: (query: string) => void;
  setLocationBranchFilter: (branchId: string) => void;
  setLocationTypeFilter: (type: string) => void;
  setLocationStatusFilter: (status: string) => void;

  // Drawer Toggles
  openEntityDrawer: (entity?: LegalEntity | null) => void;
  closeEntityDrawer: () => void;
  saveLegalEntity: (data: Partial<LegalEntity>) => void;
  deactivateLegalEntity: (id: string) => void;

  openBranchDrawer: (branch?: Branch | null) => void;
  closeBranchDrawer: () => void;
  saveBranch: (data: Partial<Branch>) => void;
  deactivateBranch: (id: string) => void;

  openRegionDrawer: (region?: Region | null) => void;
  closeRegionDrawer: () => void;
  saveRegion: (data: Partial<Region>) => void;
  deactivateRegion: (id: string) => void;

  // Department Tree Operations
  setSelectedDepartment: (dept: DepartmentNode | null) => void;
  saveDepartment: (deptData: Partial<DepartmentNode>) => void;
  deactivateDepartment: (id: string) => void;

  // Cost Center Tree Operations
  setSelectedCostCenter: (cc: CostCenterNode | null) => void;
  saveCostCenter: (ccData: Partial<CostCenterNode>) => void;
  deactivateCostCenter: (id: string) => void;

  // Profit Centers
  openProfitDrawer: (profit?: ProfitCenter | null) => void;
  closeProfitDrawer: () => void;
  saveProfitCenter: (data: Partial<ProfitCenter>) => void;
  deactivateProfitCenter: (id: string) => void;

  // Locations
  openLocationDrawer: (loc?: LocationSite | null) => void;
  closeLocationDrawer: () => void;
  saveLocationSite: (data: Partial<LocationSite>) => void;
  deactivateLocationSite: (id: string) => void;

  // Confirmation Flow
  openConfirmDialog: (type: OrganizationState['confirmActionType'], targetId: string, warning?: string | null) => void;
  closeConfirmDialog: () => void;
  executeConfirmAction: () => void;
}

// Helper to recursively update or add a department node
function updateDeptTree(nodes: DepartmentNode[], updated: DepartmentNode): DepartmentNode[] {
  let found = false;
  const next = nodes.map((node) => {
    if (node.id === updated.id) {
      found = true;
      return { ...node, ...updated, children: updated.children ?? node.children };
    }
    if (node.children && node.children.length > 0) {
      return { ...node, children: updateDeptTree(node.children, updated) };
    }
    return node;
  });

  if (!found && !updated.parentDepartmentFk) {
    return [...next, updated];
  }
  if (!found && updated.parentDepartmentFk) {
    return addChildToDeptNode(next, updated.parentDepartmentFk, updated);
  }
  return next;
}

function addChildToDeptNode(nodes: DepartmentNode[], parentId: string, child: DepartmentNode): DepartmentNode[] {
  return nodes.map((n) => {
    if (n.id === parentId) {
      return { ...n, children: [...(n.children || []), child] };
    }
    if (n.children && n.children.length > 0) {
      return { ...n, children: addChildToDeptNode(n.children, parentId, child) };
    }
    return n;
  });
}

function deactivateDeptInTree(nodes: DepartmentNode[], id: string): DepartmentNode[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return { ...node, isActive: false };
    }
    if (node.children) {
      return { ...node, children: deactivateDeptInTree(node.children, id) };
    }
    return node;
  });
}

// Helper to recursively update or add a cost center node
function updateCostCenterTree(nodes: CostCenterNode[], updated: CostCenterNode): CostCenterNode[] {
  let found = false;
  const next = nodes.map((node) => {
    if (node.id === updated.id) {
      found = true;
      return { ...node, ...updated, children: updated.children ?? node.children };
    }
    if (node.children && node.children.length > 0) {
      return { ...node, children: updateCostCenterTree(node.children, updated) };
    }
    return node;
  });

  if (!found && !updated.parentCostCenterFk) {
    return [...next, updated];
  }
  if (!found && updated.parentCostCenterFk) {
    return addChildToCostCenterNode(next, updated.parentCostCenterFk, updated);
  }
  return next;
}

function addChildToCostCenterNode(nodes: CostCenterNode[], parentId: string, child: CostCenterNode): CostCenterNode[] {
  return nodes.map((n) => {
    if (n.id === parentId) {
      return { ...n, children: [...(n.children || []), child] };
    }
    if (n.children && n.children.length > 0) {
      return { ...n, children: addChildToCostCenterNode(n.children, parentId, child) };
    }
    return n;
  });
}

function deactivateCostCenterInTree(nodes: CostCenterNode[], id: string): CostCenterNode[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return { ...node, isActive: false };
    }
    if (node.children) {
      return { ...node, children: deactivateCostCenterInTree(node.children, id) };
    }
    return node;
  });
}

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  legalEntities: mockLegalEntities,
  branches: mockBranches,
  regions: mockRegions,
  departments: mockDepartments,
  costCenters: mockCostCenters,
  profitCenters: mockProfitCenters,
  locationSites: mockLocationSites,

  selectedLegalEntity: null,
  selectedBranch: null,
  selectedRegion: null,
  selectedDepartment: null,
  selectedCostCenter: null,
  selectedProfitCenter: null,
  selectedLocationSite: null,

  entitySearch: '',
  entityTypeFilter: 'ALL',
  entityStatusFilter: 'ALL',

  branchSearch: '',
  branchEntityFilter: 'ALL',
  branchTypeFilter: 'ALL',
  branchStatusFilter: 'ALL',

  regionSearch: '',
  regionEntityFilter: 'ALL',
  regionTypeFilter: 'ALL',
  regionStatusFilter: 'ALL',

  deptBranchFilter: 'br-1', // Default to Riyadh HQ
  deptSearch: '',

  costCenterBranchFilter: 'br-1',
  costCenterTypeFilter: 'ALL',
  costCenterSearch: '',

  profitSearch: '',
  profitEntityFilter: 'ALL',
  profitStatusFilter: 'ALL',

  locationSearch: '',
  locationBranchFilter: 'ALL',
  locationTypeFilter: 'ALL',
  locationStatusFilter: 'ALL',

  isEntityDrawerOpen: false,
  isBranchDrawerOpen: false,
  isRegionDrawerOpen: false,
  isProfitDrawerOpen: false,
  isLocationDrawerOpen: false,

  isConfirmDialogOpen: false,
  confirmActionType: null,
  confirmTargetId: null,
  cascadeWarningMessage: null,

  // Setters
  setEntitySearch: (entitySearch) => set({ entitySearch }),
  setEntityTypeFilter: (entityTypeFilter) => set({ entityTypeFilter }),
  setEntityStatusFilter: (entityStatusFilter) => set({ entityStatusFilter }),

  setBranchSearch: (branchSearch) => set({ branchSearch }),
  setBranchEntityFilter: (branchEntityFilter) => set({ branchEntityFilter }),
  setBranchTypeFilter: (branchTypeFilter) => set({ branchTypeFilter }),
  setBranchStatusFilter: (branchStatusFilter) => set({ branchStatusFilter }),

  setRegionSearch: (regionSearch) => set({ regionSearch }),
  setRegionEntityFilter: (regionEntityFilter) => set({ regionEntityFilter }),
  setRegionTypeFilter: (regionTypeFilter) => set({ regionTypeFilter }),
  setRegionStatusFilter: (regionStatusFilter) => set({ regionStatusFilter }),

  setDeptBranchFilter: (deptBranchFilter) => set({ deptBranchFilter, selectedDepartment: null }),
  setDeptSearch: (deptSearch) => set({ deptSearch }),

  setCostCenterBranchFilter: (costCenterBranchFilter) => set({ costCenterBranchFilter, selectedCostCenter: null }),
  setCostCenterTypeFilter: (costCenterTypeFilter) => set({ costCenterTypeFilter }),
  setCostCenterSearch: (costCenterSearch) => set({ costCenterSearch }),

  setProfitSearch: (profitSearch) => set({ profitSearch }),
  setProfitEntityFilter: (profitEntityFilter) => set({ profitEntityFilter }),
  setProfitStatusFilter: (profitStatusFilter) => set({ profitStatusFilter }),

  setLocationSearch: (locationSearch) => set({ locationSearch }),
  setLocationBranchFilter: (locationBranchFilter) => set({ locationBranchFilter }),
  setLocationTypeFilter: (locationTypeFilter) => set({ locationTypeFilter }),
  setLocationStatusFilter: (locationStatusFilter) => set({ locationStatusFilter }),

  // Legal Entity Actions
  openEntityDrawer: (entity = null) => set({ selectedLegalEntity: entity, isEntityDrawerOpen: true }),
  closeEntityDrawer: () => set({ isEntityDrawerOpen: false }),
  saveLegalEntity: (data) =>
    set((state) => {
      if (data.id) {
        return {
          legalEntities: state.legalEntities.map((e) => (e.id === data.id ? { ...e, ...data } as LegalEntity : e)),
          isEntityDrawerOpen: false,
        };
      }
      const newEntity: LegalEntity = {
        id: `le-${Date.now()}`,
        legalEntityCode: `LE-00${state.legalEntities.length + 1}`,
        nameEn: data.nameEn || '',
        nameAr: data.nameAr || '',
        entityTypeId: data.entityTypeId || 'SUBSIDIARY',
        notes: data.notes || '',
        isActive: true,
        activeBranchesCount: 0,
      };
      return {
        legalEntities: [...state.legalEntities, newEntity],
        isEntityDrawerOpen: false,
      };
    }),
  deactivateLegalEntity: (id) =>
    set((state) => ({
      legalEntities: state.legalEntities.map((e) => (e.id === id ? { ...e, isActive: false } : e)),
    })),

  // Branch Actions
  openBranchDrawer: (branch = null) => set({ selectedBranch: branch, isBranchDrawerOpen: true }),
  closeBranchDrawer: () => set({ isBranchDrawerOpen: false }),
  saveBranch: (data) =>
    set((state) => {
      if (data.id) {
        return {
          branches: state.branches.map((b) => (b.id === data.id ? { ...b, ...data } as Branch : b)),
          isBranchDrawerOpen: false,
        };
      }
      const newBranch: Branch = {
        id: `br-${Date.now()}`,
        branchCode: `BR-${data.nameEn?.slice(0, 3).toUpperCase() || 'NEW'}-0${state.branches.length + 1}`,
        nameEn: data.nameEn || '',
        nameAr: data.nameAr || '',
        legalEntityFk: data.legalEntityFk || 'le-1',
        branchTypeId: data.branchTypeId || 'SUB',
        notes: data.notes || '',
        isActive: true,
      };
      return {
        branches: [...state.branches, newBranch],
        isBranchDrawerOpen: false,
      };
    }),
  deactivateBranch: (id) =>
    set((state) => ({
      branches: state.branches.map((b) => (b.id === id ? { ...b, isActive: false } : b)),
    })),

  // Region Actions
  openRegionDrawer: (region = null) => set({ selectedRegion: region, isRegionDrawerOpen: true }),
  closeRegionDrawer: () => set({ isRegionDrawerOpen: false }),
  saveRegion: (data) =>
    set((state) => {
      if (data.id) {
        return {
          regions: state.regions.map((r) => (r.id === data.id ? { ...r, ...data } as Region : r)),
          isRegionDrawerOpen: false,
        };
      }
      const newRegion: Region = {
        id: `reg-${Date.now()}`,
        regionCode: `REG-${data.regionTypeIdFk || 'NEW'}`,
        nameEn: data.nameEn || '',
        nameAr: data.nameAr || '',
        legalEntityFk: data.legalEntityFk || 'le-1',
        regionTypeIdFk: data.regionTypeIdFk || 'CENTRAL',
        notes: data.notes || '',
        isActive: true,
      };
      return {
        regions: [...state.regions, newRegion],
        isRegionDrawerOpen: false,
      };
    }),
  deactivateRegion: (id) =>
    set((state) => ({
      regions: state.regions.map((r) => (r.id === id ? { ...r, isActive: false } : r)),
    })),

  // Department Actions
  setSelectedDepartment: (dept) => set({ selectedDepartment: dept }),
  saveDepartment: (deptData) =>
    set((state) => {
      if (deptData.id) {
        const updated: DepartmentNode = {
          ...state.selectedDepartment!,
          ...deptData,
          nodeTypeId: state.selectedDepartment?.nodeTypeId || deptData.nodeTypeId || 'DETAIL', // Locked post-save
        } as DepartmentNode;
        return {
          departments: updateDeptTree(state.departments, updated),
          selectedDepartment: updated,
        };
      }
      const newDept: DepartmentNode = {
        id: `dept-${Date.now()}`,
        deptCode: `DEP-${Math.floor(100 + Math.random() * 900)}`,
        nameEn: deptData.nameEn || '',
        nameAr: deptData.nameAr || '',
        branchFk: deptData.branchFk || state.deptBranchFilter || 'br-1',
        parentDepartmentFk: deptData.parentDepartmentFk || null,
        nodeTypeId: deptData.nodeTypeId || 'DETAIL',
        notes: deptData.notes || '',
        isActive: true,
      };
      return {
        departments: updateDeptTree(state.departments, newDept),
        selectedDepartment: newDept,
      };
    }),
  deactivateDepartment: (id) =>
    set((state) => ({
      departments: deactivateDeptInTree(state.departments, id),
      selectedDepartment: state.selectedDepartment?.id === id ? { ...state.selectedDepartment, isActive: false } : state.selectedDepartment,
    })),

  // Cost Center Actions
  setSelectedCostCenter: (cc) => set({ selectedCostCenter: cc }),
  saveCostCenter: (ccData) =>
    set((state) => {
      if (ccData.id) {
        const updated: CostCenterNode = {
          ...state.selectedCostCenter!,
          ...ccData,
          nodeTypeId: state.selectedCostCenter?.nodeTypeId || ccData.nodeTypeId || 'DETAIL', // Locked post-save
        } as CostCenterNode;
        return {
          costCenters: updateCostCenterTree(state.costCenters, updated),
          selectedCostCenter: updated,
        };
      }
      const newCC: CostCenterNode = {
        id: `cc-${Date.now()}`,
        costCenterCode: `CC-${Math.floor(100 + Math.random() * 900)}`,
        nameEn: ccData.nameEn || '',
        nameAr: ccData.nameAr || '',
        branchFk: ccData.branchFk || state.costCenterBranchFilter || 'br-1',
        parentCostCenterFk: ccData.parentCostCenterFk || null,
        costCenterTypeId: ccData.costCenterTypeId || 'DIRECT',
        nodeTypeId: ccData.nodeTypeId || 'DETAIL',
        notes: ccData.notes || '',
        isActive: true,
      };
      return {
        costCenters: updateCostCenterTree(state.costCenters, newCC),
        selectedCostCenter: newCC,
      };
    }),
  deactivateCostCenter: (id) =>
    set((state) => ({
      costCenters: deactivateCostCenterInTree(state.costCenters, id),
      selectedCostCenter: state.selectedCostCenter?.id === id ? { ...state.selectedCostCenter, isActive: false } : state.selectedCostCenter,
    })),

  // Profit Center Actions
  openProfitDrawer: (profit = null) => set({ selectedProfitCenter: profit, isProfitDrawerOpen: true }),
  closeProfitDrawer: () => set({ isProfitDrawerOpen: false }),
  saveProfitCenter: (data) =>
    set((state) => {
      if (data.id) {
        return {
          profitCenters: state.profitCenters.map((p) => (p.id === data.id ? { ...p, ...data } as ProfitCenter : p)),
          isProfitDrawerOpen: false,
        };
      }
      const newPC: ProfitCenter = {
        id: `pc-${Date.now()}`,
        profitCenterCode: `PC-00${state.profitCenters.length + 1}`,
        nameEn: data.nameEn || '',
        nameAr: data.nameAr || '',
        legalEntityFk: data.legalEntityFk || 'le-1',
        notes: data.notes || '',
        isActive: true,
      };
      return {
        profitCenters: [...state.profitCenters, newPC],
        isProfitDrawerOpen: false,
      };
    }),
  deactivateProfitCenter: (id) =>
    set((state) => ({
      profitCenters: state.profitCenters.map((p) => (p.id === id ? { ...p, isActive: false } : p)),
    })),

  // Location Actions
  openLocationDrawer: (loc = null) => set({ selectedLocationSite: loc, isLocationDrawerOpen: true }),
  closeLocationDrawer: () => set({ isLocationDrawerOpen: false }),
  saveLocationSite: (data) =>
    set((state) => {
      if (data.id) {
        return {
          locationSites: state.locationSites.map((l) => (l.id === data.id ? { ...l, ...data } as LocationSite : l)),
          isLocationDrawerOpen: false,
        };
      }
      const newLoc: LocationSite = {
        id: `loc-${Date.now()}`,
        locationSiteCode: `LOC-00${state.locationSites.length + 1}`,
        nameEn: data.nameEn || '',
        nameAr: data.nameAr || '',
        branchFk: data.branchFk || 'br-1',
        siteTypeId: data.siteTypeId || 'OFFICE',
        notes: data.notes || '',
        isActive: true,
      };
      return {
        locationSites: [...state.locationSites, newLoc],
        isLocationDrawerOpen: false,
      };
    }),
  deactivateLocationSite: (id) =>
    set((state) => ({
      locationSites: state.locationSites.map((l) => (l.id === id ? { ...l, isActive: false } : l)),
    })),

  // Confirm Handler
  openConfirmDialog: (type, targetId, warning = null) =>
    set({ confirmActionType: type, confirmTargetId: targetId, cascadeWarningMessage: warning, isConfirmDialogOpen: true }),
  closeConfirmDialog: () =>
    set({ isConfirmDialogOpen: false, confirmActionType: null, confirmTargetId: null, cascadeWarningMessage: null }),
  executeConfirmAction: () => {
    const {
      confirmActionType,
      confirmTargetId,
      deactivateLegalEntity,
      deactivateBranch,
      deactivateRegion,
      deactivateDepartment,
      deactivateCostCenter,
      deactivateProfitCenter,
      deactivateLocationSite,
    } = get();
    if (!confirmTargetId) return;

    if (confirmActionType === 'DEACTIVATE_ENTITY') deactivateLegalEntity(confirmTargetId);
    else if (confirmActionType === 'DEACTIVATE_BRANCH') deactivateBranch(confirmTargetId);
    else if (confirmActionType === 'DEACTIVATE_REGION') deactivateRegion(confirmTargetId);
    else if (confirmActionType === 'DEACTIVATE_DEPT') deactivateDepartment(confirmTargetId);
    else if (confirmActionType === 'DEACTIVATE_COST_CENTER') deactivateCostCenter(confirmTargetId);
    else if (confirmActionType === 'DEACTIVATE_PROFIT') deactivateProfitCenter(confirmTargetId);
    else if (confirmActionType === 'DEACTIVATE_LOCATION') deactivateLocationSite(confirmTargetId);

    set({ isConfirmDialogOpen: false, confirmActionType: null, confirmTargetId: null, cascadeWarningMessage: null });
  },
}));
