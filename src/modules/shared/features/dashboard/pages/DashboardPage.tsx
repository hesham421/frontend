import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigationStore, ScreenType } from '@/stores/useNavigationStore';
import { useUsersCount } from '@/features/users';
import { useRolesCount } from '@/features/roles';
import { useLegalEntitiesOptions } from '@/features/legalEntities';
import { useBranchesOptions } from '@/features/branches';
import { useNotificationsStore } from '@/features/notifications';
import { Stat, Card, Badge } from '@/components/ui/DataDisplay';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/OverlaysAndFeedback';
import { FileAttachmentPanel } from '@/features/attachments';

export interface DashboardProps {
  onNavigate?: (screen: ScreenType) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { t, lang } = useLanguage();
  const storeNavigate = useNavigationStore((state) => state.setCurrentScreen);
  const handleNavigate = onNavigate ?? storeNavigate;

  // Real Security/Organization API counts — previously read from mock stores
  // those screens themselves no longer use, so these KPIs could show a
  // number unrelated to what the actual list screens displayed.
  const usersCount = useUsersCount().data ?? 0;
  const rolesCount = useRolesCount().data ?? 0;
  const entitiesCount = useLegalEntitiesOptions().data?.length ?? 0;
  const branchesCount = useBranchesOptions().data?.length ?? 0;
  const unreadCount = useNotificationsStore((state) => state.getUnreadCount());

  const [isFileDrawerOpen, setIsFileDrawerOpen] = useState(false);

  return (
    <div style={{ fontFamily: 'var(--font-sans)', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--navy-850, #0A1628)',
          borderRadius: 'var(--radius-lg, 10px)',
          padding: '32px 36px',
          color: 'var(--text-inverse, #ffffff)',
          boxShadow: 'var(--shadow-md, 0 4px 12px rgba(10,22,40,0.08))',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(80% 120% at 100% 0%, rgba(36,102,216,0.35), transparent 55%), radial-gradient(60% 100% at 92% 100%, rgba(18,169,155,0.25), transparent 60%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--teal-400, #1FBBAD)',
                marginBottom: '8px',
                textAlign: 'start',
              }}
            >
              {new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <h1
              style={{
                fontSize: 'clamp(22px, 3.2vw, 30px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                margin: '0 0 6px',
                textAlign: 'start',
              }}
            >
              {t('dashboardTitle')}
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.72)',
                margin: 0,
                maxWidth: '680px',
                lineHeight: 1.5,
                textAlign: 'start',
              }}
            >
              {t('authWelcomeDesc')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Badge variant="accent" size="md">
              {lang === 'ar' ? 'النظام جاهز' : 'System Ready'}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<i className="ti ti-paperclip" />}
              onClick={() => setIsFileDrawerOpen(true)}
            >
              {t('fileAttachments')}
            </Button>
          </div>
        </div>
      </div>

      {/* System Overview KPI Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <Stat
          label={t('totalUsers')}
          value={usersCount}
          icon={<i className="ti ti-users" style={{ color: 'var(--brand-primary, #2466D8)', fontSize: '20px' }} />}
        />
        <Stat
          label={t('totalRoles')}
          value={rolesCount}
          icon={<i className="ti ti-shield-lock" style={{ color: 'var(--teal-400, #1FBBAD)', fontSize: '20px' }} />}
        />
        <Stat
          label={t('totalEntities')}
          value={entitiesCount}
          icon={<i className="ti ti-building" style={{ color: 'var(--amber-500, #DF8B17)', fontSize: '20px' }} />}
        />
        <Stat
          label={t('totalBranches')}
          value={branchesCount}
          icon={<i className="ti ti-git-branch" style={{ color: 'var(--green-500, #1D9A6C)', fontSize: '20px' }} />}
        />
        <Stat
          label={t('unreadNotifications')}
          value={unreadCount}
          icon={<i className="ti ti-bell-ringing" style={{ color: 'var(--red-500, #CB3A2D)', fontSize: '20px' }} />}
        />
      </div>

      {/* Module Navigation Quick Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Security Module Card */}
        <Card
          title={t('groupSecurity')}
          subtitle="User Directory, RBAC Matrix, Pages & Permissions"
          padding="lg"
          variant="flat"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            <Button variant="secondary" onClick={() => handleNavigate('sec-users')} block iconLeft={<i className="ti ti-users" />}>
              {t('navUsers')} →
            </Button>
            <Button variant="secondary" onClick={() => handleNavigate('sec-roles')} block iconLeft={<i className="ti ti-shield-lock" />}>
              {t('navRoles')} →
            </Button>
            <Button variant="secondary" onClick={() => handleNavigate('sec-pages')} block iconLeft={<i className="ti ti-layout-grid" />}>
              {t('navPages')} →
            </Button>
          </div>
        </Card>

        {/* Organization Module Card */}
        <Card
          title={t('groupOrganization')}
          subtitle="Entities, Branches, Hierarchy Trees & Facilities"
          padding="lg"
          variant="flat"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            <Button variant="secondary" onClick={() => handleNavigate('org-entities')} block iconLeft={<i className="ti ti-building" />}>
              {t('navLegalEntities')} →
            </Button>
            <Button variant="secondary" onClick={() => handleNavigate('org-branches')} block iconLeft={<i className="ti ti-git-branch" />}>
              {t('navBranches')} →
            </Button>
            <Button variant="secondary" onClick={() => handleNavigate('org-departments')} block iconLeft={<i className="ti ti-sitemap" />}>
              {t('navDepartments')} (Tree) →
            </Button>
            <Button variant="secondary" onClick={() => handleNavigate('org-cost-centers')} block iconLeft={<i className="ti ti-calculator" />}>
              {t('navCostCenters')} (Tree) →
            </Button>
          </div>
        </Card>

        {/* Notification & Communication Card */}
        <Card
          title={t('groupNotifications')}
          subtitle="System Alerts, Templates & Dispatch Channels"
          padding="lg"
          variant="flat"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            <Button variant="secondary" onClick={() => handleNavigate('notif-inbox')} block iconLeft={<i className="ti ti-bell" />}>
              {t('navNotificationInbox')} →
            </Button>
            <Button variant="secondary" onClick={() => handleNavigate('notif-templates')} block iconLeft={<i className="ti ti-template" />}>
              {t('navNotificationTemplates')} →
            </Button>
            <Button variant="secondary" onClick={() => handleNavigate('notif-channels')} block iconLeft={<i className="ti ti-adjustments-horizontal" />}>
              {t('navNotificationChannels')} →
            </Button>
          </div>
        </Card>
      </div>

      {/* File Attachment Widget Demo Drawer */}
      <Drawer
        isOpen={isFileDrawerOpen}
        onClose={() => setIsFileDrawerOpen(false)}
        title={t('fileAttachments')}
        width="lg"
      >
        <FileAttachmentPanel
          ownerId="le-1"
          ownerType="LEGAL_ENTITY"
          moduleCode="ORG"
        />
      </Drawer>
    </div>
  );
};

export { Dashboard as DashboardPage };
