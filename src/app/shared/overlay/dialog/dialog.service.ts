import { Injectable, Injector, TemplateRef, Type, ViewContainerRef, inject } from '@angular/core';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType, TemplatePortal } from '@angular/cdk/portal';
import { AvlOverlayConfig } from '../avl-overlay-config';
import { AvlOverlayRef } from '../avl-overlay-ref';
import { DialogContainerComponent } from './dialog-container.component';

export interface DialogOpenConfig<D = unknown> extends AvlOverlayConfig<D> {
  /** Required when `content` is a TemplateRef — inject ViewContainerRef in the calling component and pass it here. */
  viewContainerRef?: ViewContainerRef;
}

/**
 * Angular/CDK Overlay replacement for NgbModal. Centered on desktop,
 * docks as a bottom sheet on phones (via the avl-dialog* classes) per
 * design-system/avelynq-source/components/overlays/Dialog.prompt.md.
 *
 * Accepts either a Component class (sets `.componentInstance`, mirroring
 * NgbModalRef) or a TemplateRef (attaches with `{ $implicit: dialogRef }`
 * as context, so existing `<ng-template let-modal>` markup keeps working
 * with `modal.close()`/`modal.dismiss()` unchanged).
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly overlay = inject(Overlay);
  private readonly parentInjector = inject(Injector);

  open<T, R = unknown>(content: ComponentType<T> | TemplateRef<unknown>, config: DialogOpenConfig = {}): AvlOverlayRef<R> {
    const overlayConfig: OverlayConfig = {
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: false,
      panelClass: 'avl-dialog-overlay-pane',
      disposeOnNavigation: true
    };

    const overlayRef = this.overlay.create(overlayConfig);
    const dialogRef = new AvlOverlayRef<R>(overlayRef);

    const containerPortal = new ComponentPortal(DialogContainerComponent);
    const containerRef = overlayRef.attach(containerPortal);
    containerRef.instance.config = config;
    containerRef.instance.dialogRef = dialogRef;

    if (content instanceof TemplateRef) {
      if (!config.viewContainerRef) {
        throw new Error('DialogService.open(): a viewContainerRef must be provided in config when opening a TemplateRef.');
      }
      const templatePortal = new TemplatePortal(content, config.viewContainerRef, { $implicit: dialogRef, dialogRef });
      containerRef.instance.portalOutlet.attach(templatePortal);
    } else {
      // Provide AvlOverlayRef via DI so content components can
      // `inject(AvlOverlayRef)` for close()/dismiss(), the same pattern
      // NgbActiveModal used to provide automatically.
      const childInjector = Injector.create({
        parent: this.parentInjector,
        providers: [{ provide: AvlOverlayRef, useValue: dialogRef }]
      });
      const componentPortal = new ComponentPortal(content as Type<T>, null, childInjector);
      const componentRef = containerRef.instance.portalOutlet.attach(componentPortal);
      dialogRef.componentInstance = componentRef.instance;
    }

    return dialogRef;
  }
}
