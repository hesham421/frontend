import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigationStore, ScreenType } from '../stores/useNavigationStore';
import { IconButton } from '../components/ui/Button';

export interface SidebarProps {
  activeScreen?: ScreenType;
  onNavigate?: (screen: ScreenType) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeScreen: propActiveScreen,
  onNavigate: propOnNavigate,
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const { t } = useLanguage();

  const storeCurrentScreen = useNavigationStore((state) => state.currentScreen);
  const storeSetCurrentScreen = useNavigationStore((state) => state.setCurrentScreen);
  const storeSidebarOpen = useNavigationStore((state) => state.sidebarOpen);
  const storeSetSidebarOpen = useNavigationStore((state) => state.setSidebarOpen);
  const openGroups = useNavigationStore((state) => state.openGroups);
  const toggleGroup = useNavigationStore((state) => state.toggleGroup);

  const activeScreen = propActiveScreen ?? storeCurrentScreen;
  const onNavigate = propOnNavigate ?? storeSetCurrentScreen;
  const isOpen = propIsOpen ?? storeSidebarOpen;
  const onClose = propOnClose ?? (() => storeSetSidebarOpen(false));

  const navItem = (screen: ScreenType, icon: string, label: string) => {
    const isActive = activeScreen === screen;
    return (
      <button
        key={screen}
        onClick={() => onNavigate(screen)}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '11px',
          width: '100%',
          padding: '8px 10px',
          marginBottom: '2px',
          background: isActive ? 'rgba(36,102,216,0.22)' : 'transparent',
          border: 'none',
          borderRadius: 'var(--radius-md, 7px)',
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: isActive ? 600 : 500,
          color: isActive ? 'var(--text-inverse, #ffffff)' : 'rgba(255,255,255,0.78)',
          boxShadow: isActive ? 'inset 3px 0 0 var(--teal-400, #1FBBAD)' : 'none',
          transition: 'all 120ms ease-out',
          textAlign: 'start',
        }}
      >
        <i
          className={icon}
          aria-hidden="true"
          style={{
            fontSize: '17px',
            width: '20px',
            color: isActive ? 'var(--teal-400, #1FBBAD)' : 'rgba(255,255,255,0.6)',
          }}
        />
        <span style={{ flex: 1, textAlign: 'start' }}>{label}</span>
      </button>
    );
  };

  const groupHeader = (groupId: string, label: string) => {
    const isExpanded = openGroups[groupId] ?? true;
    return (
      <div
        onClick={() => toggleGroup(groupId)}
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)',
          padding: '10px 10px 6px',
          textAlign: 'start',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span>{label}</span>
        <i
          className={isExpanded ? 'ti ti-chevron-down' : 'ti ti-chevron-right'}
          aria-hidden="true"
          style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}
        />
      </div>
    );
  };

  return (
    <>
      {/* Mobile scrim overlay */}
      <div
        className={`avl-scrim ${isOpen ? 'is-open' : ''}`}
        onClick={onClose}
        style={{
          display: isOpen ? 'block' : 'none',
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 22, 40, 0.55)',
          backdropFilter: 'blur(2px)',
          zIndex: 99,
        }}
      />

      <aside
        className={`avl-sidebar ${isOpen ? 'is-open' : ''}`}
        style={{
          width: '264px',
          flexShrink: 0,
          background: 'var(--navy-850, #0A1628)',
          color: 'var(--text-inverse, #ffffff)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          borderInlineEnd: '1px solid var(--border-inverse, #21344B)',
          zIndex: 100,
          transition: 'transform 200ms ease-out',
        }}
      >
        {/* Brand Lockup */}
        <div
          style={{
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            gap: '11px',
            padding: '0 20px',
            borderBottom: '1px solid var(--border-inverse, #21344B)',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md, 8px)',
              background: 'var(--brand-gradient, linear-gradient(135deg, #1FBBAD 0%, #2466D8 100%))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: 'var(--text-inverse, #ffffff)',
              fontSize: '15px',
              boxShadow: '0 2px 8px rgba(18,169,155,0.3)',
            }}
          >
            A
          </span>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              fontSize: '19px',
              letterSpacing: '0.04em',
              color: 'var(--text-inverse, #ffffff)',
            }}
          >
            AVEL<span style={{ color: 'var(--teal-400, #1FBBAD)' }}>Y</span>NQ
          </span>
          <div style={{ marginInlineStart: 'auto' }}>
            <IconButton
              icon="ti ti-x"
              label={t('close')}
              variant="inverse"
              size="sm"
              className="avl-menu-btn"
              onClick={onClose}
            />
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>
          {/* General Section */}
          <div style={{ marginBottom: '12px' }}>
            {groupHeader('general', t('groupGeneral'))}
            {(openGroups.general ?? true) && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {navItem('dashboard', 'ti ti-layout-dashboard', t('navOverview'))}
              </div>
            )}
          </div>

          {/* Module 1: Security Section */}
          <div style={{ marginBottom: '12px' }}>
            {groupHeader('security', t('groupSecurity'))}
            {(openGroups.security ?? true) && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {navItem('sec-users', 'ti ti-users', t('navUsers'))}
                {navItem('sec-roles', 'ti ti-shield-lock', t('navRoles'))}
                {navItem('sec-permissions', 'ti ti-key', t('navPermissions'))}
                {navItem('sec-pages', 'ti ti-layout-grid', t('navPages'))}
              </div>
            )}
          </div>

          {/* Module 2: Organization Section */}
          <div style={{ marginBottom: '12px' }}>
            {groupHeader('organization', t('groupOrganization'))}
            {(openGroups.organization ?? true) && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {navItem('org-entities', 'ti ti-building', t('navLegalEntities'))}
                {navItem('org-branches', 'ti ti-git-branch', t('navBranches'))}
                {navItem('org-regions', 'ti ti-map-pin', t('navRegions'))}
                {navItem('org-departments', 'ti ti-sitemap', t('navDepartments'))}
                {navItem('org-cost-centers', 'ti ti-calculator', t('navCostCenters'))}
                {navItem('org-profit-centers', 'ti ti-chart-arrows-vertical', t('navProfitCenters'))}
                {navItem('org-locations', 'ti ti-building-warehouse', t('navLocationSites'))}
              </div>
            )}
          </div>

          {/* Module 3: Master Data Section */}
          <div style={{ marginBottom: '12px' }}>
            {groupHeader('masterData', t('groupMasterData'))}
            {(openGroups.masterData ?? true) && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {navItem('md-master-lookups', 'ti ti-list-details', t('navMasterLookups'))}
              </div>
            )}
          </div>

          {/* Module 4: Notification Settings Section */}
          <div style={{ marginBottom: '12px' }}>
            {groupHeader('notifications', t('groupNotifications'))}
            {(openGroups.notifications ?? true) && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {navItem('notif-inbox', 'ti ti-bell', t('navNotificationInbox'))}
                {navItem('notif-templates', 'ti ti-template', t('navNotificationTemplates'))}
                {navItem('notif-channels', 'ti ti-adjustments-horizontal', t('navNotificationChannels'))}
              </div>
            )}
          </div>
        </nav>

        {/* Footer Tagline */}
        <div
          style={{
            padding: '14px 18px',
            borderTop: '1px solid var(--border-inverse, #21344B)',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            flexShrink: 0,
            textAlign: 'start',
          }}
        >
          {t('tagline')}
        </div>
      </aside>
    </>
  );
};
