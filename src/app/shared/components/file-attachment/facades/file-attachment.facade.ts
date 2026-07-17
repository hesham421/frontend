import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { FileAttachmentApiService, FileDownloadResult } from '../services/file-attachment-api.service';
import { ErpErrorMapperService } from '../../../services/erp-error-mapper.service';
import { extractBackendErrorCode } from '../../../utils/backend-error-message';
import {
  FileCategoryOptionResponse,
  FileDocumentSummaryResponse,
  FileUploadResponse
} from '../models/file-attachment.model';

interface FileListParams {
  ownerId: number;
  ownerType: string;
  page: number;
  size: number;
}

// This module's entity has no "current entity" edit concept (upload-only, no update — see
// file-attachment-form.model.ts) and no child-entity relationship, so this facade adapts
// create-facade's generic template: no currentEntitySignal/clearCurrentEntity(), a
// clearState() panel-reset instead; per-row download/delete state (Set<pk>) replaces the
// template's single savingSignal, since F2.md scopes those loading states to individual rows.
@Injectable() // NOT providedIn: 'root' — component-scoped, per B.3.2
export class FileAttachmentFacade {

  private readonly apiService = inject(FileAttachmentApiService);
  private readonly errorMapper = inject(ErpErrorMapperService);
  private readonly destroyRef = inject(DestroyRef);

  // --- Host context (set by the embedding component's ngOnInit — F4-SCREEN @Inputs) ---
  private readonly moduleCodeSignal = signal<string>('');

  // --- List state (B.3.10 — pagination consolidated, no separate page/size signals) ---
  private readonly filesSignal = signal<FileDocumentSummaryResponse[]>([]);
  private readonly totalElementsSignal = signal<number>(0);
  private readonly listLoadingSignal = signal<boolean>(false);
  private readonly listErrorSignal = signal<string | null>(null);
  private readonly lastListParamsSignal = signal<FileListParams>({
    ownerId: 0, ownerType: '', page: 0, size: 20
  });

  // --- Category dropdown state (F2-LOV-SERVICE) ---
  private readonly categoryOptionsSignal = signal<FileCategoryOptionResponse[]>([]);
  private readonly categoryOptionsLoadingSignal = signal<boolean>(false);

  // --- Upload state ---
  private readonly uploadingSignal = signal<boolean>(false);
  private readonly uploadErrorSignal = signal<string | null>(null);

  // --- Per-row action state — F2.md: download/delete loading is LOCAL to the specific row ---
  private readonly downloadingPksSignal = signal<ReadonlySet<number>>(new Set());
  private readonly deletingPksSignal = signal<ReadonlySet<number>>(new Set());
  private readonly downloadErrorSignal = signal<string | null>(null);
  private readonly deleteErrorSignal = signal<string | null>(null);

  // --- Public computed (readonly) ---
  readonly files = computed(() => this.filesSignal());
  readonly totalElements = computed(() => this.totalElementsSignal());
  readonly listLoading = computed(() => this.listLoadingSignal());
  readonly listError = computed(() => this.listErrorSignal());
  readonly currentPage = computed(() => this.lastListParamsSignal().page);
  readonly pageSize = computed(() => this.lastListParamsSignal().size);

  readonly categoryOptions = computed(() => this.categoryOptionsSignal());
  readonly categoryOptionsLoading = computed(() => this.categoryOptionsLoadingSignal());

  readonly uploading = computed(() => this.uploadingSignal());
  readonly uploadError = computed(() => this.uploadErrorSignal());

  readonly downloadError = computed(() => this.downloadErrorSignal());
  readonly deleteError = computed(() => this.deleteErrorSignal());

  isDownloading(fileDocumentPk: number): boolean {
    return this.downloadingPksSignal().has(fileDocumentPk);
  }

  isDeleting(fileDocumentPk: number): boolean {
    return this.deletingPksSignal().has(fileDocumentPk);
  }

  // --- Init (F2-SCREEN-INIT: 1) categoryOptions filtered by moduleCode 2) files for ownerId/ownerType) ---
  init(ownerId: number, ownerType: string, moduleCode: string): void {
    this.moduleCodeSignal.set(moduleCode);
    this.loadCategoryOptions(moduleCode);
    this.loadFiles({ ownerId, ownerType, page: 0, size: this.lastListParamsSignal().size });
  }

