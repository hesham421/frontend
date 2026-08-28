import { create } from 'zustand';
import {
  AppUser,
  AppRole,
  AppPermission,
  AppScreen,
  DataScope,
  RolePermission,
  mockUsers,
  mockRoles,
  mockPermissions,
  mockScreens,
  mockDataScopes,
} from '../data/mockData';

export interface SecurityState {
  users: AppUser[];
  roles: AppRole[];
  permissions: AppPermission[];
  screens: AppScreen[];
  dataScopes: DataScope[];
  
  // Selection
  selectedUser: AppUser | null;
  selectedRole: AppRole | null;
  selectedScreen: AppScreen | null;
  selectedPermission: AppPermission | null;
  selectedDataScope: DataScope | null;

  // Filters
  userSearch: string;
  userFilterEnabled: string; // 'ALL' | 'ACTIVE' | 'INACTIVE'
  roleSearch: string;
  roleFilterActive: string; // 'ALL' | 'ACTIVE' | 'INACTIVE'
  permSearch: string;
  permModuleFilter: string; // 'ALL' | 'SEC' | 'ORG' etc.
  pageSearch: string;
  pageModuleFilter: string; // 'ALL' | 'SEC' | 'ORG' etc.
  pageFilterActive: string; // 'ALL' | 'ACTIVE' | 'INACTIVE'

  // Modals & Drawers
  isUserDialogOpen: boolean;
  isRoleDialogOpen: boolean;
  isPermDialogOpen: boolean;
  isPageDrawerOpen: boolean;
  isProfileDrawerOpen: boolean;
  isDataScopeDrawerOpen: boolean;
  isConfirmDialogOpen: boolean;
  confirmActionType: 'DELETE_USER' | 'DEACTIVATE_ROLE' | 'ACTIVATE_ROLE' | 'DEACTIVATE_PAGE' | 'REACTIVATE_PAGE' | 'DELETE_DATASCOPE' | null;
  confirmTargetId: string | null;

  // User Actions
  setUserSearch: (query: string) => void;
  setUserFilterEnabled: (status: string) => void;
  setSelectedUser: (user: AppUser | null) => void;
  openUserDialog: (user?: AppUser | null) => void;
  closeUserDialog: () => void;
  saveUser: (userData: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;

  // Role Actions
  setRoleSearch: (query: string) => void;
  setRoleFilterActive: (status: string) => void;
  setSelectedRole: (role: AppRole | null) => void;
  openRoleDialog: (role?: AppRole | null) => void;
  closeRoleDialog: () => void;
  saveRole: (roleData: Partial<AppRole>) => void;
  activateRole: (id: string) => void;
  deactivateRole: (id: string) => void;
  updateRolePermission: (roleId: string, pageId: string, field: keyof RolePermission, value: boolean) => void;
  syncAllPermissions: (roleId: string, grantAll: boolean) => void;
  copyPermissionsFromRole: (targetRoleId: string, sourceRoleId: string) => void;

  // Permission Actions
  setPermSearch: (query: string) => void;
  setPermModuleFilter: (module: string) => void;
  setSelectedPermission: (perm: AppPermission | null) => void;
  openPermDialog: (perm?: AppPermission | null) => void;
  closePermDialog: () => void;
  savePermission: (permData: Partial<AppPermission>) => void;

  // Page Registry Actions
  setPageSearch: (query: string) => void;
  setPageModuleFilter: (module: string) => void;
  setPageFilterActive: (status: string) => void;
  setSelectedScreen: (screen: AppScreen | null) => void;
  openPageDrawer: (screen?: AppScreen | null) => void;
  closePageDrawer: () => void;
  savePage: (pageData: Partial<AppScreen>) => void;
  deactivatePage: (id: string) => void;
  reactivatePage: (id: string) => void;

  // Profile & Data Scope Actions
  openProfileDrawer: (user?: AppUser | null) => void;
  closeProfileDrawer: () => void;
  saveUserProfile: (userId: string, profile: AppUser['profile']) => void;

  openDataScopeDrawer: (scope?: DataScope | null) => void;
  closeDataScopeDrawer: () => void;
  saveDataScope: (scopeData: Partial<DataScope>) => void;
  deleteDataScope: (id: string) => void;

  // Confirm Dialog Handler
  openConfirmDialog: (type: SecurityState['confirmActionType'], targetId: string) => void;
  closeConfirmDialog: () => void;
  executeConfirmAction: () => void;
}

export const useSecurityStore = create<SecurityState>((set, get) => ({
  users: mockUsers,
  roles: mockRoles,
  permissions: mockPermissions,
  screens: mockScreens,
  dataScopes: mockDataScopes,

  selectedUser: null,
  selectedRole: null,
  selectedScreen: null,
  selectedPermission: null,
  selectedDataScope: null,

  userSearch: '',
  userFilterEnabled: 'ALL',
  roleSearch: '',
  roleFilterActive: 'ALL',
  permSearch: '',
  permModuleFilter: 'ALL',
  pageSearch: '',
  pageModuleFilter: 'ALL',
  pageFilterActive: 'ALL',

  isUserDialogOpen: false,
  isRoleDialogOpen: false,
  isPermDialogOpen: false,
  isPageDrawerOpen: false,
  isProfileDrawerOpen: false,
  isDataScopeDrawerOpen: false,
  isConfirmDialogOpen: false,
  confirmActionType: null,
  confirmTargetId: null,

  // User Actions
  setUserSearch: (userSearch) => set({ userSearch }),
  setUserFilterEnabled: (userFilterEnabled) => set({ userFilterEnabled }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),
  openUserDialog: (user = null) => set({ selectedUser: user, isUserDialogOpen: true }),
  closeUserDialog: () => set({ isUserDialogOpen: false }),
  saveUser: (userData) => {
    set((state) => {
      if (userData.id) {
        return {
          users: state.users.map((u) => (u.id === userData.id ? { ...u, ...userData } as AppUser : u)),
          isUserDialogOpen: false,
        };
      }
      const newUser: AppUser = {
        id: `usr-${Date.now()}`,
        username: userData.username || '',
        email: userData.email || '',
        enabled: userData.enabled ?? true,
        roles: userData.roles || ['role-2'],
        profile: {
          fullNameAr: userData.profile?.fullNameAr || '',
          fullNameEn: userData.profile?.fullNameEn || '',
          branchId: userData.profile?.branchId || 'br-1',
          preferredLang: userData.profile?.preferredLang || 'ar',
          employeeId: userData.profile?.employeeId || `EMP-${Math.floor(100 + Math.random() * 900)}`,
          isActive: true,
        },
      };
      return {
        users: [newUser, ...state.users],
        isUserDialogOpen: false,
      };
    });
  },
  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
      selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
    })),

