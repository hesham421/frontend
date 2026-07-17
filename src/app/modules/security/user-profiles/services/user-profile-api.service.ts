import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { BaseApiService } from 'src/app/shared/base/base-api.service';
import {
  BranchOptionDto,
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  UserProfileDto,
  UserProfilePagedResponse,
  UserProfileSearchRequest
} from '../models/user-profile.model';
import { PagedResponse } from 'src/app/shared/models/paged-response.model';

/**
 * API service for SEC_USER_PROFILE (API-SEC-032..035).
 */
@Injectable()
export class UserProfileApiService extends BaseApiService {
  private readonly baseUrl = `${environment.authApiUrl}/api/v1/security/user-profiles`;

  /** XM-SEC-001: active branch list, sourced via API-ORG-008 (Organization module search). */
  private readonly orgBranchesUrl = `${environment.authApiUrl}/api/v1/org/branches`;

  search(request: UserProfileSearchRequest): Observable<UserProfilePagedResponse> {
    return this.doPost<UserProfilePagedResponse>(`${this.baseUrl}/search`, request);
  }

  getById(userId: number): Observable<UserProfileDto> {
    return this.doGet<UserProfileDto>(`${this.baseUrl}/${userId}`);
  }

  create(request: CreateUserProfileRequest): Observable<UserProfileDto> {
    return this.doPost<UserProfileDto>(this.baseUrl, request);
  }

  update(userId: number, request: UpdateUserProfileRequest): Observable<UserProfileDto> {
    return this.doPut<UserProfileDto>(`${this.baseUrl}/${userId}`, request);
  }

  /**
   * RULE-SEC-034: branch dropdown must only offer active branches. API-ORG-008 is a POST
   * search endpoint (BaseSearchContractRequest), not a GET-based lookup — the shared
   * ErpLookupFieldComponent/LookupDataService (GET + query params) does not fit this
   * contract, so a one-time bounded page load populates a plain avl-select instead
   * (same technique as pages-registry's loadActivePages()).
   */
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
