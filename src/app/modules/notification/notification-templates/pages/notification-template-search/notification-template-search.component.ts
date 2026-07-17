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
import { ErpNotificationService } from 'src/app/shared/services/erp-notification.service';
import { ErpListComponent } from 'src/app/shared/base/erp-list.component';
import { ErpGridState } from 'src/app/shared/models';

import { NotificationTemplateFacade } from '../../facades/notification-template.facade';
import { NotificationTemplateApiService } from '../../services/notification-template-api.service';
import { NotificationTemplateDto } from '../../models/notification-template.model';
import { createNotificationTemplateColumnDefs, createNotificationTemplateGridOptions, ERP_DEFAULT_COL_DEF } from './notification-template-grid.config';

registerErpAgGridModules();

/**
 * NotificationTemplateSearchComponent (SCR-NOTIF-002 — Template Management, PATTERN-1).
 * @plan execution-plan.md @phase F4 @scr SCR-NOTIF-002
 */
@Component({
  selector: 'app-notification-template-search',
  standalone: true,
  imports: [CommonModule, TranslateModule, CardComponent, AgGridAngular, ErpEmptyStateComponent, ErpPermissionDirective, AvlButtonComponent],
  templateUrl: './notification-template-search.component.html',
  styleUrls: ['./notification-template-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NotificationTemplateFacade, NotificationTemplateApiService]
})
export class NotificationTemplateSearchComponent extends ErpListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);
  private readonly themeService = inject(ThemeService);
  private readonly zone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationService = inject(ErpNotificationService);

  readonly facade = inject(NotificationTemplateFacade);

  private gridApi!: GridApi;

  readonly rowData = computed(() => this.facade.templates());
  readonly totalRows = computed(() => this.facade.totalElements());
  readonly isLoading = computed(() => this.facade.loading());
  readonly hasError = computed(() => !!this.facade.error());

  columnDefs = signal<ColDef[]>([]);
  defaultColDef: ColDef = ERP_DEFAULT_COL_DEF;
  gridOptions = signal<GridOptions>(createNotificationTemplateGridOptions(this.translate).gridOptions);
  agLocaleText = signal<Record<string, string>>({});
  theme = signal(createAgGridTheme(this.themeService.isDarkMode()));

  private rebuildTranslatedUiConfig(): void {
    this.columnDefs.set(
      createNotificationTemplateColumnDefs(this.translate, this.zone, {
        onEdit: (template) => this.navigateToEdit(template),
        onDeactivate: (template) => this.onDeactivate(template)
      })
    );

    const gridResult = createNotificationTemplateGridOptions(this.translate);
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
      sortBy: state.sort ?? 'templateCode',
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

  navigateToEdit(template: NotificationTemplateDto): void {
    this.router.navigate(['./', template.id, 'edit'], { relativeTo: this.route });
  }

  onCreateNew(): void {
    this.router.navigate(['./', 'new'], { relativeTo: this.route });
  }

  onDeactivate(template: NotificationTemplateDto): void {
    this.facade.deactivate(template.id, () => {
      this.notificationService.success('MESSAGES.UPDATE_SUCCESS');
    });
  }
}
