/** Request body for Forgot Password (API-SEC-042, SCR-SEC-009). */
export interface ForgotPasswordRequest {
  email: string;
}

/** Request body for Reset Password (API-SEC-043, SCR-SEC-009). */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
