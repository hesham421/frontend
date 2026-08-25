import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSecurityStore } from '../../stores/useSecurityStore';
import { useOrganizationStore } from '../../stores/useOrganizationStore';
import { Drawer } from '../../components/ui/OverlaysAndFeedback';
import { Button } from '../../components/ui/Button';
import { Input, Select, Switch } from '../../components/ui/FormControls';
import { AppUser } from '../../data/mockData';

export interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: AppUser | null;
}

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({ isOpen, onClose, user }) => {
  const { t } = useLanguage();
  const saveUserProfile = useSecurityStore((state) => state.saveUserProfile);
  const branches = useOrganizationStore((state) => state.branches);

  const [fullNameEn, setFullNameEn] = useState('');
  const [fullNameAr, setFullNameAr] = useState('');
  const [branchId, setBranchId] = useState('br-1');
  const [preferredLang, setPreferredLang] = useState<'ar' | 'en'>('ar');
  const [employeeId, setEmployeeId] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (user?.profile) {
      setFullNameEn(user.profile.fullNameEn || '');
      setFullNameAr(user.profile.fullNameAr || '');
      setBranchId(user.profile.branchId || 'br-1');
      setPreferredLang(user.profile.preferredLang || 'ar');
      setEmployeeId(user.profile.employeeId || '');
      setIsActive(user.profile.isActive ?? true);
    } else if (user) {
      setFullNameEn(user.username);
      setFullNameAr('');
      setBranchId('br-1');
      setPreferredLang('ar');
      setEmployeeId(`EMP-${Math.floor(100 + Math.random() * 900)}`);
      setIsActive(true);
    }
  }, [user]);

  const handleSave = () => {
    if (!user) return;
    saveUserProfile(user.id, {
      fullNameEn,
      fullNameAr,
      branchId,
      preferredLang,
      employeeId,
      isActive,
    });
  };

  const activeBranches = branches
    .filter((b) => b.isActive || b.id === branchId)
    .map((b) => ({ value: b.id, label: `${b.nameEn} (${b.branchCode})` }));

  const langOptions = [
    { value: 'ar', label: 'العربية (Arabic)' },
    { value: 'en', label: 'English (الإنجليزية)' },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('userProfile')}: ${user?.username || ''}`}
      width="md"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {t('save')}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input
          label={`${t('fullNameEn')} *`}
          value={fullNameEn}
          onChange={(e) => setFullNameEn(e.target.value)}
          required
        />
        <Input
          label={`${t('fullNameAr')} *`}
          value={fullNameAr}
          onChange={(e) => setFullNameAr(e.target.value)}
          required
        />
        <Select
          label={`${t('assignedBranch')} *`}
          options={activeBranches}
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
        />
        <Select
          label={t('preferredLang')}
          options={langOptions}
          value={preferredLang}
          onChange={(e) => setPreferredLang(e.target.value as 'ar' | 'en')}
        />
        <Input
          label={t('employeeId')}
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="EMP-1001"
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
