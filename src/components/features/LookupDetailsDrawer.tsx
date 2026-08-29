import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import type { MasterLookupDto, LookupDetailDto } from '../../masterLookups/masterLookupsApi';
import { useLookupDetailManagementFacade, useLookupDetailUsage } from '../../masterLookups/hooks';
import { createLookupDetailSchema, updateLookupDetailSchema } from '../../masterLookups/masterLookups.schema';
import { mapApiError } from '../../lib/errors/mapApiError';
import { Drawer, Dialog, Alert, EmptyState } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/FormControls';
import { Table, type TableColumn } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Badge } from '../../components/ui/DataDisplay';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';

export interface LookupDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  masterLookup: MasterLookupDto | null;
}

/**
 * Lookup values (child) management as its own side drawer, opened from the
 * Master Lookup edit drawer — same layering pattern as PermissionMatrixDrawer
 * opened from RolesPage's edit drawer (src/pages/Security/Roles.tsx).
 */
export const LookupDetailsDrawer: React.FC<LookupDetailsDrawerProps> = ({ isOpen, onClose, masterLookup }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const masterLookupId = masterLookup?.id;
  const {
    detailList,
    selectedDetail,
    canCreate,
    canEdit,
    canDelete,
    isLoading,
    isListLoading,
    loadError,
    statusFilter,
    page,
    size,
    totalElements,
    selectDetail,
    setSearchFilters,
    setPage,
    setStatusFilter,
    retry,
    createDetail,
    updateDetail,
    deleteDetail,
    toggleDetailActive,
  } = useLookupDetailManagementFacade(masterLookupId);

  const [searchText, setSearchText] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState<{ detail: LookupDetailDto; activate: boolean } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<LookupDetailDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [extraValue, setExtraValue] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  // Reset the sub-screen whenever a different master lookup is opened.
  useEffect(() => {
    setSearchText('');
    selectDetail(null);
    setIsFormOpen(false);
  }, [masterLookupId]);

  const deleteUsage = useLookupDetailUsage(confirmDelete?.id, confirmDelete != null);

  const applySearch = (text: string) => {
    setSearchFilters({ filters: text ? [{ field: 'code', operator: 'LIKE', value: text }] : [], page: 0 });
  };

  const handleOpenCreate = () => {
    setCode('');
    setNameAr('');
    setNameEn('');
    setExtraValue('');
    setSortOrder('');
    setErrorMessage(null);
    selectDetail(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (detail: LookupDetailDto) => {
    setCode(detail.code || '');
    setNameAr(detail.nameAr || '');
    setNameEn(detail.nameEn || '');
    setExtraValue(detail.extraValue || '');
    setSortOrder(detail.sortOrder != null ? String(detail.sortOrder) : '');
    setErrorMessage(null);
    selectDetail(detail);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    setErrorMessage(null);
    const parsedSortOrder = sortOrder.trim() === '' ? undefined : Number(sortOrder);
    try {
      if (selectedDetail?.id != null) {
        const parsed = updateLookupDetailSchema.safeParse({
          nameAr,
          nameEn: nameEn || undefined,
          extraValue: extraValue || undefined,
          sortOrder: parsedSortOrder,
        });
        if (!parsed.success) {
          setErrorMessage(parsed.error.issues[0]?.message ?? 'Invalid input');
          return;
        }
        await updateDetail(selectedDetail.id, parsed.data);
        showToast(t('lookupDetailSavedSuccess'), 'success');
      } else {
        if (masterLookupId == null) return;
        const parsed = createLookupDetailSchema.safeParse({
          masterLookupId,
          code,
          nameAr,
          nameEn: nameEn || undefined,
          extraValue: extraValue || undefined,
          sortOrder: parsedSortOrder,
        });
        if (!parsed.success) {
          setErrorMessage(parsed.error.issues[0]?.message ?? 'Invalid input');
          return;
        }
        await createDetail(parsed.data);
        showToast(t('lookupDetailCreatedSuccess'), 'success');
      }
      setIsFormOpen(false);
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
    }
  };

  const handleConfirmToggle = async () => {
    if (!confirmToggle?.detail.id) return;
    try {
      await toggleDetailActive(confirmToggle.detail.id, confirmToggle.activate);
      showToast(
        confirmToggle.activate ? t('lookupDetailActivatedSuccess') : t('lookupDetailDeactivatedSuccess'),
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
      await deleteDetail(confirmDelete.id);
      showToast(t('lookupDetailDeletedSuccess'), 'success');
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

  const columns: TableColumn<LookupDetailDto>[] = [
    { key: 'code', header: t('code'), width: '110px', render: (d) => <Badge variant="neutral" size="sm">{d.code}</Badge> },
    {
      key: 'nameAr',
      header: t('nameAr'),
      render: (d) => <span style={{ fontWeight: 600, color: 'var(--text-strong, #14222F)', fontSize: '14px' }}>{d.nameAr}</span>,
    },
    { key: 'nameEn', header: t('nameEn'), render: (d) => <span style={{ fontSize: '13px', color: 'var(--text-muted, #647488)' }}>{d.nameEn}</span> },
    { key: 'sortOrder', header: t('sortOrder'), align: 'center', width: '90px', render: (d) => d.sortOrder ?? '—' },
    {
      key: 'status',
      header: t('status'),
      width: '110px',
      render: (d) => (
        <Badge variant={d.isActive ? 'success' : 'danger'} size="sm">
          {d.isActive ? t('active') : t('inactive')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: t('actions'),
      align: 'end',
      render: (d) => (
        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
          {canEdit && (
            <IconButton icon="ti ti-edit" label={t('edit')} variant="ghost" size="sm" onClick={() => handleOpenEdit(d)} />
          )}
          {canEdit && (
            <IconButton
              icon={d.isActive ? 'ti ti-toggle-right' : 'ti ti-toggle-left'}
              label={d.isActive ? t('deactivate') : t('reactivate')}
              variant="ghost"
              size="sm"
              onClick={() => setConfirmToggle({ detail: d, activate: !d.isActive })}
            />
          )}
          {canDelete && (
            <IconButton icon="ti ti-trash" label={t('delete')} variant="ghost" size="sm" onClick={() => setConfirmDelete(d)} />
          )}
        </div>
      ),
    },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={t('lookupDetails')}
      subtitle={masterLookup ? `${masterLookup.lookupName} (${masterLookup.lookupKey})` : undefined}
      width="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={onClose}>
            {t('close')}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: '1 1 320px' }}>
            <div style={{ flex: '1 1 200px' }}>
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  applySearch(e.target.value);
                }}
                iconLeft={<i className="ti ti-search" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
              />
            </div>
            <div style={{ width: '150px' }}>
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
              />
            </div>
          </div>
          {canCreate && (
            <Button variant="primary" size="sm" iconLeft={<i className="ti ti-plus" />} onClick={handleOpenCreate}>
              {t('new')}
            </Button>
          )}
        </div>

        {errorMessage && <Alert variant="danger" message={errorMessage} />}

        {masterLookupId == null ? (
          <EmptyState icon="ti ti-list" title={t('noRecordsFound')} description={t('noRecordsDesc')} />
        ) : (
          <div style={{ border: '1px solid var(--border-subtle, #E6ECF3)', borderRadius: 'var(--radius-md, 7px)', overflow: 'hidden' }}>
            <Table<LookupDetailDto>
              columns={columns}
              rows={detailList}
              getRowKey={(d) => d.id!}
              isLoading={isListLoading}
              loadError={loadError}
              onRetry={retry}
              emptyIcon="ti ti-list"
              emptyTitle={t('noRecordsFound')}
              emptyDescription={t('noRecordsDesc')}
              emptyAction={canCreate ? { label: t('new'), onClick: handleOpenCreate } : undefined}
            />
            {!loadError && <Pagination page={page} size={size} totalElements={totalElements} onPageChange={setPage} />}
          </div>
        )}
      </div>

      {/* Add/Edit Lookup Value */}
      <Dialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedDetail ? `${t('edit')}: ${selectedDetail.code}` : t('new')}
        size="sm"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={() => setIsFormOpen(false)}>
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
            label={t('code')}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={!!selectedDetail}
            helperText={selectedDetail ? t('readOnlyCodeHint') : undefined}
            required
          />
          <Input label={t('nameAr')} value={nameAr} onChange={(e) => setNameAr(e.target.value)} required />
          <Input label={t('nameEn')} value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
          <Input label={t('extraValue')} value={extraValue} onChange={(e) => setExtraValue(e.target.value)} />
          <Input
            label={t('sortOrder')}
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </div>
      </Dialog>

      <ConfirmDialog
        isOpen={confirmToggle != null}
        onClose={() => setConfirmToggle(null)}
        onConfirm={handleConfirmToggle}
        title={t('confirmActionTitle')}
        message={`${confirmToggle?.activate ? t('confirmReactivate') : t('confirmDeactivate')} "${confirmToggle?.detail.nameAr}"?`}
        confirmLabel={t('confirm')}
        cancelLabel={t('cancel')}
        tone={confirmToggle?.activate ? 'primary' : 'danger'}
      />

      <ConfirmDialog
        isOpen={confirmDelete != null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleConfirmDelete}
        title={t('confirmActionTitle')}
        message={
          deleteUsage.data && deleteUsage.data.canBeDeleted === false
            ? deleteUsage.data.reason || t('cannotDeleteInUse')
            : `${t('delete')} "${confirmDelete?.nameAr}"?`
        }
        confirmLabel={t('confirm')}
        cancelLabel={t('cancel')}
        tone="danger"
        loading={deleteUsage.isLoading}
      />
    </Drawer>
  );
};
