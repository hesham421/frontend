import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, catchError, finalize, tap } from 'rxjs';

import { ErpErrorMapperService } from 'src/app/shared/services/erp-error-mapper.service';
import { extractBackendErrorCode } from 'src/app/shared/utils/backend-error-message';
import { LookupService } from 'src/app/core/services/lookup.service';
import { LookupSelectOption } from 'src/app/core/models/lookup-detail.model';

import { NotificationInboxApiService } from '../services/notification-inbox-api.service';
import {
  ContractFilter,
  NotificationHistoryFilter,
  NotificationHistorySearchRequest,
  NotificationLogDto
} from '../models/notification-log.model';

/**
 * State + orchestration for SCR-NOTIF-001 (Bell + History). Per F2.md's facade spec,
 * Init loads LOV-NOTIF-001/002 options and calls API-NOTIF-003 for the current user's
 * history; the bell/unread-count init step is deliberately DEFERRED (DRV-NOTIF-003) —
 * no unread/markAsRead state lives here, only on NotificationInboxApiService.
 *
 * F2.md names the LOV loader "LovService.loadOptions(...)" — no such service exists
 * in this codebase. The real, already-existing shared lookup service is LookupService
 * (core/services/lookup.service.ts, providedIn: 'root', getOptions(lookupKey, lang)) —
 * used here instead, same api-docs/reality precedent as this session's other fixes.
 */
@Injectable() // NOT providedIn: 'root' — component-scoped
export class NotificationInboxFacade {
  private readonly apiService = inject(NotificationInboxApiService);
  private readonly lookupService = inject(LookupService);
  private readonly translate = inject(TranslateService);
  private readonly errorMapper = inject(ErpErrorMapperService);
  private readonly destroyRef = inject(DestroyRef);

  // --- Primary List State ---
  private readonly notificationsSignal = signal<NotificationLogDto[]>([]);
  private readonly totalElementsSignal = signal<number>(0);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // --- Search State ---
  private readonly filterSignal = signal<NotificationHistoryFilter>({});
  private readonly lastSearchRequestSignal = signal<NotificationHistorySearchRequest>({
    filters: [],
    sorts: [{ field: 'createdAt', direction: 'DESC' }],
    page: 0,
    size: 20
  });

  // --- LOV State (LOV-NOTIF-001 / LOV-NOTIF-002) ---
  private readonly channelOptionsSignal = signal<LookupSelectOption[]>([]);
  private readonly statusOptionsSignal = signal<LookupSelectOption[]>([]);
  private readonly lovLoadingSignal = signal<boolean>(false);

  // --- Public Computed ---
  readonly notifications = computed(() => this.notificationsSignal());
  readonly totalElements = computed(() => this.totalElementsSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly filter = computed(() => this.filterSignal());
  readonly channelOptions = computed(() => this.channelOptionsSignal());
  readonly statusOptions = computed(() => this.statusOptionsSignal());
  readonly lovLoading = computed(() => this.lovLoadingSignal());

  // --- Derived from lastSearchRequestSignal (NOT separate writable signals) ---
  readonly currentPage = computed(() => this.lastSearchRequestSignal().page);
  readonly pageSize = computed(() => this.lastSearchRequestSignal().size);

  // --- LOV Init ---

  loadLovOptions(): void {
    this.lovLoadingSignal.set(true);
    const lang = this.translate.currentLang || 'ar';

    this.lookupService
      .getOptions('NOTIFICATION_CHANNEL', lang)
      .pipe(
        tap((options) => this.channelOptionsSignal.set(options)),
        catchError(() => {
          this.channelOptionsSignal.set([]);
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    this.lookupService
      .getOptions('NOTIFICATION_STATUS', lang)
      .pipe(
        tap((options) => this.statusOptionsSignal.set(options)),
        catchError(() => {
          this.statusOptionsSignal.set([]);
          return EMPTY;
        }),
        finalize(() => this.lovLoadingSignal.set(false)),
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
    filter?: NotificationHistoryFilter;
  }): void {
    const filter = params.filter ?? this.filterSignal();
    this.filterSignal.set(filter);

    const request = this.buildSearchRequest(
      filter,
      params.page,
      params.size,
      params.sortBy
        ? [{ field: params.sortBy, direction: (params.sortDir as 'ASC' | 'DESC') ?? 'ASC' }]
        : this.lastSearchRequestSignal().sorts
    );
    this.executeSearch(request);
  }

  private buildSearchRequest(
    filter: NotificationHistoryFilter,
    page: number,
    size: number,
    sorts?: NotificationHistorySearchRequest['sorts']
  ): NotificationHistorySearchRequest {
    const filters: ContractFilter[] = [];
    if (filter.dateFrom) {
      filters.push({ field: 'createdAt', operator: 'GTE', value: filter.dateFrom });
    }
    if (filter.dateTo) {
      filters.push({ field: 'createdAt', operator: 'LTE', value: filter.dateTo });
    }

    return {
      filters,
      sorts,
      page,
      size,
      notificationTypeId: filter.notificationTypeId || undefined,
      notificationStatusId: filter.notificationStatusId || undefined
    };
  }

  private executeSearch(request: NotificationHistorySearchRequest): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.lastSearchRequestSignal.set(request);

    this.apiService
      .searchHistory(request)
      .pipe(
        tap((response) => {
          this.notificationsSignal.set(response?.content ?? []);
          this.totalElementsSignal.set(response?.totalElements ?? 0);
        }),
        catchError((error) => {
          this.handleError(error, this.errorSignal);
          this.notificationsSignal.set([]);
          this.totalElementsSignal.set(0);
          return EMPTY;
        }),
        finalize(() => this.loadingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  // --- Cleanup ---

  resetFilter(): void {
    this.filterSignal.set({});
    this.errorSignal.set(null);
  }

  // --- Error Handling ---

  private handleError(error: unknown, errorSignal: ReturnType<typeof signal<string | null>>): void {
    const backendCode = extractBackendErrorCode(error);
    const mappedKey = backendCode && this.errorMapper.hasMapping(backendCode) ? this.errorMapper.mapError(backendCode).translationKey : null;
    errorSignal.set(mappedKey || 'ERRORS.OPERATION_FAILED');
  }
}
