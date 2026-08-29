import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  departmentsApi,
  type CreateDepartmentRequest,
  type DepartmentResponse,
  type DepartmentSearchContractRequest,
  type DepartmentTreeNodeResponse,
  type UpdateDepartmentRequest,
} from './departmentsApi';
import { useLookupValues } from '../masterLookups/hooks';
import { useBranchesOptions } from '../branches/hooks';
import { usePermission } from '../auth/permissions';
import { DEFAULT_PAGE_SIZE } from '../data/searchContract';

// F2-QUERY blocks API-ORG-019..025, F2-LOV-QUERY LOV-ORG-003 (F2/SCR-ORG-004).
// First TREE-structured (self-referencing hierarchy) screen in this module.

export const departmentKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const,
  details: () => [...departmentKeys.all, 'detail'] as const,
  detail: (id: number) => [...departmentKeys.details(), id] as const,
  // Per F2 spec's declared query key: [ 'departments', 'tree', branchFk ].
  tree: (branchFk: number) => [...departmentKeys.all, 'tree', branchFk] as const,
};

const STALE = 0, GC = 5 * 60_000; // F2-HEADER global caching default for this module

/** API-ORG-025 — enabled only once an id is selected (e.g. EDIT entry mode). */
export function useDepartment(id: number | undefined) {
  return useQuery({
    queryKey: departmentKeys.detail(id!),
    queryFn: ({ signal }) => departmentsApi.getById(id!, signal),
    enabled: id != null,
    staleTime: STALE,
    gcTime: GC,
  });
}

/** API-ORG-021 — POST-as-query, same convention as regions' useSearchRegions. */
export function useSearchDepartments() {
  return useMutation({ mutationFn: (req: DepartmentSearchContractRequest) => departmentsApi.search(req) });
}

/**
 * API-ORG-020 — Department tree for a given branch. branchFk is a mandatory
 * precondition (SRS B2 / F2-SCREEN-INIT #3): the tree is empty/hidden until a
 * branch is selected, so the query stays disabled until then.
 */
export function useDepartmentTree(branchFk: number | null, isActive?: boolean) {
  return useQuery({
    queryKey: departmentKeys.tree(branchFk!),
    queryFn: ({ signal }) => departmentsApi.getTree(branchFk!, isActive, signal),
    enabled: branchFk != null,
    staleTime: STALE,
    gcTime: GC,
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateDepartmentRequest) => departmentsApi.create(req),
    // Both the flat search list AND the tree view must refresh on success.
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: departmentKeys.lists() });
      void qc.invalidateQueries({ queryKey: departmentKeys.all });
    },
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: UpdateDepartmentRequest }) => departmentsApi.update(id, req),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: departmentKeys.lists() });
      void qc.invalidateQueries({ queryKey: departmentKeys.all });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: departmentKeys.detail(dto.id) });
    },
  });
}

/** API-ORG-023 — 409 if dependent records block deactivation (backend-enforced, no client pre-check). */
export function useDeactivateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => departmentsApi.deactivate(id),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: departmentKeys.lists() });
      void qc.invalidateQueries({ queryKey: departmentKeys.all });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: departmentKeys.detail(dto.id) });
    },
  });
}

export function useActivateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => departmentsApi.activate(id),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: departmentKeys.lists() });
      void qc.invalidateQueries({ queryKey: departmentKeys.all });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: departmentKeys.detail(dto.id) });
    },
  });
}

/**
 * LOV-ORG-003 — thin named wrapper around the real generic lookup-consumption
 * endpoint (GET /api/lookups/{lookupCode}, src/masterLookups/hooks.ts'
 * useLookupValues). Reuse rule: ONE hook per LOOKUP_CODE — no duplicate fetch
 * logic. Same discrepancy already found/resolved by SCR-ORG-001/002 (see
 * legalEntities/hooks.ts' useLegalEntityTypeOptions).
 */
export function useDepartmentNodeTypeOptions() {
  return useLookupValues('DEPARTMENT_NODE_TYPE');
}

/** Recursively flattens a department tree into a single-level list — used for the parentDepartmentFk picker. */
function flattenTree(nodes: DepartmentTreeNodeResponse[] | undefined): DepartmentTreeNodeResponse[] {
  if (!nodes) return [];
  return nodes.flatMap((node) => [node, ...flattenTree(node.children)]);
}

/**
 * RULE-ORG-007 — excludes a department and all of its descendants from the
 * parentDepartmentFk picker options, preventing a circular reference when
 * re-parenting (Update) or, defensively, on Create. Given the full flattened
 * tree is derived from `flattenTree`, this walks the same `children` shape
 * directly so a department's own subtree can be skipped without first
 * flattening it (skipping a node also skips recursing into its children,
 * which structurally excludes every descendant too).
 */
export function excludeSelfAndDescendantsFromParentOptions(
  nodes: DepartmentTreeNodeResponse[] | undefined,
  excludeId?: number,
): DepartmentTreeNodeResponse[] {
  if (!nodes) return [];
  return nodes.flatMap((node) => {
    if (node.id === excludeId) return [];
    return [node, ...excludeSelfAndDescendantsFromParentOptions(node.children, excludeId)];
  });
}

