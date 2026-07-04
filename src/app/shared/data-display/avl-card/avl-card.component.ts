import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvlCardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * AVELYNQ Card — design-system/avelynq-source/components/data-display/Card.d.ts.
 * Surface container for content, forms, tables, dashboard panels.
 *
 * Slots: default content (body), `[card-header]` (overrides title/subtitle),
 * `[card-actions]` (header right side), `[card-footer]`.
 */
@Component({
  selector: 'avl-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="avl-card" [class.avl-card--hover]="hover">
      @if (hasHeader) {
        <div class="avl-card__header">
          <ng-content select="[card-header]"></ng-content>
          @if (title || subtitle) {
            <div class="avl-card__titles">
              @if (title) {
                <div class="avl-card__title">{{ title }}</div>
              }
              @if (subtitle) {
                <div class="avl-card__subtitle">{{ subtitle }}</div>
              }
            </div>
          }
          <div class="avl-card__actions">
            <ng-content select="[card-actions]"></ng-content>
          </div>
        </div>
      }
      <div class="avl-card__body" [class]="'avl-card__body--' + padding">
        <ng-content></ng-content>
      </div>
      <div class="avl-card__footer">
        <ng-content select="[card-footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .avl-card {
      background: var(--surface-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      transition: box-shadow var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard);
    }

    .avl-card--hover:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .avl-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      row-gap: 8px;
      gap: 12px;
      padding: 14px 20px;
      border-block-end: 1px solid var(--border-subtle);
    }

    .avl-card__titles { min-width: 0; }

    .avl-card__title {
      font-family: var(--font-sans);
      font-weight: var(--fw-semibold);
      font-size: var(--fs-title);
      color: var(--text-strong);
      letter-spacing: var(--ls-heading);
    }

    .avl-card__subtitle {
      font-size: var(--fs-xs);
      color: var(--text-muted);
      margin-top: 2px;
    }

    .avl-card__actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .avl-card__actions:empty { display: none; }

    .avl-card__body {
      font-family: var(--font-sans);
      font-size: var(--fs-body);
      color: var(--text-body);
    }

    .avl-card__body--none { padding: 0; }
    .avl-card__body--sm { padding: 14px; }
    .avl-card__body--md { padding: 20px; }
    .avl-card__body--lg { padding: 24px; }

    .avl-card__footer {
      border-block-start: 1px solid var(--border-subtle);
      background: var(--surface-card);
    }

    .avl-card__footer:empty { display: none; border-block-start: none; }
    .avl-card__footer:not(:empty) { padding: 14px 20px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvlCardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() padding: AvlCardPadding = 'md';
  @Input() hover = false;
  /** Force the header row on/off when only projected [card-header]/[card-actions] content is used (no title/subtitle). */
  @Input() showHeader?: boolean;

  get hasHeader(): boolean {
    return this.showHeader ?? !!(this.title || this.subtitle);
  }
}
