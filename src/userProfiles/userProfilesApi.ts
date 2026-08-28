import { http } from '../lib/http/client';
import type { PagedResponse, SearchContractRequest } from '../data/searchContract';

// Real API DTOs (security-datascope-user-profiles.md) — F2/SCR-SEC-006.
export interface SecUserProfileDto {
  userIdFk?: number;
  branchIdFk?: number;
  fullNameAr?: string;
  fullNameEn?: string;
  preferredLang?: string;
  employeeIdFk?: number;
  isActiveFl?: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface UpdateSecUserProfileRequest {
  branchIdFk: number; // RULE-SEC-034
  fullNameAr?: string;
  fullNameEn?: string;
  preferredLang?: string;
  employeeIdFk?: number;
}

// A profile is a separate creatable resource, not auto-created alongside a
// User (POST /api/users has no profile fields at all).
export interface CreateSecUserProfileRequest extends UpdateSecUserProfileRequest {
  userIdFk: number;
}

export type UserProfileSearchContractRequest = SearchContractRequest;

const BASE = '/api/v1/security/user-profiles';

export const userProfilesApi = {
  // API-SEC-037
  getById: (userId: number, signal?: AbortSignal) => http.get<SecUserProfileDto>(`${BASE}/${userId}`, { signal }),

  // API-SEC-038
  update: (userId: number, req: UpdateSecUserProfileRequest) => http.put<SecUserProfileDto>(`${BASE}/${userId}`, req),

  // API-SEC-039 — no confirmed screen consumes this list directly; kept for completeness.
  list: (params: { page: number; size: number; sort?: string }, signal?: AbortSignal) => {
    const q = new URLSearchParams({ page: String(params.page), size: String(params.size) });
    if (params.sort) q.set('sort', params.sort);
    return http.get<PagedResponse<SecUserProfileDto>>(`${BASE}?${q.toString()}`, { signal });
  },

  // API-SEC-040
  create: (req: CreateSecUserProfileRequest) => http.post<SecUserProfileDto>(BASE, req),

  // API-SEC-041 — no confirmed screen consumes this directly; kept for completeness.
  search: (req: UserProfileSearchContractRequest, signal?: AbortSignal) =>
    http.post<PagedResponse<SecUserProfileDto>>(`${BASE}/search`, req, { signal }),
};
