import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * AVELYNQ EmptyState — design-system/avelynq-source/components/feedback/EmptyState.d.ts.
 * Centered placeholder for empty tables, no-results, and error states.
 * Action slot is a projected `[empty-state-action]` node (e.g. an <avl-button>).
 */
@Component({
  selector: 'avl-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="avl-empty-state">
      <span class="avl-empty-state__icon">
        <i [class]="icon || 'ti ti-database'" aria-hidden="true"></i>
      </span>
      @if (title) {
        <div class="avl-empty-state__title">{{ title }}</div>
      }
      @if (message) {
        <div class="avl-empty-state__message">{{ message }}</div>
      }
      <div class="avl-empty-state__action">
        <ng-content select="[empty-state-action]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .avl-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 48px 24px;
      font-family: var(--font-sans);
    }

    .avl-empty-state__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: var(--radius-xl);
      background: var(--surface-sunken);
      color: var(--text-subtle);
      font-size: 26px;
      margin-bottom: 16px;
    }

    .avl-empty-state__title {
      font-weight: var(--fw-semibold);
      font-size: var(--fs-title);
      color: var(--text-strong);
      margin-bottom: 4px;
    }

    .avl-empty-state__message {
      font-size: var(--fs-sm);
      color: var(--text-muted);
      max-width: 360px;
      line-height: var(--lh-normal);
    }

    .avl-empty-state__action:not(:empty) { margin-top: 18px; }
    .avl-empty-state__action:empty { display: none; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvlEmptyStateComponent {
  @Input() icon?: string;
  @Input() title?: string;
  @Input() message?: string;
}
