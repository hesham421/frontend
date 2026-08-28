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
