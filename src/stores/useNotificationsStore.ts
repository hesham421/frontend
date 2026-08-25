import { create } from 'zustand';
import { NotificationRecord, mockNotifications } from '../data/mockData';

export interface NotificationsState {
  notifications: NotificationRecord[];
  searchQuery: string;
  typeFilter: string;
  statusFilter: string;
  isBellDropdownOpen: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  setTypeFilter: (type: string) => void;
  setStatusFilter: (status: string) => void;
  setBellDropdownOpen: (open: boolean) => void;
  toggleBellDropdown: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  archiveNotification: (id: string) => void;
  getUnreadCount: () => number;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: mockNotifications,
  searchQuery: '',
  typeFilter: 'ALL',
  statusFilter: 'ALL',
  isBellDropdownOpen: false,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setTypeFilter: (typeFilter) => set({ typeFilter }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setBellDropdownOpen: (open) => set({ isBellDropdownOpen: open }),
  toggleBellDropdown: () => set((state) => ({ isBellDropdownOpen: !state.isBellDropdownOpen })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, status: 'READ' } : n)),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, status: 'READ' })),
    })),

  archiveNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, status: 'ARCHIVED' } : n)),
    })),

  getUnreadCount: () => {
    return get().notifications.filter((n) => n.status === 'UNREAD').length;
  },
}));
