import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import type { RoleDto } from '../api';
import type { CrudPermission } from '../types';
import type { PageResponse } from '../../pageRegistry';
import { Drawer, Alert } from '@/components/ui/OverlaysAndFeedback';
import { Button, IconButton } from '@/components/ui/Button';
import { Input } from '@/components/ui/FormControls';

export interface PermissionMatrixDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  role: RoleDto | null;
  pages: PageResponse[];
  matrixDraft: Record<string, Set<CrudPermission>>;
  /** SEC-FE/SCR-SEC-003 — ROLE_UPDATE; false makes every control below read-only. */
  canEdit: boolean;
  isSaving?: boolean;
  errorMessage?: string | null;
  onTogglePage: (pageCode: string, assigned: boolean) => void;
  onTogglePermission: (pageCode: string, type: CrudPermission, checked: boolean) => void;
  onSave: () => void;
  onRemovePage: (pageCode: string) => void;
  copySourceRoleId: string;
  onCopySourceChange: (id: string) => void;
  copySourceOptions: { value: string; label: string }[];
  onCopyFrom: () => void;
}

const CRUD_PERMISSIONS: CrudPermission[] = ['CREATE', 'UPDATE', 'DELETE'];

/**
 * Per-page permission matrix as its own side drawer.
 * Allows toggling VIEW (page assignment) and CRUD operations, then persisting
 * directly to the backend API via syncRolePages.
 */
export const PermissionMatrixDrawer: React.FC<PermissionMatrixDrawerProps> = ({
  isOpen,
  onClose,
  role,
  pages,
  matrixDraft,
  canEdit,
  isSaving = false,
  errorMessage = null,
  onTogglePage,
  onTogglePermission,
  onSave,
  onRemovePage,
  copySourceRoleId,
  onCopySourceChange,
  copySourceOptions,
  onCopyFrom,
}) => {
  const { t, lang } = useLanguage();
  const [filterText, setFilterText] = useState('');

  const needle = filterText.trim().toLowerCase();
  const filteredPages = needle
    ? pages.filter(
        (p) =>
          p.nameEn?.toLowerCase().includes(needle) ||
          p.nameAr?.toLowerCase().includes(needle) ||
          p.pageCode?.toLowerCase().includes(needle)
      )
    : pages;

  const assignedCount = Object.keys(matrixDraft).length;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={t('permissionMatrix')}
      subtitle={role ? `${role.roleName} — ${assignedCount} ${t('selected')}` : undefined}
      width="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            {t('cancel')}
          </Button>
          {canEdit && (
            <Button variant="primary" onClick={onSave} loading={isSaving}>
              {t('save')}
            </Button>
          )}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {errorMessage && <Alert variant="danger" message={errorMessage} />}

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 220px', minWidth: '180px' }}>
            <Input
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder={t('searchPlaceholder')}
              iconLeft={<i className="ti ti-search" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
            />
          </div>
          {canEdit && copySourceOptions.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <select
                style={{
                  height: '32px',
                  fontSize: '12px',
                  borderRadius: 'var(--radius-sm, 4px)',
                  border: '1px solid var(--border-default, #B7C3D1)',
                  padding: '0 8px',
                  background: '#fff',
                }}
                value={copySourceRoleId}
                onChange={(e) => onCopySourceChange(e.target.value)}
                disabled={isSaving}
              >
                <option value="">-- {t('copyFrom')} --</option>
                {copySourceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {copySourceRoleId && (
                <Button variant="secondary" size="sm" onClick={onCopyFrom} loading={isSaving}>
                  {t('confirm')}
                </Button>
              )}
            </div>
          )}
        </div>

        <div style={{ border: '1px solid var(--border-subtle, #E6ECF3)', borderRadius: 'var(--radius-md, 7px)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'start' }}>
            <thead>
              <tr style={{ background: 'var(--surface-page, #F8FAFC)', borderBottom: '1px solid var(--border-subtle, #E6ECF3)' }}>
                <th style={{ padding: '8px 12px', textAlign: 'start' }}>{t('colScreenPage')}</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>{t('canView')}</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>{t('canCreate')}</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>{t('canUpdate')}</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>{t('canDelete')}</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }} />
              </tr>
            </thead>
            <tbody>
              {filteredPages.map((pg) => {
                if (!pg.pageCode) return null;
                const perms = matrixDraft[pg.pageCode];
                const isAssigned = perms !== undefined;
                return (
                  <tr key={pg.pageCode} style={{ borderBottom: '1px solid var(--border-subtle, #E6ECF3)' }}>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-strong, #14222F)' }}>
                        {lang === 'ar' ? pg.nameAr : pg.nameEn}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted, #647488)' }}>{pg.pageCode}</div>
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isAssigned}
                        disabled={!canEdit || isSaving}
                        onChange={(e) => onTogglePage(pg.pageCode!, e.target.checked)}
                        title={t('canView')}
                      />
                    </td>
                    {CRUD_PERMISSIONS.map((type) => (
                      <td key={type} style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={perms?.has(type) ?? false}
                          disabled={!canEdit || isSaving}
                          onChange={(e) => onTogglePermission(pg.pageCode!, type, e.target.checked)}
                        />
                      </td>
                    ))}
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      {isAssigned && canEdit && (
                        <IconButton
                          icon="ti ti-x"
                          label={t('delete')}
                          variant="ghost"
                          size="sm"
                          disabled={isSaving}
                          onClick={() => onRemovePage(pg.pageCode!)}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredPages.length === 0 && (
            <div style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted, #647488)', textAlign: 'center' }}>
              {t('noItemsMatchFilter')}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};
