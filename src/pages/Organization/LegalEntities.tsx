import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useOrganizationStore } from '../../stores/useOrganizationStore';
import { useNavigationStore } from '../../stores/useNavigationStore';
import { Breadcrumb, Drawer, EmptyState, Alert } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Badge } from '../../components/ui/DataDisplay';
import { Input, Select } from '../../components/ui/FormControls';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { LegalEntity } from '../../data/mockData';

export const LegalEntitiesPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const setCurrentScreen = useNavigationStore((state) => state.setCurrentScreen);

  const {
    legalEntities,
    branches,
    entitySearch,
    entityTypeFilter,
    entityStatusFilter,
    selectedLegalEntity,
    isEntityDrawerOpen,
    isConfirmDialogOpen,
    confirmActionType,
    cascadeWarningMessage,
    setEntitySearch,
    setEntityTypeFilter,
    setEntityStatusFilter,
    setBranchEntityFilter,
    openEntityDrawer,
    closeEntityDrawer,
    saveLegalEntity,
    openConfirmDialog,
    closeConfirmDialog,
    executeConfirmAction,
  } = useOrganizationStore();

  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [entityTypeId, setEntityTypeId] = useState<LegalEntity['entityTypeId']>('HEAD_OFFICE');
  const [notes, setNotes] = useState('');

  const handleOpenCreate = () => {
    setNameEn('');
    setNameAr('');
    setEntityTypeId('HEAD_OFFICE');
    setNotes('');
    openEntityDrawer(null);
  };

  const handleOpenEdit = (entity: LegalEntity) => {
    setNameEn(entity.nameEn);
    setNameAr(entity.nameAr);
    setEntityTypeId(entity.entityTypeId);
    setNotes(entity.notes || '');
    openEntityDrawer(entity);
  };

  const handleSave = () => {
    const isEdit = !!selectedLegalEntity;
    saveLegalEntity({
      id: selectedLegalEntity?.id,
      nameEn,
      nameAr,
      entityTypeId,
      notes,
    });
    showToast(t(isEdit ? 'legalEntitySavedSuccess' : 'legalEntityCreatedSuccess'), 'success');
  };

  const handleConfirmDeactivate = () => {
    executeConfirmAction();
    showToast(t('legalEntityDeactivatedSuccess'), 'success');
  };

  const handleDeactivateRequest = (entity: LegalEntity) => {
    const activeBranchesForEntity = branches.filter((b) => b.legalEntityFk === entity.id && b.isActive);
    if (activeBranchesForEntity.length > 0) {
      openConfirmDialog(
        'DEACTIVATE_ENTITY',
        entity.id,
        `${t('cascadeDeactivateWarning')} (${activeBranchesForEntity.length} ${t('totalBranches')})`
      );
    } else {
      openConfirmDialog('DEACTIVATE_ENTITY', entity.id, null);
    }
  };

  const handleNavigateBranches = (entityId: string) => {
    setBranchEntityFilter(entityId);
    setCurrentScreen('org-branches');
  };

  const filteredEntities = legalEntities.filter((e) => {
    const matchesSearch =
      e.legalEntityCode.toLowerCase().includes(entitySearch.toLowerCase()) ||
      e.nameEn.toLowerCase().includes(entitySearch.toLowerCase()) ||
      e.nameAr.includes(entitySearch);

    const matchesType = entityTypeFilter === 'ALL' || e.entityTypeId === entityTypeFilter;
    const matchesStatus =
      entityStatusFilter === 'ALL' ||
      (entityStatusFilter === 'ACTIVE' && e.isActive) ||
      (entityStatusFilter === 'INACTIVE' && !e.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  const entityTypeOptions = [
    { value: 'ALL', label: t('all') },
    { value: 'HEAD_OFFICE', label: 'Head Office (المقر الرئيسي)' },
    { value: 'BRANCH_OFFICE', label: 'Branch Office (فرع رئيسي)' },
    { value: 'SUBSIDIARY', label: 'Subsidiary (شركة تابعة)' },
    { value: 'REP_OFFICE', label: 'Representative Office (مكتب تمثيل)' },
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
              { label: t('groupOrganization') },
              { label: t('navLegalEntities') },
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
            {t('orgEntitiesTitle')}
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
              value={entitySearch}
              onChange={(e) => setEntitySearch(e.target.value)}
              iconLeft={<i className="ti ti-search" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
            />
          </div>
          <div style={{ width: '220px' }}>
            <Select
              options={entityTypeOptions}
              value={entityTypeFilter}
              onChange={(e) => setEntityTypeFilter(e.target.value)}
            />
          </div>
          <div style={{ width: '150px' }}>
            <Select
              options={statusOptions}
              value={entityStatusFilter}
              onChange={(e) => setEntityStatusFilter(e.target.value)}
            />
          </div>
          {(entitySearch || entityTypeFilter !== 'ALL' || entityStatusFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEntitySearch('');
                setEntityTypeFilter('ALL');
                setEntityStatusFilter('ALL');
              }}
            >
              {t('clear')}
            </Button>
          )}
        </div>
      </Card>

      {/* 4. Data Grid */}
      <Card variant="flat" padding="none">
        {filteredEntities.length === 0 ? (
          <EmptyState
            icon="ti ti-building-off"
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
                    {t('code')}
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'start' }}>
                    {t('name')}
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'start' }}>
                    {t('entityType')}
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
                {filteredEntities.map((e) => (
                  <tr
                    key={e.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle, #E6ECF3)',
                      transition: 'background 120ms ease',
                    }}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <Badge variant="neutral" size="sm">
                        {e.legalEntityCode}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-strong, #14222F)', fontSize: '14px' }}>
                        {lang === 'ar' ? e.nameAr : e.nameEn}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted, #647488)' }}>
                        {lang === 'ar' ? e.nameEn : e.nameAr}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Badge variant="primary" size="sm">
                        {e.entityTypeId}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Badge variant={e.isActive ? 'success' : 'danger'} size="sm">
                        {e.isActive ? t('active') : t('inactive')}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'end' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNavigateBranches(e.id)}
                          iconRight={<i className="ti ti-arrow-right" />}
                        >
                          {t('viewBranches')}
                        </Button>
                        <IconButton
                          icon="ti ti-edit"
                          label={t('edit')}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(e)}
                        />
                        {e.isActive && (
                          <IconButton
                            icon="ti ti-ban"
                            label={t('deactivate')}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivateRequest(e)}
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

      {/* 5. Create / Edit Drawer */}
      <Drawer
        isOpen={isEntityDrawerOpen}
        onClose={closeEntityDrawer}
        title={selectedLegalEntity ? `${t('edit')}: ${lang === 'ar' ? selectedLegalEntity.nameAr : selectedLegalEntity.nameEn}` : t('new')}
        width="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={closeEntityDrawer}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {t('save')}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedLegalEntity && (
            <Input
              label={t('code')}
              value={selectedLegalEntity.legalEntityCode}
              disabled
              helperText={t('readOnlyCodeHint')}
            />
          )}
          <Input
            label={`${t('nameEn')} *`}
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            required
          />
          <Input
            label={`${t('nameAr')} *`}
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            required
          />
          <Select
            label={`${t('entityType')} *`}
            options={entityTypeOptions.filter((opt) => opt.value !== 'ALL')}
            value={entityTypeId}
            onChange={(e) => setEntityTypeId(e.target.value as LegalEntity['entityTypeId'])}
          />
          <Input
            label={t('notes')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </Drawer>

      {/* 6. Cascade-blocked Warning / Deactivation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen && confirmActionType === 'DEACTIVATE_ENTITY'}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirmDeactivate}
        title={t('confirmActionTitle')}
        message={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cascadeWarningMessage && <Alert variant="warning" message={cascadeWarningMessage} />}
            {t('confirmDeactivate')}
          </div>
        }
        confirmLabel={t('deactivate')}
        cancelLabel={t('cancel')}
        tone="danger"
      />
    </div>
  );
};
