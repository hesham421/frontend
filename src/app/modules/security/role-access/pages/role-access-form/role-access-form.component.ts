import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  signal,
  untracked
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DrawerService } from 'src/app/shared/overlay/drawer/drawer.service';
import { DialogService } from 'src/app/shared/overlay/dialog/dialog.service';
import { AvlOverlayRef } from 'src/app/shared/overlay/avl-overlay-ref';

import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { AvlTabsComponent, TabItem } from 'src/app/shared/components/avl-tabs/avl-tabs.component';
import { ErpFormFieldComponent } from 'src/app/shared/components/erp-form-field/erp-form-field.component';
import { ErpSectionComponent } from 'src/app/shared/components/erp-section/erp-section.component';
import { ErpActionBarComponent } from 'src/app/shared/components/erp-action-bar/erp-action-bar.component';
import { ErpDualListComponent, DualListItem } from 'src/app/shared/components/erp-dual-list/erp-dual-list.component';
import { AvlInputComponent } from 'src/app/shared/forms/avl-input/avl-input.component';
import { AvlSelectComponent, AvlSelectOption } from 'src/app/shared/forms/avl-select/avl-select.component';
import { AvlSwitchComponent } from 'src/app/shared/forms/avl-switch/avl-switch.component';
import { AvlCheckboxComponent } from 'src/app/shared/forms/avl-checkbox/avl-checkbox.component';
import { AvlButtonComponent } from 'src/app/shared/buttons/avl-button/avl-button.component';
import { AvlIconButtonComponent } from 'src/app/shared/buttons/avl-icon-button/avl-icon-button.component';
import { FormsModule } from '@angular/forms';

import { ErpDialogService } from 'src/app/shared/services/erp-dialog.service';
import { ErpNotificationService } from 'src/app/shared/services/erp-notification.service';

import { ErpPermissionDirective } from 'src/app/shared/directives/erp-permission.directive';

import { AuthenticationService } from 'src/app/core/services/authentication.service';

import { RoleAccessFacade } from '../../facades/role-access.facade';
import { RoleAccessApiService } from '../../services/role-access-api.service';
import { ActivePageDto, AddRolePagesRequestItem, RoleDto, RolePagePermissionDto } from '../../models/role-access.model';
import { confirmRemoveRolePage, RoleConfirmActionDeps } from '../../helpers/role-confirm-actions';

import { RoleBranchFacade } from '../../facades/role-branch.facade';
import { RoleBranchApiService } from '../../services/role-branch-api.service';
import { DATA_ACCESS_LEVELS, RoleBranchDto } from '../../models/role-branch.model';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/core/services/language.service';

