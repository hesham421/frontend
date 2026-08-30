import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useLanguage } from '../context/LanguageContext';
import { useAuthStore, type UserInfo } from '../stores/useAuthStore';
import { useAuthFacade } from '../auth/hooks';
import { loginSchema, signupSchema, activateSchema, forgotPasswordSchema, resetPasswordSchema } from '../auth/auth.schema';
import { mapApiError } from '../lib/errors/mapApiError';
import { secErrorMessage } from '../lib/errors/secErrors';
import { Button } from '../components/ui/Button';
import { Input, Checkbox } from '../components/ui/FormControls';
import { Tabs, Alert } from '../components/ui/OverlaysAndFeedback';

export interface LoginProps {
  onLogin?: (info: UserInfo) => void;
}

type AuthTab = 'login' | 'signup' | 'activate' | 'forgot' | 'reset';

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

// The reset-password and account-activation emails link to
// `<origin>/reset-password?token=...` / `?token=...` (see backend
// PasswordResetEmailContextBuilder). This SPA has no URL router (App.tsx
// gates everything on isAuthenticated via an in-memory screen switch), so
// without reading the query string here, that link is decorative — nothing
// ever consumed the token, and a stale session in the same browser would
// just bounce the user straight to the dashboard instead.
function readTokenFromUrl(): { tab: AuthTab; token: string } | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (!token) return null;
  const tab: AuthTab = window.location.pathname.includes('activate') ? 'activate' : 'reset';
  return { tab, token };
}

