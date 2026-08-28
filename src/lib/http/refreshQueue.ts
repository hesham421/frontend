import { tokenStore } from '../../auth/tokenStore';
import { authApi } from '../../auth/authApi';

// Single-flight refresh (R.9.5, R.9.6): every concurrent 401 awaits the same
// promise instead of starting its own; a failed refresh clears the token
// rather than retrying (hard logout — session teardown/redirect is wired at
// the app-shell level once F4 integrates this screen).
let inFlight: Promise<void> | null = null;

export function refreshOnce(): Promise<void> {
  inFlight ??= authApi
    .refresh()
    .then((r) => {
      if (r.accessToken) tokenStore.set(r.accessToken, r.expiresIn ?? 0);
    })
    .catch((e) => {
      tokenStore.clear();
      throw e;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}
