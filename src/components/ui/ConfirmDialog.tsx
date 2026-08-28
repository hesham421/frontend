import React from 'react';
import { Dialog } from './OverlaysAndFeedback';
import { Button } from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  tone?: 'primary' | 'danger';
  loading?: boolean;
}

/**
 * Shared confirm/cancel prompt. Built on the generic Dialog so every
 * destructive or state-changing action in the app gets identical
 * footer layout, focus, and scrim behavior instead of each screen
 * re-implementing the same Cancel/Confirm shape.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  tone = 'primary',
  loading = false,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-body, #354456)', lineHeight: 1.5 }}>{message}</p>
    </Dialog>
  );
};
