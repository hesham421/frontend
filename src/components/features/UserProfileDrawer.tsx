import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useOrganizationStore } from '../../stores/useOrganizationStore';
import { useUserProfileFacade } from '../../userProfiles/hooks';
import type { UserDto } from '../../users/usersApi';
import { Drawer, Alert } from '../../components/ui/OverlaysAndFeedback';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/FormControls';
import { Badge } from '../../components/ui/DataDisplay';
import { branchIdToNumber } from '../../lib/branchId';
import { mapApiError } from '../../lib/errors/mapApiError';
import { useToast } from '../../components/ui/Toast';

export interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserDto | null;
}

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({ isOpen, onClose, user }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const branches = useOrganizationStore((state) => state.branches);
  const { profile, canCreate, canEdit, isLoading, saveProfile } = useUserProfileFacade(user?.id);
  // Update needs USER_PROFILE_UPDATE; the create branch (no profile yet) needs USER_PROFILE_CREATE.
  const canSaveProfile = profile ? canEdit : canCreate;

  const [fullNameEn, setFullNameEn] = useState('');
  const [fullNameAr, setFullNameAr] = useState('');
  const [branchId, setBranchId] = useState<number | undefined>(undefined);
  const [preferredLang, setPreferredLang] = useState<'ar' | 'en'>('ar');
  const [employeeId, setEmployeeId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullNameEn(profile.fullNameEn || '');
      setFullNameAr(profile.fullNameAr || '');
      setBranchId(profile.branchIdFk);
      setPreferredLang((profile.preferredLang as 'ar' | 'en') || 'ar');
      setEmployeeId(profile.employeeIdFk != null ? String(profile.employeeIdFk) : '');
    } else if (user) {
      setFullNameEn(user.username || '');
      setFullNameAr('');
      setBranchId(undefined);
      setPreferredLang('ar');
      setEmployeeId('');
    }
    setErrorMessage(null);
  }, [profile, user]);

  const handleSave = async () => {
    if (!user?.id || branchId == null) return;
    setErrorMessage(null);
    try {
      await saveProfile({
        branchIdFk: branchId,
        fullNameAr,
        fullNameEn,
        preferredLang,
        employeeIdFk: employeeId ? Number(employeeId) : undefined,
      });
      showToast(t('userProfileSavedSuccess'), 'success');
      onClose();
    } catch (err) {
      setErrorMessage(mapApiError(err, t));
    }
  };

  const activeBranches = branches
    .filter((b) => b.isActive || branchIdToNumber(b.id) === branchId)
    .map((b) => ({ value: String(branchIdToNumber(b.id)), label: `${b.nameEn} (${b.branchCode})` }));

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
          {canSaveProfile && (
            <Button variant="primary" onClick={handleSave} loading={isLoading}>
              {t('save')}
            </Button>
          )}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {errorMessage && <Alert variant="danger" message={errorMessage} />}
        <Input
          label={`${t('fullNameEn')} *`}
          value={fullNameEn}
          onChange={(e) => setFullNameEn(e.target.value)}
          disabled={!canSaveProfile}
          required
        />
        <Input
          label={`${t('fullNameAr')} *`}
          value={fullNameAr}
          onChange={(e) => setFullNameAr(e.target.value)}
          disabled={!canSaveProfile}
          required
        />
        <Select
          label={`${t('assignedBranch')} *`}
          options={activeBranches}
          value={branchId != null ? String(branchId) : ''}
          onChange={(e) => setBranchId(Number(e.target.value))}
          disabled={!canSaveProfile}
        />
        <Select
          label={t('preferredLang')}
          options={langOptions}
          value={preferredLang}
          onChange={(e) => setPreferredLang(e.target.value as 'ar' | 'en')}
          disabled={!canSaveProfile}
        />
        <Input
          label={t('employeeId')}
          type="number"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="1001"
          disabled={!canSaveProfile}
        />
        {profile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted, #647488)' }}>{t('active')}:</span>
            {/* isActiveFl has no write field on Create/UpdateSecUserProfileRequest — display only. */}
            <Badge variant={profile.isActiveFl ? 'success' : 'neutral'} size="sm">
              {profile.isActiveFl ? t('active') : t('inactive')}
            </Badge>
          </div>
        )}
      </div>
    </Drawer>
  );
};
