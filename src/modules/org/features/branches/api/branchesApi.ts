import { http } from '@/lib/http/client';
import type { PagedResponse, SearchContractRequest } from '@/data/searchContract';

// Real API DTOs (branch-management.md) — F2/SCR-ORG-002 (Branches).
export interface BranchResponse {
  id?: number;
  branchCode?: string;
  nameAr?: string;
  nameEn?: string;
  legalEntityFk?: number;
  legalEntityCode?: string;
  legalEntityNameEn?: string;
  branchTypeId?: string;
  isActive?: boolean;
  notes?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreateBranchRequest {
  nameAr: string;
  nameEn: string;
  legalEntityFk: number;
  branchTypeId: string;
  notes?: string;
}

// branchCode is system-generated (BR-[LE_CODE]-NNNNN) and legalEntityFk is an
// immutable parent FK — both confirmed absent from BranchUpdateRequest.
export interface UpdateBranchRequest {
  nameAr?: string;
  nameEn?: string;
  branchTypeId?: string;
  notes?: string;
}

export type BranchSearchContractRequest = SearchContractRequest;

const BASE = '/api/v1/org/branches';

export const branchesApi = {
  // API-ORG-012
  getById: (id: number, signal?: AbortSignal) => http.get<BranchResponse>(`${BASE}/${id}`, { signal }),

  // API-ORG-009 — legalEntityFk immutable, absent from this request shape.
  update: (id: number, req: UpdateBranchRequest) => http.put<BranchResponse>(`${BASE}/${id}`, req),

  // API-ORG-010 — 409 if dependent records block deactivation (RULE-ORG-003/004/005, backend-enforced).
  deactivate: (id: number) => http.put<BranchResponse>(`${BASE}/${id}/deactivate`, {}),

  // API-ORG-011
  activate: (id: number) => http.put<BranchResponse>(`${BASE}/${id}/activate`, {}),

  // API-ORG-007
  create: (req: CreateBranchRequest) => http.post<BranchResponse>(BASE, req),

  // API-ORG-008 — POST-as-query; search is a read despite the HTTP verb.
  search: (req: BranchSearchContractRequest, signal?: AbortSignal) =>
    http.post<PagedResponse<BranchResponse>>(`${BASE}/search`, req, { signal }),
};
