import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AvlCardComponent } from 'src/app/shared/data-display/avl-card/avl-card.component';
import { AvlInputComponent } from 'src/app/shared/forms/avl-input/avl-input.component';
import { AvlIconButtonComponent } from 'src/app/shared/buttons/avl-icon-button/avl-icon-button.component';

/**
 * Generic item interface for the dual list.
 * Uses generic properties to remain entity-agnostic.
 */
export interface DualListItem {
  /** Unique identifier for the item */
  id: string | number;
  /** Display label for the item */
  label: string;
  /** Optional secondary label */
  secondaryLabel?: string;
  /** Whether the item is disabled */
  disabled?: boolean;
}

/**
 * ErpDualListComponent
 * 
 * Generic dual-list selector for transferring items between two lists.
 * Entity-agnostic - contains no business logic or specific entity knowledge.
 * 
 * @requirement FE-REQ-SHARED-001
 * @task TASK-FE-SHARED-001
 */
@Component({
  selector: 'erp-dual-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    AvlCardComponent,
    AvlInputComponent,
    AvlIconButtonComponent
  ],
  template: `
    <div class="erp-dual-list" [class.erp-dual-list--disabled]="disabled">
      <!-- Available Items Panel -->
      <avl-card class="erp-dual-list-panel" padding="none" [showHeader]="true">
        <div card-header class="erp-dual-list-header-content">
          <span>{{ availableTitleKey | translate }}</span>
          <span class="erp-dual-list-count">({{ filteredAvailable().length }})</span>
        </div>

        <div *ngIf="searchable" class="erp-dual-list-search">
          <avl-input
            [placeholder]="'COMMON.SEARCH' | translate"
            [disabled]="disabled"
            [value]="availableSearch()"
            (valueChange)="onAvailableSearchChange($event)"
          />
        </div>

        <div class="erp-dual-list-items" role="listbox" [attr.aria-label]="availableTitleKey | translate">
          <div
            *ngFor="let item of filteredAvailable(); trackBy: trackById"
            class="erp-dual-list-item"
            [class.erp-dual-list-item--selected]="isAvailableSelected(item)"
            [class.erp-dual-list-item--disabled]="item.disabled"
            role="option"
            [attr.aria-selected]="isAvailableSelected(item)"
            [attr.aria-disabled]="item.disabled || disabled"
            (click)="toggleAvailableSelection(item)"
          >
            <span class="erp-dual-list-item-label">{{ item.label }}</span>
            <span *ngIf="item.secondaryLabel" class="erp-dual-list-item-secondary">
              {{ item.secondaryLabel }}
            </span>
          </div>

          <div *ngIf="filteredAvailable().length === 0" class="erp-dual-list-empty">
            {{ 'COMMON.NO_ITEMS' | translate }}
          </div>
        </div>
      </avl-card>

      <!-- Transfer Actions -->
      <div class="erp-dual-list-actions">
        <avl-icon-button
          icon="ti ti-chevron-left"
          variant="outline"
          size="sm"
          [disabled]="disabled || selectedAvailableItems().size === 0"
          [label]="'COMMON.ADD_SELECTED' | translate"
          (clicked)="moveToSelected()"
        />

        <avl-icon-button
          *ngIf="!singleSelect"
          icon="ti ti-chevrons-left"
          variant="outline"
          size="sm"
          [disabled]="disabled || filteredAvailable().length === 0"
          [label]="'COMMON.ADD_ALL' | translate"
          (clicked)="moveAllToSelected()"
        />

        <avl-icon-button
          icon="ti ti-chevron-right"
          variant="outline"
          size="sm"
          [disabled]="disabled || selectedSelectedItems().size === 0"
          [label]="'COMMON.REMOVE_SELECTED' | translate"
          (clicked)="moveToAvailable()"
        />

        <avl-icon-button
          *ngIf="!singleSelect"
          icon="ti ti-chevrons-right"
          variant="outline"
          size="sm"
          [disabled]="disabled || filteredSelected().length === 0"
          [label]="'COMMON.REMOVE_ALL' | translate"
          (clicked)="moveAllToAvailable()"
        />
      </div>

      <!-- Selected Items Panel -->
      <avl-card class="erp-dual-list-panel" padding="none" [showHeader]="true">
        <div card-header class="erp-dual-list-header-content">
          <span>{{ selectedTitleKey | translate }}</span>
          <span class="erp-dual-list-count">({{ filteredSelected().length }})</span>
        </div>

        <div *ngIf="searchable" class="erp-dual-list-search">
          <avl-input
            [placeholder]="'COMMON.SEARCH' | translate"
            [disabled]="disabled"
            [value]="selectedSearch()"
            (valueChange)="onSelectedSearchChange($event)"
          />
        </div>

        <div class="erp-dual-list-items" role="listbox" [attr.aria-label]="selectedTitleKey | translate">
          <div
            *ngFor="let item of filteredSelected(); trackBy: trackById"
            class="erp-dual-list-item"
            [class.erp-dual-list-item--selected]="isSelectedSelected(item)"
            [class.erp-dual-list-item--disabled]="item.disabled"
            role="option"
            [attr.aria-selected]="isSelectedSelected(item)"
            [attr.aria-disabled]="item.disabled || disabled"
            (click)="toggleSelectedSelection(item)"
          >
            <span class="erp-dual-list-item-label">{{ item.label }}</span>
            <span *ngIf="item.secondaryLabel" class="erp-dual-list-item-secondary">
              {{ item.secondaryLabel }}
            </span>
          </div>

          <div *ngIf="filteredSelected().length === 0" class="erp-dual-list-empty">
            {{ 'COMMON.NO_ITEMS' | translate }}
          </div>
        </div>
      </avl-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .erp-dual-list {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: var(--space-4, 16px);
      align-items: stretch;
    }
    
    .erp-dual-list--disabled {
      opacity: 0.6;
      pointer-events: none;
    }
    
    .erp-dual-list-panel {
      display: flex;
      flex-direction: column;
    }

    .erp-dual-list-header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3, 12px);
      width: 100%;
      font-size: var(--fs-body, 14px);
      font-weight: var(--fw-medium, 500);
    }

    .erp-dual-list-count {
      color: var(--text-muted, #647488);
    }

    .erp-dual-list-search {
      padding: var(--space-3, 12px);
      border-block-end: 1px solid var(--border-subtle, #D4DDE7);
    }
    
    .erp-dual-list-items {
      flex: 1;
      overflow-y: auto;
      min-block-size: 200px;
      max-block-size: 300px;
    }
    
    .erp-dual-list-item {
      display: flex;
      flex-direction: column;
      gap: var(--space-1, 4px);
      padding: var(--space-2, 8px) var(--space-4, 16px);
      cursor: pointer;
      transition: background-color var(--dur-fast, 120ms) var(--ease-standard, cubic-bezier(0.2, 0, 0.1, 1));
      border-block-end: 1px solid var(--erp-color-border-light, rgba(0,0,0,0.05));
    }
    
    .erp-dual-list-item:last-child {
      border-block-end: none;
    }
    
    .erp-dual-list-item:hover:not(.erp-dual-list-item--disabled) {
      background-color: var(--surface-hover, #F1F5F9);
    }

    .erp-dual-list-item--selected {
      background-color: var(--surface-brand-subtle, #EAF1FE);
    }

    .erp-dual-list-item--selected:hover {
      background-color: color-mix(in srgb, var(--brand-primary, #2466D8) 15%, var(--surface-card, #FFFFFF)) !important;
    }
    
    .erp-dual-list-item--disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .erp-dual-list-item-label {
      font-size: var(--fs-body, 14px);
      color: var(--text-strong, inherit);
    }
    
    .erp-dual-list-item-secondary {
      font-size: var(--fs-xs, 12px);
      color: var(--text-muted, #647488);
    }
    
    .erp-dual-list-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-6, 24px);
      color: var(--text-muted, #647488);
      font-size: var(--fs-body, 14px);
    }
    
    .erp-dual-list-actions {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: var(--space-2, 8px);
    }
    
    @media (max-width: 768px) {
      .erp-dual-list {
        grid-template-columns: 1fr;
        gap: var(--space-3, 12px);
      }
      
      .erp-dual-list-actions {
        flex-direction: row;
        justify-content: center;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErpDualListComponent {
  /** Items available for selection */
  @Input() set availableItems(value: DualListItem[]) {
    this._availableItems.set(value || []);
  }
  
  /** Items currently selected */
  @Input() set selectedItems(value: DualListItem[]) {
    this._selectedItems.set(value || []);
  }
  
  /** Whether the component is disabled */
  @Input() disabled = false;
  
  /** Whether to show search inputs */
  @Input() searchable = true;
  
  /** Whether only a single item can be selected (replaces existing selection) */
  @Input() singleSelect = false;
  
  /** Translation key for the available items panel title */
  @Input() availableTitleKey = 'COMMON.AVAILABLE';
  
  /** Translation key for the selected items panel title */
  @Input() selectedTitleKey = 'COMMON.SELECTED';
  
  /** Emitted when the selected items change */
  @Output() selectedChange = new EventEmitter<DualListItem[]>();
  
  // Internal state
  protected readonly _availableItems = signal<DualListItem[]>([]);
  protected readonly _selectedItems = signal<DualListItem[]>([]);
  
  protected readonly availableSearch = signal('');
  protected readonly selectedSearch = signal('');
  
  protected readonly selectedAvailableItems = signal<Set<string | number>>(new Set());
  protected readonly selectedSelectedItems = signal<Set<string | number>>(new Set());
  
  // Filtered items based on search
  protected readonly filteredAvailable = computed(() => {
    const items = this._availableItems();
    const search = this.availableSearch().toLowerCase().trim();
    if (!search) return items;
    return items.filter(item => 
      item.label.toLowerCase().includes(search) ||
      item.secondaryLabel?.toLowerCase().includes(search)
    );
  });
  
  protected readonly filteredSelected = computed(() => {
    const items = this._selectedItems();
    const search = this.selectedSearch().toLowerCase().trim();
    if (!search) return items;
    return items.filter(item => 
      item.label.toLowerCase().includes(search) ||
      item.secondaryLabel?.toLowerCase().includes(search)
    );
  });
  
  protected trackById(_index: number, item: DualListItem): string | number {
    return item.id;
  }
  
  protected isAvailableSelected(item: DualListItem): boolean {
    return this.selectedAvailableItems().has(item.id);
  }
  
  protected isSelectedSelected(item: DualListItem): boolean {
    return this.selectedSelectedItems().has(item.id);
  }
  
  protected toggleAvailableSelection(item: DualListItem): void {
    if (this.disabled || item.disabled) return;
    
    this.selectedAvailableItems.update(set => {
      const newSet = new Set(set);
      if (newSet.has(item.id)) {
        newSet.delete(item.id);
      } else {
        newSet.add(item.id);
      }
      return newSet;
    });
  }
  
  protected toggleSelectedSelection(item: DualListItem): void {
    if (this.disabled || item.disabled) return;
    
    this.selectedSelectedItems.update(set => {
      const newSet = new Set(set);
      if (newSet.has(item.id)) {
        newSet.delete(item.id);
      } else {
        newSet.add(item.id);
      }
      return newSet;
    });
  }
  
  protected onAvailableSearchChange(value: string): void {
    this.availableSearch.set(value);
    // Clear selection when search changes
    this.selectedAvailableItems.set(new Set());
  }
  
  protected onSelectedSearchChange(value: string): void {
    this.selectedSearch.set(value);
    // Clear selection when search changes
    this.selectedSelectedItems.set(new Set());
  }
  
  protected moveToSelected(): void {
    if (this.disabled) return;
    
    const selectedIds = this.selectedAvailableItems();
    if (selectedIds.size === 0) return;
    
    const itemsToMove = this._availableItems().filter(item => 
      selectedIds.has(item.id) && !item.disabled
    );
    
    if (this.singleSelect) {
      // In single-select mode, replace any existing selection
      const itemToMove = itemsToMove[0]; // Only take the first one
      if (!itemToMove) return;
      
      // Move existing selected items back to available
      const currentSelected = this._selectedItems();
      const newAvailable = [
        ...this._availableItems().filter(item => item.id !== itemToMove.id),
        ...currentSelected
      ];
      const newSelected = [itemToMove];
      
      this._availableItems.set(newAvailable);
      this._selectedItems.set(newSelected);
      this.selectedAvailableItems.set(new Set());
      this.selectedChange.emit(newSelected);
      return;
    }
    
    const newAvailable = this._availableItems().filter(item => !selectedIds.has(item.id));
    const newSelected = [...this._selectedItems(), ...itemsToMove];
    
    this._availableItems.set(newAvailable);
    this._selectedItems.set(newSelected);
    this.selectedAvailableItems.set(new Set());
    
    this.selectedChange.emit(newSelected);
  }
  
  protected moveAllToSelected(): void {
    if (this.disabled) return;
    
    const availableToMove = this.filteredAvailable().filter(item => !item.disabled);
    const availableIds = new Set(availableToMove.map(item => item.id));
    
    const newAvailable = this._availableItems().filter(item => !availableIds.has(item.id));
    const newSelected = [...this._selectedItems(), ...availableToMove];
    
    this._availableItems.set(newAvailable);
    this._selectedItems.set(newSelected);
    this.selectedAvailableItems.set(new Set());
    
    this.selectedChange.emit(newSelected);
  }
  
  protected moveToAvailable(): void {
    if (this.disabled) return;
    
    const selectedIds = this.selectedSelectedItems();
    if (selectedIds.size === 0) return;
    
    const itemsToMove = this._selectedItems().filter(item => 
      selectedIds.has(item.id) && !item.disabled
    );
    
    const newSelected = this._selectedItems().filter(item => !selectedIds.has(item.id));
    const newAvailable = [...this._availableItems(), ...itemsToMove];
    
    this._availableItems.set(newAvailable);
    this._selectedItems.set(newSelected);
    this.selectedSelectedItems.set(new Set());
    
    this.selectedChange.emit(newSelected);
  }
  
  protected moveAllToAvailable(): void {
    if (this.disabled) return;
    
    const selectedToMove = this.filteredSelected().filter(item => !item.disabled);
    const selectedIds = new Set(selectedToMove.map(item => item.id));
    
    const newSelected = this._selectedItems().filter(item => !selectedIds.has(item.id));
    const newAvailable = [...this._availableItems(), ...selectedToMove];
    
    this._availableItems.set(newAvailable);
    this._selectedItems.set(newSelected);
    this.selectedSelectedItems.set(new Set());
    
    this.selectedChange.emit(newSelected);
  }
}
