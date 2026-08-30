import { http } from '../lib/http/client';
import type { PagedResponse, SearchContractRequest } from '../data/searchContract';

// Real API DTOs (region-management.md) — F2/SCR-ORG-003 (Regions).
//
// regionTypeIdFk: real FK to ORG_REGION_TYPE (ENTITY-ORG-008), resolved via
// GET /api/v1/org/regions/region-types (added to close FINDING-2/OQ-ORG-002 —
// see useRegionTypeOptions in hooks.ts).
export interface RegionResponse {
  id?: number;
  regionCode?: string;
  nameAr?: string;
  nameEn?: string;
  legalEntityFk?: number;
  legalEntityCode?: string;
  regionTypeIdFk?: number | null;
  regionTypeNameEn?: string;
  isActive?: boolean;
  notes?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreateRegionRequest {
  nameAr: string;
  nameEn: string;
  legalEntityFk: number;
  regionTypeIdFk: number;
  notes?: string;
}

// regionCode is system-generated (RG-[LE_CODE]-NNNNN) and legalEntityFk/
// regionTypeIdFk are absent from RegionUpdateRequest per region-management.md
// (regionTypeIdFk is also DEFERRED — no picker to change it from anyway).
export interface UpdateRegionRequest {
  nameAr?: string;
  nameEn?: string;
  notes?: string;
}

export type RegionSearchContractRequest = SearchContractRequest;

export interface RegionTypeResponse {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
}

const BASE = '/api/v1/org/regions';

export const regionsApi = {
  // API-ORG-018
  getById: (id: number, signal?: AbortSignal) => http.get<RegionResponse>(`${BASE}/${id}`, { signal }),

  // Lists active region types for the create/edit form's picker.
  getRegionTypes: (signal?: AbortSignal) =>
    http.get<RegionTypeResponse[]>(`${BASE}/region-types`, { signal }),

  // API-ORG-015 — legalEntityFk/regionTypeIdFk absent from this request shape.
  update: (id: number, req: UpdateRegionRequest) => http.put<RegionResponse>(`${BASE}/${id}`, req),

  // API-ORG-016 — 409 if dependent records block deactivation (RULE-ORG-006/017, backend-enforced).
  deactivate: (id: number) => http.put<RegionResponse>(`${BASE}/${id}/deactivate`, {}),

  // API-ORG-017
  activate: (id: number) => http.put<RegionResponse>(`${BASE}/${id}/activate`, {}),

  // API-ORG-013
  create: (req: CreateRegionRequest) => http.post<RegionResponse>(BASE, req),

  // API-ORG-014 — POST-as-query; search is a read despite the HTTP verb.
  search: (req: RegionSearchContractRequest, signal?: AbortSignal) =>
    http.post<PagedResponse<RegionResponse>>(`${BASE}/search`, req, { signal }),
};
