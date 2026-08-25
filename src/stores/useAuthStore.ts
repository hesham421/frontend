import { create } from 'zustand';

export interface UserProfile {
  username: string;
  nameEn: string;
  nameAr: string;
  role: 'admin' | 'finance' | 'hr';
  roleTitleEn: string;
  roleTitleAr: string;
  avatar: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile;
  login: (role?: 'admin' | 'finance' | 'hr', username?: string) => void;
  logout: () => void;
}

const DEFAULT_USER: UserProfile = {
  username: 'admin',
  nameEn: 'Administrator',
  nameAr: 'المسؤول',
  role: 'admin',
  roleTitleEn: 'Global Systems Admin',
  roleTitleAr: 'مدير الأنظمة الشاملة',
  avatar: '',
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: DEFAULT_USER,
  login: (role = 'admin', username = 'admin') =>
    set({
      isAuthenticated: true,
      user: {
        ...DEFAULT_USER,
        username,
        nameEn: username === 'admin' ? 'Administrator' : username,
        nameAr: username === 'admin' ? 'المسؤول' : username,
        role,
        roleTitleEn: role === 'admin' ? 'Global Systems Admin' : role === 'finance' ? 'Chief Financial Controller' : 'HR Operations Director',
        roleTitleAr: role === 'admin' ? 'مدير الأنظمة الشاملة' : role === 'finance' ? 'المراقب المالي الرئيسي' : 'مدير عمليات الموارد البشرية',
      },
    }),
  logout: () => set({ isAuthenticated: false }),
}));
