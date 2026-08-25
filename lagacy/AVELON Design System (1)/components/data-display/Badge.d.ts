import * as React from 'react';
export interface BadgeProps {
  children?: React.ReactNode;
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent';
  variant?: 'soft' | 'solid' | 'outline';
  icon?: string | React.ReactNode;
  style?: React.CSSProperties;
}
/** Compact status/label badge. Soft is the enterprise default; solid for emphasis. */
export function Badge(props: BadgeProps): JSX.Element;
