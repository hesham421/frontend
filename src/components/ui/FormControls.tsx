import React, { useState } from 'react';

// Input Component
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  hint?: string;
  helperText?: string;
  error?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  iconLeft?: string | React.ReactNode;
  suffix?: string | React.ReactNode;
  mono?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  hint,
  helperText,
  error,
  value,
  onChange,
  placeholder,
  type = 'text',
  iconLeft,
  suffix,
  disabled = false,
  readOnly = false,
  required = false,
  mono = false,
  id,
  style = {},
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  const fid = id || (label ? 'avl-' + label.replace(/\s+/g, '-').toLowerCase() : undefined);
  const borderColor = error
    ? 'var(--red-500, #CB3A2D)'
    : focused
    ? 'var(--brand-primary, #2466D8)'
    : 'var(--border-default, #B7C3D1)';

  const displayHint = helperText || hint;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-sans)', textAlign: 'start', ...style }}>
      {label && (
        <label
          htmlFor={fid}
          style={{
            fontSize: 'var(--fs-xs, 12px)',
            fontWeight: 500,
            color: 'var(--text-body, #354456)',
            letterSpacing: '0.01em',
            textAlign: 'start',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--red-500, #CB3A2D)', marginInlineStart: '3px' }}>*</span>}
        </label>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: 'var(--control-md, 38px)',
          padding: '0 12px',
          background: disabled ? 'var(--surface-sunken, #F1F5F9)' : '#fff',
          border: `1px solid ${borderColor}`,
          borderRadius: 'var(--radius-md, 7px)',
          boxShadow: focused && !error ? 'var(--focus-ring, 0 0 0 3px rgba(36,102,216,0.35))' : 'none',
          transition: 'all 120ms ease-out',
        }}
      >
        {iconLeft && (
          <span style={{ color: 'var(--text-subtle, #8C9AAC)', fontSize: '16px', display: 'inline-flex' }}>
            {typeof iconLeft === 'string' ? <i className={iconLeft} /> : iconLeft}
          </span>
        )}
        <input
          id={fid}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: mono ? 'var(--font-mono, monospace)' : 'var(--font-sans)',
            fontSize: 'var(--fs-body, 14px)',
            color: 'var(--text-strong, #14222F)',
            height: '100%',
          }}
          {...rest}
        />
        {suffix && (
          <span style={{ color: 'var(--text-muted, #647488)', fontSize: 'var(--fs-sm, 13px)', whiteSpace: 'nowrap' }}>
            {suffix}
          </span>
        )}
      </div>
      {error ? (
        <span style={{ fontSize: 'var(--fs-xs, 12px)', color: 'var(--red-600, #A92E23)' }}>{error}</span>
      ) : displayHint ? (
        <span style={{ fontSize: 'var(--fs-xs, 12px)', color: 'var(--text-muted, #647488)' }}>{displayHint}</span>
      ) : null}
    </div>
  );
};

// Select Component
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  hint?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const Select: React.FC<SelectProps> = ({
  label,
  hint,
  helperText,
  error,
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  id,
  style = {},
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  const fid = id || (label ? 'avl-' + label.replace(/\s+/g, '-').toLowerCase() : undefined);
  const borderColor = error
    ? 'var(--red-500, #CB3A2D)'
    : focused
    ? 'var(--brand-primary, #2466D8)'
    : 'var(--border-default, #B7C3D1)';

  const displayHint = helperText || hint;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-sans)', textAlign: 'start', ...style }}>
      {label && (
        <label
          htmlFor={fid}
          style={{
            fontSize: 'var(--fs-xs, 12px)',
            fontWeight: 500,
            color: 'var(--text-body, #354456)',
            letterSpacing: '0.01em',
            textAlign: 'start',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--red-500, #CB3A2D)', marginInlineStart: '3px' }}>*</span>}
        </label>
      )}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          height: 'var(--control-md, 38px)',
          background: disabled ? 'var(--surface-sunken, #F1F5F9)' : '#fff',
          border: `1px solid ${borderColor}`,
          borderRadius: 'var(--radius-md, 7px)',
          boxShadow: focused && !error ? 'var(--focus-ring, 0 0 0 3px rgba(36,102,216,0.35))' : 'none',
          transition: 'all 120ms ease-out',
        }}
      >
        <select
          id={fid}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            height: '100%',
            padding: '0 32px 0 12px',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--fs-body, 14px)',
            color: 'var(--text-strong, #14222F)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            appearance: 'none',
          }}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <i
          className="ti ti-chevron-down"
          style={{
            position: 'absolute',
            insetInlineEnd: '12px',
            pointerEvents: 'none',
            color: 'var(--text-subtle, #8C9AAC)',
            fontSize: '14px',
          }}
        />
      </div>
      {error ? (
        <span style={{ fontSize: 'var(--fs-xs, 12px)', color: 'var(--red-600, #A92E23)' }}>{error}</span>
      ) : displayHint ? (
        <span style={{ fontSize: 'var(--fs-xs, 12px)', color: 'var(--text-muted, #647488)' }}>{displayHint}</span>
      ) : null}
    </div>
  );
};

// Checkbox Component
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, checked = false, onChange, disabled = false, style = {}, ...rest }) => {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-body, 14px)',
        color: 'var(--text-body, #354456)',
        userSelect: 'none',
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: '16px',
          height: '16px',
          accentColor: 'var(--brand-primary, #2466D8)',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        {...rest}
      />
      {label && <span>{label}</span>}
    </label>
  );
};

// Switch Component
export interface SwitchProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  style = {},
}) => {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-body, 14px)',
        color: 'var(--text-strong, #14222F)',
        userSelect: 'none',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      <div
        onClick={() => !disabled && onChange && onChange(!checked)}
        style={{
          position: 'relative',
          width: '38px',
          height: '22px',
          borderRadius: '11px',
          background: checked ? 'var(--brand-primary, #2466D8)' : 'var(--border-default, #B7C3D1)',
          transition: 'background 150ms ease-out',
          cursor: disabled ? 'not-allowed' : 'pointer',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '2px',
            insetInlineStart: checked ? '18px' : '2px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            transition: 'inset-inline-start 150ms ease-out',
          }}
        />
      </div>
      {label && <span>{label}</span>}
    </label>
  );
};
