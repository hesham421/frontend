import { http } from '@/lib/http/client';
import type { PagedResponse, SearchContractRequest } from '@/data/searchContract';

// Real API DTOs (location-site-management.md) — F2/SCR-ORG-007 (Location Sites).
export interface LocationSiteResponse {
  id?: number;
  locationSiteCode?: string;
  nameAr?: string;
  nameEn?: string;
  branchFk?: number;
  branchCode?: string;
  branchNameEn?: string;
  siteTypeId?: string;
  isActive?: boolean;
  notes?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreateLocationSiteRequest {
  branchFk: number;
  nameAr: string;
  nameEn: string;
  siteTypeId: string;
  notes?: string;
}

// locationSiteCode is system-generated (LS-[BR_CODE]-NNNNN) and branchFk is an
// immutable parent FK — both confirmed absent from LocationSiteUpdateRequest.
export interface UpdateLocationSiteRequest {
  nameAr?: string;
  nameEn?: string;
  siteTypeId?: string;
  notes?: string;
}

export type LocationSiteSearchContractRequest = SearchContractRequest;

const BASE = '/api/v1/org/location-sites';

export const locationSitesApi = {
  // API-ORG-044
  getById: (id: number, signal?: AbortSignal) => http.get<LocationSiteResponse>(`${BASE}/${id}`, { signal }),

  // API-ORG-041 — branchFk immutable, absent from this request shape.
  update: (id: number, req: UpdateLocationSiteRequest) => http.put<LocationSiteResponse>(`${BASE}/${id}`, req),

  // API-ORG-042 — 409 if dependent records block deactivation (backend-enforced, no client pre-check).
  deactivate: (id: number) => http.put<LocationSiteResponse>(`${BASE}/${id}/deactivate`, {}),

  // API-ORG-043
  activate: (id: number) => http.put<LocationSiteResponse>(`${BASE}/${id}/activate`, {}),

  // API-ORG-039
  create: (req: CreateLocationSiteRequest) => http.post<LocationSiteResponse>(BASE, req),

  // API-ORG-040 — POST-as-query; search is a read despite the HTTP verb.
  search: (req: LocationSiteSearchContractRequest, signal?: AbortSignal) =>
    http.post<PagedResponse<LocationSiteResponse>>(`${BASE}/search`, req, { signal }),
};
