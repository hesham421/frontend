import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSecurityStore } from '../../stores/useSecurityStore';
import { Breadcrumb, Dialog, EmptyState } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Stat, Badge } from '../../components/ui/DataDisplay';
import { Input, Select, Switch } from '../../components/ui/FormControls';
import { DataScopeDrawer } from '../../components/features/DataScopeDrawer';
import { AppRole, RolePermission } from '../../data/mockData';

export const RolesPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    roles,
    screens,
    roleSearch,
    roleFilterActive,
    selectedRole,
    isRoleDialogOpen,
    isDataScopeDrawerOpen,
    isConfirmDialogOpen,
    confirmActionType,
    setRoleSearch,
    setRoleFilterActive,
    openRoleDialog,
    closeRoleDialog,
    saveRole,
    updateRolePermission,
    syncAllPermissions,
    copyPermissionsFromRole,
    openDataScopeDrawer,
    closeDataScopeDrawer,
    openConfirmDialog,
    closeConfirmDialog,
    executeConfirmAction,
  } = useSecurityStore();

  const [roleCode, setRoleCode] = useState('');
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [copySourceRoleId, setCopySourceRoleId] = useState('');

  const handleOpenCreate = () => {
    setRoleCode('');
    setRoleName('');
    setDescription('');
    setIsActive(true);
    openRoleDialog(null);
  };

  const handleOpenEdit = (role: AppRole) => {
    setRoleCode(role.roleCode);
    setRoleName(role.roleName);
    setDescription(role.description);
    setIsActive(role.isActive);
    openRoleDialog(role);
  };

  const handleSave = () => {
    saveRole({
      id: selectedRole?.id,
      roleCode,
      roleName,
      description,
      isActive,
    });
  };

  const filteredRoles = roles.filter((r) => {
    const matchesSearch =
      r.roleName.toLowerCase().includes(roleSearch.toLowerCase()) ||
      r.roleCode.toLowerCase().includes(roleSearch.toLowerCase()) ||
      r.description.toLowerCase().includes(roleSearch.toLowerCase());

    const matchesStatus =
      roleFilterActive === 'ALL' ||
      (roleFilterActive === 'ACTIVE' && r.isActive) ||
      (roleFilterActive === 'INACTIVE' && !r.isActive);

    return matchesSearch && matchesStatus;
  });

  const totalRoles = roles.length;
  const activeRoles = roles.filter((r) => r.isActive).length;
  const inactiveRoles = totalRoles - activeRoles;

  const statusOptions = [
    { value: 'ALL', label: t('all') },
    { value: 'ACTIVE', label: t('active') },
    { value: 'INACTIVE', label: t('inactive') },
  ];

  const otherRolesOptions = roles
    .filter((r) => r.id !== selectedRole?.id)
    .map((r) => ({ value: r.id, label: `${r.roleName} (${r.roleCode})` }));

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

      {/* 2. KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <Stat
          label={t('totalRoles')}
          value={totalRoles}
          icon={<i className="ti ti-shield-lock" style={{ color: 'var(--brand-primary, #2466D8)', fontSize: '20px' }} />}
        />
        <Stat
          label={t('activeRecords')}
          value={activeRoles}
          trend={{ value: `${Math.round((activeRoles / (totalRoles || 1)) * 100)}%`, isPositive: true }}
          icon={<i className="ti ti-shield-check" style={{ color: 'var(--green-500, #1D9A6C)', fontSize: '20px' }} />}
        />
        <Stat
          label={t('inactiveRecords')}
          value={inactiveRoles}
          icon={<i className="ti ti-shield-x" style={{ color: 'var(--red-500, #CB3A2D)', fontSize: '20px' }} />}
        />
      </div>

      {/* 3. Filter Bar */}
      <Card variant="flat" padding="md">
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 280px', minWidth: '220px' }}>
            <Input
              placeholder={t('searchPlaceholder')}
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              iconLeft={<i className="ti ti-search" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
            />
          </div>
          <div style={{ width: '180px' }}>
            <Select
              options={statusOptions}
              value={roleFilterActive}
              onChange={(e) => setRoleFilterActive(e.target.value)}
            />
          </div>
          {(roleSearch || roleFilterActive !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRoleSearch('');
                setRoleFilterActive('ALL');
              }}
            >
              {t('clear')}
            </Button>
          )}
        </div>
      </Card>

      {/* 4. Data Grid */}
      <Card variant="flat" padding="none">
        {filteredRoles.length === 0 ? (
          <EmptyState
            icon="ti ti-shield-x"
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
                    {t('description')}
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
                {filteredRoles.map((r) => (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle, #E6ECF3)',
                      transition: 'background 120ms ease',
                    }}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <Badge variant="neutral" size="sm">
                        {r.roleCode}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-strong, #14222F)', fontSize: '14px' }}>
                      {r.roleName}
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '13px', color: 'var(--text-muted, #647488)', maxWidth: '300px' }}>
                      {r.description}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Badge variant={r.isActive ? 'success' : 'danger'} size="sm">
                        {r.isActive ? t('active') : t('inactive')}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'end' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <IconButton
                          icon="ti ti-edit"
                          label={t('edit')}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(r)}
                        />
                        {r.isActive ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openConfirmDialog('DEACTIVATE_ROLE', r.id)}
                          >
                            {t('deactivate')}
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => openConfirmDialog('ACTIVATE_ROLE', r.id)}
                          >
                            {t('reactivate')}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 5. Role & Permission Matrix Dialog */}
      <Dialog
        isOpen={isRoleDialogOpen}
        onClose={closeRoleDialog}
        title={selectedRole ? `${t('edit')}: ${selectedRole.roleName}` : t('new')}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div>
              {selectedRole && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openDataScopeDrawer(null)}
                  iconLeft={<i className="ti ti-building" />}
                >
                  {t('dataScope')} →
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="secondary" onClick={closeRoleDialog}>
                {t('cancel')}
              </Button>
              <Button variant="primary" onClick={handleSave}>
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
            onChange={(e) => setRoleCode(e.target.value)}
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
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => syncAllPermissions(selectedRole.id, true)}
                  >
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
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            copyPermissionsFromRole(selectedRole.id, copySourceRoleId);
                            setCopySourceRoleId('');
                          }}
                        >
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
                      <th style={{ padding: '8px 12px', textAlign: 'start' }}>Screen / Page</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>{t('canView')}</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>{t('canCreate')}</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>{t('canUpdate')}</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>{t('canDelete')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {screens.map((scr) => {
                      const p: RolePermission = selectedRole.permissions.find((perm) => perm.pageId === scr.id) || {
                        pageId: scr.id,
                        canView: false,
                        canCreate: false,
                        canUpdate: false,
                        canDelete: false,
                      };

                      return (
                        <tr key={scr.id} style={{ borderBottom: '1px solid var(--border-subtle, #E6ECF3)' }}>
                          <td style={{ padding: '8px 12px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-strong, #14222F)' }}>{scr.nameEn}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted, #647488)' }}>{scr.pageCode}</div>
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={p.canView}
                              onChange={(e) => updateRolePermission(selectedRole.id, scr.id, 'canView', e.target.checked)}
                            />
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={p.canCreate}
                              onChange={(e) => updateRolePermission(selectedRole.id, scr.id, 'canCreate', e.target.checked)}
                            />
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={p.canUpdate}
                              onChange={(e) => updateRolePermission(selectedRole.id, scr.id, 'canUpdate', e.target.checked)}
                            />
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={p.canDelete}
                              onChange={(e) => updateRolePermission(selectedRole.id, scr.id, 'canDelete', e.target.checked)}
                            />
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

      {/* 6. Data Scope Drawer */}
      <DataScopeDrawer
        isOpen={isDataScopeDrawerOpen}
        onClose={closeDataScopeDrawer}
        scope={null}
        roleId={selectedRole?.id}
      />

      {/* 7. Confirm Dialog */}
      <Dialog
        isOpen={isConfirmDialogOpen && (confirmActionType === 'DEACTIVATE_ROLE' || confirmActionType === 'ACTIVATE_ROLE')}
        onClose={closeConfirmDialog}
        title={t('confirmActionTitle')}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={closeConfirmDialog}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={executeConfirmAction}>
              {t('confirm')}
            </Button>
          </div>
        }
      >
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-body, #354456)' }}>
          {confirmActionType === 'DEACTIVATE_ROLE' ? t('confirmDeactivate') : t('confirmReactivate')}
        </p>
      </Dialog>
    </div>
  );
};
