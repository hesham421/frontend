import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { BaseApiService } from 'src/app/shared/base/base-api.service';
import { ForgotPasswordRequest, ResetPasswordRequest } from '../models/forgot-password.model';

/**
 * API service for Forgot/Reset Password (API-SEC-042/043, public /api/auth/** prefix).
 */
@Injectable()
export class ForgotPasswordApiService extends BaseApiService {
  private readonly baseUrl = `${environment.authApiUrl}/api/auth`;

  requestReset(request: ForgotPasswordRequest): Observable<void> {
    return this.doPost<void>(`${this.baseUrl}/forgot-password`, request);
  }

  reset(request: ResetPasswordRequest): Observable<void> {
    return this.doPost<void>(`${this.baseUrl}/reset-password`, request);
  }
}
