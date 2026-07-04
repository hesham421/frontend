import { Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';
import { Overlay, OverlayRef, ConnectedPosition } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'avl-tooltip-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="avl-tooltip__panel" role="tooltip">{{ text }}</div>`
})
class TooltipPanelComponent {
  text = '';
}

/**
 * AVELYNQ extension (design-system/avelynq-extensions/Tooltip.prompt.md) —
 * no upstream AVELYNQ spec, pending human design review. Replaces
 * ngbTooltip. Shows on hover/focus, hides on leave/blur/Escape.
 *
 *   <a [avlTooltip]="'You do not have permission to access this page'" [avlTooltipDisabled]="isEnabled"></a>
 */
@Directive({
  selector: '[avlTooltip]',
  standalone: true,
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focus)': 'show()',
    '(blur)': 'hide()',
    '(keydown.escape)': 'hide()'
  }
})
export class AvlTooltipDirective implements OnDestroy {
  @Input('avlTooltip') text = '';
  /** When true, the tooltip is suppressed (e.g. only show for disabled nav items). */
  @Input('avlTooltipDisabled') disabled = false;

  private readonly overlay = inject(Overlay);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private overlayRef?: OverlayRef;

  private static readonly POSITIONS: ConnectedPosition[] = [
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -6 },
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 6 }
  ];

  show(): void {
    if (this.disabled || !this.text || this.overlayRef) {
      return;
    }

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef.nativeElement)
      .withPositions(AvlTooltipDirective.POSITIONS);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      panelClass: 'avl-tooltip-overlay-pane'
    });

    const portal = new ComponentPortal(TooltipPanelComponent);
    const componentRef = this.overlayRef.attach(portal);
    componentRef.instance.text = this.text;
  }

  hide(): void {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
  }
}
