import { http } from '@/lib/http/client';
import type { PagedResponse, SearchContractRequest } from '@/data/searchContract';

// Real API DTOs (role-access-control.md) — F2/SCR-SEC-003 (RBAC), plus the
// search read SCR-SEC-002's roles multi-select seeded (src/roles/hooks.ts'
// useRolesOptions).
export interface RoleDto {
  id?: number;
  roleCode?: string;
  roleName?: string;
  description?: string;
  active?: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// roleCode is immutable — confirmed absent from this request shape.
export interface UpdateRoleRequest {
  roleName: string;
  description?: string;
  active?: boolean;
}

export interface CreateRoleRequest {
  roleCode: string;
  roleName: string;
  description?: string;
  active?: boolean;
}

export interface PageAssignmentDto {
  pageCode: string;
  permissions: string[];
}

export interface PageAssignmentResponse {
  pageCode?: string;
  pageName?: string;
  pageNameAr?: string;
  permissions?: string[];
}

export interface RolePagesMatrixResponse {
  roleId?: number;
  roleName?: string;
  assignments?: PageAssignmentResponse[];
}

export interface SyncRolePagesRequest {
  assignments: PageAssignmentDto[];
}

export interface AddPageToRoleRequest {
  pageCode: string;
  permissions: string[];
}

export interface CopyPermissionsResponse {
  roleId?: number;
  roleName?: string;
  copiedFrom?: { roleId?: number; roleName?: string };
  assignments?: PageAssignmentResponse[];
}

export type RoleSearchContractRequest = SearchContractRequest;

const BASE = '/api/roles';

export const rolesApi = {
  // API-SEC-016 — used by cross-screen role-options resolution (SCR-SEC-002, SCR-SEC-007), not this screen's own list.
  getById: (roleId: number, signal?: AbortSignal) => http.get<RoleDto>(`${BASE}/${roleId}`, { signal }),

  // API-SEC-017 — roleCode immutable.
  update: (roleId: number, req: UpdateRoleRequest) => http.put<RoleDto>(`${BASE}/${roleId}`, req),

  // API-SEC-018 — 409 if role has user assignments.
  remove: (roleId: number) => http.del<void>(`${BASE}/${roleId}`),

  // API-SEC-019 — VIEW is implicit, never in the returned array.
  getPages: (roleId: number, signal?: AbortSignal) =>
    http.get<RolePagesMatrixResponse>(`${BASE}/${roleId}/pages`, { signal }),

  // API-SEC-020 — "sync all": full replace, VIEW auto-added, empty array removes all pages.
  syncPages: (roleId: number, req: SyncRolePagesRequest) =>
    http.put<RolePagesMatrixResponse>(`${BASE}/${roleId}/pages`, req),

  // API-SEC-021
  addPage: (roleId: number, req: AddPageToRoleRequest) =>
    http.post<PageAssignmentResponse>(`${BASE}/${roleId}/pages`, req),

  // API-SEC-050 — removes VIEW + all CRUD permissions for that page entirely.
  removePage: (roleId: number, pageCode: string) => http.del<void>(`${BASE}/${roleId}/pages/${pageCode}`),

  // API-SEC-022 / API-SEC-023 — two distinct calls, never a boolean toggle.
  deactivate: (roleId: number) => http.put<RoleDto>(`${BASE}/${roleId}/deactivate`, {}),
  activate: (roleId: number) => http.put<RoleDto>(`${BASE}/${roleId}/activate`, {}),

  // API-SEC-024
  create: (req: CreateRoleRequest) => http.post<RoleDto>(BASE, req),

  // API-SEC-025 — only page-scoped permissions are copied; system-level (page-less) permissions on the target role are untouched.
  copyFrom: (roleId: number, sourceRoleId: number) =>
    http.post<CopyPermissionsResponse>(`${BASE}/${roleId}/copy-from/${sourceRoleId}`, {}),

  // API-SEC-026 — Allowed filter fields: roleName. Allowed sort fields: id, roleName.
  search: (req: RoleSearchContractRequest, signal?: AbortSignal) =>
    http.post<PagedResponse<RoleDto>>(`${BASE}/search`, req, { signal }),
};
