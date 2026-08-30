import { http } from '@/lib/http/client';
import type { PagedResponse, SearchContractRequest } from '@/data/searchContract';

// Real API DTOs (profit-center-management.md) — F2/SCR-ORG-006 (Profit Centers).
export interface ProfitCenterResponse {
  id?: number;
  profitCenterCode?: string;
  nameAr?: string;
  nameEn?: string;
  legalEntityFk?: number;
  legalEntityCode?: string;
  legalEntityNameEn?: string;
  isActive?: boolean;
  notes?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreateProfitCenterRequest {
  nameAr: string;
  nameEn: string;
  legalEntityFk: number;
  notes?: string;
}

// legalEntityFk is an immutable parent FK and profitCenterCode is
// system-generated (PC-[LE_CODE]-NNNNN) — both confirmed absent from
// ProfitCenterUpdateRequest (profit-center-management.md).
export interface UpdateProfitCenterRequest {
  nameAr?: string;
  nameEn?: string;
  notes?: string;
}

export type ProfitCenterSearchContractRequest = SearchContractRequest;

const BASE = '/api/v1/org/profit-centers';

export const profitCentersApi = {
  // API-ORG-038
  getById: (id: number, signal?: AbortSignal) => http.get<ProfitCenterResponse>(`${BASE}/${id}`, { signal }),

  // API-ORG-035 — legalEntityFk immutable, absent from this request shape.
  update: (id: number, req: UpdateProfitCenterRequest) => http.put<ProfitCenterResponse>(`${BASE}/${id}`, req),

  // API-ORG-036 — 409 if dependent records block deactivation (backend-enforced, no client pre-check).
  deactivate: (id: number) => http.put<ProfitCenterResponse>(`${BASE}/${id}/deactivate`, {}),

  // API-ORG-037
  activate: (id: number) => http.put<ProfitCenterResponse>(`${BASE}/${id}/activate`, {}),

  // API-ORG-033
  create: (req: CreateProfitCenterRequest) => http.post<ProfitCenterResponse>(BASE, req),

  // API-ORG-034 — POST-as-query; search is a read despite the HTTP verb.
  search: (req: ProfitCenterSearchContractRequest, signal?: AbortSignal) =>
    http.post<PagedResponse<ProfitCenterResponse>>(`${BASE}/search`, req, { signal }),
};
