import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useRoleManagementFacade } from '../../roles/hooks';
import { createRoleSchema, excludeSelfFromCopySources } from '../../roles/roles.schema';
import type { RoleDto } from '../../roles/rolesApi';
import { useActivePages } from '../../pageRegistry/hooks';
import { mapApiError } from '../../lib/errors/mapApiError';
import { Breadcrumb, Dialog, Alert } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Badge } from '../../components/ui/DataDisplay';
import { Input, Select, Switch } from '../../components/ui/FormControls';
import { Table, type TableColumn } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { DataScopeDrawer } from '../../components/features/DataScopeDrawer';

type CrudPermission = 'CREATE' | 'UPDATE' | 'DELETE';

export const RolesPage: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const {
    roleList,
    selectedRole,
    pageMatrix,
    isLoading,
    isListLoading,
    loadError,
    page,
    size,
    totalElements,
    statusFilter,
    selectRole,
    setSearchFilters,
    setPage,
    setStatusFilter,
    retry,
    createRole,
    updateRole,
    deleteRole,
    activateRole,
    deactivateRole,
    syncRolePages,
    removePageFromRole,
    copyFromRole,
  } = useRoleManagementFacade();
  const activePages = useActivePages();

  const [searchText, setSearchText] = useState('');
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isDataScopeDrawerOpen, setIsDataScopeDrawerOpen] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState<{ role: RoleDto; activate: boolean } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [roleCode, setRoleCode] = useState('');
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [copySourceRoleId, setCopySourceRoleId] = useState('');

  // Local draft of the permission matrix — RULE-SEC-042/043: VIEW is
  // implicit (never a togglable column), only CREATE/UPDATE/DELETE toggle
  // here; "Sync All" pushes the whole draft via the real bulk-replace
  // endpoint (no per-cell PATCH exists on the real API).
  const [matrixDraft, setMatrixDraft] = useState<Record<string, Set<CrudPermission>>>({});

  useEffect(() => {
    const draft: Record<string, Set<CrudPermission>> = {};
    for (const a of pageMatrix?.assignments ?? []) {
      if (a.pageCode) draft[a.pageCode] = new Set((a.permissions ?? []) as CrudPermission[]);
    }
    setMatrixDraft(draft);
  }, [pageMatrix]);

  const applySearch = (text: string) => {
    setSearchFilters({ filters: text ? [{ field: 'roleName', operator: 'LIKE', value: text }] : [], page: 0 });
  };

  const handleOpenCreate = () => {
    setRoleCode('');
    setRoleName('');
    setDescription('');
    setIsActive(true);
    setErrorMessage(null);
    selectRole(null);
    setIsRoleDialogOpen(true);
  };

  const handleOpenEdit = (role: RoleDto) => {
    setRoleCode(role.roleCode || '');
    setRoleName(role.roleName || '');
    setDescription(role.description || '');
    setIsActive(role.active ?? true);
    setErrorMessage(null);
    selectRole(role);
    setIsRoleDialogOpen(true);
  };

  const handleSave = async () => {
    setErrorMessage(null);
    try {
      if (selectedRole?.id != null) {
        await updateRole(selectedRole.id, { roleName, description, active: isActive });
        showToast(t('roleSavedSuccess'), 'success');
      } else {
        const parsed = createRoleSchema.safeParse({ roleCode, roleName, description, active: isActive });
        if (!parsed.success) {
          setErrorMessage(parsed.error.issues[0]?.message ?? 'Invalid input');
          return;
        }
        await createRole(parsed.data);
        showToast(t('roleCreatedSuccess'), 'success');
      }
      setIsRoleDialogOpen(false);
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
    }
  };

  const handleConfirmToggle = async () => {
    if (!confirmToggle?.role.id) return;
    try {
      if (confirmToggle.activate) {
        await activateRole(confirmToggle.role.id);
        showToast(t('roleActivatedSuccess'), 'success');
      } else {
        await deactivateRole(confirmToggle.role.id);
        showToast(t('roleDeactivatedSuccess'), 'success');
      }
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
    }
    setConfirmToggle(null);
  };

  const togglePermission = (pageCode: string, type: CrudPermission, checked: boolean) => {
    setMatrixDraft((prev) => {
      const next = { ...prev };
      const set = new Set(next[pageCode] ?? []);
      if (checked) set.add(type);
      else set.delete(type);
      next[pageCode] = set;
      return next;
    });
  };

  const handleSyncAll = async () => {
    if (!selectedRole?.id) return;
    try {
      await syncRolePages(
        selectedRole.id,
        Object.entries(matrixDraft).map(([pageCode, perms]) => ({ pageCode, permissions: [...perms] })),
      );
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
    }
  };

  const handleRemovePage = async (pageCode: string) => {
    if (!selectedRole?.id) return;
    try {
      await removePageFromRole(selectedRole.id, pageCode);
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
    }
  };

  const handleCopyFrom = async () => {
    if (!selectedRole?.id || !copySourceRoleId) return;
    try {
      await copyFromRole(selectedRole.id, Number(copySourceRoleId));
      setCopySourceRoleId('');
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
    }
  };

  const statusOptions = [
    { value: 'ALL', label: t('all') },
    { value: 'ACTIVE', label: t('active') },
    { value: 'INACTIVE', label: t('inactive') },
  ];

  const otherRolesOptions = excludeSelfFromCopySources(
    roleList.filter((r): r is RoleDto & { id: number } => r.id != null),
    selectedRole?.id ?? -1,
  ).map((r) => ({ value: String(r.id), label: `${r.roleName} (${r.roleCode})` }));

  const roleColumns: TableColumn<RoleDto>[] = [
    { key: 'code', header: t('code'), render: (r) => <Badge variant="neutral" size="sm">{r.roleCode}</Badge> },
    {
      key: 'name',
      header: t('name'),
      render: (r) => (
        <span style={{ fontWeight: 600, color: 'var(--text-strong, #14222F)', fontSize: '14px' }}>{r.roleName}</span>
      ),
    },
    {
      key: 'description',
      header: t('description'),
      render: (r) => (
        <span style={{ fontSize: '13px', color: 'var(--text-muted, #647488)' }}>{r.description}</span>
      ),
    },
    {
      key: 'status',
      header: t('status'),
      render: (r) => (
        <Badge variant={r.active ? 'success' : 'danger'} size="sm">
          {r.active ? t('active') : t('inactive')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: t('actions'),
      align: 'end',
      render: (r) => (
        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
          <IconButton icon="ti ti-edit" label={t('edit')} variant="ghost" size="sm" onClick={() => handleOpenEdit(r)} />
          {r.active ? (
            <Button variant="secondary" size="sm" onClick={() => setConfirmToggle({ role: r, activate: false })}>
              {t('deactivate')}
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => setConfirmToggle({ role: r, activate: true })}>
              {t('reactivate')}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Breadcrumb
            items={[
              { label: t('navOverview') },
              { label: t('groupSecurity') },
              { label: t('navRoles') },
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
            {t('secRolesTitle')}
          </h1>
        </div>
        <Button variant="primary" iconLeft={<i className="ti ti-plus" />} onClick={handleOpenCreate}>
          {t('new')}
        </Button>
      </div>

      {/* 2. Filter Bar */}
      <Card variant="flat" padding="md">
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 280px', minWidth: '220px' }}>
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                applySearch(e.target.value);
              }}
              iconLeft={<i className="ti ti-search" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
            />
          </div>
          <div style={{ width: '180px' }}>
            {/* GAP (API-SEC-026): no `active` server filter for roles — applied client-side on the loaded page only. */}
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
            />
          </div>
          {(searchText || statusFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchText('');
                setStatusFilter('ALL');
                applySearch('');
              }}
            >
              {t('clear')}
            </Button>
          )}
        </div>
      </Card>

      {errorMessage && <Alert variant="danger" message={errorMessage} />}

      {/* 3. Data Grid */}
      <Card variant="flat" padding="none">
        <Table<RoleDto>
          columns={roleColumns}
          rows={roleList}
          getRowKey={(r) => r.id!}
          isLoading={isListLoading}
          loadError={loadError}
          onRetry={retry}
          emptyIcon="ti ti-shield-x"
          emptyTitle={t('noRecordsFound')}
          emptyDescription={t('noRecordsDesc')}
          emptyAction={{ label: t('new'), onClick: handleOpenCreate }}
        />
        {!loadError && (
          <Pagination page={page} size={size} totalElements={totalElements} onPageChange={setPage} />
        )}
      </Card>

      {/* 4. Role & Permission Matrix Dialog */}
      <Dialog
        isOpen={isRoleDialogOpen}
        onClose={() => setIsRoleDialogOpen(false)}
        title={selectedRole ? `${t('edit')}: ${selectedRole.roleName}` : t('new')}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div>
              {selectedRole && (
                // TODO(SEC-FE/SCR-SEC-007): gate on ROLE_UPDATE once SEC-FE's
                // permission hooks exist (confirmed literal, securitydatascoperolebranches.md).
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsDataScopeDrawerOpen(true)}
                  iconLeft={<i className="ti ti-building" />}
                >
                  {t('dataScope')} →
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="secondary" onClick={() => setIsRoleDialogOpen(false)}>
                {t('cancel')}
              </Button>
              <Button variant="primary" onClick={handleSave} loading={isLoading}>
                {t('save')}
              </Button>
            </div>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
          <Input
            label={`${t('code')} *`}
            value={roleCode}
            onChange={(e) => setRoleCode(e.target.value.toUpperCase())}
            disabled={!!selectedRole}
            helperText={selectedRole ? t('readOnlyCodeHint') : 'e.g. ROLE_OPERATIONS_LEAD'}
            required
          />
          <Input
            label={`${t('name')} *`}
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            required
          />
          <Input
            label={t('description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Switch
            label={t('active')}
            checked={isActive}
            onChange={(checked) => setIsActive(checked)}
          />

          {/* Embedded Permission Matrix */}
          {selectedRole && (
            <div style={{ borderTop: '1px solid var(--border-subtle, #E6ECF3)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-strong, #14222F)' }}>
                  {t('permissionMatrix')}
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <Button variant="secondary" size="sm" onClick={handleSyncAll}>
                    {t('syncAll')}
                  </Button>
                  {otherRolesOptions.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <select
                        style={{
                          height: '32px',
                          fontSize: '12px',
                          borderRadius: 'var(--radius-sm, 4px)',
                          border: '1px solid var(--border-default, #B7C3D1)',
                          padding: '0 8px',
                          background: '#fff',
                        }}
                        value={copySourceRoleId}
                        onChange={(e) => setCopySourceRoleId(e.target.value)}
                      >
                        <option value="">-- {t('copyFrom')} --</option>
                        {otherRolesOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {copySourceRoleId && (
                        <Button variant="secondary" size="sm" onClick={handleCopyFrom}>
                          {t('confirm')}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ border: '1px solid var(--border-subtle, #E6ECF3)', borderRadius: 'var(--radius-md, 7px)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'start' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-page, #F8FAFC)', borderBottom: '1px solid var(--border-subtle, #E6ECF3)' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'start' }}>{t('colScreenPage')}</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>{t('canView')}</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>{t('canCreate')}</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>{t('canUpdate')}</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>{t('canDelete')}</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }} />
                    </tr>
                  </thead>
                  <tbody>
                    {(activePages.data ?? []).map((pg) => {
                      if (!pg.pageCode) return null;
                      const perms = matrixDraft[pg.pageCode];
                      const isAssigned = perms !== undefined;
                      return (
                        <tr key={pg.pageCode} style={{ borderBottom: '1px solid var(--border-subtle, #E6ECF3)' }}>
                          <td style={{ padding: '8px 12px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-strong, #14222F)' }}>{pg.nameEn}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted, #647488)' }}>{pg.pageCode}</div>
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            {/* RULE-SEC-042 — VIEW is never independently togglable; it's implied by the page being assigned. */}
                            <input type="checkbox" checked={isAssigned} disabled />
                          </td>
                          {(['CREATE', 'UPDATE', 'DELETE'] as const).map((type) => (
                            <td key={type} style={{ padding: '8px 12px', textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={perms?.has(type) ?? false}
                                onChange={(e) => togglePermission(pg.pageCode!, type, e.target.checked)}
                              />
                            </td>
                          ))}
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            {isAssigned && (
                              <IconButton
                                icon="ti ti-x"
                                label={t('delete')}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemovePage(pg.pageCode!)}
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      {/* 5. Data Scope Drawer */}
      <DataScopeDrawer
        isOpen={isDataScopeDrawerOpen}
        onClose={() => setIsDataScopeDrawerOpen(false)}
        scope={null}
        roleId={selectedRole?.id}
      />

      {/* 6. Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmToggle != null}
        onClose={() => setConfirmToggle(null)}
        onConfirm={handleConfirmToggle}
        title={t('confirmActionTitle')}
        message={`${confirmToggle?.activate ? t('confirmReactivateRolePrefix') : t('confirmDeactivateRolePrefix')} "${confirmToggle?.role.roleName}"?`}
        confirmLabel={t('confirm')}
        cancelLabel={t('cancel')}
        tone={confirmToggle?.activate ? 'primary' : 'danger'}
      />
    </div>
  );
};
