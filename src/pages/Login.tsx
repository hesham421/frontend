import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from '../components/ui/Button';
import { Input, Checkbox, Select } from '../components/ui/FormControls';
import { Tabs, Alert } from '../components/ui/OverlaysAndFeedback';

export interface LoginProps {
  onLogin?: (role?: 'admin' | 'finance' | 'hr', username?: string) => void;
}

type AuthTab = 'login' | 'signup' | 'activate' | 'forgot' | 'reset';

export const Login: React.FC<LoginProps> = ({ onLogin: propOnLogin }) => {
  const { t, lang, toggleLanguage, dir } = useLanguage();
  const storeLogin = useAuthStore((state) => state.login);
  const handleLogin = propOnLogin ?? storeLogin;

  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [role, setRole] = useState<'admin' | 'finance' | 'hr'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Signup fields
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Activate fields
  const [activateUsername, setActivateUsername] = useState('');
  const [activationCode, setActivationCode] = useState('');

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Reset password fields
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const roles = [
    { value: 'admin', label: t('admin') },
    { value: 'finance', label: t('financeManager') },
    { value: 'hr', label: t('hrOfficer') },
  ];

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'login') {
      handleLogin(role, username || (role === 'admin' ? 'admin' : role === 'finance' ? 'f.alotaibi' : 'n.alghamdi'));
    } else if (activeTab === 'signup') {
      setFeedbackMessage(lang === 'ar' ? 'تم إنشاء الحساب بنجاح! يرجى مراجعة بريدك للتفعيل.' : 'Account registered successfully! Please check your email for activation.');
      setTimeout(() => {
        setActiveTab('activate');
        setFeedbackMessage(null);
      }, 1500);
    } else if (activeTab === 'activate') {
      setFeedbackMessage(lang === 'ar' ? 'تم تفعيل الحساب بنجاح! يمكنك الآن تسجيل الدخول.' : 'Account activated successfully! You can now sign in.');
      setTimeout(() => {
        setActiveTab('login');
        setFeedbackMessage(null);
      }, 1500);
    } else if (activeTab === 'forgot') {
      setFeedbackMessage(lang === 'ar' ? 'تم إرسال رمز التحقق إلى بريدك الإلكتروني.' : 'Verification code sent to your email.');
      setTimeout(() => {
        setActiveTab('reset');
        setFeedbackMessage(null);
      }, 1500);
    } else if (activeTab === 'reset') {
      setFeedbackMessage(lang === 'ar' ? 'تم تحديث كلمة المرور بنجاح! يرجى تسجيل الدخول.' : 'Password updated successfully! Please sign in.');
      setTimeout(() => {
        setActiveTab('login');
        setFeedbackMessage(null);
      }, 1500);
    }
  };

  return (
    <div
      className="avl-split"
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        direction: dir,
        fontFamily: 'var(--font-sans)',
        overflow: 'hidden',
      }}
    >
      {/* Left Brand Panel */}
      <div
        className="avl-split__aside"
        style={{
          flex: '1 1 45%',
          background: 'var(--navy-850, #0A1628)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 52px',
          color: 'var(--text-inverse, #ffffff)',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(120% 80% at 100% 0%, rgba(36,102,216,0.35), transparent 60%), radial-gradient(90% 70% at 0% 100%, rgba(18,169,155,0.25), transparent 60%)',
          }}
        />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-lg, 10px)',
              background: 'var(--brand-gradient, linear-gradient(135deg, #1FBBAD 0%, #2466D8 100%))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: 'var(--text-inverse, #ffffff)',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(18,169,155,0.35)',
            }}
          >
            A
          </span>
          <span style={{ fontWeight: 700, fontSize: '24px', letterSpacing: '0.04em', color: 'var(--text-inverse, #ffffff)' }}>
            AVEL<span style={{ color: 'var(--teal-400, #1FBBAD)' }}>Y</span>NQ
          </span>
        </div>

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'start' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--teal-400, #1FBBAD)',
              marginBottom: '14px',
            }}
          >
            {t('systemOverview')}
          </div>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '18px',
              color: 'var(--text-inverse, #ffffff)',
              letterSpacing: '-0.02em',
            }}
          >
            {t('tagline')}
          </h2>
          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '440px',
              marginBottom: '32px',
            }}
          >
            {t('authWelcomeDesc')}
          </p>

          <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid var(--border-inverse, #21344B)', paddingTop: '24px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-inverse, #ffffff)' }}>100%</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{t('continuity')}</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--teal-400, #1FBBAD)' }}>Zero</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Latency RBAC</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--brand-primary, #2466D8)' }}>Multi-Tier</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{t('structure')}</div>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, fontSize: '11px', color: 'rgba(255,255,255,0.4)', textAlign: 'start' }}>
          © 2026 AVELYNQ ERP. All rights reserved.
        </div>
      </div>

      {/* Right Form Panel */}
      <div
        className="avl-split__main"
        style={{
          flex: '1 1 55%',
          background: 'var(--surface-page, #F8FAFC)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 32px',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {/* Language switch button */}
        <div style={{ position: 'absolute', top: '24px', insetInlineEnd: '24px' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleLanguage}
            iconLeft={<i className="ti ti-language" style={{ fontSize: '15px' }} />}
          >
            {t('languageToggle')}
          </Button>
        </div>

        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ marginBottom: '24px', textAlign: 'start' }}>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--text-strong, #14222F)',
                marginBottom: '6px',
                letterSpacing: '-0.01em',
              }}
            >
              {activeTab === 'login' && t('welcomeBack')}
              {activeTab === 'signup' && t('signup')}
              {activeTab === 'activate' && t('activateAccount')}
              {activeTab === 'forgot' && t('forgotPassword')}
              {activeTab === 'reset' && t('resetPassword')}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted, #647488)', margin: 0 }}>
              {t('loginSubtitle')}
            </p>
          </div>

          {/* Navigation Tabs between Login and Sign Up */}
          {(activeTab === 'login' || activeTab === 'signup') && (
            <div style={{ marginBottom: '24px' }}>
              <Tabs
                variant="underline"
                tabs={[
                  { id: 'login', label: t('login'), icon: <i className="ti ti-lock" /> },
                  { id: 'signup', label: t('signup'), icon: <i className="ti ti-user-plus" /> },
                ]}
                activeTab={activeTab}
                onChange={(id) => setActiveTab(id as AuthTab)}
              />
            </div>
          )}

          {feedbackMessage && (
            <div style={{ marginBottom: '18px' }}>
              <Alert variant="success" message={feedbackMessage} />
            </div>
          )}

          {/* Form container */}
          <form onSubmit={onFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeTab === 'login' && (
              <>
                <Select
                  label={t('role')}
                  options={roles}
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'finance' | 'hr')}
                />
                <Input
                  label={t('username')}
                  placeholder={role === 'admin' ? 'admin' : role === 'finance' ? 'f.alotaibi' : 'n.alghamdi'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  iconLeft={<i className="ti ti-user" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
                  required
                />
                <Input
                  label={t('password')}
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  iconLeft={<i className="ti ti-key" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <Checkbox
                    label={t('rememberMe')}
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <button
                    type="button"
                    onClick={() => setActiveTab('forgot')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand-primary, #2466D8)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      padding: 0,
                    }}
                  >
                    {t('forgotPassword')}
                  </button>
                </div>
                <Button type="submit" variant="primary" size="lg" block>
                  {t('enterWorkspace')}
                </Button>
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('activate')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted, #647488)',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {t('activateAccount')} →
                  </button>
                </div>
              </>
            )}

            {activeTab === 'signup' && (
              <>
                <Input
                  label={t('fullName')}
                  placeholder="Hesham Al-Ahmadi"
                  value={signupFullName}
                  onChange={(e) => setSignupFullName(e.target.value)}
                  required
                />
                <Input
                  label={t('email')}
                  type="email"
                  placeholder="user@avelynq.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
                <Input
                  label={t('password')}
                  type="password"
                  placeholder="••••••••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />
                <Button type="submit" variant="primary" size="lg" block>
                  {t('submitAccountCreation')}
                </Button>
              </>
            )}

            {activeTab === 'activate' && (
              <>
                <Input
                  label={t('username')}
                  placeholder="username"
                  value={activateUsername}
                  onChange={(e) => setActivateUsername(e.target.value)}
                  required
                />
                <Input
                  label={t('activationCode')}
                  placeholder="ACT-998822"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                  required
                />
                <Button type="submit" variant="primary" size="lg" block>
                  {t('submitActivation')}
                </Button>
                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand-primary, #2466D8)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    ← {t('backToLogin')}
                  </button>
                </div>
              </>
            )}

            {activeTab === 'forgot' && (
              <>
                <Input
                  label={t('email')}
                  type="email"
                  placeholder="user@avelynq.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
                <Button type="submit" variant="primary" size="lg" block>
                  {t('submitPasswordResetReq')}
                </Button>
                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand-primary, #2466D8)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    ← {t('backToLogin')}
                  </button>
                </div>
              </>
            )}

            {activeTab === 'reset' && (
              <>
                <Input
                  label={t('otpCode')}
                  placeholder="6-digit OTP"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value)}
                  required
                />
                <Input
                  label={t('newPassword')}
                  type="password"
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Button type="submit" variant="primary" size="lg" block>
                  {t('submitNewPassword')}
                </Button>
                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand-primary, #2466D8)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    ← {t('backToLogin')}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
