import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  authApi,
  type ActivateAccountRequest,
  type AuthRequest,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
  type SignupRequest,
} from './authApi';
import { tokenStore } from './tokenStore';
import { decodeAccessToken } from './decodeAccessToken';
import { useAuthStore } from '@/stores/useAuthStore';

// F2-QUERY blocks API-SEC-001..008 — all pre-auth POSTs, no useQuery here (R.3.2).

export function useSignupMutation() {
  return useMutation({ mutationFn: (body: SignupRequest) => authApi.signup(body) });
}

export function useActivateMutation() {
  return useMutation({ mutationFn: (body: ActivateAccountRequest) => authApi.activate(body) });
}

export function useResetPasswordMutation() {
  return useMutation({ mutationFn: (body: ResetPasswordRequest) => authApi.resetPassword(body) });
}

export function useRefreshMutation() {
  return useMutation({
    mutationFn: () => authApi.refresh(),
    onSuccess: (r) => {
      if (r.accessToken) tokenStore.set(r.accessToken, r.expiresIn ?? 0);
    },
  });
}

export function useLogoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      tokenStore.clear();
      qc.clear(); // entire query cache cleared on logout (SEC.9)
    },
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: (body: AuthRequest) => authApi.login(body),
    onSuccess: (r) => {
      if (r.accessToken) tokenStore.set(r.accessToken, r.expiresIn ?? 0);
    },
  });
}

export function useLoginWithTokenMutation() {
  return useMutation({
    mutationFn: (body: AuthRequest) => authApi.loginWithToken(body),
    onSuccess: (r) => {
      if (r.accessToken) tokenStore.set(r.accessToken, r.expiresIn ?? 0);
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({ mutationFn: (body: ForgotPasswordRequest) => authApi.forgotPassword(body) });
}

/**
 * Restores the session on a hard refresh. The access token lives only in
 * memory (tokenStore) and dies with the tab (R.9.1), but the httpOnly
 * refresh cookie survives — trade it for a new access token once at
 * startup and rebuild useAuthStore from that token's own claims, instead
 * of leaving isAuthenticated at its false default forever. A normal
 * refresh must not read as a logout.
 */
export function useSessionBootstrap() {
  const login = useAuthStore((s) => s.login);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    authApi
      .refresh()
      .then((r) => {
        if (cancelled || !r.accessToken) return;
        tokenStore.set(r.accessToken, r.expiresIn ?? 0);
        const claims = decodeAccessToken(r.accessToken);
        if (!claims) return;
        // authorities merges role names and PERM_* grants (confirmed via
        // the live login-token response); permissions needs the whole list
        // for usePermission.can(). roles is display-only, so a best-effort
        // split is enough — excluding digits too (not just the PERM_
        // prefix) because this environment's seed data carries leftover
        // e2e-test permission codes (PWTEST_...) that don't use the PERM_
        // prefix but do carry a numeric id/hash, unlike real role names.
        const roles = claims.authorities.filter((a) => !a.startsWith('PERM_') && !/\d/.test(a));
        login({ username: claims.username, roles, permissions: claims.authorities });
      })
      .catch(() => tokenStore.clear())
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [login]);

  return ready;
}

/**
 * F2-FACADE-HOOK — SCR-SEC-001. Components call this facade only; it composes
 * the 8 mutations above and nothing else (boundary per spec). No toasts,
 * dialogs, or navigation here (R.3.11) — callers own the reaction.
 */
export function useAuthFacade() {
  const login = useLoginMutation();
  const loginWithToken = useLoginWithTokenMutation();
  const signup = useSignupMutation();
  const activate = useActivateMutation();
  const forgotPassword = useForgotPasswordMutation();
  const resetPassword = useResetPasswordMutation();
  const refresh = useRefreshMutation();
  const logout = useLogoutMutation();

  const isLoading = [login, loginWithToken, signup, activate, forgotPassword, resetPassword, refresh, logout].some(
    (m) => m.isPending,
  );

  return {
    isAuthenticated: tokenStore.get() !== null,
    isLoading,
    login: login.mutateAsync,
    loginWithToken: loginWithToken.mutateAsync,
    signup: signup.mutateAsync,
    activate: activate.mutateAsync,
    forgotPassword: forgotPassword.mutateAsync,
    resetPassword: resetPassword.mutateAsync,
    refresh: refresh.mutateAsync,
    logout: logout.mutateAsync,
  };
}
