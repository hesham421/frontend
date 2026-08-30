import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useUserManagementFacade } from '../../users/hooks';
import { usePermission } from '../../auth/permissions';
import type { UserDto } from '../../users/usersApi';
import { createUserSchema } from '../../users/users.schema';
import { mapApiError } from '../../lib/errors/mapApiError';
import { Breadcrumb, Drawer, Alert } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Badge, Avatar } from '../../components/ui/DataDisplay';
import { Input, Select, Switch } from '../../components/ui/FormControls';
import { Table, type TableColumn } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { UserProfileDrawer } from '../../components/features/UserProfileDrawer';
import { DataScopeDrawer } from '../../components/features/DataScopeDrawer';
import { RoleAssignmentDrawer } from '../../components/features/RoleAssignmentDrawer';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export const UsersPage: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const {
    userList,
    selectedUser,
    canCreate,
    canEdit,
    canDelete,
    isLoading,
    isListLoading,
    loadError,
    page,
    size,
    totalElements,
    roleOptions,
    selectUser,
    setSearchFilters,
    setPage,
    retry,
    createUser,
    updateUser,
    deleteUser,
  } = useUserManagementFacade();
  const { can } = usePermission();
  const canOpenProfile = can('PERM_USER_PROFILE_VIEW');
  const canOpenDataScope = can('PERM_ROLE_VIEW');
  // Editing an existing user needs UPDATE; the create-dialog branch needs CREATE.
  const canSaveUserDialog = selectedUser ? canEdit : canCreate;

  // API-SEC-015 allowed search fields: id, username, enabled, createdAt —
  // no email/name field exists server-side, so the search box only matches username.
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isDataScopeDrawerOpen, setIsDataScopeDrawerOpen] = useState(false);
  const [isRoleDrawerOpen, setIsRoleDrawerOpen] = useState(false);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<UserDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [selectedRoleNames, setSelectedRoleNames] = useState<string[]>([]);

  const applySearch = (nextText: string, nextStatus: StatusFilter) => {
    const filters = [];
    if (nextText) filters.push({ field: 'username', operator: 'LIKE' as const, value: nextText });
    if (nextStatus !== 'ALL') filters.push({ field: 'enabled', operator: 'EQ' as const, value: nextStatus === 'ACTIVE' });
    setSearchFilters({ filters, page: 0 });
  };

  const handleOpenCreate = () => {
    setUsername('');
    setPassword('');
    setEnabled(true);
    setSelectedRoleNames([]);
    setErrorMessage(null);
    selectUser(null);
    setIsUserDialogOpen(true);
  };

  const handleOpenEdit = (user: UserDto) => {
    setUsername(user.username || '');
    setPassword('');
    setEnabled(user.enabled ?? true);
    setSelectedRoleNames(user.roles || []);
    setErrorMessage(null);
    selectUser(user);
    setIsUserDialogOpen(true);
  };

  const handleSave = async () => {
    setErrorMessage(null);
    try {
      if (selectedUser?.id != null) {
        await updateUser(selectedUser.id, {
          username,
          enabled,
          roleNames: selectedRoleNames,
          ...(password ? { password } : {}),
        });
      } else {
        const parsed = createUserSchema.safeParse({ username, password });
        if (!parsed.success) {
          setErrorMessage(parsed.error.issues[0]?.message ?? 'Invalid input');
          return;
        }
        const { roleAssignmentError } = await createUser({ username, password, roleNames: selectedRoleNames });
        if (roleAssignmentError) {
          // User was created; only role assignment failed — surface the specific
          // context plus a safe, mapped reason (never the raw backend message).
          setErrorMessage(`${t('userCreatedRoleAssignFailed')} ${mapApiError(roleAssignmentError, t)}`);
          setIsUserDialogOpen(false);
          return;
        }
        showToast(t('userCreatedSuccess'), 'success');
      }
      if (selectedUser?.id != null) showToast(t('userSavedSuccess'), 'success');
      setIsUserDialogOpen(false);
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
    }
  };

  const handleDelete = async () => {
    if (confirmDeleteUser?.id == null) return;
    try {
      await deleteUser(confirmDeleteUser.id);
      showToast(t('userDeletedSuccess'), 'success');
      setConfirmDeleteUser(null);
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
      setConfirmDeleteUser(null);
    }
  };

  // First selected role's numeric id — DataScopeDrawer needs a role
  // context, and this dialog only exposes role NAMES (real API keys
  // u.roles by name, not id).
  const dataScopeRoleId = roleOptions.find((r) => r.roleName === selectedRoleNames[0])?.id;

  const statusOptions = [
    { value: 'ALL', label: t('all') },
    { value: 'ACTIVE', label: t('active') },
    { value: 'INACTIVE', label: t('inactive') },
  ];

  const userColumns: TableColumn<UserDto>[] = [
    {
      key: 'username',
      header: t('username'),
      render: (u) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Avatar name={u.username} size="sm" />
          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-strong, #14222F)' }}>{u.username}</div>
        </div>
      ),
    },
    {
      key: 'roles',
      header: t('userRoles'),
      render: (u) => (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(u.roles || []).map((roleName) => (
            <Badge key={roleName} variant="primary" size="sm">
              {roleName}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: t('status'),
      render: (u) => (
        <Badge variant={u.enabled ? 'success' : 'neutral'} size="sm">
          {u.enabled ? t('active') : t('inactive')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: t('actions'),
      align: 'end',
      render: (u) => (
        <div style={{ display: 'inline-flex', gap: '6px' }}>
          <IconButton icon="ti ti-edit" label={t('edit')} variant="ghost" size="sm" onClick={() => handleOpenEdit(u)} />
          {canDelete && (
            <IconButton icon="ti ti-trash" label={t('delete')} variant="ghost" size="sm" onClick={() => setConfirmDeleteUser(u)} />
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
              { label: t('navUsers') },
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
            {t('secUsersTitle')}
          </h1>
        </div>
        {canCreate && (
          <Button variant="primary" iconLeft={<i className="ti ti-plus" aria-hidden="true" />} onClick={handleOpenCreate}>
            {t('new')}
          </Button>
        )}
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
                applySearch(e.target.value, statusFilter);
              }}
              iconLeft={<i className="ti ti-search" aria-hidden="true" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
            />
          </div>
          <div style={{ width: '180px' }}>
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => {
                const next = e.target.value as StatusFilter;
                setStatusFilter(next);
                applySearch(searchText, next);
              }}
            />
          </div>
          {(searchText || statusFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchText('');
                setStatusFilter('ALL');
                applySearch('', 'ALL');
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
        <Table<UserDto>
          columns={userColumns}
          rows={userList}
          getRowKey={(u) => u.id!}
          isLoading={isListLoading}
          loadError={loadError}
          onRetry={retry}
          emptyIcon="ti ti-users-minus"
          emptyTitle={t('noRecordsFound')}
          emptyDescription={t('noRecordsDesc')}
          emptyAction={canCreate ? { label: t('new'), onClick: handleOpenCreate } : undefined}
        />
        {!loadError && (
          <Pagination page={page} size={size} totalElements={totalElements} onPageChange={setPage} />
        )}
      </Card>

      {/* 4. Create / Edit Drawer */}
      <Drawer
        isOpen={isUserDialogOpen}
        onClose={() => setIsUserDialogOpen(false)}
        title={selectedUser ? `${t('edit')}: ${selectedUser.username}` : t('new')}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div>
              {selectedUser && (
                // SEC-FE/SCR-SEC-006, SCR-SEC-007 — launch gates use each
                // drawer's own confirmed real literal (USER_PROFILE_VIEW,
                // ROLE_VIEW), not this screen's own canEdit/canDelete flags.
                <div style={{ display: 'flex', gap: '8px' }}>
                  {canOpenProfile && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsProfileDrawerOpen(true)}
                      iconLeft={<i className="ti ti-id" aria-hidden="true" />}
                    >
                      {t('userProfile')} →
                    </Button>
                  )}
                  {canOpenDataScope && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsDataScopeDrawerOpen(true)}
                      iconLeft={<i className="ti ti-shield" aria-hidden="true" />}
                      disabled={dataScopeRoleId == null}
                    >
                      {t('dataScope')} →
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="secondary" onClick={() => setIsUserDialogOpen(false)}>
                {t('cancel')}
              </Button>
              {canSaveUserDialog && (
                <Button variant="primary" onClick={handleSave} loading={isLoading}>
                  {t('save')}
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label={`${t('username')} *`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={!!selectedUser || !canSaveUserDialog}
            helperText={selectedUser ? t('readOnlyCodeHint') : undefined}
            required
          />
          {!selectedUser && (
            <Input
              label={`${t('password')} *`}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={!canSaveUserDialog}
              required
            />
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-strong, #14222F)', textAlign: 'start' }}>
                {t('userRoles')}
              </label>
              <span style={{ fontSize: '12px', color: 'var(--text-muted, #647488)' }}>
                {selectedRoleNames.length} {t('selected')}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                alignItems: 'center',
                minHeight: '38px',
                padding: '8px 10px',
                background: 'var(--surface-page, #F8FAFC)',
                borderRadius: 'var(--radius-md, 7px)',
              }}
            >
              {selectedRoleNames.length === 0 ? (
                <span style={{ fontSize: '13px', color: 'var(--text-muted, #647488)' }}>{t('noRolesAssigned')}</span>
              ) : (
                selectedRoleNames.map((name) => (
                  <Badge key={name} variant="primary" size="sm">
                    {name}
                  </Badge>
                ))
              )}
            </div>
            {canSaveUserDialog && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsRoleDrawerOpen(true)}
                iconLeft={<i className="ti ti-shield-plus" aria-hidden="true" />}
                style={{ marginTop: '8px' }}
              >
                {t('assignRoles')} →
              </Button>
            )}
          </div>

          <Switch
            label={t('active')}
            checked={enabled}
            onChange={(checked) => setEnabled(checked)}
            disabled={!canSaveUserDialog}
          />
        </div>
      </Drawer>

      {/* 5. Profile, DataScope & Role Assignment Drawers */}
      <UserProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        user={selectedUser}
      />
      <DataScopeDrawer
        isOpen={isDataScopeDrawerOpen}
        onClose={() => setIsDataScopeDrawerOpen(false)}
        scope={null}
        roleId={dataScopeRoleId}
      />
      <RoleAssignmentDrawer
        isOpen={isRoleDrawerOpen}
        onClose={() => setIsRoleDrawerOpen(false)}
        roleOptions={roleOptions}
        selectedRoleNames={selectedRoleNames}
        onChange={setSelectedRoleNames}
      />

      {/* 6. Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDeleteUser != null}
        onClose={() => setConfirmDeleteUser(null)}
        onConfirm={handleDelete}
        title={t('confirmActionTitle')}
        message={`${t('confirmDeleteUserPrefix')} "${confirmDeleteUser?.username}"? ${t('confirmDeleteUser')}`}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        tone="danger"
      />
    </div>
  );
};
