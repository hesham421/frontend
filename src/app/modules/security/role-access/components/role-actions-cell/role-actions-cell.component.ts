import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { TranslateModule } from '@ngx-translate/core';

import { ErpPermissionDirective } from 'src/app/shared/directives/erp-permission.directive';
import { AvlIconButtonComponent } from 'src/app/shared/buttons/avl-icon-button/avl-icon-button.component';
import { RoleDto } from '../../models/role-access.model';

export type RoleActionsCellRendererParams = ICellRendererParams<RoleDto> & {
  onEdit: (role: RoleDto) => void;
  onToggleActive: (role: RoleDto) => void;
  onDelete: (role: RoleDto) => void;
};

@Component({
  selector: 'app-role-actions-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslateModule, ErpPermissionDirective, AvlIconButtonComponent],
  template: `
    @if (role; as r) {
    <div class="d-flex align-items-center gap-1">
      <avl-icon-button
        icon="ti ti-edit"
        variant="ghost"
        size="sm"
        erpPermission="ROLE.UPDATE"
        [label]="'COMMON.EDIT' | translate"
        (clicked)="onEditClick($event, r)"
      />

      <avl-icon-button
        [icon]="r.active ? 'ti ti-toggle-right' : 'ti ti-toggle-left'"
        variant="ghost"
        size="sm"
        erpPermission="ROLE.DELETE"
        [label]="(r.active ? 'COMMON.DEACTIVATE' : 'COMMON.ACTIVATE') | translate"
        (clicked)="onToggleActiveClick($event, r)"
      />

      <avl-icon-button
        icon="ti ti-trash"
        variant="ghost"
        size="sm"
        erpPermission="ROLE.DELETE"
        [label]="'COMMON.DELETE' | translate"
        (clicked)="onDeleteClick($event, r)"
      />
    </div>
    }
  `
})
export class RoleActionsCellComponent implements ICellRendererAngularComp {
  private params!: RoleActionsCellRendererParams;
  role: RoleDto | null = null;

  agInit(params: RoleActionsCellRendererParams): void {
    this.params = params;
    this.role = params.data ?? null;
  }

  refresh(params: RoleActionsCellRendererParams): boolean {
    this.agInit(params);
    return true;
  }

  onEditClick(event: MouseEvent, role: RoleDto): void {
    event.stopPropagation();
    this.params.onEdit(role);
  }

  onToggleActiveClick(event: MouseEvent, role: RoleDto): void {
    event.stopPropagation();
    this.params.onToggleActive(role);
  }

  onDeleteClick(event: MouseEvent, role: RoleDto): void {
    event.stopPropagation();
    this.params.onDelete(role);
  }
}
