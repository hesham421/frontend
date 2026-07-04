import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface AvlSelectOption {
  value: string;
  label: string;
}

/**
 * AVELYNQ Select — design-system/avelynq-source/components/forms/Select.d.ts.
 * Native-select dropdown styled to the Input field system. Options accept
 * plain strings or {value,label} objects. CVA for `formControlName`.
 */
@Component({
  selector: 'avl-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="avl-field">
      @if (label) {
        <label class="avl-field__label" [for]="id">
          {{ label }}
          @if (required) {
            <span class="avl-field__required">*</span>
          }
        </label>
      }
      <div class="avl-select">
        <select
          [id]="id"
          [value]="value"
          [disabled]="disabled"
          [required]="required"
          class="avl-select__control"
          [class.avl-select__control--error]="!!error"
          (change)="onChange_($event)"
          (blur)="onBlur()"
        >
          @if (placeholder) {
            <option value="" disabled>{{ placeholder }}</option>
          }
          @for (opt of normalizedOptions; track opt.value) {
            <option [value]="opt.value">{{ opt.label }}</option>
          }
        </select>
        <i class="ti ti-chevron-down avl-select__chevron" aria-hidden="true"></i>
      </div>
      @if (error) {
        <span class="avl-field__error">{{ error }}</span>
      } @else if (hint) {
        <span class="avl-field__hint">{{ hint }}</span>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .avl-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-family: var(--font-sans);
    }

    .avl-field__label {
      font-size: var(--fs-xs);
      font-weight: var(--fw-medium);
      color: var(--text-body);
    }

    .avl-field__required { color: var(--red-500); margin-inline-start: 3px; }

    .avl-select { position: relative; }

    .avl-select__control {
      width: 100%;
      height: var(--control-md);
      padding: 0 36px 0 12px;
      appearance: none;
      background: #fff;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      font-family: var(--font-sans);
      font-size: var(--fs-body);
      color: var(--text-strong);
      cursor: pointer;
      outline: none;
      transition: border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard);
    }

    [dir='rtl'] .avl-select__control { padding: 0 12px 0 36px; }

    .avl-select__control:focus {
      border-color: var(--brand-primary);
      box-shadow: var(--focus-ring);
    }

    .avl-select__control--error {
      border-color: var(--red-500);
    }

    .avl-select__control--error:focus {
      box-shadow: none;
    }

    .avl-select__control:disabled {
      background: var(--surface-sunken);
      cursor: not-allowed;
    }

    .avl-select__chevron {
      position: absolute;
      inset-inline-end: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-subtle);
      pointer-events: none;
      font-size: 16px;
    }

    .avl-field__error { font-size: var(--fs-xs); color: var(--red-600); }
    .avl-field__hint { font-size: var(--fs-xs); color: var(--text-muted); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AvlSelectComponent),
      multi: true
    }
  ]
})
export class AvlSelectComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() hint?: string;
  @Input() error?: string;
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input() id?: string;

  @Input() set options(opts: (string | AvlSelectOption)[]) {
    this.normalizedOptions = (opts ?? []).map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  }

  @Input() set value(v: string) {
    this.valueSignal.set(v ?? '');
  }
  get value(): string {
    return this.valueSignal();
  }

  @Output() valueChange = new EventEmitter<string>();

  normalizedOptions: AvlSelectOption[] = [];

  protected readonly valueSignal = signal('');

  private onChangeFn: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.valueSignal.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onChange_(event: Event): void {
    const next = (event.target as HTMLSelectElement).value;
    this.valueSignal.set(next);
    this.valueChange.emit(next);
    this.onChangeFn(next);
  }

  onBlur(): void {
    this.onTouched();
  }
}
