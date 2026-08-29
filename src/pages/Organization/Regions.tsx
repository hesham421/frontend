import React from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '../../context/LanguageContext';
import { useOrganizationStore } from '../../stores/useOrganizationStore';
import { usePermission } from '../../auth/permissions';
import { Breadcrumb, Drawer, EmptyState } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Badge } from '../../components/ui/DataDisplay';
import { Input, Select } from '../../components/ui/FormControls';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { Region } from '../../data/mockData';
import { createRegionSchema, updateRegionSchema } from '../../regions/regions.schema';

// regionTypeIdFk is FINDING-2/OQ-ORG-002 (deferred): no listing endpoint
// exists yet, so this page has no create/edit picker for it — omit it from
// client validation or the create flow becomes permanently unsubmittable.
// legalEntityFk is z.number() in createRegionSchema (real API contract), but
// this page's mock store and its <Select> both deal in string ids — override
// just that field for this mock-store-bound form (regions.schema.ts itself
// is out of scope, it correctly describes the real API).
const regionFormSchema = createRegionSchema
  .omit({ regionTypeIdFk: true })
  .extend({ legalEntityFk: z.string().min(1, 'Legal entity is required.') });
type RegionFormValues = z.infer<typeof regionFormSchema>;

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

  const { can } = usePermission();
  const canCreate = can('PERM_REGION_CREATE');
  const canEdit = can('PERM_REGION_UPDATE');
  // Editing an existing region needs UPDATE; the create-drawer branch needs CREATE.
  const canSaveDrawer = selectedRegion ? canEdit : canCreate;

  const isEditMode = !!selectedRegion;
  const form = useForm<RegionFormValues>({
    resolver: zodResolver(isEditMode ? updateRegionSchema : regionFormSchema) as unknown as Resolver<RegionFormValues>,
    defaultValues: { nameEn: '', nameAr: '', legalEntityFk: 'le-1', notes: '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const handleOpenCreate = () => {
    form.reset({ nameEn: '', nameAr: '', legalEntityFk: legalEntities[0]?.id || 'le-1', notes: '' });
    openRegionDrawer(null);
  };

  const handleOpenEdit = (region: Region) => {
    form.reset({ nameEn: region.nameEn, nameAr: region.nameAr, legalEntityFk: region.legalEntityFk, notes: region.notes || '' });
    openRegionDrawer(region);
  };

  const onValid = (values: RegionFormValues) => {
    if (!canSaveDrawer) return;
    const isEdit = !!selectedRegion;
    // F1/SCR-ORG-003 — FINDING-2 / OQ-ORG-002 (deferred): regionTypeIdFk is
    // intentionally omitted from the save payload — there is no create/edit
    // picker until a real region-type listing endpoint exists.
    saveRegion({
      id: selectedRegion?.id,
      ...values,
    });
    showToast(t(isEdit ? 'regionSavedSuccess' : 'regionCreatedSuccess'), 'success');
  };

  const handleConfirmDeactivate = () => {
    if (!canEdit) return;
    executeConfirmAction();
    showToast(t('regionDeactivatedSuccess'), 'success');
  };

  const filteredRegions = regions.filter((r) => {
    const matchesSearch =
      r.regionCode.toLowerCase().includes(regionSearch.toLowerCase()) ||
      r.nameEn.toLowerCase().includes(regionSearch.toLowerCase()) ||
      r.nameAr.includes(regionSearch);

    const matchesEntity = regionEntityFilter === 'ALL' || r.legalEntityFk === regionEntityFilter;
    // F1/SCR-ORG-003 — FINDING-2 / OQ-ORG-002 (deferred): regionTypeIdFk is now
    // `number | null` (real API FK), so this filter compares it as a string
    // against the Shell's pre-existing (non-authoritative) type option list.
    const matchesType = regionTypeFilter === 'ALL' || String(r.regionTypeIdFk ?? '') === regionTypeFilter;
    const matchesStatus =
      regionStatusFilter === 'ALL' ||
      (regionStatusFilter === 'ACTIVE' && r.isActive) ||
      (regionStatusFilter === 'INACTIVE' && !r.isActive);

    return matchesSearch && matchesEntity && matchesType && matchesStatus;
  });

  const entityOptions = [
    { value: 'ALL', label: t('all') },
    ...legalEntities.map((e) => ({ value: e.id, label: `${lang === 'ar' ? e.nameAr : e.nameEn} (${e.legalEntityCode})` })),
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
                        {/* F1/SCR-ORG-003 — FINDING-2 / OQ-ORG-002 (deferred): display the
                            real API's denormalized regionTypeNameEn, not the raw FK id. */}
                        <Badge variant="primary" size="sm">
                          {r.regionTypeNameEn || '—'}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Badge variant={r.isActive ? 'success' : 'danger'} size="sm">
                          {r.isActive ? t('active') : t('inactive')}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'end' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          {canEdit && (
                            <IconButton
                              icon="ti ti-edit"
                              label={t('edit')}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(r)}
                            />
                          )}
                          {r.isActive && canEdit && (
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
      <form onSubmit={form.handleSubmit(onValid)} noValidate>
        <Drawer
          isOpen={isRegionDrawerOpen}
          onClose={closeRegionDrawer}
          title={selectedRegion ? `${t('edit')}: ${lang === 'ar' ? selectedRegion.nameAr : selectedRegion.nameEn}` : t('new')}
          width="md"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button type="button" variant="secondary" onClick={closeRegionDrawer}>
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
            {selectedRegion && (
              <Input
                label={t('code')}
                value={selectedRegion.regionCode}
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
            {/* F1/SCR-ORG-003 — FINDING-2 / OQ-ORG-002 (deferred): regionTypeIdFk has
                no real listing endpoint (ENTITY-ORG-008 / RegionType), so there is no
                create/edit picker for it. Rendered as a read-only display of the real
                API's denormalized regionTypeNameEn until OQ-ORG-002 resolves. */}
            <Input
              label={t('regionType')}
              value={selectedRegion?.regionTypeNameEn || '—'}
              disabled
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
