import { http } from '@/lib/http/client';
import type { PagedResponse, SearchContractRequest } from '@/data/searchContract';

// Real API DTOs (page-management.md) — F2/SCR-SEC-005. Named pageRegistry
// (not `pages`) to avoid colliding with src/pages/ (route screen views).
export interface PageResponse {
  id?: number;
  pageCode?: string;
  nameAr?: string;
  nameEn?: string;
  route?: string;
  icon?: string;
  module?: string;
  parentId?: number;
  displayOrder?: number;
  active?: boolean;
  description?: string;
  permissionKeys?: Record<string, unknown>;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// pageCode is NOT in this shape — immutable after creation.
export interface UpdatePageRequest {
  nameAr: string;
  nameEn: string;
  route: string;
  icon?: string;
  module?: string;
  parentId?: number;
  displayOrder?: number;
  description?: string;
}

export interface CreatePageRequest {
  pageCode: string;
  nameAr: string;
  nameEn: string;
  route: string;
  icon?: string;
  module?: string;
  parentId?: number;
  displayOrder?: number;
  active?: boolean;
  description?: string;
  // Skips generating specific CRUD permission types (VIEW cannot be
  // suppressed) — available but currently unused by the Shell's form.
  suppressPermissionTypes?: string[];
}

export type PageSearchContractRequest = SearchContractRequest;

const BASE = '/api/pages';

export const pageRegistryApi = {
  // API-SEC-030 — cross-screen page-options resolution (SCR-SEC-003, SCR-SEC-004).
  getById: (id: number, signal?: AbortSignal) => http.get<PageResponse>(`${BASE}/${id}`, { signal }),

  // API-SEC-031
  update: (id: number, req: UpdatePageRequest) => http.put<PageResponse>(`${BASE}/${id}`, req),

  // API-SEC-032
  reactivate: (id: number) => http.put<PageResponse>(`${BASE}/${id}/reactivate`, {}),

  // API-SEC-033 — requires PAGE_DELETE, not PAGE_UPDATE.
  deactivate: (id: number) => http.put<PageResponse>(`${BASE}/${id}/deactivate`, {}),

  // API-SEC-034 — auto-generates 4 CRUD permissions (RULE-SEC-047).
  create: (req: CreatePageRequest) => http.post<PageResponse>(BASE, req),

  // API-SEC-035 — `active` IS a real server-side filter field here (unlike roles search).
  search: (req: PageSearchContractRequest, signal?: AbortSignal) =>
    http.post<PagedResponse<PageResponse>>(`${BASE}/search`, req, { signal }),

  // API-SEC-036 — flat array, no pagination envelope; source for SCR-SEC-003's "add page" picker.
  active: (signal?: AbortSignal) => http.get<PageResponse[]>(`${BASE}/active`, { signal }),
};
