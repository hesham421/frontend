// ============================================================================
// AVELYNQ ERP — Comprehensive Mock Data & Domain Models
// Covers: Security (SEC), Organization (ORG), File Service (FILE), Notifications (NOTIF)
// ============================================================================

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  status: string;
}

// ----------------------------------------------------------------------------
// MODULE 1: SECURITY (SEC)
// ----------------------------------------------------------------------------

export interface UserProfile {
  fullNameAr: string;
  fullNameEn: string;
  // F1/SCR-SEC-006: real field is branchIdFk, numeric (PK is shared with
  // USERS via @MapsId — no separate id on this entity at all).
  branchId: string;
  // F1/SCR-SEC-006: srs.md OQ-001 CLOSED — genuinely free-text VARCHAR(10)
  // on the wire, not a closed union. F3 may still constrain the *input
  // control* to ar/en as a pure UX choice, but must not present it as a
  // backend contract. Widening deferred to F2.
  preferredLang: 'ar' | 'en';
  // F1/SCR-SEC-006: real field is employeeIdFk, numeric (BIGINT), and per
  // srs.md OQ-002 CLOSED is permanently unconstrained (no FK validation).
  employeeId: string;
  // F1/SCR-SEC-006: real field is isActiveFl (standard naming — this
  // entity is confirmed NOT part of the SECURITY core's permanent
  // isActive/active naming exception, unlike AppRole/AppScreen).
  isActive: boolean;
}

