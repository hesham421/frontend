import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent, GridApi } from 'ag-grid-community';

import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { ThemeService } from 'src/app/theme/shared/service/customs-theme.service';
import { createAgGridTheme } from 'src/app/shared/ag-grid/agGridTableStyle';
import { registerErpAgGridModules } from 'src/app/shared/ag-grid';
import { ErpEmptyStateComponent } from 'src/app/shared/components/erp-empty-state/erp-empty-state.component';
import { AvlSelectComponent } from 'src/app/shared/forms/avl-select/avl-select.component';
import { AvlButtonComponent } from 'src/app/shared/buttons/avl-button/avl-button.component';
import { ErpListComponent } from 'src/app/shared/base/erp-list.component';
import { ErpGridState } from 'src/app/shared/models';

import { NotificationInboxFacade } from '../../facades/notification-inbox.facade';
import { NotificationInboxApiService } from '../../services/notification-inbox-api.service';
import { NotificationHistoryFilter } from '../../models/notification-log.model';
import { createNotificationHistoryColumnDefs, createNotificationHistoryGridOptions, ERP_DEFAULT_COL_DEF } from './notification-history-grid.config';

registerErpAgGridModules();

/**
 * NotificationHistoryComponent (SCR-NOTIF-001 — full history list).
 * PATTERN-3 (Specialized): no Search/Entry split (F4-RULE-5 N/A). Read-only —
 * mark-as-read is GOVERNANCE-NOTE-BLOCKED (API-NOTIF-005, DRV-NOTIF-003).
 * @plan execution-plan.md @phase F4 @scr SCR-NOTIF-001
 */
@Component({
  selector: 'app-notification-history',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CardComponent, AgGridAngular, ErpEmptyStateComponent, AvlSelectComponent, AvlButtonComponent],
  templateUrl: './notification-history.component.html',
  styleUrls: ['./notification-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NotificationInboxFacade, NotificationInboxApiService]
})
export class NotificationHistoryComponent extends ErpListComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly themeService = inject(ThemeService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly facade = inject(NotificationInboxFacade);

  private gridApi!: GridApi;

  readonly rowData = computed(() => this.facade.notifications());
  readonly totalRows = computed(() => this.facade.totalElements());
  readonly isLoading = computed(() => this.facade.loading());
  readonly hasError = computed(() => !!this.facade.error());
  readonly channelOptions = computed(() => this.facade.channelOptions());
  readonly statusOptions = computed(() => this.facade.statusOptions());

  columnDefs = signal<ColDef[]>([]);
  defaultColDef: ColDef = ERP_DEFAULT_COL_DEF;
  gridOptions = signal<GridOptions>(createNotificationHistoryGridOptions(this.translate).gridOptions);
  agLocaleText = signal<Record<string, string>>({});
  theme = signal(createAgGridTheme(this.themeService.isDarkMode()));

  // Filter panel state (not form-bound — plain signals, mapped to
  // NotificationHistoryFilter on Search per the facade's applyGridStateAndLoad contract)
  filterTypeId = signal<string>('');
  filterStatusId = signal<string>('');
  filterDateFrom = signal<string>('');
  filterDateTo = signal<string>('');

  private rebuildTranslatedUiConfig(): void {
    this.columnDefs.set(createNotificationHistoryColumnDefs(this.translate));

    const gridResult = createNotificationHistoryGridOptions(this.translate);
    this.gridOptions.set(gridResult.gridOptions);
    this.agLocaleText.set(gridResult.localeText);
  }

  ngOnInit(): void {
    this.rebuildTranslatedUiConfig();
    this.facade.loadLovOptions();
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
      sortBy: state.sort ?? 'createdAt',
      sortDir: state.direction ?? 'DESC',
      filter: this.currentFilter()
    });
  }

  private currentFilter(): NotificationHistoryFilter {
    return {
      notificationTypeId: this.filterTypeId() || undefined,
      notificationStatusId: this.filterStatusId() || undefined,
      dateFrom: this.filterDateFrom() || undefined,
      dateTo: this.filterDateTo() || undefined
    };
  }

  onSearch(): void {
    this.setPage(0);
    this.reload();
  }

  onClearFilters(): void {
    this.filterTypeId.set('');
    this.filterStatusId.set('');
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.facade.resetFilter();
    this.setPage(0);
    this.reload();
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
}
