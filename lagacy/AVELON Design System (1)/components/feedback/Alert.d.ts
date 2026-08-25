import * as React from 'react';
export interface AlertProps {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children?: React.ReactNode;
  icon?: string | React.ReactNode;
  onClose?: (() => void) | null;
  style?: React.CSSProperties;
}
/** Inline contextual message banner. Tone sets color + default icon. */
export function Alert(props: AlertProps): JSX.Element;
