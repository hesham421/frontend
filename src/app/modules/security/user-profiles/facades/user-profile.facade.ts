import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, finalize, tap } from 'rxjs';

import { ErpErrorMapperService } from 'src/app/shared/services/erp-error-mapper.service';
import { extractBackendErrorCode } from 'src/app/shared/utils/backend-error-message';

import { UserProfileApiService } from '../services/user-profile-api.service';
import {
  BranchOptionDto,
  ContractFilter,
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  UserProfileDto,
  UserProfileSearchRequest
} from '../models/user-profile.model';

export interface UserProfileSearchFilter {
  field: string;
  op: 'EQ' | 'LIKE';
  value?: string | number | boolean;
}

@Injectable() // NOT providedIn: 'root' — component-scoped
export class UserProfileFacade {
  private readonly apiService = inject(UserProfileApiService);
  private readonly errorMapper = inject(ErpErrorMapperService);
  private readonly destroyRef = inject(DestroyRef);

  private static readonly MAX_PAGE_SIZE = 50;

  // --- Primary List State ---
  private readonly profilesSignal = signal<UserProfileDto[]>([]);
  private readonly totalElementsSignal = signal<number>(0);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // --- Write State ---
  private readonly savingSignal = signal<boolean>(false);
  private readonly saveErrorSignal = signal<string | null>(null);

  // --- Search State ---
  private readonly currentFiltersSignal = signal<UserProfileSearchFilter[]>([]);
  private readonly lastSearchRequestSignal = signal<UserProfileSearchRequest>({
    filters: [],
    sorts: [{ field: 'userIdFk', direction: 'ASC' }],
    page: 0,
    size: 20
  });

  // --- Current Entity State ---
  private readonly currentProfileSignal = signal<UserProfileDto | null>(null);

  // --- Branch Dropdown State (XM-SEC-001, API-ORG-008) ---
  private readonly activeBranchesSignal = signal<BranchOptionDto[]>([]);
  private readonly branchesLoadingSignal = signal<boolean>(false);

  // --- Public Computed ---
  readonly profiles = computed(() => this.profilesSignal());
  readonly totalElements = computed(() => this.totalElementsSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly saving = computed(() => this.savingSignal());
  readonly saveError = computed(() => this.saveErrorSignal());
  readonly currentProfile = computed(() => this.currentProfileSignal());
  readonly activeBranches = computed(() => this.activeBranchesSignal());
  readonly branchesLoading = computed(() => this.branchesLoadingSignal());

  // --- Derived from lastSearchRequestSignal (NOT separate writable signals) ---
  readonly currentPage = computed(() => this.lastSearchRequestSignal().page);
  readonly pageSize = computed(() => this.lastSearchRequestSignal().size);
  readonly currentFilters = computed(() => this.currentFiltersSignal());

  // --- List Operations ---

  applyGridStateAndLoad(params: {
    page: number;
    size: number;
    sortBy?: string;
    sortDir?: string;
    filters?: UserProfileSearchFilter[];
  }): void {
    const filters = params.filters ?? this.currentFiltersSignal();
    this.currentFiltersSignal.set(filters);

    const request: UserProfileSearchRequest = {
      filters: this.toContractFilters(filters),
      sorts: params.sortBy
        ? [{ field: params.sortBy, direction: (params.sortDir as 'ASC' | 'DESC') ?? 'ASC' }]
        : this.lastSearchRequestSignal().sorts,
      page: params.page,
      size: params.size
    };
    this.executeSearch(request);
  }

  private toContractFilters(filters: UserProfileSearchFilter[]): ContractFilter[] {
    return filters
      .filter((f) => f.value !== undefined && f.value !== '')
      .map((f) => ({ field: f.field, operator: f.op === 'LIKE' ? 'CONTAINS' : 'EQUALS', value: f.value }));
  }

  private executeSearch(request: UserProfileSearchRequest): void {
    const safeRequest = {
      ...request,
      page: Math.max(0, request.page),
      size: Math.min(Math.max(1, request.size), UserProfileFacade.MAX_PAGE_SIZE)
    };

    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.lastSearchRequestSignal.set(safeRequest);

    this.apiService
      .search(safeRequest)
      .pipe(
        tap((response) => {
          this.profilesSignal.set(response?.content ?? []);
          this.totalElementsSignal.set(response?.totalElements ?? 0);
        }),
        catchError((error) => {
          this.handleError(error, this.errorSignal);
          this.profilesSignal.set([]);
          this.totalElementsSignal.set(0);
          return EMPTY;
        }),
        finalize(() => this.loadingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  // --- CRUD Operations ---

  getById(userId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.apiService
      .getById(userId)
      .pipe(
        tap((profile) => this.currentProfileSignal.set(profile)),
        catchError((error) => {
          this.handleError(error, this.errorSignal);
          this.currentProfileSignal.set(null);
          return EMPTY;
        }),
        finalize(() => this.loadingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  create(request: CreateUserProfileRequest, onSuccess?: (profile: UserProfileDto) => void): void {
    this.savingSignal.set(true);
    this.saveErrorSignal.set(null);

    this.apiService
      .create(request)
      .pipe(
        tap((profile) => {
          this.currentProfileSignal.set(profile);
          onSuccess?.(profile);
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

  update(userId: number, request: UpdateUserProfileRequest, onSuccess?: (profile: UserProfileDto) => void): void {
    this.savingSignal.set(true);
    this.saveErrorSignal.set(null);

    this.apiService
      .update(userId, request)
      .pipe(
        tap((profile) => {
          this.currentProfileSignal.set(profile);
          onSuccess?.(profile);
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

  // --- Cleanup ---

  clearCurrentEntity(): void {
    this.currentProfileSignal.set(null);
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
