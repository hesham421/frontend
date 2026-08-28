import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  pageRegistryApi,
  type CreatePageRequest,
  type PageResponse,
  type PageSearchContractRequest,
  type UpdatePageRequest,
} from './pageRegistryApi';
import { usePermission } from '../auth/permissions';
import { DEFAULT_PAGE_SIZE } from '../data/searchContract';

// F2-QUERY blocks API-SEC-030..036 (F2/SCR-SEC-005).

export const pageKeys = {
  all: ['pages'] as const,
  lists: () => [...pageKeys.all, 'list'] as const,
  details: () => [...pageKeys.all, 'detail'] as const,
  detail: (id: number) => [...pageKeys.details(), id] as const,
  active: () => [...pageKeys.all, 'active'] as const,
};

const STALE = 0, GC = 5 * 60_000; // F2-HEADER global caching default for this module
// DRV (API-SEC-036): stable reference data, explicitly described as the
// Role Access Control "Add Page" dropdown source — longer staleTime justified
// by the endpoint's own stated purpose.
const ACTIVE_STALE = 10 * 60_000;

/** API-SEC-030 — not composed by this screen's own Facade; cross-screen page-options resolution. */
export function usePage(id: number | undefined) {
  return useQuery({
    queryKey: pageKeys.detail(id!),
    queryFn: ({ signal }) => pageRegistryApi.getById(id!, signal),
    enabled: id != null,
    staleTime: STALE,
    gcTime: GC,
  });
}

/** API-SEC-036 — real source for SCR-SEC-003's "add page" picker, and this screen's own cross-screen exposure. */
export function useActivePages() {
  return useQuery({
    queryKey: pageKeys.active(),
    queryFn: ({ signal }) => pageRegistryApi.active(signal),
    staleTime: ACTIVE_STALE,
    gcTime: GC,
  });
}

/** API-SEC-035 — POST-as-query, same convention as SCR-SEC-002's useSearchUsers. */
export function useSearchPages() {
  return useMutation({ mutationFn: (req: PageSearchContractRequest) => pageRegistryApi.search(req) });
}

export function useCreatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreatePageRequest) => pageRegistryApi.create(req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: pageKeys.lists() });
      void qc.invalidateQueries({ queryKey: pageKeys.active() });
    },
  });
}

export function useUpdatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: UpdatePageRequest }) => pageRegistryApi.update(id, req),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: pageKeys.lists() });
      void qc.invalidateQueries({ queryKey: pageKeys.active() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: pageKeys.detail(dto.id) });
    },
  });
}

export function useDeactivatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => pageRegistryApi.deactivate(id),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: pageKeys.lists() });
      void qc.invalidateQueries({ queryKey: pageKeys.active() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: pageKeys.detail(dto.id) });
    },
  });
}

export function useReactivatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => pageRegistryApi.reactivate(id),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: pageKeys.lists() });
      void qc.invalidateQueries({ queryKey: pageKeys.active() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: pageKeys.detail(dto.id) });
    },
  });
}

export interface PageSearchFilters extends PageSearchContractRequest {
  page: number;
  size: number;
}

const DEFAULT_FILTERS: PageSearchFilters = { filters: [], sorts: [], page: 0, size: DEFAULT_PAGE_SIZE };

/**
 * F2-FACADE-HOOK — SCR-SEC-005. Components call this facade only; it
 * composes useSearchPages, useCreatePage, useUpdatePage, useDeactivatePage,
 * useReactivatePage, useActivePages. No toasts/dialogs/navigation here
 * (R.3.11).
 *
 * SEC-IMPL-RULE-2/3: canCreate/canEdit/canDelete use the real, confirmed
 * PAGE_CREATE/PAGE_UPDATE/PAGE_DELETE authorities (pagemanagement.md).
 * canEdit also covers reactivate (PAGE_UPDATE); canDelete specifically
 * covers deactivate (PAGE_DELETE — distinct from update, confirmed literal).
 * canView is NOT exposed here — that's the still-unconfirmed PERM_PAGE_*
 * frontend screen-gating literal (OQ-SEC-FE-003), a different concept from
 * the real PAGE_VIEW authority that guards the read/search endpoints.
 */
export function usePageRegistryFacade() {
  const [searchFilters, setSearchFiltersState] = useState<PageSearchFilters>(DEFAULT_FILTERS);
  const { can } = usePermission();
  const canCreate = can('PAGE_CREATE');
  const canEdit = can('PAGE_UPDATE');
  const canDelete = can('PAGE_DELETE');
  const [selectedPage, setSelectedPage] = useState<PageResponse | null>(null);

  const search = useSearchPages();
  const createMutation = useCreatePage();
  const updateMutation = useUpdatePage();
  const deactivateMutation = useDeactivatePage();
  const reactivateMutation = useReactivatePage();
  const activePages = useActivePages();

  // DRV: API-SEC-035 is a mutation, not a query — the Facade re-triggers it
  // on mount and whenever searchFilters changes (same pattern as SCR-SEC-002).
  useEffect(() => {
    search.mutate(searchFilters);
  }, [searchFilters]);

  const refetchCurrentPage = () => search.mutate(searchFilters);

  const pageList = search.data?.content ?? [];
  const totalElements = search.data?.totalElements ?? pageList.length;

  const isLoading = [search, createMutation, updateMutation, deactivateMutation, reactivateMutation].some(
    (m) => m.isPending,
  );

  return {
    pageList,
    selectedPage,
    canCreate,
    canEdit,
    canDelete,
    isLoading,
    isListLoading: search.isPending,
    loadError: search.isError ? search.error : null,
    searchFilters,
    page: searchFilters.page,
    size: searchFilters.size,
    totalElements,
    activePages: activePages.data ?? [],

    selectPage: (page: PageResponse | null) => setSelectedPage(page),
    setSearchFilters: (next: Partial<PageSearchFilters>) => setSearchFiltersState((prev) => ({ ...prev, ...next })),
    setPage: (p: number) => setSearchFiltersState((prev) => ({ ...prev, page: p })),
    retry: refetchCurrentPage,

    createPage: async (data: CreatePageRequest) => {
      const dto = await createMutation.mutateAsync(data);
      refetchCurrentPage();
      return dto;
    },
    updatePage: async (id: number, data: UpdatePageRequest) => {
      const dto = await updateMutation.mutateAsync({ id, req: data });
      refetchCurrentPage();
      return dto;
    },
    // no separate pre-check call — direct mutation, 409/422 -> toast if the backend rejects it
    deactivatePage: async (id: number) => {
      const dto = await deactivateMutation.mutateAsync(id);
      refetchCurrentPage();
      return dto;
    },
    reactivatePage: async (id: number) => {
      const dto = await reactivateMutation.mutateAsync(id);
      refetchCurrentPage();
      return dto;
    },
  };
}
