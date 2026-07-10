import { TranslateService } from '@ngx-translate/core';
import { ColDef, GridOptions } from 'ag-grid-community';
import { NgZone } from '@angular/core';

import { ERP_DEFAULT_COL_DEF, createErpGridOptions, createActiveColumnDef, ActiveColumnLabels } from 'src/app/shared/ag-grid';

import { UserProfileDto } from '../../models/user-profile.model';
import { UserProfileActionsCellComponent } from '../../components/user-profile-actions-cell/user-profile-actions-cell.component';

/**
 * Creates column definitions for the User Profile AG Grid (SCR-SEC-006).
 */
export function createUserProfileColumnDefs(
  translate: TranslateService,
  zone: NgZone,
  callbacks: { onEdit: (profile: UserProfileDto) => void }
): ColDef[] {
  const activeLabels: ActiveColumnLabels = {
    active: translate.instant('COMMON.ACTIVE'),
    inactive: translate.instant('COMMON.INACTIVE'),
    all: translate.instant('COMMON.ALL')
  };

  return [
    { field: 'userIdFk', headerName: translate.instant('USER_PROFILES.USER_ID'), filter: 'agNumberColumnFilter', maxWidth: 120, sortable: true, cellClass: 'avl-ag-cell-mono' },
    { field: 'branchIdFk', headerName: translate.instant('USER_PROFILES.BRANCH_ID'), filter: 'agNumberColumnFilter', maxWidth: 140, sortable: true, cellClass: 'avl-ag-cell-mono' },
    { field: 'fullNameEn', headerName: translate.instant('USER_PROFILES.FULL_NAME_EN'), filter: 'agTextColumnFilter', sortable: false, flex: 1 },
    { field: 'fullNameAr', headerName: translate.instant('USER_PROFILES.FULL_NAME_AR'), filter: 'agTextColumnFilter', sortable: false, flex: 1 },
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
      cellRenderer: UserProfileActionsCellComponent,
      cellRendererParams: {
        onEdit: (profile: UserProfileDto) => zone.run(() => callbacks.onEdit(profile))
      }
    }
  ];
}

/**
 * Creates grid options for the User Profile AG Grid.
 */
export function createUserProfileGridOptions(translate: TranslateService): {
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

/** Re-export default column definition */
export { ERP_DEFAULT_COL_DEF };
