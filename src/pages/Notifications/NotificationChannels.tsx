import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotificationTemplatesStore } from '../../stores/useNotificationTemplatesStore';
import { Breadcrumb, Dialog, Alert } from '../../components/ui/OverlaysAndFeedback';
import { Button } from '../../components/ui/Button';
import { Card, Stat, Badge } from '../../components/ui/DataDisplay';
import { Switch } from '../../components/ui/FormControls';

export const NotificationChannelsPage: React.FC = () => {
  const { t } = useLanguage();
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

  const handleToggleClick = (id: string, currentEnabled: boolean) => {
    if (currentEnabled) {
      // Prompt warning dialog before turning off
      openConfirmDialog('TOGGLE_CHANNEL', id);
    } else {
      openConfirmDialog('TOGGLE_CHANNEL', id);
    }
  };

  const enabledCount = channels.filter((c) => c.isEnabled).length;

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

      {/* 2. KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <Stat
          label={t('totalRecords')}
          value={channels.length}
          icon={<i className="ti ti-adjustments-horizontal" style={{ color: 'var(--brand-primary, #2466D8)', fontSize: '20px' }} />}
        />
        <Stat
          label={t('activeChannels')}
          value={enabledCount}
          trend={{ value: `${enabledCount}/5 active`, isPositive: true }}
          icon={<i className="ti ti-check" style={{ color: 'var(--green-500, #1D9A6C)', fontSize: '20px' }} />}
        />
        <Stat
          label={t('inactiveRecords')}
          value={channels.length - enabledCount}
          icon={<i className="ti ti-x" style={{ color: 'var(--red-500, #CB3A2D)', fontSize: '20px' }} />}
        />
      </div>

      {/* 3. 5 Fixed Rows Channel Config Grid */}
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
                    {channel.channelCode === 'EMAIL' && <i className="ti ti-mail" />}
                    {channel.channelCode === 'SMS' && <i className="ti ti-message" />}
                    {channel.channelCode === 'WHATSAPP' && <i className="ti ti-brand-whatsapp" />}
                    {channel.channelCode === 'PUSH' && <i className="ti ti-device-mobile" />}
                    {channel.channelCode === 'INTERNAL' && <i className="ti ti-broadcast" />}
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
                    iconLeft={<i className="ti ti-code" />}
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
                    onChange={() => handleToggleClick(channel.id, channel.isEnabled)}
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
                        onClick={() => saveChannelConfig(channel.id, editingChannelJson)}
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
      <Dialog
        isOpen={isConfirmDialogOpen && confirmActionType === 'TOGGLE_CHANNEL'}
        onClose={closeConfirmDialog}
        title={t('confirmActionTitle')}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={closeConfirmDialog}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={executeConfirmAction}>
              {t('confirm')}
            </Button>
          </div>
        }
      >
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-body, #354456)' }}>
          {t('confirmToggleChannel')}
        </p>
      </Dialog>
    </div>
  );
};
