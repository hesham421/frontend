import { http } from '@/lib/http/client';
import type { PagedResponse, SearchContractRequest } from '@/data/searchContract';

// Real API DTOs (cost-center-management.md) — F2/SCR-ORG-005 (Cost Centers).
//
// branchCode: earlier-session backend FIX confirmed — CostCenterResponse now
// includes it (CostCenterMapper fix, same as DepartmentMapper's sibling fix).
// Included here normally, not flagged as a gap.
export interface CostCenterResponse {
  id?: number;
  costCenterCode?: string;
  nameAr?: string;
  nameEn?: string;
  branchFk?: number;
  branchCode?: string;
  parentCostCenterFk?: number | null;
  nodeTypeId?: string;
  costCenterTypeId?: string;
  isActive?: boolean;
  notes?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// DRV: the tree endpoint (API-ORG-027) does NOT return CostCenterResponse[] as
// F2's spec guessed — cost-center-management.md documents a distinct, flatter
// `CostCenterTreeNodeResponse` shape: no branchFk/branchCode/parentCostCenterFk/
// costCenterCode/costCenterTypeId/audit fields, a `code` field instead of
// `costCenterCode`, and a real `children` array of the same shape. Same
// discovery as Departments' DepartmentTreeNodeResponse — modeled separately
// here rather than reusing CostCenterResponse so the type matches what the
// backend actually sends.
export interface CostCenterTreeNodeResponse {
  id?: number;
  code?: string;
  nameAr?: string;
  nameEn?: string;
  nodeTypeId?: string;
  isActive?: boolean;
  children?: CostCenterTreeNodeResponse[];
}

export interface CreateCostCenterRequest {
  nameAr: string;
  nameEn: string;
  branchFk: number;
  parentCostCenterFk?: number;
  nodeTypeId: string;
  costCenterTypeId: string;
  notes?: string;
}

// costCenterCode is system-generated (CC-[BR_CODE]-NNNNN) and branchFk/nodeTypeId
// are immutable after save — both confirmed absent from
// CostCenterUpdateRequest per cost-center-management.md. Same as Departments'
// sibling sub, this update request's real fields match the F2 spec's guess
// exactly — no discrepancy.
export interface UpdateCostCenterRequest {
  nameAr?: string;
  nameEn?: string;
  parentCostCenterFk?: number;
  costCenterTypeId?: string;
  notes?: string;
}

export type CostCenterSearchContractRequest = SearchContractRequest;

const BASE = '/api/v1/org/cost-centers';

export const costCentersApi = {
  // API-ORG-032
  getById: (id: number, signal?: AbortSignal) => http.get<CostCenterResponse>(`${BASE}/${id}`, { signal }),

  // API-ORG-029 — branchFk/nodeTypeId immutable, absent from this request shape.
  update: (id: number, req: UpdateCostCenterRequest) => http.put<CostCenterResponse>(`${BASE}/${id}`, req),

  // API-ORG-030 — 409 if dependent records block deactivation (backend-enforced, no client pre-check).
  deactivate: (id: number) => http.put<CostCenterResponse>(`${BASE}/${id}/deactivate`, {}),

  // API-ORG-031
  activate: (id: number) => http.put<CostCenterResponse>(`${BASE}/${id}/activate`, {}),

  // API-ORG-026
  create: (req: CreateCostCenterRequest) => http.post<CostCenterResponse>(BASE, req),

  // API-ORG-028 — POST-as-query; search is a read despite the HTTP verb.
  search: (req: CostCenterSearchContractRequest, signal?: AbortSignal) =>
    http.post<PagedResponse<CostCenterResponse>>(`${BASE}/search`, req, { signal }),

  // API-ORG-027 — branchFk is a required query param (mandatory precondition,
  // SRS B2). DRV: verified the real query param is `isActiveFl`, not
  // `isActive` as the F2 spec guessed (cost-center-management.md's documented
  // Query Parameters table) — same convention Departments already found;
  // confirmed independently here, not assumed. Same manual-query-string
  // convention as departmentsApi.getTree/masterLookupsApi.getDetailOptions.
  getTree: (branchFk: number, isActive?: boolean, signal?: AbortSignal) =>
    http.get<CostCenterTreeNodeResponse[]>(
      `${BASE}/tree?branchFk=${branchFk}${isActive != null ? `&isActiveFl=${isActive}` : ''}`,
      { signal },
    ),
};
