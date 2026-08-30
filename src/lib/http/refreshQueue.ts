import { tokenStore } from '@/features/auth/api/tokenStore';
import { authApi, type AuthResponse } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth';
import { useNavigationStore } from '@/stores/useNavigationStore';

// Single-flight refresh (R.9.5, R.9.6): every concurrent 401 awaits the same
// promise instead of starting its own; a failed refresh clears the token
// AND the auth store — an expired/invalid session must drop the user back
// to Login, not leave the shell stuck in a stale isAuthenticated:true state
// with every subsequent request now failing.
let inFlight: Promise<void> | null = null;

export function refreshOnce(): Promise<void> {
  inFlight ??= authApi
    .refresh()
    .then((r: AuthResponse) => {
      if (r.accessToken) tokenStore.set(r.accessToken, r.expiresIn ?? 0);
    })
    .catch((e: unknown) => {
      tokenStore.clear();
      useAuthStore.getState().logout();
      useNavigationStore.getState().setCurrentScreen('dashboard');
      throw e;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight!;
}
