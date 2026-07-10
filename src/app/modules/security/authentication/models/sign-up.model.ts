/**
 * Request body for self-registration (API-SEC-040, SCR-SEC-008).
 * Matches backend SignupRequest exactly — username, email, password only
 * (no firstName/lastName — flagged as a field-mismatch fix vs the F1 shell).
 */
export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

/** No tokens are issued — RULE-SEC-030 requires the account start disabled, pending activation. */
export interface SignupResponse {
  userId: number;
  username: string;
  enabled: boolean;
}

export interface ActivateAccountRequest {
  token: string;
}
