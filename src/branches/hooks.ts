import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  branchesApi,
  type BranchResponse,
  type BranchSearchContractRequest,
  type CreateBranchRequest,
  type UpdateBranchRequest,
} from './branchesApi';
import { useLookupValues } from '../masterLookups/hooks';
import { useLegalEntitiesOptions } from '../legalEntities/hooks';
import { usePermission } from '../auth/permissions';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../data/searchContract';

// F2-QUERY blocks API-ORG-007..012, F2-LOV-QUERY LOV-ORG-002 (F2/SCR-ORG-002).

export const branchKeys = {
  all: ['branches'] as const,
  lists: () => [...branchKeys.all, 'list'] as const,
  details: () => [...branchKeys.all, 'detail'] as const,
  detail: (id: number) => [...branchKeys.details(), id] as const,
};

const STALE = 0, GC = 5 * 60_000; // F2-HEADER global caching default for this module

/** API-ORG-012 — enabled only once an id is selected (e.g. EDIT entry mode). */
export function useBranch(id: number | undefined) {
  return useQuery({
    queryKey: branchKeys.detail(id!),
    queryFn: ({ signal }) => branchesApi.getById(id!, signal),
    enabled: id != null,
    staleTime: STALE,
    gcTime: GC,
  });
}

/** API-ORG-008 — POST-as-query, same convention as legal entities' useSearchLegalEntities. */
export function useSearchBranches() {
  return useMutation({ mutationFn: (req: BranchSearchContractRequest) => branchesApi.search(req) });
}

/**
 * Read-only, active-only Branches list for cross-screen FK pickers — e.g.
 * SCR-ORG-004's (Departments) branchFk picker (F2/SCR-ORG-004's
 * "Cross-entity FK reuse" note: reuses API-ORG-008's query hook, filtered to
 * Branch, isActive=true). Same convention as legalEntities' own
 * useLegalEntitiesOptions (src/legalEntities/hooks.ts): sorted by name,
 * capped at MAX_PAGE_SIZE (the backend's hard search-size limit — see
 * searchContract.ts). Added here, not duplicated in departments/hooks.ts,
 * because it reads Branches — same file as the entity it belongs to.
 */
export function useBranchesOptions() {
  return useQuery({
    queryKey: [...branchKeys.lists(), 'options'] as const,
    queryFn: ({ signal }) =>
      branchesApi.search(
        {
          filters: [{ field: 'isActive', operator: 'EQ', value: true }],
          sorts: [{ field: 'nameEn', direction: 'ASC' }],
          page: 0,
          size: MAX_PAGE_SIZE,
        },
        signal,
      ),
    staleTime: STALE,
    gcTime: GC,
    select: (page) => page.content,
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateBranchRequest) => branchesApi.create(req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: branchKeys.lists() });
    },
  });
}

export function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: UpdateBranchRequest }) => branchesApi.update(id, req),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: branchKeys.lists() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: branchKeys.detail(dto.id) });
    },
  });
}

/** API-ORG-010 — 409 if dependent records block deactivation (RULE-ORG-003/004/005, backend-enforced, no client pre-check). */
export function useDeactivateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => branchesApi.deactivate(id),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: branchKeys.lists() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: branchKeys.detail(dto.id) });
    },
  });
}

export function useActivateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => branchesApi.activate(id),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: branchKeys.lists() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: branchKeys.detail(dto.id) });
    },
  });
}

/**
 * LOV-ORG-002 — thin named wrapper around the real generic lookup-consumption
 * endpoint (GET /api/lookups/{lookupCode}, src/masterLookups/hooks.ts'
 * useLookupValues). Reuse rule: ONE hook per LOOKUP_CODE — no duplicate fetch
 * logic. Note: the real endpoint is GET /api/lookups/{lookupCode} with no
 * `?active=true` query param and no /v1 segment — differs from the F2 spec's
 * guessed path/shape, same discrepancy SCR-ORG-001 already found and resolved
 * (see legalEntities/hooks.ts' useLegalEntityTypeOptions).
 */
