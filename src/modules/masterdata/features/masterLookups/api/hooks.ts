import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  lookupConsumptionApi,
  masterLookupsApi,
  type LookupDetailCreateRequest,
  type LookupDetailSearchContractRequest,
  type LookupDetailUpdateRequest,
  type MasterLookupCreateRequest,
  type MasterLookupDto,
  type MasterLookupSearchContractRequest,
  type MasterLookupUpdateRequest,
  type LookupDetailDto,
} from './masterLookupsApi';
import { usePermission } from '@/features/auth';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/data/searchContract';

export const masterLookupKeys = {
  all: ['masterLookups'] as const,
  lists: () => [...masterLookupKeys.all, 'list'] as const,
  options: () => [...masterLookupKeys.all, 'options'] as const,
  details: () => [...masterLookupKeys.all, 'detail'] as const,
  detail: (id: number) => [...masterLookupKeys.details(), id] as const,
  usage: (id: number) => [...masterLookupKeys.all, id, 'usage'] as const,
};

export const lookupDetailKeys = {
  all: ['lookupDetails'] as const,
  lists: () => [...lookupDetailKeys.all, 'list'] as const,
  details: () => [...lookupDetailKeys.all, 'detail'] as const,
  detail: (id: number) => [...lookupDetailKeys.details(), id] as const,
  usage: (id: number) => [...lookupDetailKeys.all, id, 'usage'] as const,
  options: (lookupKey: string) => [...lookupDetailKeys.all, 'options', lookupKey] as const,
};

const STALE = 0;
const GC = 5 * 60_000;

/** Read-only options list for cross-screen consumers — e.g. a future FK picker that looks master lookups up by key. */
export function useMasterLookupOptions() {
  return useQuery({
    queryKey: masterLookupKeys.options(),
    queryFn: ({ signal }) =>
      masterLookupsApi.search({ sorts: [{ field: 'lookupName', direction: 'ASC' }], page: 0, size: MAX_PAGE_SIZE }, signal),
    staleTime: STALE,
    gcTime: GC,
    select: (page) => page.content,
  });
}

export function useMasterLookupUsage(id: number | undefined, enabled = true) {
  return useQuery({
    queryKey: masterLookupKeys.usage(id!),
    queryFn: ({ signal }) => masterLookupsApi.getUsage(id!, signal),
    enabled: id != null && enabled,
    staleTime: STALE,
    gcTime: GC,
  });
}

export function useSearchMasterLookups() {
  return useMutation({ mutationFn: (req: MasterLookupSearchContractRequest) => masterLookupsApi.search(req) });
}

export function useCreateMasterLookup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: MasterLookupCreateRequest) => masterLookupsApi.create(req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: masterLookupKeys.lists() });
      void qc.invalidateQueries({ queryKey: masterLookupKeys.options() });
    },
  });
}

export function useUpdateMasterLookup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: MasterLookupUpdateRequest }) => masterLookupsApi.update(id, req),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: masterLookupKeys.lists() });
      void qc.invalidateQueries({ queryKey: masterLookupKeys.options() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: masterLookupKeys.detail(dto.id) });
    },
  });
}

export function useDeleteMasterLookup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => masterLookupsApi.remove(id),
    onSuccess: (_v, id) => {
      qc.removeQueries({ queryKey: masterLookupKeys.detail(id) });
      void qc.invalidateQueries({ queryKey: masterLookupKeys.lists() });
      void qc.invalidateQueries({ queryKey: masterLookupKeys.options() });
    },
  });
}

export function useToggleMasterLookupActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => masterLookupsApi.toggleActive(id, { active }),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: masterLookupKeys.lists() });
      if (dto.id != null) {
        void qc.invalidateQueries({ queryKey: masterLookupKeys.detail(dto.id) });
        void qc.invalidateQueries({ queryKey: masterLookupKeys.usage(dto.id) });
      }
    },
  });
}

export function useLookupDetailUsage(id: number | undefined, enabled = true) {
  return useQuery({
    queryKey: lookupDetailKeys.usage(id!),
    queryFn: ({ signal }) => masterLookupsApi.getDetailUsage(id!, signal),
    enabled: id != null && enabled,
    staleTime: STALE,
    gcTime: GC,
  });
}

/** Dropdown-ready active options for a lookup key — cross-module read, not this screen's own admin list. */
export function useLookupDetailOptions(lookupKey: string | undefined, active?: boolean) {
  return useQuery({
    queryKey: lookupDetailKeys.options(lookupKey ?? ''),
    queryFn: ({ signal }) => masterLookupsApi.getDetailOptions(lookupKey!, active, signal),
    enabled: !!lookupKey,
    staleTime: STALE,
    gcTime: GC,
  });
}

