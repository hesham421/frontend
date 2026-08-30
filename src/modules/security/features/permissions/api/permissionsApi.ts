import { http } from '@/lib/http/client';
import type { PagedResponse, SearchContractRequest } from '@/data/searchContract';

// Real API DTOs (permission-management.md) — F2/SCR-SEC-004.
export interface PermissionDto {
  id?: number;
  name?: string;
  description?: string;
  // null for system (page-less) permissions.
  pageId?: number;
  pageCode?: string;
  permissionType?: string;
}

// Only `name` is writable via update — permissionType/pageId are NOT
// updatable via this endpoint (confirmed): edit-dialog fields beyond `name`
// must be rendered read-only, not silently allowed to submit.
export interface UpdatePermissionRequest {
  name: string;
}

export interface CreatePermissionRequest {
  name: string;
  pageId?: number;
  permissionType?: string;
}

export type PermissionSearchContractRequest = SearchContractRequest;

const BASE = '/api/permissions';

export const permissionsApi = {
  // API-SEC-027
  update: (id: number, req: UpdatePermissionRequest) => http.put<PermissionDto>(`${BASE}/${id}`, req),

  // API-SEC-028
  create: (req: CreatePermissionRequest) => http.post<PermissionDto>(BASE, req),

  // API-SEC-029 — allowed filter fields: name, module (module is the indirect join-filter via page).
  search: (req: PermissionSearchContractRequest, signal?: AbortSignal) =>
    http.post<PagedResponse<PermissionDto>>(`${BASE}/search`, req, { signal }),
};
