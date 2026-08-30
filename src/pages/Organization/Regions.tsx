import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useRegionsFacade } from '../../regions/hooks';
import type { RegionResponse, CreateRegionRequest, UpdateRegionRequest } from '../../regions/regionsApi';
import { mapApiError } from '../../lib/errors/mapApiError';
import { Breadcrumb, Drawer, Alert } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Badge } from '../../components/ui/DataDisplay';
import { Input, Select } from '../../components/ui/FormControls';
import { Table, type TableColumn } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';

export const RegionsPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const {
    regionList,
    selectedItem,
    isLoading,
    isListLoading,
    loadError,
    legalEntityFkOptions,
    regionTypeIdOptions,
    page,
    size,
    totalElements,
    canCreate,
    canEdit,
    selectItem,
    setSearchFilters,
    retry,
    createRegion,
    updateRegion,
    deactivateRegion,
    activateRegion,
  } = useRegionsFacade();

  const canSaveDrawer = selectedItem ? canEdit : canCreate;

  const [searchText, setSearchText] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState<{ region: RegionResponse; activate: boolean } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [legalEntityFk, setLegalEntityFk] = useState('');
  const [regionTypeIdFk, setRegionTypeIdFk] = useState('');
  const [notes, setNotes] = useState('');

  const applyFilters = (text: string, entity: string, status: 'ALL' | 'ACTIVE' | 'INACTIVE') => {
    const filters: { field: string; operator: 'LIKE' | 'EQ'; value: unknown }[] = [];
    if (text) filters.push({ field: 'nameEn', operator: 'LIKE', value: text });
    if (entity !== 'ALL') filters.push({ field: 'legalEntityFk', operator: 'EQ', value: Number(entity) });
    if (status !== 'ALL') filters.push({ field: 'isActiveFl', operator: 'EQ', value: status === 'ACTIVE' });
    setSearchFilters({ filters, page: 0 });
  };

  const handleOpenCreate = () => {
    setNameEn('');
    setNameAr('');
    setLegalEntityFk(legalEntityFkOptions[0]?.id != null ? String(legalEntityFkOptions[0].id) : '');
    setRegionTypeIdFk(regionTypeIdOptions[0]?.id != null ? String(regionTypeIdOptions[0].id) : '');
    setNotes('');
    setErrorMessage(null);
    selectItem(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (region: RegionResponse) => {
    setNameEn(region.nameEn ?? '');
    setNameAr(region.nameAr ?? '');
    setLegalEntityFk(region.legalEntityFk != null ? String(region.legalEntityFk) : '');
    setRegionTypeIdFk(region.regionTypeIdFk != null ? String(region.regionTypeIdFk) : '');
    setNotes(region.notes ?? '');
    setErrorMessage(null);
    selectItem(region);
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    setErrorMessage(null);
    try {
      if (selectedItem?.id != null) {
        const req: UpdateRegionRequest = { nameEn, nameAr, notes };
        await updateRegion(selectedItem.id, req);
        showToast(t('regionSavedSuccess'), 'success');
      } else {
        const req: CreateRegionRequest = {
          nameEn,
          nameAr,
          legalEntityFk: Number(legalEntityFk),
          regionTypeIdFk: Number(regionTypeIdFk),
          notes,
        };
        await createRegion(req);
        showToast(t('regionCreatedSuccess'), 'success');
      }
      setIsDrawerOpen(false);
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
    }
  };

  const handleConfirmToggle = async () => {
    if (!confirmToggle?.region.id) return;
    try {
      if (confirmToggle.activate) {
        await activateRegion(confirmToggle.region.id);
        showToast(t('regionActivatedSuccess'), 'success');
      } else {
        await deactivateRegion(confirmToggle.region.id);
        showToast(t('regionDeactivatedSuccess'), 'success');
      }
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
    }
    setConfirmToggle(null);
  };

  const entityOptions = [
    { value: 'ALL', label: t('all') },
    ...legalEntityFkOptions.map((e) => ({
      value: String(e.id),
      label: `${lang === 'ar' ? e.nameAr : e.nameEn} (${e.legalEntityCode})`,
    })),
  ];

  const regionTypeSelectOptions = regionTypeIdOptions.map((rt) => ({
    value: String(rt.id),
    label: lang === 'ar' ? rt.nameAr : rt.nameEn,
  }));

  const statusOptions = [
    { value: 'ALL', label: t('all') },
    { value: 'ACTIVE', label: t('active') },
    { value: 'INACTIVE', label: t('inactive') },
  ];

  const columns: TableColumn<RegionResponse>[] = [
    { key: 'code', header: t('code'), render: (r) => <Badge variant="neutral" size="sm">{r.regionCode}</Badge> },
    {
      key: 'name',
      header: t('name'),
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-strong, #14222F)', fontSize: '14px' }}>
            {lang === 'ar' ? r.nameAr : r.nameEn}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #647488)' }}>
            {lang === 'ar' ? r.nameEn : r.nameAr}
          </div>
        </div>
      ),
    },
    {
      key: 'legalEntity',
      header: t('legalEntity'),
      render: (r) => <span style={{ fontSize: '13px', color: 'var(--text-body, #354456)' }}>{r.legalEntityCode ?? '—'}</span>,
    },
    {
      key: 'regionType',
      header: t('regionType'),
      render: (r) => <Badge variant="primary" size="sm">{r.regionTypeNameEn || '—'}</Badge>,
    },
    {
      key: 'status',
      header: t('status'),
      render: (r) => (
        <Badge variant={r.isActive ? 'success' : 'danger'} size="sm">
          {r.isActive ? t('active') : t('inactive')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: t('actions'),
      align: 'end',
      render: (r) => (
        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
          {canEdit && (
            <IconButton icon="ti ti-edit" label={t('edit')} variant="ghost" size="sm" onClick={() => handleOpenEdit(r)} />
          )}
          {canEdit && (r.isActive ? (
            <IconButton
              icon="ti ti-ban"
              label={t('deactivate')}
              variant="ghost"
              size="sm"
              onClick={() => setConfirmToggle({ region: r, activate: false })}
            />
          ) : (
            <IconButton
              icon="ti ti-check"
              label={t('reactivate')}
              variant="ghost"
              size="sm"
              onClick={() => setConfirmToggle({ region: r, activate: true })}
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
              { label: t('navRegions') },
            ]}
          />
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-strong, #14222F)', margin: '4px 0 0 0', textAlign: 'start' }}>
            {t('orgRegionsTitle')}
          </h1>
        </div>
        {canCreate && (
          <Button variant="primary" iconLeft={<i className="ti ti-plus" aria-hidden="true" />} onClick={handleOpenCreate}>
            {t('new')}
          </Button>
        )}
      </div>

      {/* 2. Filter Bar */}
      <Card variant="flat" padding="md">
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px', minWidth: '200px' }}>
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                applyFilters(e.target.value, entityFilter, statusFilter);
              }}
              iconLeft={<i className="ti ti-search" aria-hidden="true" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
            />
          </div>
          <div style={{ width: '200px' }}>
            <Select
              options={entityOptions}
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                applyFilters(searchText, e.target.value, statusFilter);
              }}
            />
          </div>
          <div style={{ width: '140px' }}>
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => {
                const next = e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE';
                setStatusFilter(next);
                applyFilters(searchText, entityFilter, next);
              }}
            />
          </div>
          {(searchText || entityFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchText('');
                setEntityFilter('ALL');
                setStatusFilter('ALL');
                applyFilters('', 'ALL', 'ALL');
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
        <Table<RegionResponse>
          columns={columns}
          rows={regionList}
          getRowKey={(r) => r.id!}
          isLoading={isListLoading}
          loadError={loadError}
          onRetry={retry}
          emptyIcon="ti ti-map-pin-off"
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
            <Input label={t('code')} value={selectedItem.regionCode ?? ''} disabled helperText={t('readOnlyCodeHint')} />
          )}
          <Input label={`${t('nameEn')} *`} value={nameEn} onChange={(e) => setNameEn(e.target.value)} disabled={!canSaveDrawer} required />
          <Input label={`${t('nameAr')} *`} value={nameAr} onChange={(e) => setNameAr(e.target.value)} disabled={!canSaveDrawer} required />
          <Select
            label={`${t('legalEntity')} *`}
            options={entityOptions.filter((opt) => opt.value !== 'ALL')}
            value={legalEntityFk}
            onChange={(e) => setLegalEntityFk(e.target.value)}
            disabled={!canSaveDrawer || !!selectedItem}
            helperText={selectedItem ? t('readOnlyCodeHint') : undefined}
          />
          <Select
            label={`${t('regionType')} *`}
            options={regionTypeSelectOptions}
            value={regionTypeIdFk}
            onChange={(e) => setRegionTypeIdFk(e.target.value)}
            disabled={!canSaveDrawer || !!selectedItem}
            helperText={selectedItem ? t('readOnlyCodeHint') : undefined}
          />
          <Input label={t('notes')} value={notes} onChange={(e) => setNotes(e.target.value)} disabled={!canSaveDrawer} />
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
