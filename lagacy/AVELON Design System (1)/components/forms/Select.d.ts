import * as React from 'react';
export interface SelectOption { value: string; label: string; }
export interface SelectProps {
  label?: string;
  hint?: string;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: (string | SelectOption)[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  style?: React.CSSProperties;
}
/** Native-select dropdown styled to the AVELYNQ field system. */
export function Select(props: SelectProps): JSX.Element;
