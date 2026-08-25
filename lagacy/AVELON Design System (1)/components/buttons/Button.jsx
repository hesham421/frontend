export function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft = null,
  iconRight = null,
  block = false,
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { height: 'var(--control-sm)', padding: '0 12px', fontSize: 'var(--fs-sm)', gap: '6px' },
    md: { height: 'var(--control-md)', padding: '0 16px', fontSize: 'var(--fs-body)', gap: '8px' },
    lg: { height: 'var(--control-lg)', padding: '0 22px', fontSize: 'var(--fs-h4)', gap: '8px' },
  };
  const variants = {
    primary: { background: 'var(--brand-primary)', color: '#fff', border: '1px solid transparent' },
    accent: { background: 'var(--brand-accent)', color: '#fff', border: '1px solid transparent' },
    secondary: { background: '#fff', color: 'var(--text-body)', border: '1px solid var(--border-default)' },
    ghost: { background: 'transparent', color: 'var(--text-link)', border: '1px solid transparent' },
    danger: { background: 'var(--red-500)', color: '#fff', border: '1px solid transparent' },
    inverse: { background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.16)' },
  };
  const v = variants[variant] || variants.primary;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={'avl-btn avl-btn-' + variant}
      style={{
        display: block ? 'flex' : 'inline-flex',
        width: block ? '100%' : 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sizes[size].gap,
        height: sizes[size].height,
        padding: sizes[size].padding,
        fontSize: sizes[size].fontSize,
        fontFamily: 'var(--font-sans)',
        fontWeight: 'var(--fw-semibold)',
        lineHeight: 1,
        letterSpacing: '0.01em',
        borderRadius: 'var(--radius-md)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        whiteSpace: 'nowrap',
        transition: 'background var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)',
        ...v,
        ...style,
      }}
      {...rest}
    >
      {loading && <Spinner />}
      {!loading && iconLeft}
      {children && <span>{children}</span>}
      {!loading && iconRight}
    </button>
  );
}

function Spinner() {
  return (
    <span
      style={{
        width: '14px',
        height: '14px',
        borderRadius: '50%',
        border: '2px solid currentColor',
        borderTopColor: 'transparent',
        display: 'inline-block',
        animation: 'avl-spin 0.7s linear infinite',
      }}
    />
  );
}
