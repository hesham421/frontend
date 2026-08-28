import React from 'react';
import { useLanguage } from './context/LanguageContext';
import { useAuthStore } from './stores/useAuthStore';
import { useNavigationStore } from './stores/useNavigationStore';
import { useLogoutMutation, useSessionBootstrap } from './auth/hooks';
import { usePermission } from './auth/permissions';
import { AppShell } from './layout/AppShell';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Unauthorized } from './pages/Unauthorized';

// Module 1: Security Pages
import { UsersPage } from './pages/Security/Users';
import { RolesPage } from './pages/Security/Roles';
import { PermissionsPage } from './pages/Security/Permissions';
import { PagesRegistryPage } from './pages/Security/Pages';

// Module 2: Organization Pages
import { LegalEntitiesPage } from './pages/Organization/LegalEntities';
import { BranchesPage } from './pages/Organization/Branches';
import { RegionsPage } from './pages/Organization/Regions';
import { DepartmentsPage } from './pages/Organization/Departments';
import { CostCentersPage } from './pages/Organization/CostCenters';
import { ProfitCentersPage } from './pages/Organization/ProfitCenters';
import { LocationSitesPage } from './pages/Organization/LocationSites';

// Module 4: Notification Pages
import { NotificationInboxPage } from './pages/Notifications/NotificationInbox';
import { NotificationTemplatesPage } from './pages/Notifications/NotificationTemplates';
import { NotificationChannelsPage } from './pages/Notifications/NotificationChannels';

export const App: React.FC = () => {
  const sessionReady = useSessionBootstrap();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const storeLogout = useAuthStore((state) => state.logout);
  const logoutMutation = useLogoutMutation();

  const currentScreen = useNavigationStore((state) => state.currentScreen);
  const setCurrentScreen = useNavigationStore((state) => state.setCurrentScreen);

  const { t } = useLanguage();
  const { can } = usePermission();

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      storeLogout();
      // A later login (possibly a different user, same tab) must not
      // resume on whatever screen this session was last on.
      setCurrentScreen('dashboard');
    }
  };

  // Holds the very first paint until the silent session-restore attempt
  // (useSessionBootstrap) resolves, so a hard refresh with a valid session
  // never flashes the Login screen before isAuthenticated catches up.
  if (!sessionReady) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface-page, #F8FAFC)',
        }}
      >
        <span
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: '3px solid var(--border-default, #D8DEE6)',
            borderTopColor: 'var(--brand-primary, #2466D8)',
            display: 'inline-block',
            animation: 'avl-spin 0.7s linear infinite',
          }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      // General
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentScreen} />;

      // Module 1: Security
      // SEC-FE/SCR-SEC-002: PERM_USER_VIEW is a CONFIRMED real literal
      // (permissionmanagement.md response example: pageCode "USER").
      case 'sec-users':
        return can('PERM_USER_VIEW') ? <UsersPage /> : <Unauthorized />;
      // BLOCKED (OQ-SEC-FE-003): Roles' own pageCode is unconfirmed, so the
      // PERM_ROLE_* frontend-gating literal cannot be constructed — do not
      // invent it. Screen stays open pending resolution; server-side ROLE_*
      // checks on every mutation are the real enforcement in the meantime.
      case 'sec-roles':
        return <RolesPage />;
      // BLOCKED (OQ-SEC-FE-003): Permissions' own pageCode is unconfirmed.
      case 'sec-permissions':
        return <PermissionsPage />;
      // BLOCKED (OQ-SEC-FE-003): Pages Registry's own pageCode is unconfirmed
      // (distinct from the confirmed PAGE_VIEW/CREATE/UPDATE/DELETE literals
      // that gate this screen's own CRUD actions — see PagesRegistryPage).
      case 'sec-pages':
        return <PagesRegistryPage />;

      // Module 2: Organization
      case 'org-entities':
        return <LegalEntitiesPage />;
      case 'org-branches':
        return <BranchesPage />;
      case 'org-regions':
        return <RegionsPage />;
      case 'org-departments':
        return <DepartmentsPage />;
      case 'org-cost-centers':
        return <CostCentersPage />;
      case 'org-profit-centers':
        return <ProfitCentersPage />;
      case 'org-locations':
        return <LocationSitesPage />;

      // Module 4: Notifications
      case 'notif-inbox':
        return <NotificationInboxPage />;
      case 'notif-templates':
        return <NotificationTemplatesPage />;
      case 'notif-channels':
        return <NotificationChannelsPage />;

      default:
        return <Dashboard onNavigate={setCurrentScreen} />;
    }
  };

  const getScreenMeta = () => {
    switch (currentScreen) {
      case 'dashboard':
        return { title: t('dashboardTitle'), breadcrumb: t('dashboardBreadcrumb') };
      case 'sec-users':
        return { title: t('secUsersTitle'), breadcrumb: t('secUsersBreadcrumb') };
      case 'sec-roles':
        return { title: t('secRolesTitle'), breadcrumb: t('secRolesBreadcrumb') };
      case 'sec-permissions':
        return { title: t('secPermsTitle'), breadcrumb: t('secPermsBreadcrumb') };
      case 'sec-pages':
        return { title: t('secPagesTitle'), breadcrumb: t('secPagesBreadcrumb') };
      case 'org-entities':
        return { title: t('orgEntitiesTitle'), breadcrumb: t('orgEntitiesBreadcrumb') };
      case 'org-branches':
        return { title: t('orgBranchesTitle'), breadcrumb: t('orgBranchesBreadcrumb') };
      case 'org-regions':
        return { title: t('orgRegionsTitle'), breadcrumb: t('orgRegionsBreadcrumb') };
      case 'org-departments':
        return { title: t('orgDeptsTitle'), breadcrumb: t('orgDeptsBreadcrumb') };
      case 'org-cost-centers':
        return { title: t('orgCostCentersTitle'), breadcrumb: t('orgCostCentersBreadcrumb') };
      case 'org-profit-centers':
        return { title: t('orgProfitCentersTitle'), breadcrumb: t('orgProfitCentersBreadcrumb') };
      case 'org-locations':
        return { title: t('orgLocationsTitle'), breadcrumb: t('orgLocationsBreadcrumb') };
      case 'notif-inbox':
        return { title: t('notifInboxTitle'), breadcrumb: t('notifInboxBreadcrumb') };
      case 'notif-templates':
        return { title: t('notifTemplatesTitle'), breadcrumb: t('notifTemplatesBreadcrumb') };
      case 'notif-channels':
        return { title: t('notifChannelsTitle'), breadcrumb: t('notifChannelsBreadcrumb') };
      default:
        return { title: t('dashboardTitle'), breadcrumb: t('dashboardBreadcrumb') };
    }
  };

  const { title, breadcrumb } = getScreenMeta();

  return (
    <AppShell
      activeScreen={currentScreen}
      onNavigate={setCurrentScreen}
      onLogout={logout}
      title={title}
      breadcrumb={breadcrumb}
    >
      {renderCurrentScreen()}
    </AppShell>
  );
};
