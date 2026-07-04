/**
 * Shared config shape for DialogService.open() / DrawerService.open().
 * Option names deliberately overlap with NgbModalOptions where sensible
 * (size, closeOnEscape≈keyboard, closeOnScrim≈backdrop!=='static') so
 * existing call sites need minimal changes beyond the service/type swap.
 */
export interface AvlOverlayConfig<D = unknown> {
  /** Arbitrary data made available to a component-based content via DIALOG_DATA/DRAWER_DATA injection tokens. */
  data?: D;
  /** Native AVELYNQ header — omit if the content renders its own header (legacy .modal-header pattern). */
  title?: string;
  subtitle?: string;
  /** Leading icon (Tabler class string) shown in a tinted tile next to the native header title. */
  icon?: string;
  iconTone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  /** Dialog: sm 420 · md 560 · lg 760. Drawer: sm 360 · md 480 · lg 640. */
  size?: 'sm' | 'md' | 'lg';
  /** Click on the scrim closes it. Default true — pass false for the old `backdrop: 'static'` behavior. */
  closeOnScrim?: boolean;
  /** Escape key closes it. Default true — matches ngbModal's default `keyboard: true`. */
  closeOnEscape?: boolean;
  /** Show the native close (×) button in the header. Only relevant when `title`/`icon` is set. */
  showClose?: boolean;
  ariaLabel?: string;
}
