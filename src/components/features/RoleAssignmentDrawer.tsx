import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import type { RoleDto } from '../../roles/rolesApi';
import { Drawer } from '../../components/ui/OverlaysAndFeedback';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/FormControls';

export interface RoleAssignmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  roleOptions: RoleDto[];
  selectedRoleNames: string[];
  onChange: (roleNames: string[]) => void;
}

/**
 * Role picker as its own side drawer, not embedded in the Add/Edit User
 * dialog — matches the same secondary-drawer pattern that dialog already
 * uses for User Profile / Data Scope. Selection is fully controlled and
 * applies immediately (no separate confirm step); "Close" just dismisses
 * the drawer, same as the inline checklist it replaced.
 */
export const RoleAssignmentDrawer: React.FC<RoleAssignmentDrawerProps> = ({
  isOpen,
  onClose,
  roleOptions,
  selectedRoleNames,
  onChange,
}) => {
  const { t } = useLanguage();
  const [filterText, setFilterText] = useState('');

  const needle = filterText.trim().toLowerCase();
  const filteredRoleOptions = needle
    ? roleOptions.filter(
        (r) => r.roleName?.toLowerCase().includes(needle) || r.roleCode?.toLowerCase().includes(needle),
      )
    : roleOptions;

  const toggleRole = (roleName: string, checked: boolean) => {
    if (checked) onChange([...selectedRoleNames, roleName]);
    else onChange(selectedRoleNames.filter((name) => name !== roleName));
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={t('userRoles')}
      subtitle={`${selectedRoleNames.length} ${t('selected')}`}
      width="md"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={onClose}>
            {t('close')}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Input
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder={t('searchPlaceholder')}
          iconLeft={<i className="ti ti-search" aria-hidden="true" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {filteredRoleOptions.map((r) => (
            <label
              key={r.id}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', padding: '8px 6px', borderRadius: 'var(--radius-sm, 4px)' }}
            >
              <input
                type="checkbox"
                checked={!!r.roleName && selectedRoleNames.includes(r.roleName)}
                onChange={(e) => r.roleName && toggleRole(r.roleName, e.target.checked)}
              />
              <span>{r.roleName} ({r.roleCode})</span>
            </label>
          ))}
          {filteredRoleOptions.length === 0 && (
            <div style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted, #647488)', textAlign: 'center' }}>
              {t('noItemsMatchFilter')}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};
