import * as React from 'react';
export interface InputProps {
  label?: string;
  hint?: string;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  iconLeft?: string | React.ReactNode;
  suffix?: React.ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /** Use the mono face — for codes, GL numbers, amounts. */
  mono?: boolean;
  id?: string;
  style?: React.CSSProperties;
}
/** Labelled text field with hint/error states and focus ring. */
export function Input(props: InputProps): JSX.Element;
