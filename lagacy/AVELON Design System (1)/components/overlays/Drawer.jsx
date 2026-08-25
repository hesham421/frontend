export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  icon = null,
  iconTone = 'info',
  closeOnScrim = true,
  showClose = true,
  style = {},
}) {
  if (!open) return null;

  const tones = {
    info:    { c: 'var(--blue-600)',  bg: 'var(--info-50)' },
    success: { c: 'var(--green-600)', bg: 'var(--green-50)' },
    warning: { c: 'var(--amber-600)', bg: 'var(--amber-50)' },
    danger:  { c: 'var(--red-600)',   bg: 'var(--red-50)' },
    neutral: { c: 'var(--slate-600)', bg: 'var(--surface-sunken)' },
  };
  const t = tones[iconTone] || tones.info;

  return (
    <div className={'avl-drawer avl-drawer--' + size} role="dialog" aria-modal="true" aria-label={title || 'Side panel'} style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="avl-drawer__scrim" onClick={closeOnScrim ? onClose : undefined} />
      <div className="avl-drawer__panel" style={{
        background: 'var(--surface-card)',
        borderInlineStart: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
        ...style,
      }}>
        {(title || icon || showClose) && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
            {icon && (
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', flexShrink: 0, borderRadius: 'var(--radius-md)', background: t.bg, color: t.c, fontSize: '20px' }}>
                <i className={typeof icon === 'string' ? icon : ''}>{typeof icon !== 'string' ? icon : null}</i>
              </span>
            )}
            <div style={{ flex: 1, minWidth: 0, paddingTop: icon ? '2px' : 0 }}>
              {title && <div style={{ fontSize: 'var(--fs-title)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-strong)', letterSpacing: 'var(--ls-heading)' }}>{title}</div>}
              {subtitle && <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</div>}
            </div>
            {showClose && (
              <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '18px', lineHeight: 1, padding: '2px', flexShrink: 0 }}>
                <i className="ti ti-x" />
              </button>
            )}
          </div>
        )}

        <div className="avl-drawer__body" style={{ padding: '20px', fontSize: 'var(--fs-body)', color: 'var(--text-body)', lineHeight: 'var(--lh-normal)' }}>
          {children}
        </div>

        {footer && (
          <div className="avl-drawer__footer" style={{ padding: '14px 20px', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
