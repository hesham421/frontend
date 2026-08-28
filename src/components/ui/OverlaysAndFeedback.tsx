import React from 'react';

// Alert Component
export interface AlertProps {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: React.ReactNode;
  message?: React.ReactNode;
  children?: React.ReactNode;
  icon?: string | React.ReactNode;
  onClose?: () => void;
  style?: React.CSSProperties;
}

export const Alert: React.FC<AlertProps> = ({
  tone,
  variant,
  title,
  message,
  children,
  icon = null,
  onClose,
  style = {},
}) => {
  const effectiveTone = variant || tone || 'info';

  const tones = {
    info: { c: 'var(--blue-700, #16459C)', bg: 'var(--info-50, #E7F0FB)', bd: 'var(--blue-200, #ADC7F7)', i: 'ti ti-info-circle' },
    success: { c: 'var(--green-700, #126340)', bg: 'var(--green-50, #E7F4EC)', bd: '#B7E0C6', i: 'ti ti-circle-check' },
    warning: { c: 'var(--amber-700, #7E4D08)', bg: 'var(--amber-50, #FBF1DF)', bd: '#E8D49B', i: 'ti ti-alert-triangle' },
    danger: { c: 'var(--red-700, #87241C)', bg: 'var(--red-50, #FBE9E7)', bd: '#E6B5AE', i: 'ti ti-alert-circle' },
  };

  const t = tones[effectiveTone] || tones.info;
  const content = message || children;

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 14px',
        background: t.bg,
        border: `1px solid ${t.bd}`,
        borderRadius: 'var(--radius-md, 7px)',
        fontFamily: 'var(--font-sans)',
        boxSizing: 'border-box',
        textAlign: 'start',
        ...style,
      }}
    >
      <i
        className={typeof icon === 'string' ? icon : t.i}
        style={{ color: t.c, fontSize: '18px', marginTop: '1px', flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm, 13px)', color: t.c, marginBottom: content ? '2px' : 0 }}>
            {title}
          </div>
        )}
        {content && (
          <div style={{ fontSize: 'var(--fs-sm, 13px)', color: 'var(--text-body, #354456)', lineHeight: 1.5 }}>
            {content}
          </div>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.c, fontSize: '16px', padding: 0, lineHeight: 1 }}
        >
          <i className="ti ti-x" />
        </button>
      )}
    </div>
  );
};

// EmptyState Component
export interface EmptyStateProps {
  icon?: string | React.ReactNode;
  title?: React.ReactNode;
  message?: React.ReactNode;
  description?: React.ReactNode;
  action?: { label: string; onClick: () => void } | React.ReactNode;
  /** 'empty' = genuinely no data (default). 'error' = the load failed — visually distinct so it's never mistaken for "there is no data." */
  tone?: 'empty' | 'error';
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  description,
  action = null,
  tone = 'empty',
  style = {},
}) => {
  const displayDesc = description || message;
  const isError = tone === 'error';
  const effectiveIcon = icon ?? (isError ? 'ti ti-alert-triangle' : 'ti ti-database-off');

  return (
    <div
      role={isError ? 'alert' : undefined}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        fontFamily: 'var(--font-sans)',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '56px',
          height: '56px',
          borderRadius: '12px',
          background: isError ? 'var(--red-50, #FBE9E7)' : 'var(--surface-sunken, #F1F5F9)',
          color: isError ? 'var(--red-600, #A92E23)' : 'var(--text-subtle, #8C9AAC)',
          fontSize: '26px',
          marginBottom: '16px',
        }}
      >
        {typeof effectiveIcon === 'string' ? <i className={effectiveIcon} /> : effectiveIcon}
      </span>
      {title && (
        <div
          style={{
            fontWeight: 600,
            fontSize: 'var(--fs-title, 16px)',
            color: 'var(--text-strong, #14222F)',
            marginBottom: '4px',
          }}
        >
          {title}
        </div>
      )}
      {displayDesc && (
        <div
          style={{
            fontSize: 'var(--fs-sm, 13px)',
            color: 'var(--text-muted, #647488)',
            maxWidth: '360px',
            lineHeight: 1.5,
            marginBottom: action ? '16px' : 0,
          }}
        >
          {displayDesc}
        </div>
      )}
      {action && (
        <div style={{ marginTop: '8px' }}>
          {React.isValidElement(action) ? (
            action
          ) : (action as any).label ? (
            <button
              type="button"
              onClick={(action as any).onClick}
              style={{
                background: 'var(--brand-primary, #2466D8)',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md, 7px)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              {(action as any).label}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};

// Tabs Component
export interface TabItem {
  id: string;
  label: string;
  badge?: React.ReactNode;
  icon?: string | React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'pills' | 'line';
  style?: React.CSSProperties;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  style = {},
}) => {
  const isLine = variant === 'underline' || variant === 'line';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: isLine ? '24px' : '6px',
        borderBottom: isLine ? '1px solid var(--border-subtle, #E6ECF3)' : 'none',
        padding: isLine ? '0' : '4px',
        background: isLine ? 'transparent' : 'var(--surface-page, #F8FAFC)',
        borderRadius: isLine ? '0' : 'var(--radius-md, 8px)',
        fontFamily: 'var(--font-sans)',
        overflowX: 'auto',
        ...style,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: isLine ? '10px 0' : '7px 14px',
              border: 'none',
              borderBottom: isLine ? (isActive ? '2px solid var(--brand-primary, #2466D8)' : '2px solid transparent') : 'none',
              borderRadius: !isLine ? 'var(--radius-md, 7px)' : '0',
              background: !isLine ? (isActive ? '#ffffff' : 'transparent') : 'transparent',
              color: isActive ? 'var(--brand-primary, #2466D8)' : 'var(--text-muted, #647488)',
              fontWeight: isActive ? 600 : 500,
              fontSize: '14px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: !isLine && isActive ? '0 1px 3px rgba(10,22,40,0.06)' : 'none',
              transition: 'all 120ms ease-out',
            }}
          >
            {tab.icon && (typeof tab.icon === 'string' ? <i className={tab.icon} /> : tab.icon)}
            <span>{tab.label}</span>
            {tab.badge}
          </button>
        );
      })}
    </div>
  );
};

