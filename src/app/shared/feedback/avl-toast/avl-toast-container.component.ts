import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvlToastTone = 'info' | 'success' | 'warning' | 'danger';

export interface AvlToastItem {
  id: number;
  tone: AvlToastTone;
  title?: string;
  message: string;
  dismissible: boolean;
}

const DEFAULT_ICON: Record<AvlToastTone, string> = {
  info: 'ti ti-info-circle',
  success: 'ti ti-circle-check',
  warning: 'ti ti-alert-triangle',
  danger: 'ti ti-alert-circle'
};

/**
 * AVELYNQ extension (design-system/avelynq-extensions/Toast.prompt.md) —
 * no upstream AVELYNQ spec, pending human design review. Stacked,
 * auto-dismissing notification shell reusing AvlAlertComponent's exact
 * tone/icon family in a fixed inline-end-corner stack. Presentational only
 * — callers pass items + a dismiss callback (see erp-notification-
 * container, which reads ErpNotificationService and renders this).
 */
@Component({
  selector: 'avl-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="avl-toast-stack" aria-live="polite" aria-atomic="true">
      @for (item of items; track item.id) {
        <div [class]="'avl-toast avl-toast--' + item.tone">
          <i [class]="defaultIcon(item.tone) + ' avl-toast__icon'" aria-hidden="true"></i>
          <div class="avl-toast__body">
            @if (item.title) {
              <div class="avl-toast__title">{{ item.title }}</div>
            }
            <div class="avl-toast__message">{{ item.message }}</div>
          </div>
          @if (item.dismissible) {
            <button type="button" class="avl-toast__close" (click)="dismissed.emit(item.id)" aria-label="Dismiss">
              <i class="ti ti-x" aria-hidden="true"></i>
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .avl-toast-stack {
      position: fixed;
      top: var(--space-4, 16px);
      inset-inline-end: var(--space-4, 16px);
      width: min(420px, calc(100vw - 2rem));
      z-index: var(--z-toast, 1080);
      display: flex;
      flex-direction: column;
      gap: var(--space-3, 12px);
    }

    .avl-toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 14px;
      border: 1px solid;
      border-radius: var(--radius-md);
      background: var(--surface-card);
      box-shadow: var(--shadow-lg);
      font-family: var(--font-sans);
      animation: avl-toast-in var(--dur-base) var(--ease-out);
    }

    @keyframes avl-toast-in {
      from { opacity: 0; transform: translateX(0) translateY(-6px); }
      to { opacity: 1; transform: translateX(0) translateY(0); }
    }

    .avl-toast--info { border-color: var(--blue-200); }
    .avl-toast--info .avl-toast__icon, .avl-toast--info .avl-toast__title { color: var(--blue-700); }

    .avl-toast--success { border-color: #B7E0C6; }
    .avl-toast--success .avl-toast__icon, .avl-toast--success .avl-toast__title { color: var(--green-700); }

    .avl-toast--warning { border-color: #E8D49B; }
    .avl-toast--warning .avl-toast__icon, .avl-toast--warning .avl-toast__title { color: var(--amber-700); }

    .avl-toast--danger { border-color: #E6B5AE; }
    .avl-toast--danger .avl-toast__icon, .avl-toast--danger .avl-toast__title { color: var(--red-700); }

    .avl-toast__icon { font-size: 18px; margin-top: 1px; flex-shrink: 0; }

    .avl-toast__body { flex: 1; min-width: 0; word-break: break-word; }

    .avl-toast__title { font-weight: var(--fw-semibold); font-size: var(--fs-sm); margin-bottom: 2px; }

    .avl-toast__message { font-size: var(--fs-sm); color: var(--text-body); line-height: var(--lh-normal); }

    .avl-toast__close {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 0;
      line-height: 1;
      color: inherit;
      flex-shrink: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvlToastContainerComponent {
  @Input() items: AvlToastItem[] = [];
  @Output() dismissed = new EventEmitter<number>();

  defaultIcon(tone: AvlToastTone): string {
    return DEFAULT_ICON[tone];
  }
}
