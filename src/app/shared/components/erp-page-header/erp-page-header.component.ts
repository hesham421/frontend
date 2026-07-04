import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { ErpPermissionDirective } from '../../directives/erp-permission.directive';
import { AvlButtonComponent } from 'src/app/shared/buttons/avl-button/avl-button.component';

/**
 * ErpPageHeaderComponent
 *
 * Generic page header with title and action buttons.
 * Entity-agnostic - contains no business logic.
 * Composed from the AVELYNQ Button primitive (Phase 4).
 *
 * @requirement FE-REQ-SHARED-001
 * @task TASK-FE-SHARED-001
 */
@Component({
  selector: 'erp-page-header',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ErpPermissionDirective,
    AvlButtonComponent
  ],
  template: `
    <div class="erp-page-header">
      <h1 class="erp-page-title">{{ titleKey | translate }}</h1>

      <div class="erp-page-actions">
        @if (showRefresh) {
          <avl-button variant="secondary" size="sm" iconLeft="ti ti-refresh" (clicked)="onRefresh()">
            <span class="d-none d-sm-inline">{{ 'COMMON.REFRESH' | translate }}</span>
          </avl-button>
        }

        @if (showAdd) {
          <avl-button [erpPermission]="addPermission" variant="primary" size="sm" iconLeft="ti ti-plus" (clicked)="onAdd()">
            <span class="d-none d-sm-inline">{{ 'COMMON.ADD' | translate }}</span>
          </avl-button>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .erp-page-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4, 16px);
      padding-block: var(--space-4, 16px);
    }

    .erp-page-title {
      margin: 0;
      font-size: var(--fs-display, clamp(28px, 3.6vw, 44px));
      font-weight: var(--fw-semibold, 600);
      line-height: var(--lh-snug, 1.3);
      color: var(--text-strong, inherit);
    }

    .erp-page-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-3, 12px);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErpPageHeaderComponent {
  /** Translation key for the page title */
  @Input() titleKey = '';
  
  /** Whether to show the add button */
  @Input() showAdd = true;
  
  /** Whether to show the refresh button */
  @Input() showRefresh = true;
  
  /** Permission required to show the add button */
  @Input() addPermission = '';
  
  /** Emitted when the add button is clicked */
  @Output() addClicked = new EventEmitter<void>();
  
  /** Emitted when the refresh button is clicked */
  @Output() refreshClicked = new EventEmitter<void>();
  
  protected onAdd(): void {
    this.addClicked.emit();
  }
  
  protected onRefresh(): void {
    this.refreshClicked.emit();
  }
}
