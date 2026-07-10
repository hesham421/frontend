import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

import { LanguageService } from 'src/app/core/services/language.service';

import { AvlInputComponent } from 'src/app/shared/forms/avl-input/avl-input.component';
import { AvlButtonComponent } from 'src/app/shared/buttons/avl-button/avl-button.component';
import { AvlAlertComponent } from 'src/app/shared/feedback/avl-alert/avl-alert.component';
import { getFormFieldError } from 'src/app/shared/utils/form-error-resolver';

import { ForgotPasswordFacade } from '../../facades/forgot-password.facade';
import { ForgotPasswordApiService } from '../../services/forgot-password-api.service';
import { AuthBrandPanelComponent } from '../../components/auth-brand-panel/auth-brand-panel.component';

function passwordsMatchValidator(): ValidatorFn {
  return (group): ValidationErrors | null => {
    const password = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password && confirm && password !== confirm ? { passwordsMismatch: true } : null;
  };
}

/**
 * PasswordRecoveryComponent (SCR-SEC-009 — نسيان كلمة المرور واستعادتها)
 * Phase F2 (PLAN-SEC-002): real submit handlers, backed by ForgotPasswordFacade
 * (requestReset() → API-SEC-042, reset(token) → API-SEC-043). ONE route, two
 * steps: request view by default, reset view once a `token` query param is
 * present (the emailed reset link lands here).
 * @plan PLAN-SEC-002 @phase F2 @scr SCR-SEC-009
 */
@Component({
  selector: 'app-password-recovery',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TranslateModule,
    AvlInputComponent,
    AvlButtonComponent,
    AvlAlertComponent,
    AuthBrandPanelComponent
  ],
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ForgotPasswordFacade, ForgotPasswordApiService]
})
export class PasswordRecoveryComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  readonly languageService = inject(LanguageService);
  readonly facade = inject(ForgotPasswordFacade);

  private readonly token = toSignal(this.route.queryParamMap.pipe(map((params) => params.get('token'))), {
    initialValue: this.route.snapshot.queryParamMap.get('token')
  });

  readonly isResetStep = computed(() => !!this.token());

  readonly requestForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  readonly resetForm: FormGroup = this.fb.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordsMatchValidator() }
  );

  requestSubmitted = false;
  resetSubmitted = false;

  /** Resolves the correct message per violated validator (required vs
   *  format) instead of always showing VALIDATION.REQUIRED regardless of
   *  why the control is invalid — same convention as SignUpComponent. */
  fieldErrorKey(control: AbstractControl | null): string {
    return getFormFieldError(control)?.key ?? 'VALIDATION.REQUIRED';
  }

  onRequestSubmit(event: Event): void {
    event.preventDefault();
    this.requestSubmitted = true;

    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.facade.requestReset(this.requestForm.getRawValue().email);
  }

  onResetSubmit(event: Event): void {
    event.preventDefault();
    this.resetSubmitted = true;

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const token = this.token();
    if (!token) return;

    this.facade.reset(token, this.resetForm.getRawValue().newPassword);
  }
}
