import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvlBadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent';
export type AvlBadgeVariant = 'soft' | 'solid' | 'outline';

/**
 * AVELYNQ Badge — design-system/avelynq-source/components/data-display/Badge.d.ts.
 * Compact status/label badge. `soft` is the enterprise default.
 */
@Component({
  selector: 'avl-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="'avl-badge avl-badge--' + tone + ' avl-badge--' + variant">
      @if (icon) {
        <i [class]="icon" aria-hidden="true"></i>
      }
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    :host { display: inline-block; }

    .avl-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      height: 22px;
      padding: 0 9px;
      font-family: var(--font-sans);
      font-size: var(--fs-2xs);
      font-weight: var(--fw-semibold);
      letter-spacing: 0.02em;
      border-radius: var(--radius-sm);
      white-space: nowrap;
      line-height: 1;
      border: 1px solid transparent;
    }

    .avl-badge--soft.avl-badge--neutral { background: var(--status-neutral-bg); color: var(--status-neutral); }
    .avl-badge--soft.avl-badge--info { background: var(--status-info-bg); color: var(--status-info); }
    .avl-badge--soft.avl-badge--success { background: var(--status-success-bg); color: var(--status-success); }
    .avl-badge--soft.avl-badge--warning { background: var(--status-warning-bg); color: var(--status-warning); }
    .avl-badge--soft.avl-badge--danger { background: var(--status-danger-bg); color: var(--status-danger); }
    .avl-badge--soft.avl-badge--accent { background: var(--teal-50); color: var(--teal-700); }

    .avl-badge--solid.avl-badge--neutral { background: var(--slate-600); color: #fff; }
    .avl-badge--solid.avl-badge--info { background: var(--blue-500); color: #fff; }
    .avl-badge--solid.avl-badge--success { background: var(--green-600); color: #fff; }
    .avl-badge--solid.avl-badge--warning { background: var(--amber-600); color: #fff; }
    .avl-badge--solid.avl-badge--danger { background: var(--red-600); color: #fff; }
    .avl-badge--solid.avl-badge--accent { background: var(--teal-600); color: #fff; }

    .avl-badge--outline { background: transparent; border-color: currentColor; }
    .avl-badge--outline.avl-badge--neutral { color: var(--status-neutral); }
    .avl-badge--outline.avl-badge--info { color: var(--status-info); }
    .avl-badge--outline.avl-badge--success { color: var(--status-success); }
    .avl-badge--outline.avl-badge--warning { color: var(--status-warning); }
    .avl-badge--outline.avl-badge--danger { color: var(--status-danger); }
    .avl-badge--outline.avl-badge--accent { color: var(--teal-700); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvlBadgeComponent {
  @Input() tone: AvlBadgeTone = 'neutral';
  @Input() variant: AvlBadgeVariant = 'soft';
  @Input() icon?: string;
}
