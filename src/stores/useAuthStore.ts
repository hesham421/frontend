import { create } from 'zustand';

// Real API DTOs (authentication.md) — F1/SCR-SEC-001. Not wired yet (F2/F3).
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

// Derived from the real login-token response (UserInfo) — the backend has
// no localized display name or avatar, so nameEn/nameAr fall back to
// username and roleTitle falls back to the joined roles list (F4).
export interface UserProfile {
  username: string;
  nameEn: string;
  nameAr: string;
  roles: string[];
  permissions: string[];
  roleTitleEn: string;
  roleTitleAr: string;
  avatar: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile;
  login: (info: UserInfo) => void;
  logout: () => void;
}

const EMPTY_USER: UserProfile = {
  username: '',
  nameEn: '',
  nameAr: '',
  roles: [],
  permissions: [],
  roleTitleEn: '',
  roleTitleAr: '',
  avatar: '',
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: EMPTY_USER,
  login: (info) =>
    set({
      isAuthenticated: true,
      user: {
        ...EMPTY_USER,
        username: info.username ?? '',
        nameEn: info.username ?? '',
        nameAr: info.username ?? '',
        roles: info.roles ?? [],
        permissions: info.permissions ?? [],
        roleTitleEn: info.roles?.join(', ') ?? '',
        roleTitleAr: info.roles?.join('، ') ?? '',
      },
    }),
  logout: () => set({ isAuthenticated: false, user: EMPTY_USER }),
}));
