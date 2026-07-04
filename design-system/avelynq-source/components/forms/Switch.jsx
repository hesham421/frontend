export function Switch({ label, checked = false, onChange, disabled = false, id, style = {} }) {
  const fid = id || (label ? 'avl-sw-' + String(label).replace(/\s+/g, '-').toLowerCase() : undefined);
  return (
    <label htmlFor={fid} style={{
      display: 'inline-flex', alignItems: 'center', gap: '10px',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-body)', ...style,
    }}>
      <span style={{
        position: 'relative', width: '38px', height: '22px', flexShrink: 0,
        borderRadius: 'var(--radius-pill)',
        background: checked ? 'var(--brand-primary)' : 'var(--slate-300)',
        transition: 'background var(--dur-base) var(--ease-standard)',
      }}>
        <input id={fid} type="checkbox" checked={checked} onChange={onChange} disabled={disabled}
          style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', margin: 0, cursor: 'inherit' }} />
        <span style={{
          position: 'absolute', top: '3px', insetInlineStart: checked ? '19px' : '3px',
          width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
          boxShadow: 'var(--shadow-sm)', transition: 'inset-inline-start var(--dur-base) var(--ease-out)',
        }} />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
