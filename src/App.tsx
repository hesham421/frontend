import React from 'react';
import { useLanguage } from './context/LanguageContext';
import { useAuthStore } from './stores/useAuthStore';
import { useNavigationStore } from './stores/useNavigationStore';
import { useLogoutMutation } from './auth/hooks';
import { AppShell } from './layout/AppShell';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const storeLogout = useAuthStore((state) => state.logout);
  const logoutMutation = useLogoutMutation();

  const currentScreen = useNavigationStore((state) => state.currentScreen);
  const setCurrentScreen = useNavigationStore((state) => state.setCurrentScreen);

  const { t } = useLanguage();

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      storeLogout();
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      // General
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentScreen} />;

      // Module 1: Security
      // Guards below are flagged additions (F4/CONTRACT-12): the only guard
      // AS-IS is the global isAuthenticated check above. Real per-screen
      // gating is SEC-FE's own phase — its permission hook doesn't exist
      // yet, so nothing is fabricated here ahead of it (see src/users/hooks.ts
      // useUserManagementFacade's own note on this same boundary).
      // TODO(SEC-FE/SCR-SEC-002): if (!canView) return <Unauthorized />; — PERM_USER_VIEW is a CONFIRMED real literal.
      case 'sec-users':
        return <UsersPage />;
      // TODO(SEC-FE/SCR-SEC-003): if (!canView) return <Unauthorized />; — PERM_ROLE_* pageCode unconfirmed, OQ-SEC-FE-003.
      case 'sec-roles':
        return <RolesPage />;
      // TODO(SEC-FE/SCR-SEC-004): if (!canView) return <Unauthorized />; — PERM_PERMISSION_* pageCode unconfirmed, OQ-SEC-FE-003.
      case 'sec-permissions':
        return <PermissionsPage />;
      // TODO(SEC-FE/SCR-SEC-005): if (!canView) return <Unauthorized />; — PERM_PAGE_* pageCode unconfirmed, OQ-SEC-FE-003.
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
