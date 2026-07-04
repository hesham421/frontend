import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ErpNotificationService } from 'src/app/shared/services/erp-notification.service';
import { AvlToastContainerComponent, AvlToastItem } from 'src/app/shared/feedback/avl-toast/avl-toast-container.component';

/**
 * ErpNotificationContainerComponent
 *
 * Renders ErpNotificationService's notifications through the AVELYNQ Toast
 * extension (Phase 4). The service's public API
 * (show/success/error/warning/info/dismiss/dismissAll) is unchanged —
 * only this container's internal per-item markup was rebuilt.
 */
@Component({
  selector: 'erp-notification-container',
  standalone: true,
  imports: [CommonModule, TranslateModule, AvlToastContainerComponent],
  templateUrl: './erp-notification-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErpNotificationContainerComponent {
  private readonly notificationsService = inject(ErpNotificationService);
  private readonly translate = inject(TranslateService);

  readonly items = computed<AvlToastItem[]>(() =>
    this.notificationsService.notifications().map((n) => ({
      id: n.id,
      tone: n.type === 'error' ? 'danger' : n.type,
      message: this.translate.instant(n.messageKey, n.messageParams),
      dismissible: n.dismissible
    }))
  );

  dismiss(id: number): void {
    this.notificationsService.dismiss(id);
  }
}
