import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, ViewChild, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * AVELYNQ Checkbox — design-system/avelynq-source/components/forms/Checkbox.d.ts.
 * Checked / indeterminate / disabled states. CVA for `formControlName`.
 */
@Component({
  selector: 'avl-checkbox',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label class="avl-checkbox" [class.avl-checkbox--disabled]="disabled" [for]="id">
      <span class="avl-checkbox__box" [class.avl-checkbox__box--on]="checked() || indeterminate">
        <input
          #input
          [id]="id"
          type="checkbox"
          class="avl-checkbox__input"
          [checked]="checked()"
          [disabled]="disabled"
          (change)="onToggle($event)"
          (blur)="onTouched()"
        />
        @if (indeterminate) {
          <span class="avl-checkbox__dash"></span>
        } @else if (checked()) {
          <i class="ti ti-check avl-checkbox__check" aria-hidden="true"></i>
        }
      </span>
      @if (label) {
        <span>{{ label }}</span>
      }
      <ng-content></ng-content>
    </label>
  `,
  styles: [`
    :host { display: inline-block; }

    .avl-checkbox {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      cursor: pointer;
      font-family: var(--font-sans);
      font-size: var(--fs-body);
      color: var(--text-body);
    }

    .avl-checkbox--disabled { cursor: not-allowed; opacity: 0.5; }

    .avl-checkbox__box {
      position: relative;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      border-radius: var(--radius-xs);
      border: 1.5px solid var(--border-strong);
      background: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard);
    }

    .avl-checkbox__box--on {
      border-color: var(--brand-primary);
      background: var(--brand-primary);
    }

    .avl-checkbox__input {
      position: absolute;
      opacity: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      cursor: inherit;
    }

    .avl-checkbox__check { color: #fff; font-size: 13px; font-weight: 700; }

    .avl-checkbox__dash {
      width: 9px;
      height: 2px;
      background: #fff;
      border-radius: 1px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AvlCheckboxComponent),
      multi: true
    }
  ]
})
export class AvlCheckboxComponent implements ControlValueAccessor, AfterViewInit, OnChanges {
  @Input() label?: string;
  @Input() disabled = false;
  @Input() indeterminate = false;
  @Input() id?: string;

  @Input() set checkedInput(v: boolean) {
    this.checked.set(!!v);
  }

  @ViewChild('input') private inputRef!: ElementRef<HTMLInputElement>;

  protected readonly checked = signal(false);

  private onChangeFn: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  ngAfterViewInit(): void {
    this.syncIndeterminate();
  }

  ngOnChanges(): void {
    this.syncIndeterminate();
  }

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

  private syncIndeterminate(): void {
    if (this.inputRef) {
      this.inputRef.nativeElement.indeterminate = this.indeterminate;
    }
  }
}
