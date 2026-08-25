import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useOrganizationStore } from '../../stores/useOrganizationStore';
import { Breadcrumb, Dialog, Alert } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Stat, Badge } from '../../components/ui/DataDisplay';
import { Input, Select } from '../../components/ui/FormControls';
import { DepartmentNode } from '../../data/mockData';

export const DepartmentsPage: React.FC = () => {
  const { t, lang } = useLanguage();
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

  // Form State
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [nodeTypeId, setNodeTypeId] = useState<'SUMMARY' | 'DETAIL'>('DETAIL');
  const [parentDepartmentFk, setParentDepartmentFk] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  // Sync form with selectedDepartment or creation mode
  useEffect(() => {
    if (isCreatingRoot) {
      setNameEn('');
      setNameAr('');
      setNodeTypeId('SUMMARY');
      setParentDepartmentFk(null);
      setNotes('');
    } else if (isCreatingChild && selectedDepartment) {
      setNameEn('');
      setNameAr('');
      setNodeTypeId('DETAIL');
      setParentDepartmentFk(selectedDepartment.id);
      setNotes('');
    } else if (selectedDepartment) {
      setNameEn(selectedDepartment.nameEn);
      setNameAr(selectedDepartment.nameAr);
      setNodeTypeId(selectedDepartment.nodeTypeId);
      setParentDepartmentFk(selectedDepartment.parentDepartmentFk || null);
      setNotes(selectedDepartment.notes || '');
      setIsCreatingChild(false);
      setIsCreatingRoot(false);
    }
  }, [selectedDepartment, isCreatingChild, isCreatingRoot]);

  const toggleExpand = (id: string) => {
    setExpandedNodeIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectNode = (node: DepartmentNode) => {
    setIsCreatingRoot(false);
    setIsCreatingChild(false);
    setSelectedDepartment(node);
  };

  const handleStartAddChild = (parent: DepartmentNode) => {
    setSelectedDepartment(parent);
    setIsCreatingChild(true);
    setIsCreatingRoot(false);
    setExpandedNodeIds((prev) => ({ ...prev, [parent.id]: true }));
  };

  const handleStartAddRoot = () => {
    setSelectedDepartment(null);
    setIsCreatingRoot(true);
    setIsCreatingChild(false);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    saveDepartment({
      id: isCreatingChild || isCreatingRoot ? undefined : selectedDepartment?.id,
      nameEn,
      nameAr,
      branchFk: deptBranchFilter,
      parentDepartmentFk,
      nodeTypeId,
      notes,
    });
    setIsCreatingChild(false);
    setIsCreatingRoot(false);
  };

  // Branch options
  const branchOptions = [
    { value: '', label: `-- ${t('assignedBranch')} --` },
    ...branches.map((b) => ({ value: b.id, label: `${b.nameEn} (${b.branchCode})` })),
  ];

  // Filter department tree by selected branch
  const branchDepts = departments.filter((d) => d.branchFk === deptBranchFilter);

  // Helper to count nodes
  const countNodes = (nodes: DepartmentNode[]): { total: number; summary: number; detail: number } => {
    let total = 0;
    let summary = 0;
    let detail = 0;

    const traverse = (list: DepartmentNode[]) => {
      for (const n of list) {
        total++;
        if (n.nodeTypeId === 'SUMMARY') summary++;
        else detail++;
        if (n.children) traverse(n.children);
      }
    };
    traverse(nodes);
    return { total, summary, detail };
  };

  const stats = countNodes(branchDepts);

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
                onClick={() => openConfirmDialog('DEACTIVATE_DEPT', node.id)}
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

      {/* 2. KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <Stat
          label={t('totalDepartments')}
          value={stats.total}
          icon={<i className="ti ti-sitemap" style={{ color: 'var(--brand-primary, #2466D8)', fontSize: '20px' }} />}
        />
        <Stat
          label="Summary Units"
          value={stats.summary}
          icon={<i className="ti ti-folder" style={{ color: 'var(--amber-500, #DF8B17)', fontSize: '20px' }} />}
        />
        <Stat
          label="Posting / Detail Units"
          value={stats.detail}
          icon={<i className="ti ti-file-text" style={{ color: 'var(--green-500, #1D9A6C)', fontSize: '20px' }} />}
        />
      </div>

      {/* 3. Branch Filter Requirement */}
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
            <Button
              variant="primary"
              size="md"
              iconLeft={<i className="ti ti-folder-plus" />}
              onClick={handleStartAddRoot}
              disabled={!deptBranchFilter}
            >
              {t('addRoot')}
            </Button>
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
              <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {selectedDepartment && !isCreatingChild && !isCreatingRoot && (
                  <Input
                    label={t('code')}
                    value={selectedDepartment.deptCode}
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
                  label={`${t('nodeType')} *`}
                  options={[
                    { value: 'SUMMARY', label: t('summaryNode') },
                    { value: 'DETAIL', label: t('detailNode') },
                  ]}
                  value={nodeTypeId}
                  disabled={!isCreatingRoot && !isCreatingChild && !!selectedDepartment}
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
                      setSelectedDepartment(null);
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
      <Dialog
        isOpen={isConfirmDialogOpen && confirmActionType === 'DEACTIVATE_DEPT'}
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
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-body, #354456)' }}>
          {t('confirmDeactivate')}
        </p>
      </Dialog>
    </div>
  );
};