export function useBranchTypeOptions() {
  return useLookupValues('BRANCH_TYPE');
}

export interface BranchSearchFilters extends BranchSearchContractRequest {
  page: number;
  size: number;
}

const DEFAULT_FILTERS: BranchSearchFilters = { filters: [], sorts: [], page: 0, size: DEFAULT_PAGE_SIZE };

/**
 * F2-FACADE-HOOK — SCR-ORG-002. Components call this facade only; it composes
 * useSearchBranches, useCreateBranch, useUpdateBranch, useDeactivateBranch,
 * useActivateBranch, useBranchTypeOptions, and the cross-entity
 * useLegalEntitiesOptions (legalEntities/hooks.ts) for the legalEntityFk
 * picker. No toasts, dialogs, or navigation here — same convention as
 * useLegalEntitiesFacade (src/legalEntities/hooks.ts).
 *
 * canEdit (BRANCH_UPDATE) — NOT canDelete — is what actually gates
 * Deactivate/Activate on the real backend (SEC-FE SCR-ORG-002 FINDING-4);
 * canDelete is exposed for completeness but unused for gating in this module.
 */
export function useBranchesFacade() {
  const [searchFilters, setSearchFiltersState] = useState<BranchSearchFilters>(DEFAULT_FILTERS);
  const [selectedItem, setSelectedItem] = useState<BranchResponse | null>(null);
  const { can } = usePermission();
  const canView = can('PERM_BRANCH_VIEW');
  const canCreate = can('PERM_BRANCH_CREATE');
  const canEdit = can('PERM_BRANCH_UPDATE');
  const canDelete = can('PERM_BRANCH_DELETE');

  const search = useSearchBranches();
  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();
  const deactivateMutation = useDeactivateBranch();
  const activateMutation = useActivateBranch();
  const branchTypeOptions = useBranchTypeOptions();
  const legalEntityOptions = useLegalEntitiesOptions();

  // DRV: API-ORG-008 is a mutation, not a query (POST-as-query, same as
  // legal entities' useSearchLegalEntities) — the Facade re-triggers it on
  // mount and whenever searchFilters changes.
  useEffect(() => {
    search.mutate(searchFilters);
  }, [searchFilters]);

  const refetchCurrentPage = () => search.mutate(searchFilters);

  const branchList = search.data?.content ?? [];
  const totalElements = search.data?.totalElements ?? branchList.length;

  const isLoading = [search, createMutation, updateMutation, deactivateMutation, activateMutation].some(
    (m) => m.isPending,
  ) || branchTypeOptions.isLoading || legalEntityOptions.isLoading;

  return {
    branchList,
    selectedItem,
    isLoading,
    isListLoading: search.isPending,
    loadError: search.isError ? search.error : null,
    searchFilters,
    branchTypeIdOptions: branchTypeOptions.data ?? [],
    legalEntityFkOptions: legalEntityOptions.data ?? [],
    page: searchFilters.page,
    size: searchFilters.size,
    totalElements,
    canView,
    canCreate,
    canEdit,
    canDelete,

    selectItem: (item: BranchResponse | null) => setSelectedItem(item),
    setSearchFilters: (next: Partial<BranchSearchFilters>) =>
      setSearchFiltersState((prev) => ({ ...prev, ...next })),
    retry: refetchCurrentPage,

    createBranch: async (data: CreateBranchRequest) => {
      const dto = await createMutation.mutateAsync(data);
      refetchCurrentPage();
      return dto;
    },
    updateBranch: async (id: number, data: UpdateBranchRequest) => {
      const dto = await updateMutation.mutateAsync({ id, req: data });
      refetchCurrentPage();
      return dto;
    },
    deactivateBranch: async (id: number) => {
      const dto = await deactivateMutation.mutateAsync(id);
      refetchCurrentPage();
      return dto;
    },
    activateBranch: async (id: number) => {
      const dto = await activateMutation.mutateAsync(id);
      refetchCurrentPage();
      return dto;
    },
  };
}
