// Angular Imports
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { authGuard } from './core/guards';
import { AdminLayout } from './theme/layout/admin-layout/admin-layout.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  // ── Dashboard (post-login landing page) ──────────────────
  {
    path: 'dashboard',
    component: AdminLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./layout/dashboard/dashboard.component'),
        canActivate: [authGuard]
      }
    ]
  },
  {
    path: 'security',
    loadChildren: () => import('./modules/security').then((m) => m.SecurityModule)
  },
  {
    path: 'master-data',
    loadChildren: () => import('./modules/master-data/master-data.module').then((m) => m.MasterDataModule)
  },
  {
    // NOTIFICATION module (F4) — SCR-NOTIF-001/002/003. Mounted at root (no
    // 'notification' path prefix) because F4-RULE-1's routes are absolute
    // top-level paths (/notifications, /notification-templates,
    // /notification-channel-configs), unlike security/master-data's
    // module-prefixed pattern.
    path: '',
    loadChildren: () => import('./modules/notification').then((m) => m.NotificationModule)
  },
  {
    path: 'finance',
    loadChildren: () => import('./modules/finance/finance.module').then((m) => m.FinanceModule)
  },
  {
    path: 'inventory',
    loadChildren: () => import('./modules/inventory').then((m) => m.InventoryModule)
  },
  {
    path: 'procurement',
    loadChildren: () => import('./modules/procurement').then((m) => m.ProcurementModule)
  },
  {
    path: 'sales',
    loadChildren: () => import('./modules/sales').then((m) => m.SalesModule)
  },
  {
    path: 'hr',
    loadChildren: () => import('./modules/hr').then((m) => m.HrModule)
  },
  {
    path: 'maintenance',
    loadChildren: () => import('./modules/maintenance').then((m) => m.MaintenanceModule)
  },
  {
    path: 'reports',
    loadChildren: () => import('./modules/reports').then((m) => m.ReportsModule)
  },

  // Backward-compatible redirects (old paths → security module)
  { path: 'login', redirectTo: 'security/login', pathMatch: 'full' },
  { path: 'register', redirectTo: 'security/register', pathMatch: 'full' },
  { path: 'forgot-password', redirectTo: 'security/forgot-password', pathMatch: 'full' },
  // PLAN-SEC-002 Phase F1 — same root-level redirect pattern as register/forgot-password above
  { path: 'sign-up', redirectTo: 'security/sign-up', pathMatch: 'full' },
  { path: 'password-recovery', redirectTo: 'security/password-recovery', pathMatch: 'full' },
  { path: 'users', redirectTo: 'security/users', pathMatch: 'full' },
  { path: 'pages', redirectTo: 'security/pages', pathMatch: 'full' },
  { path: 'role-access', redirectTo: 'security/role-access', pathMatch: 'full' },
  { path: 'sample-page', redirectTo: 'dashboard', pathMatch: 'full' },

  // Access Denied page
  {
    path: 'access-denied',
    loadComponent: () => 
      import('./core/components/access-denied/access-denied.component').then((c) => c.AccessDeniedComponent)
  },

  // Fallback
  { path: '**', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
