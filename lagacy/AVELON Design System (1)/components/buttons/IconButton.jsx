export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  label,
  disabled = false,
  onClick,
  style = {},
  ...rest
}) {
  const dims = { sm: 30, md: 38, lg: 44 };
  const variants = {
    ghost: { background: 'transparent', color: 'var(--text-muted)', border: '1px solid transparent' },
    outline: { background: '#fff', color: 'var(--text-body)', border: '1px solid var(--border-default)' },
    solid: { background: 'var(--brand-primary)', color: '#fff', border: '1px solid transparent' },
    subtle: { background: 'var(--surface-sunken)', color: 'var(--text-body)', border: '1px solid transparent' },
  };
  const v = variants[variant] || variants.ghost;
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={'avl-iconbtn avl-iconbtn-' + variant}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dims[size] + 'px',
        height: dims[size] + 'px',
        borderRadius: 'var(--radius-md)',
        fontSize: size === 'sm' ? '15px' : '17px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)',
        ...v,
        ...style,
      }}
      {...rest}
    >
      {typeof icon === 'string' ? <i className={icon} /> : icon}
    </button>
  );
}
