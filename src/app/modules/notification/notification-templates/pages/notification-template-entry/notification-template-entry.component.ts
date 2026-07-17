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
import { AvlSwitchComponent } from 'src/app/shared/forms/avl-switch/avl-switch.component';
import { ErpNotificationService } from 'src/app/shared/services/erp-notification.service';

import { NotificationTemplateFacade } from '../../facades/notification-template.facade';
import { NotificationTemplateApiService } from '../../services/notification-template-api.service';
import { NotificationTemplateFormMapper, NotificationTemplateFormModel } from '../../models/notification-template-form.model';

/** RULE-NOTIF-006 (NOTIFICATION F3): templateBodyAr/En both required (non-blank),
 *  catalog-exact message (ERR-NOTIF-0002) instead of generic VALIDATION.REQUIRED. */
function bilingualRequiredValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  return value === null || value === undefined || String(value).trim() === '' ? { bilingualRequiredNotif006: true } : null;
}

/**
 * NotificationTemplateEntryComponent (SCR-NOTIF-002 — Template Management, PATTERN-1).
 * Mode (CREATE|EDIT|VIEW) resolved from ActivatedRoute per F4-RULE-7: /new -> CREATE,
 * /:id -> VIEW, /:id/edit -> EDIT. RULE-NOTIF-007: templateCode required but disabled
 * entirely once in EDIT/VIEW mode (immutable after create).
 * @plan execution-plan.md @phase F4 @scr SCR-NOTIF-002
 */
@Component({
  selector: 'app-notification-template-entry',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    CardComponent,
    ErpFormFieldComponent,
    ErpActionBarComponent,
    AvlInputComponent,
    AvlSelectComponent,
    AvlSwitchComponent
  ],
  templateUrl: './notification-template-entry.component.html',
  styleUrls: ['./notification-template-entry.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NotificationTemplateFacade, NotificationTemplateApiService]
})
export class NotificationTemplateEntryComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly notificationService = inject(ErpNotificationService);

  readonly facade = inject(NotificationTemplateFacade);

  readonly isEditMode = signal(false);
  readonly isViewMode = signal(false);
  readonly templateId = signal<number | null>(null);

  form!: FormGroup;

  get channelOptions(): AvlSelectOption[] {
    return this.facade.channelOptions();
  }

  get channelTypeStringValue(): string {
    return this.form.get('channelTypeId')?.value ?? '';
  }

  onChannelTypeChange(value: string): void {
    this.form.get('channelTypeId')?.setValue(value);
  }

  constructor() {
    this.buildForm(NotificationTemplateFormMapper.createEmpty());

    effect(() => {
      const saveError = this.facade.saveError();
      if (!saveError) return;
      untracked(() => this.notificationService.error(saveError));
    });

    effect(() => {
      const template = this.facade.currentTemplate();
      if (!template) return;
      untracked(() => {
        const formModel = NotificationTemplateFormMapper.fromDomain(template);
        this.form.patchValue(formModel, { emitEvent: false });
        this.form.get('templateCode')?.disable({ emitEvent: false });
        if (this.isViewMode()) this.form.disable({ emitEvent: false });
      });
    });
  }

  ngOnInit(): void {
    this.facade.loadChannelOptions();

    const idParam = this.route.snapshot.paramMap.get('id');
    const isEditSegment = this.route.snapshot.url.some((segment) => segment.path === 'edit');

    if (idParam) {
      this.templateId.set(Number(idParam));
      this.isEditMode.set(isEditSegment);
      this.isViewMode.set(!isEditSegment);
      this.facade.getById(Number(idParam));
    }
  }

  private buildForm(model: NotificationTemplateFormModel): void {
    this.form = this.fb.group({
      templateCode: [model.templateCode, [Validators.required]],
      templateNameAr: [model.templateNameAr, [Validators.required]],
      templateNameEn: [model.templateNameEn, [Validators.required]],
      channelTypeId: [model.channelTypeId, [Validators.required]],
      moduleCode: [model.moduleCode, [Validators.required]],
      templateBodyAr: [model.templateBodyAr, [bilingualRequiredValidator]],
      templateBodyEn: [model.templateBodyEn, [bilingualRequiredValidator]],
      isActiveFl: [{ value: model.isActiveFl, disabled: true }]
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.warning('MESSAGES.FORM_INVALID');
      return;
    }

    const value = this.form.getRawValue() as NotificationTemplateFormModel;

    if (this.isEditMode() && this.templateId()) {
      const request = NotificationTemplateFormMapper.toUpdateRequest(value);
      this.facade.update(this.templateId()!, request, () => {
        this.notificationService.success('MESSAGES.UPDATE_SUCCESS');
      });
    } else {
      const request = NotificationTemplateFormMapper.toCreateRequest(value);
      this.facade.create(request, (created) => {
        this.notificationService.success('MESSAGES.CREATE_SUCCESS');
        this.isEditMode.set(true);
        this.templateId.set(created.id);
        this.form.get('templateCode')?.disable({ emitEvent: false });
        this.location.replaceState(`/notification-templates/${created.id}/edit`);
      });
    }
  }

  navigateBack(): void {
    this.router.navigate(['/notification-templates']);
  }

  ngOnDestroy(): void {
    this.facade.clearCurrentEntity();
  }
}
