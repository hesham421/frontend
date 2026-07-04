/**
 * AVELYNQ EXTENSION — no upstream AVELYNQ spec exists. Proposed by Phase 3,
 * pending human design review.
 */

export interface AvlTooltipDirective {
  /** Tooltip text. Empty/undefined suppresses the tooltip entirely. */
  avlTooltip: string;
  /** Suppress the tooltip (e.g. only show on disabled items) without removing the directive. */
  avlTooltipDisabled?: boolean;
  /** Preferred side — falls back automatically near viewport edges. */
  avlTooltipPosition?: 'top' | 'bottom' | 'start' | 'end';
}

/**
 * Small dark informational label shown on hover/focus. Inverse surface
 * (--surface-inverse), --text-onbrand text, --radius-sm, --shadow-sm,
 * --dur-fast motion. Never interactive/focusable itself.
 */
export declare class AvlTooltip {}
