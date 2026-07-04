import { Injectable, inject } from '@angular/core';
import { DialogService } from 'src/app/shared/overlay/dialog/dialog.service';

export interface ConfirmDialogOptions {
  titleKey: string;
  messageKey: string;
  messageParams?: Record<string, unknown>;
  confirmKey?: string;
  cancelKey?: string;
  type?: 'danger' | 'warning' | 'info';
}

/**
 * Service for displaying confirmation dialogs using DialogService
 * (Angular/CDK Overlay — previously ng-bootstrap's NgbModal).
 *
 * NOTE: no consumers found anywhere in src/app as of Phase 3's inventory
 * (design-system/NGB-USAGE-INVENTORY.md) — ErpDialogService
 * (src/app/shared/services/erp-dialog.service.ts) is the actual
 * widely-used equivalent. Kept alive and migrated off ngbModal rather
 * than deleted, in case a caller was missed by static analysis.
 */
@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private readonly dialogService = inject(DialogService);

  /**
   * Show a confirmation dialog.
   * @returns Promise<boolean> - true if confirmed, false if cancelled
   */
  async confirm(options: ConfirmDialogOptions): Promise<boolean> {
    const { ConfirmDialogComponent } = await import('../components/confirm-dialog/confirm-dialog.component');

    const modalRef = this.dialogService.open(ConfirmDialogComponent, {
      size: 'sm',
      closeOnScrim: false,
      closeOnEscape: true
    });

    modalRef.componentInstance.titleKey = options.titleKey;
    modalRef.componentInstance.messageKey = options.messageKey;
    modalRef.componentInstance.messageParams = options.messageParams || {};
    modalRef.componentInstance.confirmKey = options.confirmKey || 'COMMON.CONFIRM';
    modalRef.componentInstance.cancelKey = options.cancelKey || 'COMMON.CANCEL';
    modalRef.componentInstance.type = options.type || 'warning';

    try {
      await modalRef.result;
      return true;
    } catch {
      return false;
    }
  }
}
