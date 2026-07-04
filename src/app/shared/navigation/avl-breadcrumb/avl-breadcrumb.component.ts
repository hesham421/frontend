import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AvlCrumbItem {
  label: string;
  href?: string;
}

/**
 * AVELYNQ Breadcrumb — design-system/avelynq-source/components/navigation/Breadcrumb.d.ts.
 * Hierarchical trail. Last item renders bold as the current page.
 */
@Component({
  selector: 'avl-breadcrumb',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav aria-label="Breadcrumb" class="avl-breadcrumb">
      @for (item of normalizedItems; track $index; let last = $last) {
        <span class="avl-breadcrumb__crumb">
          <span
            class="avl-breadcrumb__label"
            [class.avl-breadcrumb__label--current]="last"
            [class.avl-breadcrumb__label--link]="!last && item.href"
            (click)="onCrumbClick(item, last)"
          >{{ item.label }}</span>
          @if (!last) {
            <i class="ti ti-chevron-right avl-breadcrumb__sep" aria-hidden="true"></i>
          }
        </span>
      }
    </nav>
  `,
  styles: [`
    :host { display: block; }

    .avl-breadcrumb {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
      font-family: var(--font-sans);
      font-size: var(--fs-xs);
    }

    .avl-breadcrumb__crumb {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .avl-breadcrumb__label {
      color: var(--text-muted);
      font-weight: var(--fw-regular);
    }

    .avl-breadcrumb__label--current {
      color: var(--text-strong);
      font-weight: var(--fw-semibold);
    }

    .avl-breadcrumb__label--link {
      cursor: pointer;
    }

    .avl-breadcrumb__label--link:hover {
      color: var(--text-link);
    }

    .avl-breadcrumb__sep {
      color: var(--text-subtle);
      font-size: 13px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvlBreadcrumbComponent {
  @Input() set items(value: (AvlCrumbItem | string)[]) {
    this.normalizedItems = (value ?? []).map((i) => (typeof i === 'string' ? { label: i } : i));
  }

  @Output() crumbClicked = new EventEmitter<AvlCrumbItem>();

  normalizedItems: AvlCrumbItem[] = [];

  onCrumbClick(item: AvlCrumbItem, isLast: boolean): void {
    if (!isLast && item.href) {
      this.crumbClicked.emit(item);
    }
  }
}
