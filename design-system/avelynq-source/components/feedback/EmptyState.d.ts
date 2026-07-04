import * as React from 'react';
export interface EmptyStateProps {
  icon?: string | React.ReactNode;
  title?: string;
  message?: string;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}
/** Empty / no-results / error placeholder for tables and panels. */
export function EmptyState(props: EmptyStateProps): JSX.Element;
