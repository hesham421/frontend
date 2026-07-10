import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { authGuard, permissionGuard } from 'src/app/core/guards';
import { AdminLayout } from 'src/app/theme/layout/admin-layout/admin-layout.component';
import { GuestLayouts } from 'src/app/theme/layout/guest-layout/guest-layout.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  // Guest/Public routes (no authentication required)
  {
    path: 'login',
    component: GuestLayouts,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./authentication/pages/auth-login/auth-login.component').then((c) => c.AuthLoginComponent)
      }
    ]
  },
  {
    path: 'register',
    component: GuestLayouts,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./authentication/pages/auth-register/auth-register.component').then((c) => c.AuthRegisterComponent)
      }
    ]
  },
  {
    path: 'forgot-password',
    component: GuestLayouts,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./authentication/pages/forgot-password/forgot-password.component').then((c) => c.ForgotPasswordComponent)
      }
    ]
  },
  {
    // SCR-SEC-008 (التسجيل الذاتي / Sign Up) — PLAN-SEC-002 Phase F1.
    // Reachable from the login screen's "AUTH.NO_ACCOUNT" link.
    path: 'sign-up',
    component: GuestLayouts,
    children: [
      {
        path: '',
        loadComponent: () => import('./authentication/pages/sign-up/sign-up.component').then((c) => c.SignUpComponent)
      }
    ]
  },
  {
    // SCR-SEC-009 (نسيان كلمة المرور واستعادتها / Forgot-Reset Password) —
    // PLAN-SEC-002 Phase F1. One route, two steps: request view by default,
    // reset view when a `token` query param is present (emailed link).
    // Reachable from the login screen's "AUTH.FORGOT_PASSWORD" link.
    path: 'password-recovery',
    component: GuestLayouts,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./authentication/pages/password-recovery/password-recovery.component').then((c) => c.PasswordRecoveryComponent)
      }
    ]
  },
  // Redirect old sample-page path to the new dashboard
  {
    path: 'sample-page',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'users',
    component: AdminLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./user-management/pages/users-search/user-list.component').then((c) => c.UserListComponent),
        canActivate: [authGuard, permissionGuard],
        data: { permission: 'PERM_USER_VIEW' }
      }
    ]
  },
  {
    path: 'pages-registry',
    component: AdminLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages-registry/pages/pages-search/pages-search.component').then((c) => c.PagesSearchComponent),
        canActivate: [authGuard, permissionGuard],
        data: { permission: 'PERM_PAGE_VIEW' }
      },
      {
        path: 'create',
        loadComponent: () => import('./pages-registry/pages/pages-form/pages-form.component').then((c) => c.PagesFormComponent),
        canActivate: [authGuard, permissionGuard],
        data: { permission: 'PERM_PAGE_CREATE' }
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./pages-registry/pages/pages-form/pages-form.component').then((c) => c.PagesFormComponent),
        canActivate: [authGuard, permissionGuard],
        data: { permission: 'PERM_PAGE_UPDATE' }
      }
    ]
  },
  {
    path: 'pages',
    redirectTo: 'pages-registry',
    pathMatch: 'full'
  },
  {
    // SCR-SEC-006 (ملفات المستخدمين / نطاق البيانات) — PLAN-SEC-002 Phase F1.
    // Shell only — UserProfileFacade (Phase F2) fills in real state.
    path: 'user-profiles',
    component: AdminLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./user-profiles/pages/user-profile-search/user-profile-search.component').then(
            (c) => c.UserProfileSearchComponent
          ),
        canActivate: [authGuard, permissionGuard],
        data: { permission: 'PERM_USER_PROFILE_VIEW' }
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./user-profiles/pages/user-profile-entry/user-profile-entry.component').then(
            (c) => c.UserProfileEntryComponent
          ),
        canActivate: [authGuard, permissionGuard],
        data: { permission: 'PERM_USER_PROFILE_CREATE' }
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('./user-profiles/pages/user-profile-entry/user-profile-entry.component').then(
            (c) => c.UserProfileEntryComponent
          ),
        canActivate: [authGuard, permissionGuard],
        data: { permission: 'PERM_USER_PROFILE_UPDATE' }
      }
    ]
  },
  {
    path: 'role-access',
    component: AdminLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./role-access/components/role-access-control/role-access-control.component').then((c) => c.RoleAccessControlComponent),
        canActivate: [authGuard, permissionGuard],
        data: { permission: 'PERM_ROLE_VIEW' }
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./role-access/pages/role-access-form/role-access-form.component').then((c) => c.RoleAccessFormComponent),
        canActivate: [authGuard, permissionGuard],
        data: { permission: 'PERM_ROLE_CREATE' }
      },
      {
        path: 'edit/:roleId',
        loadComponent: () =>
          import('./role-access/pages/role-access-form/role-access-form.component').then((c) => c.RoleAccessFormComponent),
        canActivate: [authGuard, permissionGuard],
        data: { permission: 'PERM_ROLE_UPDATE' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecurityRoutingModule {}
