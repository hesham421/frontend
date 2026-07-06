import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { TranslateModule } from '@ngx-translate/core';

import { ErpPermissionDirective } from 'src/app/shared/directives/erp-permission.directive';
import { AvlIconButtonComponent } from 'src/app/shared/buttons/avl-icon-button/avl-icon-button.component';
import { MasterLookupDto } from '../../models/master-lookup.model';

export type MasterLookupActionsCellParams = ICellRendererParams<MasterLookupDto> & {
  onEdit: (lookup: MasterLookupDto) => void;
  onToggleActive: (lookup: MasterLookupDto) => void;
  onDelete: (lookup: MasterLookupDto) => void;
};

@Component({
  selector: 'app-master-lookup-actions-cell',
  standalone: true,
  imports: [CommonModule, TranslateModule, ErpPermissionDirective, AvlIconButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (lookup; as l) {
    <div class="d-flex align-items-center gap-1">
      <avl-icon-button
        icon="ti ti-edit"
        variant="ghost"
        size="sm"
        erpPermission="PERM_MASTER_LOOKUP_UPDATE"
        [label]="'COMMON.EDIT' | translate"
        (clicked)="onEditClick($event, l)"
      />

      <avl-icon-button
        [icon]="l.isActive ? 'ti ti-toggle-right' : 'ti ti-toggle-left'"
        variant="ghost"
        size="sm"
        erpPermission="PERM_MASTER_LOOKUP_UPDATE"
        [label]="(l.isActive ? 'MASTER_LOOKUPS.DEACTIVATE' : 'MASTER_LOOKUPS.ACTIVATE') | translate"
        (clicked)="onToggleActiveClick($event, l)"
      />

      <avl-icon-button
        icon="ti ti-trash"
        variant="ghost"
        size="sm"
        erpPermission="PERM_MASTER_LOOKUP_DELETE"
        [label]="'COMMON.DELETE' | translate"
        (clicked)="onDeleteClick($event, l)"
      />
    </div>
    }
  `
})
export class MasterLookupActionsCellComponent implements ICellRendererAngularComp {
  private params!: MasterLookupActionsCellParams;
  lookup: MasterLookupDto | null = null;

  agInit(params: MasterLookupActionsCellParams): void {
    this.params = params;
    this.lookup = params.data ?? null;
  }

  refresh(params: MasterLookupActionsCellParams): boolean {
    this.agInit(params);
    return true;
  }

  onEditClick(event: MouseEvent, lookup: MasterLookupDto): void {
    event.stopPropagation();
    this.params.onEdit(lookup);
  }

  onToggleActiveClick(event: MouseEvent, lookup: MasterLookupDto): void {
    event.stopPropagation();
    this.params.onToggleActive(lookup);
  }

  onDeleteClick(event: MouseEvent, lookup: MasterLookupDto): void {
    event.stopPropagation();
    this.params.onDelete(lookup);
  }
}
