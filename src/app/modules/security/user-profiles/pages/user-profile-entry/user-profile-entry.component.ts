import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, inject, signal, effect, untracked } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { ErpFormFieldComponent } from 'src/app/shared/components/erp-form-field/erp-form-field.component';
import { ErpActionBarComponent } from 'src/app/shared/components/erp-action-bar/erp-action-bar.component';
import { AvlInputComponent } from 'src/app/shared/forms/avl-input/avl-input.component';
import { AvlSelectComponent, AvlSelectOption } from 'src/app/shared/forms/avl-select/avl-select.component';
import { ErpNotificationService } from 'src/app/shared/services/erp-notification.service';

import { UserProfileFacade } from '../../facades/user-profile.facade';
import { UserProfileApiService } from '../../services/user-profile-api.service';
import { UserProfileFormMapper, UserProfileFormModel } from '../../models/user-profile-form.model';

/** RULE-SEC-034 (PLAN-SEC-002 F3): branchIdFk required, mapped to the
 *  catalog-exact ERR-SEC-1034 message (see form-error-resolver.ts) instead
 *  of the generic VALIDATION.REQUIRED text. */
function requiredActiveBranchValidator(control: AbstractControl): ValidationErrors | null {
  return control.value === null || control.value === undefined || control.value === '' ? { branchRequiredSec034: true } : null;
}

/**
 * UserProfileEntryComponent (SCR-SEC-006 — ملفات المستخدمين / نطاق البيانات)
 * Phase F2 (PLAN-SEC-002): real entry form, backed by UserProfileFacade
 * (create → API-SEC-032, load → API-SEC-035, update → API-SEC-034).
 * @plan PLAN-SEC-002 @phase F2 @scr SCR-SEC-006
 */
@Component({
  selector: 'app-user-profile-entry',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    CardComponent,
    ErpFormFieldComponent,
    ErpActionBarComponent,
    AvlInputComponent,
    AvlSelectComponent
  ],
  templateUrl: './user-profile-entry.component.html',
  styleUrls: ['./user-profile-entry.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UserProfileFacade, UserProfileApiService]
})
export class UserProfileEntryComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly notificationService = inject(ErpNotificationService);

  readonly facade = inject(UserProfileFacade);

  readonly isEditMode = signal(false);
  readonly userId = signal<number | null>(null);

  form!: FormGroup;

  readonly languageOptions: AvlSelectOption[] = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية' }
  ];

  get branchOptions(): AvlSelectOption[] {
    return this.facade.activeBranches().map((b) => ({
      value: String(b.id),
      label: b.nameEn || b.branchCode
    }));
  }

  get branchIdStringValue(): string {
    const v = this.form.get('branchIdFk')?.value;
    return v == null ? '' : String(v);
  }

  onBranchChange(value: string): void {
    this.form.get('branchIdFk')?.setValue(value === '' ? null : Number(value));
  }

  get preferredLangStringValue(): string {
    return this.form.get('preferredLang')?.value ?? '';
  }

  onPreferredLangChange(value: string): void {
    this.form.get('preferredLang')?.setValue(value);
  }

  constructor() {
    this.buildForm(UserProfileFormMapper.createEmpty());

    effect(() => {
      const saveError = this.facade.saveError();
      if (!saveError) return;
      untracked(() => this.notificationService.error(saveError));
    });

    effect(() => {
      const profile = this.facade.currentProfile();
      if (!profile) return;
      untracked(() => {
        const formModel = UserProfileFormMapper.fromDomain(profile);
        this.form.patchValue(formModel, { emitEvent: false });
        this.form.get('userIdFk')?.disable({ emitEvent: false });
      });
    });
  }

  ngOnInit(): void {
    this.facade.loadActiveBranches();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.userId.set(Number(idParam));
      this.facade.getById(Number(idParam));
    }
  }

  private buildForm(model: UserProfileFormModel): void {
    this.form = this.fb.group({
      userIdFk: [model.userIdFk, [Validators.required]],
      branchIdFk: [model.branchIdFk, [requiredActiveBranchValidator]],
      fullNameAr: [model.fullNameAr],
      fullNameEn: [model.fullNameEn],
      preferredLang: [model.preferredLang],
      employeeIdFk: [model.employeeIdFk]
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.warning('MESSAGES.FORM_INVALID');
      return;
    }

    const value = this.form.getRawValue() as UserProfileFormModel;

    if (this.isEditMode() && this.userId()) {
      const request = UserProfileFormMapper.toUpdateRequest(value);
      this.facade.update(this.userId()!, request, () => {
        this.notificationService.success('MESSAGES.UPDATE_SUCCESS');
      });
    } else {
      const request = UserProfileFormMapper.toCreateRequest(value);
      this.facade.create(request, (created) => {
        this.notificationService.success('MESSAGES.CREATE_SUCCESS');
        this.isEditMode.set(true);
        this.userId.set(created.userIdFk);
        this.form.get('userIdFk')?.disable({ emitEvent: false });
        this.location.replaceState(`/security/user-profiles/edit/${created.userIdFk}`);
      });
    }
  }

  navigateBack(): void {
    this.router.navigate(['/security/user-profiles']);
  }

  ngOnDestroy(): void {
    this.facade.clearCurrentEntity();
  }
}
