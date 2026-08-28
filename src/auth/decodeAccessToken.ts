export interface AccessTokenClaims {
  username: string;
  authorities: string[];
}

// Client-side only, for restoring the UI's username/permissions display
// after a silent refresh — real enforcement of every permission is
// server-side (AD-6) and does not depend on this decode succeeding.
export function decodeAccessToken(token: string): AccessTokenClaims | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const claims = JSON.parse(json) as { sub?: unknown; authorities?: unknown };
    if (typeof claims.sub !== 'string' || !Array.isArray(claims.authorities)) return null;
    return { username: claims.sub, authorities: claims.authorities as string[] };
  } catch {
    return null;
  }
}
