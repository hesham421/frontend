import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useUserManagementFacade } from '../../users/hooks';
import type { UserDto } from '../../users/usersApi';
import { createUserSchema } from '../../users/users.schema';
import { ApiError } from '../../lib/errors/ApiError';
import { Breadcrumb, Dialog, EmptyState, Alert } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Stat, Badge, Avatar } from '../../components/ui/DataDisplay';
import { Input, Select, Switch } from '../../components/ui/FormControls';
import { UserProfileDrawer } from '../../components/features/UserProfileDrawer';
import { DataScopeDrawer } from '../../components/features/DataScopeDrawer';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export const UsersPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    userList,
    selectedUser,
    isLoading,
    roleOptions,
    kpiCounts,
    selectUser,
    setSearchFilters,
    createUser,
    updateUser,
    deleteUser,
  } = useUserManagementFacade();

  // API-SEC-015 allowed search fields: id, username, enabled, createdAt —
  // no email/name field exists server-side, so the search box only matches username.
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isDataScopeDrawerOpen, setIsDataScopeDrawerOpen] = useState(false);
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
          // User was created; only role assignment failed — surface it without retrying the create.
          setErrorMessage(
            roleAssignmentError instanceof ApiError
              ? roleAssignmentError.message
              : 'User created, but role assignment failed. Edit the user to assign roles.',
          );
          setIsUserDialogOpen(false);
          return;
        }
      }
      setIsUserDialogOpen(false);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'An unexpected error occurred. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (confirmDeleteUser?.id == null) return;
    try {
      await deleteUser(confirmDeleteUser.id);
      setConfirmDeleteUser(null);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'An unexpected error occurred. Please try again.');
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
        <Button variant="primary" iconLeft={<i className="ti ti-plus" />} onClick={handleOpenCreate}>
          {t('new')}
        </Button>
      </div>

      {/* 2. KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <Stat
          label={t('totalUsers')}
          value={kpiCounts.total}
          icon={<i className="ti ti-users" style={{ color: 'var(--brand-primary, #2466D8)', fontSize: '20px' }} />}
        />
        <Stat
          label={t('activeUsers')}
          value={kpiCounts.active}
          trend={{ value: `${Math.round((kpiCounts.active / (userList.length || 1)) * 100)}%`, isPositive: true }}
          icon={<i className="ti ti-user-check" style={{ color: 'var(--green-500, #1D9A6C)', fontSize: '20px' }} />}
        />
        <Stat
          label={t('inactiveRecords')}
          value={kpiCounts.inactive}
          icon={<i className="ti ti-user-x" style={{ color: 'var(--red-500, #CB3A2D)', fontSize: '20px' }} />}
        />
      </div>

      {/* 3. Filter Bar */}
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
              iconLeft={<i className="ti ti-search" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
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

      {/* 4. Data Grid */}
      <Card variant="flat" padding="none">
        {userList.length === 0 ? (
          <EmptyState
            icon="ti ti-users-minus"
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
                    {t('username')}
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'start' }}>
                    {t('userRoles')}
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
                {userList.map((u) => (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle, #E6ECF3)',
                      transition: 'background 120ms ease',
                    }}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar name={u.username} size="sm" />
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-strong, #14222F)' }}>
                          {u.username}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {(u.roles || []).map((roleName) => (
                          <Badge key={roleName} variant="primary" size="sm">
                            {roleName}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Badge variant={u.enabled ? 'success' : 'neutral'} size="sm">
                        {u.enabled ? t('active') : t('inactive')}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'end' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <IconButton
                          icon="ti ti-edit"
                          label={t('edit')}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(u)}
                        />
                        <IconButton
                          icon="ti ti-trash"
                          label={t('delete')}
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDeleteUser(u)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 5. Create / Edit Dialog */}
      <Dialog
        isOpen={isUserDialogOpen}
        onClose={() => setIsUserDialogOpen(false)}
        title={selectedUser ? `${t('edit')}: ${selectedUser.username}` : t('new')}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div>
              {selectedUser && (
                // TODO(SEC-FE/SCR-SEC-006, SCR-SEC-007): gate these two launch
                // actions on PERM_USER_PROFILE_*/ROLE_UPDATE once SEC-FE's
                // permission hooks exist (pageCode unconfirmed for the former,
                // OQ-SEC-FE-003; ROLE_UPDATE is a confirmed literal).
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsProfileDrawerOpen(true)}
                    iconLeft={<i className="ti ti-id" />}
                  >
                    {t('userProfile')} →
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsDataScopeDrawerOpen(true)}
                    iconLeft={<i className="ti ti-shield" />}
                    disabled={dataScopeRoleId == null}
                  >
                    {t('dataScope')} →
                  </Button>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="secondary" onClick={() => setIsUserDialogOpen(false)}>
                {t('cancel')}
              </Button>
              <Button variant="primary" onClick={handleSave} loading={isLoading}>
                {t('save')}
              </Button>
            </div>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label={`${t('username')} *`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={!!selectedUser}
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
              required
            />
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-strong, #14222F)', textAlign: 'start' }}>
              {t('userRoles')}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', background: 'var(--surface-page, #F8FAFC)', borderRadius: 'var(--radius-md, 7px)' }}>
              {roleOptions.map((r) => (
                <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={!!r.roleName && selectedRoleNames.includes(r.roleName)}
                    onChange={(e) => {
                      if (!r.roleName) return;
                      if (e.target.checked) {
                        setSelectedRoleNames([...selectedRoleNames, r.roleName]);
                      } else {
                        setSelectedRoleNames(selectedRoleNames.filter((name) => name !== r.roleName));
                      }
                    }}
                  />
                  <span>{r.roleName} ({r.roleCode})</span>
                </label>
              ))}
            </div>
          </div>

          <Switch
            label={t('active')}
            checked={enabled}
            onChange={(checked) => setEnabled(checked)}
          />
        </div>
      </Dialog>

      {/* 6. Profile & DataScope Drawers */}
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

      {/* 7. Confirmation Dialog */}
      <Dialog
        isOpen={confirmDeleteUser != null}
        onClose={() => setConfirmDeleteUser(null)}
        title={t('confirmActionTitle')}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={() => setConfirmDeleteUser(null)}>
              {t('cancel')}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              {t('delete')}
            </Button>
          </div>
        }
      >
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-body, #354456)' }}>
          {t('confirmDeleteUser')}
        </p>
      </Dialog>
    </div>
  );
};
