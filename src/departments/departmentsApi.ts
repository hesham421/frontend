import { http } from '../lib/http/client';
import type { PagedResponse, SearchContractRequest } from '../data/searchContract';

// Real API DTOs (department-management.md) — F2/SCR-ORG-004 (Departments).
//
// branchCode: earlier-session backend FIX confirmed — DepartmentResponse now
// includes it (same as sibling entities' *Fk/*Code pairs). Included here
// normally, not flagged as a gap.
export interface DepartmentResponse {
  id?: number;
  departmentCode?: string;
  nameAr?: string;
  nameEn?: string;
  branchFk?: number;
  branchCode?: string;
  parentDepartmentFk?: number | null;
  nodeTypeId?: string;
  isActive?: boolean;
  notes?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// DRV: the tree endpoint (API-ORG-020) does NOT return DepartmentResponse[] as
// F2's spec guessed — department-management.md documents a distinct, flatter
// `DepartmentTreeNodeResponse` shape: no branchFk/branchCode/parentDepartmentFk/
// departmentCode/audit fields, a `code` field instead of `departmentCode`, and
// a real `children` array of the same shape. Modeled separately here rather
// than reusing DepartmentResponse so the type matches what the backend
// actually sends.
export interface DepartmentTreeNodeResponse {
  id?: number;
  code?: string;
  nameAr?: string;
  nameEn?: string;
  nodeTypeId?: string;
  isActive?: boolean;
  children?: DepartmentTreeNodeResponse[];
}

export interface CreateDepartmentRequest {
  nameAr: string;
  nameEn: string;
  branchFk: number;
  parentDepartmentFk?: number;
  nodeTypeId: string;
  notes?: string;
}

// departmentCode is system-generated (DEP-[BR_CODE]-NNNNN) and branchFk is an
// immutable parent FK — both confirmed absent from DepartmentUpdateRequest
// per department-management.md. Unlike Regions' sibling sub, this update
// request's real fields match the F2 spec's guess exactly — no discrepancy.
export interface UpdateDepartmentRequest {
  nameAr?: string;
  nameEn?: string;
  parentDepartmentFk?: number;
  notes?: string;
}

export type DepartmentSearchContractRequest = SearchContractRequest;

const BASE = '/api/v1/org/departments';

export const departmentsApi = {
  // API-ORG-025
  getById: (id: number, signal?: AbortSignal) => http.get<DepartmentResponse>(`${BASE}/${id}`, { signal }),

  // API-ORG-022 — branchFk immutable, absent from this request shape.
  update: (id: number, req: UpdateDepartmentRequest) => http.put<DepartmentResponse>(`${BASE}/${id}`, req),

  // API-ORG-023 — 409 if dependent records block deactivation (backend-enforced, no client pre-check).
  deactivate: (id: number) => http.put<DepartmentResponse>(`${BASE}/${id}/deactivate`, {}),

  // API-ORG-024
  activate: (id: number) => http.put<DepartmentResponse>(`${BASE}/${id}/activate`, {}),

  // API-ORG-019
  create: (req: CreateDepartmentRequest) => http.post<DepartmentResponse>(BASE, req),

  // API-ORG-021 — POST-as-query; search is a read despite the HTTP verb.
  search: (req: DepartmentSearchContractRequest, signal?: AbortSignal) =>
    http.post<PagedResponse<DepartmentResponse>>(`${BASE}/search`, req, { signal }),

  // API-ORG-020 — branchFk is a required query param (mandatory precondition,
  // SRS B2). DRV: the real query param is `isActiveFl`, not `isActive` as the
  // F2 spec guessed (department-management.md's documented Query Parameters
  // table) — used as documented, same manual-query-string convention as
  // masterLookupsApi.getDetailOptions.
  getTree: (branchFk: number, isActive?: boolean, signal?: AbortSignal) =>
    http.get<DepartmentTreeNodeResponse[]>(
      `${BASE}/tree?branchFk=${branchFk}${isActive != null ? `&isActiveFl=${isActive}` : ''}`,
      { signal },
    ),
};
