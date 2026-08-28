import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  userProfilesApi,
  type CreateSecUserProfileRequest,
  type UpdateSecUserProfileRequest,
  type UserProfileSearchContractRequest,
} from './userProfilesApi';

// F2-QUERY blocks API-SEC-037..041 (F2/SCR-SEC-006).

export const userProfileKeys = {
  all: ['user-profiles'] as const,
  detail: (userId: number) => [...userProfileKeys.all, userId] as const,
  lists: () => [...userProfileKeys.all, 'list'] as const,
};

const STALE = 0, GC = 5 * 60_000; // F2-HEADER global caching default for this module

/** API-SEC-037 — Entry-by-PK; only fires once the drawer is opened for a specific user. */
export function useUserProfile(userId: number | undefined) {
  return useQuery({
    queryKey: userProfileKeys.detail(userId!),
    queryFn: ({ signal }) => userProfilesApi.getById(userId!, signal),
    enabled: userId != null,
    staleTime: STALE,
    gcTime: GC,
    retry: false, // a 404-equivalent-empty here is the create-vs-update signal, not a transient failure
  });
}

/** API-SEC-039 — no confirmed screen consumes this list directly; kept for completeness. */
export function useListUserProfiles(params: { page: number; size: number; sort?: string }) {
  return useQuery({
    queryKey: [...userProfileKeys.lists(), params],
    queryFn: ({ signal }) => userProfilesApi.list(params, signal),
    staleTime: STALE,
    gcTime: GC,
  });
}

/** API-SEC-041 — no confirmed screen consumes this directly; kept for completeness. */
export function useSearchUserProfiles() {
  return useMutation({ mutationFn: (req: UserProfileSearchContractRequest) => userProfilesApi.search(req) });
}

export function useCreateUserProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateSecUserProfileRequest) => userProfilesApi.create(req),
    onSuccess: (dto) => {
      if (dto.userIdFk != null) void qc.invalidateQueries({ queryKey: userProfileKeys.detail(dto.userIdFk) });
    },
  });
}

export function useUpdateUserProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, req }: { userId: number; req: UpdateSecUserProfileRequest }) =>
      userProfilesApi.update(userId, req),
    onSuccess: (_dto, { userId }) => void qc.invalidateQueries({ queryKey: userProfileKeys.detail(userId) }),
  });
}

/**
 * F2-FACADE-HOOK — SCR-SEC-006. saveProfile branches to create (API-SEC-040)
 * if no profile exists yet, else update (API-SEC-038) — exposed as ONE
 * operation, since a profile is a separate creatable resource, not
 * auto-created alongside a User (governance note under API-SEC-040).
 */
export function useUserProfileFacade(userId: number | undefined) {
  const profileQuery = useUserProfile(userId);
  const createMutation = useCreateUserProfile();
  const updateMutation = useUpdateUserProfile();

  const isLoading = profileQuery.isLoading || createMutation.isPending || updateMutation.isPending;

  return {
    profile: profileQuery.data ?? null,
    isLoading,
    saveProfile: async (data: UpdateSecUserProfileRequest) => {
      if (userId == null) throw new Error('saveProfile requires a userId');
      if (profileQuery.isLoading) throw new Error('saveProfile: profile lookup still in progress');
      if (profileQuery.isError) throw profileQuery.error;
      const hasProfile = profileQuery.isSuccess && profileQuery.data != null;
      return hasProfile
        ? updateMutation.mutateAsync({ userId, req: data })
        : createMutation.mutateAsync({ userIdFk: userId, ...data });
    },
  };
}
