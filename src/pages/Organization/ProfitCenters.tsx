import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useOrganizationStore } from '../../stores/useOrganizationStore';
import { Breadcrumb, Drawer, EmptyState } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Badge } from '../../components/ui/DataDisplay';
import { Input, Select } from '../../components/ui/FormControls';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { ProfitCenter } from '../../data/mockData';

export const ProfitCentersPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const {
    profitCenters,
    legalEntities,
    profitSearch,
    profitEntityFilter,
    profitStatusFilter,
    selectedProfitCenter,
    isProfitDrawerOpen,
    isConfirmDialogOpen,
    confirmActionType,
    setProfitSearch,
    setProfitEntityFilter,
    setProfitStatusFilter,
    openProfitDrawer,
    closeProfitDrawer,
    saveProfitCenter,
    openConfirmDialog,
    closeConfirmDialog,
    executeConfirmAction,
  } = useOrganizationStore();

  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [legalEntityFk, setLegalEntityFk] = useState('le-1');
  const [notes, setNotes] = useState('');

  const handleOpenCreate = () => {
    setNameEn('');
    setNameAr('');
    setLegalEntityFk(legalEntities[0]?.id || 'le-1');
    setNotes('');
    openProfitDrawer(null);
  };

  const handleOpenEdit = (profit: ProfitCenter) => {
    setNameEn(profit.nameEn);
    setNameAr(profit.nameAr);
    setLegalEntityFk(profit.legalEntityFk);
    setNotes(profit.notes || '');
    openProfitDrawer(profit);
  };

  const handleSave = () => {
    const isEdit = !!selectedProfitCenter;
    saveProfitCenter({
      id: selectedProfitCenter?.id,
      nameEn,
      nameAr,
      legalEntityFk,
      notes,
    });
    showToast(t(isEdit ? 'profitCenterSavedSuccess' : 'profitCenterCreatedSuccess'), 'success');
  };

  const handleConfirmDeactivate = () => {
    executeConfirmAction();
    showToast(t('profitCenterDeactivatedSuccess'), 'success');
  };

  const filteredProfitCenters = profitCenters.filter((p) => {
    const matchesSearch =
      p.profitCenterCode.toLowerCase().includes(profitSearch.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(profitSearch.toLowerCase()) ||
      p.nameAr.includes(profitSearch);

    const matchesEntity = profitEntityFilter === 'ALL' || p.legalEntityFk === profitEntityFilter;
    const matchesStatus =
      profitStatusFilter === 'ALL' ||
      (profitStatusFilter === 'ACTIVE' && p.isActive) ||
      (profitStatusFilter === 'INACTIVE' && !p.isActive);

    return matchesSearch && matchesEntity && matchesStatus;
  });

  const entityOptions = [
    { value: 'ALL', label: t('all') },
    ...legalEntities.map((e) => ({ value: e.id, label: `${e.nameEn} (${e.legalEntityCode})` })),
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
              { label: t('navProfitCenters') },
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
            {t('orgProfitCentersTitle')}
          </h1>
        </div>
        <Button variant="primary" iconLeft={<i className="ti ti-plus" />} onClick={handleOpenCreate}>
          {t('new')}
        </Button>
      </div>

      {/* 2. Filter Bar */}
      <Card variant="flat" padding="md">
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px', minWidth: '200px' }}>
            <Input
              placeholder={t('searchPlaceholder')}
              value={profitSearch}
              onChange={(e) => setProfitSearch(e.target.value)}
              iconLeft={<i className="ti ti-search" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
            />
          </div>
          <div style={{ width: '200px' }}>
            <Select
              options={entityOptions}
              value={profitEntityFilter}
              onChange={(e) => setProfitEntityFilter(e.target.value)}
            />
          </div>
          <div style={{ width: '140px' }}>
            <Select
              options={statusOptions}
              value={profitStatusFilter}
              onChange={(e) => setProfitStatusFilter(e.target.value)}
            />
          </div>
          {(profitSearch || profitEntityFilter !== 'ALL' || profitStatusFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setProfitSearch('');
                setProfitEntityFilter('ALL');
                setProfitStatusFilter('ALL');
              }}
            >
              {t('clear')}
            </Button>
          )}
        </div>
      </Card>

      {/* 4. Data Grid */}
      <Card variant="flat" padding="none">
        {filteredProfitCenters.length === 0 ? (
          <EmptyState
            icon="ti ti-chart-arrows"
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
                    {t('legalEntity')}
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
                {filteredProfitCenters.map((p) => {
                  const entity = legalEntities.find((e) => e.id === p.legalEntityFk);
                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle, #E6ECF3)',
                        transition: 'background 120ms ease',
                      }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <Badge variant="neutral" size="sm">
                          {p.profitCenterCode}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-strong, #14222F)', fontSize: '14px' }}>
                          {lang === 'ar' ? p.nameAr : p.nameEn}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted, #647488)' }}>
                          {lang === 'ar' ? p.nameEn : p.nameAr}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: 'var(--text-body, #354456)' }}>
                        {entity ? (lang === 'ar' ? entity.nameAr : entity.nameEn) : '—'}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Badge variant={p.isActive ? 'success' : 'danger'} size="sm">
                          {p.isActive ? t('active') : t('inactive')}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'end' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          <IconButton
                            icon="ti ti-edit"
                            label={t('edit')}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(p)}
                          />
                          {p.isActive && (
                            <IconButton
                              icon="ti ti-ban"
                              label={t('deactivate')}
                              variant="ghost"
                              size="sm"
                              onClick={() => openConfirmDialog('DEACTIVATE_PROFIT', p.id)}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 5. Create / Edit Drawer */}
      <Drawer
        isOpen={isProfitDrawerOpen}
        onClose={closeProfitDrawer}
        title={selectedProfitCenter ? `${t('edit')}: ${selectedProfitCenter.nameEn}` : t('new')}
        width="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={closeProfitDrawer}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {t('save')}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedProfitCenter && (
            <Input
              label={t('code')}
              value={selectedProfitCenter.profitCenterCode}
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
            label={`${t('legalEntity')} *`}
            options={entityOptions.filter((opt) => opt.value !== 'ALL')}
            value={legalEntityFk}
            onChange={(e) => setLegalEntityFk(e.target.value)}
          />
          <Input
            label={t('notes')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </Drawer>

      {/* 6. Deactivation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen && confirmActionType === 'DEACTIVATE_PROFIT'}
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
