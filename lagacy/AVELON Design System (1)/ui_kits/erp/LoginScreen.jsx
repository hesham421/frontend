// AVELYNQ ERP — Login screen
function LoginScreen({ onLogin, lang, onToggleLang }) {
  const { Button, Input, Checkbox } = window.AVELONDesignSystem_a21abd;
  const [role, setRole] = React.useState('approver');
  const roles = [
    { id: 'approver', label: 'Finance Approver' },
    { id: 'admin', label: 'System Admin' },
  ];
  return (
    <div className="avl-split" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Brand panel */}
      <div className="avl-split__aside" style={{ background: 'var(--navy-850)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 52px', color: '#fff' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 100% 0%, color-mix(in srgb, var(--blue-600) 30%, transparent), transparent 60%), radial-gradient(90% 70% at 0% 100%, color-mix(in srgb, var(--teal-600) 22%, transparent), transparent 60%)' }} />
        <img src="../../assets/avelynq-lockup-dark.png" alt="AVELYNQ" style={{ height: '82px', width: 'auto', position: 'relative', alignSelf: 'flex-start' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--teal-400)', marginBottom: '14px' }}>Enterprise Resource Planning</div>
          <h1 style={{ fontSize: 'clamp(27px, 4vw, 38px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.12, margin: 0 }}>Built to Grow.<br />Designed to Endure.</h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '420px', marginTop: '16px' }}>Systems built to grow — without breaking what already works.</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '26px' }}>
            {['Structure', 'Growth', 'Stability'].map((p) => (
              <span key={p} style={{ fontSize: '12px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 'var(--radius-pill)', padding: '5px 14px' }}>{p}</span>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>© 2026 AVELYNQ · Enterprise Systems</div>
      </div>

      {/* Form panel */}
      <div className="avl-split__main" style={{ background: 'var(--surface-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(24px, 5vw, 40px)' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div className="avl-only-md-down" style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '22px' }}>
            <img src="../../assets/avelynq-mark-dark.png" alt="" style={{ height: '30px', width: 'auto', background: 'var(--navy-850)', borderRadius: '7px', padding: '3px' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '20px', letterSpacing: '0.04em', color: 'var(--text-strong)' }}>AVEL<span style={{ color: 'var(--teal-500)' }}>Y</span>NQ</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button onClick={onToggleLang} style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '34px', padding: '0 12px', background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--text-body)' }}>
              <i className="ti ti-language" /> {lang === 'en' ? 'العربية' : 'English'}
            </button>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-strong)', letterSpacing: '-0.01em', margin: '0 0 4px' }}>Sign in</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 24px' }}>Access your AVELYNQ workspace.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '22px' }}>
            {roles.map((r) => (
              <button key={r.id} onClick={() => setRole(r.id)} style={{
                padding: '10px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                border: '1px solid ' + (role === r.id ? 'var(--brand-primary)' : 'var(--border-default)'),
                background: role === r.id ? 'var(--blue-50)' : '#fff',
                color: role === r.id ? 'var(--blue-700)' : 'var(--text-body)',
                fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600,
              }}>{r.label}</button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Username" iconLeft="ti ti-user" value="k.almutairi" placeholder="Enter your username" />
            <Input label="Password" type="password" iconLeft="ti ti-lock" value="••••••••••" placeholder="Enter your password" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Checkbox label="Remember me" checked />
              <a href="javascript:void(0)" style={{ fontSize: '13px', color: 'var(--text-link)', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</a>
            </div>
            <Button type="submit" block size="lg" iconRight={<i className="ti ti-arrow-right" />}>Sign in</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
Object.assign(window, { LoginScreen });
