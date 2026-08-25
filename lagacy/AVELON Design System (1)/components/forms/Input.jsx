export function Input({
  label, hint, error, value, onChange, placeholder, type = 'text',
  iconLeft = null, suffix = null, disabled = false, readOnly = false,
  required = false, mono = false, id, style = {}, ...rest
}) {
  const [focus, setFocus] = (React.useState ? React.useState(false) : [false, () => {}]);
  const fid = id || (label ? 'avl-' + label.replace(/\s+/g, '-').toLowerCase() : undefined);
  const borderColor = error ? 'var(--red-500)' : focus ? 'var(--brand-primary)' : 'var(--border-default)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-sans)', ...style }}>
      {label && (
        <label htmlFor={fid} style={{ fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-medium)', color: 'var(--text-body)', letterSpacing: '0.01em' }}>
          {label}{required && <span style={{ color: 'var(--red-500)', marginInlineStart: '3px' }}>*</span>}
        </label>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        height: 'var(--control-md)', padding: '0 12px',
        background: disabled ? 'var(--surface-sunken)' : '#fff',
        border: '1px solid ' + borderColor,
        borderRadius: 'var(--radius-md)',
        boxShadow: focus && !error ? 'var(--focus-ring)' : 'none',
        transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
      }}>
        {iconLeft && <i className={typeof iconLeft === 'string' ? iconLeft : ''} style={{ color: 'var(--text-subtle)', fontSize: '16px' }}>{typeof iconLeft !== 'string' ? iconLeft : null}</i>}
        <input
          id={fid} type={type} value={value} onChange={onChange} placeholder={placeholder}
          disabled={disabled} readOnly={readOnly} required={required}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
            fontSize: 'var(--fs-body)', color: 'var(--text-strong)', height: '100%',
          }}
          {...rest}
        />
        {suffix && <span style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', whiteSpace: 'nowrap' }}>{suffix}</span>}
      </div>
      {error
        ? <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--red-600)' }}>{error}</span>
        : hint ? <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{hint}</span> : null}
    </div>
  );
}
