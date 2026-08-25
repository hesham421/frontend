import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSecurityStore } from '../../stores/useSecurityStore';
import { useOrganizationStore } from '../../stores/useOrganizationStore';
import { Drawer } from '../../components/ui/OverlaysAndFeedback';
import { Button } from '../../components/ui/Button';
import { Select, Switch } from '../../components/ui/FormControls';
import { DataScope } from '../../data/mockData';

export interface DataScopeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  scope: DataScope | null;
  roleId?: string;
}

export const DataScopeDrawer: React.FC<DataScopeDrawerProps> = ({ isOpen, onClose, scope, roleId }) => {
  const { t } = useLanguage();
  const saveDataScope = useSecurityStore((state) => state.saveDataScope);
  const openConfirmDialog = useSecurityStore((state) => state.openConfirmDialog);
  const roles = useSecurityStore((state) => state.roles);
  const branches = useOrganizationStore((state) => state.branches);

  const [selectedRoleId, setSelectedRoleId] = useState(roleId || 'role-1');
  const [selectedBranchId, setSelectedBranchId] = useState('br-1');
  const [dataAccessLevel, setDataAccessLevel] = useState<'BRANCH' | 'CHILDREN' | 'ALL'>('BRANCH');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (scope) {
      setSelectedRoleId(scope.roleId || roleId || 'role-1');
      setSelectedBranchId(scope.branchId || 'br-1');
      setDataAccessLevel(scope.dataAccessLevel || 'BRANCH');
      setIsActive(scope.isActive ?? true);
    } else {
      setSelectedRoleId(roleId || 'role-1');
      setSelectedBranchId('br-1');
      setDataAccessLevel('BRANCH');
      setIsActive(true);
    }
  }, [scope, roleId]);

  const handleSave = () => {
    saveDataScope({
      id: scope?.id,
      roleId: selectedRoleId,
      branchId: selectedBranchId,
      dataAccessLevel,
      isActive,
    });
  };

  const handleDelete = () => {
    if (scope?.id) {
      openConfirmDialog('DELETE_DATASCOPE', scope.id);
    }
  };

  const roleOptions = roles.map((r) => ({ value: r.id, label: `${r.roleName} (${r.roleCode})` }));
  const branchOptions = branches.map((b) => ({ value: b.id, label: `${b.nameEn} - ${b.nameAr}` }));
  const accessLevelOptions = [
    { value: 'BRANCH', label: t('branchOnly') },
    { value: 'CHILDREN', label: t('branchAndChildren') },
    { value: 'ALL', label: t('allBranches') },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={t('secDataScopeTitle')}
      width="md"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div>
            {scope && (
              <Button variant="danger" onClick={handleDelete} iconLeft={<i className="ti ti-trash" />}>
                {t('delete')}
              </Button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="secondary" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {t('save')}
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Select
          label={`${t('navRoles')} *`}
          options={roleOptions}
          value={selectedRoleId}
          onChange={(e) => setSelectedRoleId(e.target.value)}
        />
        <Select
          label={`${t('assignedBranch')} *`}
          options={branchOptions}
          value={selectedBranchId}
          onChange={(e) => setSelectedBranchId(e.target.value)}
        />
        <Select
          label={`${t('dataAccessLevel')} *`}
          options={accessLevelOptions}
          value={dataAccessLevel}
          onChange={(e) => setDataAccessLevel(e.target.value as 'BRANCH' | 'CHILDREN' | 'ALL')}
        />
        <Switch
          label={t('active')}
          checked={isActive}
          onChange={(checked) => setIsActive(checked)}
        />
      </div>
    </Drawer>
  );
};
