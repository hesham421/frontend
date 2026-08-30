import { http } from '@/lib/http/client';
import type { PagedResponse, SearchContractRequest } from '@/data/searchContract';

// Real API DTOs (legal-entity-management.md) — F2/SCR-ORG-001 (Legal Entities).
export interface LegalEntityResponse {
  id?: number;
  legalEntityCode?: string;
  nameAr?: string;
  nameEn?: string;
  entityTypeId?: string;
  isActive?: boolean;
  notes?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// legalEntityCode is system-generated (LE-NNNNN) — confirmed absent from both request shapes.
export interface CreateLegalEntityRequest {
  nameAr: string;
  nameEn: string;
  entityTypeId: string;
  notes?: string;
}

export interface UpdateLegalEntityRequest {
  nameAr?: string;
  nameEn?: string;
  entityTypeId?: string;
  notes?: string;
}

export type LegalEntitySearchContractRequest = SearchContractRequest;

const BASE = '/api/v1/org/legal-entities';

export const legalEntitiesApi = {
  // API-ORG-006
  getById: (id: number, signal?: AbortSignal) => http.get<LegalEntityResponse>(`${BASE}/${id}`, { signal }),

  // API-ORG-003
  update: (id: number, req: UpdateLegalEntityRequest) => http.put<LegalEntityResponse>(`${BASE}/${id}`, req),

  // API-ORG-004 — 409 if dependent records block deactivation (RULE-ORG-001/002, backend-enforced).
  deactivate: (id: number) => http.put<LegalEntityResponse>(`${BASE}/${id}/deactivate`, {}),

  // API-ORG-005
  activate: (id: number) => http.put<LegalEntityResponse>(`${BASE}/${id}/activate`, {}),

  // API-ORG-001
  create: (req: CreateLegalEntityRequest) => http.post<LegalEntityResponse>(BASE, req),

  // API-ORG-002 — POST-as-query; search is a read despite the HTTP verb.
  search: (req: LegalEntitySearchContractRequest, signal?: AbortSignal) =>
    http.post<PagedResponse<LegalEntityResponse>>(`${BASE}/search`, req, { signal }),
};
