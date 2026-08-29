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
import { LocationSite } from '../../data/mockData';
import { createLocationSiteSchema, updateLocationSiteSchema } from '../../locationSites/locationSites.schema';

// branchFk is z.number() in createLocationSiteSchema (real API contract), but
// this page's mock store and its <Select> both deal in string ids - override
// just that field for this mock-store-bound form (locationSites.schema.ts
// itself is out of scope, it correctly describes the real API).
const locationSiteFormSchema = createLocationSiteSchema.extend({
  branchFk: z.string().min(1, 'Branch is required.'),
});
type LocationSiteFormValues = z.infer<typeof locationSiteFormSchema>;

export const LocationSitesPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const {
    locationSites,
    branches,
    locationSearch,
    locationBranchFilter,
    locationTypeFilter,
    locationStatusFilter,
    selectedLocationSite,
    isLocationDrawerOpen,
    isConfirmDialogOpen,
    confirmActionType,
    setLocationSearch,
    setLocationBranchFilter,
    setLocationTypeFilter,
    setLocationStatusFilter,
    openLocationDrawer,
    closeLocationDrawer,
    saveLocationSite,
    openConfirmDialog,
    closeConfirmDialog,
    executeConfirmAction,
  } = useOrganizationStore();

  const { can } = usePermission();
  const canCreate = can('PERM_LOCATION_SITE_CREATE');
  const canEdit = can('PERM_LOCATION_SITE_UPDATE');
  // Editing an existing location site needs UPDATE; the create-drawer branch needs CREATE.
  const canSaveDrawer = selectedLocationSite ? canEdit : canCreate;

  const isEditMode = !!selectedLocationSite;
  const form = useForm<LocationSiteFormValues>({
    resolver: zodResolver(isEditMode ? updateLocationSiteSchema : locationSiteFormSchema) as unknown as Resolver<LocationSiteFormValues>,
    defaultValues: {
      nameEn: '',
      nameAr: '',
      branchFk: 'br-1',
      siteTypeId: 'OFFICE',
      notes: '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const handleOpenCreate = () => {
    form.reset({
      nameEn: '',
      nameAr: '',
      branchFk: branches[0]?.id || 'br-1',
      siteTypeId: 'OFFICE',
      notes: '',
    });
    openLocationDrawer(null);
  };

  const handleOpenEdit = (loc: LocationSite) => {
    form.reset({
      nameEn: loc.nameEn,
      nameAr: loc.nameAr,
      branchFk: loc.branchFk,
      siteTypeId: loc.siteTypeId,
      notes: loc.notes || '',
    });
    openLocationDrawer(loc);
  };

  const onValid = (values: LocationSiteFormValues) => {
    if (!canSaveDrawer) return;
    const isEdit = !!selectedLocationSite;
    saveLocationSite({
      id: selectedLocationSite?.id,
      ...values,
      siteTypeId: values.siteTypeId as LocationSite['siteTypeId'],
    });
    showToast(t(isEdit ? 'locationSiteSavedSuccess' : 'locationSiteCreatedSuccess'), 'success');
  };

  const handleConfirmDeactivate = () => {
    if (!canEdit) return;
    executeConfirmAction();
    showToast(t('locationSiteDeactivatedSuccess'), 'success');
  };

  const filteredLocations = locationSites.filter((l) => {
    const matchesSearch =
      l.locationSiteCode.toLowerCase().includes(locationSearch.toLowerCase()) ||
      l.nameEn.toLowerCase().includes(locationSearch.toLowerCase()) ||
      l.nameAr.includes(locationSearch);

    const matchesBranch = locationBranchFilter === 'ALL' || l.branchFk === locationBranchFilter;
    const matchesType = locationTypeFilter === 'ALL' || l.siteTypeId === locationTypeFilter;
    const matchesStatus =
      locationStatusFilter === 'ALL' ||
      (locationStatusFilter === 'ACTIVE' && l.isActive) ||
      (locationStatusFilter === 'INACTIVE' && !l.isActive);

    return matchesSearch && matchesBranch && matchesType && matchesStatus;
  });

  const branchOptions = [
    { value: 'ALL', label: t('all') },
    ...branches.map((b) => ({ value: b.id, label: `${lang === 'ar' ? b.nameAr : b.nameEn} (${b.branchCode})` })),
  ];

  const siteTypeOptions = [
    { value: 'ALL', label: t('all') },
    { value: 'OFFICE', label: 'Office (مكتب إداري)' },
    { value: 'WAREHOUSE', label: 'Warehouse (مستودع تخزين)' },
    { value: 'FACTORY', label: 'Factory (مصنع / معمل)' },
    { value: 'SITE', label: 'Site (موقع ميداني / ساحة)' },
    { value: 'RETAIL', label: 'Retail (معرض / نقطة بيع)' },
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
              { label: t('navLocationSites') },
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
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              iconLeft={<i className="ti ti-search" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
            />
          </div>
          <div style={{ width: '200px' }}>
            <Select
              options={branchOptions}
              value={locationBranchFilter}
              onChange={(e) => setLocationBranchFilter(e.target.value)}
            />
          </div>
          <div style={{ width: '180px' }}>
            <Select
              options={siteTypeOptions}
              value={locationTypeFilter}
              onChange={(e) => setLocationTypeFilter(e.target.value)}
            />
          </div>
          <div style={{ width: '140px' }}>
            <Select
              options={statusOptions}
              value={locationStatusFilter}
              onChange={(e) => setLocationStatusFilter(e.target.value)}
            />
          </div>
          {(locationSearch || locationBranchFilter !== 'ALL' || locationTypeFilter !== 'ALL' || locationStatusFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLocationSearch('');
                setLocationBranchFilter('ALL');
                setLocationTypeFilter('ALL');
                setLocationStatusFilter('ALL');
              }}
            >
              {t('clear')}
            </Button>
          )}
        </div>
      </Card>

      {/* 4. Data Grid */}
      <Card variant="flat" padding="none">
        {filteredLocations.length === 0 ? (
          <EmptyState
            icon="ti ti-building-off"
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
                    {t('branch')}
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'start' }}>
                    {t('siteType')}
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
                {filteredLocations.map((loc) => {
                  const br = branches.find((b) => b.id === loc.branchFk);
                  return (
                    <tr
                      key={loc.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle, #E6ECF3)',
                        transition: 'background 120ms ease',
                      }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <Badge variant="neutral" size="sm">
                          {loc.locationSiteCode}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-strong, #14222F)', fontSize: '14px' }}>
                          {lang === 'ar' ? loc.nameAr : loc.nameEn}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted, #647488)' }}>
                          {lang === 'ar' ? loc.nameEn : loc.nameAr}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: 'var(--text-body, #354456)' }}>
                        {br ? (lang === 'ar' ? br.nameAr : br.nameEn) : '—'}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Badge variant="primary" size="sm">
                          {loc.siteTypeId}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Badge variant={loc.isActive ? 'success' : 'danger'} size="sm">
                          {loc.isActive ? t('active') : t('inactive')}
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
                              onClick={() => handleOpenEdit(loc)}
                            />
                          )}
                          {loc.isActive && canEdit && (
                            <IconButton
                              icon="ti ti-ban"
                              label={t('deactivate')}
                              variant="ghost"
                              size="sm"
                              onClick={() => openConfirmDialog('DEACTIVATE_LOCATION', loc.id)}
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
          isOpen={isLocationDrawerOpen}
          onClose={closeLocationDrawer}
          title={selectedLocationSite ? `${t('edit')}: ${lang === 'ar' ? selectedLocationSite.nameAr : selectedLocationSite.nameEn}` : t('new')}
          width="md"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button type="button" variant="secondary" onClick={closeLocationDrawer}>
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
            {selectedLocationSite && (
              <Input
                label={t('code')}
                value={selectedLocationSite.locationSiteCode}
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
              name="branchFk"
              render={({ field, fieldState }) => (
                <Select
                  label={`${t('branch')} *`}
                  options={branchOptions.filter((opt) => opt.value !== 'ALL')}
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
              name="siteTypeId"
              render={({ field, fieldState }) => (
                <Select
                  label={`${t('siteType')} *`}
                  options={siteTypeOptions.filter((opt) => opt.value !== 'ALL')}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value as LocationSite['siteTypeId'])}
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

      {/* 6. Deactivation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen && confirmActionType === 'DEACTIVATE_LOCATION'}
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
