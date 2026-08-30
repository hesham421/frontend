const ACCESS_TOKEN_KEY = 'avelynq_access_token';
const EXPIRES_AT_KEY = 'avelynq_token_expires_at';

const getInitialToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
};

const getInitialExpiresAt = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const val = sessionStorage.getItem(EXPIRES_AT_KEY);
    return val ? Number(val) : 0;
  } catch {
    return 0;
  }
};

let accessToken: string | null = getInitialToken();
let expiresAt: number = getInitialExpiresAt();

export const tokenStore = {
  get: () => accessToken,
  set: (token: string, expiresInSeconds: number) => {
    accessToken = token;
    // A non-positive/omitted TTL must not make expiresSoon() permanently true.
    expiresAt = expiresInSeconds > 0 ? Date.now() + expiresInSeconds * 1000 : Infinity;
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
        sessionStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
      } catch {
        // Ignore storage errors (e.g. quota/disabled storage)
      }
    }
  },
  clear: () => {
    accessToken = null;
    expiresAt = 0;
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(ACCESS_TOKEN_KEY);
        sessionStorage.removeItem(EXPIRES_AT_KEY);
      } catch {
        // Ignore storage errors
      }
    }
  },
  expiresSoon: () => accessToken !== null && expiresAt - Date.now() < 60_000,
  isExpired: () => accessToken !== null && Date.now() >= expiresAt,
};
