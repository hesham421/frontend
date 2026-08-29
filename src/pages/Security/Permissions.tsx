import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { usePermissionRegistryFacade } from '../../permissions/hooks';
import { PERMISSION_TYPES, type PermissionType } from '../../permissions/permissionType';
import type { PermissionDto } from '../../permissions/permissionsApi';
import { mapApiError } from '../../lib/errors/mapApiError';
import { Breadcrumb, Drawer, Alert } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Badge } from '../../components/ui/DataDisplay';
import { Input, Select } from '../../components/ui/FormControls';
import { Table, type TableColumn } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { useToast } from '../../components/ui/Toast';
import { getModuleLabel } from '../../data/moduleLabels';

// API-SEC-029 allowed search fields: name, module. `module` is a real
// server-side filter (joined via the page's module) even though it is not
// a field on PermissionDto itself — search-only, never a create/edit field.
const MODULE_FILTER_CODES = ['SEC', 'ORG', 'FILE', 'NOTIF', 'FIN'];

export const PermissionsPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const {
    permissionList,
    selectedPerm,
    isLoading,
    isListLoading,
    loadError,
    page,
    size,
    totalElements,
    pageOptions,
    selectPermission,
    setSearchFilters,
    setPage,
    retry,
    createPermission,
    updatePermission,
  } = usePermissionRegistryFacade();

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
        showToast(t('permissionSavedSuccess'), 'success');
      } else {
        await createPermission({ name, permissionType, pageId: pageId ? Number(pageId) : undefined });
        showToast(t('permissionCreatedSuccess'), 'success');
      }
      setIsPermDialogOpen(false);
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
    }
  };

  const moduleFilterOptions = [
    { value: 'ALL', label: t('all') },
    ...MODULE_FILTER_CODES.map((code) => ({ value: code, label: getModuleLabel(code, t) })),
  ];
  const permTypeOptions = PERMISSION_TYPES.map((v) => ({ value: v, label: v }));
  const pageSelectOptions = [
    { value: '', label: t('noneGlobalOption') },
    ...pageOptions.map((p) => ({ value: String(p.id), label: `${lang === 'ar' ? p.nameAr : p.nameEn} (${p.pageCode})` })),
  ];

  const permissionColumns: TableColumn<PermissionDto>[] = [
    {
      key: 'name',
      header: t('name'),
      render: (p) => (
        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 600, color: 'var(--text-strong, #14222F)', fontSize: '13px' }}>
          {p.name}
        </span>
      ),
    },
    {
      key: 'type',
      header: t('permType'),
      render: (p) => (
        <Badge variant={p.permissionType === 'VIEW' ? 'success' : p.permissionType === 'DELETE' ? 'danger' : 'primary'} size="sm">
          {p.permissionType}
        </Badge>
      ),
    },
    {
      key: 'targetPage',
      header: t('colTargetPage'),
      render: (p) => {
        const targetPage = pageOptions.find((s) => s.id === p.pageId);
        return (
          <span style={{ fontSize: '13px', color: 'var(--text-body, #354456)' }}>
            {targetPage ? (lang === 'ar' ? targetPage.nameAr : targetPage.nameEn) : '—'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: t('actions'),
      align: 'end',
      render: (p) => <IconButton icon="ti ti-edit" label={t('edit')} variant="ghost" size="sm" onClick={() => handleOpenEdit(p)} />,
    },
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

      {/* 2. Filter Bar */}
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

      {/* 3. Data Grid */}
      <Card variant="flat" padding="none">
        <Table<PermissionDto>
          columns={permissionColumns}
          rows={permissionList}
          getRowKey={(p) => p.id!}
          isLoading={isListLoading}
          loadError={loadError}
          onRetry={retry}
          emptyIcon="ti ti-key-off"
          emptyTitle={t('noRecordsFound')}
          emptyDescription={t('noRecordsDesc')}
          emptyAction={{ label: t('new'), onClick: handleOpenCreate }}
        />
        {!loadError && (
          <Pagination page={page} size={size} totalElements={totalElements} onPageChange={setPage} />
        )}
      </Card>

      {/* 4. Create / Edit Drawer (No Delete button — no real delete endpoint) */}
      <Drawer
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
            label={t('colAssociatedScreen')}
            options={pageSelectOptions}
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            disabled={!!selectedPerm}
          />
          {selectedPerm && <Alert variant="info" message={t('readOnlyCodeHint')} />}
        </div>
      </Drawer>
    </div>
  );
};
