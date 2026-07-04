import { Component, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkPortalOutlet, PortalModule } from '@angular/cdk/portal';
import { A11yModule } from '@angular/cdk/a11y';
import { AvlOverlayConfig } from '../avl-overlay-config';
import { AvlOverlayRef } from '../avl-overlay-ref';

const TONE_MAP: Record<NonNullable<AvlOverlayConfig['iconTone']>, { color: string; bg: string }> = {
  info: { color: 'var(--blue-600)', bg: 'var(--info-50)' },
  success: { color: 'var(--green-600)', bg: 'var(--green-50)' },
  warning: { color: 'var(--amber-600)', bg: 'var(--amber-50)' },
  danger: { color: 'var(--red-600)', bg: 'var(--red-50)' },
  neutral: { color: 'var(--slate-600)', bg: 'var(--surface-sunken)' }
};

/**
 * CDK-attached shell for Drawer. Slides in from the inline-end (right
 * in LTR, left in RTL, automatic via the avl-drawer* logical-property
 * classes in src/scss/avelynq/tokens/responsive.css). Same native
 * header / legacy-content duality as DialogContainerComponent — see
 * its comment for the reasoning.
 */
@Component({
  selector: 'avl-drawer-container',
  standalone: true,
  imports: [CommonModule, PortalModule, A11yModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="avl-drawer avl-drawer--{{ config.size || 'md' }}">
      <div class="avl-drawer__scrim" (click)="onScrimClick()"></div>
      <div
        class="avl-drawer__panel"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="config.ariaLabel || config.title || 'Side panel'"
        cdkTrapFocus
        cdkTrapFocusAutoCapture
        (keydown.escape)="onEscape()"
      >
        @if (config.title || config.icon || config.showClose) {
          <div class="avl-drawer__header">
            @if (config.icon) {
              <span class="avl-drawer__icon-tile" [style.background]="tone.bg" [style.color]="tone.color">
                <i [class]="config.icon"></i>
              </span>
            }
            <div class="avl-drawer__titles">
              @if (config.title) {
                <div class="avl-drawer__title">{{ config.title }}</div>
              }
              @if (config.subtitle) {
                <div class="avl-drawer__subtitle">{{ config.subtitle }}</div>
              }
            </div>
            @if (config.showClose !== false) {
              <button type="button" class="avl-drawer__close" aria-label="Close" (click)="onCloseClick()">
                <i class="ti ti-x"></i>
              </button>
            }
          </div>
          <div class="avl-drawer__body">
            <ng-template cdkPortalOutlet></ng-template>
          </div>
        } @else {
          <ng-template cdkPortalOutlet></ng-template>
        }
      </div>
    </div>
  `
})
export class DrawerContainerComponent {
  @ViewChild(CdkPortalOutlet, { static: true }) portalOutlet!: CdkPortalOutlet;

  config: AvlOverlayConfig = {};
  drawerRef!: AvlOverlayRef<any>;

  get tone() {
    return TONE_MAP[this.config.iconTone || 'info'];
  }

  onScrimClick(): void {
    if (this.config.closeOnScrim !== false) {
      this.drawerRef.dismiss('scrim');
    }
  }

  onEscape(): void {
    if (this.config.closeOnEscape !== false) {
      this.drawerRef.dismiss('escape');
    }
  }

  onCloseClick(): void {
    this.drawerRef.dismiss('close-button');
  }
}
