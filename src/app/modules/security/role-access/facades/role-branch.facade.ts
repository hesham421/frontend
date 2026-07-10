import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, finalize, tap } from 'rxjs';

import { ErpErrorMapperService } from 'src/app/shared/services/erp-error-mapper.service';
import { extractBackendErrorCode } from 'src/app/shared/utils/backend-error-message';

import { RoleBranchApiService } from '../services/role-branch-api.service';
import { BranchOptionDto, CreateRoleBranchRequest, RoleBranchDto, UpdateRoleBranchRequest } from '../models/role-branch.model';

/**
 * Backs SCR-SEC-002's Branch Scope sub-tab — a child grid of the currently open Role
 * (CORE-9: no new SCR-ID/route). Follows the HAS_CHILD facade convention: local signal
 * updates on assign/update/remove, no full reload.
 */
@Injectable() // NOT providedIn: 'root' — component-scoped
export class RoleBranchFacade {
  private readonly apiService = inject(RoleBranchApiService);
  private readonly errorMapper = inject(ErpErrorMapperService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly roleBranchesSignal = signal<RoleBranchDto[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  private readonly savingSignal = signal<boolean>(false);
  private readonly saveErrorSignal = signal<string | null>(null);

  private readonly activeBranchesSignal = signal<BranchOptionDto[]>([]);
  private readonly branchesLoadingSignal = signal<boolean>(false);

  readonly roleBranches = computed(() => this.roleBranchesSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly saving = computed(() => this.savingSignal());
  readonly saveError = computed(() => this.saveErrorSignal());
  readonly activeBranches = computed(() => this.activeBranchesSignal());
  readonly branchesLoading = computed(() => this.branchesLoadingSignal());

  /** Detail-list default per S.4.8: page 0, size 50 — this is a bounded child grid, not a paginated screen. */
  loadRoleBranches(roleId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const request = {
      filters: [{ field: 'roleIdFk', operator: 'EQUALS', value: roleId }],
      sorts: [{ field: 'branchIdFk', direction: 'ASC' as const }],
      page: 0,
      size: 50
    };

    this.apiService
      .search(request)
      .pipe(
        tap((response) => this.roleBranchesSignal.set(response?.content ?? [])),
        catchError((error) => {
          this.handleError(error, this.errorSignal);
          this.roleBranchesSignal.set([]);
          return EMPTY;
        }),
        finalize(() => this.loadingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  assign(request: CreateRoleBranchRequest, onSuccess?: (assignment: RoleBranchDto) => void): void {
    this.savingSignal.set(true);
    this.saveErrorSignal.set(null);

    this.apiService
      .assign(request)
      .pipe(
        tap((assignment) => {
          // LOCAL SIGNAL UPDATE — append, no full reload
          this.roleBranchesSignal.update((items) => [...items, assignment]);
          onSuccess?.(assignment);
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

  updateDataAccessLevel(roleId: number, branchId: number, request: UpdateRoleBranchRequest, onSuccess?: (assignment: RoleBranchDto) => void): void {
    this.savingSignal.set(true);
    this.saveErrorSignal.set(null);

    this.apiService
      .update(roleId, branchId, request)
      .pipe(
        tap((updated) => {
          // LOCAL SIGNAL UPDATE — map in-place, no full reload
          this.roleBranchesSignal.update((items) => items.map((i) => (i.branchIdFk === branchId ? updated : i)));
          onSuccess?.(updated);
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

  remove(roleId: number, branchId: number, onSuccess?: () => void): void {
    this.savingSignal.set(true);
    this.saveErrorSignal.set(null);

    this.apiService
      .remove(roleId, branchId)
      .pipe(
        tap(() => {
          // LOCAL SIGNAL UPDATE — filter out, no full reload
          this.roleBranchesSignal.update((items) => items.filter((i) => i.branchIdFk !== branchId));
          onSuccess?.();
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

  loadActiveBranches(): void {
    this.branchesLoadingSignal.set(true);

    this.apiService
      .searchActiveBranches()
      .pipe(
        tap((response) => this.activeBranchesSignal.set(response?.content ?? [])),
        catchError(() => {
          this.activeBranchesSignal.set([]);
          return EMPTY;
        }),
        finalize(() => this.branchesLoadingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  resetChildState(): void {
    this.roleBranchesSignal.set([]);
    this.loadingSignal.set(false);
    this.errorSignal.set(null);
    this.saveErrorSignal.set(null);
  }

  private handleError(error: unknown, errorSignal: ReturnType<typeof signal<string | null>>): void {
    const backendCode = extractBackendErrorCode(error);
    const mappedKey = backendCode && this.errorMapper.hasMapping(backendCode) ? this.errorMapper.mapError(backendCode).translationKey : null;
    errorSignal.set(mappedKey || 'ERRORS.OPERATION_FAILED');
  }
}
