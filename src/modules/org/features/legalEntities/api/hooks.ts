import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  legalEntitiesApi,
  type CreateLegalEntityRequest,
  type LegalEntityResponse,
  type LegalEntitySearchContractRequest,
  type UpdateLegalEntityRequest,
} from './legalEntitiesApi';
import { useLookupValues } from '@/modules/masterdata';
import { usePermission } from '@/modules/security';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/data/searchContract';

// F2-QUERY blocks API-ORG-001..006, F2-LOV-QUERY LOV-ORG-001 (F2/SCR-ORG-001).

export const legalEntityKeys = {
  all: ['legal-entities'] as const,
  lists: () => [...legalEntityKeys.all, 'list'] as const,
  details: () => [...legalEntityKeys.all, 'detail'] as const,
  detail: (id: number) => [...legalEntityKeys.details(), id] as const,
};

const STALE = 0, GC = 5 * 60_000; // F2-HEADER global caching default for this module

/** API-ORG-006 — enabled only once an id is selected (e.g. EDIT entry mode). */
export function useLegalEntity(id: number | undefined) {
  return useQuery({
    queryKey: legalEntityKeys.detail(id!),
    queryFn: ({ signal }) => legalEntitiesApi.getById(id!, signal),
    enabled: id != null,
    staleTime: STALE,
    gcTime: GC,
  });
}

/** API-ORG-002 — POST-as-query, same convention as roles' useSearchRoles. */
export function useSearchLegalEntities() {
  return useMutation({ mutationFn: (req: LegalEntitySearchContractRequest) => legalEntitiesApi.search(req) });
}

/**
 * Read-only, active-only Legal Entities list for cross-screen FK pickers —
 * e.g. SCR-ORG-002's (Branches) legalEntityFk picker (F2/SCR-ORG-002's
 * "Cross-entity FK reuse" note: reuses API-ORG-002 filtered to LegalEntity,
 * isActive=true). Same convention as roles' useRolesOptions
 * (src/roles/hooks.ts): sorted by name, capped at MAX_PAGE_SIZE (the
 * backend's hard search-size limit — see searchContract.ts).
 */
export function useLegalEntitiesOptions() {
  return useQuery({
    queryKey: [...legalEntityKeys.lists(), 'options'] as const,
    queryFn: ({ signal }) =>
      legalEntitiesApi.search(
        {
          filters: [{ field: 'isActiveFl', operator: 'EQ', value: true }],
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

export function useCreateLegalEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateLegalEntityRequest) => legalEntitiesApi.create(req),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: legalEntityKeys.lists() });
    },
  });
}

export function useUpdateLegalEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: UpdateLegalEntityRequest }) => legalEntitiesApi.update(id, req),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: legalEntityKeys.lists() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: legalEntityKeys.detail(dto.id) });
    },
  });
}

/** API-ORG-004 — 409 if dependent records block deactivation (backend-enforced, no client pre-check). */
export function useDeactivateLegalEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => legalEntitiesApi.deactivate(id),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: legalEntityKeys.lists() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: legalEntityKeys.detail(dto.id) });
    },
  });
}

export function useActivateLegalEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => legalEntitiesApi.activate(id),
    onSuccess: (dto) => {
      void qc.invalidateQueries({ queryKey: legalEntityKeys.lists() });
      if (dto.id != null) void qc.invalidateQueries({ queryKey: legalEntityKeys.detail(dto.id) });
    },
  });
}

/**
 * LOV-ORG-001 — thin named wrapper around the real generic lookup-consumption
 * endpoint (GET /api/lookups/{lookupCode}, src/masterLookups/hooks.ts'
 * useLookupValues). Reuse rule: ONE hook per LOOKUP_CODE — no duplicate fetch
 * logic. Note: the real endpoint is GET /api/lookups/{lookupCode} with no
 * `?active=true` query param and no /v1 segment — differs from the F2 spec's
 * guessed path/shape, which is superseded by this already-implemented
 * generic consumption controller.
 */