export const Login: React.FC<LoginProps> = ({ onLogin: propOnLogin }) => {
  const { t, lang, toggleLanguage, dir } = useLanguage();
  const storeLogin = useAuthStore((state) => state.login);
  const handleLogin = propOnLogin ?? storeLogin;
  const { loginWithToken, signup, activate, forgotPassword, resetPassword, isLoading } = useAuthFacade();

  const [urlToken] = useState(readTokenFromUrl);
  const [activeTab, setActiveTab] = useState<AuthTab>(urlToken?.tab ?? 'login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Signup fields
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Activate fields — `activateUsername` is display-only context for the
  // user; ActivateAccountRequest only carries `token` (confirmed contract).
  const [activateUsername, setActivateUsername] = useState('');
  const [activationCode, setActivationCode] = useState(urlToken?.tab === 'activate' ? urlToken.token : '');

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Reset password fields — `resetOtp` is the token from the emailed link.
  const [resetOtp, setResetOtp] = useState(urlToken?.tab === 'reset' ? urlToken.token : '');
  const [newPassword, setNewPassword] = useState('');

  // The token now lives in component state; drop it from the visible URL so
  // a refresh/share/back-navigation doesn't re-expose or re-consume it.
  useEffect(() => {
    if (urlToken) {
      window.history.replaceState(null, '', window.location.pathname === '/' ? '/' : window.location.origin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const switchTab = (tab: AuthTab) => {
    setErrorMessage(null);
    setFieldErrors({});
    setFeedbackMessage(null);
    setActiveTab(tab);
  };

  const errorText = (err: unknown): string => mapApiError(err, t);

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);
    setErrorMessage(null);
    setFieldErrors({});

    if (activeTab === 'login') {
      const parsed = loginSchema.safeParse({ username, password });
      if (!parsed.success) return setFieldErrors(fieldErrorsFrom(parsed.error));
      try {
        const info = await loginWithToken(parsed.data);
        handleLogin(info);
      } catch (err) {
        setErrorMessage(errorText(err));
      }
    } else if (activeTab === 'signup') {
      const parsed = signupSchema.safeParse({ username: signupUsername, email: signupEmail, password: signupPassword });
      if (!parsed.success) return setFieldErrors(fieldErrorsFrom(parsed.error));
      try {
        await signup(parsed.data);
        // RULE-SEC-030 — account is disabled until activated; this is the
        // mandated post-submit message, not a generic success toast.
        setFeedbackMessage(secErrorMessage('ERR-SEC-030', lang));
        setTimeout(() => {
          setActiveTab('activate');
          setFeedbackMessage(null);
        }, 1500);
      } catch (err) {
        setErrorMessage(errorText(err));
      }
    } else if (activeTab === 'activate') {
      const parsed = activateSchema.safeParse({ token: activationCode });
      if (!parsed.success) return setFieldErrors(fieldErrorsFrom(parsed.error));
      try {
        await activate(parsed.data);
        setFeedbackMessage(lang === 'ar' ? 'تم تفعيل الحساب بنجاح! يمكنك الآن تسجيل الدخول.' : 'Account activated successfully! You can now sign in.');
        setTimeout(() => {
          setActiveTab('login');
          setFeedbackMessage(null);
        }, 1500);
      } catch (err) {
        setErrorMessage(errorText(err));
      }
    } else if (activeTab === 'forgot') {
      const parsed = forgotPasswordSchema.safeParse({ email: forgotEmail });
      if (!parsed.success) return setFieldErrors(fieldErrorsFrom(parsed.error));
      try {
        await forgotPassword(parsed.data);
        // RULE-SEC-038 — anti-enumeration: identical message regardless of
        // whether the email exists, always shown on success.
        setFeedbackMessage(secErrorMessage('ERR-SEC-038', lang));
        setTimeout(() => {
          setActiveTab('reset');
          setFeedbackMessage(null);
        }, 1500);
      } catch (err) {
        setErrorMessage(errorText(err));
      }
    } else if (activeTab === 'reset') {
      const parsed = resetPasswordSchema.safeParse({ token: resetOtp, newPassword });
      if (!parsed.success) return setFieldErrors(fieldErrorsFrom(parsed.error));
      try {
        await resetPassword(parsed.data);
        setFeedbackMessage(lang === 'ar' ? 'تم تحديث كلمة المرور بنجاح! يرجى تسجيل الدخول.' : 'Password updated successfully! Please sign in.');
        setTimeout(() => {
          setActiveTab('login');
          setFeedbackMessage(null);
        }, 1500);
      } catch (err) {
        setErrorMessage(errorText(err));
      }
    }
  };

  // RULE-SEC-033 — a token-consuming form must not be resubmittable with
  // the same token once it has succeeded (until it navigates away).
  const submitDisabled = isLoading || ((activeTab === 'activate' || activeTab === 'reset') && !!feedbackMessage);

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
            iconLeft={<i className="ti ti-language" aria-hidden="true" style={{ fontSize: '15px' }} />}
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
                  { id: 'login', label: t('login'), icon: <i className="ti ti-lock" aria-hidden="true" /> },
                  { id: 'signup', label: t('signup'), icon: <i className="ti ti-user-plus" aria-hidden="true" /> },
                ]}
                activeTab={activeTab}
                onChange={(id) => switchTab(id as AuthTab)}
              />
            </div>
          )}

          {feedbackMessage && (
            <div style={{ marginBottom: '18px' }}>
              <Alert variant="success" message={feedbackMessage} />
            </div>
          )}

          {errorMessage && (
            <div style={{ marginBottom: '18px' }}>
              <Alert variant="danger" message={errorMessage} />
            </div>
          )}

          {/* Form container */}
          <form onSubmit={onFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeTab === 'login' && (
              <>
                <Input
                  label={t('username')}
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  iconLeft={<i className="ti ti-user" aria-hidden="true" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
                  error={fieldErrors.username}
                  required
                />
                <Input
                  label={t('password')}
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  iconLeft={<i className="ti ti-key" aria-hidden="true" style={{ color: 'var(--text-subtle, #8C9AAC)' }} />}
                  error={fieldErrors.password}
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
                    onClick={() => switchTab('forgot')}
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
                <Button type="submit" variant="primary" size="lg" block loading={isLoading} disabled={submitDisabled}>
                  {t('enterWorkspace')}
                </Button>
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => switchTab('activate')}
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
                  label={t('username')}
                  placeholder="username"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  error={fieldErrors.username}
                  required
                />
                <Input
                  label={t('email')}
                  type="email"
                  placeholder="user@avelynq.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  error={fieldErrors.email}
                  required
                />
                <Input
                  label={t('password')}
                  type="password"
                  placeholder="••••••••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  error={fieldErrors.password}
                  required
                />
                <Button type="submit" variant="primary" size="lg" block loading={isLoading} disabled={submitDisabled}>
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
                />
                <Input
                  label={t('activationCode')}
                  placeholder="ACT-998822"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                  error={fieldErrors.token}
                  required
                />
                <Button type="submit" variant="primary" size="lg" block loading={isLoading} disabled={submitDisabled}>
                  {t('submitActivation')}
                </Button>
                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => switchTab('login')}
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
                  error={fieldErrors.email}
                  required
                />
                <Button type="submit" variant="primary" size="lg" block loading={isLoading} disabled={submitDisabled}>
                  {t('submitPasswordResetReq')}
                </Button>
                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => switchTab('login')}
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
                  error={fieldErrors.token}
                  required
                />
                <Input
                  label={t('newPassword')}
                  type="password"
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={fieldErrors.newPassword}
                  required
                />
                <Button type="submit" variant="primary" size="lg" block loading={isLoading} disabled={submitDisabled}>
                  {t('submitNewPassword')}
                </Button>
                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => switchTab('login')}
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
