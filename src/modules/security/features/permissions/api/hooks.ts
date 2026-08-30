import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  permissionsApi,
  type CreatePermissionRequest,
  type PermissionDto,
  type PermissionSearchContractRequest,
} from './permissionsApi';
import { useActivePages } from '@/features/pageRegistry';
import { DEFAULT_PAGE_SIZE } from '@/data/searchContract';

// F2-QUERY blocks API-SEC-027..029 (F2/SCR-SEC-004).

export const permissionKeys = {
  all: ['permissions'] as const,
  lists: () => [...permissionKeys.all, 'list'] as const,
};

/** API-SEC-029 — POST-as-query, same convention as SCR-SEC-002's useSearchUsers. */
export function useSearchPermissions() {
  return useMutation({ mutationFn: (req: PermissionSearchContractRequest) => permissionsApi.search(req) });
}

export function useCreatePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreatePermissionRequest) => permissionsApi.create(req),
    onSuccess: () => void qc.invalidateQueries({ queryKey: permissionKeys.lists() }),
  });
}

export function useUpdatePermission() {
  const qc = useQueryClient();
  return useMutation({
    // write surface is name-only, per API-SEC-027.
    mutationFn: ({ id, name }: { id: number; name: string }) => permissionsApi.update(id, { name }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: permissionKeys.lists() }),
  });
}

export interface PermissionSearchFilters extends PermissionSearchContractRequest {
  page: number;
  size: number;
}

const DEFAULT_FILTERS: PermissionSearchFilters = { filters: [], sorts: [], page: 0, size: DEFAULT_PAGE_SIZE };

/**
 * F2-FACADE-HOOK — SCR-SEC-004. Components call this facade only; it
 * composes useSearchPermissions, useCreatePermission, useUpdatePermission,
 * the LOV-SEC-001 constant (static import — see permissionType.ts, not a
 * hook), and useActivePages (cross-screen read from SCR-SEC-005, for the
 * "associated screen" picker). No toasts/dialogs/navigation here (R.3.11).
 *
 * SEC-FE/SCR-SEC-004: no permission flags are exposed here. Confirmed real
 * asymmetry (permissionmanagement.md) — POST/PUT (create/update) carry no
 * permission annotation at all server-side, so gating them on the client
 * would imply protection that doesn't exist (AD-6). Only search carries one
 * (PERMISSION_VIEW), and that's a 403-on-load concern already covered by
 * the generic mapApiError path, not a control to hide.
 */
export function usePermissionRegistryFacade() {
  const [searchFilters, setSearchFiltersState] = useState<PermissionSearchFilters>(DEFAULT_FILTERS);
  const [selectedPerm, setSelectedPerm] = useState<PermissionDto | null>(null);

  const search = useSearchPermissions();
  const createMutation = useCreatePermission();
  const updateMutation = useUpdatePermission();
  const pageOptions = useActivePages();

  // DRV: API-SEC-029 is a mutation, not a query — the Facade re-triggers it
  // on mount and whenever searchFilters changes (same pattern as SCR-SEC-002).
  useEffect(() => {
    search.mutate(searchFilters);
  }, [searchFilters]);

  const refetchCurrentPage = () => search.mutate(searchFilters);

  const isLoading = [search, createMutation, updateMutation].some((m) => m.isPending);
  const permissionList = search.data?.content ?? [];
  const totalElements = search.data?.totalElements ?? permissionList.length;

  return {
    permissionList,
    selectedPerm,
    isLoading,
    isListLoading: search.isPending,
    loadError: search.isError ? search.error : null,
    searchFilters,
    page: searchFilters.page,
    size: searchFilters.size,
    totalElements,
    pageOptions: pageOptions.data ?? [],

    selectPermission: (perm: PermissionDto | null) => setSelectedPerm(perm),
    setSearchFilters: (next: Partial<PermissionSearchFilters>) => setSearchFiltersState((prev) => ({ ...prev, ...next })),
    setPage: (page: number) => setSearchFiltersState((prev) => ({ ...prev, page })),
    retry: refetchCurrentPage,

    createPermission: async (data: CreatePermissionRequest) => {
      const dto = await createMutation.mutateAsync(data);
      refetchCurrentPage();
      return dto;
    },
    updatePermission: async (id: number, name: string) => {
      const dto = await updateMutation.mutateAsync({ id, name });
      refetchCurrentPage();
      return dto;
    },
  };
}
