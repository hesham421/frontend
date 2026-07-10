import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, finalize, tap } from 'rxjs';

import { ErpErrorMapperService } from 'src/app/shared/services/erp-error-mapper.service';
import { extractBackendErrorCode } from 'src/app/shared/utils/backend-error-message';

import { SignUpApiService } from '../services/sign-up-api.service';
import { SignupRequest, SignupResponse } from '../models/sign-up.model';

/**
 * Backs SCR-SEC-008 (Sign Up). Owns signup form state and post-submit
 * activation-link state (ONE route, two states — same convention as
 * ForgotPasswordFacade/PasswordRecoveryComponent's request/reset steps).
 */
@Injectable() // NOT providedIn: 'root' — component-scoped
export class SignUpFacade {
  private readonly apiService = inject(SignUpApiService);
  private readonly errorMapper = inject(ErpErrorMapperService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly submittingSignal = signal<boolean>(false);
  private readonly submitErrorSignal = signal<string | null>(null);
  private readonly signupResultSignal = signal<SignupResponse | null>(null);

  private readonly activatingSignal = signal<boolean>(false);
  private readonly activateErrorSignal = signal<string | null>(null);
  private readonly activatedSignal = signal<boolean>(false);

  readonly submitting = computed(() => this.submittingSignal());
  readonly submitError = computed(() => this.submitErrorSignal());
  readonly signupResult = computed(() => this.signupResultSignal());

  readonly activating = computed(() => this.activatingSignal());
  readonly activateError = computed(() => this.activateErrorSignal());
  readonly activated = computed(() => this.activatedSignal());

  submit(request: SignupRequest, onSuccess?: (result: SignupResponse) => void): void {
    this.submittingSignal.set(true);
    this.submitErrorSignal.set(null);

    this.apiService
      .signup(request)
      .pipe(
        tap((result) => {
          this.signupResultSignal.set(result);
          onSuccess?.(result);
        }),
        catchError((error) => {
          this.handleError(error, this.submitErrorSignal);
          return EMPTY;
        }),
        finalize(() => this.submittingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  activate(token: string, onSuccess?: () => void): void {
    this.activatingSignal.set(true);
    this.activateErrorSignal.set(null);

    this.apiService
      .activate({ token })
      .pipe(
        tap(() => {
          this.activatedSignal.set(true);
          onSuccess?.();
        }),
        catchError((error) => {
          this.handleError(error, this.activateErrorSignal);
          return EMPTY;
        }),
        finalize(() => this.activatingSignal.set(false)),
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
