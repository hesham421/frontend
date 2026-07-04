import * as React from 'react';
export interface TabItem { id: string; label: string; icon?: string; count?: number; }
export interface TabsProps {
  tabs: (TabItem | string)[];
  value?: string;
  onChange?: (id: string) => void;
  style?: React.CSSProperties;
}
/** Underline tab bar for in-page section switching. Controlled or uncontrolled. */
export function Tabs(props: TabsProps): JSX.Element;
