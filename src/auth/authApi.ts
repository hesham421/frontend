import { http } from '../lib/http/client';

// Real API DTOs (authentication.md) — F2/SCR-SEC-001. Field names/optionality
// mirror the backend response exactly (R.1.7); kept local to this module
// rather than imported from stores/useAuthStore.ts, which is prototype-only
// zustand state slated for replacement, not a DTO source (AD-4/AD-7).
export interface AuthRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  userId?: number;
  username?: string;
  enabled?: boolean;
}

export interface ActivateAccountRequest {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  accessToken?: string;
  expiresIn?: number;
  // Present in the documented response shape but never read by the client —
  // the refresh token is carried in the httpOnly cookie the backend sets
  // alongside this body (AD-4/R.9.2), not in JS-reachable state.
  refreshToken?: string;
  refreshExpiresIn?: number;
}

export interface UserInfo extends AuthResponse {
  userId?: number;
  username?: string;
  enabled?: boolean;
  roles?: string[];
  permissions?: string[];
}

const AUTH = '/api/auth';

// CSRF cookie name is a frontend architectural assumption (AD-4 double-submit
// pattern), not confirmed against real backend behavior — the OpenAPI docs
// this module is built from never model CSRF, only request/response DTOs.
const readCookie = (name: string) =>
  document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))?.[1];
const csrf = () => readCookie('csrf') ?? '';

export const authApi = {
  // None of these pre-authentication calls carry an access token, so a 401
  // from any of them (bad credentials, unknown username, etc.) must surface
  // as-is — skipAuthRefresh keeps the client from treating it as an
  // expired-token signal and masking the real error behind a doomed
  // refresh-and-retry (there is no session yet to refresh).
  signup: (body: SignupRequest) => http.post<SignupResponse>(`${AUTH}/signup`, body, { skipAuthRefresh: true }),

  activate: (body: ActivateAccountRequest) =>
    http.post<void>(`${AUTH}/signup/activate`, body, { skipAuthRefresh: true }),

  resetPassword: (body: ResetPasswordRequest) =>
    http.post<void>(`${AUTH}/reset-password`, body, { skipAuthRefresh: true }),

  // the httpOnly refresh cookie is scoped to /auth, so only these two carry it
  refresh: () =>
    http.post<AuthResponse>(`${AUTH}/refresh`, undefined, {
      credentials: 'include',
      headers: { 'X-CSRF-Token': csrf() },
      skipAuthRefresh: true,
    }),

  logout: () =>
    http.post<void>(`${AUTH}/logout`, undefined, {
      credentials: 'include',
      headers: { 'X-CSRF-Token': csrf() },
      skipAuthRefresh: true,
    }),

  login: (body: AuthRequest) =>
    http.post<AuthResponse>(`${AUTH}/login`, body, { credentials: 'include', skipAuthRefresh: true }),

  loginWithToken: (body: AuthRequest) =>
    http.post<UserInfo>(`${AUTH}/login-token`, body, { credentials: 'include', skipAuthRefresh: true }),

  forgotPassword: (body: ForgotPasswordRequest) =>
    http.post<void>(`${AUTH}/forgot-password`, body, { skipAuthRefresh: true }),
};
