import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useCostCentersFacade, useCostCenter } from '../api/hooks';
import type { CostCenterTreeNodeResponse, CreateCostCenterRequest, UpdateCostCenterRequest } from '../api/costCentersApi';
import { mapApiError } from '@/lib/errors/mapApiError';
import { Breadcrumb, Alert } from '@/components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '@/components/ui/Button';
import { Card, Badge } from '@/components/ui/DataDisplay';
import { Input, Select } from '@/components/ui/FormControls';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

export const CostCentersPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const {
    costcenterTree,
    isLoading,
    isTreeLoading,
    selectedBranchFk,
    nodeTypeIdOptions,
    costCenterTypeIdOptions,
    branchFkOptions,
    parentCostCenterFkOptions,
    canCreate,
    canEdit,
    setSelectedBranchFk,
    selectItem,
    createCostCenter,
    updateCostCenter,
    deactivateCostCenter,
    activateCostCenter,
  } = useCostCentersFacade();

  const [expandedNodeIds, setExpandedNodeIds] = useState<Record<number, boolean>>({});
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [isCreatingChild, setIsCreatingChild] = useState(false);
  const [isCreatingRoot, setIsCreatingRoot] = useState(false);
  const [createParentId, setCreateParentId] = useState<number | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<{ node: CostCenterTreeNodeResponse; activate: boolean } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const detail = useCostCenter(selectedNodeId ?? undefined);

  const canSaveForm = (isCreatingRoot || isCreatingChild) ? canCreate : canEdit;
  const isEditMode = !isCreatingRoot && !isCreatingChild && selectedNodeId != null;

  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [nodeTypeId, setNodeTypeId] = useState('');
  const [costCenterTypeId, setCostCenterTypeId] = useState('');
  const [parentCostCenterFk, setParentCostCenterFk] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isEditMode && detail.data) {
      setNameEn(detail.data.nameEn ?? '');
      setNameAr(detail.data.nameAr ?? '');
      setNodeTypeId(detail.data.nodeTypeId ?? '');
      setCostCenterTypeId(detail.data.costCenterTypeId ?? '');
      setParentCostCenterFk(detail.data.parentCostCenterFk ?? null);
      setNotes(detail.data.notes ?? '');
    }
  }, [isEditMode, detail.data]);

  const toggleExpand = (id: number) => {
    setExpandedNodeIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectNode = (node: CostCenterTreeNodeResponse) => {
    setIsCreatingRoot(false);
    setIsCreatingChild(false);
    setErrorMessage(null);
    setSelectedNodeId(node.id ?? null);
    selectItem(null);
  };

  const handleStartAddChild = (parent: CostCenterTreeNodeResponse) => {
    setSelectedNodeId(null);
    setIsCreatingChild(true);
    setIsCreatingRoot(false);
    setCreateParentId(parent.id ?? null);
    setErrorMessage(null);
    if (parent.id != null) setExpandedNodeIds((prev) => ({ ...prev, [parent.id!]: true }));
    setNameEn('');
    setNameAr('');
    setNodeTypeId(nodeTypeIdOptions[0]?.code ?? 'DETAIL');
    setCostCenterTypeId(costCenterTypeIdOptions[0]?.code ?? '');
    setParentCostCenterFk(parent.id ?? null);
    setNotes('');
  };

  const handleStartAddRoot = () => {
    setSelectedNodeId(null);
    setIsCreatingRoot(true);
    setIsCreatingChild(false);
    setCreateParentId(null);
    setErrorMessage(null);
    setNameEn('');
    setNameAr('');
    setNodeTypeId(nodeTypeIdOptions[0]?.code ?? 'SUMMARY');
    setCostCenterTypeId(costCenterTypeIdOptions[0]?.code ?? '');
    setParentCostCenterFk(null);
    setNotes('');
  };

  const handleSave = async () => {
    if (!canSaveForm) return;
    setErrorMessage(null);
    try {
      if (isEditMode && selectedNodeId != null) {
        const req: UpdateCostCenterRequest = { nameEn, nameAr, parentCostCenterFk: parentCostCenterFk ?? undefined, costCenterTypeId, notes };
        await updateCostCenter(selectedNodeId, req);
        showToast(t('costCenterSavedSuccess'), 'success');
      } else if (selectedBranchFk != null) {
        const req: CreateCostCenterRequest = {
          nameEn,
          nameAr,
          branchFk: selectedBranchFk,
          parentCostCenterFk: createParentId ?? undefined,
          nodeTypeId,
          costCenterTypeId,
          notes,
        };
        await createCostCenter(req);
        showToast(t('costCenterCreatedSuccess'), 'success');
        setIsCreatingChild(false);
        setIsCreatingRoot(false);
      }
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
    }
  };

  const handleConfirmToggle = async () => {
    if (!confirmToggle?.node.id) return;
    try {
      if (confirmToggle.activate) {
        await activateCostCenter(confirmToggle.node.id);
        showToast(t('costCenterActivatedSuccess'), 'success');
      } else {
        await deactivateCostCenter(confirmToggle.node.id);
        showToast(t('costCenterDeactivatedSuccess'), 'success');
      }
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
    }
    setConfirmToggle(null);
  };

  const branchOptions = [
    { value: '', label: `-- ${t('assignedBranch')} --` },
    ...branchFkOptions.map((b) => ({ value: String(b.id), label: `${lang === 'ar' ? b.nameAr : b.nameEn} (${b.branchCode})` })),
  ];

  const nodeTypeSelectOptions = nodeTypeIdOptions.map((opt) => ({
    value: opt.code ?? '',
    label: lang === 'ar' ? (opt.label ?? opt.code ?? '') : (opt.labelEn ?? opt.code ?? ''),
  }));

  const costCenterTypeSelectOptions = costCenterTypeIdOptions.map((opt) => ({
    value: opt.code ?? '',
    label: lang === 'ar' ? (opt.label ?? opt.code ?? '') : (opt.labelEn ?? opt.code ?? ''),
  }));

  const parentOptions = [
    { value: '', label: `-- ${t('noneOption')} --` },
    ...parentCostCenterFkOptions
      .filter((n) => n.id !== selectedNodeId)
      .map((n) => ({ value: String(n.id), label: lang === 'ar' ? n.nameAr! : n.nameEn! })),
  ];

  const renderTreeNode = (node: CostCenterTreeNodeResponse, level: number = 0) => {
    const isExpanded = expandedNodeIds[node.id ?? -1];
    const hasChildren = !!node.children && node.children.length > 0;
    const isSelected = selectedNodeId === node.id && !isCreatingChild && !isCreatingRoot;

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
                if (node.id != null) toggleExpand(node.id);
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-muted, #647488)', display: 'inline-flex' }}
            >
              <i className={isExpanded ? 'ti ti-chevron-down' : 'ti ti-chevron-right'} style={{ fontSize: '14px' }} />
            </button>
          ) : (
            <span style={{ width: '18px' }} />
          )}

          <i
            className={node.nodeTypeId === 'SUMMARY' ? 'ti ti-folder' : 'ti ti-file-text'}
            style={{ color: node.nodeTypeId === 'SUMMARY' ? 'var(--brand-primary, #2466D8)' : 'var(--teal-400, #1FBBAD)', fontSize: '16px' }}
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
              <IconButton icon="ti ti-plus" label={t('addChild')} variant="ghost" size="sm" onClick={() => handleStartAddChild(node)} />
            )}
            {canEdit && (
              <IconButton icon="ti ti-edit" label={t('edit')} variant="ghost" size="sm" onClick={() => handleSelectNode(node)} />
            )}
            {canEdit && (node.isActive ? (
              <IconButton
                icon="ti ti-ban"
                label={t('deactivate')}
                variant="ghost"
                size="sm"
                onClick={() => setConfirmToggle({ node, activate: false })}
              />
            ) : (
              <IconButton
                icon="ti ti-check"
                label={t('reactivate')}
                variant="ghost"
                size="sm"
                onClick={() => setConfirmToggle({ node, activate: true })}
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
              { label: t('navCostCenters') },
            ]}
          />
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-strong, #14222F)', margin: '4px 0 0 0', textAlign: 'start' }}>
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
              value={selectedBranchFk != null ? String(selectedBranchFk) : ''}
              onChange={(e) => {
                setSelectedBranchFk(e.target.value ? Number(e.target.value) : null);
                setSelectedNodeId(null);
                setIsCreatingChild(false);
                setIsCreatingRoot(false);
              }}
            />
          </div>
          <div style={{ marginInlineStart: 'auto', display: 'flex', gap: '8px' }}>
            {canCreate && (
              <Button
                variant="primary"
                size="md"
                iconLeft={<i className="ti ti-folder-plus" />}
                onClick={handleStartAddRoot}
                disabled={!selectedBranchFk}
              >
                {t('addRoot')}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {errorMessage && <Alert variant="danger" message={errorMessage} />}

      {!selectedBranchFk ? (
        <Alert variant="info" message={t('selectBranchToLoadTree')} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'start' }}>
          {/* Left: Tree Panel */}
          <Card variant="flat" padding="md">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-strong, #14222F)' }}>{t('orgCostCentersTitle')}</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const all: Record<number, boolean> = {};
                    const walk = (nodes: CostCenterTreeNodeResponse[]) => nodes.forEach((n) => { if (n.id != null) all[n.id] = true; walk(n.children ?? []); });
                    walk(costcenterTree);
                    setExpandedNodeIds(all);
                  }}
                >
                  {t('expandAll')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setExpandedNodeIds({})}>
                  {t('collapseAll')}
                </Button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '320px', maxHeight: '550px', overflowY: 'auto' }}>
              {isTreeLoading ? (
                <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted, #647488)' }}>{t('loading')}</div>
              ) : costcenterTree.length === 0 ? (
                <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted, #647488)' }}>{t('noRecordsFound')}</div>
              ) : (
                costcenterTree.map((rootNode) => renderTreeNode(rootNode))
              )}
            </div>
          </Card>

          {/* Right: Entry / Inspection Panel */}
          <Card variant="flat" padding="md">
            <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-subtle, #E6ECF3)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-strong, #14222F)', textAlign: 'start' }}>
                {isCreatingRoot && t('addRoot')}
                {isCreatingChild && t('addChild')}
                {isEditMode && detail.data && `${t('edit')}: ${lang === 'ar' ? detail.data.nameAr : detail.data.nameEn}`}
                {!isCreatingRoot && !isCreatingChild && !isEditMode && t('details')}
              </h2>
            </div>

            {!isEditMode && !isCreatingRoot && !isCreatingChild ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted, #647488)', fontSize: '13px' }}>
                {t('selectDepartmentPrompt')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {isEditMode && detail.data && (
                  <Input label={t('code')} value={detail.data.costCenterCode ?? ''} disabled helperText={t('readOnlyCodeHint')} />
                )}

                <Input label={`${t('nameEn')} *`} value={nameEn} onChange={(e) => setNameEn(e.target.value)} disabled={!canSaveForm} required />
                <Input label={`${t('nameAr')} *`} value={nameAr} onChange={(e) => setNameAr(e.target.value)} disabled={!canSaveForm} required />

                <Select
                  label={`${t('nodeType')} *`}
                  options={nodeTypeSelectOptions}
                  value={nodeTypeId}
                  disabled={isEditMode || !canSaveForm}
                  helperText={isEditMode ? t('nodeTypeLockedHint') : undefined}
                  onChange={(e) => setNodeTypeId(e.target.value)}
                />

                <Select
                  label={`${t('costCenterType')} *`}
                  options={costCenterTypeSelectOptions}
                  value={costCenterTypeId}
                  disabled={!canSaveForm}
                  onChange={(e) => setCostCenterTypeId(e.target.value)}
                />

                <Select
                  label={t('parentCostCenter')}
                  options={parentOptions}
                  value={parentCostCenterFk != null ? String(parentCostCenterFk) : ''}
                  disabled={!canSaveForm || isCreatingChild}
                  onChange={(e) => setParentCostCenterFk(e.target.value ? Number(e.target.value) : null)}
                />

                <Input label={t('notes')} value={notes} onChange={(e) => setNotes(e.target.value)} disabled={!canSaveForm} />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsCreatingChild(false);
                      setIsCreatingRoot(false);
                      setSelectedNodeId(null);
                    }}
                  >
                    {t('cancel')}
                  </Button>
                  {canSaveForm && (
                    <Button variant="primary" onClick={handleSave} loading={isLoading}>
                      {t('save')}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmToggle != null}
        onClose={() => setConfirmToggle(null)}
        onConfirm={handleConfirmToggle}
        title={t('confirmActionTitle')}
        message={confirmToggle?.activate ? t('confirmReactivate') : t('confirmDeactivate')}
        confirmLabel={confirmToggle?.activate ? t('reactivate') : t('deactivate')}
        cancelLabel={t('cancel')}
        tone={confirmToggle?.activate ? 'primary' : 'danger'}
      />
    </div>
  );
};
