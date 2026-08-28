import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  usersApi,
  type CreateUserRequest,
  type UpdateUserRequest,
  type UserDto,
  type UserSearchContractRequest,
} from './usersApi';
import { useRolesOptions } from '../roles/hooks';
import { DEFAULT_PAGE_SIZE } from '../data/searchContract';

// F2-QUERY blocks API-SEC-009..015 (F2/SCR-SEC-002).

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: { page: number; size: number; sort?: string }) => [...userKeys.lists(), params] as const,
  roles: (userId: number) => [...userKeys.all, userId, 'roles'] as const,
};

const STALE = 0, GC = 5 * 60_000; // F2-HEADER global caching default for this module

/** API-SEC-013 — documented fallback list; this screen's search bar uses useSearchUsers instead. */
export function useListUsers(params: { page: number; size: number; sort?: string }) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: ({ signal }) => usersApi.list(params, signal),
    staleTime: STALE,
    gcTime: GC,
  });
}

/** API-SEC-011 — not composed by the Facade (spec boundary); available for a future user-detail view. */
export function useUserRoles(userId: number | undefined) {
  return useQuery({
    queryKey: userKeys.roles(userId!),
    queryFn: ({ signal }) => usersApi.getRoles(userId!, signal),
    enabled: userId != null,
    staleTime: STALE,
    gcTime: GC,
  });
}

/** Lightweight total-count read for the Dashboard KPI tile — avoids fetching a full page of rows just to show a number. */
export function useUsersCount() {
  return useQuery({
    queryKey: [...userKeys.all, 'count'],
    queryFn: ({ signal }) => usersApi.search({ filters: [], sorts: [], page: 0, size: 1 }, signal),
    staleTime: STALE,
    gcTime: GC,
    select: (page) => page.totalElements,
  });
}

/**
 * API-SEC-015 — POST-as-query: modeled as useMutation per this project's
 * convention for *-search endpoints. searchFilters lives in Facade state
 * exactly as a GET query key would; the Facade re-triggers this manually on
 * change (DRV: forced by the backend exposing search as POST, not GET).
 */
export function useSearchUsers() {
  return useMutation({ mutationFn: (req: UserSearchContractRequest) => usersApi.search(req) });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateUserRequest) => usersApi.create(req),
    onSuccess: () => void qc.invalidateQueries({ queryKey: userKeys.lists() }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, req }: { userId: number; req: UpdateUserRequest }) => usersApi.update(userId, req),
    onSuccess: () => void qc.invalidateQueries({ queryKey: userKeys.lists() }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => usersApi.remove(userId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: userKeys.lists() }),
  });
}

export function useAssignRoles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleNames }: { userId: number; roleNames: string[] }) =>
      usersApi.assignRoles(userId, { roleNames }),
    onSuccess: (_dto, { userId }) => {
      void qc.invalidateQueries({ queryKey: userKeys.lists() });
      void qc.invalidateQueries({ queryKey: userKeys.roles(userId) });
    },
  });
}

export interface UserSearchFilters extends UserSearchContractRequest {
  page: number;
  size: number;
}

const DEFAULT_FILTERS: UserSearchFilters = { filters: [], sorts: [], page: 0, size: DEFAULT_PAGE_SIZE };

/**
 * F2-FACADE-HOOK — SCR-SEC-002. Components call this facade only; it composes
 * useSearchUsers, useCreateUser, useUpdateUser, useDeleteUser, useAssignRoles,
 * plus the cross-screen useRolesOptions read (SCR-SEC-003). No toasts,
 * dialogs, or navigation here (R.3.11) — callers own the reaction.
 *
 * Permission flags (canView/canCreate/canEdit/canDelete) are SEC-FE/SCR-SEC-
 * 002's own phase — not added here, since no session/permission Context
 * exists in the app yet (AD-5). SEC-IMPL-RULE-2 expects them read from this
 * Facade once that phase runs; they are not fabricated ahead of it.
 */
export function useUserManagementFacade() {
  const [searchFilters, setSearchFiltersState] = useState<UserSearchFilters>(DEFAULT_FILTERS);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);

  const search = useSearchUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const assignRolesMutation = useAssignRoles();
  const roleOptions = useRolesOptions();

  // DRV: API-SEC-015 is a mutation, not a query, so there is no automatic
  // refetch-on-key-change — the Facade re-triggers it on mount and whenever
  // searchFilters changes (PHASE F2 global State ownership note).
  useEffect(() => {
    search.mutate(searchFilters);
  }, [searchFilters]);

  const refetchCurrentPage = () => search.mutate(searchFilters);

  const userList = search.data?.content ?? [];
  const totalElements = search.data?.totalElements ?? userList.length;

  const isLoading = [search, createMutation, updateMutation, deleteMutation, assignRolesMutation].some(
    (m) => m.isPending,
  );

  return {
    userList,
    selectedUser,
    isLoading,
    // List-load state only (excludes Save/Delete mutations) so the table can
    // show a loading/error state without flickering every time an unrelated
    // dialog action is in flight.
    isListLoading: search.isPending,
    loadError: search.isError ? search.error : null,
    searchFilters,
    page: searchFilters.page,
    size: searchFilters.size,
    totalElements,
    roleOptions: roleOptions.data ?? [],

    selectUser: (user: UserDto | null) => setSelectedUser(user),
    setSearchFilters: (next: Partial<UserSearchFilters>) => setSearchFiltersState((prev) => ({ ...prev, ...next })),
    setPage: (page: number) => setSearchFiltersState((prev) => ({ ...prev, page })),
    retry: refetchCurrentPage,

    // Composed 2-step per API-SEC-014's Flow Implication note: POST /api/users,
    // then (if roles were selected) PUT .../roles — exposed as ONE operation.
    // If role assignment fails, the created user is still returned (not lost)
    // along with the error so the caller can retry just that step via assignRoles.
    createUser: async (data: { username: string; password: string; roleNames?: string[] }) => {
      const dto = await createMutation.mutateAsync({ username: data.username, password: data.password });
      let user = dto;
      let roleAssignmentError: unknown;
      if (data.roleNames?.length && dto.id != null) {
        try {
          user = await assignRolesMutation.mutateAsync({ userId: dto.id, roleNames: data.roleNames });
        } catch (err) {
          roleAssignmentError = err;
        }
      }
      refetchCurrentPage();
      return { user, roleAssignmentError };
    },

    updateUser: async (userId: number, data: UpdateUserRequest) => {
      const dto = await updateMutation.mutateAsync({ userId, req: data });
      refetchCurrentPage();
      return dto;
    },

    deleteUser: async (userId: number) => {
      await deleteMutation.mutateAsync(userId);
      if (selectedUser?.id === userId) setSelectedUser(null);
      refetchCurrentPage();
    },

    assignRoles: async (userId: number, roleNames: string[]) => {
      const dto = await assignRolesMutation.mutateAsync({ userId, roleNames });
      refetchCurrentPage();
      return dto;
    },
  };
}
