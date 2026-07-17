import { TranslateService } from '@ngx-translate/core';
import { ColDef, GridOptions } from 'ag-grid-community';

import { ERP_DEFAULT_COL_DEF, createErpGridOptions } from 'src/app/shared/ag-grid';

import { NotificationLogDto } from '../../models/notification-log.model';

/**
 * Column definitions for the Notification History AG Grid (SCR-NOTIF-001).
 * No actions column — mark-as-read is GOVERNANCE-NOTE-BLOCKED (API-NOTIF-005,
 * DRV-NOTIF-003), so this is a read-only history list.
 */
export function createNotificationHistoryColumnDefs(translate: TranslateService): ColDef<NotificationLogDto>[] {
  return [
    { field: 'subject', headerName: translate.instant('NOTIFICATIONS.SUBJECT'), filter: 'agTextColumnFilter', sortable: false, flex: 1 },
    { field: 'templateCode', headerName: translate.instant('NOTIFICATIONS.TEMPLATE_CODE'), filter: 'agTextColumnFilter', sortable: false, maxWidth: 180, cellClass: 'avl-ag-cell-mono' },
    { field: 'notificationTypeId', headerName: translate.instant('NOTIFICATIONS.TYPE'), filter: false, sortable: false, maxWidth: 160 },
    { field: 'notificationStatusId', headerName: translate.instant('NOTIFICATIONS.STATUS'), filter: false, sortable: false, maxWidth: 140 },
    { field: 'sentAt', headerName: translate.instant('NOTIFICATIONS.SENT_AT'), filter: false, sortable: true, maxWidth: 180 },
    { field: 'createdAt', headerName: translate.instant('NOTIFICATIONS.CREATED_AT'), filter: false, sortable: true, maxWidth: 180 }
  ];
}

export function createNotificationHistoryGridOptions(translate: TranslateService): {
  gridOptions: GridOptions;
  localeText: Record<string, string>;
} {
  const gridOptions = createErpGridOptions({
    enableRtl: translate.currentLang === 'ar',
    pageSize: 20
  });

  const localeText: Record<string, string> = {
    empty: translate.instant('COMMON.SELECT'),
    chooseOne: translate.instant('COMMON.SELECT')
  };

  return { gridOptions, localeText };
}

export { ERP_DEFAULT_COL_DEF };
