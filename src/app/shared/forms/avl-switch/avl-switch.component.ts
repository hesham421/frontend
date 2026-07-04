import { ChangeDetectionStrategy, Component, Input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * AVELYNQ Switch — design-system/avelynq-source/components/forms/Switch.d.ts.
 * Toggle for immediate-effect settings. CVA for `formControlName`. Reserve
 * Checkbox for data tables / multi-select lists, per the spec's own guidance.
 */
@Component({
  selector: 'avl-switch',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label class="avl-switch" [class.avl-switch--disabled]="disabled" [for]="id">
      <span class="avl-switch__track" [class.avl-switch__track--on]="checked()">
        <input
          [id]="id"
          type="checkbox"
          class="avl-switch__input"
          [checked]="checked()"
          [disabled]="disabled"
          (change)="onToggle($event)"
          (blur)="onTouched()"
        />
        <span class="avl-switch__thumb"></span>
      </span>
      @if (label) {
        <span>{{ label }}</span>
      }
      <ng-content></ng-content>
    </label>
  `,
  styles: [`
    :host { display: inline-block; }

    .avl-switch {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-family: var(--font-sans);
      font-size: var(--fs-body);
      color: var(--text-body);
    }

    .avl-switch--disabled { cursor: not-allowed; opacity: 0.5; }

    .avl-switch__track {
      position: relative;
      width: 38px;
      height: 22px;
      flex-shrink: 0;
      border-radius: var(--radius-pill);
      background: var(--slate-300);
      transition: background var(--dur-base) var(--ease-standard);
    }

    .avl-switch__track--on { background: var(--brand-primary); }

    .avl-switch__input {
      position: absolute;
      opacity: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      cursor: inherit;
    }

    .avl-switch__thumb {
      position: absolute;
      top: 3px;
      inset-inline-start: 3px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #fff;
      box-shadow: var(--shadow-sm);
      transition: inset-inline-start var(--dur-base) var(--ease-out);
    }

    .avl-switch__track--on .avl-switch__thumb { inset-inline-start: 19px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AvlSwitchComponent),
      multi: true
    }
  ]
})
export class AvlSwitchComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() disabled = false;
  @Input() id?: string;

  protected readonly checked = signal(false);

  private onChangeFn: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: boolean): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onToggle(event: Event): void {
    const next = (event.target as HTMLInputElement).checked;
    this.checked.set(next);
    this.onChangeFn(next);
  }
}
