import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed, NgZone, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent, GridApi } from 'ag-grid-community';

import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { ThemeService } from 'src/app/theme/shared/service/customs-theme.service';
import { createAgGridTheme } from 'src/app/shared/ag-grid/agGridTableStyle';
import { registerErpAgGridModules } from 'src/app/shared/ag-grid';
import { ErpEmptyStateComponent } from 'src/app/shared/components/erp-empty-state/erp-empty-state.component';
import { ErpPermissionDirective } from 'src/app/shared/directives/erp-permission.directive';
import { AvlButtonComponent } from 'src/app/shared/buttons/avl-button/avl-button.component';
import { ErpListComponent } from 'src/app/shared/base/erp-list.component';
import { ErpGridState } from 'src/app/shared/models';

import { UserProfileFacade } from '../../facades/user-profile.facade';
import { UserProfileApiService } from '../../services/user-profile-api.service';
import { UserProfileDto } from '../../models/user-profile.model';
import { createUserProfileColumnDefs, createUserProfileGridOptions, ERP_DEFAULT_COL_DEF } from './user-profile-grid.config';

registerErpAgGridModules();

/**
 * UserProfileSearchComponent (SCR-SEC-006 — ملفات المستخدمين / نطاق البيانات)
 * Phase F2 (PLAN-SEC-002): real search grid, backed by UserProfileFacade (search → API-SEC-033).
 * @plan PLAN-SEC-002 @phase F2 @scr SCR-SEC-006
 */
@Component({
  selector: 'app-user-profile-search',
  standalone: true,
  imports: [CommonModule, TranslateModule, CardComponent, AgGridAngular, ErpEmptyStateComponent, ErpPermissionDirective, AvlButtonComponent],
  templateUrl: './user-profile-search.component.html',
  styleUrls: ['./user-profile-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UserProfileFacade, UserProfileApiService]
})
export class UserProfileSearchComponent extends ErpListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);
  private readonly themeService = inject(ThemeService);
  private readonly zone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly facade = inject(UserProfileFacade);

  private gridApi!: GridApi;

  readonly rowData = computed(() => this.facade.profiles());
  readonly totalRows = computed(() => this.facade.totalElements());
  readonly isLoading = computed(() => this.facade.loading());
  readonly hasError = computed(() => !!this.facade.error());

  columnDefs = signal<ColDef[]>([]);
  defaultColDef: ColDef = ERP_DEFAULT_COL_DEF;
  gridOptions = signal<GridOptions>(createUserProfileGridOptions(this.translate).gridOptions);
  agLocaleText = signal<Record<string, string>>({});
  theme = signal(createAgGridTheme(this.themeService.isDarkMode()));

  private rebuildTranslatedUiConfig(): void {
    this.columnDefs.set(
      createUserProfileColumnDefs(this.translate, this.zone, {
        onEdit: (profile) => this.navigateToEdit(profile)
      })
    );

    const gridResult = createUserProfileGridOptions(this.translate);
    this.gridOptions.set(gridResult.gridOptions);
    this.agLocaleText.set(gridResult.localeText);
  }

  ngOnInit(): void {
    this.rebuildTranslatedUiConfig();
    this.initErpList();

    this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.rebuildTranslatedUiConfig();
      this.cdr.markForCheck();
    });
  }

  protected load(state: ErpGridState): void {
    this.facade.applyGridStateAndLoad({
      page: state.page,
      size: state.size,
      sortBy: state.sort ?? 'userIdFk',
      sortDir: state.direction ?? 'ASC'
    });
  }

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
  }

  onPaginationChanged(): void {
    if (this.gridApi) {
      const newPage = this.gridApi.paginationGetCurrentPage();
      if (newPage !== this.gridState().page) this.setPage(newPage);
    }
  }

  navigateToEdit(profile: UserProfileDto): void {
    this.router.navigate(['./', 'edit', profile.userIdFk], { relativeTo: this.route });
  }

  onCreateNew(): void {
    this.router.navigate(['./', 'create'], { relativeTo: this.route });
  }
}
