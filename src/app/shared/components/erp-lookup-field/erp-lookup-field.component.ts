import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { LookupConfig, LookupItem } from 'src/app/core/lookup/lookup.model';
import { LookupDataService } from 'src/app/core/lookup/lookup-data.service';
import { ErpAutocompleteComponent } from './erp-autocomplete/erp-autocomplete.component';
import { ErpLookupDialogComponent } from './erp-lookup-dialog/erp-lookup-dialog.component';
import { DialogService } from 'src/app/shared/overlay/dialog/dialog.service';
import { AvlInputComponent } from 'src/app/shared/forms/avl-input/avl-input.component';
import { AvlIconButtonComponent } from 'src/app/shared/buttons/avl-icon-button/avl-icon-button.component';

/**
 * ErpLookupFieldComponent
 *
 * Unified entry point for all entity lookups across the ERP system.
 * Implements ControlValueAccessor so it integrates seamlessly with Reactive Forms.
 *
 * Behavior:
 *  - Stores ONLY the selected entity ID as the form value
 *  - Displays a formatted label (LookupItem.display)
 *  - Delegates to ErpAutocompleteComponent (mode='quick')
 *    or opens ErpLookupDialogComponent via NgbModal (mode='advanced')
 *  - Resolves display label on init when form has an existing ID
 *
 * Usage:
 * ```html
 * <erp-lookup-field
 *   formControlName="accountId"
 *   [config]="accountLookupConfig"
 * ></erp-lookup-field>
 * ```
 *
 * @architecture Shared layer — UI only
 */
@Component({
  selector: 'erp-lookup-field',
  standalone: true,
  imports: [CommonModule, TranslateModule, ErpAutocompleteComponent, AvlInputComponent, AvlIconButtonComponent],
  templateUrl: './erp-lookup-field.component.html',
  styleUrls: ['./erp-lookup-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ErpLookupFieldComponent),
      multi: true
    }
  ]
})
export class ErpLookupFieldComponent implements ControlValueAccessor, OnInit, OnDestroy {
  /** Lookup configuration — determines mode, endpoint, columns, etc. */
  @Input({ required: true }) config!: LookupConfig;

  /** Emits the full LookupItem when the user makes a selection (for capturing extra fields beyond the ID). */
  @Output() itemSelected = new EventEmitter<LookupItem>();

  private readonly lookupService = inject(LookupDataService);
  private readonly dialogService = inject(DialogService);

  // ── Internal State ───────────────────────────────────────────────

  /** Currently selected entity ID (the actual form value) */
  readonly selectedId = signal<number | null>(null);

  /** Display label for the selected entity */
  readonly displayText = signal('');

  /** Whether the control is disabled */
  readonly isDisabled = signal(false);

  private fetchSub = Subscription.EMPTY;

  // ── ControlValueAccessor callbacks ───────────────────────────────

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  // ── Lifecycle ────────────────────────────────────────────────────

  ngOnInit(): void {
    // If the form already has a value (edit mode), resolve the display label
    const currentId = this.selectedId();
    if (currentId != null) {
      this.resolveDisplay(currentId);
    }
  }

  ngOnDestroy(): void {
    this.fetchSub.unsubscribe();
  }

  // ── ControlValueAccessor Implementation ──────────────────────────

  writeValue(value: number | null): void {
    this.selectedId.set(value ?? null);
    if (value != null) {
      this.resolveDisplay(value);
    } else {
      this.displayText.set('');
    }
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  // ── Quick Mode — Autocomplete Events ─────────────────────────────

  onAutocompleteSelected(item: LookupItem): void {
    this.selectedId.set(item.id);
    this.displayText.set(item.display);
    this.onChange(item.id);
    this.onTouched();
    this.itemSelected.emit(item);
  }

  onAutocompleteCleared(): void {
    this.selectedId.set(null);
    this.displayText.set('');
    this.onChange(null);
    this.onTouched();
  }

  // ── Advanced Mode — Dialog Trigger ───────────────────────────────

  openDialog(): void {
    if (this.isDisabled()) return;

    const modalRef = this.dialogService.open(ErpLookupDialogComponent, {
      size: 'lg',
      closeOnScrim: false,
      closeOnEscape: true
    });

    modalRef.componentInstance.config = this.config;

    modalRef.result.then(
      (item: LookupItem) => {
        this.selectedId.set(item.id);
        this.displayText.set(item.display);
        this.onChange(item.id);
        this.onTouched();
        this.itemSelected.emit(item);
      },
      () => {
        // Dialog dismissed — no action
        this.onTouched();
      }
    );
  }

  // ── Clear Selection ──────────────────────────────────────────────

  clearSelection(): void {
    if (this.isDisabled()) return;
    this.selectedId.set(null);
    this.displayText.set('');
    this.onChange(null);
    this.onTouched();
  }

  // ── Display Resolution ───────────────────────────────────────────

  /**
   * Fetch the display label for an existing ID.
   * Called when the form is initialised with an ID (edit mode).
   */
  private resolveDisplay(id: number): void {
    this.fetchSub.unsubscribe();
    this.fetchSub = this.lookupService
      .fetchById(this.config.endpoint, id)
      .subscribe({
        next: item => this.displayText.set(item.display),
        error: () => this.displayText.set(`#${id}`)
      });
  }
}
