import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  locationSitesApi,
  type LocationSiteResponse,
  type LocationSiteSearchContractRequest,
  type CreateLocationSiteRequest,
  type UpdateLocationSiteRequest,
} from './locationSitesApi';
import { useLookupValues } from '@/modules/masterdata';
import { useBranchesOptions } from '../../branches';
import { usePermission } from '@/modules/security';
import { DEFAULT_PAGE_SIZE } from '@/data/searchContract';

// F2-QUERY blocks API-ORG-039..044, F2-LOV-QUERY LOV-ORG-006 (F2/SCR-ORG-007).

export const locationSiteKeys = {
  all: ['location-sites'] as const,
  lists: () => [...locationSiteKeys.all, 'list'] as const,
  details: () => [...locationSiteKeys.all, 'detail'] as const,
  detail: (id: number) => [...locationSiteKeys.details(), id] as const,
};

const STALE = 0, GC = 5 * 60_000; // F2-HEADER global caching default for this module

/** API-ORG-044 — enabled only once an id is selected (e.g. EDIT entry mode). */
export function useLocationSite(id: number | undefined) {
  return useQuery({
    queryKey: locationSiteKeys.detail(id!),
    queryFn: ({ signal }) => locationSitesApi.getById(id!, signal),
    enabled: id != null,
    staleTime: STALE,
    gcTime: GC,
  });
}

/** API-ORG-040 — POST-as-query, same convention as branches' useSearchBranches. */
export function useSearchLocationSites() {
  return useMutation({ mutationFn: (req: LocationSiteSearchContractRequest) => locationSitesApi.search(req) });
}

export function useCreateLocationSite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateLocationSiteRequest) => locationSitesApi.create(req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: locationSiteKeys.lists() });
    },
  });
}

export function useUpdateLocationSite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: UpdateLocationSiteRequest }) => locationSitesApi.update(id, req),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: locationSiteKeys.lists() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: locationSiteKeys.detail(dto.id) });
    },
  });
}

/** API-ORG-042 — no RULE-ID declared against LocationSite deactivation (F2-FACADE-HOOK note); standard confirm-deactivate dialog only, no client pre-check. */
export function useDeactivateLocationSite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => locationSitesApi.deactivate(id),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: locationSiteKeys.lists() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: locationSiteKeys.detail(dto.id) });
    },
  });
}

export function useActivateLocationSite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => locationSitesApi.activate(id),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: locationSiteKeys.lists() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: locationSiteKeys.detail(dto.id) });
    },
  });
}

/**
 * LOV-ORG-006 — thin named wrapper around the real generic lookup-consumption
 * endpoint (GET /api/lookups/{lookupCode}, src/masterLookups/hooks.ts'
 * useLookupValues). Reuse rule: ONE hook per LOOKUP_CODE — no duplicate fetch
 * logic. Note: the real endpoint is GET /api/lookups/{lookupCode} with no
 * `?active=true` query param and no /v1 segment — differs from the F2 spec's
 * guessed path (which itself flagged the path as unconfirmed against a
 * lookups-controller doc), same discrepancy already found and resolved for
 * every other LOV in this module (see branches/hooks.ts' useBranchTypeOptions).
 */
export function useLocationSiteTypeOptions() {
  return useLookupValues('LOCATION_SITE_TYPE');
}

export interface LocationSiteSearchFilters extends LocationSiteSearchContractRequest {
  page: number;
  size: number;
}

const DEFAULT_FILTERS: LocationSiteSearchFilters = { filters: [], sorts: [], page: 0, size: DEFAULT_PAGE_SIZE };

/**
 * F2-FACADE-HOOK — SCR-ORG-007. Components call this facade only; it composes
 * useSearchLocationSites, useCreateLocationSite, useUpdateLocationSite,
 * useDeactivateLocationSite, useActivateLocationSite, useLocationSiteTypeOptions,
 * and the cross-entity useBranchesOptions (branches/hooks.ts) for the branchFk
 * picker. No toasts, dialogs, or navigation here — same convention as
 * useBranchesFacade (src/branches/hooks.ts).
 *
 * canEdit (LOCATION_SITE_UPDATE) — NOT canDelete — is what actually gates
 * Deactivate/Activate on the real backend (SEC-FE SCR-ORG-007 FINDING-4);
 * canDelete is exposed for completeness but unused for gating in this module.
 */
export function useLocationSitesFacade() {
  const [searchFilters, setSearchFiltersState] = useState<LocationSiteSearchFilters>(DEFAULT_FILTERS);
  const [selectedItem, setSelectedItem] = useState<LocationSiteResponse | null>(null);
  const { can } = usePermission();
  const canView = can('PERM_LOCATION_SITE_VIEW');
  const canCreate = can('PERM_LOCATION_SITE_CREATE');
  const canEdit = can('PERM_LOCATION_SITE_UPDATE');
  const canDelete = can('PERM_LOCATION_SITE_DELETE');

  const search = useSearchLocationSites();
  const createMutation = useCreateLocationSite();
  const updateMutation = useUpdateLocationSite();
  const deactivateMutation = useDeactivateLocationSite();
  const activateMutation = useActivateLocationSite();
  const siteTypeOptions = useLocationSiteTypeOptions();
  const branchOptions = useBranchesOptions();

  // DRV: API-ORG-040 is a mutation, not a query (POST-as-query, same as
  // branches' useSearchBranches) — the Facade re-triggers it on mount and
  // whenever searchFilters changes.
  useEffect(() => {
    search.mutate(searchFilters);
  }, [searchFilters]);

  const refetchCurrentPage = () => search.mutate(searchFilters);

  const locationSiteList = search.data?.content ?? [];
  const totalElements = search.data?.totalElements ?? locationSiteList.length;

  const isLoading = [search, createMutation, updateMutation, deactivateMutation, activateMutation].some(
    (m) => m.isPending,
  ) || siteTypeOptions.isLoading || branchOptions.isLoading;

  return {
    locationSiteList,
    selectedItem,
    isLoading,
    isListLoading: search.isPending,
    loadError: search.isError ? search.error : null,
    searchFilters,
    siteTypeIdOptions: siteTypeOptions.data ?? [],
    branchFkOptions: branchOptions.data ?? [],
    page: searchFilters.page,
    size: searchFilters.size,
    totalElements,
    canView,
    canCreate,
    canEdit,
    canDelete,

    selectItem: (item: LocationSiteResponse | null) => setSelectedItem(item),
    setSearchFilters: (next: Partial<LocationSiteSearchFilters>) =>
      setSearchFiltersState((prev) => ({ ...prev, ...next })),
    retry: refetchCurrentPage,

    createLocationSite: async (data: CreateLocationSiteRequest) => {
      const dto = await createMutation.mutateAsync(data);
      refetchCurrentPage();
      return dto;
    },
    updateLocationSite: async (id: number, data: UpdateLocationSiteRequest) => {
      const dto = await updateMutation.mutateAsync({ id, req: data });
      refetchCurrentPage();
      return dto;
    },
    deactivateLocationSite: async (id: number) => {
      const dto = await deactivateMutation.mutateAsync(id);
      refetchCurrentPage();
      return dto;
    },
    activateLocationSite: async (id: number) => {
      const dto = await activateMutation.mutateAsync(id);
      refetchCurrentPage();
      return dto;
    },
  };
}
