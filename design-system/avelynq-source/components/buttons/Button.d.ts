import * as React from 'react';

export interface ButtonProps {
  children?: React.ReactNode;
  /** Visual style. Primary = main action, accent = growth/teal, secondary = neutral outline, ghost = low-emphasis, danger = destructive, inverse = on dark surfaces. */
  variant?: 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'inverse';
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  block?: boolean;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

/**
 * AVELYNQ primary action button. Disciplined enterprise styling, 6 variants, 3 sizes.
 * @startingPoint section="Buttons" subtitle="Action button — 6 variants, 3 sizes" viewport="700x150"
 */
export function Button(props: ButtonProps): JSX.Element;
