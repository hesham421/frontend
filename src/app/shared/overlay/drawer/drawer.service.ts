import { Injectable, Injector, TemplateRef, Type, ViewContainerRef, inject } from '@angular/core';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType, TemplatePortal } from '@angular/cdk/portal';
import { AvlOverlayConfig } from '../avl-overlay-config';
import { AvlOverlayRef } from '../avl-overlay-ref';
import { DrawerContainerComponent } from './drawer-container.component';

export interface DrawerOpenConfig<D = unknown> extends AvlOverlayConfig<D> {
  /** Required when `content` is a TemplateRef — inject ViewContainerRef in the calling component and pass it here. */
  viewContainerRef?: ViewContainerRef;
}

/**
 * Angular/CDK Overlay side panel per
 * design-system/avelynq-source/components/overlays/Drawer.prompt.md.
 * Use for record details, create/edit forms, filter panels, and other
 * contextual workflows with more than a couple of fields — reach for
 * DialogService instead for focused confirmations/short prompts.
 */
@Injectable({ providedIn: 'root' })
export class DrawerService {
  private readonly overlay = inject(Overlay);
  private readonly parentInjector = inject(Injector);

  open<T, R = unknown>(content: ComponentType<T> | TemplateRef<unknown>, config: DrawerOpenConfig = {}): AvlOverlayRef<R> {
    const overlayConfig: OverlayConfig = {
      positionStrategy: this.overlay.position().global(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: false,
      panelClass: 'avl-drawer-overlay-pane',
      disposeOnNavigation: true
    };

    const overlayRef = this.overlay.create(overlayConfig);
    const drawerRef = new AvlOverlayRef<R>(overlayRef);

    const containerPortal = new ComponentPortal(DrawerContainerComponent);
    const containerRef = overlayRef.attach(containerPortal);
    containerRef.instance.config = config;
    containerRef.instance.drawerRef = drawerRef;
    // Overlay.attach() creates the container but never checks its view, so
    // portalOutlet (a view query) is still unresolved at this point — force
    // a detection pass before reading it below.
    containerRef.changeDetectorRef.detectChanges();

    if (content instanceof TemplateRef) {
      if (!config.viewContainerRef) {
        throw new Error('DrawerService.open(): a viewContainerRef must be provided in config when opening a TemplateRef.');
      }
      const templatePortal = new TemplatePortal(content, config.viewContainerRef, { $implicit: drawerRef, drawerRef });
      containerRef.instance.portalOutlet.attach(templatePortal);
    } else {
      const childInjector = Injector.create({
        parent: this.parentInjector,
        providers: [{ provide: AvlOverlayRef, useValue: drawerRef }]
      });
      const componentPortal = new ComponentPortal(content as Type<T>, null, childInjector);
      const componentRef = containerRef.instance.portalOutlet.attach(componentPortal);
      drawerRef.componentInstance = componentRef.instance;
    }

    return drawerRef;
  }
}
