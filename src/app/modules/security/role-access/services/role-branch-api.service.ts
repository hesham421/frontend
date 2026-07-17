import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { BaseApiService } from 'src/app/shared/base/base-api.service';
import { PagedResponse } from 'src/app/shared/models/paged-response.model';
import {
  BranchOptionDto,
  CreateRoleBranchRequest,
  RoleBranchDto,
  RoleBranchSearchRequest,
  UpdateRoleBranchRequest
} from '../models/role-branch.model';

/**
 * API service for SEC_ROLE_BRANCH (API-SEC-036..039). Update/delete use
 * {roleId}/{branchId} — no surrogate PK (composite key), per the Phase 3 handoff.
 */
@Injectable()
export class RoleBranchApiService extends BaseApiService {
  private readonly baseUrl = `${environment.authApiUrl}/api/v1/security/role-branches`;
  private readonly orgBranchesUrl = `${environment.authApiUrl}/api/v1/org/branches`;

  search(request: RoleBranchSearchRequest): Observable<PagedResponse<RoleBranchDto>> {
    return this.doPost<PagedResponse<RoleBranchDto>>(`${this.baseUrl}/search`, request);
  }

  assign(request: CreateRoleBranchRequest): Observable<RoleBranchDto> {
    return this.doPost<RoleBranchDto>(this.baseUrl, request);
  }

  update(roleId: number, branchId: number, request: UpdateRoleBranchRequest): Observable<RoleBranchDto> {
    return this.doPut<RoleBranchDto>(`${this.baseUrl}/${roleId}/${branchId}`, request);
  }

  remove(roleId: number, branchId: number): Observable<void> {
    return this.doDelete<void>(`${this.baseUrl}/${roleId}/${branchId}`);
  }

  /** RULE-SEC-034: same active-branch-only dropdown source as UserProfileApiService. */
  searchActiveBranches(): Observable<PagedResponse<BranchOptionDto>> {
    const request = {
      filters: [{ field: 'isActiveFl', operator: 'EQUALS', value: true }],
      sorts: [{ field: 'nameEn', direction: 'ASC' }],
      page: 0,
      size: 50
    };
    return this.doPost<PagedResponse<BranchOptionDto>>(`${this.orgBranchesUrl}/search`, request);
  }
}