@Component({
  selector: 'app-role-access-form',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    ErpPermissionDirective,
    ErpFormFieldComponent,
    ErpSectionComponent,
    ErpActionBarComponent,
    ErpDualListComponent,
    AvlInputComponent,
    AvlSelectComponent,
    AvlSwitchComponent,
    AvlCheckboxComponent,
    AvlButtonComponent,
    AvlIconButtonComponent,
    AvlTabsComponent
  ],
  templateUrl: './role-access-form.component.html',
  styleUrl: './role-access-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RoleAccessFacade, RoleAccessApiService, RoleBranchFacade, RoleBranchApiService]
})
export class RoleAccessFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly drawerService = inject(DrawerService);
  private readonly overlayDialogService = inject(DialogService);

  readonly translate = inject(TranslateService);
  readonly languageService = inject(LanguageService);
  readonly facade = inject(RoleAccessFacade);
  readonly branchFacade = inject(RoleBranchFacade);

  private readonly dialogService = inject(ErpDialogService);
  private readonly notificationService = inject(ErpNotificationService);
  private readonly authService = inject(AuthenticationService);

  roleForm!: FormGroup;
  isEditMode = false;
  roleId: number | null = null;

  permissions: RolePagePermissionDto[] = [];

  /** SCR-SEC-002 extension (PLAN-SEC-002 Phase F1) — Branch Scope sub-tab.
   *  CORE-9: composite screen, no new SCR-ID/route for this sub-tab.
   *  Content is a placeholder shell until Phase F2's RoleBranchFacade
   *  (search → API-SEC-037, assign → API-SEC-036, update → API-SEC-038,
   *  remove → API-SEC-039) lands. */
  readonly activeTab = signal<string>('pages');

  get roleTabs(): TabItem[] {
    return [
      { id: 'pages', label: this.translate.instant('ROLE_ACCESS.PAGES_ACCESS') },
      { id: 'branch-scope', label: this.translate.instant('ROLE_ACCESS.BRANCH_SCOPE') }
    ];
  }

  onTabChange(tabId: string): void {
    this.activeTab.set(tabId);
  }

  addPagesModalRef: AvlOverlayRef | null = null;
  copyFromModalRef: AvlOverlayRef | null = null;

  dualListAvailableItems: DualListItem[] = [];
  dualListSelectedItems: DualListItem[] = [];

  availableRolesToCopy: RoleDto[] = [];
  selectedSourceRoleId: number | null = null;

  /** avl-select is string-valued only; bridge to the numeric id, same
   *  technique as Phase 4's specification-filter / pages-form's parentId. */
  get copyFromRoleOptions(): AvlSelectOption[] {
    return this.availableRolesToCopy.map((r) => ({ value: String(r.id), label: r.roleName }));
  }

  get selectedSourceRoleIdStringValue(): string {
    return this.selectedSourceRoleId === null ? '' : String(this.selectedSourceRoleId);
  }

  onSourceRoleChange(value: string): void {
    this.selectedSourceRoleId = value === '' ? null : Number(value);
  }

  get role(): RoleDto | null {
    return this.facade.selectedRole();
  }

  get activePages(): ActivePageDto[] {
    return this.facade.activePages();
  }

  // --- Branch Scope sub-tab (RoleBranchFacade, PLAN-SEC-002 Phase F2) ---

  get roleBranches(): RoleBranchDto[] {
    return this.branchFacade.roleBranches();
  }

  get isBranchScopeSaving(): boolean {
    return this.branchFacade.saving();
  }

  get dataAccessLevelOptions(): AvlSelectOption[] {
    return DATA_ACCESS_LEVELS.map((level) => ({ value: level, label: this.translate.instant(`ROLE_ACCESS.DATA_ACCESS_LEVEL_${level}`) }));
  }

  /** Branches not yet assigned to this role — the "Assign Branch" modal's dropdown source. */
  get assignableBranchOptions(): AvlSelectOption[] {
    const assigned = new Set(this.roleBranches.map((rb) => rb.branchIdFk));
    return this.branchFacade
      .activeBranches()
      .filter((b) => !assigned.has(b.id))
      .map((b) => ({ value: String(b.id), label: b.nameEn || b.branchCode }));
  }

  assignBranchModalRef: AvlOverlayRef | null = null;
  selectedNewBranchId: number | null = null;
  /** RULE-SEC-035 (PLAN-SEC-002 F3): dataAccessLevel is required — no explicit
   *  Validator needed here because the dropdown has no blank option and always
   *  carries this default, so an empty submission is structurally impossible
   *  (unlike branchIdFk, which the confirm button's [disabled] guard below
   *  enforces for RULE-SEC-034). */
  selectedNewDataAccessLevel: string = DATA_ACCESS_LEVELS[0];

  get selectedNewBranchIdStringValue(): string {
    return this.selectedNewBranchId === null ? '' : String(this.selectedNewBranchId);
  }

  onNewBranchChange(value: string): void {
    this.selectedNewBranchId = value === '' ? null : Number(value);
  }

  onNewDataAccessLevelChange(value: string): void {
    this.selectedNewDataAccessLevel = value;
  }

  branchNameFor(branchId: number): string {
    const branch = this.branchFacade.activeBranches().find((b) => b.id === branchId);
    return branch ? branch.nameEn || branch.branchCode : String(branchId);
  }

  openAssignBranchModal(content: TemplateRef<unknown>): void {
    if (!this.roleId) return;
    this.selectedNewBranchId = null;
    this.selectedNewDataAccessLevel = DATA_ACCESS_LEVELS[0];

    // Dialog, not Drawer: a short single-purpose assign prompt (same reasoning as Copy From).
    this.assignBranchModalRef = this.overlayDialogService.open(content, { size: 'md', viewContainerRef: this.viewContainerRef });
  }

  onAssignBranchConfirm(): void {
    if (!this.roleId || !this.selectedNewBranchId) return;

    // RULE-SEC-036: client-side duplicate check before submit (UX only — server remains
    // authoritative per ERR-SEC-1036).
    if (this.roleBranches.some((rb) => rb.branchIdFk === this.selectedNewBranchId)) {
      this.notificationService.warning('ROLE_ACCESS.BRANCH_ALREADY_ASSIGNED');
      return;
    }

    this.branchFacade.assign(
      { roleIdFk: this.roleId, branchIdFk: this.selectedNewBranchId, dataAccessLevel: this.selectedNewDataAccessLevel },
      () => {
        this.notificationService.success('MESSAGES.CREATE_SUCCESS');
        this.assignBranchModalRef?.close();
        this.assignBranchModalRef = null;
      }
    );
  }

  onDataAccessLevelChange(row: RoleBranchDto, value: string): void {
    if (!this.roleId || value === row.dataAccessLevel) return;
    this.branchFacade.updateDataAccessLevel(this.roleId, row.branchIdFk, { dataAccessLevel: value });
  }

  confirmRemoveBranch(branchId: number): void {
    if (!this.roleId) return;
    if (!this.authService.hasPermission('PERM_ROLE_DELETE')) {
      this.notificationService.warning('MESSAGES.NO_PERMISSION');
      return;
    }

    this.dialogService.confirmDelete('ROLE_ACCESS.REMOVE_BRANCH_CONFIRM', { branch: this.branchNameFor(branchId) }).then((confirmed: boolean) => {
      if (!confirmed || !this.roleId) return;
      this.branchFacade.remove(this.roleId, branchId, () => {
        this.notificationService.success('MESSAGES.DELETE_SUCCESS');
      });
    });
  }

  get isLoading(): boolean {
    return this.facade.loading();
  }

  get isSaving(): boolean {
    return this.facade.saving();
  }

  get isRtl(): boolean {
    return this.languageService.isArabic();
  }

  constructor() {
    this.initForm();

    effect(() => {
      const saveError = this.facade.saveError();
      if (!saveError) return;
      untracked(() => this.notificationService.error(saveError));
    });

    effect(() => {
      const saveError = this.branchFacade.saveError();
      if (!saveError) return;
      untracked(() => this.notificationService.error(saveError));
    });

    effect(() => {
      const pages = this.facade.rolePages();
      untracked(() => {
        this.permissions = (pages ?? []).map((p) => ({ ...p }));
        this.cdr.markForCheck();
      });
    });

    effect(() => {
      const role = this.facade.selectedRole();
      if (!role) return;
      untracked(() => {
        this.roleForm.patchValue(
          {
            name: role.roleName,
            description: role.description ?? '',
            active: role.active
          },
          { emitEvent: false }
        );
        if (this.isEditMode) this.roleForm.disable({ emitEvent: false });
        this.cdr.markForCheck();
      });
    });

    effect(() => {
      if (!this.roleId) return;
      const roles = this.facade.roles();
      untracked(() => {
        this.availableRolesToCopy = roles.filter((r) => r.id !== this.roleId);
      });
    });
  }

  ngOnInit(): void {
    this.facade.loadActivePages();

    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const roleIdParam = params.get('roleId');

      if (roleIdParam) {
        this.isEditMode = true;
        this.roleId = Number(roleIdParam);
        this.roleForm.disable();

        this.facade.loadRoleDetails(this.roleId);
        this.facade.loadRolePages(this.roleId);

        // Preload roles list for Copy From modal
        this.facade.setFilters([]);
        this.facade.setSize(50);
        this.facade.setPage(0);
        this.facade.loadRoles();

        // Branch Scope sub-tab data (PLAN-SEC-002 Phase F2)
        this.branchFacade.loadActiveBranches();
        this.branchFacade.loadRoleBranches(this.roleId);
      } else {
        this.isEditMode = false;
        this.roleId = null;
        this.roleForm.enable();
      }

      this.cdr.detectChanges();
    });
  }

  private initForm(): void {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      active: [true]
    });
  }

  private deriveRoleCode(roleName: string): string {
    return String(roleName ?? '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '_')
      .replace(/[^A-Z0-9_]/g, '');
  }

  navigateBack(): void {
    this.router.navigate(['/security/role-access']);
  }

  onCreateRole(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      this.notificationService.warning('MESSAGES.FORM_INVALID');
      return;
    }

    const value = this.roleForm.getRawValue() as { name: string; description: string; active: boolean };
    this.facade.createRole(
      {
        roleName: value.name,
        roleCode: this.deriveRoleCode(value.name),
        description: value.description || undefined,
        active: value.active
      },
      (created) => {
        this.notificationService.success('MESSAGES.CREATE_SUCCESS');

        // Switch to edit mode in-place (no full navigation)
        this.isEditMode = true;
        this.roleId = created.id;
        this.roleForm.disable({ emitEvent: false });
        this.facade.loadRoleDetails(created.id);
        this.facade.loadRolePages(created.id);
        this.facade.setFilters([]);
        this.facade.setSize(50);
        this.facade.setPage(0);
        this.facade.loadRoles();
        this.location.replaceState('/security/role-access/edit/' + created.id);
        this.cdr.markForCheck();
      }
    );
  }

  onToggleAllForRow(row: RolePagePermissionDto, checked: boolean): void {
    row.create = checked;
    row.update = checked;
    row.delete = checked;
  }

  isAllChecked(row: RolePagePermissionDto): boolean {
    return !!row.create && !!row.update && !!row.delete;
  }

  onSavePermissions(): void {
    if (!this.roleId) return;

    this.facade.syncRolePages(this.roleId, this.permissions, () => {
      this.notificationService.success('MESSAGES.UPDATE_SUCCESS');
    });
  }

  confirmRemovePage(pageCode: string): void {
    if (!this.roleId) return;

    const deps: RoleConfirmActionDeps = {
      dialog: this.dialogService,
      notify: this.notificationService,
      auth: this.authService,
      facade: this.facade
    };
    confirmRemoveRolePage(deps, this.roleId, pageCode, () => {});
  }

  openAddPagesModal(content: TemplateRef<unknown>): void {
    if (!this.roleId) return;

    const assigned = new Set(this.permissions.map((p) => p.pageCode));
    const available = this.activePages
      .filter((p) => p.active && !assigned.has(p.pageCode))
      .map((p) => ({
        id: p.pageCode,
        label: this.translate.currentLang === 'ar' ? (p.nameAr || p.pageCode) : (p.nameEn || p.pageCode),
        secondaryLabel: p.pageCode
      }));

    this.dualListAvailableItems = available;
    this.dualListSelectedItems = [];

    // Drawer, not Dialog: a dual-list picker has more than a couple of
    // fields and benefits from keeping context visible (Drawer.prompt.md).
    this.addPagesModalRef = this.drawerService.open(content, { size: 'lg', viewContainerRef: this.viewContainerRef });
  }

  onPagesSelectionChanged(selectedItems: DualListItem[]): void {
    this.dualListSelectedItems = selectedItems;
  }

  addSelectedPages(defaultCrud: { create: boolean; update: boolean; delete: boolean }): void {
    if (!this.roleId) return;

    const items: AddRolePagesRequestItem[] = this.dualListSelectedItems.map((i) => ({
      pageCode: String(i.id),
      create: defaultCrud.create,
      update: defaultCrud.update,
      delete: defaultCrud.delete
    }));

    if (items.length === 0) {
      this.notificationService.warning('COMMON.NO_DATA');
      return;
    }

    this.facade.addRolePages(this.roleId, items, () => {
      this.notificationService.success('MESSAGES.CREATE_SUCCESS');
      this.addPagesModalRef?.close();
      this.addPagesModalRef = null;
    });
  }

  openCopyFromModal(content: TemplateRef<unknown>): void {
    if (!this.roleId) return;
    this.selectedSourceRoleId = null;

    // Dialog, not Drawer: a single role-selector is a short, focused prompt.
    this.copyFromModalRef = this.overlayDialogService.open(content, { size: 'md', viewContainerRef: this.viewContainerRef });
  }

  onCopyFromConfirm(): void {
    if (!this.roleId || !this.selectedSourceRoleId) return;

    this.facade.copyFromRole(this.roleId, this.selectedSourceRoleId, () => {
      this.notificationService.success('MESSAGES.UPDATE_SUCCESS');
      this.copyFromModalRef?.close();
      this.copyFromModalRef = null;
    });
  }

  ngOnDestroy(): void {
    this.facade.clearCurrentEntity();
    this.branchFacade.resetChildState();
  }
}
