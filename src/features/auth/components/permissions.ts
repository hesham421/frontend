import { useAuthStore } from '@/stores/useAuthStore';

/**
 * AD-6 — this is a UX layer only; the backend enforces every permission
 * server-side regardless of this check. Reads the one real permission
 * source in the app: the flattened permissions[] from the login-token
 * response (useAuthStore.user.permissions), never a second copy.
 */
export function usePermission() {
  const permissions = useAuthStore((state) => state.user.permissions);
  return {
    can: (permission: string) => permissions.includes(permission),
  };
}
