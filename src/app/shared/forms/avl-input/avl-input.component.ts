import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * AVELYNQ Input — design-system/avelynq-source/components/forms/Input.d.ts.
 * Labelled text field with hint/error/icon/suffix. Implements
 * ControlValueAccessor for `formControlName` usage, and also exposes a
 * plain `value`/`valueChange` pair for template-driven / non-forms callers
 * (e.g. erp-autocomplete's hand-rolled search box).
 */
@Component({
  selector: 'avl-input',
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
      <div class="avl-field__control" [class.avl-field__control--error]="!!error" [class.avl-field__control--disabled]="disabled">
        @if (iconLeft) {
          <i [class]="iconLeft + ' avl-field__icon'" aria-hidden="true"></i>
        }
        <input
          [id]="id"
          [type]="type"
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readOnly]="readOnly"
          [required]="required"
          [attr.maxlength]="maxlength ?? null"
          [attr.minlength]="minlength ?? null"
          [attr.min]="min ?? null"
          [attr.max]="max ?? null"
          [attr.pattern]="pattern ?? null"
          [attr.autocomplete]="autocomplete ?? null"
          [attr.dir]="dir ?? null"
          [class.avl-field__input--mono]="mono"
          class="avl-field__input"
          (input)="onInput($event)"
          (blur)="onBlur()"
        />
        @if (suffix) {
          <span class="avl-field__suffix">{{ suffix }}</span>
        }
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
      letter-spacing: 0.01em;
    }

    .avl-field__required { color: var(--red-500); margin-inline-start: 3px; }

    .avl-field__control {
      display: flex;
      align-items: center;
      gap: 8px;
      height: var(--control-md);
      padding: 0 12px;
      background: #fff;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      transition: border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard);
    }

    .avl-field__control:focus-within {
      border-color: var(--brand-primary);
      box-shadow: var(--focus-ring);
    }

    .avl-field__control--error {
      border-color: var(--red-500);
    }

    .avl-field__control--error:focus-within {
      box-shadow: none;
    }

    .avl-field__control--disabled {
      background: var(--surface-sunken);
    }

    .avl-field__icon { color: var(--text-subtle); font-size: 16px; flex-shrink: 0; }

    .avl-field__input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      background: transparent;
      font-family: var(--font-sans);
      font-size: var(--fs-body);
      color: var(--text-strong);
      height: 100%;
    }

    .avl-field__input--mono { font-family: var(--font-mono); }

    .avl-field__suffix {
      color: var(--text-muted);
      font-size: var(--fs-sm);
      white-space: nowrap;
    }

    .avl-field__error { font-size: var(--fs-xs); color: var(--red-600); }
    .avl-field__hint { font-size: var(--fs-xs); color: var(--text-muted); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AvlInputComponent),
      multi: true
    }
  ]
})
export class AvlInputComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() hint?: string;
  @Input() error?: string;
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() iconLeft?: string;
  @Input() suffix?: string;
  @Input() disabled = false;
  @Input() readOnly = false;
  @Input() required = false;
  @Input() mono = false;
  @Input() id?: string;

  /** Native HTML attribute passthrough — forwarded to the internal <input> via [attr.*]. */
  @Input() maxlength?: number | string | null;
  @Input() minlength?: number | string | null;
  @Input() min?: number | string | null;
  @Input() max?: number | string | null;
  @Input() pattern?: string | null;
  @Input() autocomplete?: string | null;
  @Input() dir?: string | null;

  @Input() set value(v: string) {
    this.valueSignal.set(v ?? '');
  }
  get value(): string {
    return this.valueSignal();
  }

  @Output() valueChange = new EventEmitter<string>();

  protected readonly valueSignal = signal('');

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.valueSignal.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.valueSignal.set(next);
    this.valueChange.emit(next);
    this.onChange(next);
  }

  onBlur(): void {
    this.onTouched();
  }
}
