import { http } from '../lib/http/client';
import type { PagedResponse, SearchContractRequest } from '../data/searchContract';

// Real API DTOs (user-management.md) — F2/SCR-SEC-002. Field names/optionality
// mirror the backend response exactly (R.1.7); kept local to this module
// rather than imported from stores/useSecurityStore.ts, which is
// prototype-only zustand state slated for replacement (AD-4/AD-7, same
// pattern as src/auth/authApi.ts).
export interface UserDto {
  id?: number;
  username?: string;
  email?: string;
  enabled?: boolean;
  roles?: string[];
  permissions?: string[];
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// CreateUserRequest has no email/roleNames/enabled (F1-MODEL ENTITY-SEC-001
// correction #6) — roles are assigned in a separate follow-up call, see
// useUserManagementFacade.createUser.
export interface CreateUserRequest {
  username: string;
  password: string;
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  enabled?: boolean;
  roleNames?: string[];
}

export interface AssignRolesRequest {
  roleNames: string[];
}

export type UserSearchContractRequest = SearchContractRequest;

const BASE = '/api/users';

export const usersApi = {
  // API-SEC-013 — plain paginated list, no filter support. This screen's
  // search bar uses usersApi.search (API-SEC-015) instead; kept only as the
  // documented fallback endpoint.
  list: (params: { page: number; size: number; sort?: string }, signal?: AbortSignal) => {
    const q = new URLSearchParams({ page: String(params.page), size: String(params.size) });
    if (params.sort) q.set('sort', params.sort);
    return http.get<PagedResponse<UserDto>>(`${BASE}?${q.toString()}`, { signal });
  },

  // API-SEC-015 — POST-as-query (real endpoint is POST, not GET+query params).
  search: (req: UserSearchContractRequest, signal?: AbortSignal) =>
    http.post<PagedResponse<UserDto>>(`${BASE}/search`, req, { signal }),

  // API-SEC-014
  create: (req: CreateUserRequest) => http.post<UserDto>(BASE, req),

  // API-SEC-009
  update: (userId: number, req: UpdateUserRequest) => http.put<UserDto>(`${BASE}/${userId}`, req),

  // API-SEC-010
  remove: (userId: number) => http.del<void>(`${BASE}/${userId}`),

  // API-SEC-011
  getRoles: (userId: number, signal?: AbortSignal) => http.get<string[]>(`${BASE}/${userId}/roles`, { signal }),

  // API-SEC-012 — full replace, requires USER_MANAGE_ROLES permission
  assignRoles: (userId: number, req: AssignRolesRequest) => http.put<UserDto>(`${BASE}/${userId}/roles`, req),
};
