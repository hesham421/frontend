import * as React from 'react';
export interface StatProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaTone?: 'success' | 'danger' | 'neutral';
  icon?: string | React.ReactNode;
  accent?: 'blue' | 'teal' | 'slate' | 'amber' | 'green' | 'red';
  style?: React.CSSProperties;
}
/** KPI / metric tile with mono figure, accent rail, and optional delta. */
export function Stat(props: StatProps): JSX.Element;
