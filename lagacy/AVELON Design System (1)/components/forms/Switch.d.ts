import * as React from 'react';
export interface SwitchProps {
  label?: React.ReactNode;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  id?: string;
  style?: React.CSSProperties;
}
/** Toggle switch for settings and on/off states. */
export function Switch(props: SwitchProps): JSX.Element;
