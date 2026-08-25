import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSecurityStore } from '../../stores/useSecurityStore';
import { Breadcrumb, Drawer, EmptyState, Alert } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Stat, Badge } from '../../components/ui/DataDisplay';
import { Input, Select, Switch } from '../../components/ui/FormControls';
import { AppScreen } from '../../data/mockData';

export const PagesRegistryPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const {
    screens,
    pageSearch,
    pageModuleFilter,
    pageFilterActive,
    selectedScreen,
    isPageDrawerOpen,
    setPageSearch,
    setPageModuleFilter,
    setPageFilterActive,
    openPageDrawer,
    closePageDrawer,
    savePage,
    deactivatePage,
    reactivatePage,
  } = useSecurityStore();

  const [pageCode, setPageCode] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [route, setRoute] = useState('');
  const [icon, setIcon] = useState('ti-file');
  const [module, setModule] = useState<AppScreen['module']>('SEC');
  const [parentId, setParentId] = useState('');
  const [displayOrder, setDisplayOrder] = useState('10');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleOpenCreate = () => {
    setPageCode('SCR_');
    setNameEn('');
    setNameAr('');
    setRoute('/system/');
    setIcon('ti ti-file');
    setModule('SEC');
    setParentId('');
    setDisplayOrder('10');
    setDescription('');
    setIsActive(true);
    openPageDrawer(null);
  };

  const handleOpenEdit = (scr: AppScreen) => {
    setPageCode(scr.pageCode);
    setNameEn(scr.nameEn);
    setNameAr(scr.nameAr);
    setRoute(scr.route);
    setIcon(scr.icon || 'ti ti-file');
    setModule(scr.module);
    setParentId(scr.parentId || '');
    setDisplayOrder(String(scr.displayOrder || 10));
    setDescription(scr.description || '');
    setIsActive(scr.isActive);
    openPageDrawer(scr);
  };

  const handleSave = () => {
    savePage({
      id: selectedScreen?.id,
      pageCode: pageCode.toUpperCase(),
      nameEn,
      nameAr,
      route,
      icon,
      module,
      parentId: parentId || undefined,
      displayOrder: parseInt(displayOrder, 10) || 10,
      description,
      isActive,
    });
  };

  const filteredScreens = screens.filter((s) => {
    const matchesSearch =
      s.pageCode.toLowerCase().includes(pageSearch.toLowerCase()) ||
      s.nameEn.toLowerCase().includes(pageSearch.toLowerCase()) ||
      s.nameAr.includes(pageSearch) ||
      s.route.toLowerCase().includes(pageSearch.toLowerCase());

    const matchesModule = pageModuleFilter === 'ALL' || s.module === pageModuleFilter;
    const matchesStatus =
      pageFilterActive === 'ALL' ||
      (pageFilterActive === 'ACTIVE' && s.isActive) ||
      (pageFilterActive === 'INACTIVE' && !s.isActive);

    return matchesSearch && matchesModule && matchesStatus;
  });

  const moduleOptions = [
    { value: 'ALL', label: t('all') },
    { value: 'SEC', label: 'SEC (Security)' },
    { value: 'ORG', label: 'ORG (Organization)' },
    { value: 'FILE', label: 'FILE (File Service)' },
    { value: 'NOTIF', label: 'NOTIF (Notifications)' },
    { value: 'FIN', label: 'FIN (Finance)' },
    { value: 'HR', label: 'HR (Human Resources)' },
    { value: 'INV', label: 'INV (Inventory)' },
  ];

  const statusOptions = [
    { value: 'ALL', label: t('all') },
    { value: 'ACTIVE', label: t('active') },
    { value: 'INACTIVE', label: t('inactive') },
  ];

  const parentOptions = [
    { value: '', label: '-- None (Root Menu) --' },
    ...screens
      .filter((s) => s.id !== selectedScreen?.id)
      .map((s) => ({ value: s.id, label: `${s.nameEn} (${s.pageCode})` })),
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
              { label: t('navPages') },
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
            {t('secPagesTitle')}
          </h1>
        </div>
        <Button variant="primary" iconLeft={<i className="ti ti-plus" />} onClick={handleOpenCreate}>
          {t('new')}
        </Button>
      </div>

      {/* 2. KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <Stat
          label={t('totalRecords')}
          value={screens.length}
          icon={<i className="ti ti-layout-grid" style={{ color: 'var(--brand-primary, #2466D8)', fontSize: '20px' }} />}
        />
        <Stat
          label={t('activeRecords')}
          value={screens.filter((s) => s.isActive).length}
          icon={<i className="ti ti-circle-check" style={{ color: 'var(--green-500, #1D9A6C)', fontSize: '20px' }} />}
        />
        <Stat
          label={t('inactiveRecords')}
          value={screens.filter((s) => !s.isActive).length}
          icon={<i className="ti ti-circle-x" style={{ color: 'var(--red-500, #CB3A2D)', fontSize: '20px' }} />}
        />
      </div>

      {/* 3. Filter Bar */}
      <Card variant="flat" padding="md">
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 280px', minWidth: '220px' }}>
            <Input
              placeholder={t('searchPlaceholder')}
              value={pageSearch}
              onChange={(e) => setPageSearch(e.target.value)}
              iconLeft={<i className="ti ti-search" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
            />
          </div>
          <div style={{ width: '180px' }}>
            <Select
              options={moduleOptions}
              value={pageModuleFilter}
              onChange={(e) => setPageModuleFilter(e.target.value)}
            />
          </div>
          <div style={{ width: '150px' }}>
            <Select
              options={statusOptions}
              value={pageFilterActive}
              onChange={(e) => setPageFilterActive(e.target.value)}
            />
          </div>
          {(pageSearch || pageModuleFilter !== 'ALL' || pageFilterActive !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPageSearch('');
                setPageModuleFilter('ALL');
                setPageFilterActive('ALL');
              }}
            >
              {t('clear')}
            </Button>
          )}
        </div>
      </Card>

      {/* 4. Data Grid (FLAT list — no tree view per OQ-013) */}
      <Card variant="flat" padding="none">
        {filteredScreens.length === 0 ? (
          <EmptyState
            icon="ti ti-layout-off"
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
                    Module
                  </th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'start' }}>
                    Route URL
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
                {filteredScreens.map((s) => (
                  <tr
                    key={s.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle, #E6ECF3)',
                      transition: 'background 120ms ease',
                    }}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <Badge variant="neutral" size="sm">
                        {s.pageCode}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className={s.icon || 'ti ti-file'} style={{ color: 'var(--brand-primary, #2466D8)' }} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-strong, #14222F)', fontSize: '14px' }}>
                            {lang === 'ar' ? s.nameAr : s.nameEn}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted, #647488)' }}>
                            {lang === 'ar' ? s.nameEn : s.nameAr}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Badge variant="primary" size="sm">
                        {s.module}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono, monospace)', fontSize: '13px', color: 'var(--text-body, #354456)' }}>
                      {s.route}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Badge variant={s.isActive ? 'success' : 'danger'} size="sm">
                        {s.isActive ? t('active') : t('inactive')}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'end' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <IconButton
                          icon="ti ti-edit"
                          label={t('edit')}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(s)}
                        />
                        {s.isActive ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => deactivatePage(s.id)}
                          >
                            {t('deactivate')}
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => reactivatePage(s.id)}
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

      {/* 5. Drawer for Screen Details */}
      <Drawer
        isOpen={isPageDrawerOpen}
        onClose={closePageDrawer}
        title={selectedScreen ? `${t('edit')}: ${selectedScreen.nameEn}` : t('new')}
        width="lg"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={closePageDrawer}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {t('save')}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!selectedScreen && (
            <Alert variant="info" message={t('autoPermsNotice')} />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label={`${t('code')} *`}
              value={pageCode}
              onChange={(e) => setPageCode(e.target.value.toUpperCase())}
              disabled={!!selectedScreen}
              helperText={selectedScreen ? t('readOnlyCodeHint') : 'e.g. SCR_FIN_LEDGER'}
              required
            />
            <Select
              label="Module *"
              options={moduleOptions.filter((m) => m.value !== 'ALL')}
              value={module}
              onChange={(e) => setModule(e.target.value as AppScreen['module'])}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
            <Input
              label="Route Path *"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              placeholder="/security/roles"
              required
            />
            <Input
              label="Icon (Tabler class)"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="ti ti-shield"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
            <Select
              label="Parent Menu Node"
              options={parentOptions}
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            />
            <Input
              label="Display Order"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
            />
          </div>

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
        </div>
      </Drawer>
    </div>
  );
};