/** GET /api/lookups/{lookupCode} — the separate Lookup Consumption controller, for any module's dropdown. */
export function useLookupValues(lookupCode: string | undefined) {
  return useQuery({
    queryKey: ['lookupValues', lookupCode],
    queryFn: ({ signal }) => lookupConsumptionApi.getValues(lookupCode!, signal),
    enabled: !!lookupCode,
    staleTime: STALE,
    gcTime: GC,
  });
}

export function useSearchLookupDetails() {
  return useMutation({ mutationFn: (req: LookupDetailSearchContractRequest) => masterLookupsApi.searchDetails(req) });
}

export function useCreateLookupDetail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: LookupDetailCreateRequest) => masterLookupsApi.createDetail(req),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: lookupDetailKeys.lists() });
      void qc.invalidateQueries({ queryKey: masterLookupKeys.lists() });
      if (dto.masterLookupId != null) void qc.invalidateQueries({ queryKey: masterLookupKeys.usage(dto.masterLookupId) });
    },
  });
}

export function useUpdateLookupDetail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: LookupDetailUpdateRequest }) => masterLookupsApi.updateDetail(id, req),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: lookupDetailKeys.lists() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: lookupDetailKeys.detail(dto.id) });
    },
  });
}

export function useDeleteLookupDetail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => masterLookupsApi.removeDetail(id),
    onSuccess: (_v, id) => {
      qc.removeQueries({ queryKey: lookupDetailKeys.detail(id) });
      void qc.invalidateQueries({ queryKey: lookupDetailKeys.lists() });
      void qc.invalidateQueries({ queryKey: masterLookupKeys.lists() });
    },
  });
}

export function useToggleLookupDetailActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => masterLookupsApi.toggleDetailActive(id, { active }),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: lookupDetailKeys.lists() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: lookupDetailKeys.detail(dto.id) });
    },
  });
}

export interface MasterLookupSearchFilters extends MasterLookupSearchContractRequest {
  page: number;
  size: number;
}

const DEFAULT_LOOKUP_FILTERS: MasterLookupSearchFilters = { filters: [], sorts: [], page: 0, size: DEFAULT_PAGE_SIZE };

export type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

/**
 * Facade for the Master Lookups screen. Components call this only; it
 * composes search/create/update/delete/toggle-active for the master lookup
 * (parent) entity. No toasts, dialogs, or navigation here — same convention
 * as useRoleManagementFacade (src/roles/hooks.ts).
 */
export function useMasterLookupManagementFacade() {
  const [searchFilters, setSearchFiltersState] = useState<MasterLookupSearchFilters>(DEFAULT_LOOKUP_FILTERS);
  const { can } = usePermission();
  const canCreate = can('PERM_MASTER_LOOKUP_CREATE');
  const canEdit = can('PERM_MASTER_LOOKUP_UPDATE');
  const canDelete = can('PERM_MASTER_LOOKUP_DELETE');
  // GAP: allowed server filter/sort fields for master-lookups search are not
  // documented in api-docs (unlike roles' confirmed roleName-only note) —
  // lookupName/lookupKey are assumed from the response schema's own field
  // names. Status has no server filter at all; applied client-side on the
  // loaded page only, same documented limitation as roles' statusFilter.
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedLookup, setSelectedLookup] = useState<MasterLookupDto | null>(null);

  const search = useSearchMasterLookups();
  const createMutation = useCreateMasterLookup();
  const updateMutation = useUpdateMasterLookup();
  const deleteMutation = useDeleteMasterLookup();
  const toggleActiveMutation = useToggleMasterLookupActive();

  useEffect(() => {
    search.mutate(searchFilters);
  }, [searchFilters]);

  const refetchCurrentPage = () => search.mutate(searchFilters);

  const loadedLookups = search.data?.content ?? [];
  const lookupList = loadedLookups.filter((l) => {
    if (statusFilter === 'ALL') return true;
    return statusFilter === 'ACTIVE' ? !!l.isActive : !l.isActive;
  });
  const totalElements = search.data?.totalElements ?? loadedLookups.length;

  const isLoading = [search, createMutation, updateMutation, deleteMutation, toggleActiveMutation].some(
    (m) => m.isPending,
  );

  return {
    lookupList,
    selectedLookup,
    canCreate,
    canEdit,
    canDelete,
    isLoading,
    isListLoading: search.isPending,
    loadError: search.isError ? search.error : null,
    searchFilters,
    statusFilter,
    page: searchFilters.page,
    size: searchFilters.size,
    totalElements,

    selectLookup: (lookup: MasterLookupDto | null) => setSelectedLookup(lookup),
    setSearchFilters: (next: Partial<MasterLookupSearchFilters>) =>
      setSearchFiltersState((prev) => ({ ...prev, ...next })),
    setPage: (page: number) => setSearchFiltersState((prev) => ({ ...prev, page })),
    setStatusFilter,
    search: refetchCurrentPage,
    retry: refetchCurrentPage,

    createLookup: async (data: MasterLookupCreateRequest) => {
      const dto = await createMutation.mutateAsync(data);
      refetchCurrentPage();
      return dto;
    },
    updateLookup: async (id: number, data: MasterLookupUpdateRequest) => {
      const dto = await updateMutation.mutateAsync({ id, req: data });
      refetchCurrentPage();
      return dto;
    },
    deleteLookup: async (id: number) => {
      await deleteMutation.mutateAsync(id);
      if (selectedLookup?.id === id) setSelectedLookup(null);
      refetchCurrentPage();
    },
    toggleLookupActive: async (id: number, active: boolean) => {
      const dto = await toggleActiveMutation.mutateAsync({ id, active });
      refetchCurrentPage();
      return dto;
    },
  };
}

