// In-memory only — never localStorage/sessionStorage/React state (R.9.1, SEC.1). Dies with the tab.
let accessToken: string | null = null;
let expiresAt = 0;

export const tokenStore = {
  get: () => accessToken,
  set: (token: string, expiresInSeconds: number) => {
    accessToken = token;
    // A non-positive/omitted TTL must not make expiresSoon() permanently true.
    expiresAt = expiresInSeconds > 0 ? Date.now() + expiresInSeconds * 1000 : Infinity;
  },
  clear: () => {
    accessToken = null;
    expiresAt = 0;
  },
  expiresSoon: () => accessToken !== null && expiresAt - Date.now() < 60_000,
};
