import * as React from 'react';
export interface CrumbItem { label: string; href?: string; }
export interface BreadcrumbProps {
  items: (CrumbItem | string)[];
  style?: React.CSSProperties;
}
/** Hierarchical breadcrumb trail for module → section → record navigation. */
export function Breadcrumb(props: BreadcrumbProps): JSX.Element;
