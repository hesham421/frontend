import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  costCentersApi,
  type CreateCostCenterRequest,
  type CostCenterResponse,
  type CostCenterSearchContractRequest,
  type CostCenterTreeNodeResponse,
  type UpdateCostCenterRequest,
} from './costCentersApi';
import { useLookupValues } from '../masterLookups/hooks';
import { useBranchesOptions } from '../branches/hooks';
import { usePermission } from '../auth/permissions';
import { DEFAULT_PAGE_SIZE } from '../data/searchContract';

// F2-QUERY blocks API-ORG-026..032, F2-LOV-QUERY LOV-ORG-004/005 (F2/SCR-ORG-005).
// Structurally almost identical to Departments (SCR-ORG-004) — same
// TREE_MASTER_DETAIL pattern, plus one extra field (costCenterTypeId) and its
// own LOV.

export const costCenterKeys = {
  all: ['cost-centers'] as const,
  lists: () => [...costCenterKeys.all, 'list'] as const,
  details: () => [...costCenterKeys.all, 'detail'] as const,
  detail: (id: number) => [...costCenterKeys.details(), id] as const,
  // Per F2 spec's declared query key: [ 'cost-centers', 'tree', branchFk ].
  tree: (branchFk: number) => [...costCenterKeys.all, 'tree', branchFk] as const,
};

const STALE = 0, GC = 5 * 60_000; // F2-HEADER global caching default for this module

/** API-ORG-032 — enabled only once an id is selected (e.g. EDIT entry mode). */
export function useCostCenter(id: number | undefined) {
  return useQuery({
    queryKey: costCenterKeys.detail(id!),
    queryFn: ({ signal }) => costCentersApi.getById(id!, signal),
    enabled: id != null,
    staleTime: STALE,
    gcTime: GC,
  });
}

/** API-ORG-028 — POST-as-query, same convention as departments' useSearchDepartments. */
export function useSearchCostCenters() {
  return useMutation({ mutationFn: (req: CostCenterSearchContractRequest) => costCentersApi.search(req) });
}

/**
 * API-ORG-027 — Cost Center tree for a given branch. branchFk is a mandatory
 * precondition (SRS B2 / F2-SCREEN-INIT #3): the tree is empty/hidden until a
 * branch is selected, so the query stays disabled until then.
 */
export function useCostCenterTree(branchFk: number | null, isActive?: boolean) {
  return useQuery({
    queryKey: costCenterKeys.tree(branchFk!),
    queryFn: ({ signal }) => costCentersApi.getTree(branchFk!, isActive, signal),
    enabled: branchFk != null,
    staleTime: STALE,
    gcTime: GC,
  });
}

export function useCreateCostCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateCostCenterRequest) => costCentersApi.create(req),
    // Both the flat search list AND the tree view must refresh on success.
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: costCenterKeys.lists() });
      void qc.invalidateQueries({ queryKey: costCenterKeys.all });
    },
  });
}

export function useUpdateCostCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: UpdateCostCenterRequest }) => costCentersApi.update(id, req),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: costCenterKeys.lists() });
      void qc.invalidateQueries({ queryKey: costCenterKeys.all });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: costCenterKeys.detail(dto.id) });
    },
  });
}

/** API-ORG-030 — 409 if dependent records block deactivation (backend-enforced, no client pre-check). */
export function useDeactivateCostCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => costCentersApi.deactivate(id),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: costCenterKeys.lists() });
      void qc.invalidateQueries({ queryKey: costCenterKeys.all });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: costCenterKeys.detail(dto.id) });
    },
  });
}

export function useActivateCostCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => costCentersApi.activate(id),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: costCenterKeys.lists() });
      void qc.invalidateQueries({ queryKey: costCenterKeys.all });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: costCenterKeys.detail(dto.id) });
    },
  });
}

/**
 * LOV-ORG-004 — thin named wrapper around the real generic lookup-consumption
 * endpoint (GET /api/lookups/{lookupCode}, src/masterLookups/hooks.ts'
 * useLookupValues). Reuse rule: ONE hook per LOOKUP_CODE — no duplicate fetch
 * logic.
 */
export function useCostCenterNodeTypeOptions() {
  return useLookupValues('COST_CENTER_NODE_TYPE');
}

/** LOV-ORG-005 — same convention as useCostCenterNodeTypeOptions above. */
export function useCostCenterTypeOptions() {
  return useLookupValues('COST_CENTER_TYPE');
}

/** Recursively flattens a cost center tree into a single-level list — used for the parentCostCenterFk picker. */
function flattenTree(nodes: CostCenterTreeNodeResponse[] | undefined): CostCenterTreeNodeResponse[] {
  if (!nodes) return [];
  return nodes.flatMap((node) => [node, ...flattenTree(node.children)]);
}

/**
 * RULE-ORG-008 — excludes a cost center and all of its descendants from the
 * parentCostCenterFk picker options, preventing a circular reference when
 * re-parenting (Update) or, defensively, on Create. Given the full flattened
 * tree is derived from `flattenTree`, this walks the same `children` shape
 * directly so a cost center's own subtree can be skipped without first
 * flattening it (skipping a node also skips recursing into its children,
 * which structurally excludes every descendant too).
 */
export function excludeSelfAndDescendantsFromParentOptions(
  nodes: CostCenterTreeNodeResponse[] | undefined,
  excludeId?: number,
): CostCenterTreeNodeResponse[] {
  if (!nodes) return [];
  return nodes.flatMap((node) => {
    if (node.id === excludeId) return [];
    return [node, ...excludeSelfAndDescendantsFromParentOptions(node.children, excludeId)];
  });
}

