import * as React from 'react';

export interface IconButtonProps {
  /** Tabler/FontAwesome class string (e.g. "ti ti-refresh") or a React node. */
  icon: string | React.ReactNode;
  variant?: 'ghost' | 'outline' | 'solid' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  /** Accessible label (also the tooltip). */
  label?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

/** Square icon-only button for toolbars and row actions. */
export function IconButton(props: IconButtonProps): JSX.Element;
