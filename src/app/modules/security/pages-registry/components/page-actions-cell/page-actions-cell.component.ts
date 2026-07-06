import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { TranslateModule } from '@ngx-translate/core';

import { ErpPermissionDirective } from 'src/app/shared/directives/erp-permission.directive';
import { AvlIconButtonComponent } from 'src/app/shared/buttons/avl-icon-button/avl-icon-button.component';
import { PageDto } from '../../models/page.model';

export type PageActionsCellRendererParams = ICellRendererParams<PageDto> & {
  onEdit: (page: PageDto) => void;
  onDeactivate: (page: PageDto) => void;
};

@Component({
  selector: 'app-page-actions-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslateModule, ErpPermissionDirective, AvlIconButtonComponent],
  template: `
    @if (page; as p) {
    <div class="d-flex align-items-center gap-1">
      <avl-icon-button
        icon="ti ti-edit"
        variant="ghost"
        size="sm"
        erpPermission="PERM_PAGE_UPDATE"
        [label]="'COMMON.EDIT' | translate"
        (clicked)="onEditClick($event, p)"
      />

      <avl-icon-button
        [icon]="p.active ? 'ti ti-toggle-right' : 'ti ti-toggle-left'"
        variant="ghost"
        size="sm"
        erpPermission="PERM_PAGE_DELETE"
        [label]="(p.active ? 'PAGES.DEACTIVATE' : 'PAGES.ACTIVATE') | translate"
        (clicked)="onDeactivateClick($event, p)"
      />
    </div>
    }
  `
})
export class PageActionsCellComponent implements ICellRendererAngularComp {
  private params!: PageActionsCellRendererParams;
  page: PageDto | null = null;

  agInit(params: PageActionsCellRendererParams): void {
    this.params = params;
    this.page = params.data ?? null;
  }

  refresh(params: PageActionsCellRendererParams): boolean {
    this.agInit(params);
    return true;
  }

  onEditClick(event: MouseEvent, page: PageDto): void {
    event.stopPropagation();
    this.params.onEdit(page);
  }

  onDeactivateClick(event: MouseEvent, page: PageDto): void {
    event.stopPropagation();
    this.params.onDeactivate(page);
  }
}
