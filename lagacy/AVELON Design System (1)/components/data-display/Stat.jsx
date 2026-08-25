export function Stat({ label, value, delta = null, deltaTone = 'success', icon = null, accent = 'blue', style = {} }) {
  const accents = {
    blue: 'var(--blue-500)', teal: 'var(--teal-500)', slate: 'var(--slate-500)',
    amber: 'var(--amber-500)', green: 'var(--green-500)', red: 'var(--red-500)',
  };
  const deltaColors = { success: 'var(--green-600)', danger: 'var(--red-600)', neutral: 'var(--text-muted)' };
  return (
    <div style={{
      position: 'relative', background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)', padding: '18px 20px', overflow: 'hidden',
      fontFamily: 'var(--font-sans)', ...style,
    }}>
      <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: accents[accent] }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-medium)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)' }}>{label}</span>
        {icon && <i className={typeof icon === 'string' ? icon : ''} style={{ color: accents[accent], fontSize: '18px' }}>{typeof icon !== 'string' ? icon : null}</i>}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 'var(--fw-semibold)', color: 'var(--text-strong)', letterSpacing: '-0.01em' }}>{value}</span>
        {delta && (
          <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-semibold)', color: deltaColors[deltaTone] }}>{delta}</span>
        )}
      </div>
    </div>
  );
}
