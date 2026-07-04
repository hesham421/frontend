import * as React from 'react';

export interface DrawerProps {
  /** Whether the panel is rendered. */
  open: boolean;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  /** Footer node — typically the action Buttons. Full-screen panel on phones. */
  footer?: React.ReactNode;
  /** Panel width tier: sm 360 · md 480 · lg 640. Full-screen on phones. */
  size?: 'sm' | 'md' | 'lg';
  /** Leading icon (Tabler class or node) shown in a tinted tile. */
  icon?: string | React.ReactNode;
  iconTone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  closeOnScrim?: boolean;
  showClose?: boolean;
  style?: React.CSSProperties;
}

/**
 * Responsive side panel — slides in from the inline-end (right in LTR,
 * left in RTL) and goes full-screen on phones. Complements Dialog: use it
 * for record details, create/edit forms, filters, and contextual workflows.
 * @startingPoint section="Overlays" subtitle="Responsive side panel / slide-over" viewport="700x460"
 */
export function Drawer(props: DrawerProps): JSX.Element | null;
