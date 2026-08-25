import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSecurityStore } from '../../stores/useSecurityStore';
import { Breadcrumb, Dialog, EmptyState } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Stat, Badge } from '../../components/ui/DataDisplay';
import { Input, Select } from '../../components/ui/FormControls';
import { AppPermission } from '../../data/mockData';

export const PermissionsPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    permissions,
    screens,
    permSearch,
    permModuleFilter,
    selectedPermission,
    isPermDialogOpen,
    setPermSearch,
    setPermModuleFilter,
    openPermDialog,
    closePermDialog,
    savePermission,
  } = useSecurityStore();

  const [name, setName] = useState('');
  const [permissionType, setPermissionType] = useState<AppPermission['permissionType']>('VIEW');
  const [pageId, setPageId] = useState('');
  const [module, setModule] = useState('SEC');

  const handleOpenCreate = () => {
    setName('PERM_');
    setPermissionType('VIEW');
    setPageId('');
    setModule('SEC');
    openPermDialog(null);
  };

  const handleOpenEdit = (perm: AppPermission) => {
    setName(perm.name);
    setPermissionType(perm.permissionType);
    setPageId(perm.pageId || '');
    setModule(perm.module || 'SEC');
    openPermDialog(perm);
  };

  const handleSave = () => {
    savePermission({
      id: selectedPermission?.id,
      name,
      permissionType,
      pageId: pageId || undefined,
      module,
    });
  };

  const filteredPerms = permissions.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(permSearch.toLowerCase()) ||
      p.permissionType.toLowerCase().includes(permSearch.toLowerCase());

    const matchesModule = permModuleFilter === 'ALL' || p.module === permModuleFilter;

    return matchesSearch && matchesModule;
  });

  const moduleOptions = [
    { value: 'ALL', label: t('all') },
    { value: 'SEC', label: 'SEC (Security)' },
    { value: 'ORG', label: 'ORG (Organization)' },
    { value: 'FILE', label: 'FILE (File Service)' },
    { value: 'NOTIF', label: 'NOTIF (Notifications)' },
    { value: 'FIN', label: 'FIN (Finance)' },
  ];

  const permTypeOptions = [
    { value: 'VIEW', label: 'VIEW' },
    { value: 'CREATE', label: 'CREATE' },
    { value: 'UPDATE', label: 'UPDATE' },
    { value: 'DELETE', label: 'DELETE' },
    { value: 'SYSTEM', label: 'SYSTEM' },
  ];

  const pageOptions = [
    { value: '', label: '-- None / Global --' },
    ...screens.map((s) => ({ value: s.id, label: `${s.nameEn} (${s.pageCode})` })),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Breadcrumb
            items={[
              { label: t('navOverview') },
              { label: t('groupSecurity') },
              { label: t('navPermissions') },
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
            {t('secPermsTitle')}
          </h1>
        </div>
        <Button variant="primary" iconLeft={<i className="ti ti-plus" />} onClick={handleOpenCreate}>
          {t('new')}
        </Button>
      </div>

      {/* 2. KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <Stat
          label={t('totalRecords')}
          value={permissions.length}
          icon={<i className="ti ti-key" style={{ color: 'var(--brand-primary, #2466D8)', fontSize: '20px' }} />}
        />
        <Stat
          label="VIEW Grants"
          value={permissions.filter((p) => p.permissionType === 'VIEW').length}
          icon={<i className="ti ti-eye" style={{ color: 'var(--green-500, #1D9A6C)', fontSize: '20px' }} />}
        />
        <Stat
          label="Write / Admin Grants"
          value={permissions.filter((p) => p.permissionType !== 'VIEW').length}
          icon={<i className="ti ti-lock" style={{ color: 'var(--amber-500, #DF8B17)', fontSize: '20px' }} />}
        />
      </div>

      {/* 3. Filter Bar */}
      <Card variant="flat" padding="md">
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 280px', minWidth: '220px' }}>
            <Input
              placeholder={t('searchPlaceholder')}
              value={permSearch}
              onChange={(e) => setPermSearch(e.target.value)}
              iconLeft={<i className="ti ti-search" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
            />
          </div>
          <div style={{ width: '180px' }}>
            <Select
              options={moduleOptions}
              value={permModuleFilter}
              onChange={(e) => setPermModuleFilter(e.target.value)}
            />
          </div>
          {(permSearch || permModuleFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPermSearch('');
                setPermModuleFilter('ALL');
              }}
            >
              {t('clear')}
            </Button>
          )}
        </div>
      </Card>

      {/* 4. Data Grid */}
      <Card variant="flat" padding="none">
        {filteredPerms.length === 0 ? (
          <EmptyState
            icon="ti ti-key-off"
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
                    {t('name')}
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'start' }}>
                    {t('permType')}
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'start' }}>
                    Module
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'start' }}>
                    Target Page
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'end' }}>
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPerms.map((p) => {
                  const targetPage = screens.find((s) => s.id === p.pageId);
                  const typeVariant =
                    p.permissionType === 'VIEW'
                      ? 'success'
                      : p.permissionType === 'DELETE'
                      ? 'danger'
                      : p.permissionType === 'SYSTEM'
                      ? 'accent'
                      : 'primary';

                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle, #E6ECF3)',
                        transition: 'background 120ms ease',
                      }}
                    >
                      <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 600, color: 'var(--text-strong, #14222F)', fontSize: '13px' }}>
                        {p.name}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Badge variant={typeVariant} size="sm">
                          {p.permissionType}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Badge variant="neutral" size="sm">
                          {p.module}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: 'var(--text-body, #354456)' }}>
                        {targetPage ? targetPage.nameEn : '—'}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'end' }}>
                        <IconButton
                          icon="ti ti-edit"
                          label={t('edit')}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(p)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 5. Create / Edit Dialog (No Delete button per spec) */}
      <Dialog
        isOpen={isPermDialogOpen}
        onClose={closePermDialog}
        title={selectedPermission ? `${t('edit')}: ${selectedPermission.name}` : t('new')}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={closePermDialog}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {t('save')}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label={`${t('name')} *`}
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            helperText={t('permNameHint')}
            required
          />
          <Select
            label={`${t('permType')} *`}
            options={permTypeOptions}
            value={permissionType}
            onChange={(e) => setPermissionType(e.target.value as AppPermission['permissionType'])}
          />
          <Select
            label="Module *"
            options={moduleOptions.filter((m) => m.value !== 'ALL')}
            value={module}
            onChange={(e) => setModule(e.target.value)}
          />
          <Select
            label="Associated Screen"
            options={pageOptions}
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
          />
        </div>
      </Dialog>
    </div>
  );
};
