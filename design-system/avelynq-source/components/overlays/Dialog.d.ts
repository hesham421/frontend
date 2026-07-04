import * as React from 'react';

export interface DialogProps {
  /** Whether the dialog is rendered. */
  open: boolean;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  /** Footer node — typically the action Buttons. Stacks full-width on phones. */
  footer?: React.ReactNode;
  /** Max-width tier: sm 420 · md 560 · lg 760. Becomes a bottom sheet on phones. */
  size?: 'sm' | 'md' | 'lg';
  /** Leading icon (Tabler class or node) shown in a tinted tile. */
  icon?: string | React.ReactNode;
  iconTone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  closeOnScrim?: boolean;
  showClose?: boolean;
  style?: React.CSSProperties;
}

/**
 * Responsive modal dialog — centered on desktop/laptop/tablet, docks as a
 * bottom sheet on phones, with a scrollable body capped to the viewport.
 * Confirmations, edit forms, detail panels.
 * @startingPoint section="Overlays" subtitle="Responsive modal / confirm dialog" viewport="700x460"
 */
export function Dialog(props: DialogProps): JSX.Element | null;
