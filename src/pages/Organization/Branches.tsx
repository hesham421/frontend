import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useOrganizationStore } from '../../stores/useOrganizationStore';
import { useNavigationStore } from '../../stores/useNavigationStore';
import { Breadcrumb, Drawer, Dialog, EmptyState, Alert } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Stat, Badge } from '../../components/ui/DataDisplay';
import { Input, Select } from '../../components/ui/FormControls';
import { Branch } from '../../data/mockData';

export const BranchesPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const setCurrentScreen = useNavigationStore((state) => state.setCurrentScreen);

  const {
    branches,
    legalEntities,
    branchSearch,
    branchEntityFilter,
    branchTypeFilter,
    branchStatusFilter,
    selectedBranch,
    isBranchDrawerOpen,
    isConfirmDialogOpen,
    confirmActionType,
    cascadeWarningMessage,
    setBranchSearch,
    setBranchEntityFilter,
    setBranchTypeFilter,
    setBranchStatusFilter,
    setDeptBranchFilter,
    setCostCenterBranchFilter,
    setLocationBranchFilter,
    openBranchDrawer,
    closeBranchDrawer,
    saveBranch,
    openConfirmDialog,
    closeConfirmDialog,
    executeConfirmAction,
  } = useOrganizationStore();

  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [legalEntityFk, setLegalEntityFk] = useState('le-1');
  const [branchTypeId, setBranchTypeId] = useState<Branch['branchTypeId']>('SUB');
  const [notes, setNotes] = useState('');

  const handleOpenCreate = () => {
    setNameEn('');
    setNameAr('');
    setLegalEntityFk(legalEntities[0]?.id || 'le-1');
    setBranchTypeId('SUB');
    setNotes('');
    openBranchDrawer(null);
  };

  const handleOpenEdit = (branch: Branch) => {
    setNameEn(branch.nameEn);
    setNameAr(branch.nameAr);
    setLegalEntityFk(branch.legalEntityFk);
    setBranchTypeId(branch.branchTypeId);
    setNotes(branch.notes || '');
    openBranchDrawer(branch);
  };

  const handleSave = () => {
    saveBranch({
      id: selectedBranch?.id,
      nameEn,
      nameAr,
      legalEntityFk,
      branchTypeId,
      notes,
    });
  };

  const handleDeactivate = (branch: Branch) => {
    openConfirmDialog(
      'DEACTIVATE_BRANCH',
      branch.id,
      t('cascadeBranchWarning')
    );
  };

  const navigateToDepts = (branchId: string) => {
    setDeptBranchFilter(branchId);
    setCurrentScreen('org-departments');
  };

  const navigateToCostCenters = (branchId: string) => {
    setCostCenterBranchFilter(branchId);
    setCurrentScreen('org-cost-centers');
  };

  const navigateToLocations = (branchId: string) => {
    setLocationBranchFilter(branchId);
    setCurrentScreen('org-locations');
  };

  const filteredBranches = branches.filter((b) => {
    const matchesSearch =
      b.branchCode.toLowerCase().includes(branchSearch.toLowerCase()) ||
      b.nameEn.toLowerCase().includes(branchSearch.toLowerCase()) ||
      b.nameAr.includes(branchSearch);

    const matchesEntity = branchEntityFilter === 'ALL' || b.legalEntityFk === branchEntityFilter;
    const matchesType = branchTypeFilter === 'ALL' || b.branchTypeId === branchTypeFilter;
    const matchesStatus =
      branchStatusFilter === 'ALL' ||
      (branchStatusFilter === 'ACTIVE' && b.isActive) ||
      (branchStatusFilter === 'INACTIVE' && !b.isActive);

    return matchesSearch && matchesEntity && matchesType && matchesStatus;
  });

  const total = branches.length;
  const active = branches.filter((b) => b.isActive).length;
  const inactive = total - active;

  const entityOptions = [
    { value: 'ALL', label: t('all') },
    ...legalEntities.map((e) => ({ value: e.id, label: `${e.nameEn} (${e.legalEntityCode})` })),
  ];

  const branchTypeOptions = [
    { value: 'ALL', label: t('all') },
    { value: 'MAIN', label: 'Main (الرئيسي)' },
    { value: 'SUB', label: 'Sub (فرعي)' },
    { value: 'OPERATIONS', label: 'Operations (تشغيلي)' },
    { value: 'ADMIN', label: 'Admin (إداري)' },
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
              { label: t('navBranches') },
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
            {t('orgBranchesTitle')}
          </h1>
        </div>
        <Button variant="primary" iconLeft={<i className="ti ti-plus" />} onClick={handleOpenCreate}>
          {t('new')}
        </Button>
      </div>

      {/* 2. KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <Stat
          label={t('totalBranches')}
          value={total}
          icon={<i className="ti ti-git-branch" style={{ color: 'var(--brand-primary, #2466D8)', fontSize: '20px' }} />}
        />
        <Stat
          label={t('activeRecords')}
          value={active}
          trend={{ value: `${Math.round((active / (total || 1)) * 100)}%`, isPositive: true }}
          icon={<i className="ti ti-check" style={{ color: 'var(--green-500, #1D9A6C)', fontSize: '20px' }} />}
        />
        <Stat
          label={t('inactiveRecords')}
          value={inactive}
          icon={<i className="ti ti-x" style={{ color: 'var(--red-500, #CB3A2D)', fontSize: '20px' }} />}
        />
      </div>

      {/* 3. Filter Bar */}
      <Card variant="flat" padding="md">
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px', minWidth: '200px' }}>
            <Input
              placeholder={t('searchPlaceholder')}
              value={branchSearch}
              onChange={(e) => setBranchSearch(e.target.value)}
              iconLeft={<i className="ti ti-search" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
            />
          </div>
          <div style={{ width: '200px' }}>
            <Select
              options={entityOptions}
              value={branchEntityFilter}
              onChange={(e) => setBranchEntityFilter(e.target.value)}
            />
          </div>
          <div style={{ width: '160px' }}>
            <Select
              options={branchTypeOptions}
              value={branchTypeFilter}
              onChange={(e) => setBranchTypeFilter(e.target.value)}
            />
          </div>
          <div style={{ width: '140px' }}>
            <Select
              options={statusOptions}
              value={branchStatusFilter}
              onChange={(e) => setBranchStatusFilter(e.target.value)}
            />
          </div>
          {(branchSearch || branchEntityFilter !== 'ALL' || branchTypeFilter !== 'ALL' || branchStatusFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setBranchSearch('');
                setBranchEntityFilter('ALL');
                setBranchTypeFilter('ALL');
                setBranchStatusFilter('ALL');
              }}
            >
              {t('clear')}
            </Button>
          )}
        </div>
      </Card>

      {/* 4. Data Grid */}
      <Card variant="flat" padding="none">
        {filteredBranches.length === 0 ? (
          <EmptyState
            icon="ti ti-git-branch-deleted"
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
                    {t('branchType')}
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
                {filteredBranches.map((b) => {
                  const entity = legalEntities.find((e) => e.id === b.legalEntityFk);
                  return (
                    <tr
                      key={b.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle, #E6ECF3)',
                        transition: 'background 120ms ease',
                      }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <Badge variant="neutral" size="sm">
                          {b.branchCode}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-strong, #14222F)', fontSize: '14px' }}>
                          {lang === 'ar' ? b.nameAr : b.nameEn}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted, #647488)' }}>
                          {lang === 'ar' ? b.nameEn : b.nameAr}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: 'var(--text-body, #354456)' }}>
                        {entity ? (lang === 'ar' ? entity.nameAr : entity.nameEn) : '—'}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Badge variant="primary" size="sm">
                          {b.branchTypeId}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Badge variant={b.isActive ? 'success' : 'danger'} size="sm">
                          {b.isActive ? t('active') : t('inactive')}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'end' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigateToDepts(b.id)}
                          >
                            {t('navDepartments')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigateToCostCenters(b.id)}
                          >
                            {t('navCostCenters')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigateToLocations(b.id)}
                          >
                            {t('navLocationSites')}
                          </Button>
                          <IconButton
                            icon="ti ti-edit"
                            label={t('edit')}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(b)}
                          />
                          {b.isActive && (
                            <IconButton
                              icon="ti ti-ban"
                              label={t('deactivate')}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeactivate(b)}
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
        isOpen={isBranchDrawerOpen}
        onClose={closeBranchDrawer}
        title={selectedBranch ? `${t('edit')}: ${selectedBranch.nameEn}` : t('new')}
        width="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={closeBranchDrawer}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {t('save')}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedBranch && (
            <Input
              label={t('code')}
              value={selectedBranch.branchCode}
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
            label={`${t('branchType')} *`}
            options={branchTypeOptions.filter((opt) => opt.value !== 'ALL')}
            value={branchTypeId}
            onChange={(e) => setBranchTypeId(e.target.value as Branch['branchTypeId'])}
          />
          <Input
            label={t('notes')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </Drawer>

      {/* 6. Cascade Dialog */}
      <Dialog
        isOpen={isConfirmDialogOpen && confirmActionType === 'DEACTIVATE_BRANCH'}
        onClose={closeConfirmDialog}
        title={t('confirmActionTitle')}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={closeConfirmDialog}>
              {t('cancel')}
            </Button>
            <Button variant="danger" onClick={executeConfirmAction}>
              {t('deactivate')}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {cascadeWarningMessage && (
            <Alert variant="warning" message={cascadeWarningMessage} />
          )}
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-body, #354456)' }}>
            {t('confirmDeactivate')}
          </p>
        </div>
      </Dialog>
    </div>
  );
};
