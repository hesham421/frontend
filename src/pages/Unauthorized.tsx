import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigationStore } from '../stores/useNavigationStore';
import { Card } from '../components/ui/DataDisplay';
import { Button } from '../components/ui/Button';

export const Unauthorized: React.FC = () => {
  const { t } = useLanguage();
  const setCurrentScreen = useNavigationStore((state) => state.setCurrentScreen);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '64px' }}>
      <Card variant="flat" padding="lg" style={{ maxWidth: '440px', textAlign: 'center' }}>
        <i
          className="ti ti-lock-square-rounded"
          style={{ fontSize: '40px', color: 'var(--danger-600, #D92D20)' }}
        />
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text-strong, #14222F)',
            margin: '14px 0 6px',
          }}
        >
          {t('unauthorizedTitle')}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted, #647488)', margin: '0 0 20px' }}>
          {t('errForbidden')}
        </p>
        <Button variant="primary" onClick={() => setCurrentScreen('dashboard')}>
          {t('backToDashboard')}
        </Button>
      </Card>
    </div>
  );
};
