export function Tabs({ tabs = [], value, onChange, style = {} }) {
  const [internal, setInternal] = (React.useState ? React.useState(tabs[0] && (tabs[0].id || tabs[0])) : [value, () => {}]);
  const active = value !== undefined ? value : internal;
  const setActive = (id) => { if (onChange) onChange(id); if (value === undefined) setInternal(id); };
  return (
    <div className="avl-tabs" style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-subtle)', fontFamily: 'var(--font-sans)', overflowX: 'auto', flexWrap: 'nowrap', scrollbarWidth: 'none', msOverflowStyle: 'none', ...style }}>
      {tabs.map((tab) => {
        const id = tab.id || tab;
        const label = tab.label || tab;
        const isActive = id === active;
        return (
          <button
            key={id}
            onClick={() => setActive(id)}
            style={{
              position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 14px', fontFamily: 'var(--font-sans)', flexShrink: 0, whiteSpace: 'nowrap',
              fontSize: 'var(--fs-body)', fontWeight: isActive ? 'var(--fw-semibold)' : 'var(--fw-medium)',
              color: isActive ? 'var(--text-strong)' : 'var(--text-muted)',
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              transition: 'color var(--dur-fast) var(--ease-standard)',
            }}
          >
            {tab.icon && <i className={tab.icon} />}
            {label}
            {tab.count != null && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-2xs)', fontWeight: 600, color: isActive ? 'var(--brand-primary)' : 'var(--text-subtle)', background: isActive ? 'var(--blue-50)' : 'var(--surface-sunken)', padding: '1px 6px', borderRadius: 'var(--radius-pill)' }}>{tab.count}</span>
            )}
            <span style={{
              position: 'absolute', left: '10px', right: '10px', bottom: '-1px', height: '2px',
              background: isActive ? 'var(--brand-primary)' : 'transparent', borderRadius: '2px 2px 0 0',
            }} />
          </button>
        );
      })}
    </div>
  );
}
