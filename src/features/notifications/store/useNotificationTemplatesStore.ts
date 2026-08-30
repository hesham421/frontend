import { create } from 'zustand';
import {
  NotificationTemplate,
  NotificationChannel,
  mockNotificationTemplates,
  mockNotificationChannels,
} from '@/data/mockData';

export interface NotificationTemplatesState {
  templates: NotificationTemplate[];
  channels: NotificationChannel[];

  // Selection
  selectedTemplate: NotificationTemplate | null;
  editingChannelId: string | null;
  editingChannelJson: string;

  // Filters
  templateSearch: string;
  channelFilter: string;
  moduleFilter: string;
  statusFilter: string;

  // Drawers & Dialogs
  isTemplateDrawerOpen: boolean;
  isConfirmDialogOpen: boolean;
  confirmActionType: 'DEACTIVATE_TEMPLATE' | 'TOGGLE_CHANNEL' | null;
  confirmTargetId: string | null;

  // Template Actions
  setTemplateSearch: (query: string) => void;
  setChannelFilter: (channel: string) => void;
  setModuleFilter: (module: string) => void;
  setStatusFilter: (status: string) => void;
  setSelectedTemplate: (template: NotificationTemplate | null) => void;
  openTemplateDrawer: (template?: NotificationTemplate | null) => void;
  closeTemplateDrawer: () => void;
  saveTemplate: (data: Partial<NotificationTemplate>) => void;
  deactivateTemplate: (id: string) => void;

  // Channel Actions
  setEditingChannelId: (id: string | null) => void;
  setEditingChannelJson: (json: string) => void;
  saveChannelConfig: (id: string, configJson: string) => void;
  toggleChannelStatus: (id: string, enabled: boolean) => void;

  // Confirm Actions
  openConfirmDialog: (type: NotificationTemplatesState['confirmActionType'], targetId: string) => void;
  closeConfirmDialog: () => void;
  executeConfirmAction: () => void;
}

export const useNotificationTemplatesStore = create<NotificationTemplatesState>((set, get) => ({
  templates: mockNotificationTemplates,
  channels: mockNotificationChannels,

  selectedTemplate: null,
  editingChannelId: null,
  editingChannelJson: '',

  templateSearch: '',
  channelFilter: 'ALL',
  moduleFilter: 'ALL',
  statusFilter: 'ALL',

  isTemplateDrawerOpen: false,
  isConfirmDialogOpen: false,
  confirmActionType: null,
  confirmTargetId: null,

  setTemplateSearch: (templateSearch) => set({ templateSearch }),
  setChannelFilter: (channelFilter) => set({ channelFilter }),
  setModuleFilter: (moduleFilter) => set({ moduleFilter }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setSelectedTemplate: (selectedTemplate) => set({ selectedTemplate }),

  openTemplateDrawer: (template = null) => set({ selectedTemplate: template, isTemplateDrawerOpen: true }),
  closeTemplateDrawer: () => set({ isTemplateDrawerOpen: false }),

  saveTemplate: (data) =>
    set((state) => {
      if (data.id) {
        return {
          templates: state.templates.map((t) => (t.id === data.id ? { ...t, ...data } as NotificationTemplate : t)),
          isTemplateDrawerOpen: false,
        };
      }
      const newTmpl: NotificationTemplate = {
        id: `tmpl-${Date.now()}`,
        templateCode: data.templateCode || `TMPL_${Date.now()}`,
        templateNameEn: data.templateNameEn || '',
        templateNameAr: data.templateNameAr || '',
        channelTypeId: data.channelTypeId || 'EMAIL',
        moduleCode: data.moduleCode || 'SYS',
        templateBodyEn: data.templateBodyEn || '',
        templateBodyAr: data.templateBodyAr || '',
        isActive: data.isActive ?? true,
      };
      return {
        templates: [...state.templates, newTmpl],
        isTemplateDrawerOpen: false,
      };
    }),

  deactivateTemplate: (id) =>
    set((state) => ({
      templates: state.templates.map((t) => (t.id === id ? { ...t, isActive: false } : t)),
    })),

  setEditingChannelId: (id) => {
    const channel = get().channels.find((c) => c.id === id);
    set({
      editingChannelId: id,
      editingChannelJson: channel ? channel.configJson : '',
    });
  },

  setEditingChannelJson: (editingChannelJson) => set({ editingChannelJson }),

  saveChannelConfig: (id, configJson) =>
    set((state) => ({
      channels: state.channels.map((c) => (c.id === id ? { ...c, configJson } : c)),
      editingChannelId: null,
      editingChannelJson: '',
    })),

  toggleChannelStatus: (id, enabled) =>
    set((state) => ({
      channels: state.channels.map((c) => (c.id === id ? { ...c, isEnabled: enabled } : c)),
    })),

  openConfirmDialog: (type, targetId) => set({ confirmActionType: type, confirmTargetId: targetId, isConfirmDialogOpen: true }),
  closeConfirmDialog: () => set({ isConfirmDialogOpen: false, confirmActionType: null, confirmTargetId: null }),
  executeConfirmAction: () => {
    const { confirmActionType, confirmTargetId, deactivateTemplate, toggleChannelStatus } = get();
    if (!confirmTargetId) return;

    if (confirmActionType === 'DEACTIVATE_TEMPLATE') {
      deactivateTemplate(confirmTargetId);
    } else if (confirmActionType === 'TOGGLE_CHANNEL') {
      const ch = get().channels.find((c) => c.id === confirmTargetId);
      if (ch) toggleChannelStatus(confirmTargetId, !ch.isEnabled);
    }

    set({ isConfirmDialogOpen: false, confirmActionType: null, confirmTargetId: null });
  },
}));
