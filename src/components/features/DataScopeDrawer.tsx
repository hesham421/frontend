import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useOrganizationStore } from '../../stores/useOrganizationStore';
import { useRolesOptions } from '../../roles/hooks';
import { useRoleDataScopeFacade } from '../../roleDataScope/hooks';
import { DATA_ACCESS_LEVELS, type DataAccessLevel } from '../../roleDataScope/dataAccessLevel';
import type { SecRoleBranchDto } from '../../roleDataScope/roleDataScopeApi';
import { Drawer, Alert } from '../../components/ui/OverlaysAndFeedback';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/FormControls';
import { branchIdToNumber } from '../../lib/branchId';
import { mapApiError } from '../../lib/errors/mapApiError';
import { useToast } from '../../components/ui/Toast';

export interface DataScopeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  scope: SecRoleBranchDto | null;
  roleId?: number;
}

export const DataScopeDrawer: React.FC<DataScopeDrawerProps> = ({ isOpen, onClose, scope: initialScope, roleId }) => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const roleOptions = useRolesOptions();
  const branches = useOrganizationStore((state) => state.branches);

  const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>(roleId ?? initialScope?.roleIdFk);
  const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>(initialScope?.branchIdFk);
  const [dataAccessLevel, setDataAccessLevel] = useState<DataAccessLevel>(initialScope?.dataAccessLevel ?? 'BRANCH_ONLY');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { scope, canCreate, canEdit, canDelete, isLoading, saveScope, deleteScope } = useRoleDataScopeFacade(
    selectedRoleId,
    selectedBranchId,
  );
  // Update needs ROLE_UPDATE; the create branch (no scope yet) needs ROLE_CREATE.
  const canSaveScope = scope ? canEdit : canCreate;

  useEffect(() => {
    setSelectedRoleId(roleId ?? initialScope?.roleIdFk);
    setSelectedBranchId(initialScope?.branchIdFk);
    setDataAccessLevel(initialScope?.dataAccessLevel ?? 'BRANCH_ONLY');
    setErrorMessage(null);
  }, [roleId, initialScope, isOpen]);

  useEffect(() => {
    if (scope) setDataAccessLevel(scope.dataAccessLevel ?? 'BRANCH_ONLY');
  }, [scope]);

  const handleSave = async () => {
    if (selectedRoleId == null || selectedBranchId == null) return;
    setErrorMessage(null);
    try {
      await saveScope(dataAccessLevel);
      showToast(t('dataScopeSavedSuccess'), 'success');
      onClose();
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
    }
  };

  const handleDelete = async () => {
    if (!scope) return;
    setErrorMessage(null);
    try {
      await deleteScope();
      showToast(t('dataScopeDeletedSuccess'), 'success');
      onClose();
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
    }
  };

  const roleSelectOptions = (roleOptions.data ?? []).map((r) => ({ value: String(r.id), label: `${r.roleName} (${r.roleCode})` }));
  const branchOptions = branches.map((b) => ({
    value: String(branchIdToNumber(b.id)),
    label: lang === 'ar' ? `${b.nameAr} - ${b.nameEn}` : `${b.nameEn} - ${b.nameAr}`,
  }));
  const accessLevelOptions = DATA_ACCESS_LEVELS.map((level) => ({
    value: level,
    label: level === 'BRANCH_ONLY' ? t('branchOnly') : level === 'BRANCH_AND_CHILDREN' ? t('branchAndChildren') : t('allBranches'),
  }));

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={t('secDataScopeTitle')}
      width="md"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div>
            {scope && canDelete && (
              <Button variant="danger" onClick={handleDelete} iconLeft={<i className="ti ti-trash" />}>
                {t('delete')}
              </Button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="secondary" onClick={onClose}>
              {t('cancel')}
            </Button>
            {canSaveScope && (
              <Button variant="primary" onClick={handleSave} loading={isLoading}>
                {t('save')}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {errorMessage && <Alert variant="danger" message={errorMessage} />}
        {/* RULE-SEC-036 has no client pre-check — duplicate (role, branch) pairs surface via 409/422 on save. */}
        <Select
          label={`${t('navRoles')} *`}
          options={roleSelectOptions}
          value={selectedRoleId != null ? String(selectedRoleId) : ''}
          onChange={(e) => setSelectedRoleId(Number(e.target.value))}
        />
        <Select
          label={`${t('assignedBranch')} *`}
          options={branchOptions}
          value={selectedBranchId != null ? String(selectedBranchId) : ''}
          onChange={(e) => setSelectedBranchId(Number(e.target.value))}
        />
        <Select
          label={`${t('dataAccessLevel')} *`}
          options={accessLevelOptions}
          value={dataAccessLevel}
          onChange={(e) => setDataAccessLevel(e.target.value as DataAccessLevel)}
          disabled={!canSaveScope}
        />
        {scope && (
          <Alert
            variant="info"
            message={`${t('active')}: ${scope.isActiveFl ? t('active') : t('inactive')}`}
          />
        )}
      </div>
    </Drawer>
  );
};
