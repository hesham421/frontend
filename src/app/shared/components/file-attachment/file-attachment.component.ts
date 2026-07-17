import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { FileAttachmentApiService } from './services/file-attachment-api.service';
import { FileAttachmentFacade } from './facades/file-attachment.facade';
import { fileSizeValidator } from './validators/file-size.validator';
import { FileDocumentSummaryResponse } from './models/file-attachment.model';
import { ErpDialogService } from '../../services/erp-dialog.service';
import { PermissionService } from '../../../core/services/permission.service';
import { ErpSectionComponent } from '../erp-section';
import { ErpEmptyStateComponent } from '../erp-empty-state';
import { AvlPaginationComponent } from '../avl-pagination/avl-pagination.component';
import { AvlButtonComponent } from '../../buttons/avl-button/avl-button.component';
import { ErpPermissionDirective } from '../../directives/erp-permission.directive';

// SCR-FILE-001 — embedded attachment panel (F4.md: COMPOSITE, PATTERN-2 Inline/Modal, no
// Search/Entry split, no route of its own — DRV-FILE-010/011). Host screens embed it as
// <app-file-attachment [ownerId] [ownerType] [moduleCode]> (execution-plan.md F4 spec).
// Permission-gated visibility (F3-SEC-RULE-1 / SEC.md): canView gates the whole panel,
// canCreate hides the upload control, canDelete hides the delete button per row.
@Component({
  selector: 'app-file-attachment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ErpSectionComponent,
    ErpEmptyStateComponent,
    AvlPaginationComponent,
    AvlButtonComponent,
    ErpPermissionDirective
  ],
  providers: [FileAttachmentApiService, FileAttachmentFacade],
  templateUrl: './file-attachment.component.html',
  styleUrls: ['./file-attachment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileAttachmentComponent implements OnInit, OnDestroy {
  @Input({ required: true }) ownerId!: number;
  @Input({ required: true }) ownerType!: string;
  @Input({ required: true }) moduleCode!: string;

  protected readonly facade = inject(FileAttachmentFacade);
  private readonly fb = inject(FormBuilder);
  private readonly dialogService = inject(ErpDialogService);
  protected readonly translate = inject(TranslateService);
  private readonly permissionService = inject(PermissionService);

  protected readonly uploadForm: FormGroup = this.fb.group({
    file: [null as File | null, [Validators.required, fileSizeValidator()]],
    fileCategoryFk: [null as number | null, Validators.required]
  });

  // SEC.md — Screen guard: canView required for the panel to render at all.
  protected readonly canView = this.permissionService.hasPermission('PERM_FILE_ATTACHMENT_VIEW');

  ngOnInit(): void {
    // B.4.13 — permission check before loading; a canView=false user shouldn't trigger the
    // list/category-options calls at all, not just have the panel hidden after the fact.
    if (!this.canView) return;
    this.facade.init(this.ownerId, this.ownerType, this.moduleCode);
  }

  ngOnDestroy(): void {
    this.facade.clearState();
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.uploadForm.patchValue({ file: input.files?.[0] ?? null });
  }

  protected onUpload(): void {
    if (this.uploadForm.invalid) {
      this.uploadForm.markAllAsTouched();
      return;
    }
    const { file, fileCategoryFk } = this.uploadForm.value as { file: File; fileCategoryFk: number };
    this.facade.upload(file, fileCategoryFk, () => {
      this.uploadForm.reset();
    });
  }

  protected onDownload(file: FileDocumentSummaryResponse): void {
    this.facade.download(file.fileDocumentPk, (result) => {
      const url = URL.createObjectURL(result.blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = result.fileName ?? file.fileNameOriginal;
      anchor.click();
      URL.revokeObjectURL(url);
    });
  }

  protected async onDelete(file: FileDocumentSummaryResponse): Promise<void> {
    const confirmed = await this.dialogService.confirm({
      titleKey: 'FILE_ATTACHMENT.DELETE_CONFIRM_TITLE',
      messageKey: 'FILE_ATTACHMENT.DELETE_CONFIRM_MESSAGE',
      type: 'danger'
    });
    if (!confirmed) return;
    this.facade.delete(file.fileDocumentPk);
  }

  protected onPageChange(page1Based: number): void {
    this.facade.changePage(page1Based - 1, this.facade.pageSize());
  }

  protected categoryName(option: { nameAr: string; nameEn: string }): string {
    return this.translate.currentLang === 'ar' ? option.nameAr : option.nameEn;
  }

  protected fileCategoryDisplayName(file: FileDocumentSummaryResponse): string {
    return this.translate.currentLang === 'ar' ? file.fileCategoryNameAr : file.fileCategoryNameEn;
  }

  protected formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
