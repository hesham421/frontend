import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { usePageRegistryFacade } from '../../pageRegistry/hooks';
import { createPageSchema, updatePageSchema, excludeSelfFromParentOptions } from '../../pageRegistry/pageRegistry.schema';
import type { PageResponse } from '../../pageRegistry/pageRegistryApi';
import { ApiError } from '../../lib/errors/ApiError';
import { Breadcrumb, Drawer, EmptyState, Alert } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Stat, Badge } from '../../components/ui/DataDisplay';
import { Input, Select, Switch } from '../../components/ui/FormControls';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

const MODULE_OPTIONS = [
  { value: 'SEC', label: 'SEC (Security)' },
  { value: 'ORG', label: 'ORG (Organization)' },
  { value: 'FILE', label: 'FILE (File Service)' },
  { value: 'NOTIF', label: 'NOTIF (Notifications)' },
  { value: 'FIN', label: 'FIN (Finance)' },
  { value: 'HR', label: 'HR (Human Resources)' },
  { value: 'INV', label: 'INV (Inventory)' },
];

export const PagesRegistryPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const { pageList, selectedPage, isLoading, kpiCounts, activePages, selectPage, setSearchFilters, createPage, updatePage, deactivatePage, reactivatePage } =
    usePageRegistryFacade();

  const [searchText, setSearchText] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [isPageDrawerOpen, setIsPageDrawerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [pageCode, setPageCode] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [route, setRoute] = useState('');
  const [icon, setIcon] = useState('ti ti-file');
  const [module, setModule] = useState('SEC');
  const [parentId, setParentId] = useState('');
  const [displayOrder, setDisplayOrder] = useState('10');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const applySearch = (text: string, moduleVal: string, status: StatusFilter) => {
    const filters = [];
    if (text) filters.push({ field: 'nameEn', operator: 'LIKE' as const, value: text });
    if (moduleVal !== 'ALL') filters.push({ field: 'module', operator: 'EQ' as const, value: moduleVal });
    if (status !== 'ALL') filters.push({ field: 'active', operator: 'EQ' as const, value: status === 'ACTIVE' });
    setSearchFilters({ filters, page: 0 });
  };

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
    setErrorMessage(null);
    selectPage(null);
    setIsPageDrawerOpen(true);
  };

  const handleOpenEdit = (scr: PageResponse) => {
    setPageCode(scr.pageCode || '');
    setNameEn(scr.nameEn || '');
    setNameAr(scr.nameAr || '');
    setRoute(scr.route || '');
    setIcon(scr.icon || 'ti ti-file');
    setModule(scr.module || 'SEC');
    setParentId(scr.parentId != null ? String(scr.parentId) : '');
    setDisplayOrder(String(scr.displayOrder ?? 10));
    setDescription(scr.description || '');
    setIsActive(scr.active ?? true);
    setErrorMessage(null);
    selectPage(scr);
    setIsPageDrawerOpen(true);
  };

  const handleSave = async () => {
    setErrorMessage(null);
    const parentIdNum = parentId ? Number(parentId) : undefined;
    const displayOrderNum = parseInt(displayOrder, 10) || 10;
    try {
      if (selectedPage?.id != null) {
        const parsed = updatePageSchema.safeParse({ nameAr, nameEn, route, icon, module, parentId: parentIdNum, displayOrder: displayOrderNum, description });
        if (!parsed.success) {
          setErrorMessage(parsed.error.issues[0]?.message ?? 'Invalid input');
          return;
        }
        await updatePage(selectedPage.id, parsed.data);
      } else {
        const parsed = createPageSchema.safeParse({
          pageCode: pageCode.toUpperCase(),
          nameAr,
          nameEn,
          route,
          icon,
          module,
          parentId: parentIdNum,
          displayOrder: displayOrderNum,
          description,
          active: isActive,
        });
        if (!parsed.success) {
          setErrorMessage(parsed.error.issues[0]?.message ?? 'Invalid input');
          return;
        }
        await createPage(parsed.data);
      }
      setIsPageDrawerOpen(false);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'An unexpected error occurred. Please try again.');
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await deactivatePage(id);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'An unexpected error occurred. Please try again.');
    }
  };

  const handleReactivate = async (id: number) => {
    try {
      await reactivatePage(id);
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'An unexpected error occurred. Please try again.');
    }
  };

  const moduleFilterOptions = [{ value: 'ALL', label: t('all') }, ...MODULE_OPTIONS];
  const statusOptions = [
    { value: 'ALL', label: t('all') },
    { value: 'ACTIVE', label: t('active') },
    { value: 'INACTIVE', label: t('inactive') },
  ];

  // Parent picker sourced from the stable active-pages list (RULE-SEC-046
  // self-reference exclusion), not the current filtered search results.
  const parentOptions = [
    { value: '', label: '-- None (Root Menu) --' },
    ...excludeSelfFromParentOptions(
      activePages.filter((p): p is PageResponse & { id: number } => p.id != null),
      selectedPage?.id,
    ).map((p) => ({ value: String(p.id), label: `${p.nameEn} (${p.pageCode})` })),
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
          value={kpiCounts.total}
          icon={<i className="ti ti-layout-grid" style={{ color: 'var(--brand-primary, #2466D8)', fontSize: '20px' }} />}
        />
        <Stat
          label={t('activeRecords')}
          value={kpiCounts.active}
          icon={<i className="ti ti-circle-check" style={{ color: 'var(--green-500, #1D9A6C)', fontSize: '20px' }} />}
        />
        <Stat
          label={t('inactiveRecords')}
          value={kpiCounts.inactive}
          icon={<i className="ti ti-circle-x" style={{ color: 'var(--red-500, #CB3A2D)', fontSize: '20px' }} />}
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
                applySearch(e.target.value, moduleFilter, statusFilter);
              }}
              iconLeft={<i className="ti ti-search" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
            />
          </div>
          <div style={{ width: '180px' }}>
            <Select
              options={moduleFilterOptions}
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                applySearch(searchText, e.target.value, statusFilter);
              }}
            />
          </div>
          <div style={{ width: '150px' }}>
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => {
                const next = e.target.value as StatusFilter;
                setStatusFilter(next);
                applySearch(searchText, moduleFilter, next);
              }}
            />
          </div>
          {(searchText || moduleFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchText('');
                setModuleFilter('ALL');
                setStatusFilter('ALL');
                applySearch('', 'ALL', 'ALL');
              }}
            >
              {t('clear')}
            </Button>
          )}
        </div>
      </Card>

      {errorMessage && <Alert variant="danger" message={errorMessage} />}

      {/* 4. Data Grid (FLAT list — no tree view per OQ-013) */}
      <Card variant="flat" padding="none">
        {pageList.length === 0 ? (
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
                {pageList.map((s) => (
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
                      <Badge variant={s.active ? 'success' : 'danger'} size="sm">
                        {s.active ? t('active') : t('inactive')}
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
                        {s.id != null &&
                          (s.active ? (
                            <Button variant="secondary" size="sm" onClick={() => handleDeactivate(s.id!)}>
                              {t('deactivate')}
                            </Button>
                          ) : (
                            <Button variant="primary" size="sm" onClick={() => handleReactivate(s.id!)}>
                              {t('reactivate')}
                            </Button>
                          ))}
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
        onClose={() => setIsPageDrawerOpen(false)}
        title={selectedPage ? `${t('edit')}: ${selectedPage.nameEn}` : t('new')}
        width="lg"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={() => setIsPageDrawerOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleSave} loading={isLoading}>
              {t('save')}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!selectedPage && <Alert variant="info" message={t('autoPermsNotice')} />}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label={`${t('code')} *`}
              value={pageCode}
              onChange={(e) => setPageCode(e.target.value.toUpperCase())}
              disabled={!!selectedPage}
              helperText={selectedPage ? t('readOnlyCodeHint') : 'e.g. SCR_FIN_LEDGER'}
              required
            />
            <Select
              label="Module *"
              options={MODULE_OPTIONS}
              value={module}
              onChange={(e) => setModule(e.target.value)}
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
            disabled={!!selectedPage}
          />
          {selectedPage && (
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted, #647488)' }}>
              {t('readOnlyCodeHint')} — {t('active')} {t('status')}: {selectedPage.active ? t('active') : t('inactive')} ({t('deactivate')}/{t('reactivate')})
            </p>
          )}
        </div>
      </Drawer>
    </div>
  );
};
