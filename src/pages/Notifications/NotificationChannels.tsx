import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotificationTemplatesStore } from '../../stores/useNotificationTemplatesStore';
import { Breadcrumb, Alert } from '../../components/ui/OverlaysAndFeedback';
import { Button } from '../../components/ui/Button';
import { Card, Badge } from '../../components/ui/DataDisplay';
import { Switch } from '../../components/ui/FormControls';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';

export const NotificationChannelsPage: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const {
    channels,
    editingChannelId,
    editingChannelJson,
    isConfirmDialogOpen,
    confirmActionType,
    setEditingChannelId,
    setEditingChannelJson,
    saveChannelConfig,
    openConfirmDialog,
    closeConfirmDialog,
    executeConfirmAction,
  } = useNotificationTemplatesStore();

  const handleToggleClick = (id: string) => {
    openConfirmDialog('TOGGLE_CHANNEL', id);
  };

  const handleConfirmToggle = () => {
    executeConfirmAction();
    showToast(t('notificationChannelUpdatedSuccess'), 'success');
  };

  const handleSaveChannelConfig = (id: string) => {
    saveChannelConfig(id, editingChannelJson);
    showToast(t('notificationChannelUpdatedSuccess'), 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Breadcrumb
            items={[
              { label: t('navOverview') },
              { label: t('groupNotifications') },
              { label: t('navNotificationChannels') },
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
            {t('notifChannelsTitle')}
          </h1>
        </div>
      </div>

      {/* 2. 5 Fixed Rows Channel Config Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {channels.map((channel) => {
          const isEditing = editingChannelId === channel.id;

          return (
            <Card key={channel.id} variant="flat" padding="md">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: 'var(--radius-md, 7px)',
                      background: channel.isEnabled ? 'rgba(36, 102, 216, 0.1)' : 'var(--surface-sunken, #E6ECF3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: channel.isEnabled ? 'var(--brand-primary, #2466D8)' : 'var(--text-muted, #647488)',
                      fontSize: '20px',
                    }}
                  >
                    {channel.channelCode === 'EMAIL' && <i className="ti ti-mail" aria-hidden="true" />}
                    {channel.channelCode === 'SMS' && <i className="ti ti-message" aria-hidden="true" />}
                    {channel.channelCode === 'WHATSAPP' && <i className="ti ti-brand-whatsapp" aria-hidden="true" />}
                    {channel.channelCode === 'PUSH' && <i className="ti ti-device-mobile" aria-hidden="true" />}
                    {channel.channelCode === 'INTERNAL' && <i className="ti ti-broadcast" aria-hidden="true" />}
                  </span>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-strong, #14222F)' }}>
                        {channel.channelName}
                      </span>
                      <Badge variant="neutral" size="sm">
                        {channel.channelCode}
                      </Badge>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted, #647488)', marginTop: '2px', textAlign: 'start' }}>
                      Gateway Status: {channel.isEnabled ? 'Operational (Active)' : 'Offline (Disabled)'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    iconLeft={<i className="ti ti-code" aria-hidden="true" />}
                    onClick={() => {
                      if (isEditing) {
                        setEditingChannelId(null);
                      } else {
                        setEditingChannelId(channel.id);
                      }
                    }}
                  >
                    {isEditing ? t('close') : t('editJsonConfig')}
                  </Button>

                  <Switch
                    label={channel.isEnabled ? t('enabled') : t('disabled')}
                    checked={channel.isEnabled}
                    onChange={() => handleToggleClick(channel.id)}
                  />
                </div>
              </div>

              {!channel.isEnabled && (
                <div style={{ marginTop: '12px' }}>
                  <Alert variant="warning" message={t('channelDisabledWarning')} />
                </div>
              )}

              {/* Inline JSON Configuration Editor */}
              {isEditing && (
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle, #E6ECF3)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-strong, #14222F)' }}>
                      JSON Configuration Payload
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button variant="secondary" size="sm" onClick={() => setEditingChannelId(null)}>
                        {t('cancel')}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSaveChannelConfig(channel.id)}
                      >
                        {t('save')}
                      </Button>
                    </div>
                  </div>

                  <textarea
                    rows={8}
                    value={editingChannelJson}
                    onChange={(e) => setEditingChannelJson(e.target.value)}
                    style={{
                      width: '100%',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '12px',
                      padding: '12px',
                      borderRadius: 'var(--radius-md, 7px)',
                      border: '1px solid var(--border-default, #B7C3D1)',
                      background: 'var(--navy-950, #050B14)',
                      color: '#4ADE80',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen && confirmActionType === 'TOGGLE_CHANNEL'}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirmToggle}
        title={t('confirmActionTitle')}
        message={t('confirmToggleChannel')}
        confirmLabel={t('confirm')}
        cancelLabel={t('cancel')}
        tone="primary"
      />
    </div>
  );
};
