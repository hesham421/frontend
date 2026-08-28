import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { usePageRegistryFacade } from '../../pageRegistry/hooks';
import { createPageSchema, updatePageSchema, excludeSelfFromParentOptions } from '../../pageRegistry/pageRegistry.schema';
import type { PageResponse } from '../../pageRegistry/pageRegistryApi';
import { mapApiError } from '../../lib/errors/mapApiError';
import { Breadcrumb, Drawer, Alert } from '../../components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, Badge } from '../../components/ui/DataDisplay';
import { Input, Select, Switch } from '../../components/ui/FormControls';
import { Table, type TableColumn } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';

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
  const { showToast } = useToast();
  const {
    pageList,
    selectedPage,
    isLoading,
    isListLoading,
    loadError,
    page: pageNum,
    size,
    totalElements,
    activePages,
    selectPage,
    setSearchFilters,
    setPage,
    retry,
    createPage,
    updatePage,
    deactivatePage,
    reactivatePage,
  } = usePageRegistryFacade();

  const [searchText, setSearchText] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [isPageDrawerOpen, setIsPageDrawerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<{ page: PageResponse; activate: boolean } | null>(null);

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
        showToast(t('pageSavedSuccess'), 'success');
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
        showToast(t('pageCreatedSuccess'), 'success');
      }
      setIsPageDrawerOpen(false);
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
    }
  };

  const handleConfirmToggle = async () => {
    if (!confirmToggle?.page.id) return;
    try {
      if (confirmToggle.activate) {
        await reactivatePage(confirmToggle.page.id);
        showToast(t('pageReactivatedSuccess'), 'success');
      } else {
        await deactivatePage(confirmToggle.page.id);
        showToast(t('pageDeactivatedSuccess'), 'success');
      }
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
    }
    setConfirmToggle(null);
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

  // Single-line ellipsis truncation with the full value in `title` — a fixed
  // row height reads far better in a dense registry than the previous
  // unconstrained wrapping, which made every row a different height.
  const truncateStyle: React.CSSProperties = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };

  const pageColumns: TableColumn<PageResponse>[] = [
    {
      key: 'code',
      header: t('code'),
      width: '190px',
      render: (s) => <Badge variant="neutral" size="sm">{s.pageCode}</Badge>,
    },
    {
      key: 'name',
      header: t('name'),
      width: '260px',
      render: (s) => {
        const primary = lang === 'ar' ? s.nameAr : s.nameEn;
        const secondary = lang === 'ar' ? s.nameEn : s.nameAr;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <i className={s.icon || 'ti ti-file'} style={{ color: 'var(--brand-primary, #2466D8)', flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-strong, #14222F)', fontSize: '14px', ...truncateStyle }} title={primary}>
                {primary}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted, #647488)', ...truncateStyle }} title={secondary}>
                {secondary}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'module',
      header: t('colModule'),
      width: '120px',
      render: (s) => <Badge variant="primary" size="sm">{s.module}</Badge>,
    },
    {
      key: 'route',
      header: t('colRouteUrl'),
      width: '220px',
      render: (s) => (
        <span
          style={{ display: 'block', fontFamily: 'var(--font-mono, monospace)', fontSize: '13px', color: 'var(--text-body, #354456)', ...truncateStyle }}
          title={s.route}
        >
          {s.route}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('status'),
      width: '100px',
      render: (s) => (
        <Badge variant={s.active ? 'success' : 'danger'} size="sm">
          {s.active ? t('active') : t('inactive')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: t('actions'),
      align: 'end',
      width: '150px',
      render: (s) => (
        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
          <IconButton icon="ti ti-edit" label={t('edit')} variant="ghost" size="sm" onClick={() => handleOpenEdit(s)} />
          {s.id != null &&
            (s.active ? (
              <Button variant="secondary" size="sm" onClick={() => setConfirmToggle({ page: s, activate: false })}>
                {t('deactivate')}
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => setConfirmToggle({ page: s, activate: true })}>
                {t('reactivate')}
              </Button>
            ))}
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

      {/* 2. Filter Bar */}
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

      {/* 3. Data Grid (FLAT list — no tree view per OQ-013) */}
      <Card variant="flat" padding="none">
        <Table<PageResponse>
          columns={pageColumns}
          rows={pageList}
          getRowKey={(s) => s.id!}
          isLoading={isListLoading}
          loadError={loadError}
          onRetry={retry}
          emptyIcon="ti ti-layout-off"
          emptyTitle={t('noRecordsFound')}
          emptyDescription={t('noRecordsDesc')}
          emptyAction={{ label: t('new'), onClick: handleOpenCreate }}
        />
        {!loadError && (
          <Pagination page={pageNum} size={size} totalElements={totalElements} onPageChange={setPage} />
        )}
      </Card>

      {/* 4. Drawer for Screen Details */}
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
              label={`${t('colModule')} *`}
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
              label={`${t('colRouteUrl')} *`}
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

      {/* 5. Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmToggle != null}
        onClose={() => setConfirmToggle(null)}
        onConfirm={handleConfirmToggle}
        title={t('confirmActionTitle')}
        message={`${confirmToggle?.activate ? t('confirmReactivatePagePrefix') : t('confirmDeactivatePagePrefix')} "${confirmToggle?.page.nameEn}"?`}
        confirmLabel={t('confirm')}
        cancelLabel={t('cancel')}
        tone={confirmToggle?.activate ? 'primary' : 'danger'}
      />
    </div>
  );
};
