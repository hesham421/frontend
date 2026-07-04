import {
  Directive,
  TemplateRef,
  ContentChild,
  ElementRef,
  ViewContainerRef,
  OnDestroy,
  signal,
  inject
} from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay, OverlayRef, ConnectedPosition } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

/**
 * AVELYNQ extension (design-system/avelynq-extensions/Dropdown.prompt.md) —
 * no upstream AVELYNQ spec, pending human design review. Replaces
 * ngbDropdown/ngbDropdownToggle/ngbDropdownMenu/ngbDropdownItem with a
 * similar attribute API for a minimal swap. The menu panel is a plain
 * `<ng-template>` (queried by TemplateRef, no separate marker directive
 * needed) rather than ngbDropdownMenu's plain `<div>`, since CDK Overlay
 * portals the content elsewhere in the DOM:
 *
 *   <li avlDropdown>
 *     <a avlDropdownToggle>...</a>
 *     <ng-template>
 *       <button avlDropdownItem>...</button>
 *     </ng-template>
 *   </li>
 */
@Directive({
  selector: '[avlDropdown]',
  standalone: true,
  exportAs: 'avlDropdown'
})
export class AvlDropdownDirective implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly directionality = inject(Directionality, { optional: true });

  @ContentChild(TemplateRef) menuTemplate?: TemplateRef<unknown>;

  private overlayRef?: OverlayRef;
  readonly isOpen = signal(false);

  private static readonly POSITIONS: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -4 }
  ];

  toggle(triggerElement: HTMLElement): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open(triggerElement);
    }
  }

  open(triggerElement: HTMLElement): void {
    if (this.isOpen() || !this.menuTemplate) {
      return;
    }

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(triggerElement)
      .withPositions(AvlDropdownDirective.POSITIONS)
      .withPush(true);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      direction: this.directionality?.value ?? 'ltr',
      panelClass: 'avl-dropdown-overlay-pane',
      disposeOnNavigation: true
    });

    this.overlayRef.backdropClick().subscribe(() => this.close());
    this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        this.close();
      }
    });

    const portal = new TemplatePortal(this.menuTemplate, this.viewContainerRef);
    this.overlayRef.attach(portal);
    this.isOpen.set(true);
  }

  close(): void {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
    this.isOpen.set(false);
  }

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
  }
}

@Directive({
  selector: '[avlDropdownToggle]',
  standalone: true,
  host: { '(click)': 'onClick()' }
})
export class AvlDropdownToggleDirective {
  private readonly dropdown = inject(AvlDropdownDirective);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  onClick(): void {
    this.dropdown.toggle(this.elementRef.nativeElement);
  }
}

@Directive({
  selector: '[avlDropdownItem]',
  standalone: true,
  host: { '(click)': 'onClick()' }
})
export class AvlDropdownItemDirective {
  private readonly dropdown = inject(AvlDropdownDirective);

  onClick(): void {
    this.dropdown.close();
  }
}
