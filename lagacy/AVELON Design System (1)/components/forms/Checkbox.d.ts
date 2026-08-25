import * as React from 'react';
export interface CheckboxProps {
  label?: React.ReactNode;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  id?: string;
  style?: React.CSSProperties;
}
/** Checkbox with checked / indeterminate / disabled states. */
export function Checkbox(props: CheckboxProps): JSX.Element;
