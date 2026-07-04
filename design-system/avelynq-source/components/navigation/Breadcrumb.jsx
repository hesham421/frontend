export function Breadcrumb({ items = [], style = {} }) {
  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', ...style }}>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        const label = typeof item === 'string' ? item : item.label;
        return (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              color: last ? 'var(--text-strong)' : 'var(--text-muted)',
              fontWeight: last ? 'var(--fw-semibold)' : 'var(--fw-regular)',
              cursor: !last && item.href ? 'pointer' : 'default',
            }}>{label}</span>
            {!last && <i className="ti ti-chevron-right" style={{ color: 'var(--text-subtle)', fontSize: '13px' }} />}
          </span>
        );
      })}
    </nav>
  );
}
