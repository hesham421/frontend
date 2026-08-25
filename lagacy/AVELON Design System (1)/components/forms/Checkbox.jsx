export function Checkbox({ label, checked = false, onChange, disabled = false, indeterminate = false, id, style = {} }) {
  const fid = id || (label ? 'avl-cb-' + String(label).replace(/\s+/g, '-').toLowerCase() : undefined);
  const on = checked || indeterminate;
  return (
    <label htmlFor={fid} style={{
      display: 'inline-flex', alignItems: 'center', gap: '9px',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-body)', ...style,
    }}>
      <span style={{
        position: 'relative', width: '18px', height: '18px', flexShrink: 0,
        borderRadius: 'var(--radius-xs)',
        border: '1.5px solid ' + (on ? 'var(--brand-primary)' : 'var(--border-strong)'),
        background: on ? 'var(--brand-primary)' : '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard)',
      }}>
        <input id={fid} type="checkbox" checked={checked} onChange={onChange} disabled={disabled}
          style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', margin: 0, cursor: 'inherit' }} />
        {indeterminate
          ? <span style={{ width: '9px', height: '2px', background: '#fff', borderRadius: '1px' }} />
          : on && <i className="ti ti-check" style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }} />}
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
