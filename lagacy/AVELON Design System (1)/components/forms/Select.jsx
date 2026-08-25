export function Select({ label, hint, error, value, onChange, options = [], placeholder = 'Select…', disabled = false, required = false, id, style = {} }) {
  const [focus, setFocus] = (React.useState ? React.useState(false) : [false, () => {}]);
  const fid = id || (label ? 'avl-sel-' + label.replace(/\s+/g, '-').toLowerCase() : undefined);
  const borderColor = error ? 'var(--red-500)' : focus ? 'var(--brand-primary)' : 'var(--border-default)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-sans)', ...style }}>
      {label && (
        <label htmlFor={fid} style={{ fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-medium)', color: 'var(--text-body)' }}>
          {label}{required && <span style={{ color: 'var(--red-500)', marginInlineStart: '3px' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <select
          id={fid} value={value} onChange={onChange} disabled={disabled}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            width: '100%', height: 'var(--control-md)', padding: '0 36px 0 12px',
            appearance: 'none', WebkitAppearance: 'none',
            background: disabled ? 'var(--surface-sunken)' : '#fff',
            border: '1px solid ' + borderColor, borderRadius: 'var(--radius-md)',
            boxShadow: focus && !error ? 'var(--focus-ring)' : 'none',
            fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)',
            color: value ? 'var(--text-strong)' : 'var(--text-subtle)',
            cursor: disabled ? 'not-allowed' : 'pointer', outline: 'none',
            transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
          }}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((o) => {
            const val = typeof o === 'string' ? o : o.value;
            const lbl = typeof o === 'string' ? o : o.label;
            return <option key={val} value={val}>{lbl}</option>;
          })}
        </select>
        <i className="ti ti-chevron-down" style={{ position: 'absolute', insetInlineEnd: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none', fontSize: '16px' }} />
      </div>
      {error
        ? <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--red-600)' }}>{error}</span>
        : hint ? <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{hint}</span> : null}
    </div>
  );
}
