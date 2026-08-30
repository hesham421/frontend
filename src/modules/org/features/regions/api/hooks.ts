import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  regionsApi,
  type CreateRegionRequest,
  type RegionResponse,
  type RegionSearchContractRequest,
  type UpdateRegionRequest,
} from './regionsApi';
import { useLegalEntitiesOptions } from '../../legalEntities';
import { usePermission } from '@/modules/security';
import { DEFAULT_PAGE_SIZE } from '@/data/searchContract';

// F2-QUERY blocks API-ORG-013..018 (F2/SCR-ORG-003). regionTypeIdFk's picker
// (previously FINDING-2/OQ-ORG-002, DEFERRED) is now backed by
// useRegionTypeOptions below, once GET /api/v1/org/regions/region-types was
// added to expose the already-seeded ORG_REGION_TYPE table.

export const regionKeys = {
  all: ['regions'] as const,
  lists: () => [...regionKeys.all, 'list'] as const,
  details: () => [...regionKeys.all, 'detail'] as const,
  detail: (id: number) => [...regionKeys.details(), id] as const,
};

const STALE = 0, GC = 5 * 60_000; // F2-HEADER global caching default for this module

/** API-ORG-018 — enabled only once an id is selected (e.g. EDIT entry mode). */
export function useRegion(id: number | undefined) {
  return useQuery({
    queryKey: regionKeys.detail(id!),
    queryFn: ({ signal }) => regionsApi.getById(id!, signal),
    enabled: id != null,
    staleTime: STALE,
    gcTime: GC,
  });
}

/** API-ORG-014 — POST-as-query, same convention as branches' useSearchBranches. */
export function useSearchRegions() {
  return useMutation({ mutationFn: (req: RegionSearchContractRequest) => regionsApi.search(req) });
}

export function useCreateRegion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateRegionRequest) => regionsApi.create(req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: regionKeys.lists() });
    },
  });
}

export function useUpdateRegion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: UpdateRegionRequest }) => regionsApi.update(id, req),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: regionKeys.lists() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: regionKeys.detail(dto.id) });
    },
  });
}

/** API-ORG-016 — 409 if dependent records block deactivation (RULE-ORG-006/017, backend-enforced, no client pre-check). */
export function useDeactivateRegion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => regionsApi.deactivate(id),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: regionKeys.lists() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: regionKeys.detail(dto.id) });
    },
  });
}

export function useActivateRegion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => regionsApi.activate(id),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: regionKeys.lists() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: regionKeys.detail(dto.id) });
    },
  });
}

/** Backs the create/edit form's Region Type picker — see GET /region-types added to regionsApi. */
export function useRegionTypeOptions() {
  return useQuery({
    queryKey: [...regionKeys.all, 'types'] as const,
    queryFn: ({ signal }) => regionsApi.getRegionTypes(signal),
    staleTime: STALE,
    gcTime: GC,
  });
}

export interface RegionSearchFilters extends RegionSearchContractRequest {
  page: number;
  size: number;
}

const DEFAULT_FILTERS: RegionSearchFilters = { filters: [], sorts: [], page: 0, size: DEFAULT_PAGE_SIZE };

/**
 * F2-FACADE-HOOK — SCR-ORG-003. Components call this facade only; it composes
 * useSearchRegions, useCreateRegion, useUpdateRegion, useDeactivateRegion,
 * useActivateRegion, useRegionTypeOptions, and the cross-entity
 * useLegalEntitiesOptions (legalEntities/hooks.ts) for the legalEntityFk
 * picker. No toasts, dialogs, or navigation here — same convention as
 * useBranchesFacade (src/branches/hooks.ts).
 *
 * canEdit (REGION_UPDATE) — NOT canDelete — is what actually gates
 * Deactivate/Activate on the real backend (SEC-FE SCR-ORG-003 FINDING-4);
 * canDelete is exposed for completeness but unused for gating in this module.
 */
export function useRegionsFacade() {
  const [searchFilters, setSearchFiltersState] = useState<RegionSearchFilters>(DEFAULT_FILTERS);
  const [selectedItem, setSelectedItem] = useState<RegionResponse | null>(null);
  const { can } = usePermission();
  const canView = can('PERM_REGION_VIEW');
  const canCreate = can('PERM_REGION_CREATE');
  const canEdit = can('PERM_REGION_UPDATE');
  const canDelete = can('PERM_REGION_DELETE');

  const search = useSearchRegions();
  const createMutation = useCreateRegion();
  const updateMutation = useUpdateRegion();
  const deactivateMutation = useDeactivateRegion();
  const activateMutation = useActivateRegion();
  const legalEntityOptions = useLegalEntitiesOptions();
  const regionTypeOptions = useRegionTypeOptions();

  // DRV: API-ORG-014 is a mutation, not a query (POST-as-query, same as
  // branches' useSearchBranches) — the Facade re-triggers it on mount and
  // whenever searchFilters changes.
  useEffect(() => {
    search.mutate(searchFilters);
  }, [searchFilters]);

  const refetchCurrentPage = () => search.mutate(searchFilters);

  const regionList = search.data?.content ?? [];
  const totalElements = search.data?.totalElements ?? regionList.length;

  const isLoading = [search, createMutation, updateMutation, deactivateMutation, activateMutation].some(
    (m) => m.isPending,
  ) || legalEntityOptions.isLoading || regionTypeOptions.isLoading;

  return {
    regionList,
    selectedItem,
    isLoading,
    isListLoading: search.isPending,
    loadError: search.isError ? search.error : null,
    searchFilters,
    legalEntityFkOptions: legalEntityOptions.data ?? [],
    regionTypeIdOptions: regionTypeOptions.data ?? [],
    page: searchFilters.page,
    size: searchFilters.size,
    totalElements,
    canView,
    canCreate,
    canEdit,
    canDelete,

    selectItem: (item: RegionResponse | null) => setSelectedItem(item),
    setSearchFilters: (next: Partial<RegionSearchFilters>) =>
      setSearchFiltersState((prev) => ({ ...prev, ...next })),
    retry: refetchCurrentPage,

    createRegion: async (data: CreateRegionRequest) => {
      const dto = await createMutation.mutateAsync(data);
      refetchCurrentPage();
      return dto;
    },
    updateRegion: async (id: number, data: UpdateRegionRequest) => {
      const dto = await updateMutation.mutateAsync({ id, req: data });
      refetchCurrentPage();
      return dto;
    },
    deactivateRegion: async (id: number) => {
      const dto = await deactivateMutation.mutateAsync(id);
      refetchCurrentPage();
      return dto;
    },
    activateRegion: async (id: number) => {
      const dto = await activateMutation.mutateAsync(id);
      refetchCurrentPage();
      return dto;
    },
  };
}
