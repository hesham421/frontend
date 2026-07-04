import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvlStatDeltaTone = 'success' | 'danger' | 'neutral';
export type AvlStatAccent = 'blue' | 'teal' | 'slate' | 'amber' | 'green' | 'red';

/**
 * AVELYNQ Stat — design-system/avelynq-source/components/data-display/Stat.d.ts.
 * KPI/metric tile with mono figure, accent rail, optional delta.
 */
@Component({
  selector: 'avl-stat',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="avl-stat">
      <span class="avl-stat__rail" [class]="'avl-stat__rail--' + accent"></span>
      <div class="avl-stat__top">
        <span class="avl-stat__label">{{ label }}</span>
        @if (icon) {
          <i [class]="icon + ' avl-stat__icon avl-stat__icon--' + accent" aria-hidden="true"></i>
        }
      </div>
      <div class="avl-stat__bottom">
        <span class="avl-stat__value">{{ value }}</span>
        @if (delta) {
          <span class="avl-stat__delta" [class]="'avl-stat__delta--' + deltaTone">{{ delta }}</span>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .avl-stat {
      position: relative;
      background: var(--surface-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      padding: 18px 20px;
      overflow: hidden;
      font-family: var(--font-sans);
    }

    .avl-stat__rail {
      position: absolute;
      inset-inline-start: 0;
      top: 0;
      bottom: 0;
      width: 3px;
    }

    .avl-stat__rail--blue { background: var(--blue-500); }
    .avl-stat__rail--teal { background: var(--teal-500); }
    .avl-stat__rail--slate { background: var(--slate-500); }
    .avl-stat__rail--amber { background: var(--amber-500); }
    .avl-stat__rail--green { background: var(--green-500); }
    .avl-stat__rail--red { background: var(--red-500); }

    .avl-stat__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .avl-stat__label {
      font-size: var(--fs-xs);
      font-weight: var(--fw-medium);
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: var(--ls-wide);
    }

    .avl-stat__icon { font-size: 18px; }
    .avl-stat__icon--blue { color: var(--blue-500); }
    .avl-stat__icon--teal { color: var(--teal-500); }
    .avl-stat__icon--slate { color: var(--slate-500); }
    .avl-stat__icon--amber { color: var(--amber-500); }
    .avl-stat__icon--green { color: var(--green-500); }
    .avl-stat__icon--red { color: var(--red-500); }

    .avl-stat__bottom {
      display: flex;
      align-items: baseline;
      gap: 10px;
    }

    .avl-stat__value {
      font-family: var(--font-mono);
      font-size: 28px;
      font-weight: var(--fw-semibold);
      color: var(--text-strong);
      letter-spacing: -0.01em;
    }

    .avl-stat__delta { font-size: var(--fs-xs); font-weight: var(--fw-semibold); }
    .avl-stat__delta--success { color: var(--green-600); }
    .avl-stat__delta--danger { color: var(--red-600); }
    .avl-stat__delta--neutral { color: var(--text-muted); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvlStatComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string | number;
  @Input() delta?: string;
  @Input() deltaTone: AvlStatDeltaTone = 'success';
  @Input() icon?: string;
  @Input() accent: AvlStatAccent = 'blue';
}
