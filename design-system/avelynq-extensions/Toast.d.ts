import * as React from 'react';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';

export interface ToastOptions {
  tone?: ToastTone;
  title?: string;
  message: string;
  /** Tabler/FontAwesome class string or a React node. Defaults to Alert's per-tone icon. */
  icon?: string | React.ReactNode;
  /** Milliseconds before auto-dismiss. 0 = persist until manually dismissed. */
  duration?: number;
  dismissible?: boolean;
}

export interface ToastHandle {
  id: number;
  close: () => void;
}

/** Imperative toast API — not a JSX component, mirrors a service/hook contract. */
export interface ToastService {
  show(options: ToastOptions): ToastHandle;
  dismiss(id: number): void;
  dismissAll(): void;
}
