import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { ErpPermissionDirective } from '../../directives/erp-permission.directive';
import { AvlIconButtonComponent } from 'src/app/shared/buttons/avl-icon-button/avl-icon-button.component';

/**
 * ErpCrudActionsCellComponent
 *
 * Generic action cell for CRUD operations (Edit/Delete) in data grids.
 * Permission-based visibility via erpPermission directive.
 * Entity-agnostic - contains no business logic.
 * Composed from the AVELYNQ IconButton primitive (Phase 4).
 *
 * @requirement FE-REQ-SHARED-001
 * @task TASK-FE-SHARED-001
 */
@Component({
  selector: 'erp-crud-actions-cell',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ErpPermissionDirective,
    AvlIconButtonComponent
  ],
  template: `
    <div class="erp-action-cell">
      @if (showEdit) {
        <avl-icon-button
          [erpPermission]="editPermission"
          icon="ti ti-pencil"
          variant="ghost"
          size="sm"
          [label]="'COMMON.EDIT' | translate"
          [disabled]="disabled"
          (clicked)="onEdit($event)"
        />
      }

      @if (showDelete) {
        <avl-icon-button
          [erpPermission]="deletePermission"
          icon="ti ti-trash"
          variant="ghost"
          size="sm"
          [label]="'COMMON.DELETE' | translate"
          [disabled]="disabled"
          (clicked)="onDelete($event)"
        />
      }

      <!-- Additional custom actions slot -->
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .erp-action-cell {
      display: flex;
      align-items: center;
      gap: var(--space-2, 8px);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErpCrudActionsCellComponent {
  /** Whether to show the edit button */
  @Input() showEdit = true;

  /** Whether to show the delete button */
  @Input() showDelete = true;

  /** Permission required for the edit action */
  @Input() editPermission = '';

  /** Permission required for the delete action */
  @Input() deletePermission = '';

  /** Whether all actions are disabled */
  @Input() disabled = false;

  /** Emitted when the edit button is clicked */
  @Output() editClicked = new EventEmitter<void>();

  /** Emitted when the delete button is clicked */
  @Output() deleteClicked = new EventEmitter<void>();

  protected onEdit(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.disabled) {
      this.editClicked.emit();
    }
  }

  protected onDelete(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.disabled) {
      this.deleteClicked.emit();
    }
  }
}
