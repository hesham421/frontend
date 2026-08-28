import { http } from '../lib/http/client';
import type { PagedResponse, SearchContractRequest } from '../data/searchContract';
import type { DataAccessLevel } from './dataAccessLevel';

// Real API DTOs (security-datascope-role-branches.md) — F2/SCR-SEC-007.
// Composite key (roleIdFk, branchIdFk) — no single id exists to key on.
export interface SecRoleBranchDto {
  roleIdFk?: number;
  branchIdFk?: number;
  dataAccessLevel?: DataAccessLevel;
  isActiveFl?: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface UpdateSecRoleBranchRequest {
  dataAccessLevel: DataAccessLevel;
}

export interface CreateSecRoleBranchRequest {
  roleIdFk: number;
  branchIdFk: number;
  dataAccessLevel: DataAccessLevel;
}

export type RoleBranchSearchContractRequest = SearchContractRequest;

const BASE = '/api/v1/security/role-branches';

export const roleDataScopeApi = {
  // API-SEC-042
  getById: (roleId: number, branchId: number, signal?: AbortSignal) =>
    http.get<SecRoleBranchDto>(`${BASE}/${roleId}/${branchId}`, { signal }),

  // API-SEC-043
  update: (roleId: number, branchId: number, req: UpdateSecRoleBranchRequest) =>
    http.put<SecRoleBranchDto>(`${BASE}/${roleId}/${branchId}`, req),

  // API-SEC-044 — "conditional delete button" in DataScopeDrawer.
  remove: (roleId: number, branchId: number) => http.del<void>(`${BASE}/${roleId}/${branchId}`),

  // API-SEC-045 — not composed by this screen's Facade; kept for completeness.
  list: (params: { page: number; size: number; sort?: string }, signal?: AbortSignal) => {
    const q = new URLSearchParams({ page: String(params.page), size: String(params.size) });
    if (params.sort) q.set('sort', params.sort);
    return http.get<PagedResponse<SecRoleBranchDto>>(`${BASE}?${q.toString()}`, { signal });
  },

  // API-SEC-046
  create: (req: CreateSecRoleBranchRequest) => http.post<SecRoleBranchDto>(BASE, req),

  // API-SEC-047 — not composed by this screen's Facade; kept for completeness.
  search: (req: RoleBranchSearchContractRequest, signal?: AbortSignal) =>
    http.post<PagedResponse<SecRoleBranchDto>>(`${BASE}/search`, req, { signal }),
};
