import * as React from 'react';
export interface CardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  style?: React.CSSProperties;
}
/**
 * Surface container for content, forms, and data panels. Optional header (title/subtitle/actions) and footer.
 * @startingPoint section="Surfaces" subtitle="Content/data panel with header + actions" viewport="700x260"
 */
export function Card(props: CardProps): JSX.Element;
