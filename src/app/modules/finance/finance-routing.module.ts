import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { authGuard, permissionGuard } from 'src/app/core/guards';
import { AdminLayout } from 'src/app/theme/layout/admin-layout/admin-layout.component';

const routes: Routes = [
  // ── GL – Chart of Accounts (single tree console) ──────────
  {
    path: 'gl/accounts',
    component: AdminLayout,
    children: [
      {
        path: '',
        redirectTo: 'tree',
        pathMatch: 'full'
      },
      {
        path: 'tree',
        loadComponent: () =>
          import('./gl/pages/accounts-tree/accounts-tree.component').then((c) => c.AccountsTreeComponent),
        canActivate: [authGuard, permissionGuard],
        data: { permission: 'PERM_GL_ACCOUNT_VIEW' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinanceRoutingModule {}