export function useLegalEntityTypeOptions() {
  return useLookupValues('LEGAL_ENTITY_TYPE');
}

export interface LegalEntitySearchFilters extends LegalEntitySearchContractRequest {
  page: number;
  size: number;
}

const DEFAULT_FILTERS: LegalEntitySearchFilters = { filters: [], sorts: [], page: 0, size: DEFAULT_PAGE_SIZE };

/**
 * F2-FACADE-HOOK — SCR-ORG-001. Components call this facade only; it composes
 * useSearchLegalEntities, useCreateLegalEntity, useUpdateLegalEntity,
 * useDeactivateLegalEntity, useActivateLegalEntity, useLegalEntityTypeOptions.
 * No toasts, dialogs, or navigation here — same convention as
 * useRoleManagementFacade (src/roles/hooks.ts).
 *
 * canEdit (LEGAL_ENTITY_UPDATE) — NOT canDelete — is what actually gates
 * Deactivate/Activate on the real backend (SEC-FE SCR-ORG-001 FINDING-4);
 * canDelete is exposed for completeness but unused for gating in this module.
 */
export function useLegalEntitiesFacade() {
  const [searchFilters, setSearchFiltersState] = useState<LegalEntitySearchFilters>(DEFAULT_FILTERS);
  const [selectedItem, setSelectedItem] = useState<LegalEntityResponse | null>(null);
  const { can } = usePermission();
  const canView = can('PERM_LEGAL_ENTITY_VIEW');
  const canCreate = can('PERM_LEGAL_ENTITY_CREATE');
  const canEdit = can('PERM_LEGAL_ENTITY_UPDATE');
  const canDelete = can('PERM_LEGAL_ENTITY_DELETE');

  const search = useSearchLegalEntities();
  const createMutation = useCreateLegalEntity();
  const updateMutation = useUpdateLegalEntity();
  const deactivateMutation = useDeactivateLegalEntity();
  const activateMutation = useActivateLegalEntity();
  const entityTypeOptions = useLegalEntityTypeOptions();

  // DRV: API-ORG-002 is a mutation, not a query (POST-as-query, same as
  // roles' useSearchRoles) — the Facade re-triggers it on mount and whenever
  // searchFilters changes.
  useEffect(() => {
    search.mutate(searchFilters);
  }, [searchFilters]);

  const refetchCurrentPage = () => search.mutate(searchFilters);

  const legalentityList = search.data?.content ?? [];
  const totalElements = search.data?.totalElements ?? legalentityList.length;

  const isLoading = [search, createMutation, updateMutation, deactivateMutation, activateMutation].some(
    (m) => m.isPending,
  ) || entityTypeOptions.isLoading;

  return {
    legalentityList,
    selectedItem,
    isLoading,
    isListLoading: search.isPending,
    loadError: search.isError ? search.error : null,
    searchFilters,
    entityTypeIdOptions: entityTypeOptions.data ?? [],
    page: searchFilters.page,
    size: searchFilters.size,
    totalElements,
    canView,
    canCreate,
    canEdit,
    canDelete,

    selectItem: (item: LegalEntityResponse | null) => setSelectedItem(item),
    setSearchFilters: (next: Partial<LegalEntitySearchFilters>) =>
      setSearchFiltersState((prev) => ({ ...prev, ...next })),
    retry: refetchCurrentPage,

    createLegalEntity: async (data: CreateLegalEntityRequest) => {
      const dto = await createMutation.mutateAsync(data);
      refetchCurrentPage();
      return dto;
    },
    updateLegalEntity: async (id: number, data: UpdateLegalEntityRequest) => {
      const dto = await updateMutation.mutateAsync({ id, req: data });
      refetchCurrentPage();
      return dto;
    },
    deactivateLegalEntity: async (id: number) => {
      const dto = await deactivateMutation.mutateAsync(id);
      refetchCurrentPage();
      return dto;
    },
    activateLegalEntity: async (id: number) => {
      const dto = await activateMutation.mutateAsync(id);
      refetchCurrentPage();
      return dto;
    },
  };
}
