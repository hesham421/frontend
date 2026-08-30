import { http } from '@/lib/http/client';
import type { PagedResponse, SearchContractRequest } from '@/data/searchContract';

// Real API DTOs — governance/modules/MASTERDATA/api-docs/index.md +
// endpoints/master-lookup-management.md + endpoints/lookup-consumption.md.

export interface MasterLookupDto {
  id?: number;
  lookupKey?: string;
  lookupName?: string;
  lookupNameEn?: string;
  description?: string;
  isActive?: boolean;
  detailCount?: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// lookupKey is CREATE-only and immutable — absent from the update request shape.
export interface MasterLookupCreateRequest {
  lookupKey: string;
  lookupName: string;
  lookupNameEn?: string;
  description?: string;
  isActive?: boolean;
}

export interface MasterLookupUpdateRequest {
  lookupName: string;
  lookupNameEn?: string;
  description?: string;
}

export interface ToggleActiveRequest {
  active: boolean;
}

export interface MasterLookupUsageResponse {
  masterLookupId?: number;
  lookupKey?: string;
  totalDetails?: number;
  activeDetails?: number;
  canDelete?: boolean;
  canDeactivate?: boolean;
}

export interface LookupDetailDto {
  id?: number;
  masterLookupId?: number;
  masterLookupKey?: string;
  masterLookupName?: string;
  code?: string;
  nameAr?: string;
  nameEn?: string;
  extraValue?: string;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// masterLookupId + code are CREATE-only and immutable — absent from the update request shape.
export interface LookupDetailCreateRequest {
  masterLookupId: number;
  code: string;
  nameAr: string;
  nameEn?: string;
  extraValue?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface LookupDetailUpdateRequest {
  nameAr: string;
  nameEn?: string;
  extraValue?: string;
  sortOrder?: number;
}

export interface LookupDetailUsageResponse {
  id?: number;
  code?: string;
  totalReferencesCount?: number;
  canBeDeleted?: boolean;
  reason?: string;
}

export interface LookupDetailOptionResponse {
  id?: number;
  code?: string;
  nameAr?: string;
  nameEn?: string;
  extraValue?: string;
  sortOrder?: number;
}

export interface LookupValueResponse {
  code?: string;
  label?: string;
  labelEn?: string;
  sortOrder?: number;
}

export type MasterLookupSearchContractRequest = SearchContractRequest;
export type LookupDetailSearchContractRequest = SearchContractRequest;

const BASE = '/api/masterdata/master-lookups';

export const masterLookupsApi = {
  getById: (id: number, signal?: AbortSignal) => http.get<MasterLookupDto>(`${BASE}/${id}`, { signal }),
  create: (req: MasterLookupCreateRequest) => http.post<MasterLookupDto>(BASE, req),
  update: (id: number, req: MasterLookupUpdateRequest) => http.put<MasterLookupDto>(`${BASE}/${id}`, req),
  remove: (id: number) => http.del<void>(`${BASE}/${id}`),
  toggleActive: (id: number, req: ToggleActiveRequest) =>
    http.put<MasterLookupDto>(`${BASE}/${id}/toggle-active`, req),
  search: (req: MasterLookupSearchContractRequest, signal?: AbortSignal) =>
    http.post<PagedResponse<MasterLookupDto>>(`${BASE}/search`, req, { signal }),
  getUsage: (id: number, signal?: AbortSignal) =>
    http.get<MasterLookupUsageResponse>(`${BASE}/${id}/usage`, { signal }),

  getDetailById: (id: number, signal?: AbortSignal) => http.get<LookupDetailDto>(`${BASE}/details/${id}`, { signal }),
  createDetail: (req: LookupDetailCreateRequest) => http.post<LookupDetailDto>(`${BASE}/details`, req),
  updateDetail: (id: number, req: LookupDetailUpdateRequest) =>
    http.put<LookupDetailDto>(`${BASE}/details/${id}`, req),
  removeDetail: (id: number) => http.del<void>(`${BASE}/details/${id}`),
  toggleDetailActive: (id: number, req: ToggleActiveRequest) =>
    http.put<LookupDetailDto>(`${BASE}/details/${id}/toggle-active`, req),
  searchDetails: (req: LookupDetailSearchContractRequest, signal?: AbortSignal) =>
    http.post<PagedResponse<LookupDetailDto>>(`${BASE}/details/search`, req, { signal }),
  getDetailUsage: (id: number, signal?: AbortSignal) =>
    http.get<LookupDetailUsageResponse>(`${BASE}/details/${id}/usage`, { signal }),
  // Dropdown-ready options for a lookup key, e.g. COLOR, UOM, COUNTRY.
  getDetailOptions: (lookupKey: string, active?: boolean, signal?: AbortSignal) =>
    http.get<LookupDetailOptionResponse[]>(
      `${BASE}/details/options/${lookupKey}${active != null ? `?active=${active}` : ''}`,
      { signal },
    ),
};

// Separate controller (GET /api/lookups/{lookupCode}) — read-only lookup
// values for use by any module's dropdown, not this screen's own admin CRUD.
export const lookupConsumptionApi = {
  getValues: (lookupCode: string, signal?: AbortSignal) =>
    http.get<LookupValueResponse[]>(`/api/lookups/${lookupCode}`, { signal }),
};