export interface LookupDetailSearchFilters extends LookupDetailSearchContractRequest {
  page: number;
  size: number;
}

/**
 * Facade for the Lookup Values sub-screen (LookupDetailsDrawer), scoped to
 * one master lookup. Mirrors useMasterLookupManagementFacade's shape one
 * level down: master lookup id -> its lookup details (child) entity.
 */
export function useLookupDetailManagementFacade(masterLookupId: number | undefined) {
  const [searchFilters, setSearchFiltersState] = useState<LookupDetailSearchFilters>({
    filters: [],
    sorts: [{ field: 'sortOrder', direction: 'ASC' }],
    page: 0,
    size: DEFAULT_PAGE_SIZE,
  });
  const { can } = usePermission();
  const canCreate = can('PERM_MASTER_LOOKUP_CREATE');
  const canEdit = can('PERM_MASTER_LOOKUP_UPDATE');
  const canDelete = can('PERM_MASTER_LOOKUP_DELETE');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedDetail, setSelectedDetail] = useState<LookupDetailDto | null>(null);

  const search = useSearchLookupDetails();
  const createMutation = useCreateLookupDetail();
  const updateMutation = useUpdateLookupDetail();
  const deleteMutation = useDeleteLookupDetail();
  const toggleActiveMutation = useToggleLookupDetailActive();

  const runSearch = () => {
    if (masterLookupId == null) return;
    search.mutate({
      ...searchFilters,
      filters: [{ field: 'masterLookupId', operator: 'EQ', value: masterLookupId }, ...(searchFilters.filters ?? [])],
    });
  };

  useEffect(() => {
    runSearch();
  }, [masterLookupId, searchFilters]);

  const loadedDetails = search.data?.content ?? [];
  const detailList = loadedDetails.filter((d) => {
    if (statusFilter === 'ALL') return true;
    return statusFilter === 'ACTIVE' ? !!d.isActive : !d.isActive;
  });
  const totalElements = search.data?.totalElements ?? loadedDetails.length;

  const isLoading = [search, createMutation, updateMutation, deleteMutation, toggleActiveMutation].some(
    (m) => m.isPending,
  );

  return {
    detailList,
    selectedDetail,
    canCreate,
    canEdit,
    canDelete,
    isLoading,
    isListLoading: search.isPending,
    loadError: search.isError ? search.error : null,
    statusFilter,
    page: searchFilters.page,
    size: searchFilters.size,
    totalElements,

    selectDetail: (detail: LookupDetailDto | null) => setSelectedDetail(detail),
    setSearchFilters: (next: Partial<LookupDetailSearchFilters>) =>
      setSearchFiltersState((prev) => ({ ...prev, ...next })),
    setPage: (page: number) => setSearchFiltersState((prev) => ({ ...prev, page })),
    setStatusFilter,
    retry: runSearch,

    createDetail: async (data: LookupDetailCreateRequest) => {
      const dto = await createMutation.mutateAsync(data);
      runSearch();
      return dto;
    },
    updateDetail: async (id: number, data: LookupDetailUpdateRequest) => {
      const dto = await updateMutation.mutateAsync({ id, req: data });
      runSearch();
      return dto;
    },
    deleteDetail: async (id: number) => {
      await deleteMutation.mutateAsync(id);
      if (selectedDetail?.id === id) setSelectedDetail(null);
      runSearch();
    },
    toggleDetailActive: async (id: number, active: boolean) => {
      const dto = await toggleActiveMutation.mutateAsync({ id, active });
      runSearch();
      return dto;
    },
  };
}
