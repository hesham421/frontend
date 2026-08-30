import React, { useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuthStore } from '../stores/useAuthStore';
import { useNotificationsStore } from '../stores/useNotificationsStore';
import { useNavigationStore } from '../stores/useNavigationStore';
import { Avatar, Badge, Card } from '../components/ui/DataDisplay';
import { Button, IconButton } from '../components/ui/Button';

export interface TopbarProps {
  title: string;
  breadcrumb?: string;
  onLogout?: () => void;
  onMenuToggle?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  title,
  breadcrumb,
  onLogout: propOnLogout,
  onMenuToggle,
}) => {
  const { toggleLanguage, t, lang } = useLanguage();
  const user = useAuthStore((state) => state.user);
  const storeLogout = useAuthStore((state) => state.logout);
  const setCurrentScreen = useNavigationStore((state) => state.setCurrentScreen);

  const {
    notifications,
    isBellDropdownOpen,
    toggleBellDropdown,
    setBellDropdownOpen,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
  } = useNotificationsStore();

  const bellRef = useRef<HTMLDivElement>(null);

  const onLogout = propOnLogout ?? storeLogout;
  const unreadCount = getUnreadCount();

  const displayName = lang === 'ar' ? user.nameAr : user.nameEn;
  const displayRole = lang === 'ar' ? user.roleTitleAr : user.roleTitleEn;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setBellDropdownOpen(false);
      }
    };
    if (isBellDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBellDropdownOpen, setBellDropdownOpen]);

  const handleViewAllNotifications = () => {
    setBellDropdownOpen(false);
    setCurrentScreen('notif-inbox');
  };

  return (
    <header
      style={{
        height: '60px',
        flexShrink: 0,
        background: 'var(--surface-card, #ffffff)',
        borderBottom: '1px solid var(--border-subtle, #E6ECF3)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '0 22px',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 50,
      }}
    >
      <div className="avl-menu-btn" style={{ display: 'inline-flex' }}>
        <IconButton
          icon="ti ti-menu-2"
          label={t('openMenu')}
          variant="outline"
          onClick={onMenuToggle}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {breadcrumb && (
          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-subtle, #8C9AAC)',
              marginBottom: '1px',
              fontFamily: 'var(--font-sans)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textAlign: 'start',
            }}
          >
            {breadcrumb}
          </div>
        )}
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text-strong, #14222F)',
            letterSpacing: '-0.01em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'start',
          }}
        >
          {title}
        </div>
      </div>

      {/* Global Search Bar */}
      <div
        className="avl-hide-md-down"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          maxWidth: '320px',
          flex: '0 1 300px',
          height: '38px',
          padding: '0 12px',
          background: 'var(--surface-page, #F8FAFC)',
          border: '1px solid var(--border-subtle, #E6ECF3)',
          borderRadius: 'var(--radius-md, 7px)',
        }}
      >
        <i className="ti ti-search" aria-hidden="true" style={{ color: 'var(--text-subtle, #8C9AAC)', fontSize: '16px' }} />
        <input
          placeholder={t('searchPlaceholder')}
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--text-body, #354456)',
          }}
        />
        <kbd
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '10px',
            color: 'var(--text-subtle, #8C9AAC)',
            border: '1px solid var(--border-default, #B7C3D1)',
            borderRadius: 'var(--radius-sm, 4px)',
            padding: '1px 5px',
            background: 'var(--surface-card, #ffffff)',
          }}
        >
          ⌘K
        </kbd>
      </div>

      {/* Language Toggle Button */}
      <Button
        variant="secondary"
        size="md"
        iconLeft={<i className="ti ti-language" aria-hidden="true" style={{ fontSize: '17px', color: 'var(--brand-primary, #2466D8)' }} />}
        onClick={toggleLanguage}
        title="Switch Language / تغيير اللغة"
      >
        <span className="avl-hide-sm-down">{t('languageToggle')}</span>
      </Button>

      {/* Notification Bell & Dropdown Panel */}
      <div ref={bellRef} style={{ position: 'relative', flexShrink: 0 }}>
        <IconButton
          icon="ti ti-bell"
          label="Notifications"
          variant="ghost"
          onClick={toggleBellDropdown}
        />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              insetInlineEnd: '4px',
              minWidth: '16px',
              height: '16px',
              padding: '0 4px',
              borderRadius: '8px',
              background: 'var(--red-500, #CB3A2D)',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid var(--surface-card, #ffffff)',
              boxSizing: 'border-box',
            }}
          >
            {unreadCount}
          </span>
        )}

        {/* Dropdown Popover */}
        {isBellDropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: '46px',
              insetInlineEnd: 0,
              width: '340px',
              zIndex: 1000,
              boxShadow: 'var(--shadow-lg, 0 10px 30px rgba(10,22,40,0.15))',
            }}
          >
            <Card variant="raised" padding="none">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-subtle, #E6ECF3)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-strong, #14222F)' }}>
                  {t('navNotificationInbox')}
                </div>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    {t('markAllAsRead')}
                  </Button>
                )}
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted, #647488)', fontSize: '13px' }}>
                    {t('noRecordsFound')}
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => {
                    const isUnread = n.status === 'UNREAD';
                    const badgeVariant =
                      n.type === 'WARNING'
                        ? 'warning'
                        : n.type === 'ALERT'
                        ? 'danger'
                        : n.type === 'SUCCESS'
                        ? 'success'
                        : 'primary';

                    return (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--border-subtle, #E6ECF3)',
                          background: isUnread ? 'rgba(36,102,216,0.03)' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          textAlign: 'start',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Badge variant={badgeVariant} size="sm">
                            {n.type}
                          </Badge>
                          <span style={{ fontSize: '11px', color: 'var(--text-subtle, #8C9AAC)' }}>
                            {n.createdAt}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: isUnread ? 700 : 500, color: 'var(--text-strong, #14222F)' }}>
                          {lang === 'ar' ? n.subjectAr : n.subjectEn}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted, #647488)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {lang === 'ar' ? n.bodyAr : n.bodyEn}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div
                style={{
                  padding: '10px 16px',
                  borderTop: '1px solid var(--border-subtle, #E6ECF3)',
                  textAlign: 'center',
                  background: 'var(--surface-page, #F8FAFC)',
                }}
              >
                <Button variant="ghost" size="sm" onClick={handleViewAllNotifications} block>
                  {t('viewAll')} →
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* User Profile Lockup & Logout */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          flexShrink: 0,
          paddingInlineStart: '8px',
          borderInlineStart: '1px solid var(--border-subtle, #E6ECF3)',
        }}
      >
        <Avatar name={displayName} src={user.avatar} size="sm" />
        <div className="avl-hide-sm-down" style={{ lineHeight: 1.25, textAlign: 'start' }}>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-strong, #14222F)',
            }}
          >
            {displayName}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              color: 'var(--text-muted, #647488)',
            }}
          >
            {displayRole}
          </div>
        </div>
        <IconButton icon="ti ti-logout" label={t('logout')} variant="ghost" size="sm" onClick={onLogout} />
      </div>
    </header>
  );
};
