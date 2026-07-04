export function EmptyState({ icon = 'ti ti-database', title, message, action = null, style = {} }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '48px 24px', fontFamily: 'var(--font-sans)', ...style,
    }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '56px', height: '56px', borderRadius: 'var(--radius-xl)',
        background: 'var(--surface-sunken)', color: 'var(--text-subtle)',
        fontSize: '26px', marginBottom: '16px',
      }}>
        <i className={typeof icon === 'string' ? icon : ''}>{typeof icon !== 'string' ? icon : null}</i>
      </span>
      {title && <div style={{ fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-title)', color: 'var(--text-strong)', marginBottom: '4px' }}>{title}</div>}
      {message && <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', maxWidth: '360px', lineHeight: 'var(--lh-normal)' }}>{message}</div>}
      {action && <div style={{ marginTop: '18px' }}>{action}</div>}
    </div>
  );
}
