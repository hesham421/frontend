import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, finalize, tap } from 'rxjs';

import { ErpErrorMapperService } from 'src/app/shared/services/erp-error-mapper.service';
import { extractBackendErrorCode } from 'src/app/shared/utils/backend-error-message';

import { ForgotPasswordApiService } from '../services/forgot-password-api.service';

/**
 * Backs SCR-SEC-009 (Forgot/Reset Password) — 2-step state: request form,
 * then reset form (token from URL).
 *
 * RULE-SEC-038: the request step must show the SAME generic success message
 * regardless of whether the email exists — requestSuccess is set on any
 * non-error HTTP response (the backend itself always returns 200 for this
 * reason; only a genuine transport/server failure sets requestError).
 */
@Injectable() // NOT providedIn: 'root' — component-scoped
export class ForgotPasswordFacade {
  private readonly apiService = inject(ForgotPasswordApiService);
  private readonly errorMapper = inject(ErpErrorMapperService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly requestingSignal = signal<boolean>(false);
  private readonly requestErrorSignal = signal<string | null>(null);
  private readonly requestSuccessSignal = signal<boolean>(false);

  private readonly resettingSignal = signal<boolean>(false);
  private readonly resetErrorSignal = signal<string | null>(null);
  private readonly resetSuccessSignal = signal<boolean>(false);

  readonly requesting = computed(() => this.requestingSignal());
  readonly requestError = computed(() => this.requestErrorSignal());
  readonly requestSuccess = computed(() => this.requestSuccessSignal());

  readonly resetting = computed(() => this.resettingSignal());
  readonly resetError = computed(() => this.resetErrorSignal());
  readonly resetSuccess = computed(() => this.resetSuccessSignal());

  requestReset(email: string): void {
    this.requestingSignal.set(true);
    this.requestErrorSignal.set(null);

    this.apiService
      .requestReset({ email })
      .pipe(
        tap(() => this.requestSuccessSignal.set(true)),
        catchError((error) => {
          this.handleError(error, this.requestErrorSignal);
          return EMPTY;
        }),
        finalize(() => this.requestingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  reset(token: string, newPassword: string, onSuccess?: () => void): void {
    this.resettingSignal.set(true);
    this.resetErrorSignal.set(null);

    this.apiService
      .reset({ token, newPassword })
      .pipe(
        tap(() => {
          this.resetSuccessSignal.set(true);
          onSuccess?.();
        }),
        catchError((error) => {
          this.handleError(error, this.resetErrorSignal);
          return EMPTY;
        }),
        finalize(() => this.resettingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  private handleError(error: unknown, errorSignal: ReturnType<typeof signal<string | null>>): void {
    const backendCode = extractBackendErrorCode(error);
    const mappedKey = backendCode && this.errorMapper.hasMapping(backendCode) ? this.errorMapper.mapError(backendCode).translationKey : null;
    errorSignal.set(mappedKey || 'ERRORS.OPERATION_FAILED');
  }
}
