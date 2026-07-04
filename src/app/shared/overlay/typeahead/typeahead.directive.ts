import {
  Component,
  ChangeDetectionStrategy,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Overlay, OverlayRef, ConnectedPosition } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'avl-typeahead-panel',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="avl-dropdown__panel">
      @for (item of items; track $index) {
        <button
          type="button"
          class="avl-dropdown__item"
          [class.active]="$index === activeIndex"
          (mouseenter)="activeIndex = $index"
          (click)="select.emit(item)"
        >
          {{ display ? display(item) : item }}
        </button>
      }
    </div>
  `
})
class TypeaheadPanelComponent<T> {
  items: T[] = [];
  activeIndex = -1;
  display?: (item: T) => string;
  readonly select = new EventEmitter<T>();
}

/**
 * AVELYNQ extension (design-system/avelynq-extensions/Typeahead.prompt.md)
 * — no upstream AVELYNQ spec, and no real usage in the app today
 * (erp-autocomplete is a separate hand-rolled implementation). Designed
 * for future adoption; not wired into erp-autocomplete in this phase.
 *
 * Consumer owns debouncing (matches erp-autocomplete's existing pattern):
 *   <input [avlTypeahead]="search$" (avlTypeaheadSelect)="onSelect($event)">
 * where search$ = (term: string) => Observable<T[]>
 */
@Directive({
  selector: '[avlTypeahead]',
  standalone: true,
  host: {
    '(input)': 'onInput($event)',
    '(keydown.arrowdown)': 'onArrowDown($event)',
    '(keydown.arrowup)': 'onArrowUp($event)',
    '(keydown.enter)': 'onEnter($event)',
    '(keydown.escape)': 'close()',
    '(blur)': 'onBlur()'
  }
})
export class AvlTypeaheadDirective<T = unknown> implements OnDestroy {
  @Input('avlTypeahead') search!: (term: string) => Observable<T[]>;
  @Input() avlTypeaheadMinChars = 1;
  @Input() avlTypeaheadDisplay?: (item: T) => string;
  @Output() avlTypeaheadSelect = new EventEmitter<T>();

  private readonly overlay = inject(Overlay);
  private readonly elementRef = inject(ElementRef<HTMLInputElement>);
  private overlayRef?: OverlayRef;
  private panelRef?: import('@angular/core').ComponentRef<TypeaheadPanelComponent<T>>;
  private searchSub?: Subscription;

  private static readonly POSITIONS: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 }
  ];

  onInput(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchSub?.unsubscribe();
    if (term.length < this.avlTypeaheadMinChars) {
      this.close();
      return;
    }
    this.searchSub = this.search(term).subscribe((results) => {
      if (results.length) {
        this.openPanel(results);
      } else {
        this.close();
      }
    });
  }

  private openPanel(items: T[]): void {
    if (!this.overlayRef) {
      const positionStrategy = this.overlay
        .position()
        .flexibleConnectedTo(this.elementRef.nativeElement)
        .withPositions(AvlTypeaheadDirective.POSITIONS)
        .withFlexibleDimensions(true)
        .withPush(true);

      this.overlayRef = this.overlay.create({
        positionStrategy,
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
        panelClass: 'avl-typeahead-overlay-pane',
        minWidth: this.elementRef.nativeElement.offsetWidth
      });

      const portal = new ComponentPortal(TypeaheadPanelComponent<T>);
      this.panelRef = this.overlayRef.attach(portal) as import('@angular/core').ComponentRef<TypeaheadPanelComponent<T>>;
      this.panelRef.instance.select.subscribe((item: T) => {
        this.avlTypeaheadSelect.emit(item);
        this.close();
      });
    }

    this.panelRef!.instance.items = items;
    this.panelRef!.instance.activeIndex = -1;
    this.panelRef!.instance.display = this.avlTypeaheadDisplay;
    this.panelRef!.changeDetectorRef.markForCheck();
  }

  onArrowDown(event: Event): void {
    if (!this.panelRef) {
      return;
    }
    event.preventDefault();
    const instance = this.panelRef.instance;
    instance.activeIndex = Math.min(instance.activeIndex + 1, instance.items.length - 1);
    this.panelRef.changeDetectorRef.markForCheck();
  }

  onArrowUp(event: Event): void {
    if (!this.panelRef) {
      return;
    }
    event.preventDefault();
    const instance = this.panelRef.instance;
    instance.activeIndex = Math.max(instance.activeIndex - 1, 0);
    this.panelRef.changeDetectorRef.markForCheck();
  }

  onEnter(event: Event): void {
    if (!this.panelRef || this.panelRef.instance.activeIndex < 0) {
      return;
    }
    event.preventDefault();
    const instance = this.panelRef.instance;
    const item = instance.items[instance.activeIndex];
    this.avlTypeaheadSelect.emit(item);
    this.close();
  }

  onBlur(): void {
    // Delay so a click on a panel item registers before the panel closes.
    setTimeout(() => this.close(), 150);
  }

  close(): void {
    this.searchSub?.unsubscribe();
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
    this.panelRef = undefined;
  }

  ngOnDestroy(): void {
    this.close();
  }
}
