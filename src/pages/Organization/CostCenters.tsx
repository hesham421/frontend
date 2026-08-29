import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useOrganizationStore } from '../../stores/useOrganizationStore';
import { Breadcrumb, Alert } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Badge } from '../../components/ui/DataDisplay';
import { Input, Select } from '../../components/ui/FormControls';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { CostCenterNode } from '../../data/mockData';

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

  // Form State
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [costCenterTypeId, setCostCenterTypeId] = useState<'DIRECT' | 'INDIRECT' | 'SHARED'>('DIRECT');
  const [nodeTypeId, setNodeTypeId] = useState<'SUMMARY' | 'DETAIL'>('DETAIL');
  const [parentCostCenterFk, setParentCostCenterFk] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isCreatingRoot) {
      setNameEn('');
      setNameAr('');
      setCostCenterTypeId('SHARED');
      setNodeTypeId('SUMMARY');
      setParentCostCenterFk(null);
      setNotes('');
    } else if (isCreatingChild && selectedCostCenter) {
      setNameEn('');
      setNameAr('');
      setCostCenterTypeId(selectedCostCenter.costCenterTypeId);
      setNodeTypeId('DETAIL');
      setParentCostCenterFk(selectedCostCenter.id);
      setNotes('');
    } else if (selectedCostCenter) {
      setNameEn(selectedCostCenter.nameEn);
      setNameAr(selectedCostCenter.nameAr);
      setCostCenterTypeId(selectedCostCenter.costCenterTypeId);
      setNodeTypeId(selectedCostCenter.nodeTypeId);
      setParentCostCenterFk(selectedCostCenter.parentCostCenterFk || null);
      setNotes(selectedCostCenter.notes || '');
      setIsCreatingChild(false);
      setIsCreatingRoot(false);
    }
  }, [selectedCostCenter, isCreatingChild, isCreatingRoot]);

  const toggleExpand = (id: string) => {
    setExpandedNodeIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectNode = (node: CostCenterNode) => {
    setIsCreatingRoot(false);
    setIsCreatingChild(false);
    setSelectedCostCenter(node);
  };

  const handleStartAddChild = (parent: CostCenterNode) => {
    setSelectedCostCenter(parent);
    setIsCreatingChild(true);
    setIsCreatingRoot(false);
    setExpandedNodeIds((prev) => ({ ...prev, [parent.id]: true }));
  };

  const handleStartAddRoot = () => {
    setSelectedCostCenter(null);
    setIsCreatingRoot(true);
    setIsCreatingChild(false);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !isCreatingChild && !isCreatingRoot;
    saveCostCenter({
      id: isEdit ? selectedCostCenter?.id : undefined,
      nameEn,
      nameAr,
      branchFk: costCenterBranchFilter,
      parentCostCenterFk,
      costCenterTypeId,
      nodeTypeId,
      notes,
    });
    setIsCreatingChild(false);
    setIsCreatingRoot(false);
    showToast(t(isEdit ? 'costCenterSavedSuccess' : 'costCenterCreatedSuccess'), 'success');
  };

  const handleConfirmDeactivate = () => {
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
            {node.nodeTypeId === 'SUMMARY' && (
              <IconButton
                icon="ti ti-plus"
                label={t('addChild')}
                variant="ghost"
                size="sm"
                onClick={() => handleStartAddChild(node)}
              />
            )}
            <IconButton
              icon="ti ti-edit"
              label={t('edit')}
              variant="ghost"
              size="sm"
              onClick={() => handleSelectNode(node)}
            />
            {node.isActive && (
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
            <Button
              variant="primary"
              size="md"
              iconLeft={<i className="ti ti-folder-plus" />}
              onClick={handleStartAddRoot}
              disabled={!costCenterBranchFilter}
            >
              {t('addRoot')}
            </Button>
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
              <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {selectedCostCenter && !isCreatingChild && !isCreatingRoot && (
                  <Input
                    label={t('code')}
                    value={selectedCostCenter.costCenterCode}
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
                  label={`${t('costCenterType')} *`}
                  options={ccTypeOptions}
                  value={costCenterTypeId}
                  onChange={(e) => setCostCenterTypeId(e.target.value as CostCenterNode['costCenterTypeId'])}
                />

                <Select
                  label={`${t('nodeType')} *`}
                  options={[
                    { value: 'SUMMARY', label: t('summaryNode') },
                    { value: 'DETAIL', label: t('detailNode') },
                  ]}
                  value={nodeTypeId}
                  disabled={!isCreatingRoot && !isCreatingChild && !!selectedCostCenter}
                  helperText={!isCreatingRoot && !isCreatingChild ? t('nodeTypeLockedHint') : undefined}
                  onChange={(e) => setNodeTypeId(e.target.value as 'SUMMARY' | 'DETAIL')}
                />

                <Input
                  label={t('notes')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsCreatingChild(false);
                      setIsCreatingRoot(false);
                      setSelectedCostCenter(null);
                    }}
                  >
                    {t('cancel')}
                  </Button>
                  <Button variant="primary" type="submit">
                    {t('save')}
                  </Button>
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
