// AVELYNQ ERP — Account form (create / edit)
function AccountFormScreen({ onBack }) {
  const { Card, Button, Input, Select, Switch, Checkbox, Badge, Tabs, Dialog } = window.AVELONDesignSystem_a21abd;
  const [tab, setTab] = React.useState('details');
  const [confirm, setConfirm] = React.useState(false);

  const SectionTitle = ({ children, hint }) => (
    <div style={{ marginBottom: '16px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-strong)', margin: 0 }}>{children}</h3>
      {hint && <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{hint}</p>}
    </div>
  );

  return (
    <div style={{ padding: 'var(--page-pad)', fontFamily: 'var(--font-sans)', maxWidth: '980px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, padding: 0 }}>
          <i className="ti ti-arrow-left" /> Back
        </button>
        <span style={{ color: 'var(--border-default)' }}>/</span>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Finance · General Ledger · Chart of Accounts</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', rowGap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-strong)', letterSpacing: '-0.01em', margin: 0 }}>New Account</h1>
          <Badge tone="neutral" variant="outline">Draft</Badge>
        </div>
        <div className="avl-cluster">
          <Button variant="secondary" onClick={() => setConfirm(true)}>Cancel</Button>
          <Button variant="primary" iconLeft={<i className="ti ti-device-floppy" />} onClick={onBack}>Save Account</Button>
        </div>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <Tabs value={tab} onChange={setTab} tabs={[
          { id: 'details', label: 'Details', icon: 'ti ti-file-description' },
          { id: 'classification', label: 'Classification', icon: 'ti ti-category' },
          { id: 'settings', label: 'Settings', icon: 'ti ti-settings' },
        ]} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '18px' }}>
        <Card title="Identity" padding="lg">
          <SectionTitle hint="The unique code and display name used across the ledger.">Account identity</SectionTitle>
          <div className="avl-grid avl-grid--2">
            <Input label="Account Code" mono iconLeft="ti ti-hash" value="5300-0100" required hint="Format: NNNN-NNNN" />
            <Select label="Parent Account" value="5000-0000" options={[{ value: '5000-0000', label: '5000-0000 · Expenses' }]} required />
            <Input label="Account Name (EN)" value="Marketing & Advertising" required />
            <Input label="Account Name (AR)" value="التسويق والإعلان" required style={{ direction: 'rtl' }} />
          </div>
        </Card>

        <Card title="Classification" padding="lg">
          <div className="avl-grid avl-grid--3">
            <Select label="Account Type" value="Expense" required options={['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']} />
            <Select label="Currency" value="SAR" required options={['SAR', 'USD', 'EUR', 'AED']} />
            <Select label="Normal Balance" value="Debit" options={['Debit', 'Credit']} />
          </div>
        </Card>

        <Card title="Settings" padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-strong)' }}>Active</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Available for posting in the current period.</div>
              </div>
              <Switch checked />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-strong)' }}>Allow manual journals</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Users may post entries directly to this account.</div>
              </div>
              <Switch checked />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-strong)' }}>Reconcilable</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Include in period-end reconciliation.</div>
              </div>
              <Switch />
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={confirm} onClose={() => setConfirm(false)} size="sm"
        icon="ti ti-alert-triangle" iconTone="warning" title="Discard changes?" subtitle="New Account · unsaved"
        footer={<>
          <Button variant="secondary" onClick={() => setConfirm(false)}>Keep editing</Button>
          <Button variant="danger" iconLeft={<i className="ti ti-trash" />} onClick={onBack}>Discard</Button>
        </>}>
        Your edits to this account haven’t been saved. If you leave now, they will be lost.
      </Dialog>
    </div>
  );
}
Object.assign(window, { AccountFormScreen });
