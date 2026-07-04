export function Alert({ tone = 'info', title, children, icon = null, onClose = null, style = {} }) {
  const tones = {
    info:    { c: 'var(--blue-700)',  bg: 'var(--info-50)',   bd: 'var(--blue-200)',  i: 'ti ti-info-circle' },
    success: { c: 'var(--green-700)', bg: 'var(--green-50)',  bd: '#B7E0C6',          i: 'ti ti-circle-check' },
    warning: { c: 'var(--amber-700)', bg: 'var(--amber-50)',  bd: '#E8D49B',          i: 'ti ti-alert-triangle' },
    danger:  { c: 'var(--red-700)',   bg: 'var(--red-50)',    bd: '#E6B5AE',          i: 'ti ti-alert-circle' },
  };
  const t = tones[tone] || tones.info;
  return (
    <div role="alert" style={{
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      padding: '12px 14px', background: t.bg,
      border: '1px solid ' + t.bd, borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)', ...style,
    }}>
      <i className={typeof icon === 'string' ? icon : t.i} style={{ color: t.c, fontSize: '18px', marginTop: '1px', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-sm)', color: t.c, marginBottom: children ? '2px' : 0 }}>{title}</div>}
        {children && <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-body)', lineHeight: 'var(--lh-normal)' }}>{children}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} aria-label="Dismiss" style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.c, fontSize: '16px', padding: 0, lineHeight: 1 }}>
          <i className="ti ti-x" />
        </button>
      )}
    </div>
  );
}
