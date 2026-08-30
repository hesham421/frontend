import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useLegalEntitiesFacade } from '@/features/legalEntities';
import type { LegalEntityResponse, CreateLegalEntityRequest, UpdateLegalEntityRequest } from '@/features/legalEntities';
import { mapApiError } from '@/lib/errors/mapApiError';
import { Breadcrumb, Drawer, Alert } from '@/components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '@/components/ui/Button';
import { Card, Badge } from '@/components/ui/DataDisplay';
import { Input, Select } from '@/components/ui/FormControls';
import { Table, type TableColumn } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

export const LegalEntitiesPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const setCurrentScreen = useNavigationStore((state) => state.setCurrentScreen);
  const {
    legalentityList,
    selectedItem,
    isLoading,
    isListLoading,
    loadError,
    entityTypeIdOptions,
    page,
    size,
    totalElements,
    canCreate,
    canEdit,
    selectItem,
    setSearchFilters,
    retry,
    createLegalEntity,
    updateLegalEntity,
    deactivateLegalEntity,
    activateLegalEntity,
  } = useLegalEntitiesFacade();

  const canSaveDrawer = selectedItem ? canEdit : canCreate;

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState<{ entity: LegalEntityResponse; activate: boolean } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [entityTypeId, setEntityTypeId] = useState('');

  const applyFilters = (text: string, status: 'ALL' | 'ACTIVE' | 'INACTIVE') => {
    const filters: { field: string; operator: 'LIKE' | 'EQ'; value: unknown }[] = [];
    if (text) filters.push({ field: 'nameEn', operator: 'LIKE', value: text });
    if (status !== 'ALL') filters.push({ field: 'isActiveFl', operator: 'EQ', value: status === 'ACTIVE' });
    setSearchFilters({ filters, page: 0 });
  };

  const handleOpenCreate = () => {
    setNameEn('');
    setNameAr('');
    setEntityTypeId(entityTypeIdOptions[0]?.code ?? '');
    setErrorMessage(null);
    selectItem(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (entity: LegalEntityResponse) => {
    setNameEn(entity.nameEn ?? '');
    setNameAr(entity.nameAr ?? '');
    setEntityTypeId(entity.entityTypeId ?? '');
    setErrorMessage(null);
    selectItem(entity);
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    setErrorMessage(null);
    try {
      if (selectedItem?.id != null) {
        const req: UpdateLegalEntityRequest = { nameEn, nameAr, entityTypeId };
        await updateLegalEntity(selectedItem.id, req);
        showToast(t('legalEntitySavedSuccess'), 'success');
      } else {
        const req: CreateLegalEntityRequest = { nameEn, nameAr, entityTypeId };
        await createLegalEntity(req);
        showToast(t('legalEntityCreatedSuccess'), 'success');
      }
      setIsDrawerOpen(false);
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
    }
  };

  const handleConfirmToggle = async () => {
    if (!confirmToggle?.entity.id) return;
    try {
      if (confirmToggle.activate) {
        await activateLegalEntity(confirmToggle.entity.id);
        showToast(t('legalEntityActivatedSuccess'), 'success');
      } else {
        await deactivateLegalEntity(confirmToggle.entity.id);
        showToast(t('legalEntityDeactivatedSuccess'), 'success');
      }
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
    }
    setConfirmToggle(null);
  };

  const statusOptions = [
    { value: 'ALL', label: t('all') },
    { value: 'ACTIVE', label: t('active') },
    { value: 'INACTIVE', label: t('inactive') },
  ];

  const entityTypeSelectOptions = entityTypeIdOptions.map((opt) => ({
    value: opt.code ?? '',
    label: lang === 'ar' ? (opt.label ?? opt.code ?? '') : (opt.labelEn ?? opt.code ?? ''),
  }));

  const columns: TableColumn<LegalEntityResponse>[] = [
    { key: 'code', header: t('code'), render: (e) => <Badge variant="neutral" size="sm">{e.legalEntityCode}</Badge> },
    {
      key: 'name',
      header: t('name'),
      render: (e) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-strong, #14222F)', fontSize: '14px' }}>
            {lang === 'ar' ? e.nameAr : e.nameEn}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #647488)' }}>
            {lang === 'ar' ? e.nameEn : e.nameAr}
          </div>
        </div>
      ),
    },
    {
      key: 'entityType',
      header: t('entityType'),
      render: (e) => <Badge variant="primary" size="sm">{e.entityTypeId}</Badge>,
    },
    {
      key: 'status',
      header: t('status'),
      render: (e) => (
        <Badge variant={e.isActive ? 'success' : 'danger'} size="sm">
          {e.isActive ? t('active') : t('inactive')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: t('actions'),
      align: 'end',
      render: (e) => (
        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
          <Button variant="ghost" size="sm" onClick={() => setCurrentScreen('org-branches')} iconRight={<i className="ti ti-arrow-right" />}>
            {t('viewBranches')}
          </Button>
          {canEdit && (
            <IconButton icon="ti ti-edit" label={t('edit')} variant="ghost" size="sm" onClick={() => handleOpenEdit(e)} />
          )}
          {canEdit && (e.isActive ? (
            <IconButton
              icon="ti ti-ban"
              label={t('deactivate')}
              variant="ghost"
              size="sm"
              onClick={() => setConfirmToggle({ entity: e, activate: false })}
            />
          ) : (
            <IconButton
              icon="ti ti-check"
              label={t('reactivate')}
              variant="ghost"
              size="sm"
              onClick={() => setConfirmToggle({ entity: e, activate: true })}
            />
          ))}
        </div>
      ),
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
              { label: t('groupOrganization') },
              { label: t('navLegalEntities') },
            ]}
          />
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-strong, #14222F)', margin: '4px 0 0 0', textAlign: 'start' }}>
            {t('orgEntitiesTitle')}
          </h1>
        </div>
        {canCreate && (
          <Button variant="primary" iconLeft={<i className="ti ti-plus" />} onClick={handleOpenCreate}>
            {t('new')}
          </Button>
        )}
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
                applyFilters(e.target.value, statusFilter);
              }}
              iconLeft={<i className="ti ti-search" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
            />
          </div>
          <div style={{ width: '150px' }}>
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => {
                const next = e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE';
                setStatusFilter(next);
                applyFilters(searchText, next);
              }}
            />
          </div>
          {(searchText || statusFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchText('');
                setStatusFilter('ALL');
                applyFilters('', 'ALL');
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
        <Table<LegalEntityResponse>
          columns={columns}
          rows={legalentityList}
          getRowKey={(e) => e.id!}
          isLoading={isListLoading}
          loadError={loadError}
          onRetry={retry}
          emptyIcon="ti ti-building-off"
          emptyTitle={t('noRecordsFound')}
          emptyDescription={t('noRecordsDesc')}
          emptyAction={canCreate ? { label: t('new'), onClick: handleOpenCreate } : undefined}
        />
        {!loadError && <Pagination page={page} size={size} totalElements={totalElements} onPageChange={(p) => setSearchFilters({ page: p })} />}
      </Card>

      {/* 4. Create / Edit Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedItem ? `${t('edit')}: ${lang === 'ar' ? selectedItem.nameAr : selectedItem.nameEn}` : t('new')}
        width="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button type="button" variant="secondary" onClick={() => setIsDrawerOpen(false)}>
              {t('cancel')}
            </Button>
            {canSaveDrawer && (
              <Button variant="primary" onClick={handleSave} loading={isLoading}>
                {t('save')}
              </Button>
            )}
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedItem && (
            <Input label={t('code')} value={selectedItem.legalEntityCode ?? ''} disabled helperText={t('readOnlyCodeHint')} />
          )}
          <Input
            label={`${t('nameEn')} *`}
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            disabled={!canSaveDrawer}
            required
          />
          <Input
            label={`${t('nameAr')} *`}
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            disabled={!canSaveDrawer}
            required
          />
          <Select
            label={`${t('entityType')} *`}
            options={entityTypeSelectOptions}
            value={entityTypeId}
            onChange={(e) => setEntityTypeId(e.target.value)}
            disabled={!canSaveDrawer}
          />
        </div>
      </Drawer>

      {/* 5. Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmToggle != null}
        onClose={() => setConfirmToggle(null)}
        onConfirm={handleConfirmToggle}
        title={t('confirmActionTitle')}
        message={confirmToggle?.activate ? t('confirmReactivate') : t('confirmDeactivate')}
        confirmLabel={confirmToggle?.activate ? t('reactivate') : t('deactivate')}
        cancelLabel={t('cancel')}
        tone={confirmToggle?.activate ? 'primary' : 'danger'}
      />
    </div>
  );
};