  // Role Actions
  setRoleSearch: (roleSearch) => set({ roleSearch }),
  setRoleFilterActive: (roleFilterActive) => set({ roleFilterActive }),
  setSelectedRole: (selectedRole) => set({ selectedRole }),
  openRoleDialog: (role = null) => set({ selectedRole: role, isRoleDialogOpen: true }),
  closeRoleDialog: () => set({ isRoleDialogOpen: false }),
  saveRole: (roleData) => {
    set((state) => {
      if (roleData.id) {
        return {
          roles: state.roles.map((r) => (r.id === roleData.id ? { ...r, ...roleData } as AppRole : r)),
          isRoleDialogOpen: false,
        };
      }
      const newRole: AppRole = {
        id: `role-${Date.now()}`,
        roleCode: roleData.roleCode || `ROLE_CUSTOM_${Date.now()}`,
        roleName: roleData.roleName || '',
        description: roleData.description || '',
        isActive: roleData.isActive ?? true,
        permissions: state.screens.map((scr) => ({
          pageId: scr.id,
          canView: true,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        })),
      };
      return {
        roles: [...state.roles, newRole],
        isRoleDialogOpen: false,
      };
    });
  },
  activateRole: (id) =>
    set((state) => ({
      roles: state.roles.map((r) => (r.id === id ? { ...r, isActive: true } : r)),
      selectedRole: state.selectedRole?.id === id ? { ...state.selectedRole, isActive: true } : state.selectedRole,
    })),
  deactivateRole: (id) =>
    set((state) => ({
      roles: state.roles.map((r) => (r.id === id ? { ...r, isActive: false } : r)),
      selectedRole: state.selectedRole?.id === id ? { ...state.selectedRole, isActive: false } : state.selectedRole,
    })),
  updateRolePermission: (roleId, pageId, field, value) =>
    set((state) => ({
      roles: state.roles.map((r) => {
        if (r.id !== roleId) return r;
        const exists = r.permissions.some((p) => p.pageId === pageId);
        const newPerms = exists
          ? r.permissions.map((p) => (p.pageId === pageId ? { ...p, [field]: value } : p))
          : [
              ...r.permissions,
              {
                pageId,
                canView: field === 'canView' ? value : true,
                canCreate: field === 'canCreate' ? value : false,
                canUpdate: field === 'canUpdate' ? value : false,
                canDelete: field === 'canDelete' ? value : false,
              },
            ];
        return { ...r, permissions: newPerms };
      }),
      selectedRole:
        state.selectedRole?.id === roleId
          ? {
              ...state.selectedRole,
              permissions: state.selectedRole.permissions.some((p) => p.pageId === pageId)
                ? state.selectedRole.permissions.map((p) => (p.pageId === pageId ? { ...p, [field]: value } : p))
                : [
                    ...state.selectedRole.permissions,
                    {
                      pageId,
                      canView: field === 'canView' ? value : true,
                      canCreate: field === 'canCreate' ? value : false,
                      canUpdate: field === 'canUpdate' ? value : false,
                      canDelete: field === 'canDelete' ? value : false,
                    },
                  ],
            }
          : state.selectedRole,
    })),
  syncAllPermissions: (roleId, grantAll) =>
    set((state) => {
      const perms = state.screens.map((scr) => ({
        pageId: scr.id,
        canView: grantAll,
        canCreate: grantAll,
        canUpdate: grantAll,
        canDelete: grantAll,
      }));
      return {
        roles: state.roles.map((r) => (r.id === roleId ? { ...r, permissions: perms } : r)),
        selectedRole: state.selectedRole?.id === roleId ? { ...state.selectedRole, permissions: perms } : state.selectedRole,
      };
    }),
  copyPermissionsFromRole: (targetRoleId, sourceRoleId) =>
    set((state) => {
      const source = state.roles.find((r) => r.id === sourceRoleId);
      if (!source) return state;
      return {
        roles: state.roles.map((r) => (r.id === targetRoleId ? { ...r, permissions: [...source.permissions] } : r)),
        selectedRole: state.selectedRole?.id === targetRoleId ? { ...state.selectedRole, permissions: [...source.permissions] } : state.selectedRole,
      };
    }),

