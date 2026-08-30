import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useMasterLookupManagementFacade, useMasterLookupUsage } from '../../masterLookups/hooks';
import { createMasterLookupSchema } from '../../masterLookups/masterLookups.schema';
import type { MasterLookupDto } from '../../masterLookups/masterLookupsApi';
import { mapApiError } from '../../lib/errors/mapApiError';
import { Breadcrumb, Drawer, Alert } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Badge } from '../../components/ui/DataDisplay';
import { Input, Select } from '../../components/ui/FormControls';
import { Table, type TableColumn } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { LookupDetailsDrawer } from '../../components/features/LookupDetailsDrawer';

export const MasterLookupsPage: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const {
    lookupList,
    selectedLookup,
    canCreate,
    canEdit,
    canDelete,
    isLoading,
    isListLoading,
    loadError,
    page,
    size,
    totalElements,
    statusFilter,
    selectLookup,
    setSearchFilters,
    setPage,
    setStatusFilter,
    retry,
    createLookup,
    updateLookup,
    deleteLookup,
    toggleLookupActive,
  } = useMasterLookupManagementFacade();

  const [searchText, setSearchText] = useState('');
  const [isLookupDrawerOpen, setIsLookupDrawerOpen] = useState(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState<{ lookup: MasterLookupDto; activate: boolean } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MasterLookupDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [lookupKey, setLookupKey] = useState('');
  const [lookupName, setLookupName] = useState('');
  const [lookupNameEn, setLookupNameEn] = useState('');
  const [description, setDescription] = useState('');

  const canSaveLookupDrawer = selectedLookup ? canEdit : canCreate;
  const deleteUsage = useMasterLookupUsage(confirmDelete?.id, confirmDelete != null);
  const deactivateUsage = useMasterLookupUsage(
    confirmToggle && !confirmToggle.activate ? confirmToggle.lookup.id : undefined,
    confirmToggle != null && !confirmToggle.activate,
  );

  const applySearch = (text: string) => {
    setSearchFilters({
      filters: text ? [{ field: 'lookupName', operator: 'LIKE', value: text }] : [],
      page: 0,
    });
  };

  const handleOpenCreate = () => {
    setLookupKey('');
    setLookupName('');
    setLookupNameEn('');
    setDescription('');
    setErrorMessage(null);
    selectLookup(null);
    setIsLookupDrawerOpen(true);
  };

  const handleOpenEdit = (lookup: MasterLookupDto) => {
    setLookupKey(lookup.lookupKey || '');
    setLookupName(lookup.lookupName || '');
    setLookupNameEn(lookup.lookupNameEn || '');
    setDescription(lookup.description || '');
    setErrorMessage(null);
    selectLookup(lookup);
    setIsLookupDrawerOpen(true);
  };

  const handleSave = async () => {
    setErrorMessage(null);
    try {
      if (selectedLookup?.id != null) {
        await updateLookup(selectedLookup.id, {
          lookupName,
          lookupNameEn: lookupNameEn || undefined,
          description: description || undefined,
        });
        showToast(t('masterLookupSavedSuccess'), 'success');
      } else {
        const parsed = createMasterLookupSchema.safeParse({
          lookupKey,
          lookupName,
          lookupNameEn: lookupNameEn || undefined,
          description: description || undefined,
          isActive: true,
        });
        if (!parsed.success) {
          setErrorMessage(parsed.error.issues[0]?.message ?? 'Invalid input');
          return;
        }
        await createLookup(parsed.data);
        showToast(t('masterLookupCreatedSuccess'), 'success');
      }
      setIsLookupDrawerOpen(false);
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
    }
  };

  const handleConfirmToggle = async () => {
    if (!confirmToggle?.lookup.id) return;
    try {
      await toggleLookupActive(confirmToggle.lookup.id, confirmToggle.activate);
      showToast(
        confirmToggle.activate ? t('masterLookupActivatedSuccess') : t('masterLookupDeactivatedSuccess'),
        'success',
      );
    } catch (err) {
      showToast(mapApiError(err, t), 'danger');
    }
    setConfirmToggle(null);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete?.id) return;
    try {
      await deleteLookup(confirmDelete.id);
      showToast(t('masterLookupDeletedSuccess'), 'success');
    } catch (err) {
      showToast(mapApiError(err, t), 'danger');
    }
    setConfirmDelete(null);
  };

  const statusOptions = [
    { value: 'ALL', label: t('all') },
    { value: 'ACTIVE', label: t('active') },
    { value: 'INACTIVE', label: t('inactive') },
  ];

  const columns: TableColumn<MasterLookupDto>[] = [
    { key: 'key', header: t('code'), width: '140px', render: (l) => <Badge variant="neutral" size="sm">{l.lookupKey}</Badge> },
    {
      key: 'name',
      header: t('nameAr'),
      render: (l) => <span style={{ fontWeight: 600, color: 'var(--text-strong, #14222F)', fontSize: '14px' }}>{l.lookupName}</span>,
    },
    { key: 'nameEn', header: t('nameEn'), render: (l) => <span style={{ fontSize: '13px', color: 'var(--text-muted, #647488)' }}>{l.lookupNameEn}</span> },
    {
      key: 'description',
      header: t('description'),
      render: (l) => <span style={{ fontSize: '13px', color: 'var(--text-muted, #647488)' }}>{l.description}</span>,
    },
    {
      key: 'detailCount',
      header: t('detailsCount'),
      align: 'center',
      width: '110px',
      render: (l) => (
        <button
          type="button"
          onClick={() => {
            selectLookup(l);
            setIsDetailsDrawerOpen(true);
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--brand-primary, #2466D8)',
            fontWeight: 600,
            fontSize: '13px',
            textDecoration: 'underline',
          }}
        >
          {l.detailCount ?? 0}
        </button>
      ),
    },
    {
      key: 'status',
      header: t('status'),
      width: '110px',
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
          <IconButton
            icon="ti ti-list"
            label={t('manageValues')}
            variant="ghost"
            size="sm"
            onClick={() => {
              selectLookup(l);
              setIsDetailsDrawerOpen(true);
            }}
          />
          {canEdit && (
            <IconButton icon="ti ti-edit" label={t('edit')} variant="ghost" size="sm" onClick={() => handleOpenEdit(l)} />
          )}
          {l.isActive ? (
            canEdit && (
              <Button variant="secondary" size="sm" onClick={() => setConfirmToggle({ lookup: l, activate: false })}>
                {t('deactivate')}
              </Button>
            )
          ) : (
            canEdit && (
              <Button variant="primary" size="sm" onClick={() => setConfirmToggle({ lookup: l, activate: true })}>
                {t('reactivate')}
              </Button>
            )
          )}
          {canDelete && (
            <IconButton icon="ti ti-trash" label={t('delete')} variant="ghost" size="sm" onClick={() => setConfirmDelete(l)} />
          )}
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
            items={[{ label: t('navOverview') }, { label: t('groupMasterData') }, { label: t('navMasterLookups') }]}
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
            {t('mdMasterLookupsTitle')}
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
          <div style={{ flex: '1 1 280px', minWidth: '220px' }}>
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                applySearch(e.target.value);
              }}
              iconLeft={<i className="ti ti-search" aria-hidden="true" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
            />
          </div>
          <div style={{ width: '180px' }}>
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
            />
          </div>
          {(searchText || statusFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchText('');
                setStatusFilter('ALL');
                applySearch('');
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
        <Table<MasterLookupDto>
          columns={columns}
          rows={lookupList}
          getRowKey={(l) => l.id!}
          isLoading={isListLoading}
          loadError={loadError}
          onRetry={retry}
          emptyIcon="ti ti-list-details"
          emptyTitle={t('noRecordsFound')}
          emptyDescription={t('noRecordsDesc')}
          emptyAction={canCreate ? { label: t('new'), onClick: handleOpenCreate } : undefined}
        />
        {!loadError && <Pagination page={page} size={size} totalElements={totalElements} onPageChange={setPage} />}
      </Card>

      {/* 4. Master Lookup Drawer */}
      <Drawer
        isOpen={isLookupDrawerOpen}
        onClose={() => setIsLookupDrawerOpen(false)}
        title={selectedLookup ? `${t('edit')}: ${selectedLookup.lookupName}` : t('new')}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div>
              {selectedLookup && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsDetailsDrawerOpen(true)}
                  iconLeft={<i className="ti ti-list" aria-hidden="true" />}
                >
                  {t('manageValues')} →
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="secondary" onClick={() => setIsLookupDrawerOpen(false)}>
                {t('cancel')}
              </Button>
              {canSaveLookupDrawer && (
                <Button variant="primary" onClick={handleSave} loading={isLoading}>
                  {t('save')}
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label={t('lookupKey')}
            value={lookupKey}
            onChange={(e) => setLookupKey(e.target.value.toUpperCase())}
            disabled={!!selectedLookup || !canSaveLookupDrawer}
            helperText={selectedLookup ? t('readOnlyCodeHint') : 'e.g. COLOR, UOM, COUNTRY'}
            required
          />
          <Input
            label={t('nameAr')}
            value={lookupName}
            onChange={(e) => setLookupName(e.target.value)}
            disabled={!canSaveLookupDrawer}
            required
          />
          <Input
            label={t('nameEn')}
            value={lookupNameEn}
            onChange={(e) => setLookupNameEn(e.target.value)}
            disabled={!canSaveLookupDrawer}
          />
          <Input
            label={t('description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!canSaveLookupDrawer}
          />
        </div>
      </Drawer>

      {/* 5. Lookup Values Drawer */}
      <LookupDetailsDrawer
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        masterLookup={selectedLookup}
      />

      {/* 6. Confirm Dialogs */}
      <ConfirmDialog
        isOpen={confirmToggle != null}
        onClose={() => setConfirmToggle(null)}
        onConfirm={handleConfirmToggle}
        title={t('confirmActionTitle')}
        message={
          confirmToggle && !confirmToggle.activate && deactivateUsage.data?.canDeactivate === false
            ? t('cascadeDeactivateWarning')
            : `${confirmToggle?.activate ? t('confirmReactivate') : t('confirmDeactivate')} "${confirmToggle?.lookup.lookupName}"?`
        }
        confirmLabel={t('confirm')}
        cancelLabel={t('cancel')}
        tone={confirmToggle?.activate ? 'primary' : 'danger'}
        loading={deactivateUsage.isLoading}
      />

      <ConfirmDialog
        isOpen={confirmDelete != null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleConfirmDelete}
        title={t('confirmActionTitle')}
        message={
          deleteUsage.data && deleteUsage.data.canDelete === false
            ? t('cannotDeleteInUse')
            : `${t('delete')} "${confirmDelete?.lookupName}"?`
        }
        confirmLabel={t('confirm')}
        cancelLabel={t('cancel')}
        tone="danger"
        loading={deleteUsage.isLoading}
      />
    </div>
  );
};
