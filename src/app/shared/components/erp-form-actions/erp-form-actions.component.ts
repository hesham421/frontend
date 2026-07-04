import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { AvlButtonComponent } from 'src/app/shared/buttons/avl-button/avl-button.component';

/**
 * ErpFormActionsComponent
 *
 * Generic form action buttons (Save/Cancel) with loading and disabled states.
 * Entity-agnostic - contains no business logic or submit handling.
 * Composed from the AVELYNQ Button primitive (Phase 4).
 *
 * @requirement FE-REQ-SHARED-001
 * @task TASK-FE-SHARED-001
 */
@Component({
  selector: 'erp-form-actions',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    AvlButtonComponent
  ],
  template: `
    <div class="erp-form-actions">
      @if (showCancel) {
        <avl-button variant="secondary" [disabled]="loading" (clicked)="onCancel()">
          {{ cancelKey | translate }}
        </avl-button>
      }

      @if (showSave) {
        <avl-button
          variant="primary"
          [loading]="loading"
          [disabled]="disabled"
          (clicked)="onSave()"
        >
          {{ (loading ? loadingKey : saveKey) | translate }}
        </avl-button>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .erp-form-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--space-3, 12px);
      padding-block-start: var(--space-4, 16px);
      margin-block-start: var(--space-4, 16px);
      border-block-start: 1px solid var(--border-subtle, #D4DDE7);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErpFormActionsComponent {
  /** Translation key for the save button */
  @Input() saveKey = 'COMMON.SAVE';
  
  /** Translation key for the cancel button */
  @Input() cancelKey = 'COMMON.CANCEL';
  
  /** Translation key displayed while loading */
  @Input() loadingKey = 'COMMON.SAVING';
  
  /** Whether to show the save button */
  @Input() showSave = true;
  
  /** Whether to show the cancel button */
  @Input() showCancel = true;
  
  /** Whether the form is currently submitting */
  @Input() loading = false;
  
  /** Whether the save button should be disabled (e.g., invalid form) */
  @Input() disabled = false;
  
  /** Emitted when the save button is clicked */
  @Output() saveClicked = new EventEmitter<void>();
  
  /** Emitted when the cancel button is clicked */
  @Output() cancelClicked = new EventEmitter<void>();
  
  protected onSave(): void {
    if (!this.loading && !this.disabled) {
      this.saveClicked.emit();
    }
  }
  
  protected onCancel(): void {
    if (!this.loading) {
      this.cancelClicked.emit();
    }
  }
}
