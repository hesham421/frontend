import { ApiError, type ApiErrorKind } from './ApiError';

// Backend error codes (payload.error.code — see lib/http/client.ts) that carry
// more specific business meaning than their `kind` alone. Add an entry here
// only for a code actually observed from the backend — never invent one.
const CODE_KEYS: Partial<Record<string, string>> = {
  PERMISSION_ALREADY_EXISTS: 'errPermissionAlreadyExists',
  INVALID_CREDENTIALS: 'errInvalidCredentials',
  SIGNUP_USERNAME_ALREADY_EXISTS: 'errUsernameAlreadyExists',
  ACTIVATION_TOKEN_INVALID_OR_EXPIRED: 'errActivationTokenInvalid',
  RESET_TOKEN_INVALID_OR_EXPIRED: 'errResetTokenInvalid',
};

// One fallback message per kind (lib/errors/ApiError.ts's closed taxonomy).
// This is the floor every error lands on when its code isn't specifically
// mapped above — never the raw backend message.
const KIND_KEYS: Record<ApiErrorKind, string> = {
  network: 'errNetwork',
  unauthenticated: 'errUnauthenticated',
  forbidden: 'errForbidden',
  notFound: 'errNotFound',
  validation: 'errValidation',
  conflict: 'errConflict',
  server: 'errServer',
  unknown: 'errServer',
};

/**
 * Maps any thrown value to a user-facing, localized message — the backend's
 * own wording (e.g. "Permission already exists in tenant: PERM_...") never
 * reaches the UI. Use for every mutation catch block and every list-load
 * error; see skills/ui-ux/SKILL.md, "Message / feedback standards".
 */
export function mapApiError(err: unknown, t: (key: string) => string): string {
  if (!(err instanceof ApiError)) return t('errUnknown');
  const key = (err.code && CODE_KEYS[err.code]) ?? KIND_KEYS[err.kind];
  return t(key);
}
