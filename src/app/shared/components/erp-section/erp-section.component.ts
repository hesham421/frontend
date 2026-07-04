import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { AvlCardComponent } from 'src/app/shared/data-display/avl-card/avl-card.component';

/**
 * ErpSectionComponent
 *
 * Pure UI wrapper for grouping fields inside a form. Composed from the
 * AVELYNQ Card primitive (Phase 4).
 */
@Component({
  selector: 'erp-section',
  standalone: true,
  imports: [CommonModule, TranslateModule, AvlCardComponent],
  templateUrl: './erp-section.component.html',
  styleUrls: ['./erp-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErpSectionComponent {
  @Input() titleKey = '';
  @Input() descriptionKey?: string;
}
