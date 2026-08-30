import React, { useState } from 'react';

// Card Component
export interface CardProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hover?: boolean;
  variant?: 'flat' | 'raised';
  style?: React.CSSProperties;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  actions,
  padding = 'md',
  header,
  footer,
  hover = false,
  variant = 'flat',
  style = {},
  className = '',
}) => {
  const pads = { none: '0', sm: '14px', md: '20px', lg: '24px' };
  const [isHovered, setIsHovered] = useState(false);

  const shadow =
    variant === 'raised'
      ? 'var(--shadow-md, 0 4px 12px rgba(10,22,40,0.1))'
      : isHovered
      ? 'var(--shadow-md, 0 4px 12px rgba(10,22,40,0.08))'
      : 'var(--shadow-sm, 0 1px 3px rgba(10,22,40,0.05))';

  return (
    <div
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
      className={`avl-card ${className}`}
      style={{
        background: 'var(--surface-card, #ffffff)',
        border: '1px solid var(--border-subtle, #E6ECF3)',
        borderRadius: 'var(--radius-lg, 10px)',
        boxShadow: shadow,
        transition: 'all 160ms ease-out',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {(title || header || actions) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            rowGap: '8px',
            gap: '12px',
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-subtle, #E6ECF3)',
          }}
        >
          {header || (
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 'var(--fs-title, 16px)',
                  color: 'var(--text-strong, #14222F)',
                  textAlign: 'start',
                }}
              >
                {title}
              </div>
              {subtitle && (
                <div
                  style={{
                    fontSize: 'var(--fs-xs, 12px)',
                    color: 'var(--text-muted, #647488)',
                    marginTop: '2px',
                    textAlign: 'start',
                  }}
                >
                  {subtitle}
                </div>
              )}
            </div>
          )}
          {actions && <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>{actions}</div>}
        </div>
      )}
      <div
        style={{
          padding: pads[padding],
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--fs-body, 14px)',
          color: 'var(--text-body, #354456)',
        }}
      >
        {children}
      </div>
      {footer && (
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-subtle, #E6ECF3)',
            background: 'var(--surface-card, #ffffff)',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

// Stat Component
export interface StatProps {
  label: string;
  value: string | number;
  delta?: string | null;
  deltaTone?: 'success' | 'danger' | 'neutral';
  trend?: { value: string; isPositive: boolean };
  icon?: string | React.ReactNode;
  accent?: 'blue' | 'teal' | 'slate' | 'amber' | 'green' | 'red';
  style?: React.CSSProperties;
}

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  delta = null,
  deltaTone = 'success',
  trend,
  icon = null,
  accent = 'blue',
  style = {},
}) => {
  const accents = {
    blue: 'var(--blue-500, #2466D8)',
    teal: 'var(--teal-500, #12A99B)',
    slate: 'var(--slate-500, #647488)',
    amber: 'var(--amber-500, #C77D11)',
    green: 'var(--green-500, #1F9D5F)',
    red: 'var(--red-500, #CB3A2D)',
  };

  const deltaColors = {
    success: 'var(--green-600, #17804D)',
    danger: 'var(--red-600, #A92E23)',
    neutral: 'var(--text-muted, #647488)',
  };

  const displayDelta = trend ? trend.value : delta;
  const displayTone = trend ? (trend.isPositive ? 'success' : 'danger') : deltaTone;

  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--surface-card, #ffffff)',
        border: '1px solid var(--border-subtle, #E6ECF3)',
        borderRadius: 'var(--radius-lg, 10px)',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(10,22,40,0.05))',
        padding: '18px 20px',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
        boxSizing: 'border-box',
        textAlign: 'start',
        ...style,
      }}
    >
      <span
        style={{
          position: 'absolute',
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          background: accents[accent],
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-muted, #647488)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {label}
        </span>
        {icon && (
          <span style={{ color: accents[accent], fontSize: '18px', display: 'inline-flex' }}>
            {typeof icon === 'string' ? <i className={icon} aria-hidden="true" /> : icon}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '26px',
            fontWeight: 600,
            color: 'var(--text-strong, #14222F)',
            letterSpacing: '-0.01em',
          }}
        >
          {value}
        </span>
        {displayDelta && (
          <span style={{ fontSize: '12px', fontWeight: 600, color: deltaColors[displayTone] }}>
            {displayDelta}
          </span>
        )}
      </div>
    </div>
  );
};

// Badge Component
export interface BadgeProps {
  children: React.ReactNode;
  tone?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  tone,
  variant,
  size = 'md',
  style = {},
}) => {
  const effectiveTone = variant || tone || 'neutral';

  const tones = {
    primary: { background: 'var(--blue-50, #EAF1FE)', color: 'var(--blue-700, #16459C)', border: '1px solid var(--blue-200, #ADC7F7)' },
    accent: { background: 'var(--teal-50, #E2F7F4)', color: 'var(--teal-700, #0C7167)', border: '1px solid var(--teal-200, #8FE0D7)' },
    success: { background: 'var(--green-50, #E7F4EC)', color: 'var(--green-700, #126340)', border: '1px solid #A4D9B8' },
    warning: { background: 'var(--amber-50, #FBF1DF)', color: 'var(--amber-700, #7E4D08)', border: '1px solid #F3D4A0' },
    danger: { background: 'var(--red-50, #FBE9E7)', color: 'var(--red-700, #87241C)', border: '1px solid #F4B8B2' },
    info: { background: 'var(--info-50, #E7F0FB)', color: 'var(--info-600, #1B54BC)', border: '1px solid #B8D4F8' },
    neutral: { background: 'var(--slate-100, #E6ECF3)', color: 'var(--slate-700, #354456)', border: '1px solid var(--slate-200, #D4DDE7)' },
  };

  const sizes = {
    sm: { padding: '2px 6px', fontSize: '11px' },
    md: { padding: '3px 8px', fontSize: '12px' },
  };

  const t = tones[effectiveTone] || tones.neutral;
  const s = sizes[size] || sizes.md;

  return (
    <span
      className={`avl-badge avl-badge-${effectiveTone}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: s.padding,
        fontSize: s.fontSize,
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        borderRadius: 'var(--radius-sm, 4px)',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...t,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

// Avatar Component
export interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

export const Avatar: React.FC<AvatarProps> = ({ name = 'A', src, size = 'md', style = {} }) => {
  const sizes = {
    sm: { w: '30px', h: '30px', fs: '12px' },
    md: { w: '38px', h: '38px', fs: '14px' },
    lg: { w: '48px', h: '48px', fs: '16px' },
  };

  const s = sizes[size] || sizes.md;
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        width: s.w,
        height: s.h,
        borderRadius: '50%',
        background: 'var(--brand-primary, #2466D8)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: s.fs,
        fontWeight: 700,
        fontFamily: 'var(--font-sans)',
        overflow: 'hidden',
        flexShrink: 0,
        ...style,
      }}
    >
      {src ? (
        <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
