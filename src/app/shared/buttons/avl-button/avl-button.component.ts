import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvlButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'inverse';
export type AvlButtonSize = 'sm' | 'md' | 'lg';

/**
 * AVELYNQ Button — design-system/avelynq-source/components/buttons/Button.d.ts.
 * 6 variants, 3 sizes, optional loading/icon slots, block layout.
 */
@Component({
  selector: 'avl-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="isDisabled"
      [class]="hostClass"
      (click)="onClick($event)"
    >
      @if (loading) {
        <span class="avl-btn__spinner" aria-hidden="true"></span>
      } @else if (iconLeft) {
        <i [class]="iconLeft" aria-hidden="true"></i>
      }
      <span class="avl-btn__label"><ng-content></ng-content></span>
      @if (!loading && iconRight) {
        <i [class]="iconRight" aria-hidden="true"></i>
      }
    </button>
  `,
  styles: [`
    :host { display: inline-block; }

    .avl-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      font-family: var(--font-sans);
      font-weight: var(--fw-semibold);
      line-height: 1;
      letter-spacing: 0.01em;
      border-radius: var(--radius-md);
      white-space: nowrap;
      cursor: pointer;
      border: 1px solid transparent;
      transition: background var(--dur-fast) var(--ease-standard),
                  box-shadow var(--dur-fast) var(--ease-standard),
                  transform var(--dur-fast) var(--ease-standard);
    }

    .avl-btn:disabled { cursor: not-allowed; opacity: 0.5; }
    .avl-btn:focus-visible { outline: none; box-shadow: var(--focus-ring); }

    .avl-btn--sm { height: var(--control-sm); padding: 0 12px; font-size: var(--fs-sm); gap: 6px; }
    .avl-btn--md { height: var(--control-md); padding: 0 16px; font-size: var(--fs-body); gap: 8px; }
    .avl-btn--lg { height: var(--control-lg); padding: 0 22px; font-size: var(--fs-h4); gap: 8px; }

    .avl-btn-primary { background: var(--brand-primary); color: var(--text-onbrand); }
    .avl-btn-primary:hover:not(:disabled) { background: var(--brand-primary-hover); }

    .avl-btn-accent { background: var(--brand-accent); color: var(--text-onbrand); }
    .avl-btn-accent:hover:not(:disabled) { background: var(--brand-accent-hover); }

    .avl-btn-secondary { background: #fff; color: var(--text-body); border-color: var(--border-default); }
    .avl-btn-secondary:hover:not(:disabled) { background: var(--surface-sunken); }

    .avl-btn-ghost { background: transparent; color: var(--text-link); }
    .avl-btn-ghost:hover:not(:disabled) { background: var(--surface-sunken); }

    .avl-btn-danger { background: var(--red-500); color: var(--text-onbrand); }
    .avl-btn-danger:hover:not(:disabled) { background: var(--red-600); }

    .avl-btn-inverse { background: rgba(255, 255, 255, 0.08); color: #fff; border-color: rgba(255, 255, 255, 0.16); }
    .avl-btn-inverse:hover:not(:disabled) { background: rgba(255, 255, 255, 0.16); }

    .avl-btn__spinner {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid currentColor;
      border-top-color: transparent;
      display: inline-block;
      animation: avl-btn-spin 0.7s linear infinite;
    }

    @keyframes avl-btn-spin {
      to { transform: rotate(360deg); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvlButtonComponent {
  @Input() variant: AvlButtonVariant = 'primary';
  @Input() size: AvlButtonSize = 'md';
  @Input() iconLeft?: string;
  @Input() iconRight?: string;
  @Input() block = false;
  @Input() loading = false;
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  @Output() clicked = new EventEmitter<MouseEvent>();

  @HostBinding('style.display') get hostDisplay(): string {
    return this.block ? 'block' : 'inline-block';
  }

  get isDisabled(): boolean {
    return this.disabled || this.loading;
  }

  get hostClass(): string {
    return `avl-btn avl-btn-${this.variant} avl-btn--${this.size}`;
  }

  onClick(event: MouseEvent): void {
    if (this.isDisabled) {
      return;
    }
    this.clicked.emit(event);
  }
}
