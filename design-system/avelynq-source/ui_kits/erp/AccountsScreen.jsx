// AVELYNQ ERP — Chart of Accounts (list / search)
function AccountsScreen({ onOpenForm }) {
  const { Card, Button, Badge, IconButton, Input, Select, Drawer } = window.AVELONDesignSystem_a21abd;
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [detail, setDetail] = React.useState(null);
  const [query, setQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');
  const rows = window.AVL_ACCOUNTS.filter((a) =>
    (!query || a.name.toLowerCase().includes(query.toLowerCase()) || a.code.includes(query)) &&
    (!typeFilter || a.type === typeFilter)
  );

  const DetailRow = ({ k, v, mono }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{k}</span>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-strong)', fontFamily: mono ? 'var(--font-mono)' : 'inherit' }}>{v}</span>
    </div>
  );

  return (
    <div style={{ padding: 'var(--page-pad)', fontFamily: 'var(--font-sans)' }}>
      {/* Page header */}
      <div className="avl-pagehead" style={{ marginBottom: '18px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginBottom: '3px' }}>Finance · General Ledger</div>
          <h1 style={{ fontSize: 'clamp(19px, 2.4vw, 22px)', fontWeight: 700, color: 'var(--text-strong)', letterSpacing: '-0.01em', margin: 0 }}>Chart of Accounts</h1>
        </div>
        <div className="avl-cluster">
          <Button variant="secondary" size="md" iconLeft={<i className="ti ti-binary-tree" />}>Tree view</Button>
          <Button variant="secondary" size="md" iconLeft={<i className="ti ti-filter" />} onClick={() => setFiltersOpen(true)}>Filters</Button>
          <Button variant="primary" size="md" iconLeft={<i className="ti ti-plus" />} onClick={onOpenForm}>Add Account</Button>
        </div>
      </div>

      <Card padding="none">
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', rowGap: '10px', padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ flex: '1 1 240px' }}>
            <Input iconLeft="ti ti-search" placeholder="Search by code or name…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div style={{ flex: '1 1 160px', maxWidth: '220px' }}>
            <Select placeholder="All types" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={['Asset', 'Liability', 'Equity', 'Revenue', 'Expense', 'Header']} />
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{rows.length} of {window.AVL_ACCOUNTS.length}</span>
          <IconButton icon="ti ti-download" label="Export" variant="outline" />
          <IconButton icon="ti ti-refresh" label="Refresh" variant="outline" />
        </div>

        {/* Table */}
        <div className="avl-table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)' }}>
            <thead>
              <tr>
                {['Code', 'Account Name', 'Type', 'Currency', 'Balance', 'Status', ''].map((h, i) => (
                  <th key={i} style={{ textAlign: i === 4 ? 'right' : 'left', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-subtle)', padding: '11px 18px', borderBottom: '1px solid var(--border-default)', background: 'var(--surface-page)', whiteSpace: 'nowrap', position: 'sticky', top: 0 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((a, i) => (
                <tr key={a.code} onClick={() => a.type !== 'Header' && setDetail(a)} style={{ borderBottom: '1px solid var(--border-subtle)', background: a.type === 'Header' ? 'var(--surface-page)' : '#fff', cursor: a.type === 'Header' ? 'default' : 'pointer' }}
                  onMouseEnter={(e) => { if (a.type !== 'Header') e.currentTarget.style.background = 'var(--surface-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = a.type === 'Header' ? 'var(--surface-page)' : '#fff'; }}>
                  <td style={{ padding: '11px 18px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-strong)', fontWeight: a.type === 'Header' ? 600 : 400, whiteSpace: 'nowrap' }}>{a.code}</td>
                  <td style={{ padding: '11px 18px', fontSize: '14px', color: 'var(--text-strong)', fontWeight: a.type === 'Header' ? 700 : 500 }}>
                    <span style={{ paddingInlineStart: (a.level * 16) + 'px' }}>{a.name}</span>
                  </td>
                  <td style={{ padding: '11px 18px' }}><Badge tone={window.AVL_TYPE_TONE[a.type]}>{a.type}</Badge></td>
                  <td style={{ padding: '11px 18px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>{a.cur}</td>
                  <td style={{ padding: '11px 18px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500, color: a.balance == null ? 'var(--text-subtle)' : a.balance < 0 ? 'var(--red-600)' : 'var(--text-strong)' }}>{window.AVL_FMT(a.balance)}</td>
                  <td style={{ padding: '11px 18px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, color: a.status === 'Active' ? 'var(--green-600)' : 'var(--text-muted)' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: a.status === 'Active' ? 'var(--green-500)' : 'var(--slate-400)' }} />
                      {a.status}
                    </span>
                  </td>
                  <td style={{ padding: '8px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <IconButton icon="ti ti-pencil" label="Edit" variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onOpenForm(); }} />
                    <IconButton icon="ti ti-dots-vertical" label="More" variant="ghost" size="sm" onClick={(e) => e.stopPropagation()} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', padding: '12px 18px', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Showing 1–{rows.length} of {window.AVL_ACCOUNTS.length} accounts</span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <IconButton icon="ti ti-chevron-left" label="Previous" variant="outline" size="sm" />
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '30px', height: '30px', borderRadius: 'var(--radius-sm)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>1</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '30px', height: '30px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>2</span>
            <IconButton icon="ti ti-chevron-right" label="Next" variant="outline" size="sm" />
          </div>
        </div>
      </Card>

      {/* Filters — right-side panel (full-screen on phones) */}
      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} size="sm"
        icon="ti ti-filter" title="Filter accounts" subtitle="Finance · General Ledger"
        footer={<>
          <Button variant="ghost" onClick={() => { setTypeFilter(''); }}>Reset</Button>
          <Button variant="primary" iconLeft={<i className="ti ti-check" />} onClick={() => setFiltersOpen(false)}>Apply filters</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Select label="Account type" placeholder="All types" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={['Asset', 'Liability', 'Equity', 'Revenue', 'Expense', 'Header']} />
          <Select label="Status" placeholder="Any status" options={['Active', 'Inactive']} />
          <Input label="Currency" placeholder="e.g. SAR" />
          <Input label="Balance ≥" mono suffix="SAR" placeholder="0.00" />
          <Input label="Balance ≤" mono suffix="SAR" placeholder="0.00" />
        </div>
      </Drawer>

      {/* Record details — right-side panel (full-screen on phones) */}
      <Drawer open={!!detail} onClose={() => setDetail(null)} size="md"
        icon="ti ti-file-description" title={detail ? detail.name : ''} subtitle={detail ? detail.code + ' · ' + detail.type : ''}
        footer={<>
          <Button variant="secondary" onClick={() => setDetail(null)}>Close</Button>
          <Button variant="primary" iconLeft={<i className="ti ti-pencil" />} onClick={() => { setDetail(null); onOpenForm(); }}>Edit account</Button>
        </>}>
        {detail && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <Badge tone={window.AVL_TYPE_TONE[detail.type]}>{detail.type}</Badge>
              <Badge tone={detail.status === 'Active' ? 'success' : 'neutral'} icon={detail.status === 'Active' ? 'ti ti-circle-check' : 'ti ti-circle-minus'}>{detail.status}</Badge>
            </div>
            <DetailRow k="Account code" v={detail.code} mono />
            <DetailRow k="Account name" v={detail.name} />
            <DetailRow k="Type" v={detail.type} />
            <DetailRow k="Currency" v={detail.cur} mono />
            <DetailRow k="Balance" v={window.AVL_FMT(detail.balance)} mono />
            <DetailRow k="Status" v={detail.status} />
          </div>
        )}
      </Drawer>
    </div>
  );
}
Object.assign(window, { AccountsScreen });
