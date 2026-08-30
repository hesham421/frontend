import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  roleDataScopeApi,
  type CreateSecRoleBranchRequest,
  type RoleBranchSearchContractRequest,
} from './roleDataScopeApi';
import { DATA_ACCESS_LEVELS, type DataAccessLevel } from '../types/dataAccessLevel';
import { ApiError } from '@/lib/errors/ApiError';
import { usePermission } from '../../auth';

// F2-QUERY blocks API-SEC-042..047 (F2/SCR-SEC-007).

export const roleBranchKeys = {
  all: ['role-branches'] as const,
  detail: (roleId: number, branchId: number) => [...roleBranchKeys.all, roleId, branchId] as const,
  lists: () => [...roleBranchKeys.all, 'list'] as const,
};

const STALE = 0, GC = 5 * 60_000; // F2-HEADER global caching default for this module

/** API-SEC-042 — composite-key Entry-by-PK; drives the create-vs-update branch. */
export function useRoleBranch(roleId: number | undefined, branchId: number | undefined) {
  return useQuery({
    queryKey: roleBranchKeys.detail(roleId!, branchId!),
    queryFn: ({ signal }) => roleDataScopeApi.getById(roleId!, branchId!, signal),
    enabled: roleId != null && branchId != null,
    staleTime: STALE,
    gcTime: GC,
    retry: false, // a not-found here is the create-vs-update signal, not a transient failure
  });
}

/** API-SEC-045 — not composed by this screen's Facade; kept for completeness. */
export function useListRoleBranches(params: { page: number; size: number; sort?: string }) {
  return useQuery({
    queryKey: [...roleBranchKeys.lists(), params],
    queryFn: ({ signal }) => roleDataScopeApi.list(params, signal),
    staleTime: STALE,
    gcTime: GC,
  });
}

/** API-SEC-047 — not composed by this screen's Facade; kept for completeness. */
export function useSearchRoleBranches() {
  return useMutation({ mutationFn: (req: RoleBranchSearchContractRequest) => roleDataScopeApi.search(req) });
}

export function useCreateRoleBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateSecRoleBranchRequest) => roleDataScopeApi.create(req),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: roleBranchKeys.lists() });
      if (dto.roleIdFk != null && dto.branchIdFk != null) {
        void qc.invalidateQueries({ queryKey: roleBranchKeys.detail(dto.roleIdFk, dto.branchIdFk) });
      }
    },
  });
}

export function useUpdateRoleBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, branchId, dataAccessLevel }: { roleId: number; branchId: number; dataAccessLevel: DataAccessLevel }) =>
      roleDataScopeApi.update(roleId, branchId, { dataAccessLevel }),
    onSuccess: (_dto, { roleId, branchId }) => {
      void qc.invalidateQueries({ queryKey: roleBranchKeys.detail(roleId, branchId) });
      void qc.invalidateQueries({ queryKey: roleBranchKeys.lists() });
    },
  });
}

export function useDeleteRoleBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, branchId }: { roleId: number; branchId: number }) => roleDataScopeApi.remove(roleId, branchId),
    onSuccess: (_v, { roleId, branchId }) => {
      qc.removeQueries({ queryKey: roleBranchKeys.detail(roleId, branchId) });
      void qc.invalidateQueries({ queryKey: roleBranchKeys.lists() });
    },
  });
}

/** LOV-SEC-002 — exposed as a hook per spec naming; no network call (see dataAccessLevel.ts GAP note). */
export function useDataAccessLevelOptions(): readonly DataAccessLevel[] {
  return DATA_ACCESS_LEVELS;
}

/**
 * F2-FACADE-HOOK — SCR-SEC-007. saveScope branches to create (API-SEC-046)
 * if no assignment exists for this (roleId, branchId) pair yet, else update
 * (API-SEC-043). deleteScope is a direct DELETE, no pre-check call (PHASE F2
 * global pre-deactivation note).
 *
 * OQ-015 CARRYOVER: this Facade does not filter or restrict anything by
 * allowedBranches[] — nothing to consume.
 *
 * SEC-IMPL-RULE-2: canView/canCreate/canEdit/canDelete are the real,
 * confirmed PERM_ROLE_VIEW/CREATE/UPDATE/DELETE authorities, reused from
 * the Role entity's own permission family (security-datascope-role-branches.md
 * — this screen has no PERM_DATASCOPE_* family of its own, per F4). Verified
 * against the live backend's issued JWT authorities, 2026-08-29 — every
 * authority is PERM_-prefixed; the bare ROLE_* literals this used to check
 * never match anything and silently hid every Data Scope control.
 */
export function useRoleDataScopeFacade(roleId: number | undefined, branchId: number | undefined) {
  const scopeQuery = useRoleBranch(roleId, branchId);
  const createMutation = useCreateRoleBranch();
  const updateMutation = useUpdateRoleBranch();
  const deleteMutation = useDeleteRoleBranch();
  const { can } = usePermission();
  const canView = can('PERM_ROLE_VIEW');
  const canCreate = can('PERM_ROLE_CREATE');
  const canEdit = can('PERM_ROLE_UPDATE');
  const canDelete = can('PERM_ROLE_DELETE');

  const isLoading = scopeQuery.isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return {
    scope: scopeQuery.data ?? null,
    canView,
    canCreate,
    canEdit,
    canDelete,
    isLoading,
    saveScope: async (dataAccessLevel: DataAccessLevel) => {
      if (roleId == null || branchId == null) throw new Error('saveScope requires roleId and branchId');
      if (scopeQuery.isLoading) throw new Error('saveScope: scope lookup still in progress');
      if (scopeQuery.isError) {
        const err = scopeQuery.error;
        if (!(err instanceof ApiError) || err.kind !== 'notFound') throw err;
        return createMutation.mutateAsync({ roleIdFk: roleId, branchIdFk: branchId, dataAccessLevel });
      }
      const hasScope = scopeQuery.isSuccess && scopeQuery.data != null;
      return hasScope
        ? updateMutation.mutateAsync({ roleId, branchId, dataAccessLevel })
        : createMutation.mutateAsync({ roleIdFk: roleId, branchIdFk: branchId, dataAccessLevel });
    },
    deleteScope: async () => {
      if (roleId == null || branchId == null) throw new Error('deleteScope requires roleId and branchId');
      return deleteMutation.mutateAsync({ roleId, branchId });
    },
  };
}
