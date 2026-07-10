import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { TranslateModule } from '@ngx-translate/core';

import { ErpPermissionDirective } from 'src/app/shared/directives/erp-permission.directive';
import { AvlIconButtonComponent } from 'src/app/shared/buttons/avl-icon-button/avl-icon-button.component';
import { UserProfileDto } from '../../models/user-profile.model';

export type UserProfileActionsCellRendererParams = ICellRendererParams<UserProfileDto> & {
  onEdit: (profile: UserProfileDto) => void;
};

/**
 * No delete action — SEC_USER_PROFILE has no DELETE endpoint (per execution-plan-SEC-gaps.md
 * Section 8.1: profiles deactivate via isActiveFl through UPDATE, not DELETE).
 */
@Component({
  selector: 'app-user-profile-actions-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslateModule, ErpPermissionDirective, AvlIconButtonComponent],
  template: `
    @if (profile; as p) {
    <div class="d-flex align-items-center gap-1">
      <avl-icon-button
        icon="ti ti-edit"
        variant="ghost"
        size="sm"
        erpPermission="PERM_USER_PROFILE_UPDATE"
        [label]="'COMMON.EDIT' | translate"
        (clicked)="onEditClick($event, p)"
      />
    </div>
    }
  `
})
export class UserProfileActionsCellComponent implements ICellRendererAngularComp {
  private params!: UserProfileActionsCellRendererParams;
  profile: UserProfileDto | null = null;

  agInit(params: UserProfileActionsCellRendererParams): void {
    this.params = params;
    this.profile = params.data ?? null;
  }

  refresh(params: UserProfileActionsCellRendererParams): boolean {
    this.agInit(params);
    return true;
  }

  onEditClick(event: MouseEvent, profile: UserProfileDto): void {
    event.stopPropagation();
    this.params.onEdit(profile);
  }
}
