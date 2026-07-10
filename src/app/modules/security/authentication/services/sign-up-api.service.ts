import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { BaseApiService } from 'src/app/shared/base/base-api.service';
import { ActivateAccountRequest, SignupRequest, SignupResponse } from '../models/sign-up.model';

/**
 * API service for self-registration (API-SEC-040/041, public /api/auth/** prefix).
 * AuthController returns raw bodies (not ApiResponse<T>-wrapped) — BaseApiService's
 * unwrapResponse() gracefully no-ops when there's no `data` envelope.
 */
@Injectable()
export class SignUpApiService extends BaseApiService {
  private readonly baseUrl = `${environment.authApiUrl}/api/auth`;

  signup(request: SignupRequest): Observable<SignupResponse> {
    return this.doPost<SignupResponse>(`${this.baseUrl}/signup`, request);
  }

  activate(request: ActivateAccountRequest): Observable<void> {
    return this.doPost<void>(`${this.baseUrl}/signup/activate`, request);
  }
}
