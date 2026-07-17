import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, finalize, tap } from 'rxjs';

import { ErpErrorMapperService } from 'src/app/shared/services/erp-error-mapper.service';
import { extractBackendErrorCode } from 'src/app/shared/utils/backend-error-message';

import { NotificationChannelConfigApiService } from '../services/notification-channel-config-api.service';
import { NotificationChannelConfigDto, UpdateNotificationChannelConfigRequest } from '../models/notification-channel-config.model';

/**
 * State + orchestration for SCR-NOTIF-003 (Channel Configuration, PATTERN-2 inline
 * toggle list, 5 fixed rows). No search/pagination/LOV state — matches F2.md's facade
 * spec exactly: Init calls API-NOTIF-011, toggle()/saveConfig() both call API-NOTIF-012.
 */
@Injectable() // NOT providedIn: 'root' — component-scoped
export class NotificationChannelConfigFacade {
  private readonly apiService = inject(NotificationChannelConfigApiService);
  private readonly errorMapper = inject(ErpErrorMapperService);
  private readonly destroyRef = inject(DestroyRef);

  // --- Primary List State (5 fixed rows) ---
  private readonly configsSignal = signal<NotificationChannelConfigDto[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // --- Write State — per-row, per F2.md's "spinner on the specific row's toggle/save control only" ---
  private readonly savingIdSignal = signal<number | null>(null);
  private readonly saveErrorSignal = signal<string | null>(null);

  // --- Public Computed ---
  readonly configs = computed(() => this.configsSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly savingId = computed(() => this.savingIdSignal());
  readonly saveError = computed(() => this.saveErrorSignal());

  // --- Init ---

  loadConfigs(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.apiService
      .listAll()
      .pipe(
        tap((configs) => this.configsSignal.set(configs ?? [])),
        catchError((error) => {
          this.handleError(error, this.errorSignal);
          this.configsSignal.set([]);
          return EMPTY;
        }),
        finalize(() => this.loadingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  // --- Operations (both API-NOTIF-012) ---

  toggle(id: number, isEnabledFl: boolean, onSuccess?: (config: NotificationChannelConfigDto) => void): void {
    const current = this.configsSignal().find((c) => c.id === id);
    this.sendUpdate(id, { isEnabledFl, configJson: current?.configJson }, onSuccess);
  }

  saveConfig(id: number, configJson: string, onSuccess?: (config: NotificationChannelConfigDto) => void): void {
    const current = this.configsSignal().find((c) => c.id === id);
    this.sendUpdate(id, { isEnabledFl: current?.isEnabledFl ?? false, configJson }, onSuccess);
  }

  private sendUpdate(
    id: number,
    request: UpdateNotificationChannelConfigRequest,
    onSuccess?: (config: NotificationChannelConfigDto) => void
  ): void {
    this.savingIdSignal.set(id);
    this.saveErrorSignal.set(null);

    this.apiService
      .update(id, request)
      .pipe(
        tap((updated) => {
          // LOCAL SIGNAL UPDATE — map in-place, no full reload
          this.configsSignal.update((list) => list.map((c) => (c.id === id ? updated : c)));
          onSuccess?.(updated);
        }),
        catchError((error) => {
          this.handleError(error, this.saveErrorSignal);
          return EMPTY;
        }),
        finalize(() => this.savingIdSignal.set(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  // --- Error Handling ---

  private handleError(error: unknown, errorSignal: ReturnType<typeof signal<string | null>>): void {
    const backendCode = extractBackendErrorCode(error);
    const mappedKey = backendCode && this.errorMapper.hasMapping(backendCode) ? this.errorMapper.mapError(backendCode).translationKey : null;
    errorSignal.set(mappedKey || 'ERRORS.OPERATION_FAILED');
  }
}
