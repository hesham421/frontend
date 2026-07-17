import { Component, ChangeDetectionStrategy, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AvlDropdownDirective, AvlDropdownToggleDirective } from 'src/app/shared/overlay/dropdown/dropdown.directive';
import { ScrollbarComponent } from 'src/app/theme/shared/components/scrollbar/scrollbar.component';
import { PermissionService } from 'src/app/core/services/permission.service';

import { NotificationInboxFacade } from 'src/app/modules/notification/notification-inbox/facades/notification-inbox.facade';
import { NotificationInboxApiService } from 'src/app/modules/notification/notification-inbox/services/notification-inbox-api.service';

/**
 * NotificationBellComponent (SCR-NOTIF-001 — F4-SCR-NOTIF-001, DRV-NOTIF-010).
 * Always-loaded app-shell header component (not a guarded lazy route) — embedded
 * in nav-right, replacing the CodedThemes demo notification dropdown stub.
 *
 * Shows the caller's most recent notifications (top 5 by createdAt), links to
 * /notifications for the full history. Deliberately NOT an "unread" preview and
 * has no unread-count badge — API-NOTIF-004/005 (unread/mark-as-read) are
 * GOVERNANCE-NOTE-BLOCKED per DRV-NOTIF-003 (no read/unread column on NOTIF_LOG),
 * so there is no real unread signal to show; showing a fabricated badge would
 * violate the "never invent" contract rule.
 * @plan execution-plan.md @phase F4 @scr SCR-NOTIF-001
 */
@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, AvlDropdownDirective, AvlDropdownToggleDirective, ScrollbarComponent],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NotificationInboxFacade, NotificationInboxApiService]
})
export class NotificationBellComponent implements OnInit {
  private readonly facade = inject(NotificationInboxFacade);
  private readonly permissionService = inject(PermissionService);

  readonly recentNotifications = computed(() => this.facade.notifications());
  readonly loading = computed(() => this.facade.loading());

  ngOnInit(): void {
    // This bell is always-loaded app-shell chrome (every page, every user), not a
    // permission-guarded route — calling the API unconditionally means a user
    // without PERM_NOTIFICATION_INBOX_VIEW gets a 403 here on every single page
    // load, which the global ErrorInterceptor turns into an app-wide redirect to
    // /access-denied. Guard the call itself instead, same as other
    // permission-conditional UI in this app.
    if (this.permissionService.hasPermission('PERM_NOTIFICATION_INBOX_VIEW')) {
      this.facade.applyGridStateAndLoad({ page: 0, size: 5, sortBy: 'createdAt', sortDir: 'DESC' });
    }
  }
}
