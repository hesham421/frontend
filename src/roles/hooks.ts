import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  rolesApi,
  type AddPageToRoleRequest,
  type CreateRoleRequest,
  type PageAssignmentDto,
  type RoleDto,
  type RoleSearchContractRequest,
  type UpdateRoleRequest,
} from './rolesApi';
import { usePermission } from '../auth/permissions';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../data/searchContract';

// F2-QUERY blocks API-SEC-016..026, API-SEC-050 (F2/SCR-SEC-003).

export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  options: () => [...roleKeys.lists(), 'options'] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (roleId: number) => [...roleKeys.details(), roleId] as const,
  pages: (roleId: number) => [...roleKeys.all, roleId, 'pages'] as const,
};

const STALE = 0, GC = 5 * 60_000; // F2-HEADER global caching default for this module

/**
 * Read-only role list for cross-screen consumers — e.g. SCR-SEC-002's roles
 * multi-select, which looks roles up by NAME, not id (F1-MODEL ENTITY-SEC-001
 * correction #2). Composed by useUserManagementFacade (src/users/hooks.ts) as
 * its F2-FACADE-HOOK spec's `useRolesOptions` cross-screen read.
 */
export function useRolesOptions() {
  return useQuery({
    queryKey: roleKeys.options(),
    queryFn: ({ signal }) =>
      // MAX_PAGE_SIZE (100) is the backend's hard cap — requesting more (this
      // was 200) fails the whole query with SEARCH_ERROR "Page size must not
      // exceed 100", emptying every role picker across the app, not just this
      // one. Past 100 roles, this list is necessarily a first-100-alphabetical
      // slice, not the full catalog — a real, disclosed limit, not a bug to
      // paper over with a bigger number the backend will just reject again.
      rolesApi.search({ sorts: [{ field: 'roleName', direction: 'ASC' }], page: 0, size: MAX_PAGE_SIZE }, signal),
    staleTime: STALE,
    gcTime: GC,
    select: (page) => page.content,
  });
}

/** API-SEC-016 — not composed by this screen's own Facade; used by cross-screen role-options resolution (SCR-SEC-002, SCR-SEC-007). */
export function useRole(roleId: number | undefined) {
  return useQuery({
    queryKey: roleKeys.detail(roleId!),
    queryFn: ({ signal }) => rolesApi.getById(roleId!, signal),
    enabled: roleId != null,
    staleTime: STALE,
    gcTime: GC,
  });
}

/** API-SEC-019 — enabled only once a role is selected for edit. */
export function useRolePagesMatrix(roleId: number | undefined) {
  return useQuery({
    queryKey: roleKeys.pages(roleId!),
    queryFn: ({ signal }) => rolesApi.getPages(roleId!, signal),
    enabled: roleId != null,
    staleTime: STALE,
    gcTime: GC,
  });
}

/** Lightweight total-count read for the Dashboard KPI tile — avoids fetching a full page of rows just to show a number. */
export function useRolesCount() {
  return useQuery({
    queryKey: [...roleKeys.all, 'count'],
    queryFn: ({ signal }) => rolesApi.search({ filters: [], sorts: [], page: 0, size: 1 }, signal),
    staleTime: STALE,
    gcTime: GC,
    select: (page) => page.totalElements,
  });
}

/** API-SEC-026 — POST-as-query, same convention as SCR-SEC-002's useSearchUsers. */
export function useSearchRoles() {
  return useMutation({ mutationFn: (req: RoleSearchContractRequest) => rolesApi.search(req) });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateRoleRequest) => rolesApi.create(req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: roleKeys.lists() });
      void qc.invalidateQueries({ queryKey: roleKeys.options() });
    },
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, req }: { roleId: number; req: UpdateRoleRequest }) => rolesApi.update(roleId, req),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: roleKeys.lists() });
      void qc.invalidateQueries({ queryKey: roleKeys.options() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: roleKeys.detail(dto.id) });
    },
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roleId: number) => rolesApi.remove(roleId),
    onSuccess: (_v, roleId) => {
      qc.removeQueries({ queryKey: roleKeys.detail(roleId) });
      void qc.invalidateQueries({ queryKey: roleKeys.lists() });
      void qc.invalidateQueries({ queryKey: roleKeys.options() });
    },
  });
}

export function useActivateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roleId: number) => rolesApi.activate(roleId),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: roleKeys.lists() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: roleKeys.detail(dto.id) });
    },
  });
}

export function useDeactivateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roleId: number) => rolesApi.deactivate(roleId),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: roleKeys.lists() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: roleKeys.detail(dto.id) });
    },
  });
}

export function useSyncRolePages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, assignments }: { roleId: number; assignments: PageAssignmentDto[] }) =>
      rolesApi.syncPages(roleId, { assignments }),
    onSuccess: (_dto, { roleId }) => void qc.invalidateQueries({ queryKey: roleKeys.pages(roleId) }),
  });
}

export function useAddPageToRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, req }: { roleId: number; req: AddPageToRoleRequest }) => rolesApi.addPage(roleId, req),
    onSuccess: (_dto, { roleId }) => void qc.invalidateQueries({ queryKey: roleKeys.pages(roleId) }),
  });
}

export function useRemovePageFromRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, pageCode }: { roleId: number; pageCode: string }) => rolesApi.removePage(roleId, pageCode),
    onSuccess: (_v, { roleId }) => void qc.invalidateQueries({ queryKey: roleKeys.pages(roleId) }),
  });
}

