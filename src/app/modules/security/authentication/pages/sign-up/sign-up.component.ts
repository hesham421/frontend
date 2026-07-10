import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

import { AuthenticationService } from 'src/app/core/services/authentication.service';

import { AvlInputComponent } from 'src/app/shared/forms/avl-input/avl-input.component';
import { AvlButtonComponent } from 'src/app/shared/buttons/avl-button/avl-button.component';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { getFormFieldError } from 'src/app/shared/utils/form-error-resolver';

import { SignUpFacade } from '../../facades/sign-up.facade';
import { SignUpApiService } from '../../services/sign-up-api.service';

/**
 * SignUpComponent (SCR-SEC-008 — التسجيل الذاتي / Sign Up)
 * Phase F2 (PLAN-SEC-002): real submit handler (SignUpFacade.submit() → API-SEC-040),
 * plus the activation step reached via the emailed link's `token` query param
 * (SignUpFacade.activate() → API-SEC-041) — ONE route, two states, same
 * convention as PasswordRecoveryComponent's request/reset steps (SCR-SEC-009).
 *
 * Form fields fixed to match the backend SignupRequest contract exactly
 * (username, email, password) — the F1 shell had firstName/lastName, which
 * do not exist on SignupRequest; deviation fixed here, not carried forward.
 *
 * Reactive Forms per B.4.8 — NOT the `@angular/forms/signals` API used by
 * the legacy `auth-register` component (documented historical exception).
 * @plan PLAN-SEC-002 @phase F2 @scr SCR-SEC-008
 */
@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule, AvlInputComponent, AvlButtonComponent, CardComponent],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SignUpFacade, SignUpApiService]
})
export class SignUpComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly authenticationService = inject(AuthenticationService);
  readonly facade = inject(SignUpFacade);

  private readonly token = toSignal(this.route.queryParamMap.pipe(map((params) => params.get('token'))), {
    initialValue: this.route.snapshot.queryParamMap.get('token')
  });

  readonly isActivationStep = computed(() => !!this.token());

  readonly form: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  submitted = false;

  /** RULE-SEC-040/041 (PLAN-SEC-002 F3): resolves the correct message per
   *  violated validator (required vs format) instead of always showing
   *  VALIDATION.REQUIRED regardless of why the control is invalid. */
  fieldErrorKey(control: AbstractControl | null): string {
    return getFormFieldError(control)?.key ?? 'VALIDATION.REQUIRED';
  }

  constructor() {
    if (this.isActivationStep()) {
      this.facade.activate(this.token()!);
    } else if (this.authenticationService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.facade.submit(this.form.getRawValue());
  }
}