  // Permission Actions
  setPermSearch: (permSearch) => set({ permSearch }),
  setPermModuleFilter: (permModuleFilter) => set({ permModuleFilter }),
  setSelectedPermission: (selectedPermission) => set({ selectedPermission }),
  openPermDialog: (perm = null) => set({ selectedPermission: perm, isPermDialogOpen: true }),
  closePermDialog: () => set({ isPermDialogOpen: false }),
  savePermission: (permData) =>
    set((state) => {
      if (permData.id) {
        return {
          permissions: state.permissions.map((p) => (p.id === permData.id ? { ...p, ...permData } as AppPermission : p)),
          isPermDialogOpen: false,
        };
      }
      const newPerm: AppPermission = {
        id: `perm-${Date.now()}`,
        name: permData.name || 'PERM_CUSTOM',
        permissionType: permData.permissionType || 'VIEW',
        pageId: permData.pageId,
        module: permData.module || 'SEC',
      };
      return {
        permissions: [...state.permissions, newPerm],
        isPermDialogOpen: false,
      };
    }),

  // Page Registry Actions
  setPageSearch: (pageSearch) => set({ pageSearch }),
  setPageModuleFilter: (pageModuleFilter) => set({ pageModuleFilter }),
  setPageFilterActive: (pageFilterActive) => set({ pageFilterActive }),
  setSelectedScreen: (selectedScreen) => set({ selectedScreen }),
  openPageDrawer: (screen = null) => set({ selectedScreen: screen, isPageDrawerOpen: true }),
  closePageDrawer: () => set({ isPageDrawerOpen: false }),
  savePage: (pageData) =>
    set((state) => {
      if (pageData.id) {
        return {
          screens: state.screens.map((s) => (s.id === pageData.id ? { ...s, ...pageData } as AppScreen : s)),
          isPageDrawerOpen: false,
        };
      }
      const newId = `SCR-${pageData.module || 'SEC'}-${Date.now()}`;
      const newScreen: AppScreen = {
        id: newId,
        pageCode: pageData.pageCode?.toUpperCase() || `SCR_PAGE_${Date.now()}`,
        nameEn: pageData.nameEn || '',
        nameAr: pageData.nameAr || '',
        module: (pageData.module as AppScreen['module']) || 'SEC',
        route: pageData.route || '/custom',
        icon: pageData.icon || 'ti-file',
        parentId: pageData.parentId,
        displayOrder: pageData.displayOrder || 99,
        description: pageData.description || '',
        isActive: pageData.isActive ?? true,
      };

      // Auto-generate 4 permissions: VIEW, CREATE, UPDATE, DELETE
      const autoPerms: AppPermission[] = [
        { id: `perm-${Date.now()}-1`, name: `PERM_${newScreen.pageCode}_VIEW`, permissionType: 'VIEW', pageId: newId, module: newScreen.module },
        { id: `perm-${Date.now()}-2`, name: `PERM_${newScreen.pageCode}_CREATE`, permissionType: 'CREATE', pageId: newId, module: newScreen.module },
        { id: `perm-${Date.now()}-3`, name: `PERM_${newScreen.pageCode}_UPDATE`, permissionType: 'UPDATE', pageId: newId, module: newScreen.module },
        { id: `perm-${Date.now()}-4`, name: `PERM_${newScreen.pageCode}_DELETE`, permissionType: 'DELETE', pageId: newId, module: newScreen.module },
      ];

      return {
        screens: [...state.screens, newScreen],
        permissions: [...state.permissions, ...autoPerms],
        isPageDrawerOpen: false,
      };
    }),
  deactivatePage: (id) =>
    set((state) => ({
      screens: state.screens.map((s) => (s.id === id ? { ...s, isActive: false } : s)),
    })),
  reactivatePage: (id) =>
    set((state) => ({
      screens: state.screens.map((s) => (s.id === id ? { ...s, isActive: true } : s)),
    })),

