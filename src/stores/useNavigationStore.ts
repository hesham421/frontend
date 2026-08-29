import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ScreenType =
  | 'dashboard'
  // Module 1: Security
  | 'sec-users'
  | 'sec-roles'
  | 'sec-permissions'
  | 'sec-pages'
  // Module 2: Organization
  | 'org-entities'
  | 'org-branches'
  | 'org-regions'
  | 'org-departments'
  | 'org-cost-centers'
  | 'org-profit-centers'
  | 'org-locations'
  // Module 3: Master Data
  | 'md-master-lookups'
  // Module 4: Notifications
  | 'notif-inbox'
  | 'notif-templates'
  | 'notif-channels';

export interface NavigationState {
  currentScreen: ScreenType;
  sidebarOpen: boolean;
  openGroups: Record<string, boolean>;
  setCurrentScreen: (screen: ScreenType) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleGroup: (groupId: string) => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      currentScreen: 'dashboard',
      sidebarOpen: false,
      openGroups: {
        general: true,
        security: true,
        organization: true,
        masterData: true,
        notifications: true,
      },
      setCurrentScreen: (screen: ScreenType) => set({ currentScreen: screen, sidebarOpen: false }),
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleGroup: (groupId: string) =>
        set((state) => ({
          openGroups: {
            ...state.openGroups,
            [groupId]: !state.openGroups[groupId],
          },
        })),
    }),
    {
      // Session-scoped, not permanent (matches tokenStore's "dies with the
      // tab" model) — a refresh should restore the current screen, but a
      // fresh tab/login should not inherit a stale screen from last time.
      name: 'avelynq-navigation',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ currentScreen: state.currentScreen }),
    },
  ),
);
