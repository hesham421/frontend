import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { TranslateModule } from '@ngx-translate/core';

import { ErpPermissionDirective } from 'src/app/shared/directives/erp-permission.directive';
import { AvlIconButtonComponent } from 'src/app/shared/buttons/avl-icon-button/avl-icon-button.component';
import { NotificationTemplateDto } from '../../models/notification-template.model';

export type NotificationTemplateActionsCellRendererParams = ICellRendererParams<NotificationTemplateDto> & {
  onEdit: (template: NotificationTemplateDto) => void;
  onDeactivate: (template: NotificationTemplateDto) => void;
};

/** Deactivate only (API-NOTIF-009) — no delete endpoint exists for NOTIF_TEMPLATE. */
@Component({
  selector: 'app-notification-template-actions-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslateModule, ErpPermissionDirective, AvlIconButtonComponent],
  template: `
    @if (template; as t) {
    <div class="d-flex align-items-center gap-1">
      <avl-icon-button
        icon="ti ti-eye"
        variant="ghost"
        size="sm"
        erpPermission="PERM_NOTIFICATION_TEMPLATE_VIEW"
        [label]="'COMMON.VIEW' | translate"
        (clicked)="onEditClick($event, t)"
      />
      @if (t.isActiveFl) {
        <avl-icon-button
          icon="ti ti-power"
          variant="ghost"
          size="sm"
          erpPermission="PERM_NOTIFICATION_TEMPLATE_UPDATE"
          [label]="'COMMON.DEACTIVATE' | translate"
          (clicked)="onDeactivateClick($event, t)"
        />
      }
    </div>
    }
  `
})
export class NotificationTemplateActionsCellComponent implements ICellRendererAngularComp {
  private params!: NotificationTemplateActionsCellRendererParams;
  template: NotificationTemplateDto | null = null;

  agInit(params: NotificationTemplateActionsCellRendererParams): void {
    this.params = params;
    this.template = params.data ?? null;
  }

  refresh(params: NotificationTemplateActionsCellRendererParams): boolean {
    this.agInit(params);
    return true;
  }

  onEditClick(event: MouseEvent, template: NotificationTemplateDto): void {
    event.stopPropagation();
    this.params.onEdit(template);
  }

  onDeactivateClick(event: MouseEvent, template: NotificationTemplateDto): void {
    event.stopPropagation();
    this.params.onDeactivate(template);
  }
}
