// Module Namespaces
export * as authFeature from './auth';
export * as usersFeature from './users';
export * as userProfilesFeature from './userProfiles';
export * as rolesFeature from './roles';
export * as roleDataScopeFeature from './roleDataScope';
export * as permissionsFeature from './permissions';
export * as pageRegistryFeature from './pageRegistry';
export * as legalEntitiesFeature from './legalEntities';
export * as branchesFeature from './branches';
export * as regionsFeature from './regions';
export * as departmentsFeature from './departments';
export * as costCentersFeature from './costCenters';
export * as profitCentersFeature from './profitCenters';
export * as locationSitesFeature from './locationSites';
export * as masterLookupsFeature from './masterLookups';
export * as notificationsFeature from './notifications';
export * as dashboardFeature from './dashboard';
export * as attachmentsFeature from './attachments';
export * as unauthorizedFeature from './unauthorized';

// Direct Feature Exports
export * from './auth';
export * from './users';
export * from './userProfiles';
export * from './roles';
export * from './roleDataScope';
export * from './permissions';
export * from './pageRegistry';
export * from './legalEntities';
export * from './branches';
export * from './regions';

// Departments
export {
  departmentsApi,
  departmentKeys,
  useDepartment,
  useSearchDepartments,
  useDepartmentTree,
  useCreateDepartment,
  useUpdateDepartment,
  useDeactivateDepartment,
  useActivateDepartment,
  useDepartmentNodeTypeOptions,
  useDepartmentsFacade,
  excludeSelfAndDescendantsFromParentOptions as excludeSelfAndDescendantsFromDepartmentParentOptions,
  DepartmentsPage,
  createDepartmentSchema,
  updateDepartmentSchema,
} from './departments';
export type {
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentResponse,
  DepartmentTreeNodeResponse,
  DepartmentSearchContractRequest,
  CreateDepartmentFormValues,
  UpdateDepartmentFormValues,
} from './departments';

// Cost Centers
export {
  costCentersApi,
  costCenterKeys,
  useCostCenter,
  useSearchCostCenters,
  useCostCenterTree,
  useCreateCostCenter,
  useUpdateCostCenter,
  useDeactivateCostCenter,
  useActivateCostCenter,
  useCostCenterNodeTypeOptions,
  useCostCenterTypeOptions,
  useCostCentersFacade,
  excludeSelfAndDescendantsFromParentOptions as excludeSelfAndDescendantsFromCostCenterParentOptions,
  CostCentersPage,
  createCostCenterSchema,
  updateCostCenterSchema,
} from './costCenters';
export type {
  CreateCostCenterRequest,
  UpdateCostCenterRequest,
  CostCenterResponse,
  CostCenterTreeNodeResponse,
  CostCenterSearchContractRequest,
  CreateCostCenterFormValues,
  UpdateCostCenterFormValues,
} from './costCenters';

export * from './profitCenters';
export * from './locationSites';
export * from './masterLookups';
export * from './notifications';
export * from './dashboard';
export * from './attachments';
export * from './unauthorized';
