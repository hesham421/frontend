import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSecurityStore } from '../../stores/useSecurityStore';
import { Breadcrumb, Dialog, EmptyState } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Stat, Badge, Avatar } from '../../components/ui/DataDisplay';
import { Input, Select, Switch } from '../../components/ui/FormControls';
import { UserProfileDrawer } from '../../components/features/UserProfileDrawer';
import { DataScopeDrawer } from '../../components/features/DataScopeDrawer';
import { AppUser } from '../../data/mockData';

export const UsersPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const {
    users,
    roles,
    userSearch,
    userFilterEnabled,
    selectedUser,
    isUserDialogOpen,
    isProfileDrawerOpen,
    isDataScopeDrawerOpen,
    isConfirmDialogOpen,
    confirmActionType,
    setUserSearch,
    setUserFilterEnabled,
    openUserDialog,
    closeUserDialog,
    saveUser,
    openProfileDrawer,
    closeProfileDrawer,
    openDataScopeDrawer,
    closeDataScopeDrawer,
    openConfirmDialog,
    closeConfirmDialog,
    executeConfirmAction,
  } = useSecurityStore();

  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  const handleOpenCreate = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setEnabled(true);
    setSelectedRoleIds(['role-2']);
    openUserDialog(null);
  };

  const handleOpenEdit = (user: AppUser) => {
    setUsername(user.username);
    setEmail(user.email);
    setPassword('');
    setEnabled(user.enabled);
    setSelectedRoleIds(user.roles || []);
    openUserDialog(user);
  };

  const handleSave = () => {
    saveUser({
      id: selectedUser?.id,
      username,
      email,
      enabled,
      roles: selectedRoleIds,
    });
  };

  // Filter logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.profile?.fullNameEn && u.profile.fullNameEn.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.profile?.fullNameAr && u.profile.fullNameAr.includes(userSearch));

    const matchesStatus =
      userFilterEnabled === 'ALL' ||
      (userFilterEnabled === 'ACTIVE' && u.enabled) ||
      (userFilterEnabled === 'INACTIVE' && !u.enabled);

    return matchesSearch && matchesStatus;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.enabled).length;
  const inactiveUsers = totalUsers - activeUsers;

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
          value={totalUsers}
          icon={<i className="ti ti-users" style={{ color: 'var(--brand-primary, #2466D8)', fontSize: '20px' }} />}
        />
        <Stat
          label={t('activeUsers')}
          value={activeUsers}
          trend={{ value: `${Math.round((activeUsers / (totalUsers || 1)) * 100)}%`, isPositive: true }}
          icon={<i className="ti ti-user-check" style={{ color: 'var(--green-500, #1D9A6C)', fontSize: '20px' }} />}
        />
        <Stat
          label={t('inactiveRecords')}
          value={inactiveUsers}
          icon={<i className="ti ti-user-x" style={{ color: 'var(--red-500, #CB3A2D)', fontSize: '20px' }} />}
        />
      </div>

      {/* 3. Filter Bar */}
      <Card variant="flat" padding="md">
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 280px', minWidth: '220px' }}>
            <Input
              placeholder={t('searchPlaceholder')}
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              iconLeft={<i className="ti ti-search" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
            />
          </div>
          <div style={{ width: '180px' }}>
            <Select
              options={statusOptions}
              value={userFilterEnabled}
              onChange={(e) => setUserFilterEnabled(e.target.value)}
            />
          </div>
          {(userSearch || userFilterEnabled !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setUserSearch('');
                setUserFilterEnabled('ALL');
              }}
            >
              {t('clear')}
            </Button>
          )}
        </div>
      </Card>

      {/* 4. Data Grid */}
      <Card variant="flat" padding="none">
        {filteredUsers.length === 0 ? (
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
                    {t('email')}
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
                {filteredUsers.map((u) => {
                  const displayName = lang === 'ar' ? u.profile?.fullNameAr || u.username : u.profile?.fullNameEn || u.username;
                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle, #E6ECF3)',
                        transition: 'background 120ms ease',
                      }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Avatar name={displayName} size="sm" />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-strong, #14222F)' }}>
                              {displayName}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted, #647488)' }}>
                              @{u.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: 'var(--text-body, #354456)' }}>
                        {u.email}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {(u.roles || []).map((roleId) => {
                            const r = roles.find((item) => item.id === roleId);
                            return (
                              <Badge key={roleId} variant="primary" size="sm">
                                {r ? r.roleName : roleId}
                              </Badge>
                            );
                          })}
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
                            onClick={() => openConfirmDialog('DELETE_USER', u.id)}
                          />
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

      {/* 5. Create / Edit Dialog */}
      <Dialog
        isOpen={isUserDialogOpen}
        onClose={closeUserDialog}
        title={selectedUser ? `${t('edit')}: ${selectedUser.username}` : t('new')}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div>
              {selectedUser && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openProfileDrawer(selectedUser)}
                    iconLeft={<i className="ti ti-id" />}
                  >
                    {t('userProfile')} →
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openDataScopeDrawer(null)}
                    iconLeft={<i className="ti ti-shield" />}
                  >
                    {t('dataScope')} →
                  </Button>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="secondary" onClick={closeUserDialog}>
                {t('cancel')}
              </Button>
              <Button variant="primary" onClick={handleSave}>
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
          <Input
            label={`${t('email')} *`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              {roles.map((r) => (
                <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={selectedRoleIds.includes(r.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRoleIds([...selectedRoleIds, r.id]);
                      } else {
                        setSelectedRoleIds(selectedRoleIds.filter((id) => id !== r.id));
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
        onClose={closeProfileDrawer}
        user={selectedUser}
      />
      <DataScopeDrawer
        isOpen={isDataScopeDrawerOpen}
        onClose={closeDataScopeDrawer}
        scope={null}
      />

      {/* 7. Confirmation Dialog */}
      <Dialog
        isOpen={isConfirmDialogOpen && confirmActionType === 'DELETE_USER'}
        onClose={closeConfirmDialog}
        title={t('confirmActionTitle')}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={closeConfirmDialog}>
              {t('cancel')}
            </Button>
            <Button variant="danger" onClick={executeConfirmAction}>
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
