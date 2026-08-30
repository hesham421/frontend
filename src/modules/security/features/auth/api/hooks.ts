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
import { useAuthStore } from '../store';

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
  const logout = useAuthStore((s) => s.logout);
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      tokenStore.clear();
      logout();
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
 * Restores the session on page refresh or initial mount.
 * Checks tokenStore (backed by sessionStorage) and attempts a silent refresh via httpOnly cookie.
 */
export function useSessionBootstrap() {
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const existingToken = tokenStore.get();
    if (existingToken && !tokenStore.isExpired()) {
      const claims = decodeAccessToken(existingToken);
      if (claims) {
        const roles = claims.authorities.filter((a) => !a.startsWith('PERM_') && !/\d/.test(a));
        login({ username: claims.username, roles, permissions: claims.authorities });
      }

      // If token is still valid and not expiring soon, we are ready immediately
      if (!tokenStore.expiresSoon()) {
        setReady(true);
        return;
      }
    }

    // Try silent refresh using the httpOnly cookie
    authApi
      .refresh()
      .then((r) => {
        if (cancelled || !r.accessToken) return;
        tokenStore.set(r.accessToken, r.expiresIn ?? 0);
        const claims = decodeAccessToken(r.accessToken);
        if (!claims) return;
        const roles = claims.authorities.filter((a) => !a.startsWith('PERM_') && !/\d/.test(a));
        login({ username: claims.username, roles, permissions: claims.authorities });
      })
      .catch(() => {
        // If refresh fails and there is no active unexpired token, clear session
        if (!tokenStore.get() || tokenStore.isExpired()) {
          tokenStore.clear();
          logout();
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [login, logout]);

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
