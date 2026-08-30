import React from 'react';
import { useLanguage } from './context/LanguageContext';
import { useNavigationStore } from './stores/useNavigationStore';
import { AppShell } from './layout/AppShell';

// 🔐 Module: Security
import {
  useAuthStore,
  useLogoutMutation,
  useSessionBootstrap,
  usePermission,
  LoginPage,
  UsersPage,
  RolesPage,
  PermissionsPage,
  PagesRegistryPage,
} from '@/modules/security';

// 🏢 Module: Organization
import {
  LegalEntitiesPage,
  BranchesPage,
  RegionsPage,
  DepartmentsPage,
  CostCentersPage,
  ProfitCentersPage,
  LocationSitesPage,
} from '@/modules/org';

// 📋 Module: Master Data
import { MasterLookupsPage } from '@/modules/masterdata';

// 📦 Module: Shared & System
import {
  DashboardPage,
  UnauthorizedPage,
  NotificationInboxPage,
  NotificationTemplatesPage,
  NotificationChannelsPage,
} from '@/modules/shared';

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

  // A password-reset or activation link (`?token=...`) must land on that
  // flow even if this browser still has a valid session from an earlier
  // login — otherwise the token is silently discarded and the user is
  // bounced straight to the dashboard with no way to actually use the link.
  const hasEmailToken = new URLSearchParams(window.location.search).has('token');

  if (!isAuthenticated || hasEmailToken) {
    return <LoginPage onLogin={login} />;
  }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      // General
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentScreen} />;

      // Module 1: Security
      // SEC-FE/SCR-SEC-002: PERM_USER_VIEW is a CONFIRMED real literal
      // (permissionmanagement.md response example: pageCode "USER").
      case 'sec-users':
        return can('PERM_USER_VIEW') ? <UsersPage /> : <UnauthorizedPage />;
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
      // F4/SCR-ORG-001: PERM_LEGAL_ENTITY_VIEW is a CONFIRMED real literal
      // (legalEntities/hooks.ts' useLegalEntitiesFacade already uses it).
      case 'org-entities':
        return can('PERM_LEGAL_ENTITY_VIEW') ? <LegalEntitiesPage /> : <UnauthorizedPage />;
      // F4/SCR-ORG-002: PERM_BRANCH_VIEW is a CONFIRMED real literal
      // (branches/hooks.ts' useBranchesFacade already uses it).
      case 'org-branches':
        return can('PERM_BRANCH_VIEW') ? <BranchesPage /> : <UnauthorizedPage />;
      // F4/SCR-ORG-003: PERM_REGION_VIEW is a CONFIRMED real literal
      // (regions/hooks.ts' useRegionsFacade already uses it).
      case 'org-regions':
        return can('PERM_REGION_VIEW') ? <RegionsPage /> : <UnauthorizedPage />;
      // F4/SCR-ORG-004: PERM_DEPARTMENT_VIEW is a CONFIRMED real literal
      // (departments/hooks.ts' useDepartmentsFacade already uses it).
      case 'org-departments':
        return can('PERM_DEPARTMENT_VIEW') ? <DepartmentsPage /> : <UnauthorizedPage />;
      // F4/SCR-ORG-005: PERM_COST_CENTER_VIEW is a CONFIRMED real literal
      // (costCenters/hooks.ts' useCostCentersFacade already uses it).
      case 'org-cost-centers':
        return can('PERM_COST_CENTER_VIEW') ? <CostCentersPage /> : <UnauthorizedPage />;
      // F4/SCR-ORG-006: PERM_PROFIT_CENTER_VIEW is a CONFIRMED real literal
      // (profitCenters/hooks.ts' useProfitCentersFacade already uses it).
      case 'org-profit-centers':
        return can('PERM_PROFIT_CENTER_VIEW') ? <ProfitCentersPage /> : <UnauthorizedPage />;
      // F4/SCR-ORG-007: PERM_LOCATION_SITE_VIEW is a CONFIRMED real literal
      // (locationSites/hooks.ts' useLocationSitesFacade already uses it).
      case 'org-locations':
        return can('PERM_LOCATION_SITE_VIEW') ? <LocationSitesPage /> : <UnauthorizedPage />;

      // Module 3: Master Data
      // api-docs/index.md documents MASTER_LOOKUP_VIEW as a real required
      // permission for this screen's own read endpoints — PERM_-prefixed per
      // this app's confirmed authority-naming convention (see roles/hooks.ts).
      case 'md-master-lookups':
        return can('PERM_MASTER_LOOKUP_VIEW') ? <MasterLookupsPage /> : <UnauthorizedPage />;

      // Module 4: Notifications
      case 'notif-inbox':
        return <NotificationInboxPage />;
      case 'notif-templates':
        return <NotificationTemplatesPage />;
      case 'notif-channels':
        return <NotificationChannelsPage />;

      default:
        return <DashboardPage onNavigate={setCurrentScreen} />;
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
      case 'md-master-lookups':
        return { title: t('mdMasterLookupsTitle'), breadcrumb: t('mdMasterLookupsBreadcrumb') };
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
