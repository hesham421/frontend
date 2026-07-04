import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * AVELYNQ extension (design-system/avelynq-extensions/Pagination.prompt.md)
 * — no upstream AVELYNQ spec, pending human design review. Replaces the
 * single real `<ngb-pagination>` usage (erp-lookup-dialog). Token-styled
 * control row, no CDK Overlay needed.
 */
@Component({
  selector: 'avl-pagination',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="avl-pagination avl-pagination--{{ size() }}" aria-label="Pagination">
      @if (showInfo()) {
        <span class="avl-pagination__info">{{ rangeStart() }}-{{ rangeEnd() }} / {{ total() }}</span>
      }
      <button type="button" class="avl-pagination__btn" [disabled]="page() <= 1" (click)="goTo(page() - 1)" aria-label="Previous page">
        <i class="ti ti-chevron-left"></i>
      </button>
      @for (item of pageItems(); track $index) {
        @if (item === -1) {
          <span class="avl-pagination__ellipsis">&hellip;</span>
        } @else {
          <button
            type="button"
            class="avl-pagination__btn"
            [class.active]="item === page()"
            [attr.aria-current]="item === page() ? 'page' : null"
            (click)="goTo(item)"
          >
            {{ item }}
          </button>
        }
      }
      <button type="button" class="avl-pagination__btn" [disabled]="page() >= totalPages()" (click)="goTo(page() + 1)" aria-label="Next page">
        <i class="ti ti-chevron-right"></i>
      </button>
    </nav>
  `
})
export class AvlPaginationComponent {
  /** 1-based current page. */
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly total = input.required<number>();
  /** Control height — sm (30px) for compact contexts like a dialog footer, md (38px) for standalone toolbars. */
  readonly size = input<'sm' | 'md'>('sm');
  readonly showInfo = input(true);
  readonly pageChange = output<number>();

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  readonly rangeStart = computed(() => (this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1));
  readonly rangeEnd = computed(() => Math.min(this.page() * this.pageSize(), this.total()));

  /** Up to 5 page-number slots (plus prev/next = 7 controls max), -1 marks an ellipsis. */
  readonly pageItems = computed<number[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const items: number[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (start > 2) {
      items.push(-1);
    }
    for (let p = start; p <= end; p++) {
      items.push(p);
    }
    if (end < total - 1) {
      items.push(-1);
    }
    items.push(total);
    return items;
  });

  goTo(targetPage: number): void {
    if (targetPage >= 1 && targetPage <= this.totalPages() && targetPage !== this.page()) {
      this.pageChange.emit(targetPage);
    }
  }
}
