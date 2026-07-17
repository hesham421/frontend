import { TranslateService } from '@ngx-translate/core';
import { ColDef, GridOptions } from 'ag-grid-community';
import { NgZone } from '@angular/core';

import { ERP_DEFAULT_COL_DEF, createErpGridOptions, createActiveColumnDef, ActiveColumnLabels } from 'src/app/shared/ag-grid';

import { NotificationTemplateDto } from '../../models/notification-template.model';
import { NotificationTemplateActionsCellComponent } from '../../components/notification-template-actions-cell/notification-template-actions-cell.component';

/**
 * Creates column definitions for the Notification Template AG Grid (SCR-NOTIF-002).
 */
export function createNotificationTemplateColumnDefs(
  translate: TranslateService,
  zone: NgZone,
  callbacks: {
    onEdit: (template: NotificationTemplateDto) => void;
    onDeactivate: (template: NotificationTemplateDto) => void;
  }
): ColDef[] {
  const activeLabels: ActiveColumnLabels = {
    active: translate.instant('COMMON.ACTIVE'),
    inactive: translate.instant('COMMON.INACTIVE'),
    all: translate.instant('COMMON.ALL')
  };

  return [
    { field: 'templateCode', headerName: translate.instant('NOTIFICATION_TEMPLATES.TEMPLATE_CODE'), filter: 'agTextColumnFilter', maxWidth: 200, sortable: true, cellClass: 'avl-ag-cell-mono' },
    { field: 'templateNameEn', headerName: translate.instant('NOTIFICATION_TEMPLATES.NAME_EN'), filter: 'agTextColumnFilter', sortable: false, flex: 1 },
    { field: 'templateNameAr', headerName: translate.instant('NOTIFICATION_TEMPLATES.NAME_AR'), filter: 'agTextColumnFilter', sortable: false, flex: 1 },
    { field: 'channelTypeId', headerName: translate.instant('NOTIFICATION_TEMPLATES.CHANNEL'), filter: false, sortable: false, maxWidth: 160 },
    { field: 'moduleCode', headerName: translate.instant('NOTIFICATION_TEMPLATES.MODULE_CODE'), filter: 'agTextColumnFilter', sortable: false, maxWidth: 160 },
    createActiveColumnDef(activeLabels, {
      field: 'isActiveFl',
      headerName: translate.instant('COMMON.STATUS'),
      maxWidth: 120,
      floatingFilter: false,
      sortable: true
    }),
    {
      field: 'actions',
      headerName: translate.instant('COMMON.ACTIONS'),
      filter: false,
      sortable: false,
      maxWidth: 100,
      cellRenderer: NotificationTemplateActionsCellComponent,
      cellRendererParams: {
        onEdit: (template: NotificationTemplateDto) => zone.run(() => callbacks.onEdit(template)),
        onDeactivate: (template: NotificationTemplateDto) => zone.run(() => callbacks.onDeactivate(template))
      }
    }
  ];
}

export function createNotificationTemplateGridOptions(translate: TranslateService): {
  gridOptions: GridOptions;
  localeText: Record<string, string>;
} {
  const gridOptions = createErpGridOptions({
    enableRtl: translate.currentLang === 'ar',
    pageSize: 20
  });

  const localeText: Record<string, string> = {
    empty: translate.instant('COMMON.SELECT'),
    chooseOne: translate.instant('COMMON.SELECT'),
    true: translate.instant('COMMON.ACTIVE'),
    false: translate.instant('COMMON.INACTIVE')
  };

  return { gridOptions, localeText };
}

export { ERP_DEFAULT_COL_DEF };
