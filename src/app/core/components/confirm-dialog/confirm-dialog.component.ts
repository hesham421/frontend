import { Component, ChangeDetectionStrategy, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AvlOverlayRef } from 'src/app/shared/overlay/avl-overlay-ref';

/**
 * Confirm Dialog Component
 *
 * Reusable confirmation modal with customizable title, message, and buttons.
 * Opened via DialogService (see ErpDialogService/ConfirmDialogService) —
 * previously ngbModal/NgbActiveModal.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule
  ],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">{{ titleKey | translate }}</h5>
      <button
        type="button"
        class="btn-close"
        aria-label="Close"
        (click)="onCancel()"
      ></button>
    </div>
    <div class="modal-body">
      <div class="confirm-content" [ngClass]="'type-' + type">
        <i class="confirm-icon" [ngClass]="iconClass"></i>
        <p class="confirm-message">{{ messageKey | translate: messageParams }}</p>
      </div>
    </div>
    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-secondary"
        (click)="onCancel()"
      >
        {{ cancelKey | translate }}
      </button>
      <button
        type="button"
        class="btn"
        [ngClass]="confirmBtnClass"
        (click)="onConfirm()"
      >
        {{ confirmKey | translate }}
      </button>
    </div>
  `,
  styles: [`
    .modal-header {
      border-bottom: 1px solid var(--border-subtle);
    }

    .modal-body {
      padding: var(--space-6, 24px);
    }

    .modal-footer {
      border-top: 1px solid var(--border-subtle);
      padding: var(--space-4, 16px) var(--space-6, 24px);
    }

    .confirm-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .confirm-icon {
      font-size: 3rem;
      margin-bottom: var(--space-4, 16px);
    }

    .type-danger .confirm-icon {
      color: var(--status-danger, #A92E23);
    }

    .type-warning .confirm-icon {
      color: var(--status-warning, #A4640A);
    }

    .type-info .confirm-icon {
      color: var(--status-info, #1B54BC);
    }

    .confirm-message {
      font-size: var(--fs-body, 14px);
      margin: 0;
      color: var(--text-body);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
  private readonly activeModal = inject(AvlOverlayRef<boolean>);

  @Input() titleKey = 'COMMON.CONFIRM';
  @Input() messageKey = '';
  @Input() messageParams: Record<string, unknown> = {};
  @Input() confirmKey = 'COMMON.CONFIRM';
  @Input() cancelKey = 'COMMON.CANCEL';
  @Input() type: 'danger' | 'warning' | 'info' = 'warning';

  get iconClass(): string {
    switch (this.type) {
      case 'danger':
        return 'ti ti-alert-triangle';
      case 'info':
        return 'ti ti-info-circle';
      default:
        return 'ti ti-help';
    }
  }

  get confirmBtnClass(): string {
    switch (this.type) {
      case 'danger':
        return 'btn-danger';
      case 'info':
        return 'btn-info';
      default:
        return 'btn-warning';
    }
  }

  onCancel(): void {
    this.activeModal.dismiss();
  }

  onConfirm(): void {
    this.activeModal.close(true);
  }
}
