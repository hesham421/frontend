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
import { DepartmentNode } from '../../data/mockData';
import { createDepartmentSchema, updateDepartmentSchema } from '../../departments/departments.schema';

// branchFk is required in createDepartmentSchema, but this page never
// collects it via a form field — it comes from the separate branch-filter
// <Select> above the tree (deptBranchFilter), merged in manually at save.
// parentDepartmentFk is z.number().optional() in both schemas, but the mock
// store's actual type is string | null — overridden here in both variants.
const departmentFormSchema = createDepartmentSchema
  .omit({ branchFk: true })
  .extend({ parentDepartmentFk: z.string().nullable().optional() });
type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

const departmentUpdateFormSchema = updateDepartmentSchema.extend({
  parentDepartmentFk: z.string().nullable().optional(),
});

export const DepartmentsPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const {
    departments,
    branches,
    deptBranchFilter,
    selectedDepartment,
    isConfirmDialogOpen,
    confirmActionType,
    setDeptBranchFilter,
    setSelectedDepartment,
    saveDepartment,
    openConfirmDialog,
    closeConfirmDialog,
    executeConfirmAction,
  } = useOrganizationStore();

  const [expandedNodeIds, setExpandedNodeIds] = useState<Record<string, boolean>>({ 'dept-1': true, 'dept-2': true, 'dept-5': true, 'dept-8': true });
  const [isCreatingChild, setIsCreatingChild] = useState(false);
  const [isCreatingRoot, setIsCreatingRoot] = useState(false);

  const { can } = usePermission();
  const canCreate = can('PERM_DEPARTMENT_CREATE');
  const canEdit = can('PERM_DEPARTMENT_UPDATE');
  // Creating a root or child department needs CREATE; editing an existing node needs UPDATE.
  const canSaveForm = (isCreatingRoot || isCreatingChild) ? canCreate : canEdit;

  const isEditMode = !isCreatingRoot && !isCreatingChild && !!selectedDepartment;
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(isEditMode ? departmentUpdateFormSchema : departmentFormSchema) as unknown as Resolver<DepartmentFormValues>,
    defaultValues: { nameEn: '', nameAr: '', nodeTypeId: 'DETAIL', parentDepartmentFk: null, notes: '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const toggleExpand = (id: string) => {
    setExpandedNodeIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectNode = (node: DepartmentNode) => {
    setIsCreatingRoot(false);
    setIsCreatingChild(false);
    setSelectedDepartment(node);
    form.reset({
      nameEn: node.nameEn,
      nameAr: node.nameAr,
      nodeTypeId: node.nodeTypeId,
      parentDepartmentFk: node.parentDepartmentFk || null,
      notes: node.notes || '',
    });
  };

  const handleStartAddChild = (parent: DepartmentNode) => {
    setSelectedDepartment(parent);
    setIsCreatingChild(true);
    setIsCreatingRoot(false);
    setExpandedNodeIds((prev) => ({ ...prev, [parent.id]: true }));
    form.reset({
      nameEn: '',
      nameAr: '',
      nodeTypeId: 'DETAIL',
      parentDepartmentFk: parent.id,
      notes: '',
    });
  };

  const handleStartAddRoot = () => {
    setSelectedDepartment(null);
    setIsCreatingRoot(true);
    setIsCreatingChild(false);
    form.reset({
      nameEn: '',
      nameAr: '',
      nodeTypeId: 'SUMMARY',
      parentDepartmentFk: null,
      notes: '',
    });
  };

  const onValid = (values: DepartmentFormValues) => {
    if (!canSaveForm) return;
    const isEdit = !isCreatingChild && !isCreatingRoot;
    saveDepartment({
      id: isEdit ? selectedDepartment?.id : undefined,
      ...values,
      branchFk: deptBranchFilter,
      nodeTypeId: values.nodeTypeId as DepartmentNode['nodeTypeId'],
    });
    setIsCreatingChild(false);
    setIsCreatingRoot(false);
    showToast(t(isEdit ? 'departmentSavedSuccess' : 'departmentCreatedSuccess'), 'success');
  };

  const handleConfirmToggleActive = () => {
    if (!canEdit) return;
    const wasActivating = confirmActionType === 'ACTIVATE_DEPT';
    executeConfirmAction();
    showToast(t(wasActivating ? 'departmentActivatedSuccess' : 'departmentDeactivatedSuccess'), 'success');
  };

  // Branch options
  const branchOptions = [
    { value: '', label: `-- ${t('assignedBranch')} --` },
    ...branches.map((b) => ({ value: b.id, label: `${lang === 'ar' ? b.nameAr : b.nameEn} (${b.branchCode})` })),
  ];

  // Filter department tree by selected branch
  const branchDepts = departments.filter((d) => d.branchFk === deptBranchFilter);

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: DepartmentNode, level: number = 0) => {
    const isExpanded = expandedNodeIds[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedDepartment?.id === node.id && !isCreatingChild && !isCreatingRoot;

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
            className={node.nodeTypeId === 'SUMMARY' ? 'ti ti-folder' : 'ti ti-file-text'}
            style={{
              color: node.nodeTypeId === 'SUMMARY' ? 'var(--brand-primary, #2466D8)' : 'var(--teal-400, #1FBBAD)',
              fontSize: '16px',
            }}
          />

          <span style={{ fontWeight: isSelected ? 700 : 500, fontSize: '13px', color: 'var(--text-strong, #14222F)', flex: 1, textAlign: 'start' }}>
            {lang === 'ar' ? node.nameAr : node.nameEn}
          </span>

          <Badge variant={node.nodeTypeId === 'SUMMARY' ? 'warning' : 'neutral'} size="sm">
            {node.nodeTypeId === 'SUMMARY' ? t('summaryNode') : t('detailNode')}
          </Badge>

          <Badge variant={node.isActive ? 'success' : 'danger'} size="sm">
            {node.isActive ? t('active') : t('inactive')}
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
            {canEdit && (node.isActive ? (
              <IconButton
                icon="ti ti-ban"
                label={t('deactivate')}
                variant="ghost"
                size="sm"
                onClick={() => openConfirmDialog('DEACTIVATE_DEPT', node.id)}
              />
            ) : (
              <IconButton
                icon="ti ti-check"
                label={t('reactivate')}
                variant="ghost"
                size="sm"
                onClick={() => openConfirmDialog('ACTIVATE_DEPT', node.id)}
              />
            ))}
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
              { label: t('navDepartments') },
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
            {t('orgDeptsTitle')}
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
              value={deptBranchFilter}
              onChange={(e) => setDeptBranchFilter(e.target.value)}
            />
          </div>
          <div style={{ marginInlineStart: 'auto', display: 'flex', gap: '8px' }}>
            {canCreate && (
              <Button
                variant="primary"
                size="md"
                iconLeft={<i className="ti ti-folder-plus" />}
                onClick={handleStartAddRoot}
                disabled={!deptBranchFilter}
              >
                {t('addRoot')}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {!deptBranchFilter ? (
        <Alert variant="info" message={t('selectBranchToLoadTree')} />
      ) : (
        /* Two-Column Layout: Tree Panel (Left) + Entry Panel (Right) */
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'start' }}>
          {/* Left: Tree Panel */}
          <Card variant="flat" padding="md">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-strong, #14222F)' }}>
                {t('orgDeptsTitle')}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedNodeIds({ 'dept-1': true, 'dept-2': true, 'dept-5': true, 'dept-8': true })}
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
              {branchDepts.length === 0 ? (
                <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted, #647488)' }}>
                  {t('noRecordsFound')}
                </div>
              ) : (
                branchDepts.map((rootNode) => renderTreeNode(rootNode))
              )}
            </div>
          </Card>

          {/* Right: Entry / Inspection Panel */}
          <Card variant="flat" padding="md">
            <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-subtle, #E6ECF3)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-strong, #14222F)', textAlign: 'start' }}>
                {isCreatingRoot && t('addRoot')}
                {isCreatingChild && `${t('addChild')} (${selectedDepartment ? (lang === 'ar' ? selectedDepartment.nameAr : selectedDepartment.nameEn) : ''})`}
                {!isCreatingRoot && !isCreatingChild && selectedDepartment && `${t('edit')}: ${lang === 'ar' ? selectedDepartment.nameAr : selectedDepartment.nameEn}`}
                {!isCreatingRoot && !isCreatingChild && !selectedDepartment && t('details')}
              </h2>
            </div>

            {!selectedDepartment && !isCreatingRoot && !isCreatingChild ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted, #647488)', fontSize: '13px' }}>
                Select a department node from the tree on the left or click <strong>+ Add Root Node</strong> to begin.
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onValid)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {selectedDepartment && !isCreatingChild && !isCreatingRoot && (
                  <Input
                    label={t('code')}
                    value={selectedDepartment.deptCode}
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
                  name="nodeTypeId"
                  render={({ field, fieldState }) => (
                    <Select
                      label={`${t('nodeType')} *`}
                      options={[
                        { value: 'SUMMARY', label: t('summaryNode') },
                        { value: 'DETAIL', label: t('detailNode') },
                      ]}
                      value={field.value ?? ''}
                      disabled={(!isCreatingRoot && !isCreatingChild && !!selectedDepartment) || !canSaveForm}
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
                      setSelectedDepartment(null);
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
        isOpen={isConfirmDialogOpen && (confirmActionType === 'DEACTIVATE_DEPT' || confirmActionType === 'ACTIVATE_DEPT')}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirmToggleActive}
        title={t('confirmActionTitle')}
        message={confirmActionType === 'ACTIVATE_DEPT' ? t('confirmReactivate') : t('confirmDeactivate')}
        confirmLabel={confirmActionType === 'ACTIVATE_DEPT' ? t('reactivate') : t('deactivate')}
        cancelLabel={t('cancel')}
        tone={confirmActionType === 'ACTIVATE_DEPT' ? 'primary' : 'danger'}
      />
    </div>
  );
};
