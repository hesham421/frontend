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
 * CDK-attached shell for Dialog. Provides the avl-dialog/scrim/panel
 * structure (sizing, mobile bottom-sheet docking, animations all come
 * from the avl-dialog* classes in src/scss/avelynq/tokens/responsive.css)
 * plus an optional native AVELYNQ header (icon/title/subtitle/close).
 *
 * When `config.title` is not set, the portal outlet is placed directly
 * in the panel (no native header) so legacy content that self-renders
 * Bootstrap `.modal-header`/`.modal-body`/`.modal-footer` markup keeps
 * working unchanged — see .avelynq-modal-legacy styles in
 * src/scss/avelynq/shell/overlays.scss for how those get reskinned.
 */
@Component({
  selector: 'avl-dialog-container',
  standalone: true,
  imports: [CommonModule, PortalModule, A11yModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="avl-dialog avl-dialog--{{ config.size || 'md' }}">
      <div class="avl-dialog__scrim" (click)="onScrimClick()"></div>
      <div
        class="avl-dialog__panel"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="config.ariaLabel || config.title || 'Dialog'"
        cdkTrapFocus
        cdkTrapFocusAutoCapture
        (keydown.escape)="onEscape()"
      >
        @if (config.title || config.icon || config.showClose) {
          <div class="avl-dialog__header">
            @if (config.icon) {
              <span class="avl-dialog__icon-tile" [style.background]="tone.bg" [style.color]="tone.color">
                <i [class]="config.icon"></i>
              </span>
            }
            <div class="avl-dialog__titles">
              @if (config.title) {
                <div class="avl-dialog__title">{{ config.title }}</div>
              }
              @if (config.subtitle) {
                <div class="avl-dialog__subtitle">{{ config.subtitle }}</div>
              }
            </div>
            @if (config.showClose !== false) {
              <button type="button" class="avl-dialog__close" aria-label="Close" (click)="onCloseClick()">
                <i class="ti ti-x"></i>
              </button>
            }
          </div>
          <div class="avl-dialog__body">
            <ng-template cdkPortalOutlet></ng-template>
          </div>
        } @else {
          <ng-template cdkPortalOutlet></ng-template>
        }
      </div>
    </div>
  `
})
export class DialogContainerComponent {
  @ViewChild(CdkPortalOutlet, { static: true }) portalOutlet!: CdkPortalOutlet;

  config: AvlOverlayConfig = {};
  dialogRef!: AvlOverlayRef<any>;

  get tone() {
    return TONE_MAP[this.config.iconTone || 'info'];
  }

  onScrimClick(): void {
    if (this.config.closeOnScrim !== false) {
      this.dialogRef.dismiss('scrim');
    }
  }

  onEscape(): void {
    if (this.config.closeOnEscape !== false) {
      this.dialogRef.dismiss('escape');
    }
  }

  onCloseClick(): void {
    this.dialogRef.dismiss('close-button');
  }
}