// Breadcrumb Component
export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: 'var(--text-subtle, #8C9AAC)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <i className="ti ti-chevron-right" style={{ fontSize: '11px', color: 'var(--text-subtle, #8C9AAC)' }} />}
          {item.onClick ? (
            <span onClick={item.onClick} style={{ cursor: 'pointer', color: 'var(--text-muted, #647488)' }}>
              {item.label}
            </span>
          ) : (
            <span style={{ color: 'var(--text-strong, #14222F)', fontWeight: 600 }}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Dialog Modal Component
export interface DialogProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  width?: 'sm' | 'md' | 'lg';
  icon?: string | React.ReactNode;
  iconTone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  closeOnScrim?: boolean;
  showClose?: boolean;
  style?: React.CSSProperties;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size,
  width,
  closeOnScrim = true,
  showClose = true,
  style = {},
}) => {
  const isVisible = open !== undefined ? open : isOpen;
  if (!isVisible) return null;

  const effectiveSize = size || width || 'md';

  return (
    <div role="dialog" aria-modal="true" className={`avl-dialog avl-dialog--${effectiveSize}`} style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="avl-dialog__scrim" onClick={closeOnScrim ? onClose : undefined} />
      <div
        className="avl-dialog__panel"
        style={{
          background: 'var(--surface-card, #ffffff)',
          boxShadow: 'var(--shadow-lg, 0 10px 30px rgba(10,22,40,0.18))',
          overflow: 'hidden',
          boxSizing: 'border-box',
          ...style,
        }}
      >
        {(title || showClose) && (
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle, #E6ECF3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexShrink: 0,
            }}
          >
            <div>
              {title && (
                <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-strong, #14222F)', textAlign: 'start' }}>
                  {title}
                </div>
              )}
              {subtitle && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted, #647488)', marginTop: '2px', textAlign: 'start' }}>
                  {subtitle}
                </div>
              )}
            </div>
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle, #8C9AAC)', fontSize: '18px', padding: 0 }}
              >
                <i className="ti ti-x" />
              </button>
            )}
          </div>
        )}

        <div className="avl-dialog__body" style={{ padding: '20px', flex: 1 }}>{children}</div>

        {footer && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--border-subtle, #E6ECF3)',
              background: 'var(--surface-page, #F8FAFC)',
              flexShrink: 0,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Drawer Component
export interface DrawerProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  width?: 'sm' | 'md' | 'lg';
  closeOnScrim?: boolean;
  showClose?: boolean;
  style?: React.CSSProperties;
}

export const Drawer: React.FC<DrawerProps> = ({
  open,
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size,
  width,
  closeOnScrim = true,
  showClose = true,
  style = {},
}) => {
  const isVisible = open !== undefined ? open : isOpen;
  if (!isVisible) return null;

  const effectiveSize = size || width || 'md';

  return (
    <div role="dialog" aria-modal="true" className={`avl-drawer avl-drawer--${effectiveSize}`} style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="avl-drawer__scrim" onClick={closeOnScrim ? onClose : undefined} />
      <div
        className="avl-drawer__panel"
        style={{
          background: 'var(--surface-card, #ffffff)',
          boxShadow: 'var(--shadow-lg, 0 10px 30px rgba(10,22,40,0.18))',
          overflow: 'hidden',
          boxSizing: 'border-box',
          ...style,
        }}
      >
        {(title || showClose) && (
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle, #E6ECF3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexShrink: 0,
            }}
          >
            <div>
              {title && (
                <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-strong, #14222F)', textAlign: 'start' }}>
                  {title}
                </div>
              )}
              {subtitle && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted, #647488)', marginTop: '2px', textAlign: 'start' }}>
                  {subtitle}
                </div>
              )}
            </div>
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle, #8C9AAC)', fontSize: '18px', padding: 0 }}
              >
                <i className="ti ti-x" />
              </button>
            )}
          </div>
        )}

        <div className="avl-drawer__body" style={{ padding: '20px' }}>{children}</div>

        {footer && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--border-subtle, #E6ECF3)',
              background: 'var(--surface-page, #F8FAFC)',
              flexShrink: 0,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
