import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { AvlEmptyStateComponent } from 'src/app/shared/feedback/avl-empty-state/avl-empty-state.component';
import { AvlButtonComponent } from 'src/app/shared/buttons/avl-button/avl-button.component';

/**
 * ErpEmptyStateComponent
 *
 * Pure UI empty-state used for tables and lists. Composed from the
 * AVELYNQ EmptyState + Button primitives (Phase 4).
 */
@Component({
  selector: 'erp-empty-state',
  standalone: true,
  imports: [CommonModule, TranslateModule, AvlEmptyStateComponent, AvlButtonComponent],
  templateUrl: './erp-empty-state.component.html',
  styleUrls: ['./erp-empty-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErpEmptyStateComponent {
  @Input() titleKey = '';
  @Input() messageKey = '';
  @Input() icon?: string;
  @Input() actionLabelKey?: string;

  @Output() actionClicked = new EventEmitter<void>();
}
