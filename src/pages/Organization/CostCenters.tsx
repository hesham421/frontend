import React, { useState } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '../../context/LanguageContext';
import { useOrganizationStore } from '../../stores/useOrganizationStore';
import { usePermission } from '../../auth/permissions';
import { Breadcrumb, Alert } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Badge } from '../../components/ui/DataDisplay';
import { Input, Select } from '../../components/ui/FormControls';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { CostCenterNode } from '../../data/mockData';
import { createCostCenterSchema, updateCostCenterSchema } from '../../costCenters/costCenters.schema';

// branchFk is required in createCostCenterSchema, but this page never
// collects it via a form field — it comes from the separate branch-filter
// <Select> above the tree (costCenterBranchFilter), merged in manually at save.
// parentCostCenterFk is z.number().optional() in both schemas, but the mock
// store's actual type is string | null — overridden here in both variants.
const costCenterFormSchema = createCostCenterSchema
  .omit({ branchFk: true })
  .extend({ parentCostCenterFk: z.string().nullable().optional() });
type CostCenterFormValues = z.infer<typeof costCenterFormSchema>;

const costCenterUpdateFormSchema = updateCostCenterSchema.extend({
  parentCostCenterFk: z.string().nullable().optional(),
});

export const CostCentersPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const {
    costCenters,
    branches,
    costCenterBranchFilter,
    selectedCostCenter,
    isConfirmDialogOpen,
    confirmActionType,
    setCostCenterBranchFilter,
    setSelectedCostCenter,
    saveCostCenter,
    openConfirmDialog,
    closeConfirmDialog,
    executeConfirmAction,
  } = useOrganizationStore();

  const [expandedNodeIds, setExpandedNodeIds] = useState<Record<string, boolean>>({ 'cc-1': true, 'cc-4': true });
  const [isCreatingChild, setIsCreatingChild] = useState(false);
  const [isCreatingRoot, setIsCreatingRoot] = useState(false);

  const { can } = usePermission();
  const canCreate = can('PERM_COST_CENTER_CREATE');
  const canEdit = can('PERM_COST_CENTER_UPDATE');
  // Creating a root or child cost center needs CREATE; editing an existing node needs UPDATE.
  const canSaveForm = (isCreatingRoot || isCreatingChild) ? canCreate : canEdit;

  const isEditMode = !isCreatingRoot && !isCreatingChild && !!selectedCostCenter;
  const form = useForm<CostCenterFormValues>({
    resolver: zodResolver(isEditMode ? costCenterUpdateFormSchema : costCenterFormSchema) as unknown as Resolver<CostCenterFormValues>,
    defaultValues: { nameEn: '', nameAr: '', costCenterTypeId: 'DIRECT', nodeTypeId: 'DETAIL', parentCostCenterFk: null, notes: '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const toggleExpand = (id: string) => {
    setExpandedNodeIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectNode = (node: CostCenterNode) => {
    setIsCreatingRoot(false);
    setIsCreatingChild(false);
    setSelectedCostCenter(node);
    form.reset({
      nameEn: node.nameEn,
      nameAr: node.nameAr,
      costCenterTypeId: node.costCenterTypeId,
      nodeTypeId: node.nodeTypeId,
      parentCostCenterFk: node.parentCostCenterFk || null,
      notes: node.notes || '',
    });
  };

  const handleStartAddChild = (parent: CostCenterNode) => {
    setSelectedCostCenter(parent);
    setIsCreatingChild(true);
    setIsCreatingRoot(false);
    setExpandedNodeIds((prev) => ({ ...prev, [parent.id]: true }));
    form.reset({
      nameEn: '',
      nameAr: '',
      costCenterTypeId: parent.costCenterTypeId,
      nodeTypeId: 'DETAIL',
      parentCostCenterFk: parent.id,
      notes: '',
    });
  };

  const handleStartAddRoot = () => {
    setSelectedCostCenter(null);
    setIsCreatingRoot(true);
    setIsCreatingChild(false);
    form.reset({
      nameEn: '',
      nameAr: '',
      costCenterTypeId: 'SHARED',
      nodeTypeId: 'SUMMARY',
      parentCostCenterFk: null,
      notes: '',
    });
  };

  const onValid = (values: CostCenterFormValues) => {
    if (!canSaveForm) return;
    const isEdit = !isCreatingChild && !isCreatingRoot;
    saveCostCenter({
      id: isEdit ? selectedCostCenter?.id : undefined,
      ...values,
      branchFk: costCenterBranchFilter,
      costCenterTypeId: values.costCenterTypeId as CostCenterNode['costCenterTypeId'],
      nodeTypeId: values.nodeTypeId as CostCenterNode['nodeTypeId'],
    });
    setIsCreatingChild(false);
    setIsCreatingRoot(false);
    showToast(t(isEdit ? 'costCenterSavedSuccess' : 'costCenterCreatedSuccess'), 'success');
  };

  const handleConfirmDeactivate = () => {
    if (!canEdit) return;
    executeConfirmAction();
    showToast(t('costCenterDeactivatedSuccess'), 'success');
  };

  const branchOptions = [
    { value: '', label: `-- ${t('assignedBranch')} --` },
    ...branches.map((b) => ({ value: b.id, label: `${lang === 'ar' ? b.nameAr : b.nameEn} (${b.branchCode})` })),
  ];

  const ccTypeOptions = [
    { value: 'DIRECT', label: 'Direct Cost (تكلفة مباشرة)' },
    { value: 'INDIRECT', label: 'Indirect Cost (تكلفة غير مباشرة)' },
    { value: 'SHARED', label: 'Shared Overhead (تكاليف مشتركة)' },
  ];

  const branchCCs = costCenters.filter((cc) => cc.branchFk === costCenterBranchFilter);

  const renderTreeNode = (node: CostCenterNode, level: number = 0) => {
    const isExpanded = expandedNodeIds[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedCostCenter?.id === node.id && !isCreatingChild && !isCreatingRoot;

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 10px',
            paddingInlineStart: `${level * 20 + 10}px`,
            borderRadius: 'var(--radius-md, 7px)',
            background: isSelected ? 'rgba(36, 102, 216, 0.08)' : 'transparent',
            border: isSelected ? '1px solid var(--brand-primary, #2466D8)' : '1px solid transparent',
            cursor: 'pointer',
            transition: 'background 120ms ease',
          }}
          onClick={() => handleSelectNode(node)}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                color: 'var(--text-muted, #647488)',
                display: 'inline-flex',
              }}
            >
              <i className={isExpanded ? 'ti ti-chevron-down' : 'ti ti-chevron-right'} style={{ fontSize: '14px' }} />
            </button>
          ) : (
            <span style={{ width: '18px' }} />
          )}

          <i
            className="ti ti-calculator"
            style={{
              color: node.nodeTypeId === 'SUMMARY' ? 'var(--brand-primary, #2466D8)' : 'var(--teal-400, #1FBBAD)',
              fontSize: '16px',
            }}
          />

          <span style={{ fontWeight: isSelected ? 700 : 500, fontSize: '13px', color: 'var(--text-strong, #14222F)', flex: 1, textAlign: 'start' }}>
            {lang === 'ar' ? node.nameAr : node.nameEn}
          </span>

          <Badge variant="primary" size="sm">
            {node.costCenterTypeId}
          </Badge>

          <Badge variant={node.nodeTypeId === 'SUMMARY' ? 'warning' : 'neutral'} size="sm">
            {node.nodeTypeId === 'SUMMARY' ? t('summaryNode') : t('detailNode')}
          </Badge>

          <div style={{ display: 'inline-flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
            {node.nodeTypeId === 'SUMMARY' && canCreate && (
              <IconButton
                icon="ti ti-plus"
                label={t('addChild')}
                variant="ghost"
                size="sm"
                onClick={() => handleStartAddChild(node)}
              />
            )}
            {canEdit && (
              <IconButton
                icon="ti ti-edit"
                label={t('edit')}
                variant="ghost"
                size="sm"
                onClick={() => handleSelectNode(node)}
              />
            )}
            {node.isActive && canEdit && (
              <IconButton
                icon="ti ti-ban"
                label={t('deactivate')}
                variant="ghost"
                size="sm"
                onClick={() => openConfirmDialog('DEACTIVATE_COST_CENTER', node.id)}
              />
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {node.children!.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Breadcrumb
            items={[
              { label: t('navOverview') },
              { label: t('groupOrganization') },
              { label: t('navCostCenters') },
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
            {t('orgCostCentersTitle')}
          </h1>
        </div>
      </div>

      {/* 2. Branch Filter Requirement */}
      <Card variant="flat" padding="md">
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: '280px' }}>
            <Select
              label={`${t('branch')} *`}
              options={branchOptions}
              value={costCenterBranchFilter}
              onChange={(e) => setCostCenterBranchFilter(e.target.value)}
            />
          </div>
          <div style={{ marginInlineStart: 'auto', display: 'flex', gap: '8px' }}>
            {canCreate && (
              <Button
                variant="primary"
                size="md"
                iconLeft={<i className="ti ti-folder-plus" />}
                onClick={handleStartAddRoot}
                disabled={!costCenterBranchFilter}
              >
                {t('addRoot')}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {!costCenterBranchFilter ? (
        <Alert variant="info" message={t('selectBranchToLoadTree')} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'start' }}>
          {/* Left: Tree Panel */}
          <Card variant="flat" padding="md">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-strong, #14222F)' }}>
                {t('orgCostCentersTitle')}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedNodeIds({ 'cc-1': true, 'cc-4': true })}
                >
                  {t('expandAll')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedNodeIds({})}
                >
                  {t('collapseAll')}
                </Button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '320px', maxHeight: '550px', overflowY: 'auto' }}>
              {branchCCs.length === 0 ? (
                <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted, #647488)' }}>
                  {t('noRecordsFound')}
                </div>
              ) : (
                branchCCs.map((rootNode) => renderTreeNode(rootNode))
              )}
            </div>
          </Card>

          {/* Right: Entry / Inspection Panel */}
          <Card variant="flat" padding="md">
            <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-subtle, #E6ECF3)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-strong, #14222F)', textAlign: 'start' }}>
                {isCreatingRoot && t('addRoot')}
                {isCreatingChild && `${t('addChild')} (${selectedCostCenter ? (lang === 'ar' ? selectedCostCenter.nameAr : selectedCostCenter.nameEn) : ''})`}
                {!isCreatingRoot && !isCreatingChild && selectedCostCenter && `${t('edit')}: ${lang === 'ar' ? selectedCostCenter.nameAr : selectedCostCenter.nameEn}`}
                {!isCreatingRoot && !isCreatingChild && !selectedCostCenter && t('details')}
              </h2>
            </div>

            {!selectedCostCenter && !isCreatingRoot && !isCreatingChild ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted, #647488)', fontSize: '13px' }}>
                Select a cost center node from the tree on the left or click <strong>+ Add Root Node</strong> to begin.
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onValid)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {selectedCostCenter && !isCreatingChild && !isCreatingRoot && (
                  <Input
                    label={t('code')}
                    value={selectedCostCenter.costCenterCode}
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
                      disabled={!canSaveForm}
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
                      disabled={!canSaveForm}
                      required
                    />
                  )}
                />

                <Controller
                  control={form.control}
                  name="costCenterTypeId"
                  render={({ field, fieldState }) => (
                    <Select
                      label={`${t('costCenterType')} *`}
                      options={ccTypeOptions}
                      value={field.value ?? ''}
                      disabled={!canSaveForm}
                      onChange={(e) => field.onChange(e.target.value as CostCenterNode['costCenterTypeId'])}
                      onBlur={field.onBlur}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  control={form.control}
                  name="nodeTypeId"
                  render={({ field, fieldState }) => (
                    <Select
                      label={`${t('nodeType')} *`}
                      options={[
                        { value: 'SUMMARY', label: t('summaryNode') },
                        { value: 'DETAIL', label: t('detailNode') },
                      ]}
                      value={field.value ?? ''}
                      disabled={(!isCreatingRoot && !isCreatingChild && !!selectedCostCenter) || !canSaveForm}
                      helperText={!isCreatingRoot && !isCreatingChild ? t('nodeTypeLockedHint') : undefined}
                      onChange={(e) => field.onChange(e.target.value as 'SUMMARY' | 'DETAIL')}
                      onBlur={field.onBlur}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                      error={fieldState.error?.message}
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
                      disabled={!canSaveForm}
                    />
                  )}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsCreatingChild(false);
                      setIsCreatingRoot(false);
                      setSelectedCostCenter(null);
                    }}
                  >
                    {t('cancel')}
                  </Button>
                  {canSaveForm && (
                    <Button variant="primary" type="submit" loading={form.formState.isSubmitting}>
                      {t('save')}
                    </Button>
                  )}
                </div>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen && confirmActionType === 'DEACTIVATE_COST_CENTER'}
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