/** API-SEC-025 — copies only page-scoped permissions; system-level permissions on the target role are untouched. */
export function useCopyFromRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, sourceRoleId }: { roleId: number; sourceRoleId: number }) =>
      rolesApi.copyFrom(roleId, sourceRoleId),
    onSuccess: (_dto, { roleId }) => void qc.invalidateQueries({ queryKey: roleKeys.pages(roleId) }),
  });
}

export interface RoleSearchFilters extends RoleSearchContractRequest {
  page: number;
  size: number;
}

const DEFAULT_FILTERS: RoleSearchFilters = { filters: [], sorts: [], page: 0, size: DEFAULT_PAGE_SIZE };

export type RoleStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

/**
 * F2-FACADE-HOOK — SCR-SEC-003. Components call this facade only; it composes
 * useSearchRoles, useCreateRole, useUpdateRole, useDeleteRole, useActivateRole,
 * useDeactivateRole, useRolePagesMatrix (enabled only when a role is
 * selected), useSyncRolePages, useAddPageToRole, useRemovePageFromRole,
 * useCopyFromRole. No toasts, dialogs, or navigation here (R.3.11).
 *
 * SEC-IMPL-RULE-2: canCreate/canEdit/canDelete use the real, confirmed
 * ROLE_CREATE/ROLE_UPDATE/ROLE_DELETE authorities (roleaccesscontrol.md).
 * canView is NOT exposed — Roles' own pageCode is unconfirmed
 * (OQ-SEC-FE-003), so the PERM_ROLE_* screen-gating literal cannot be
 * constructed without inventing it; the App.tsx switch-case guard for
 * 'sec-roles' stays open pending that resolution.
 */
export function useRoleManagementFacade() {
  const [searchFilters, setSearchFiltersState] = useState<RoleSearchFilters>(DEFAULT_FILTERS);
  const { can } = usePermission();
  const canCreate = can('ROLE_CREATE');
  const canEdit = can('ROLE_UPDATE');
  const canDelete = can('ROLE_DELETE');
  // GAP (API-SEC-026): allowed server filter fields are roleName only — no
  // `active` filter exists server-side. Applied CLIENT-SIDE on the loaded
  // page only, per the documented limitation (not a true full-dataset filter).
  const [statusFilter, setStatusFilter] = useState<RoleStatusFilter>('ALL');
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);

  const search = useSearchRoles();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();
  const activateMutation = useActivateRole();
  const deactivateMutation = useDeactivateRole();
  const pagesMatrix = useRolePagesMatrix(selectedRole?.id);
  const syncPagesMutation = useSyncRolePages();
  const addPageMutation = useAddPageToRole();
  const removePageMutation = useRemovePageFromRole();
  const copyFromMutation = useCopyFromRole();

  // DRV: API-SEC-026 is a mutation, not a query (POST-as-query, same as
  // SCR-SEC-002's useSearchUsers) — the Facade re-triggers it on mount and
  // whenever searchFilters changes.
  useEffect(() => {
    search.mutate(searchFilters);
  }, [searchFilters]);

  const refetchCurrentPage = () => search.mutate(searchFilters);

  const loadedRoles = search.data?.content ?? [];
  const roleList = loadedRoles.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return statusFilter === 'ACTIVE' ? !!r.active : !r.active;
  });
  const totalElements = search.data?.totalElements ?? loadedRoles.length;

  const isLoading = [
    search,
    createMutation,
    updateMutation,
    deleteMutation,
    activateMutation,
    deactivateMutation,
    syncPagesMutation,
    addPageMutation,
    removePageMutation,
    copyFromMutation,
  ].some((m) => m.isPending);

  return {
    roleList,
    selectedRole,
    pageMatrix: pagesMatrix.data ?? null,
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

    selectRole: (role: RoleDto | null) => setSelectedRole(role),
    setSearchFilters: (next: Partial<RoleSearchFilters>) => setSearchFiltersState((prev) => ({ ...prev, ...next })),
    setPage: (page: number) => setSearchFiltersState((prev) => ({ ...prev, page })),
    setStatusFilter,
    search: refetchCurrentPage,
    retry: refetchCurrentPage,

    createRole: async (data: CreateRoleRequest) => {
      const dto = await createMutation.mutateAsync(data);
      refetchCurrentPage();
      return dto;
    },
    updateRole: async (roleId: number, data: UpdateRoleRequest) => {
      const dto = await updateMutation.mutateAsync({ roleId, req: data });
      refetchCurrentPage();
      return dto;
    },
    deleteRole: async (roleId: number) => {
      await deleteMutation.mutateAsync(roleId);
      if (selectedRole?.id === roleId) setSelectedRole(null);
      refetchCurrentPage();
    },
    activateRole: async (roleId: number) => {
      const dto = await activateMutation.mutateAsync(roleId);
      refetchCurrentPage();
      return dto;
    },
    deactivateRole: async (roleId: number) => {
      const dto = await deactivateMutation.mutateAsync(roleId);
      refetchCurrentPage();
      return dto;
    },
    // "sync all"
    syncRolePages: (roleId: number, assignments: PageAssignmentDto[]) =>
      syncPagesMutation.mutateAsync({ roleId, assignments }),
    addPageToRole: (roleId: number, pageCode: string, permissions: string[]) =>
      addPageMutation.mutateAsync({ roleId, req: { pageCode, permissions } }),
    removePageFromRole: (roleId: number, pageCode: string) => removePageMutation.mutateAsync({ roleId, pageCode }),
    // "copy from another role"
    copyFromRole: (roleId: number, sourceRoleId: number) => copyFromMutation.mutateAsync({ roleId, sourceRoleId }),
  };
}