export interface CostCenterSearchFilters extends CostCenterSearchContractRequest {
  page: number;
  size: number;
}

const DEFAULT_FILTERS: CostCenterSearchFilters = { filters: [], sorts: [], page: 0, size: DEFAULT_PAGE_SIZE };

/**
 * F2-FACADE-HOOK — SCR-ORG-005. Components call this facade only; it composes
 * useSearchCostCenters, useCreateCostCenter, useUpdateCostCenter,
 * useDeactivateCostCenter, useActivateCostCenter, useCostCenterTree,
 * useCostCenterNodeTypeOptions, useCostCenterTypeOptions, and the
 * cross-entity useBranchesOptions (branches/hooks.ts) for the branchFk
 * picker. No toasts, dialogs, or navigation here — same convention as
 * useDepartmentsFacade.
 *
 * canEdit (COST_CENTER_UPDATE) — NOT canDelete — is what actually gates
 * Deactivate/Activate on the real backend (SEC-FE SCR-ORG-005 FINDING-4);
 * canDelete is exposed for completeness but unused for gating in this module.
 *
 * selectedBranchFk/setSelectedBranchFk: local state driving the tree query —
 * not in the F2 spec's STATE list verbatim, but required to implement what
 * F2-SCREEN-INIT #3 already describes ("Tree query fires once a branch is
 * selected").
 *
 * parentCostCenterFkOptions: per F2 spec's cross-entity FK reuse #2, derived
 * client-side from the already-loaded tree for the selected branch (flattened
 * here) rather than a separate query. RULE-ORG-008 (circular-reference
 * prevention) is implemented via excludeSelfAndDescendantsFromParentOptions
 * above, applied here in F3/SCR-ORG-005 — the currently-selected item (if
 * any) and its descendants are excluded from its own parent picker.
 */
export function useCostCentersFacade() {
  const [searchFilters, setSearchFiltersState] = useState<CostCenterSearchFilters>(DEFAULT_FILTERS);
  const [selectedItem, setSelectedItem] = useState<CostCenterResponse | null>(null);
  const [selectedBranchFk, setSelectedBranchFk] = useState<number | null>(null);
  const { can } = usePermission();
  const canView = can('PERM_COST_CENTER_VIEW');
  const canCreate = can('PERM_COST_CENTER_CREATE');
  const canEdit = can('PERM_COST_CENTER_UPDATE');
  const canDelete = can('PERM_COST_CENTER_DELETE');

  const search = useSearchCostCenters();
  const createMutation = useCreateCostCenter();
  const updateMutation = useUpdateCostCenter();
  const deactivateMutation = useDeactivateCostCenter();
  const activateMutation = useActivateCostCenter();
  const nodeTypeOptions = useCostCenterNodeTypeOptions();
  const costCenterTypeOptions = useCostCenterTypeOptions();
  const branchOptions = useBranchesOptions();
  const tree = useCostCenterTree(selectedBranchFk);

  // DRV: API-ORG-028 is a mutation, not a query (POST-as-query, same as
  // departments' useSearchDepartments) — the Facade re-triggers it on mount
  // and whenever searchFilters changes.
  useEffect(() => {
    search.mutate(searchFilters);
  }, [searchFilters]);

  const refetchCurrentPage = () => search.mutate(searchFilters);

  const costCenterList = search.data?.content ?? [];
  const totalElements = search.data?.totalElements ?? costCenterList.length;
  const costcenterTree = tree.data ?? [];
  const parentCostCenterFkOptions = useMemo(
    () => excludeSelfAndDescendantsFromParentOptions(tree.data, selectedItem?.id),
    [tree.data, selectedItem],
  );

  const isLoading = [search, createMutation, updateMutation, deactivateMutation, activateMutation].some(
    (m) => m.isPending,
  ) || nodeTypeOptions.isLoading || costCenterTypeOptions.isLoading || branchOptions.isLoading || tree.isLoading || tree.isFetching;

  return {
    costCenterList,
    costcenterTree,
    selectedItem,
    selectedBranchFk,
    isLoading,
    isListLoading: search.isPending,
    isTreeLoading: tree.isLoading,
    loadError: search.isError ? search.error : null,
    searchFilters,
    nodeTypeIdOptions: nodeTypeOptions.data ?? [],
    costCenterTypeIdOptions: costCenterTypeOptions.data ?? [],
    branchFkOptions: branchOptions.data ?? [],
    parentCostCenterFkOptions,
    page: searchFilters.page,
    size: searchFilters.size,
    totalElements,
    canView,
    canCreate,
    canEdit,
    canDelete,

    selectItem: (item: CostCenterResponse | null) => setSelectedItem(item),
    setSelectedBranchFk: (branchFk: number | null) => setSelectedBranchFk(branchFk),
    setSearchFilters: (next: Partial<CostCenterSearchFilters>) =>
      setSearchFiltersState((prev) => ({ ...prev, ...next })),
    retry: refetchCurrentPage,

    createCostCenter: async (data: CreateCostCenterRequest) => {
      const dto = await createMutation.mutateAsync(data);
      refetchCurrentPage();
      return dto;
    },
    updateCostCenter: async (id: number, data: UpdateCostCenterRequest) => {
      const dto = await updateMutation.mutateAsync({ id, req: data });
      refetchCurrentPage();
      return dto;
    },
    deactivateCostCenter: async (id: number) => {
      const dto = await deactivateMutation.mutateAsync(id);
      refetchCurrentPage();
      return dto;
    },
    activateCostCenter: async (id: number) => {
      const dto = await activateMutation.mutateAsync(id);
      refetchCurrentPage();
      return dto;
    },
  };
}
