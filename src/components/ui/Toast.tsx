import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

export type ToastTone = 'success' | 'danger' | 'info';

export interface ToastItem {
  id: number;
  tone: ToastTone;
  message: React.ReactNode;
}

interface ToastContextValue {
  showToast: (message: React.ReactNode, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLES: Record<ToastTone, { bg: string; border: string; color: string; icon: string }> = {
  success: { bg: 'var(--green-50, #E7F4EC)', border: '#B7E0C6', color: 'var(--green-700, #126340)', icon: 'ti ti-circle-check' },
  danger: { bg: 'var(--red-50, #FBE9E7)', border: '#E6B5AE', color: 'var(--red-700, #87241C)', icon: 'ti ti-alert-circle' },
  info: { bg: 'var(--info-50, #E7F0FB)', border: '#B8D4F8', color: 'var(--blue-700, #16459C)', icon: 'ti ti-info-circle' },
};

const AUTO_DISMISS_MS = 4000;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: React.ReactNode, tone: ToastTone = 'success') => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, tone, message }]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        style={{
          position: 'fixed',
          insetBlockEnd: '20px',
          insetInlineEnd: '20px',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: 'min(360px, calc(100vw - 40px))',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {toasts.map((toast) => {
          const tone = TONE_STYLES[toast.tone];
          return (
            <div
              key={toast.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 14px',
                background: tone.bg,
                border: `1px solid ${tone.border}`,
                borderRadius: 'var(--radius-md, 7px)',
                boxShadow: 'var(--shadow-md, 0 4px 12px rgba(10,22,40,0.1))',
                textAlign: 'start',
              }}
            >
              <i className={tone.icon} aria-hidden="true" style={{ color: tone.color, fontSize: '18px', marginTop: '1px', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0, fontSize: 'var(--fs-sm, 13px)', color: tone.color, lineHeight: 1.5 }}>
                {toast.message}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: tone.color, fontSize: '14px', padding: 0, lineHeight: 1, flexShrink: 0 }}
              >
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