  private loadCategoryOptions(moduleCode: string): void {
    this.categoryOptionsLoadingSignal.set(true);
    this.apiService.listCategoryOptions(moduleCode).pipe(
      tap(options => this.categoryOptionsSignal.set(options)),
      catchError(() => {
        // Non-fatal — empty dropdown is a visible-but-recoverable state, not a panel-blocking
        // error (e.g. no categories seeded yet for this moduleCode).
        this.categoryOptionsSignal.set([]);
        return EMPTY;
      }),
      finalize(() => this.categoryOptionsLoadingSignal.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  // --- List operations ---
  loadFiles(params: FileListParams): void {
    this.listLoadingSignal.set(true);
    this.listErrorSignal.set(null);
    this.lastListParamsSignal.set(params);

    this.apiService.listByOwner(params.ownerId, {
      ownerType: params.ownerType, page: params.page, size: params.size
    }).pipe(
      tap(response => {
        this.filesSignal.set(response.content);
        this.totalElementsSignal.set(response.totalElements);
      }),
      catchError(error => {
        this.handleError(error, this.listErrorSignal);
        return EMPTY;
      }),
      finalize(() => this.listLoadingSignal.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  changePage(page: number, size: number): void {
    this.loadFiles({ ...this.lastListParamsSignal(), page, size });
  }

  private refetchCurrentPage(): void {
    this.loadFiles(this.lastListParamsSignal());
  }

  // --- Upload (API-FILE-001 then API-FILE-002 — two-step token flow) ---
  upload(file: File, fileCategoryFk: number, onSuccess?: (uploaded: FileUploadResponse) => void): void {
    const { ownerId, ownerType } = this.lastListParamsSignal();
    this.uploadingSignal.set(true);
    this.uploadErrorSignal.set(null);

    this.apiService.requestUploadToken({
      ownerId, ownerType, moduleCode: this.moduleCodeSignal(), fileCategoryFk
    }).pipe(
      switchMap(tokenResponse => this.apiService.uploadFile(tokenResponse.encryptedToken, file)),
      tap(uploaded => {
        this.refetchCurrentPage(); // F2.md: success triggers a files-list refetch (cache-busting)
        onSuccess?.(uploaded);
      }),
      catchError(error => {
        this.handleError(error, this.uploadErrorSignal);
        return EMPTY;
      }),
      finalize(() => this.uploadingSignal.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  // --- Download (own token issuance, action=DOWNLOAD — API-FILE-003) ---
  download(fileDocumentPk: number, onSuccess: (result: FileDownloadResult) => void): void {
    this.downloadingPksSignal.update(set => new Set(set).add(fileDocumentPk));
    this.downloadErrorSignal.set(null);

    this.apiService.issueAccessToken(fileDocumentPk, 'DOWNLOAD').pipe(
      switchMap(tokenResponse => this.apiService.downloadFile(tokenResponse.encryptedToken)),
      tap(result => onSuccess(result)),
      catchError(error => {
        this.handleError(error, this.downloadErrorSignal);
        return EMPTY;
      }),
      finalize(() => this.downloadingPksSignal.update(set => {
        const next = new Set(set);
        next.delete(fileDocumentPk);
        return next;
      })),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  // --- Delete (own token issuance, action=DELETE — API-FILE-004) ---
  delete(fileDocumentPk: number, onSuccess?: () => void): void {
    this.deletingPksSignal.update(set => new Set(set).add(fileDocumentPk));
    this.deleteErrorSignal.set(null);

    this.apiService.issueAccessToken(fileDocumentPk, 'DELETE').pipe(
      switchMap(tokenResponse => this.apiService.deleteFile(tokenResponse.encryptedToken)),
      tap(() => {
        this.refetchCurrentPage(); // F2.md: success triggers a files-list refetch
        onSuccess?.();
      }),
      catchError(error => {
        this.handleError(error, this.deleteErrorSignal);
        return EMPTY;
      }),
      finalize(() => this.deletingPksSignal.update(set => {
        const next = new Set(set);
        next.delete(fileDocumentPk);
        return next;
      })),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  // --- Cleanup (ngOnDestroy) — no currentEntity concept, resets panel state instead ---
  clearState(): void {
    this.filesSignal.set([]);
    this.totalElementsSignal.set(0);
    this.listErrorSignal.set(null);
    this.categoryOptionsSignal.set([]);
    this.uploadErrorSignal.set(null);
    this.downloadErrorSignal.set(null);
    this.deleteErrorSignal.set(null);
    this.downloadingPksSignal.set(new Set());
    this.deletingPksSignal.set(new Set());
  }

  // --- Error handling (B.3.7 — extractBackendErrorCode + ErpErrorMapperService) ---
  private handleError(error: unknown, errorSignal: ReturnType<typeof signal<string | null>>): void {
    const backendCode = extractBackendErrorCode(error);
    const mappedKey = backendCode && this.errorMapper.hasMapping(backendCode)
      ? this.errorMapper.mapError(backendCode).translationKey
      : null;
    errorSignal.set(mappedKey ?? 'ERRORS.OPERATION_FAILED');
  }
}
