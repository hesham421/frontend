import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { TranslateModule } from '@ngx-translate/core';

import { ErpPermissionDirective } from 'src/app/shared/directives/erp-permission.directive';
import { AvlIconButtonComponent } from 'src/app/shared/buttons/avl-icon-button/avl-icon-button.component';
import { UserDto } from '../../models/user.model';

export type UserActionsCellRendererParams = ICellRendererParams<UserDto> & {
  onEdit: (user: UserDto) => void;
  onDelete: (user: UserDto) => void;
};

@Component({
  selector: 'app-user-actions-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslateModule, ErpPermissionDirective, AvlIconButtonComponent],
  template: `
    @if (user; as u) {
    <div class="d-flex align-items-center gap-1">
      <avl-icon-button
        icon="ti ti-edit"
        variant="ghost"
        size="sm"
        erpPermission="PERM_USER_UPDATE"
        [label]="'COMMON.EDIT' | translate"
        (clicked)="onEditClick($event, u)"
      />

      <avl-icon-button
        icon="ti ti-trash"
        variant="ghost"
        size="sm"
        erpPermission="PERM_USER_DELETE"
        [label]="'COMMON.DELETE' | translate"
        (clicked)="onDeleteClick($event, u)"
      />
    </div>
    }
  `
})
export class UserActionsCellComponent implements ICellRendererAngularComp {
  private params!: UserActionsCellRendererParams;
  user: UserDto | null = null;

  agInit(params: UserActionsCellRendererParams): void {
    this.params = params;
    this.user = params.data ?? null;
  }

  refresh(params: UserActionsCellRendererParams): boolean {
    this.agInit(params);
    return true;
  }

  onEditClick(event: MouseEvent, user: UserDto): void {
    event.stopPropagation();
    this.params.onEdit(user);
  }

  onDeleteClick(event: MouseEvent, user: UserDto): void {
    event.stopPropagation();
    this.params.onDelete(user);
  }
}
