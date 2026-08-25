// AVELYNQ ERP — Dashboard screen
function DashboardScreen({ onNavigate }) {
  const { Card, Stat, Badge, Button } = window.AVELONDesignSystem_a21abd;
  const modules = [
    { id: 'accounts', label: 'Chart of Accounts', desc: 'General ledger structure', icon: 'ti ti-calculator', accent: 'var(--blue-500)' },
    { id: 'journals', label: 'Journals', desc: 'Post and review entries', icon: 'ti ti-book', accent: 'var(--teal-500)' },
    { id: 'users', label: 'User Management', desc: 'Accounts and access', icon: 'ti ti-users', accent: 'var(--slate-500)' },
    { id: 'roles', label: 'Roles & Access', desc: 'Permission control', icon: 'ti ti-shield-lock', accent: 'var(--blue-700)' },
    { id: 'master', label: 'Master Data', desc: 'Lookups and references', icon: 'ti ti-database', accent: 'var(--teal-600)' },
    { id: 'reports', label: 'Reports', desc: 'Financial statements', icon: 'ti ti-chart-bar', accent: 'var(--amber-600)' },
  ];
  return (
    <div style={{ padding: 'var(--page-pad)', fontFamily: 'var(--font-sans)', maxWidth: '1280px' }}>
      {/* Welcome banner */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--navy-850)', borderRadius: 'var(--radius-xl)', padding: '26px 30px', marginBottom: '22px', color: '#fff' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(80% 120% at 100% 0%, color-mix(in srgb, var(--blue-600) 34%, transparent), transparent 55%), radial-gradient(60% 100% at 92% 100%, color-mix(in srgb, var(--teal-600) 24%, transparent), transparent 60%)' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', rowGap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--teal-400)', marginBottom: '8px' }}>Wednesday · 13 June 2026</div>
            <h1 style={{ fontSize: 'clamp(22px, 3.4vw, 28px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 6px' }}>Welcome back, Khalid</h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.68)', margin: 0 }}>Your enterprise overview. Period <strong style={{ color: '#fff', fontWeight: 600 }}>FY26 · Q2</strong> is open for posting.</p>
          </div>
          <Button variant="inverse" iconLeft={<i className="ti ti-file-plus" />}>New Journal</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="avl-grid avl-grid--stats" style={{ marginBottom: '24px' }}>
        <Stat label="Total Assets" value="48.2M" delta="+3.1%" accent="blue" icon="ti ti-building-bank" />
        <Stat label="Open Journals" value="1,284" delta="+12 today" accent="teal" icon="ti ti-book" />
        <Stat label="Pending Approval" value="37" delta="-5" deltaTone="success" accent="amber" icon="ti ti-clock-hour-4" />
        <Stat label="Period Variance" value="2.4%" delta="within target" deltaTone="neutral" accent="slate" icon="ti ti-activity" />
      </div>

      <div className="avl-grid avl-grid--split">
        {/* Quick access */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-strong)', margin: 0 }}>Quick Access</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Based on your permissions</span>
          </div>
          <div className="avl-grid avl-grid--2" style={{ gap: '12px' }}>
            {modules.map((m) => (
              <button key={m.id} onClick={() => onNavigate(m.id)} style={{
                display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left',
                background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)', padding: '16px', cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)', transition: 'box-shadow var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard)',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'color-mix(in srgb, ' + m.accent + ' 12%, transparent)', color: m.accent, fontSize: '20px', flexShrink: 0 }}>
                  <i className={m.icon} />
                </span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-strong)' }}>{m.label}</span>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{m.desc}</span>
                </span>
                <i className="ti ti-chevron-right" style={{ color: 'var(--text-subtle)' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Activity */}
        <Card title="Recent Activity" actions={<a href="javascript:void(0)" style={{ fontSize: '12px', color: 'var(--text-link)', textDecoration: 'none', fontWeight: 500 }}>View all</a>} padding="none">
          <div>
            {window.AVL_ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '13px 18px', borderBottom: i < window.AVL_ACTIVITY.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '50%', background: 'color-mix(in srgb, ' + a.tone + ' 12%, transparent)', color: a.tone, fontSize: '15px', flexShrink: 0 }}>
                  <i className={a.icon} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: 1.4 }}>{a.text}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '3px' }}>{a.who} · {a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
Object.assign(window, { DashboardScreen });
