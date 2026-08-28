import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { usePermissionRegistryFacade } from '../../permissions/hooks';
import { PERMISSION_TYPES, type PermissionType } from '../../permissions/permissionType';
import type { PermissionDto } from '../../permissions/permissionsApi';
import { ApiError } from '../../lib/errors/ApiError';
import { Breadcrumb, Dialog, EmptyState, Alert } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Stat, Badge } from '../../components/ui/DataDisplay';
import { Input, Select } from '../../components/ui/FormControls';

// API-SEC-029 allowed search fields: name, module. `module` is a real
// server-side filter (joined via the page's module) even though it is not
// a field on PermissionDto itself — search-only, never a create/edit field.
const MODULE_FILTERS = [
  { value: 'SEC', label: 'SEC (Security)' },
  { value: 'ORG', label: 'ORG (Organization)' },
  { value: 'FILE', label: 'FILE (File Service)' },
  { value: 'NOTIF', label: 'NOTIF (Notifications)' },
  { value: 'FIN', label: 'FIN (Finance)' },
];

export const PermissionsPage: React.FC = () => {
  const { t } = useLanguage();
  const { permissionList, selectedPerm, isLoading, pageOptions, selectPermission, setSearchFilters, createPermission, updatePermission } =
    usePermissionRegistryFacade();

  const [searchText, setSearchText] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [isPermDialogOpen, setIsPermDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [permissionType, setPermissionType] = useState<PermissionType>('VIEW');
  const [pageId, setPageId] = useState('');

  const applySearch = (text: string, module: string) => {
    const filters = [];
    if (text) filters.push({ field: 'name', operator: 'LIKE' as const, value: text });
    if (module !== 'ALL') filters.push({ field: 'module', operator: 'EQ' as const, value: module });
    setSearchFilters({ filters, page: 0 });
  };

  const handleOpenCreate = () => {
    setName('PERM_');
    setPermissionType('VIEW');
    setPageId('');
    setErrorMessage(null);
    selectPermission(null);
    setIsPermDialogOpen(true);
  };

  const handleOpenEdit = (perm: PermissionDto) => {
    setName(perm.name || '');
    setPermissionType((perm.permissionType as PermissionType) || 'VIEW');
    setPageId(perm.pageId != null ? String(perm.pageId) : '');
    setErrorMessage(null);
    selectPermission(perm);
    setIsPermDialogOpen(true);
  };

  const handleSave = async () => {
    setErrorMessage(null);
    try {
      if (selectedPerm?.id != null) {
        // Only `name` is writable via update — permissionType/pageId are read-only.
        await updatePermission(selectedPerm.id, name);
      } else {
        await createPermission({ name, permissionType, pageId: pageId ? Number(pageId) : undefined });
      }
      setIsPermDialogOpen(false);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'An unexpected error occurred. Please try again.');
    }
  };

  const moduleFilterOptions = [{ value: 'ALL', label: t('all') }, ...MODULE_FILTERS];
  const permTypeOptions = PERMISSION_TYPES.map((v) => ({ value: v, label: v }));
  const pageSelectOptions = [
    { value: '', label: '-- None / Global --' },
    ...pageOptions.map((p) => ({ value: String(p.id), label: `${p.nameEn} (${p.pageCode})` })),
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
          value={permissionList.length}
          icon={<i className="ti ti-key" style={{ color: 'var(--brand-primary, #2466D8)', fontSize: '20px' }} />}
        />
        <Stat
          label="VIEW Grants"
          value={permissionList.filter((p) => p.permissionType === 'VIEW').length}
          icon={<i className="ti ti-eye" style={{ color: 'var(--green-500, #1D9A6C)', fontSize: '20px' }} />}
        />
        <Stat
          label="Write / Admin Grants"
          value={permissionList.filter((p) => p.permissionType !== 'VIEW').length}
          icon={<i className="ti ti-lock" style={{ color: 'var(--amber-500, #DF8B17)', fontSize: '20px' }} />}
        />
      </div>

      {/* 3. Filter Bar */}
      <Card variant="flat" padding="md">
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 280px', minWidth: '220px' }}>
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                applySearch(e.target.value, moduleFilter);
              }}
              iconLeft={<i className="ti ti-search" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
            />
          </div>
          <div style={{ width: '180px' }}>
            <Select
              options={moduleFilterOptions}
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                applySearch(searchText, e.target.value);
              }}
            />
          </div>
          {(searchText || moduleFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchText('');
                setModuleFilter('ALL');
                applySearch('', 'ALL');
              }}
            >
              {t('clear')}
            </Button>
          )}
        </div>
      </Card>

      {errorMessage && <Alert variant="danger" message={errorMessage} />}

      {/* 4. Data Grid */}
      <Card variant="flat" padding="none">
        {permissionList.length === 0 ? (
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
                    Target Page
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'end' }}>
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {permissionList.map((p) => {
                  const targetPage = pageOptions.find((s) => s.id === p.pageId);
                  const typeVariant = p.permissionType === 'VIEW' ? 'success' : p.permissionType === 'DELETE' ? 'danger' : 'primary';

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

      {/* 5. Create / Edit Dialog (No Delete button — no real delete endpoint) */}
      <Dialog
        isOpen={isPermDialogOpen}
        onClose={() => setIsPermDialogOpen(false)}
        title={selectedPerm ? `${t('edit')}: ${selectedPerm.name}` : t('new')}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={() => setIsPermDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleSave} loading={isLoading}>
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
            onChange={(e) => setPermissionType(e.target.value as PermissionType)}
            disabled={!!selectedPerm}
          />
          <Select
            label="Associated Screen"
            options={pageSelectOptions}
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            disabled={!!selectedPerm}
          />
          {selectedPerm && <Alert variant="info" message={t('readOnlyCodeHint')} />}
        </div>
      </Dialog>
    </div>
  );
};
