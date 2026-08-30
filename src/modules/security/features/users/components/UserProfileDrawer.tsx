import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useBranchesOptions } from '@/features/branches';
import { useUserProfileFacade } from '@/features/userProfiles';
import type { UserDto } from '@/features/users';
import { Drawer, Alert } from '@/components/ui/OverlaysAndFeedback';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/FormControls';
import { Badge } from '@/components/ui/DataDisplay';
import { mapApiError } from '@/lib/errors/mapApiError';
import { useToast } from '@/components/ui/Toast';

export interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserDto | null;
}

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({ isOpen, onClose, user }) => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const branchOptions = useBranchesOptions();
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
    if (!user?.id) return;
    if (branchId == null) {
      setErrorMessage(t('assignedBranchRequired'));
      return;
    }
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

  // A leading placeholder is required: without it, a Select whose value doesn't
  // match any option (branchId unset) falls back to the browser's native
  // first-option-selected rendering — visually implying a branch is chosen
  // when the underlying state is still empty, masking why Save silently fails.
  const activeBranches = [
    { value: '', label: t('selectBranchPlaceholder') },
    ...(branchOptions.data ?? []).map((b) => ({ value: String(b.id), label: `${lang === 'ar' ? b.nameAr : b.nameEn} (${b.branchCode})` })),
  ];

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
