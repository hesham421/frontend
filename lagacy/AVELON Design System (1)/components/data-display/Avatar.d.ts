import * as React from 'react';
export interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  square?: boolean;
  style?: React.CSSProperties;
}
/** User avatar — image or deterministic initials tinted from a brand palette. */
export function Avatar(props: AvatarProps): JSX.Element;
