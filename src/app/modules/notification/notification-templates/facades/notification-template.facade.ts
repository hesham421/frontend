import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, catchError, finalize, tap } from 'rxjs';

import { ErpErrorMapperService } from 'src/app/shared/services/erp-error-mapper.service';
import { extractBackendErrorCode } from 'src/app/shared/utils/backend-error-message';
import { LookupService } from 'src/app/core/services/lookup.service';
import { LookupSelectOption } from 'src/app/core/models/lookup-detail.model';

import { NotificationTemplateApiService } from '../services/notification-template-api.service';
import {
  CreateNotificationTemplateRequest,
  NotificationTemplateDto,
  NotificationTemplateSearchRequest,
  UpdateNotificationTemplateRequest
} from '../models/notification-template.model';

/**
 * SCR-NOTIF-002's search filter — matches NotificationTemplateSearchRequest's own
 * named optional fields exactly (templateCode/channelTypeId/moduleCode/isActiveFl
 * are direct request properties per api-docs, not generic ContractFilter entries),
 * so no ContractFilter conversion step is needed here (unlike NotificationInboxFacade's
 * date-range filters).
 */
export interface NotificationTemplateSearchFilter {
  templateCode?: string;
  channelTypeId?: string;
  moduleCode?: string;
  isActiveFl?: boolean;
}

@Injectable() // NOT providedIn: 'root' — component-scoped
export class NotificationTemplateFacade {
  private readonly apiService = inject(NotificationTemplateApiService);
  private readonly lookupService = inject(LookupService);
  private readonly translate = inject(TranslateService);
  private readonly errorMapper = inject(ErpErrorMapperService);
  private readonly destroyRef = inject(DestroyRef);

  // --- Primary List State ---
  private readonly templatesSignal = signal<NotificationTemplateDto[]>([]);
  private readonly totalElementsSignal = signal<number>(0);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // --- Write State ---
  private readonly savingSignal = signal<boolean>(false);
  private readonly saveErrorSignal = signal<string | null>(null);

  // --- Search State ---
  private readonly currentFiltersSignal = signal<NotificationTemplateSearchFilter>({});
  private readonly lastSearchRequestSignal = signal<NotificationTemplateSearchRequest>({
    filters: [],
    sorts: [{ field: 'templateCode', direction: 'ASC' }],
    page: 0,
    size: 20
  });

  // --- Current Entity State ---
  private readonly currentTemplateSignal = signal<NotificationTemplateDto | null>(null);

  // --- LOV State (LOV-NOTIF-001) ---
  private readonly channelOptionsSignal = signal<LookupSelectOption[]>([]);
  private readonly channelOptionsLoadingSignal = signal<boolean>(false);

