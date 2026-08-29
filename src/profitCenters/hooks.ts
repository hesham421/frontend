import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  profitCentersApi,
  type CreateProfitCenterRequest,
  type ProfitCenterResponse,
  type ProfitCenterSearchContractRequest,
  type UpdateProfitCenterRequest,
} from './profitCentersApi';
import { useLegalEntitiesOptions } from '../legalEntities/hooks';
import { usePermission } from '../auth/permissions';
import { DEFAULT_PAGE_SIZE } from '../data/searchContract';

// F2-QUERY blocks API-ORG-033..038 (F2/SCR-ORG-006).

export const profitCenterKeys = {
  all: ['profit-centers'] as const,
  lists: () => [...profitCenterKeys.all, 'list'] as const,
  details: () => [...profitCenterKeys.all, 'detail'] as const,
  detail: (id: number) => [...profitCenterKeys.details(), id] as const,
};

const STALE = 0, GC = 5 * 60_000; // F2-HEADER global caching default for this module

/** API-ORG-038 — enabled only once an id is selected (e.g. EDIT entry mode). */
export function useProfitCenter(id: number | undefined) {
  return useQuery({
    queryKey: profitCenterKeys.detail(id!),
    queryFn: ({ signal }) => profitCentersApi.getById(id!, signal),
    enabled: id != null,
    staleTime: STALE,
    gcTime: GC,
  });
}

/** API-ORG-034 — POST-as-query, same convention as legal entities' useSearchLegalEntities. */
export function useSearchProfitCenters() {
  return useMutation({ mutationFn: (req: ProfitCenterSearchContractRequest) => profitCentersApi.search(req) });
}

export function useCreateProfitCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateProfitCenterRequest) => profitCentersApi.create(req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: profitCenterKeys.lists() });
    },
  });
}

export function useUpdateProfitCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: UpdateProfitCenterRequest }) => profitCentersApi.update(id, req),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: profitCenterKeys.lists() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: profitCenterKeys.detail(dto.id) });
    },
  });
}

/** API-ORG-036 — 409 if dependent records block deactivation (backend-enforced, no client pre-check). */
export function useDeactivateProfitCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => profitCentersApi.deactivate(id),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: profitCenterKeys.lists() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: profitCenterKeys.detail(dto.id) });
    },
  });
}

export function useActivateProfitCenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => profitCentersApi.activate(id),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: profitCenterKeys.lists() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: profitCenterKeys.detail(dto.id) });
    },
  });
}

export interface ProfitCenterSearchFilters extends ProfitCenterSearchContractRequest {
  page: number;
  size: number;
}

const DEFAULT_FILTERS: ProfitCenterSearchFilters = { filters: [], sorts: [], page: 0, size: DEFAULT_PAGE_SIZE };

/**
 * F2-FACADE-HOOK — SCR-ORG-006. Components call this facade only; it composes
 * useSearchProfitCenters, useCreateProfitCenter, useUpdateProfitCenter,
 * useDeactivateProfitCenter, useActivateProfitCenter, and the cross-entity
 * useLegalEntitiesOptions (legalEntities/hooks.ts) for the legalEntityFk
 * picker. No LOV/lookup owned by this screen (F2-LOV-QUERY — none). No
 * toasts, dialogs, or navigation here — same convention as
 * useBranchesFacade (src/branches/hooks.ts).
 *
 * canEdit (PROFIT_CENTER_UPDATE) — NOT canDelete — is what actually gates
 * Deactivate/Activate on the real backend (SEC-FE SCR-ORG-006 FINDING-4);
 * canDelete is exposed for completeness but unused for gating in this module.
 */
export function useProfitCentersFacade() {
  const [searchFilters, setSearchFiltersState] = useState<ProfitCenterSearchFilters>(DEFAULT_FILTERS);
  const [selectedItem, setSelectedItem] = useState<ProfitCenterResponse | null>(null);
  const { can } = usePermission();
  const canView = can('PERM_PROFIT_CENTER_VIEW');
  const canCreate = can('PERM_PROFIT_CENTER_CREATE');
  const canEdit = can('PERM_PROFIT_CENTER_UPDATE');
  const canDelete = can('PERM_PROFIT_CENTER_DELETE');

  const search = useSearchProfitCenters();
  const createMutation = useCreateProfitCenter();
  const updateMutation = useUpdateProfitCenter();
  const deactivateMutation = useDeactivateProfitCenter();
  const activateMutation = useActivateProfitCenter();
  const legalEntityOptions = useLegalEntitiesOptions();

  // DRV: API-ORG-034 is a mutation, not a query (POST-as-query, same as
  // legal entities' useSearchLegalEntities) — the Facade re-triggers it on
  // mount and whenever searchFilters changes.
  useEffect(() => {
    search.mutate(searchFilters);
  }, [searchFilters]);

  const refetchCurrentPage = () => search.mutate(searchFilters);

  const profitCenterList = search.data?.content ?? [];
  const totalElements = search.data?.totalElements ?? profitCenterList.length;

  const isLoading = [search, createMutation, updateMutation, deactivateMutation, activateMutation].some(
    (m) => m.isPending,
  ) || legalEntityOptions.isLoading;

  return {
    profitCenterList,
    selectedItem,
    isLoading,
    isListLoading: search.isPending,
    loadError: search.isError ? search.error : null,
    searchFilters,
    legalEntityFkOptions: legalEntityOptions.data ?? [],
    page: searchFilters.page,
    size: searchFilters.size,
    totalElements,
    canView,
    canCreate,
    canEdit,
    canDelete,

    selectItem: (item: ProfitCenterResponse | null) => setSelectedItem(item),
    setSearchFilters: (next: Partial<ProfitCenterSearchFilters>) =>
      setSearchFiltersState((prev) => ({ ...prev, ...next })),
    retry: refetchCurrentPage,

    createProfitCenter: async (data: CreateProfitCenterRequest) => {
      const dto = await createMutation.mutateAsync(data);
      refetchCurrentPage();
      return dto;
    },
    updateProfitCenter: async (id: number, data: UpdateProfitCenterRequest) => {
      const dto = await updateMutation.mutateAsync({ id, req: data });
      refetchCurrentPage();
      return dto;
    },
    deactivateProfitCenter: async (id: number) => {
      const dto = await deactivateMutation.mutateAsync(id);
      refetchCurrentPage();
      return dto;
    },
    activateProfitCenter: async (id: number) => {
      const dto = await activateMutation.mutateAsync(id);
      refetchCurrentPage();
      return dto;
    },
  };
}