export interface AppUser {
  // F1/SCR-SEC-002: real UserDto.id is BIGINT (number), not string.
  // Widening this is deferred to F2 — it cascades into every id-keyed
  // lookup/route in this module (see F1-HEADER.md ENTITY-SEC-001 #1).
  id: string;
  username: string;
  // F1/SCR-SEC-002 (OQ-SEC-FE-002): no real endpoint exposes an email
  // write path (POST/PUT users). Read-only from the API's perspective;
  // F3 should render this field disabled pending product/backend decision.
  email: string;
  enabled: boolean;
  // F1/SCR-SEC-002: real API sends/expects role NAME strings here, not
  // role IDs — confirmed via GET/PUT /api/users/{userId}/roles. Mock
  // data and Users.tsx (roles.find(item => item.id === roleId)) still
  // treat this as an id-keyed join; rewiring to name-based lookup is F2.
  roles: string[]; // Role IDs (Shell-only, not the real contract — see above)
  // F1/SCR-SEC-002: NOT embedded on the real UserDto at all. It's a
  // separate resource (SecUserProfileDto, ENTITY-SEC-009) fetched by
  // userId via its own endpoints. Removing this field and replacing its
  // reads (Users.tsx search/display name, UserProfileDrawer prefill)
  // with a client-side join is F2 work, not done here.
  profile?: UserProfile;
  // F1/SCR-SEC-002: real DTO field with no prior Shell counterpart —
  // flattened permissions across the user's roles, for future
  // client-side gating. Not required by any confirmed screen today.
  permissions?: string[];
  // F1/SCR-SEC-002: audit fields on the real DTO with no prior Shell
  // counterpart — optional, display-only.
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// F1/SCR-SEC-003: the real shape is PageAssignmentResponse — keyed by
// `pageCode` (business code), not `pageId`, and permission flags are
// `permissions: string[]` (subset of 'CREATE'|'UPDATE'|'DELETE') rather
// than 4 independent booleans. VIEW is auto-granted the instant a page is
// assigned (RULE-SEC-042) and can't be toggled off — the UI's View column
// must render checked+disabled, not a normal checkbox. Rewiring the
// pageId-keyed lookup in Roles.tsx (permissions.find(perm => perm.pageId
// === scr.id)) to this shape is F2 work, not done here.
export interface RolePermission {
  pageId: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface AppRole {
  // F1/SCR-SEC-003: real RoleDto.id is BIGINT (number), not string —
  // widening deferred to F2 (same id-cascade note as AppUser above).
  id: string;
  roleCode: string; // Read-Only after first save
  roleName: string;
  description: string;
  // F1/SCR-SEC-003: real field is `active` (PERMANENT EXCEPTION naming,
  // IS_ACTIVE column) — renaming is a straightforward but wide rename
  // across Roles.tsx (filter/badge/KPI/activate-deactivate), deferred to F2.
  isActive: boolean;
  // F1/SCR-SEC-003: NOT part of the real RoleDto at all — it's a separate
  // resource keyed by roleId (GET/PUT /api/roles/{roleId}/pages). See
  // RolePermission above for the shape correction.
  permissions: RolePermission[];
}

export interface AppPermission {
  id: string;
  name: string; // pattern: PERM_<CODE>_<TYPE>
  // F1/SCR-SEC-004: no real API value or LOV-SEC-001 entry supports
  // 'SYSTEM' — the real meaning ("no associated page") is represented by
  // permissionType/pageId being null, not a literal string. Corrected
  // union: 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | null. Dropping the
  // permTypeOptions 'SYSTEM' entry and the badge branch keyed on it
  // (Permissions.tsx) is deferred to F2.
  permissionType: 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'SYSTEM';
  // F1/SCR-SEC-004: real DTO also carries a redundant pageCode: string|null
  // for the same relation — should become the canonical join key once
  // wired (F2), consistent with the pageCode-keyed Role-Pages-Matrix.
  pageId?: string;
  // F1/SCR-SEC-004: has NO basis on PermissionDto — module is a Page-level
  // field, not a Permission-level one. srs.md confirms the module filter
  // is an INDIRECT filter (POST /api/permissions/search resolves it via
  // the related Page). Keep the filter-bar UI; do not bind `module` as a
  // display column or create/edit form field once real data lands
  // (Permissions.tsx currently does both — F2 to remove).
  module: string;
  // F1/SCR-SEC-004: canonical join key going forward (see pageId comment
  // above) — no prior Shell counterpart.
  pageCode?: string | null;
  // F1/SCR-SEC-004: real DTO field with no prior Shell counterpart —
  // available but unused; not required by the create/edit dialog unless
  // product asks.
  description?: string;
}

export interface AppScreen {
  // F1/SCR-SEC-005: real PageResponse.id/parentId are BIGINT (number),
  // not string — widening deferred to F2 (same id-cascade note as
  // AppUser/AppRole above).
  id: string;
  pageCode: string;
  nameEn: string;
  nameAr: string;
  // F1/SCR-SEC-005: real column is a free VARCHAR(50), not FK-enforced —
  // srs.md confirms a value outside this union would NOT be rejected
  // server-side. This closed union is a reasonable frontend-only
  // narrowing, not a real contract constraint; F3/F4 must not present it
  // as validated.
  module: 'SEC' | 'ORG' | 'FILE' | 'NOTIF' | 'FIN' | 'HR' | 'INV';
  // Carried forward for F4 (see shell-manifest-SECURITY.md "Inconsistency
  // to flag"): real, required, unique, regex-validated server-side, but
  // never read by this app's switch-based navigation. Genuine
  // architecture mismatch, not resolved here.
  route: string;
  icon?: string;
  parentId?: string;
  displayOrder?: number;
  description?: string;
  // F1/SCR-SEC-005: real field is `active` (PERMANENT EXCEPTION naming,
  // same as AppRole.isActive) — wide rename across Pages.tsx
  // (filter/badge/KPI/activate-deactivate), deferred to F2.
  isActive: boolean;
  // F1/SCR-SEC-005: the 4 auto-generated permission-name keys for this
  // page — no prior Shell counterpart. Optional, read-only; useful for F2
  // facades that need a page's own permission names without a second lookup.
  permissionKeys?: object;
  // F1/SCR-SEC-005: audit fields on the real DTO with no prior Shell
  // counterpart — optional, display-only.
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface DataScope {
  // F1/SCR-SEC-007: the real entity has NO id field — the PK is the
  // composite (roleIdFk, branchIdFk) pair, confirmed across all 6
  // endpoints (all keyed by {roleId}/{branchId} path pairs). Removing
  // this and switching React keys/cache keys/mutations to the composite
  // pair is deferred to F2.
  id: string;
  // F1/SCR-SEC-007: real field is roleIdFk, numeric — widening deferred to F2.
  roleId: string;
  // F1/SCR-SEC-007: real field is branchIdFk, numeric — widening deferred to F2.
  branchId: string;
  // F1/SCR-SEC-007: CORRECTED (unambiguous, applied directly here — see
  // F1-HEADER.md ENTITY-SEC-010 #3). The Shell's previous values
  // ('BRANCH' | 'CHILDREN') do not match the real, seeded LOV-SEC-002
  // codes and would fail every save.
  dataAccessLevel: 'BRANCH_ONLY' | 'BRANCH_AND_CHILDREN' | 'ALL';
  // F1/SCR-SEC-007: real field is isActiveFl (standard naming — not part
  // of the SECURITY core's permanent naming exception). Deferred to F2.
  isActive: boolean;
}

// ----------------------------------------------------------------------------
// MODULE 2: ORGANIZATION (ORG)
// ----------------------------------------------------------------------------

export interface LegalEntity {
  id: string;
  legalEntityCode: string; // Auto-generated / Read-Only in Edit
  nameEn: string;
  nameAr: string;
  entityTypeId: 'HEAD_OFFICE' | 'BRANCH_OFFICE' | 'SUBSIDIARY' | 'REP_OFFICE';
  notes?: string;
  isActive: boolean;
  activeBranchesCount?: number;
}

export interface Branch {
  id: string;
  branchCode: string; // Auto-generated / Read-Only in Edit
  nameEn: string;
  nameAr: string;
  legalEntityFk: string; // Ref LegalEntity.id
  branchTypeId: 'MAIN' | 'SUB' | 'OPERATIONS' | 'ADMIN';
  notes?: string;
  isActive: boolean;
}

export interface Region {
  id: string;
  regionCode: string; // Auto-generated / Read-Only in Edit
  nameEn: string;
  nameAr: string;
  legalEntityFk: string; // Ref LegalEntity.id
  regionTypeIdFk: 'CENTRAL' | 'WESTERN' | 'EASTERN' | 'SOUTHERN' | 'NORTHERN';
  notes?: string;
  isActive: boolean;
}

export interface DepartmentNode {
  id: string;
  deptCode: string; // Auto-generated
  nameEn: string;
  nameAr: string;
  branchFk: string; // Ref Branch.id
  parentDepartmentFk?: string | null;
  nodeTypeId: 'SUMMARY' | 'DETAIL'; // Locked post-save
  notes?: string;
  isActive: boolean;
  children?: DepartmentNode[];
}

export interface CostCenterNode {
  id: string;
  costCenterCode: string; // Auto-generated
  nameEn: string;
  nameAr: string;
  branchFk: string; // Ref Branch.id
  parentCostCenterFk?: string | null;
  costCenterTypeId: 'DIRECT' | 'INDIRECT' | 'SHARED';
  nodeTypeId: 'SUMMARY' | 'DETAIL'; // Locked post-save
  notes?: string;
  isActive: boolean;
  children?: CostCenterNode[];
}

export interface ProfitCenter {
  id: string;
  profitCenterCode: string; // Auto-generated
  nameEn: string;
  nameAr: string;
  legalEntityFk: string; // Ref LegalEntity.id
  notes?: string;
  isActive: boolean;
}

export interface LocationSite {
  id: string;
  locationSiteCode: string; // Auto-generated
  nameEn: string;
  nameAr: string;
  branchFk: string; // Ref Branch.id
  siteTypeId: 'OFFICE' | 'WAREHOUSE' | 'FACTORY' | 'SITE' | 'RETAIL';
  notes?: string;
  isActive: boolean;
}

// ----------------------------------------------------------------------------
// MODULE 3: FILE SERVICE (FILE)
// ----------------------------------------------------------------------------

export interface FileAttachment {
  id: string;
  fileName: string;
  fileSize: number; // bytes
  fileCategoryFk: string;
  fileType: string;
  uploadDate: string;
  ownerId: string;
  ownerType: string;
  moduleCode: string;
  downloadUrl?: string;
}

export interface FileCategory {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  moduleCode: string;
}

// ----------------------------------------------------------------------------
// MODULE 4: NOTIFICATION SERVICE (NOTIF)
// ----------------------------------------------------------------------------

export interface NotificationRecord {
  id: string;
  subjectEn: string;
  subjectAr: string;
  bodyEn: string;
  bodyAr: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS' | 'TASK';
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  createdAt: string;
  targetUser: string;
  moduleCode: string;
  actionUrl?: string;
}

export interface NotificationTemplate {
  id: string;
  templateCode: string; // Immutable post-create
  templateNameEn: string;
  templateNameAr: string;
  channelTypeId: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH' | 'INTERNAL';
  moduleCode: 'SEC' | 'ORG' | 'FIN' | 'HR' | 'INV' | 'SYS';
  templateBodyEn: string;
  templateBodyAr: string;
  isActive: boolean;
}

export interface NotificationChannel {
  id: string;
  channelName: string;
  channelCode: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH' | 'INTERNAL';
  isEnabled: boolean;
  configJson: string; // Stringified JSON configuration
}

// ============================================================================
// MOCK DATA INITIALIZATION
// ============================================================================

export const RECENT_AUDIT_LOGS: AuditLogRecord[] = [
  {
    id: 'log-1',
    timestamp: '2026-08-23 20:45',
    user: 'admin',
    action: 'Assigned ROLE_FINANCE_MGR to f.alotaibi',
    module: 'SEC',
    status: 'Success',
  },
  {
    id: 'log-2',
    timestamp: '2026-08-23 19:30',
    user: 'admin',
    action: 'Updated permissions for ROLE_HR_OFFICER',
    module: 'SEC',
    status: 'Success',
  },
  {
    id: 'log-3',
    timestamp: '2026-08-23 18:15',
    user: 'admin',
    action: 'User account created: n.alghamdi',
    module: 'SEC',
    status: 'Success',
  },
];

// --- SECURITY MOCKS ---

export const mockScreens: AppScreen[] = [
  { id: 'SCR-SEC-001', pageCode: 'SCR_SEC_LOGIN', nameEn: 'Authentication Shell', nameAr: 'شاشة تسجيل الدخول', module: 'SEC', route: '/login', icon: 'ti ti-login', isActive: true },
  { id: 'SCR-SEC-002', pageCode: 'SCR_SEC_USERS', nameEn: 'User Management', nameAr: 'إدارة المستخدمين', module: 'SEC', route: '/security/users', icon: 'ti ti-users', isActive: true },
  { id: 'SCR-SEC-003', pageCode: 'SCR_SEC_ROLES', nameEn: 'Role & RBAC Management', nameAr: 'الأدوار والصلاحيات', module: 'SEC', route: '/security/roles', icon: 'ti ti-shield-lock', isActive: true },
  { id: 'SCR-SEC-004', pageCode: 'SCR_SEC_PERMS', nameEn: 'Permission Registry', nameAr: 'سجل الصلاحيات', module: 'SEC', route: '/security/permissions', icon: 'ti ti-key', isActive: true },
  { id: 'SCR-SEC-005', pageCode: 'SCR_SEC_PAGES', nameEn: 'Page Registry', nameAr: 'سجل الشاشات', module: 'SEC', route: '/security/pages', icon: 'ti ti-layout-grid', isActive: true },
  { id: 'SCR-ORG-001', pageCode: 'SCR_ORG_ENTITIES', nameEn: 'Legal Entities', nameAr: 'الكيانات القانونية', module: 'ORG', route: '/organization/legal-entities', icon: 'ti ti-building', isActive: true },
  { id: 'SCR-ORG-002', pageCode: 'SCR_ORG_BRANCHES', nameEn: 'Branches', nameAr: 'الفروع', module: 'ORG', route: '/organization/branches', icon: 'ti ti-git-branch', isActive: true },
  { id: 'SCR-ORG-003', pageCode: 'SCR_ORG_REGIONS', nameEn: 'Regions', nameAr: 'المناطق الجغرافية', module: 'ORG', route: '/organization/regions', icon: 'ti ti-map-pin', isActive: true },
  { id: 'SCR-ORG-004', pageCode: 'SCR_ORG_DEPTS', nameEn: 'Departments', nameAr: 'الهيكل الإداري والأقسام', module: 'ORG', route: '/organization/departments', icon: 'ti ti-sitemap', isActive: true },
  { id: 'SCR-ORG-005', pageCode: 'SCR_ORG_COST_CENTERS', nameEn: 'Cost Centers', nameAr: 'مراكز التكلفة', module: 'ORG', route: '/organization/cost-centers', icon: 'ti ti-calculator', isActive: true },
  { id: 'SCR-ORG-006', pageCode: 'SCR_ORG_PROFIT_CENTERS', nameEn: 'Profit Centers', nameAr: 'مراكز الربحية', module: 'ORG', route: '/organization/profit-centers', icon: 'ti ti-chart-arrows-vertical', isActive: true },
  { id: 'SCR-ORG-007', pageCode: 'SCR_ORG_LOCATIONS', nameEn: 'Location Sites', nameAr: 'المواقع والمستودعات', module: 'ORG', route: '/organization/locations', icon: 'ti ti-building-warehouse', isActive: true },
  { id: 'SCR-NOTIF-001', pageCode: 'SCR_NOTIF_INBOX', nameEn: 'Notification Inbox', nameAr: 'صندوق الإشعارات', module: 'NOTIF', route: '/notifications/inbox', icon: 'ti ti-bell', isActive: true },
  { id: 'SCR-NOTIF-002', pageCode: 'SCR_NOTIF_TEMPLATES', nameEn: 'Notification Templates', nameAr: 'قوالب الإشعارات', module: 'NOTIF', route: '/notifications/templates', icon: 'ti ti-template', isActive: true },
  { id: 'SCR-NOTIF-003', pageCode: 'SCR_NOTIF_CHANNELS', nameEn: 'Channel Configuration', nameAr: 'تهيئة قنوات الإرسال', module: 'NOTIF', route: '/notifications/channels', icon: 'ti ti-adjustments-horizontal', isActive: true },
];

export const mockPermissions: AppPermission[] = [
  { id: 'perm-1', name: 'PERM_SEC_USERS_VIEW', permissionType: 'VIEW', pageId: 'SCR-SEC-002', module: 'SEC' },
  { id: 'perm-2', name: 'PERM_SEC_USERS_CREATE', permissionType: 'CREATE', pageId: 'SCR-SEC-002', module: 'SEC' },
  { id: 'perm-3', name: 'PERM_SEC_USERS_UPDATE', permissionType: 'UPDATE', pageId: 'SCR-SEC-002', module: 'SEC' },
  { id: 'perm-4', name: 'PERM_SEC_USERS_DELETE', permissionType: 'DELETE', pageId: 'SCR-SEC-002', module: 'SEC' },
  { id: 'perm-5', name: 'PERM_SEC_ROLES_VIEW', permissionType: 'VIEW', pageId: 'SCR-SEC-003', module: 'SEC' },
  { id: 'perm-6', name: 'PERM_SEC_ROLES_CREATE', permissionType: 'CREATE', pageId: 'SCR-SEC-003', module: 'SEC' },
  { id: 'perm-7', name: 'PERM_SEC_ROLES_UPDATE', permissionType: 'UPDATE', pageId: 'SCR-SEC-003', module: 'SEC' },
  { id: 'perm-8', name: 'PERM_SEC_ROLES_DELETE', permissionType: 'DELETE', pageId: 'SCR-SEC-003', module: 'SEC' },
  { id: 'perm-9', name: 'PERM_SEC_PERMS_VIEW', permissionType: 'VIEW', pageId: 'SCR-SEC-004', module: 'SEC' },
  { id: 'perm-10', name: 'PERM_SEC_PAGES_VIEW', permissionType: 'VIEW', pageId: 'SCR-SEC-005', module: 'SEC' },
  { id: 'perm-11', name: 'PERM_ORG_ENTITIES_VIEW', permissionType: 'VIEW', pageId: 'SCR-ORG-001', module: 'ORG' },
  { id: 'perm-12', name: 'PERM_ORG_BRANCHES_VIEW', permissionType: 'VIEW', pageId: 'SCR-ORG-002', module: 'ORG' },
];

export const mockRoles: AppRole[] = [
  {
    id: 'role-1',
    roleCode: 'ROLE_SUPER_ADMIN',
    roleName: 'System Administrator',
    description: 'Full system privileges across all security, financial, and organizational modules.',
    isActive: true,
    permissions: [
      { pageId: 'SCR-SEC-001', canView: true, canCreate: true, canUpdate: true, canDelete: true },
      { pageId: 'SCR-SEC-002', canView: true, canCreate: true, canUpdate: true, canDelete: true },
      { pageId: 'SCR-SEC-003', canView: true, canCreate: true, canUpdate: true, canDelete: true },
      { pageId: 'SCR-SEC-004', canView: true, canCreate: true, canUpdate: true, canDelete: true },
      { pageId: 'SCR-SEC-005', canView: true, canCreate: true, canUpdate: true, canDelete: true },
      { pageId: 'SCR-ORG-001', canView: true, canCreate: true, canUpdate: true, canDelete: true },
      { pageId: 'SCR-ORG-002', canView: true, canCreate: true, canUpdate: true, canDelete: true },
      { pageId: 'SCR-ORG-003', canView: true, canCreate: true, canUpdate: true, canDelete: true },
      { pageId: 'SCR-ORG-004', canView: true, canCreate: true, canUpdate: true, canDelete: true },
      { pageId: 'SCR-ORG-005', canView: true, canCreate: true, canUpdate: true, canDelete: true },
      { pageId: 'SCR-ORG-006', canView: true, canCreate: true, canUpdate: true, canDelete: true },
      { pageId: 'SCR-ORG-007', canView: true, canCreate: true, canUpdate: true, canDelete: true },
      { pageId: 'SCR-NOTIF-001', canView: true, canCreate: true, canUpdate: true, canDelete: true },
      { pageId: 'SCR-NOTIF-002', canView: true, canCreate: true, canUpdate: true, canDelete: true },
      { pageId: 'SCR-NOTIF-003', canView: true, canCreate: true, canUpdate: true, canDelete: true },
    ],
  },
  {
    id: 'role-2',
    roleCode: 'ROLE_FINANCE_MGR',
    roleName: 'Finance Manager',
    description: 'Management of Chart of Accounts, General Ledger postings, and financial statements.',
    isActive: true,
    permissions: [
      { pageId: 'SCR-SEC-002', canView: true, canCreate: false, canUpdate: false, canDelete: false },
      { pageId: 'SCR-ORG-001', canView: true, canCreate: false, canUpdate: false, canDelete: false },
      { pageId: 'SCR-ORG-002', canView: true, canCreate: false, canUpdate: false, canDelete: false },
      { pageId: 'SCR-ORG-005', canView: true, canCreate: true, canUpdate: true, canDelete: false },
      { pageId: 'SCR-ORG-006', canView: true, canCreate: true, canUpdate: true, canDelete: false },
      { pageId: 'SCR-NOTIF-001', canView: true, canCreate: true, canUpdate: true, canDelete: false },
    ],
  },
  {
    id: 'role-3',
    roleCode: 'ROLE_HR_OFFICER',
    roleName: 'HR Specialist',
    description: 'Personnel records, organizational unit trees, and job title administration.',
    isActive: true,
    permissions: [
      { pageId: 'SCR-SEC-002', canView: true, canCreate: true, canUpdate: true, canDelete: false },
      { pageId: 'SCR-ORG-004', canView: true, canCreate: true, canUpdate: true, canDelete: false },
      { pageId: 'SCR-NOTIF-001', canView: true, canCreate: true, canUpdate: true, canDelete: false },
    ],
  },
  {
    id: 'role-4',
    roleCode: 'ROLE_AUDITOR',
    roleName: 'Internal Auditor',
    description: 'Read-only access across financial transactions, security logs, and master catalogs.',
    isActive: true,
    permissions: [
      { pageId: 'SCR-SEC-002', canView: true, canCreate: false, canUpdate: false, canDelete: false },
      { pageId: 'SCR-SEC-003', canView: true, canCreate: false, canUpdate: false, canDelete: false },
      { pageId: 'SCR-SEC-004', canView: true, canCreate: false, canUpdate: false, canDelete: false },
      { pageId: 'SCR-SEC-005', canView: true, canCreate: false, canUpdate: false, canDelete: false },
      { pageId: 'SCR-ORG-001', canView: true, canCreate: false, canUpdate: false, canDelete: false },
      { pageId: 'SCR-ORG-002', canView: true, canCreate: false, canUpdate: false, canDelete: false },
      { pageId: 'SCR-NOTIF-001', canView: true, canCreate: false, canUpdate: false, canDelete: false },
    ],
  },
];

export const mockUsers: AppUser[] = [
  {
    id: 'usr-1',
    username: 'admin',
    email: 'admin@avelynq.com',
    enabled: true,
    roles: ['role-1'],
    profile: {
      fullNameAr: 'هشام الأحمدي',
      fullNameEn: 'Hesham Al-Ahmadi',
      branchId: 'br-1',
      preferredLang: 'ar',
      employeeId: 'EMP-001',
      isActive: true,
    },
  },
  {
    id: 'usr-2',
    username: 'f.alotaibi',
    email: 'f.alotaibi@avelynq.com',
    enabled: true,
    roles: ['role-2'],
    profile: {
      fullNameAr: 'فيصل العتيبي',
      fullNameEn: 'Faisal Al-Otaibi',
      branchId: 'br-1',
      preferredLang: 'en',
      employeeId: 'EMP-014',
      isActive: true,
    },
  },
  {
    id: 'usr-3',
    username: 'n.alghamdi',
    email: 'n.alghamdi@avelynq.com',
    enabled: true,
    roles: ['role-3'],
    profile: {
      fullNameAr: 'نورة الغامدي',
      fullNameEn: 'Noura Al-Ghamdi',
      branchId: 'br-2',
      preferredLang: 'ar',
      employeeId: 'EMP-028',
      isActive: true,
    },
  },
  {
    id: 'usr-4',
    username: 's.alshehri',
    email: 's.alshehri@avelynq.com',
    enabled: false,
    roles: ['role-4'],
    profile: {
      fullNameAr: 'سعد الشهري',
      fullNameEn: 'Saad Al-Shehri',
      branchId: 'br-3',
      preferredLang: 'ar',
      employeeId: 'EMP-045',
      isActive: false,
    },
  },
];

export const mockDataScopes: DataScope[] = [
  { id: 'ds-1', roleId: 'role-1', branchId: 'br-1', dataAccessLevel: 'ALL', isActive: true },
  { id: 'ds-2', roleId: 'role-2', branchId: 'br-1', dataAccessLevel: 'ALL', isActive: true },
  { id: 'ds-3', roleId: 'role-3', branchId: 'br-2', dataAccessLevel: 'BRANCH_ONLY', isActive: true },
  { id: 'ds-4', roleId: 'role-4', branchId: 'br-3', dataAccessLevel: 'ALL', isActive: true },
];

// --- ORGANIZATION MOCKS ---

export const mockLegalEntities: LegalEntity[] = [
  {
    id: 'le-1',
    legalEntityCode: 'LE-001',
    nameEn: 'Avelynq Global Holdings Ltd.',
    nameAr: 'شركة أفيلينك القابضة العالمية',
    entityTypeId: 'HEAD_OFFICE',
    notes: 'Primary corporate entity holding enterprise group assets.',
    isActive: true,
    activeBranchesCount: 3,
  },
  {
    id: 'le-2',
    legalEntityCode: 'LE-002',
    nameEn: 'Avelynq Industrial & Logistics Co.',
    nameAr: 'شركة أفيلينك للصناعة والخدمات اللوجستية',
    entityTypeId: 'SUBSIDIARY',
    notes: 'Operational subsidiary handling supply chain and distribution.',
    isActive: true,
    activeBranchesCount: 2,
  },
  {
    id: 'le-3',
    legalEntityCode: 'LE-003',
    nameEn: 'Avelynq Digital Solutions Agency',
    nameAr: 'وكالة أفيلينك للحلول الرقمية',
    entityTypeId: 'REP_OFFICE',
    notes: 'Representative office for MENA digital transformation projects.',
    isActive: false,
    activeBranchesCount: 0,
  },
];

export const mockBranches: Branch[] = [
  {
    id: 'br-1',
    branchCode: 'BR-RUH-01',
    nameEn: 'Riyadh Main Headquarters',
    nameAr: 'المقر الرئيسي - الرياض',
    legalEntityFk: 'le-1',
    branchTypeId: 'MAIN',
    notes: 'King Fahd Road, Corporate Towers.',
    isActive: true,
  },
  {
    id: 'br-2',
    branchCode: 'BR-JED-02',
    nameEn: 'Jeddah Regional Office',
    nameAr: 'فرع جدة الإقليمي',
    legalEntityFk: 'le-1',
    branchTypeId: 'SUB',
    notes: 'Al-Andalus District business center.',
    isActive: true,
  },
  {
    id: 'br-3',
    branchCode: 'BR-DMM-03',
    nameEn: 'Dammam Operations Hub',
    nameAr: 'مركز عمليات الدمام',
    legalEntityFk: 'le-2',
    branchTypeId: 'OPERATIONS',
    notes: 'Eastern Province Logistics park.',
    isActive: true,
  },
  {
    id: 'br-4',
    branchCode: 'BR-MED-04',
    nameEn: 'Madinah Logistics Center',
    nameAr: 'مركز لوجستيات المدينة المنورة',
    legalEntityFk: 'le-2',
    branchTypeId: 'ADMIN',
    notes: 'Secondary dispatch station.',
    isActive: false,
  },
];

export const mockRegions: Region[] = [
  {
    id: 'reg-1',
    regionCode: 'REG-CENTRAL',
    nameEn: 'Central Region (Riyadh & Qassim)',
    nameAr: 'المنطقة الوسطى (الرياض والقصيم)',
    legalEntityFk: 'le-1',
    regionTypeIdFk: 'CENTRAL',
    notes: 'Primary capital economic corridor.',
    isActive: true,
  },
  {
    id: 'reg-2',
    regionCode: 'REG-WESTERN',
    nameEn: 'Western Region (Makkah & Madinah)',
    nameAr: 'المنطقة الغربية (مكة المكرمة والمدينة)',
    legalEntityFk: 'le-1',
    regionTypeIdFk: 'WESTERN',
    notes: 'Coastal and commercial trade zone.',
    isActive: true,
  },
  {
    id: 'reg-3',
    regionCode: 'REG-EASTERN',
    nameEn: 'Eastern Region (Dammam & Khobar)',
    nameAr: 'المنطقة الشرقية (الدمام والخبر)',
    legalEntityFk: 'le-2',
    regionTypeIdFk: 'EASTERN',
    notes: 'Industrial and energy hub.',
    isActive: true,
  },
];

export const mockDepartments: DepartmentNode[] = [
  {
    id: 'dept-1',
    deptCode: 'DEP-EXEC',
    nameEn: 'Executive Management',
    nameAr: 'الإدارة التنفيذية العليا',
    branchFk: 'br-1',
    parentDepartmentFk: null,
    nodeTypeId: 'SUMMARY',
    notes: 'Executive board and corporate leadership.',
    isActive: true,
    children: [
      {
        id: 'dept-2',
        deptCode: 'DEP-FIN',
        nameEn: 'Finance & Accounts',
        nameAr: 'الإدارة المالية والحسابات',
        branchFk: 'br-1',
        parentDepartmentFk: 'dept-1',
        nodeTypeId: 'SUMMARY',
        isActive: true,
        children: [
          {
            id: 'dept-3',
            deptCode: 'DEP-GL',
            nameEn: 'General Ledger & Reporting',
            nameAr: 'الأستاذ العام والتقارير المالية',
            branchFk: 'br-1',
            parentDepartmentFk: 'dept-2',
            nodeTypeId: 'DETAIL',
            isActive: true,
          },
          {
            id: 'dept-4',
            deptCode: 'DEP-PAY',
            nameEn: 'Treasury & Disbursements',
            nameAr: 'الخزينة والمدفوعات',
            branchFk: 'br-1',
            parentDepartmentFk: 'dept-2',
            nodeTypeId: 'DETAIL',
            isActive: true,
          },
        ],
      },
      {
        id: 'dept-5',
        deptCode: 'DEP-TECH',
        nameEn: 'Information Technology',
        nameAr: 'تقنية المعلومات والتحول الرقمي',
        branchFk: 'br-1',
        parentDepartmentFk: 'dept-1',
        nodeTypeId: 'SUMMARY',
        isActive: true,
        children: [
          {
            id: 'dept-6',
            deptCode: 'DEP-DEV',
            nameEn: 'Software Engineering',
            nameAr: 'هندسة البرمجيات',
            branchFk: 'br-1',
            parentDepartmentFk: 'dept-5',
            nodeTypeId: 'DETAIL',
            isActive: true,
          },
          {
            id: 'dept-7',
            deptCode: 'DEP-SEC',
            nameEn: 'Cybersecurity & Infrastructure',
            nameAr: 'الأمن السيبراني والبنية التحتية',
            branchFk: 'br-1',
            parentDepartmentFk: 'dept-5',
            nodeTypeId: 'DETAIL',
            isActive: true,
          },
        ],
      },
    ],
  },
  {
    id: 'dept-8',
    deptCode: 'DEP-OPS-JED',
    nameEn: 'Jeddah Field Operations',
    nameAr: 'عمليات فرع جدة الميدانية',
    branchFk: 'br-2',
    parentDepartmentFk: null,
    nodeTypeId: 'SUMMARY',
    isActive: true,
    children: [
      {
        id: 'dept-9',
        deptCode: 'DEP-LOG-JED',
        nameEn: 'Port Logistics & Customs',
        nameAr: 'لوجستيات الميناء والتخليص الجمركي',
        branchFk: 'br-2',
        parentDepartmentFk: 'dept-8',
        nodeTypeId: 'DETAIL',
        isActive: true,
      },
    ],
  },
];

export const mockCostCenters: CostCenterNode[] = [
  {
    id: 'cc-1',
    costCenterCode: 'CC-CORP-100',
    nameEn: 'Corporate Shared Overhead',
    nameAr: 'المصاريف المشتركة للمجموعة',
    branchFk: 'br-1',
    parentCostCenterFk: null,
    costCenterTypeId: 'SHARED',
    nodeTypeId: 'SUMMARY',
    isActive: true,
    children: [
      {
        id: 'cc-2',
        costCenterCode: 'CC-IT-110',
        nameEn: 'Enterprise Cloud & Systems',
        nameAr: 'السحابة والنظم المؤسسية',
        branchFk: 'br-1',
        parentCostCenterFk: 'cc-1',
        costCenterTypeId: 'INDIRECT',
        nodeTypeId: 'DETAIL',
        isActive: true,
      },
      {
        id: 'cc-3',
        costCenterCode: 'CC-FAC-120',
        nameEn: 'Headquarters Facilities & Utilities',
        nameAr: 'المرافق والخدمات العامة للمقر',
        branchFk: 'br-1',
        parentCostCenterFk: 'cc-1',
        costCenterTypeId: 'INDIRECT',
        nodeTypeId: 'DETAIL',
        isActive: true,
      },
    ],
  },
  {
    id: 'cc-4',
    costCenterCode: 'CC-PROD-200',
    nameEn: 'Industrial Production Cost Center',
    nameAr: 'مركز تكلفة خطوط الإنتاج',
    branchFk: 'br-3',
    parentCostCenterFk: null,
    costCenterTypeId: 'DIRECT',
    nodeTypeId: 'SUMMARY',
    isActive: true,
    children: [
      {
        id: 'cc-5',
        costCenterCode: 'CC-MACH-210',
        nameEn: 'Assembly Line Automation',
        nameAr: 'أتمتة خطوط التجميع',
        branchFk: 'br-3',
        parentCostCenterFk: 'cc-4',
        costCenterTypeId: 'DIRECT',
        nodeTypeId: 'DETAIL',
        isActive: true,
      },
    ],
  },
];

export const mockProfitCenters: ProfitCenter[] = [
  {
    id: 'pc-1',
    profitCenterCode: 'PC-SAAS-01',
    nameEn: 'Enterprise SaaS Subscriptions',
    nameAr: 'اشتراكات البرمجيات السحابية المؤسسية',
    legalEntityFk: 'le-1',
    notes: 'High margin recurring enterprise licenses.',
    isActive: true,
  },
  {
    id: 'pc-2',
    profitCenterCode: 'PC-CONS-02',
    nameEn: 'Digital Advisory & Implementation',
    nameAr: 'الخدمات الاستشارية وتطبيق الأنظمة',
    legalEntityFk: 'le-1',
    notes: 'Professional consulting project revenue.',
    isActive: true,
  },
  {
    id: 'pc-3',
    profitCenterCode: 'PC-LOG-03',
    nameEn: 'Cold-Chain Freight Services',
    nameAr: 'خدمات النقل المبرد واللوجستيات',
    legalEntityFk: 'le-2',
    notes: 'Distribution logistics contracts.',
    isActive: true,
  },
  {
    id: 'pc-4',
    profitCenterCode: 'PC-RETL-04',
    nameEn: 'Retail Hardware POS Solutions',
    nameAr: 'حلول أجهزة نقاط البيع بالتجزئة',
    legalEntityFk: 'le-2',
    notes: 'Hardware terminal sales and maintenance.',
    isActive: false,
  },
];

export const mockLocationSites: LocationSite[] = [
  {
    id: 'loc-1',
    locationSiteCode: 'LOC-RUH-TWR',
    nameEn: 'Al-Faisaliyah Tower Office 44A',
    nameAr: 'برج الفيصلية - مكتب 44أ',
    branchFk: 'br-1',
    siteTypeId: 'OFFICE',
    notes: 'Headquarters executive floor.',
    isActive: true,
  },
  {
    id: 'loc-2',
    locationSiteCode: 'LOC-DMM-WH01',
    nameEn: 'Dammam Industrial Mega-Warehouse 1',
    nameAr: 'مستودع الدمام الصناعي الرئيسي 1',
    branchFk: 'br-3',
    siteTypeId: 'WAREHOUSE',
    notes: 'Temperature-controlled storage (12,000 sqm).',
    isActive: true,
  },
  {
    id: 'loc-3',
    locationSiteCode: 'LOC-JED-HUB',
    nameEn: 'Islamic Port Distribution Yard',
    nameAr: 'ساحة توزيع ميناء جدة الإسلامي',
    branchFk: 'br-2',
    siteTypeId: 'SITE',
    notes: 'Container sorting and clearance site.',
    isActive: true,
  },
  {
    id: 'loc-4',
    locationSiteCode: 'LOC-MED-RT01',
    nameEn: 'Sultana Retail Showroom',
    nameAr: 'معرض شارع سلطانة للتجزئة',
    branchFk: 'br-4',
    siteTypeId: 'RETAIL',
    notes: 'Customer demo showroom.',
    isActive: false,
  },
];

// --- FILE SERVICE MOCKS ---

export const mockFileCategories: FileCategory[] = [
  { id: 'fc-1', code: 'DOC_CONTRACT', nameEn: 'Legal & Commercial Contracts', nameAr: 'العقود القانونية والتجارية', moduleCode: 'SEC' },
  { id: 'fc-2', code: 'DOC_IDENTITY', nameEn: 'Identity & Registration Papers', nameAr: 'وثائق الهوية والتراخيص', moduleCode: 'ORG' },
  { id: 'fc-3', code: 'DOC_FIN_RECEIPT', nameEn: 'Financial Invoices & Receipts', nameAr: 'الفواتير والإيصالات المالية', moduleCode: 'FIN' },
  { id: 'fc-4', code: 'DOC_POLICY', nameEn: 'System Governance & SOPs', nameAr: 'سياسات الحوكمة ودليل الإجراءات', moduleCode: 'SYS' },
];

export const mockFileAttachments: FileAttachment[] = [
  {
    id: 'file-1',
    fileName: 'commercial_registration_2026.pdf',
    fileSize: 2450000,
    fileCategoryFk: 'fc-2',
    fileType: 'application/pdf',
    uploadDate: '2026-08-20 14:32',
    ownerId: 'le-1',
    ownerType: 'LEGAL_ENTITY',
    moduleCode: 'ORG',
    downloadUrl: '#',
  },
  {
    id: 'file-2',
    fileName: 'riyadh_hq_lease_agreement.pdf',
    fileSize: 4120000,
    fileCategoryFk: 'fc-1',
    fileType: 'application/pdf',
    uploadDate: '2026-08-18 11:15',
    ownerId: 'br-1',
    ownerType: 'BRANCH',
    moduleCode: 'ORG',
    downloadUrl: '#',
  },
  {
    id: 'file-3',
    fileName: 'security_policy_v2.docx',
    fileSize: 1180000,
    fileCategoryFk: 'fc-4',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadDate: '2026-08-22 09:40',
    ownerId: 'role-1',
    ownerType: 'ROLE',
    moduleCode: 'SEC',
    downloadUrl: '#',
  },
];

// --- NOTIFICATION SERVICE MOCKS ---

export const mockNotifications: NotificationRecord[] = [
  {
    id: 'notif-1',
    subjectEn: 'Security Alert: New Role Permission Matrix Updated',
    subjectAr: 'تنبيه أمني: تم تحديث مصفوفة صلاحيات الأدوار',
    bodyEn: 'System Administrator updated permissions for ROLE_FINANCE_MGR across 3 modules.',
    bodyAr: 'قام مسؤول النظام بتحديث صلاحيات دور مدير المالية عبر 3 وحدات.',
    type: 'WARNING',
    status: 'UNREAD',
    createdAt: '10 mins ago',
    targetUser: 'admin',
    moduleCode: 'SEC',
  },
  {
    id: 'notif-2',
    subjectEn: 'Branch Activated: Madinah Logistics Center',
    subjectAr: 'تم تفعيل فرع: مركز لوجستيات المدينة المنورة',
    bodyEn: 'Branch BR-MED-04 was successfully configured and linked to Avelynq Industrial.',
    bodyAr: 'تمت تهيئة الفرع BR-MED-04 بنجاح وربطه بشركة أفيلينك للصناعة.',
    type: 'SUCCESS',
    status: 'UNREAD',
    createdAt: '1 hour ago',
    targetUser: 'admin',
    moduleCode: 'ORG',
  },
  {
    id: 'notif-3',
    subjectEn: 'Task Assignment: Annual Department Budget Review',
    subjectAr: 'مهمة جديدة: مراجعة الميزانية السنوية للأقسام',
    bodyEn: 'Please review and submit cost-center allocation estimates for Q4 2026.',
    bodyAr: 'يرجى مراجعة واعتماد تقديرات مخصصات مراكز التكلفة للربع الرابع 2026.',
    type: 'TASK',
    status: 'UNREAD',
    createdAt: '3 hours ago',
    targetUser: 'admin',
    moduleCode: 'FIN',
  },
  {
    id: 'notif-4',
    subjectEn: 'System Backup Completed Successfully',
    subjectAr: 'اكتملت عملية النسخ الاحتياطي للنظام بنجاح',
    bodyEn: 'Automated snapshot was securely encrypted and archived to primary cloud vault.',
    bodyAr: 'تم تشفير وأرشفة النسخة الاحتياطية التلقائية إلى الخزنة السحابية الرئيسية.',
    type: 'INFO',
    status: 'READ',
    createdAt: 'Yesterday',
    targetUser: 'admin',
    moduleCode: 'SYS',
  },
];

export const mockNotificationTemplates: NotificationTemplate[] = [
  {
    id: 'tmpl-1',
    templateCode: 'TMPL_AUTH_WELCOME',
    templateNameEn: 'User Welcome & Onboarding Activation',
    templateNameAr: 'رسالة الترحيب وتفعيل الحساب للمستخدم الجديد',
    channelTypeId: 'EMAIL',
    moduleCode: 'SEC',
    templateBodyEn: 'Hello {{username}},\n\nWelcome to Avelynq ERP! Your account has been provisioned under {{branchName}}. Click the activation link below to set your password:\n{{activationLink}}\n\nRegards,\nAvelynq Security Team',
    templateBodyAr: 'مرحباً {{username}}،\n\nأهلاً بك في نظام أفيلينك لتخطيط الموارد المؤسسية! تم إنشاء حسابك في فرع {{branchName}}. اضغط على رابط التفعيل أدناه لتعيين كلمة المرور:\n{{activationLink}}\n\nمع التحية،\nفريق الأمن والحماية',
    isActive: true,
  },
  {
    id: 'tmpl-2',
    templateCode: 'TMPL_SEC_PASSWORD_RESET',
    templateNameEn: 'Password Reset OTP Verification',
    templateNameAr: 'رمز التحقق لإعادة تعيين كلمة المرور',
    channelTypeId: 'SMS',
    moduleCode: 'SEC',
    templateBodyEn: 'Your Avelynq OTP is {{otpCode}}. Valid for 10 minutes. Do not share this code.',
    templateBodyAr: 'رمز التحقق الخاص بك في أفيلينك هو: {{otpCode}}. صالح لمدة 10 دقائق. يرجى عدم مشاركته.',
    isActive: true,
  },
  {
    id: 'tmpl-3',
    templateCode: 'TMPL_ORG_CASCADE_DEACTIVATE',
    templateNameEn: 'Organizational Unit Deactivation Alert',
    templateNameAr: 'إشعار إيقاف أو تعطيل وحدة تنظيمية',
    channelTypeId: 'INTERNAL',
    moduleCode: 'ORG',
    templateBodyEn: 'Warning: Unit {{unitCode}} ({{unitName}}) has been deactivated by {{adminName}}.',
    templateBodyAr: 'تنبيه: تم تعطيل الوحدة التنظيمية {{unitCode}} ({{unitName}}) بواسطة {{adminName}}.',
    isActive: true,
  },
  {
    id: 'tmpl-4',
    templateCode: 'TMPL_CRITICAL_SECURITY_ALERT',
    templateNameEn: 'Suspicious Login Attempt Alert',
    templateNameAr: 'تنبيه محاولة تسجيل دخول مشبوهة',
    channelTypeId: 'WHATSAPP',
    moduleCode: 'SEC',
    templateBodyEn: 'Security Notice: Unusual login from IP {{ipAddress}} for user {{username}}.',
    templateBodyAr: 'إشعار أمني: محاولة تسجيل دخول غير معتادة من العنوان {{ipAddress}} للمستخدم {{username}}.',
    isActive: true,
  },
];

export const mockNotificationChannels: NotificationChannel[] = [
  {
    id: 'chan-1',
    channelName: 'Corporate Email Gateway (SMTP / SES)',
    channelCode: 'EMAIL',
    isEnabled: true,
    configJson: JSON.stringify(
      {
        host: 'smtp.avelynq.cloud',
        port: 587,
        secure: true,
        senderName: 'AVELYNQ Notifications',
        senderEmail: 'notifications@avelynq.com',
        maxRetries: 3,
        rateLimitPerMin: 600,
      },
      null,
      2
    ),
  },
  {
    id: 'chan-2',
    channelName: 'Telecom SMS Provider (Unifonic / Twilio)',
    channelCode: 'SMS',
    isEnabled: true,
    configJson: JSON.stringify(
      {
        provider: 'Unifonic Gateway',
        senderId: 'AVELYNQ',
        apiEndpoint: 'https://api.unifonic.com/v1/messages',
        allowUnicode: true,
        priorityRoute: true,
      },
      null,
      2
    ),
  },
  {
    id: 'chan-3',
    channelName: 'WhatsApp Business Cloud API',
    channelCode: 'WHATSAPP',
    isEnabled: true,
    configJson: JSON.stringify(
      {
        wabaId: 'WABA-99882211',
        phoneNumberId: 'PN-445566',
        webhookVerifyToken: 'avl_wa_live_sec_2026',
        languageFallback: 'ar',
      },
      null,
      2
    ),
  },
  {
    id: 'chan-4',
    channelName: 'Web Push & Mobile APNs / FCM',
    channelCode: 'PUSH',
    isEnabled: true,
    configJson: JSON.stringify(
      {
        firebaseProjectId: 'avelynq-erp-prod',
        vapidPublicKey: 'BEl62iUYgUivxIkv69yViEuiBIa-T9-J07D4FzW_2026',
        badgeIcon: '/assets/logo-push.png',
        soundEnabled: true,
      },
      null,
      2
    ),
  },
  {
    id: 'chan-5',
    channelName: 'In-App Realtime Websocket Broadcast',
    channelCode: 'INTERNAL',
    isEnabled: true,
    configJson: JSON.stringify(
      {
        socketUrl: 'wss://realtime.avelynq.cloud/ws/v1',
        heartbeatIntervalMs: 15000,
        reconnectAttempts: 5,
        persistQueue: true,
      },
      null,
      2
    ),
  },
];