  // --- Public Computed ---
  readonly templates = computed(() => this.templatesSignal());
  readonly totalElements = computed(() => this.totalElementsSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly saving = computed(() => this.savingSignal());
  readonly saveError = computed(() => this.saveErrorSignal());
  readonly currentTemplate = computed(() => this.currentTemplateSignal());
  readonly channelOptions = computed(() => this.channelOptionsSignal());
  readonly channelOptionsLoading = computed(() => this.channelOptionsLoadingSignal());

  // --- Derived from lastSearchRequestSignal (NOT separate writable signals) ---
  readonly currentPage = computed(() => this.lastSearchRequestSignal().page);
  readonly pageSize = computed(() => this.lastSearchRequestSignal().size);
  readonly currentFilters = computed(() => this.currentFiltersSignal());

  // --- LOV Init ---

  loadChannelOptions(): void {
    this.channelOptionsLoadingSignal.set(true);
    const lang = this.translate.currentLang || 'ar';

    this.lookupService
      .getOptions('NOTIFICATION_CHANNEL', lang)
      .pipe(
        tap((options) => this.channelOptionsSignal.set(options)),
        catchError(() => {
          this.channelOptionsSignal.set([]);
          return EMPTY;
        }),
        finalize(() => this.channelOptionsLoadingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  // --- List Operations ---

  applyGridStateAndLoad(params: {
    page: number;
    size: number;
    sortBy?: string;
    sortDir?: string;
    filter?: NotificationTemplateSearchFilter;
  }): void {
    const filter = params.filter ?? this.currentFiltersSignal();
    this.currentFiltersSignal.set(filter);

    const request: NotificationTemplateSearchRequest = {
      filters: [],
      sorts: params.sortBy
        ? [{ field: params.sortBy, direction: (params.sortDir as 'ASC' | 'DESC') ?? 'ASC' }]
        : this.lastSearchRequestSignal().sorts,
      page: params.page,
      size: params.size,
      templateCode: filter.templateCode || undefined,
      channelTypeId: filter.channelTypeId || undefined,
      moduleCode: filter.moduleCode || undefined,
      isActiveFl: filter.isActiveFl
    };
    this.executeSearch(request);
  }

  private executeSearch(request: NotificationTemplateSearchRequest): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.lastSearchRequestSignal.set(request);

    this.apiService
      .search(request)
      .pipe(
        tap((response) => {
          this.templatesSignal.set(response?.content ?? []);
          this.totalElementsSignal.set(response?.totalElements ?? 0);
        }),
        catchError((error) => {
          this.handleError(error, this.errorSignal);
          this.templatesSignal.set([]);
          this.totalElementsSignal.set(0);
          return EMPTY;
        }),
        finalize(() => this.loadingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  /** Reload using the last-used search request (e.g. after a save/deactivate). */
  private reload(): void {
    this.executeSearch(this.lastSearchRequestSignal());
  }

  // --- CRUD Operations ---

  getById(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.apiService
      .getById(id)
      .pipe(
        tap((template) => this.currentTemplateSignal.set(template)),
        catchError((error) => {
          this.handleError(error, this.errorSignal);
          this.currentTemplateSignal.set(null);
          return EMPTY;
        }),
        finalize(() => this.loadingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  create(request: CreateNotificationTemplateRequest, onSuccess?: (template: NotificationTemplateDto) => void): void {
    this.savingSignal.set(true);
    this.saveErrorSignal.set(null);

    this.apiService
      .create(request)
      .pipe(
        tap((template) => {
          this.currentTemplateSignal.set(template);
          this.reload();
          onSuccess?.(template);
        }),
        catchError((error) => {
          this.handleError(error, this.saveErrorSignal);
          return EMPTY;
        }),
        finalize(() => this.savingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  update(id: number, request: UpdateNotificationTemplateRequest, onSuccess?: (template: NotificationTemplateDto) => void): void {
    this.savingSignal.set(true);
    this.saveErrorSignal.set(null);

    this.apiService
      .update(id, request)
      .pipe(
        tap((template) => {
          this.currentTemplateSignal.set(template);
          this.reload();
          onSuccess?.(template);
        }),
        catchError((error) => {
          this.handleError(error, this.saveErrorSignal);
          return EMPTY;
        }),
        finalize(() => this.savingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  deactivate(id: number, onSuccess?: (template: NotificationTemplateDto) => void): void {
    this.savingSignal.set(true);
    this.saveErrorSignal.set(null);

    this.apiService
      .deactivate(id)
      .pipe(
        tap((template) => {
          this.templatesSignal.update((list) => list.map((t) => (t.id === id ? template : t)));
          onSuccess?.(template);
        }),
        catchError((error) => {
          this.handleError(error, this.saveErrorSignal);
          return EMPTY;
        }),
        finalize(() => this.savingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  // --- Cleanup ---

  clearCurrentEntity(): void {
    this.currentTemplateSignal.set(null);
    this.saveErrorSignal.set(null);
    this.errorSignal.set(null);
  }

  // --- Error Handling ---

  private handleError(error: unknown, errorSignal: ReturnType<typeof signal<string | null>>): void {
    const backendCode = extractBackendErrorCode(error);
    const mappedKey = backendCode && this.errorMapper.hasMapping(backendCode) ? this.errorMapper.mapError(backendCode).translationKey : null;
    errorSignal.set(mappedKey || 'ERRORS.OPERATION_FAILED');
  }
}
