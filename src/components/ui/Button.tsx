import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'inverse';
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  block?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  block = false,
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  style = {},
  className = '',
  ...rest
}) => {
  const sizes = {
    sm: { height: 'var(--control-sm, 32px)', padding: '0 12px', fontSize: 'var(--fs-sm, 13px)', gap: '6px' },
    md: { height: 'var(--control-md, 38px)', padding: '0 16px', fontSize: 'var(--fs-body, 14px)', gap: '8px' },
    lg: { height: 'var(--control-lg, 44px)', padding: '0 22px', fontSize: 'var(--fs-h4, 15px)', gap: '8px' },
  };

  const variants = {
    primary: { background: 'var(--brand-primary, #2466D8)', color: '#fff', border: '1px solid transparent' },
    accent: { background: 'var(--brand-accent, #12A99B)', color: '#fff', border: '1px solid transparent' },
    secondary: { background: '#fff', color: 'var(--text-body, #354456)', border: '1px solid var(--border-default, #B7C3D1)' },
    ghost: { background: 'transparent', color: 'var(--text-link, #16459C)', border: '1px solid transparent' },
    danger: { background: 'var(--red-500, #CB3A2D)', color: '#fff', border: '1px solid transparent' },
    inverse: { background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.16)' },
  };

  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`avl-btn avl-btn-${variant} ${className}`}
      style={{
        display: block ? 'flex' : 'inline-flex',
        width: block ? '100%' : 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        height: s.height,
        padding: s.padding,
        fontSize: s.fontSize,
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        lineHeight: 1,
        letterSpacing: '0.01em',
        borderRadius: 'var(--radius-md, 7px)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        transition: 'all 120ms ease-out',
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
};

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string | React.ReactNode;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'inverse';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  onClick,
  style = {},
  className = '',
  ...rest
}) => {
  const sizes = {
    sm: { width: '32px', height: '32px', fontSize: '16px' },
    md: { width: '38px', height: '38px', fontSize: '18px' },
    lg: { width: '44px', height: '44px', fontSize: '20px' },
  };

  const variants = {
    primary: { background: 'var(--brand-primary, #2466D8)', color: '#fff', border: '1px solid transparent' },
    secondary: { background: 'var(--surface-sunken, #F1F5F9)', color: 'var(--text-strong, #14222F)', border: '1px solid var(--border-subtle, #E6ECF3)' },
    ghost: { background: 'transparent', color: 'var(--text-body, #354456)', border: '1px solid transparent' },
    outline: { background: '#fff', color: 'var(--text-body, #354456)', border: '1px solid var(--border-default, #B7C3D1)' },
    inverse: { background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.16)' },
  };

  const v = variants[variant] || variants.ghost;
  const s = sizes[size] || sizes.md;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`avl-icon-btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: s.width,
        height: s.height,
        fontSize: s.fontSize,
        borderRadius: 'var(--radius-md, 7px)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 120ms ease-out',
        ...v,
        ...style,
      }}
      {...rest}
    >
      {typeof icon === 'string' ? <i className={icon} aria-hidden="true" /> : icon}
    </button>
  );
};

const Spinner: React.FC = () => (
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