  // Profile & Data Scope Drawers
  openProfileDrawer: (user = null) => set({ selectedUser: user, isProfileDrawerOpen: true }),
  closeProfileDrawer: () => set({ isProfileDrawerOpen: false }),
  saveUserProfile: (userId, profile) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === userId ? { ...u, profile } : u)),
      selectedUser: state.selectedUser?.id === userId ? { ...state.selectedUser, profile } : state.selectedUser,
      isProfileDrawerOpen: false,
    })),

  openDataScopeDrawer: (scope = null) => set({ selectedDataScope: scope, isDataScopeDrawerOpen: true }),
  closeDataScopeDrawer: () => set({ isDataScopeDrawerOpen: false }),
  saveDataScope: (scopeData) =>
    set((state) => {
      if (scopeData.id) {
        return {
          dataScopes: state.dataScopes.map((d) => (d.id === scopeData.id ? { ...d, ...scopeData } as DataScope : d)),
          isDataScopeDrawerOpen: false,
        };
      }
      const newScope: DataScope = {
        id: `ds-${Date.now()}`,
        roleId: scopeData.roleId || state.selectedRole?.id || 'role-1',
        branchId: scopeData.branchId || 'br-1',
        dataAccessLevel: scopeData.dataAccessLevel || 'BRANCH_ONLY',
        isActive: scopeData.isActive ?? true,
      };
      return {
        dataScopes: [...state.dataScopes, newScope],
        isDataScopeDrawerOpen: false,
      };
    }),
  deleteDataScope: (id) =>
    set((state) => ({
      dataScopes: state.dataScopes.filter((d) => d.id !== id),
      isDataScopeDrawerOpen: false,
    })),

  // Confirm Dialog Handler
  openConfirmDialog: (type, targetId) => set({ confirmActionType: type, confirmTargetId: targetId, isConfirmDialogOpen: true }),
  closeConfirmDialog: () => set({ isConfirmDialogOpen: false, confirmActionType: null, confirmTargetId: null }),
  executeConfirmAction: () => {
    const { confirmActionType, confirmTargetId, deleteUser, deactivateRole, activateRole, deactivatePage, reactivatePage, deleteDataScope } = get();
    if (!confirmTargetId) return;

    if (confirmActionType === 'DELETE_USER') deleteUser(confirmTargetId);
    else if (confirmActionType === 'DEACTIVATE_ROLE') deactivateRole(confirmTargetId);
    else if (confirmActionType === 'ACTIVATE_ROLE') activateRole(confirmTargetId);
    else if (confirmActionType === 'DEACTIVATE_PAGE') deactivatePage(confirmTargetId);
    else if (confirmActionType === 'REACTIVATE_PAGE') reactivatePage(confirmTargetId);
    else if (confirmActionType === 'DELETE_DATASCOPE') deleteDataScope(confirmTargetId);

    set({ isConfirmDialogOpen: false, confirmActionType: null, confirmTargetId: null });
  },
}));
