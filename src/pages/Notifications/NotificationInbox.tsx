import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotificationsStore } from '../../stores/useNotificationsStore';
import { Breadcrumb, EmptyState } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Badge } from '../../components/ui/DataDisplay';
import { Input, Select } from '../../components/ui/FormControls';
import { useToast } from '../../components/ui/Toast';

export const NotificationInboxPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const {
    notifications,
    searchQuery,
    typeFilter,
    statusFilter,
    setSearchQuery,
    setTypeFilter,
    setStatusFilter,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    getUnreadCount,
  } = useNotificationsStore();

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      n.subjectEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subjectAr.includes(searchQuery) ||
      n.bodyEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.bodyAr.includes(searchQuery);

    const matchesType = typeFilter === 'ALL' || n.type === typeFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'UNREAD' && n.status === 'UNREAD') ||
      (statusFilter === 'READ' && n.status === 'READ');

    return matchesSearch && matchesType && matchesStatus;
  });

  const unreadCount = getUnreadCount();

  const typeOptions = [
    { value: 'ALL', label: t('all') },
    { value: 'INFO', label: 'INFO (معلومات)' },
    { value: 'WARNING', label: 'WARNING (تحذير)' },
    { value: 'ALERT', label: 'ALERT (تنبيه أمني)' },
    { value: 'SUCCESS', label: 'SUCCESS (نجاح)' },
    { value: 'TASK', label: 'TASK (مهمة معلقة)' },
  ];

  const statusOptions = [
    { value: 'ALL', label: t('all') },
    { value: 'UNREAD', label: 'Unread (غير مقروء)' },
    { value: 'READ', label: 'Read (مقروء)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Breadcrumb
            items={[
              { label: t('navOverview') },
              { label: t('groupNotifications') },
              { label: t('navNotificationInbox') },
            ]}
          />
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--text-strong, #14222F)',
              margin: '4px 0 0 0',
              textAlign: 'start',
            }}
          >
            {t('notifInboxTitle')}
          </h1>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="secondary"
            iconLeft={<i className="ti ti-checks" />}
            onClick={() => {
              markAllAsRead();
              showToast(t('allReadSuccess'), 'success');
            }}
          >
            {t('markAllAsRead')}
          </Button>
        )}
      </div>

      {/* 2. Filter Bar */}
      <Card variant="flat" padding="md">
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 280px', minWidth: '220px' }}>
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              iconLeft={<i className="ti ti-search" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
            />
          </div>
          <div style={{ width: '180px' }}>
            <Select
              options={typeOptions}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            />
          </div>
          <div style={{ width: '160px' }}>
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
          {(searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('ALL');
                setStatusFilter('ALL');
              }}
            >
              {t('clear')}
            </Button>
          )}
        </div>
      </Card>

      {/* 4. Data Grid */}
      <Card variant="flat" padding="none">
        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon="ti ti-bell-off"
            title={t('noRecordsFound')}
            description={t('noRecordsDesc')}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start' }}>
              <thead>
                <tr style={{ background: 'var(--surface-page, #F8FAFC)', borderBottom: '1px solid var(--border-subtle, #E6ECF3)' }}>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'start' }}>
                    {t('type')}
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'start' }}>
                    {t('colSubjectMessage')}
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'start' }}>
                    {t('colModule')}
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'start' }}>
                    {t('colDateTime')}
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'start' }}>
                    {t('status')}
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'end' }}>
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.map((n) => {
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
                    <tr
                      key={n.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle, #E6ECF3)',
                        background: isUnread ? 'rgba(36, 102, 216, 0.03)' : 'transparent',
                        transition: 'background 120ms ease',
                      }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <Badge variant={badgeVariant} size="sm">
                          {n.type}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 18px', maxWidth: '420px' }}>
                        <div style={{ fontWeight: isUnread ? 700 : 500, color: 'var(--text-strong, #14222F)', fontSize: '14px' }}>
                          {lang === 'ar' ? n.subjectAr : n.subjectEn}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted, #647488)', marginTop: '2px' }}>
                          {lang === 'ar' ? n.bodyAr : n.bodyEn}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Badge variant="neutral" size="sm">
                          {n.moduleCode}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '12px', color: 'var(--text-subtle, #8C9AAC)' }}>
                        {n.createdAt}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Badge variant={isUnread ? 'primary' : 'neutral'} size="sm">
                          {isUnread ? t('unread') : t('read')}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'end' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {isUnread && (
                            <IconButton
                              icon="ti ti-check"
                              label={t('markAsRead')}
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(n.id)}
                            />
                          )}
                          <IconButton
                            icon="ti ti-archive"
                            label={t('archive')}
                            variant="ghost"
                            size="sm"
                            onClick={() => archiveNotification(n.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
