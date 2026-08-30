import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useLocationSitesFacade } from '../api/hooks';
import type { LocationSiteResponse, CreateLocationSiteRequest, UpdateLocationSiteRequest } from '../api/locationSitesApi';
import { mapApiError } from '@/lib/errors/mapApiError';
import { Breadcrumb, Drawer, Alert } from '@/components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '@/components/ui/Button';
import { Card, Badge } from '@/components/ui/DataDisplay';
import { Input, Select } from '@/components/ui/FormControls';
import { Table, type TableColumn } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

export const LocationSitesPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const {
    locationSiteList,
    selectedItem,
    isLoading,
    isListLoading,
    loadError,
    siteTypeIdOptions,
    branchFkOptions,
    page,
    size,
    totalElements,
    canCreate,
    canEdit,
    selectItem,
    setSearchFilters,
    retry,
    createLocationSite,
    updateLocationSite,
    deactivateLocationSite,
    activateLocationSite,
  } = useLocationSitesFacade();

  const canSaveDrawer = selectedItem ? canEdit : canCreate;

  const [searchText, setSearchText] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState<{ item: LocationSiteResponse; activate: boolean } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [branchFk, setBranchFk] = useState('');
  const [siteTypeId, setSiteTypeId] = useState('');
  const [notes, setNotes] = useState('');

  const applyFilters = (text: string, branch: string, status: 'ALL' | 'ACTIVE' | 'INACTIVE') => {
    const filters: { field: string; operator: 'LIKE' | 'EQ'; value: unknown }[] = [];
    if (text) filters.push({ field: 'nameEn', operator: 'LIKE', value: text });
    if (branch !== 'ALL') filters.push({ field: 'branchFk', operator: 'EQ', value: Number(branch) });
    if (status !== 'ALL') filters.push({ field: 'isActiveFl', operator: 'EQ', value: status === 'ACTIVE' });
    setSearchFilters({ filters, page: 0 });
  };

  const handleOpenCreate = () => {
    setNameEn('');
    setNameAr('');
    setBranchFk(branchFkOptions[0]?.id != null ? String(branchFkOptions[0].id) : '');
    setSiteTypeId(siteTypeIdOptions[0]?.code ?? '');
    setNotes('');
    setErrorMessage(null);
    selectItem(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (item: LocationSiteResponse) => {
    setNameEn(item.nameEn ?? '');
    setNameAr(item.nameAr ?? '');
    setBranchFk(item.branchFk != null ? String(item.branchFk) : '');
    setSiteTypeId(item.siteTypeId ?? '');
    setNotes(item.notes ?? '');
    setErrorMessage(null);
    selectItem(item);
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    setErrorMessage(null);
    try {
      if (selectedItem?.id != null) {
        const req: UpdateLocationSiteRequest = { nameEn, nameAr, siteTypeId, notes };
        await updateLocationSite(selectedItem.id, req);
        showToast(t('locationSiteSavedSuccess'), 'success');
      } else {
        const req: CreateLocationSiteRequest = { nameEn, nameAr, branchFk: Number(branchFk), siteTypeId, notes };
        await createLocationSite(req);
        showToast(t('locationSiteCreatedSuccess'), 'success');
      }
      setIsDrawerOpen(false);
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
    }
  };

  const handleConfirmToggle = async () => {
    if (!confirmToggle?.item.id) return;
    try {
      if (confirmToggle.activate) {
        await activateLocationSite(confirmToggle.item.id);
        showToast(t('locationSiteActivatedSuccess'), 'success');
      } else {
        await deactivateLocationSite(confirmToggle.item.id);
        showToast(t('locationSiteDeactivatedSuccess'), 'success');
      }
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
    }
    setConfirmToggle(null);
  };

  const branchOptions = [
    { value: 'ALL', label: t('all') },
    ...branchFkOptions.map((b) => ({ value: String(b.id), label: `${lang === 'ar' ? b.nameAr : b.nameEn} (${b.branchCode})` })),
  ];

  const siteTypeSelectOptions = siteTypeIdOptions.map((opt) => ({
    value: opt.code ?? '',
    label: lang === 'ar' ? (opt.label ?? opt.code ?? '') : (opt.labelEn ?? opt.code ?? ''),
  }));

  const statusOptions = [
    { value: 'ALL', label: t('all') },
    { value: 'ACTIVE', label: t('active') },
    { value: 'INACTIVE', label: t('inactive') },
  ];

  const columns: TableColumn<LocationSiteResponse>[] = [
    { key: 'code', header: t('code'), render: (l) => <Badge variant="neutral" size="sm">{l.locationSiteCode}</Badge> },
    {
      key: 'name',
      header: t('name'),
      render: (l) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-strong, #14222F)', fontSize: '14px' }}>
            {lang === 'ar' ? l.nameAr : l.nameEn}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted, #647488)' }}>
            {lang === 'ar' ? l.nameEn : l.nameAr}
          </div>
        </div>
      ),
    },
    {
      key: 'branch',
      header: t('branch'),
      render: (l) => <span style={{ fontSize: '13px', color: 'var(--text-body, #354456)' }}>{l.branchNameEn ?? '—'}</span>,
    },
    {
      key: 'siteType',
      header: t('siteType'),
      render: (l) => <Badge variant="primary" size="sm">{l.siteTypeId}</Badge>,
    },
    {
      key: 'status',
      header: t('status'),
      render: (l) => (
        <Badge variant={l.isActive ? 'success' : 'danger'} size="sm">
          {l.isActive ? t('active') : t('inactive')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: t('actions'),
      align: 'end',
      render: (l) => (
        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
          {canEdit && (
            <IconButton icon="ti ti-edit" label={t('edit')} variant="ghost" size="sm" onClick={() => handleOpenEdit(l)} />
          )}
          {canEdit && (l.isActive ? (
            <IconButton
              icon="ti ti-ban"
              label={t('deactivate')}
              variant="ghost"
              size="sm"
              onClick={() => setConfirmToggle({ item: l, activate: false })}
            />
          ) : (
            <IconButton
              icon="ti ti-check"
              label={t('reactivate')}
              variant="ghost"
              size="sm"
              onClick={() => setConfirmToggle({ item: l, activate: true })}
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
              { label: t('navLocationSites') },
            ]}
          />
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-strong, #14222F)', margin: '4px 0 0 0', textAlign: 'start' }}>
            {t('orgLocationsTitle')}
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
          <div style={{ flex: '1 1 240px', minWidth: '200px' }}>
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                applyFilters(e.target.value, branchFilter, statusFilter);
              }}
              iconLeft={<i className="ti ti-search" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
            />
          </div>
          <div style={{ width: '200px' }}>
            <Select
              options={branchOptions}
              value={branchFilter}
              onChange={(e) => {
                setBranchFilter(e.target.value);
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
                applyFilters(searchText, branchFilter, next);
              }}
            />
          </div>
          {(searchText || branchFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchText('');
                setBranchFilter('ALL');
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
        <Table<LocationSiteResponse>
          columns={columns}
          rows={locationSiteList}
          getRowKey={(l) => l.id!}
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
            <Input label={t('code')} value={selectedItem.locationSiteCode ?? ''} disabled helperText={t('readOnlyCodeHint')} />
          )}
          <Input label={`${t('nameEn')} *`} value={nameEn} onChange={(e) => setNameEn(e.target.value)} disabled={!canSaveDrawer} required />
          <Input label={`${t('nameAr')} *`} value={nameAr} onChange={(e) => setNameAr(e.target.value)} disabled={!canSaveDrawer} required />
          <Select
            label={`${t('branch')} *`}
            options={branchOptions.filter((opt) => opt.value !== 'ALL')}
            value={branchFk}
            onChange={(e) => setBranchFk(e.target.value)}
            disabled={!canSaveDrawer || !!selectedItem}
            helperText={selectedItem ? t('readOnlyCodeHint') : undefined}
          />
          <Select
            label={`${t('siteType')} *`}
            options={siteTypeSelectOptions}
            value={siteTypeId}
            onChange={(e) => setSiteTypeId(e.target.value)}
            disabled={!canSaveDrawer}
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
