import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvlAlertTone = 'info' | 'success' | 'warning' | 'danger';

const DEFAULT_ICON: Record<AvlAlertTone, string> = {
  info: 'ti ti-info-circle',
  success: 'ti ti-circle-check',
  warning: 'ti ti-alert-triangle',
  danger: 'ti ti-alert-circle'
};

/**
 * AVELYNQ Alert — design-system/avelynq-source/components/feedback/Alert.d.ts.
 * Inline contextual message banner. Tone sets color + default icon.
 * Also the tone/icon family reused verbatim by the Toast extension (Step 3).
 */
@Component({
  selector: 'avl-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'avl-alert avl-alert--' + tone" role="alert">
      <i [class]="(icon || defaultIcon) + ' avl-alert__icon'" aria-hidden="true"></i>
      <div class="avl-alert__body">
        @if (title) {
          <div class="avl-alert__title">{{ title }}</div>
        }
        <div class="avl-alert__message"><ng-content></ng-content></div>
      </div>
      @if (dismissible) {
        <button type="button" class="avl-alert__close" (click)="closed.emit()" aria-label="Dismiss">
          <i class="ti ti-x" aria-hidden="true"></i>
        </button>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .avl-alert {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 14px;
      border: 1px solid;
      border-radius: var(--radius-md);
      font-family: var(--font-sans);
    }

    .avl-alert--info { background: var(--info-50); border-color: var(--blue-200); }
    .avl-alert--info .avl-alert__icon, .avl-alert--info .avl-alert__title { color: var(--blue-700); }

    .avl-alert--success { background: var(--green-50); border-color: #B7E0C6; }
    .avl-alert--success .avl-alert__icon, .avl-alert--success .avl-alert__title { color: var(--green-700); }

    .avl-alert--warning { background: var(--amber-50); border-color: #E8D49B; }
    .avl-alert--warning .avl-alert__icon, .avl-alert--warning .avl-alert__title { color: var(--amber-700); }

    .avl-alert--danger { background: var(--red-50); border-color: #E6B5AE; }
    .avl-alert--danger .avl-alert__icon, .avl-alert--danger .avl-alert__title { color: var(--red-700); }

    .avl-alert__icon { font-size: 18px; margin-top: 1px; flex-shrink: 0; }

    .avl-alert__body { flex: 1; min-width: 0; }

    .avl-alert__title { font-weight: var(--fw-semibold); font-size: var(--fs-sm); margin-bottom: 2px; }

    .avl-alert__message { font-size: var(--fs-sm); color: var(--text-body); line-height: var(--lh-normal); }
    .avl-alert__message:empty { display: none; }

    .avl-alert__close {
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
export class AvlAlertComponent {
  @Input() tone: AvlAlertTone = 'info';
  @Input() title?: string;
  @Input() icon?: string;
  @Input() dismissible = false;

  @Output() closed = new EventEmitter<void>();

  get defaultIcon(): string {
    return DEFAULT_ICON[this.tone];
  }
}
