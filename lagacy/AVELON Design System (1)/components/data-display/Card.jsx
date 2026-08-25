export function Card({ children, title, subtitle, actions = null, padding = 'md', header = null, footer = null, hover = false, style = {} }) {
  const pads = { none: '0', sm: '14px', md: '20px', lg: '24px' };
  const [h, setH] = (typeof React !== 'undefined' && React.useState) ? React.useState(false) : [false, () => {}];
  return (
    <div
      onMouseEnter={() => hover && setH(true)}
      onMouseLeave={() => hover && setH(false)}
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: h ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transition: 'box-shadow var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard)',
        transform: h ? 'translateY(-2px)' : 'none',
        overflow: 'hidden',
        ...style,
      }}
    >
      {(title || header || actions) && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: '8px',
          gap: '12px', padding: '14px 20px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          {header || (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-title)', color: 'var(--text-strong)', letterSpacing: 'var(--ls-heading)' }}>{title}</div>
              {subtitle && <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</div>}
            </div>
          )}
          {actions && <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>{actions}</div>}
        </div>
      )}
      <div style={{ padding: pads[padding], fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-body)' }}>{children}</div>
      {footer && (
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-card)' }}>{footer}</div>
      )}
    </div>
  );
}