export interface DepartmentSearchFilters extends DepartmentSearchContractRequest {
  page: number;
  size: number;
}

const DEFAULT_FILTERS: DepartmentSearchFilters = { filters: [], sorts: [], page: 0, size: DEFAULT_PAGE_SIZE };

/**
 * F2-FACADE-HOOK — SCR-ORG-004. Components call this facade only; it composes
 * useSearchDepartments, useCreateDepartment, useUpdateDepartment,
 * useDeactivateDepartment, useActivateDepartment, useDepartmentTree,
 * useDepartmentNodeTypeOptions, and the cross-entity useBranchesOptions
 * (branches/hooks.ts) for the branchFk picker. No toasts, dialogs, or
 * navigation here — same convention as useBranchesFacade.
 *
 * canEdit (DEPARTMENT_UPDATE) — NOT canDelete — is what actually gates
 * Deactivate/Activate on the real backend (SEC-FE SCR-ORG-004 FINDING-4);
 * canDelete is exposed for completeness but unused for gating in this module.
 *
 * selectedBranchFk/setSelectedBranchFk: local state driving the tree query —
 * not in the F2 spec's STATE list verbatim, but required to implement what
 * F2-SCREEN-INIT #3 already describes ("Tree query fires once a branch is
 * selected").
 *
 * parentDepartmentFkOptions: per F2 spec's cross-entity FK reuse #2, derived
 * client-side from the already-loaded tree for the selected branch (flattened
 * here) rather than a separate query. RULE-ORG-007 (circular-reference
 * prevention) is implemented via excludeSelfAndDescendantsFromParentOptions
 * above, applied here in F3/SCR-ORG-004 — the currently-selected item (if
 * any) and its descendants are excluded from its own parent picker.
 */
export function useDepartmentsFacade() {
  const [searchFilters, setSearchFiltersState] = useState<DepartmentSearchFilters>(DEFAULT_FILTERS);
  const [selectedItem, setSelectedItem] = useState<DepartmentResponse | null>(null);
  const [selectedBranchFk, setSelectedBranchFk] = useState<number | null>(null);
  const { can } = usePermission();
  const canView = can('PERM_DEPARTMENT_VIEW');
  const canCreate = can('PERM_DEPARTMENT_CREATE');
  const canEdit = can('PERM_DEPARTMENT_UPDATE');
  const canDelete = can('PERM_DEPARTMENT_DELETE');

  const search = useSearchDepartments();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deactivateMutation = useDeactivateDepartment();
  const activateMutation = useActivateDepartment();
  const nodeTypeOptions = useDepartmentNodeTypeOptions();
  const branchOptions = useBranchesOptions();
  const tree = useDepartmentTree(selectedBranchFk);

  // DRV: API-ORG-021 is a mutation, not a query (POST-as-query, same as
  // regions' useSearchRegions) — the Facade re-triggers it on mount and
  // whenever searchFilters changes.
  useEffect(() => {
    search.mutate(searchFilters);
  }, [searchFilters]);

  const refetchCurrentPage = () => search.mutate(searchFilters);

  const departmentList = search.data?.content ?? [];
  const totalElements = search.data?.totalElements ?? departmentList.length;
  const departmentTree = tree.data ?? [];
  const parentDepartmentFkOptions = useMemo(
    () => excludeSelfAndDescendantsFromParentOptions(tree.data, selectedItem?.id),
    [tree.data, selectedItem],
  );

  const isLoading = [search, createMutation, updateMutation, deactivateMutation, activateMutation].some(
    (m) => m.isPending,
  ) || nodeTypeOptions.isLoading || branchOptions.isLoading || tree.isLoading || tree.isFetching;

  return {
    departmentList,
    departmentTree,
    selectedItem,
    selectedBranchFk,
    isLoading,
    isListLoading: search.isPending,
    isTreeLoading: tree.isLoading,
    loadError: search.isError ? search.error : null,
    searchFilters,
    nodeTypeIdOptions: nodeTypeOptions.data ?? [],
    branchFkOptions: branchOptions.data ?? [],
    parentDepartmentFkOptions,
    page: searchFilters.page,
    size: searchFilters.size,
    totalElements,
    canView,
    canCreate,
    canEdit,
    canDelete,

    selectItem: (item: DepartmentResponse | null) => setSelectedItem(item),
    setSelectedBranchFk: (branchFk: number | null) => setSelectedBranchFk(branchFk),
    setSearchFilters: (next: Partial<DepartmentSearchFilters>) =>
      setSearchFiltersState((prev) => ({ ...prev, ...next })),
    retry: refetchCurrentPage,

    createDepartment: async (data: CreateDepartmentRequest) => {
      const dto = await createMutation.mutateAsync(data);
      refetchCurrentPage();
      return dto;
    },
    updateDepartment: async (id: number, data: UpdateDepartmentRequest) => {
      const dto = await updateMutation.mutateAsync({ id, req: data });
      refetchCurrentPage();
      return dto;
    },
    deactivateDepartment: async (id: number) => {
      const dto = await deactivateMutation.mutateAsync(id);
      refetchCurrentPage();
      return dto;
    },
    activateDepartment: async (id: number) => {
      const dto = await activateMutation.mutateAsync(id);
      refetchCurrentPage();
      return dto;
    },
  };
}
