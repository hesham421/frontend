import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { authGuard, permissionGuard } from 'src/app/core/guards';
import { AdminLayout } from 'src/app/theme/layout/admin-layout/admin-layout.component';

const routes: Routes = [
  // SCR-NOTIF-001 (F4-SCR-NOTIF-001) — full history list; the bell dropdown
  // itself has no route (embedded in the app shell header, see nav-right).
  {
    path: 'notifications',
    component: AdminLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./notification-inbox/pages/notification-history/notification-history.component').then(
            (c) => c.NotificationHistoryComponent
          ),
        canActivate: [authGuard, permissionGuard],
        data: { permission: 'PERM_NOTIFICATION_INBOX_VIEW' }
      }
    ]
  },
  // SCR-NOTIF-002 (F4-SCR-NOTIF-002) — Template Management
  {
    path: 'notification-templates',
    component: AdminLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./notification-templates/pages/notification-template-search/notification-template-search.component').then(
            (c) => c.NotificationTemplateSearchComponent
          ),
        canActivate: [authGuard, permissionGuard],
        data: { permission: 'PERM_NOTIFICATION_TEMPLATE_VIEW' }
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./notification-templates/pages/notification-template-entry/notification-template-entry.component').then(
            (c) => c.NotificationTemplateEntryComponent
          ),
        canActivate: [authGuard, permissionGuard],
        data: { permission: 'PERM_NOTIFICATION_TEMPLATE_CREATE' }
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./notification-templates/pages/notification-template-entry/notification-template-entry.component').then(
            (c) => c.NotificationTemplateEntryComponent
          ),
        canActivate: [authGuard, permissionGuard],
        data: { permission: 'PERM_NOTIFICATION_TEMPLATE_VIEW' }
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./notification-templates/pages/notification-template-entry/notification-template-entry.component').then(
            (c) => c.NotificationTemplateEntryComponent
          ),
        canActivate: [authGuard, permissionGuard],
        data: { permission: 'PERM_NOTIFICATION_TEMPLATE_UPDATE' }
      }
    ]
  },
  // SCR-NOTIF-003 (F4-SCR-NOTIF-003) — Channel Configuration (inline toggle list)
  {
    path: 'notification-channel-configs',
    component: AdminLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./notification-channel-config/pages/notification-channel-config/notification-channel-config.component').then(
            (c) => c.NotificationChannelConfigComponent
          ),
        canActivate: [authGuard, permissionGuard],
        data: { permission: 'PERM_NOTIFICATION_CHANNEL_CONFIG_VIEW' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationRoutingModule {}
