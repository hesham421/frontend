import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvlTooltipDirective } from 'src/app/shared/overlay/tooltip/tooltip.directive';

export type AvlIconButtonVariant = 'ghost' | 'outline' | 'solid' | 'subtle';
export type AvlIconButtonSize = 'sm' | 'md' | 'lg';

/**
 * AVELYNQ IconButton — design-system/avelynq-source/components/buttons/IconButton.d.ts.
 * Square icon-only button for toolbars/row actions. `label` doubles as the
 * accessible name and drives the Phase 3 Tooltip extension automatically.
 */
@Component({
  selector: 'avl-icon-button',
  standalone: true,
  imports: [CommonModule, AvlTooltipDirective],
  template: `
    <button
      type="button"
      [class]="hostClass"
      [disabled]="disabled"
      [attr.aria-label]="label"
      [avlTooltip]="label || ''"
      [avlTooltipDisabled]="!label"
      (click)="onClick($event)"
    >
      <i [class]="icon" aria-hidden="true"></i>
    </button>
  `,
  styles: [`
    :host { display: inline-block; }

    .avl-iconbtn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      cursor: pointer;
      border: 1px solid transparent;
      transition: background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard);
    }

    .avl-iconbtn:disabled { cursor: not-allowed; opacity: 0.45; }
    .avl-iconbtn:focus-visible { outline: none; box-shadow: var(--focus-ring); }

    .avl-iconbtn--sm { width: 30px; height: 30px; font-size: 15px; }
    .avl-iconbtn--md { width: 38px; height: 38px; font-size: 17px; }
    .avl-iconbtn--lg { width: 44px; height: 44px; font-size: 17px; }

    .avl-iconbtn-ghost { background: transparent; color: var(--text-muted); }
    .avl-iconbtn-ghost:hover:not(:disabled) { background: var(--surface-sunken); }

    .avl-iconbtn-outline { background: #fff; color: var(--text-body); border-color: var(--border-default); }
    .avl-iconbtn-outline:hover:not(:disabled) { background: var(--surface-sunken); }

    .avl-iconbtn-solid { background: var(--brand-primary); color: var(--text-onbrand); }
    .avl-iconbtn-solid:hover:not(:disabled) { background: var(--brand-primary-hover); }

    .avl-iconbtn-subtle { background: var(--surface-sunken); color: var(--text-body); }
    .avl-iconbtn-subtle:hover:not(:disabled) { background: var(--border-subtle); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvlIconButtonComponent {
  @Input({ required: true }) icon!: string;
  @Input() variant: AvlIconButtonVariant = 'ghost';
  @Input() size: AvlIconButtonSize = 'md';
  @Input() label?: string;
  @Input() disabled = false;

  @Output() clicked = new EventEmitter<MouseEvent>();

  get hostClass(): string {
    return `avl-iconbtn avl-iconbtn-${this.variant} avl-iconbtn--${this.size}`;
  }

  onClick(event: MouseEvent): void {
    if (this.disabled) {
      return;
    }
    this.clicked.emit(event);
  }
}
