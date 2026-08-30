import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotificationTemplatesStore } from '../../stores/useNotificationTemplatesStore';
import { Breadcrumb, Drawer, EmptyState, Tabs, Alert } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Badge } from '../../components/ui/DataDisplay';
import { Input, Select, Switch } from '../../components/ui/FormControls';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { NotificationTemplate } from '../../data/mockData';
import { getModuleLabel } from '../../data/moduleLabels';

export const NotificationTemplatesPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const {
    templates,
    templateSearch,
    channelFilter,
    moduleFilter,
    statusFilter,
    selectedTemplate,
    isTemplateDrawerOpen,
    isConfirmDialogOpen,
    confirmActionType,
    setTemplateSearch,
    setChannelFilter,
    setModuleFilter,
    setStatusFilter,
    openTemplateDrawer,
    closeTemplateDrawer,
    saveTemplate,
    openConfirmDialog,
    closeConfirmDialog,
    executeConfirmAction,
  } = useNotificationTemplatesStore();

  const [templateCode, setTemplateCode] = useState('');
  const [templateNameEn, setTemplateNameEn] = useState('');
  const [templateNameAr, setTemplateNameAr] = useState('');
  const [channelTypeId, setChannelTypeId] = useState<NotificationTemplate['channelTypeId']>('EMAIL');
  const [moduleCode, setModuleCode] = useState<NotificationTemplate['moduleCode']>('SEC');
  const [templateBodyEn, setTemplateBodyEn] = useState('');
  const [templateBodyAr, setTemplateBodyAr] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [bodyTab, setBodyTab] = useState<'en' | 'ar'>('en');

  const handleOpenCreate = () => {
    setTemplateCode('TMPL_');
    setTemplateNameEn('');
    setTemplateNameAr('');
    setChannelTypeId('EMAIL');
    setModuleCode('SYS');
    setTemplateBodyEn('');
    setTemplateBodyAr('');
    setIsActive(true);
    setBodyTab('en');
    openTemplateDrawer(null);
  };

  const handleOpenEdit = (tmpl: NotificationTemplate) => {
    setTemplateCode(tmpl.templateCode);
    setTemplateNameEn(tmpl.templateNameEn);
    setTemplateNameAr(tmpl.templateNameAr);
    setChannelTypeId(tmpl.channelTypeId);
    setModuleCode(tmpl.moduleCode);
    setTemplateBodyEn(tmpl.templateBodyEn);
    setTemplateBodyAr(tmpl.templateBodyAr);
    setIsActive(tmpl.isActive);
    setBodyTab('en');
    openTemplateDrawer(tmpl);
  };

  const handleSave = () => {
    const isEdit = !!selectedTemplate;
    saveTemplate({
      id: selectedTemplate?.id,
      templateCode,
      templateNameEn,
      templateNameAr,
      channelTypeId,
      moduleCode,
      templateBodyEn,
      templateBodyAr,
      isActive,
    });
    showToast(t(isEdit ? 'notificationTemplateSavedSuccess' : 'notificationTemplateCreatedSuccess'), 'success');
  };

  const handleConfirmDeactivate = () => {
    executeConfirmAction();
    showToast(t('notificationTemplateDeactivatedSuccess'), 'success');
  };

  const filteredTemplates = templates.filter((tmpl) => {
    const matchesSearch =
      tmpl.templateCode.toLowerCase().includes(templateSearch.toLowerCase()) ||
      tmpl.templateNameEn.toLowerCase().includes(templateSearch.toLowerCase()) ||
      tmpl.templateNameAr.includes(templateSearch);

    const matchesChannel = channelFilter === 'ALL' || tmpl.channelTypeId === channelFilter;
    const matchesModule = moduleFilter === 'ALL' || tmpl.moduleCode === moduleFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && tmpl.isActive) ||
      (statusFilter === 'INACTIVE' && !tmpl.isActive);

    return matchesSearch && matchesChannel && matchesModule && matchesStatus;
  });

  const channelOptions = [
    { value: 'ALL', label: t('all') },
    { value: 'EMAIL', label: 'Email (بريد إلكتروني)' },
    { value: 'SMS', label: 'SMS (رسائل نصية)' },
    { value: 'WHATSAPP', label: 'WhatsApp (واتساب)' },
    { value: 'PUSH', label: 'Push Notification (إشعار تطبيقي)' },
    { value: 'INTERNAL', label: 'Internal (نظام داخلي)' },
  ];

  const moduleOptions = [
    { value: 'ALL', label: t('all') },
    ...['SEC', 'ORG', 'FIN', 'HR', 'INV', 'SYS'].map((code) => ({ value: code, label: getModuleLabel(code, t) })),
  ];

  const statusOptions = [
    { value: 'ALL', label: t('all') },
    { value: 'ACTIVE', label: t('active') },
    { value: 'INACTIVE', label: t('inactive') },
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
              { label: t('navNotificationTemplates') },
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
            {t('notifTemplatesTitle')}
          </h1>
        </div>
        <Button variant="primary" iconLeft={<i className="ti ti-plus" aria-hidden="true" />} onClick={handleOpenCreate}>
          {t('new')}
        </Button>
      </div>

      {/* 2. Filter Bar */}
      <Card variant="flat" padding="md">
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px', minWidth: '200px' }}>
            <Input
              placeholder={t('searchPlaceholder')}
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              iconLeft={<i className="ti ti-search" aria-hidden="true" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
            />
          </div>
          <div style={{ width: '180px' }}>
            <Select
              options={channelOptions}
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
            />
          </div>
          <div style={{ width: '160px' }}>
            <Select
              options={moduleOptions}
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
            />
          </div>
          <div style={{ width: '140px' }}>
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
          {(templateSearch || channelFilter !== 'ALL' || moduleFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTemplateSearch('');
                setChannelFilter('ALL');
                setModuleFilter('ALL');
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
        {filteredTemplates.length === 0 ? (
          <EmptyState
            icon="ti ti-template-off"
            title={t('noRecordsFound')}
            description={t('noRecordsDesc')}
            action={{ label: t('new'), onClick: handleOpenCreate }}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start' }}>
              <thead>
                <tr style={{ background: 'var(--surface-page, #F8FAFC)', borderBottom: '1px solid var(--border-subtle, #E6ECF3)' }}>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'start' }}>
                    {t('templateCode')}
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'start' }}>
                    {t('templateName')}
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'start' }}>
                    {t('channel')}
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'start' }}>
                    {t('module')}
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
                {filteredTemplates.map((tmpl) => (
                  <tr
                    key={tmpl.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle, #E6ECF3)',
                      transition: 'background 120ms ease',
                    }}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <Badge variant="neutral" size="sm">
                        {tmpl.templateCode}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-strong, #14222F)', fontSize: '14px' }}>
                        {lang === 'ar' ? tmpl.templateNameAr : tmpl.templateNameEn}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted, #647488)' }}>
                        {lang === 'ar' ? tmpl.templateNameEn : tmpl.templateNameAr}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Badge variant="primary" size="sm">
                        {tmpl.channelTypeId}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Badge variant="neutral" size="sm">
                        {tmpl.moduleCode}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Badge variant={tmpl.isActive ? 'success' : 'danger'} size="sm">
                        {tmpl.isActive ? t('active') : t('inactive')}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'end' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <IconButton
                          icon="ti ti-edit"
                          label={t('edit')}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(tmpl)}
                        />
                        {tmpl.isActive && (
                          <IconButton
                            icon="ti ti-ban"
                            label={t('deactivate')}
                            variant="ghost"
                            size="sm"
                            onClick={() => openConfirmDialog('DEACTIVATE_TEMPLATE', tmpl.id)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 5. Create / Edit Drawer (width="lg") */}
      <Drawer
        isOpen={isTemplateDrawerOpen}
        onClose={closeTemplateDrawer}
        title={selectedTemplate ? `${t('edit')}: ${selectedTemplate.templateNameEn}` : t('new')}
        width="lg"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={closeTemplateDrawer}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {t('save')}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label={`${t('templateCode')} *`}
              value={templateCode}
              onChange={(e) => setTemplateCode(e.target.value.toUpperCase())}
              disabled={!!selectedTemplate}
              helperText={selectedTemplate ? t('readOnlyCodeHint') : 'e.g. TMPL_AUTH_OTP'}
              required
            />
            <Select
              label={`${t('channel')} *`}
              options={channelOptions.filter((c) => c.value !== 'ALL')}
              value={channelTypeId}
              onChange={(e) => setChannelTypeId(e.target.value as NotificationTemplate['channelTypeId'])}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label={`${t('nameEn')} *`}
              value={templateNameEn}
              onChange={(e) => setTemplateNameEn(e.target.value)}
              required
            />
            <Input
              label={`${t('nameAr')} *`}
              value={templateNameAr}
              onChange={(e) => setTemplateNameAr(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select
              label={`${t('module')} *`}
              options={moduleOptions.filter((m) => m.value !== 'ALL')}
              value={moduleCode}
              onChange={(e) => setModuleCode(e.target.value as NotificationTemplate['moduleCode'])}
            />
            <div style={{ paddingTop: '24px' }}>
              <Switch
                label={t('active')}
                checked={isActive}
                onChange={(checked) => setIsActive(checked)}
              />
            </div>
          </div>

          {/* Bilingual Message Body with Tabs */}
          <div style={{ borderTop: '1px solid var(--border-subtle, #E6ECF3)', paddingTop: '16px' }}>
            <Alert variant="info" message={t('templateBodyRequired')} />
            <div style={{ margin: '14px 0 10px 0' }}>
              <Tabs
                variant="underline"
                tabs={[
                  { id: 'en', label: t('bodyEn'), icon: <i className="ti ti-language" aria-hidden="true" /> },
                  { id: 'ar', label: t('bodyAr'), icon: <i className="ti ti-language" aria-hidden="true" /> },
                ]}
                activeTab={bodyTab}
                onChange={(id) => setBodyTab(id as 'en' | 'ar')}
              />
            </div>

            {bodyTab === 'en' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-strong, #14222F)', textAlign: 'start' }}>
                  {t('bodyEn')} *
                </label>
                <textarea
                  rows={5}
                  value={templateBodyEn}
                  onChange={(e) => setTemplateBodyEn(e.target.value)}
                  placeholder="Dear {{username}}, your request for {{branchName}} has been approved."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md, 7px)',
                    border: '1px solid var(--border-default, #B7C3D1)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-strong, #14222F)', textAlign: 'start' }}>
                  {t('bodyAr')} *
                </label>
                <textarea
                  rows={5}
                  value={templateBodyAr}
                  onChange={(e) => setTemplateBodyAr(e.target.value)}
                  placeholder="عزيزي {{username}}، تمت الموافقة على طلبك لفرع {{branchName}}."
                  dir="rtl"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md, 7px)',
                    border: '1px solid var(--border-default, #B7C3D1)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            )}
            <div style={{ fontSize: '11px', color: 'var(--text-subtle, #8C9AAC)', marginTop: '6px', textAlign: 'start' }}>
              {t('availablePlaceholders')}
            </div>
          </div>
        </div>
      </Drawer>

      {/* 6. Deactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen && confirmActionType === 'DEACTIVATE_TEMPLATE'}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirmDeactivate}
        title={t('confirmActionTitle')}
        message={t('confirmDeactivate')}
        confirmLabel={t('deactivate')}
        cancelLabel={t('cancel')}
        tone="danger"
      />
    </div>
  );
};
