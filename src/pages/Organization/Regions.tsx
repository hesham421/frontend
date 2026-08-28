import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useOrganizationStore } from '../../stores/useOrganizationStore';
import { Breadcrumb, Drawer, EmptyState } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Badge } from '../../components/ui/DataDisplay';
import { Input, Select } from '../../components/ui/FormControls';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { Region } from '../../data/mockData';

export const RegionsPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const {
    regions,
    legalEntities,
    regionSearch,
    regionEntityFilter,
    regionTypeFilter,
    regionStatusFilter,
    selectedRegion,
    isRegionDrawerOpen,
    isConfirmDialogOpen,
    confirmActionType,
    setRegionSearch,
    setRegionEntityFilter,
    setRegionTypeFilter,
    setRegionStatusFilter,
    openRegionDrawer,
    closeRegionDrawer,
    saveRegion,
    openConfirmDialog,
    closeConfirmDialog,
    executeConfirmAction,
  } = useOrganizationStore();

  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [legalEntityFk, setLegalEntityFk] = useState('le-1');
  const [regionTypeIdFk, setRegionTypeIdFk] = useState<Region['regionTypeIdFk']>('CENTRAL');
  const [notes, setNotes] = useState('');

  const handleOpenCreate = () => {
    setNameEn('');
    setNameAr('');
    setLegalEntityFk(legalEntities[0]?.id || 'le-1');
    setRegionTypeIdFk('CENTRAL');
    setNotes('');
    openRegionDrawer(null);
  };

  const handleOpenEdit = (region: Region) => {
    setNameEn(region.nameEn);
    setNameAr(region.nameAr);
    setLegalEntityFk(region.legalEntityFk);
    setRegionTypeIdFk(region.regionTypeIdFk);
    setNotes(region.notes || '');
    openRegionDrawer(region);
  };

  const handleSave = () => {
    const isEdit = !!selectedRegion;
    saveRegion({
      id: selectedRegion?.id,
      nameEn,
      nameAr,
      legalEntityFk,
      regionTypeIdFk,
      notes,
    });
    showToast(t(isEdit ? 'regionSavedSuccess' : 'regionCreatedSuccess'), 'success');
  };

  const handleConfirmDeactivate = () => {
    executeConfirmAction();
    showToast(t('regionDeactivatedSuccess'), 'success');
  };

  const filteredRegions = regions.filter((r) => {
    const matchesSearch =
      r.regionCode.toLowerCase().includes(regionSearch.toLowerCase()) ||
      r.nameEn.toLowerCase().includes(regionSearch.toLowerCase()) ||
      r.nameAr.includes(regionSearch);

    const matchesEntity = regionEntityFilter === 'ALL' || r.legalEntityFk === regionEntityFilter;
    const matchesType = regionTypeFilter === 'ALL' || r.regionTypeIdFk === regionTypeFilter;
    const matchesStatus =
      regionStatusFilter === 'ALL' ||
      (regionStatusFilter === 'ACTIVE' && r.isActive) ||
      (regionStatusFilter === 'INACTIVE' && !r.isActive);

    return matchesSearch && matchesEntity && matchesType && matchesStatus;
  });

  const entityOptions = [
    { value: 'ALL', label: t('all') },
    ...legalEntities.map((e) => ({ value: e.id, label: `${e.nameEn} (${e.legalEntityCode})` })),
  ];

  const regionTypeOptions = [
    { value: 'ALL', label: t('all') },
    { value: 'CENTRAL', label: 'Central Region (المنطقة الوسطى)' },
    { value: 'WESTERN', label: 'Western Region (المنطقة الغربية)' },
    { value: 'EASTERN', label: 'Eastern Region (المنطقة الشرقية)' },
    { value: 'SOUTHERN', label: 'Southern Region (المنطقة الجنوبية)' },
    { value: 'NORTHERN', label: 'Northern Region (المنطقة الشمالية)' },
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
              { label: t('navRegions') },
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
            {t('orgRegionsTitle')}
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
              value={regionSearch}
              onChange={(e) => setRegionSearch(e.target.value)}
              iconLeft={<i className="ti ti-search" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
            />
          </div>
          <div style={{ width: '200px' }}>
            <Select
              options={entityOptions}
              value={regionEntityFilter}
              onChange={(e) => setRegionEntityFilter(e.target.value)}
            />
          </div>
          <div style={{ width: '220px' }}>
            <Select
              options={regionTypeOptions}
              value={regionTypeFilter}
              onChange={(e) => setRegionTypeFilter(e.target.value)}
            />
          </div>
          <div style={{ width: '140px' }}>
            <Select
              options={statusOptions}
              value={regionStatusFilter}
              onChange={(e) => setRegionStatusFilter(e.target.value)}
            />
          </div>
          {(regionSearch || regionEntityFilter !== 'ALL' || regionTypeFilter !== 'ALL' || regionStatusFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRegionSearch('');
                setRegionEntityFilter('ALL');
                setRegionTypeFilter('ALL');
                setRegionStatusFilter('ALL');
              }}
            >
              {t('clear')}
            </Button>
          )}
        </div>
      </Card>

      {/* 4. Data Grid */}
      <Card variant="flat" padding="none">
        {filteredRegions.length === 0 ? (
          <EmptyState
            icon="ti ti-map-pin-off"
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
                    {t('regionType')}
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
                {filteredRegions.map((r) => {
                  const entity = legalEntities.find((e) => e.id === r.legalEntityFk);
                  return (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle, #E6ECF3)',
                        transition: 'background 120ms ease',
                      }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <Badge variant="neutral" size="sm">
                          {r.regionCode}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-strong, #14222F)', fontSize: '14px' }}>
                          {lang === 'ar' ? r.nameAr : r.nameEn}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted, #647488)' }}>
                          {lang === 'ar' ? r.nameEn : r.nameAr}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: 'var(--text-body, #354456)' }}>
                        {entity ? (lang === 'ar' ? entity.nameAr : entity.nameEn) : '—'}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Badge variant="primary" size="sm">
                          {r.regionTypeIdFk}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Badge variant={r.isActive ? 'success' : 'danger'} size="sm">
                          {r.isActive ? t('active') : t('inactive')}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'end' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          <IconButton
                            icon="ti ti-edit"
                            label={t('edit')}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(r)}
                          />
                          {r.isActive && (
                            <IconButton
                              icon="ti ti-ban"
                              label={t('deactivate')}
                              variant="ghost"
                              size="sm"
                              onClick={() => openConfirmDialog('DEACTIVATE_REGION', r.id)}
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

      {/* 5. Drawer */}
      <Drawer
        isOpen={isRegionDrawerOpen}
        onClose={closeRegionDrawer}
        title={selectedRegion ? `${t('edit')}: ${selectedRegion.nameEn}` : t('new')}
        width="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={closeRegionDrawer}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {t('save')}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedRegion && (
            <Input
              label={t('code')}
              value={selectedRegion.regionCode}
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
          <Select
            label={`${t('regionType')} *`}
            options={regionTypeOptions.filter((opt) => opt.value !== 'ALL')}
            value={regionTypeIdFk}
            onChange={(e) => setRegionTypeIdFk(e.target.value as Region['regionTypeIdFk'])}
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
        isOpen={isConfirmDialogOpen && confirmActionType === 'DEACTIVATE_REGION'}
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
