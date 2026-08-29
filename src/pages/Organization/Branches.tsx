import React from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '../../context/LanguageContext';
import { useOrganizationStore } from '../../stores/useOrganizationStore';
import { useNavigationStore } from '../../stores/useNavigationStore';
import { usePermission } from '../../auth/permissions';
import { Breadcrumb, Drawer, EmptyState, Alert } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Badge } from '../../components/ui/DataDisplay';
import { Input, Select } from '../../components/ui/FormControls';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { Branch } from '../../data/mockData';
import { createBranchSchema, updateBranchSchema } from '../../branches/branches.schema';

// legalEntityFk is z.number() in createBranchSchema (real API contract), but
// this page's mock store and its <Select> both deal in string ids — override
// just that field for this mock-store-bound form (branches.schema.ts itself
// is out of scope, it correctly describes the real API).
const branchFormSchema = createBranchSchema.extend({
  legalEntityFk: z.string().min(1, 'Legal entity is required.'),
});
type BranchFormValues = z.infer<typeof branchFormSchema>;

export const BranchesPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
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

  const { can } = usePermission();
  const canCreate = can('PERM_BRANCH_CREATE');
  const canEdit = can('PERM_BRANCH_UPDATE');
  // Editing an existing branch needs UPDATE; the create-drawer branch needs CREATE.
  const canSaveDrawer = selectedBranch ? canEdit : canCreate;

  const isEditMode = !!selectedBranch;
  const form = useForm<BranchFormValues>({
    resolver: zodResolver(isEditMode ? updateBranchSchema : branchFormSchema) as unknown as Resolver<BranchFormValues>,
    defaultValues: {
      nameEn: '',
      nameAr: '',
      legalEntityFk: legalEntities[0]?.id || 'le-1',
      branchTypeId: 'SUB_BRANCH',
      notes: '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const handleOpenCreate = () => {
    form.reset({
      nameEn: '',
      nameAr: '',
      legalEntityFk: legalEntities[0]?.id || 'le-1',
      branchTypeId: 'SUB_BRANCH',
      notes: '',
    });
    openBranchDrawer(null);
  };

  const handleOpenEdit = (branch: Branch) => {
    form.reset({
      nameEn: branch.nameEn,
      nameAr: branch.nameAr,
      legalEntityFk: branch.legalEntityFk,
      branchTypeId: branch.branchTypeId,
      notes: branch.notes || '',
    });
    openBranchDrawer(branch);
  };

  const onValid = (values: BranchFormValues) => {
    if (!canSaveDrawer) return;
    const isEdit = !!selectedBranch;
    saveBranch({
      id: selectedBranch?.id,
      ...values,
      branchTypeId: values.branchTypeId as Branch['branchTypeId'],
    });
    showToast(t(isEdit ? 'branchSavedSuccess' : 'branchCreatedSuccess'), 'success');
  };

  const handleConfirmDeactivate = () => {
    if (!canEdit) return;
    executeConfirmAction();
    showToast(t('branchDeactivatedSuccess'), 'success');
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

  const entityOptions = [
    { value: 'ALL', label: t('all') },
    ...legalEntities.map((e) => ({ value: e.id, label: `${lang === 'ar' ? e.nameAr : e.nameEn} (${e.legalEntityCode})` })),
  ];

  const branchTypeOptions = [
    { value: 'ALL', label: t('all') },
    { value: 'MAIN_BRANCH', label: 'Main (الرئيسي)' },
    { value: 'SUB_BRANCH', label: 'Sub (فرعي)' },
    { value: 'OPERATIONS_BRANCH', label: 'Operations (تشغيلي)' },
    { value: 'ADMIN_BRANCH', label: 'Admin (إداري)' },
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
            action={canCreate ? { label: t('new'), onClick: handleOpenCreate } : undefined}
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
                          {canEdit && (
                            <IconButton
                              icon="ti ti-edit"
                              label={t('edit')}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(b)}
                            />
                          )}
                          {b.isActive && canEdit && (
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
      <form onSubmit={form.handleSubmit(onValid)} noValidate>
        <Drawer
          isOpen={isBranchDrawerOpen}
          onClose={closeBranchDrawer}
          title={selectedBranch ? `${t('edit')}: ${lang === 'ar' ? selectedBranch.nameAr : selectedBranch.nameEn}` : t('new')}
          width="md"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button type="button" variant="secondary" onClick={closeBranchDrawer}>
                {t('cancel')}
              </Button>
              {canSaveDrawer && (
                <Button type="submit" variant="primary" loading={form.formState.isSubmitting}>
                  {t('save')}
                </Button>
              )}
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
            <Controller
              control={form.control}
              name="nameEn"
              render={({ field, fieldState }) => (
                <Input
                  label={`${t('nameEn')} *`}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  error={fieldState.error?.message}
                  disabled={!canSaveDrawer}
                  required
                />
              )}
            />
            <Controller
              control={form.control}
              name="nameAr"
              render={({ field, fieldState }) => (
                <Input
                  label={`${t('nameAr')} *`}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  error={fieldState.error?.message}
                  disabled={!canSaveDrawer}
                  required
                />
              )}
            />
            <Controller
              control={form.control}
              name="legalEntityFk"
              render={({ field, fieldState }) => (
                <Select
                  label={`${t('legalEntity')} *`}
                  options={entityOptions.filter((opt) => opt.value !== 'ALL')}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  error={fieldState.error?.message}
                  disabled={!canSaveDrawer}
                />
              )}
            />
            <Controller
              control={form.control}
              name="branchTypeId"
              render={({ field, fieldState }) => (
                <Select
                  label={`${t('branchType')} *`}
                  options={branchTypeOptions.filter((opt) => opt.value !== 'ALL')}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value as Branch['branchTypeId'])}
                  onBlur={field.onBlur}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  error={fieldState.error?.message}
                  disabled={!canSaveDrawer}
                />
              )}
            />
            <Controller
              control={form.control}
              name="notes"
              render={({ field, fieldState }) => (
                <Input
                  label={t('notes')}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  disabled={!canSaveDrawer}
                />
              )}
            />
          </div>
        </Drawer>
      </form>

      {/* 6. Cascade Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen && confirmActionType === 'DEACTIVATE_BRANCH'}
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
