---
name: react-dashboard-architecture
description: >-
  Architectural blueprint, standards, and patterns for building scalable, module-driven and feature-driven React 19 dashboards and enterprise web apps. Use this skill when scaffolding modules and features, structuring governance-aligned domain modules (SECURITY, ORG, MASTERDATA), creating UI components, structuring API client layers with TanStack Query and silent token refresh, implementing Zustand stores, configuring React Router v7 guards, handling React Hook Form with Zod validation, building TanStack Tables, or supporting bilingual LTR/RTL and dark mode theming.
---

# React Dashboard Architecture & Development Guide

This skill provides an enterprise architectural blueprint for building scalable, module-driven and feature-driven React 19 web applications and enterprise dashboards.

---

## 1. Core Architecture Principles

1. **Modular Enterprise Domain Layer (`src/modules/<module-name>/`)**:
   - High-level business domains are segregated into cohesive **Modules** aligned directly with governance specifications (e.g., `security`, `org`, `masterdata`, `shared`).
   - Each module acts as an autonomous bounded context that encapsulates related domain features, module-wide layout/drawers, module-scoped routing, and shared module types.
2. **Feature-Driven Architecture (`src/modules/<module>/features/<feature>/`)**:
   - Business functionality within a module is structured into self-contained feature slices.
   - Each feature encapsulates its own API endpoints, TanStack Query keys/hooks, domain components, pages, local/Zustand state, and validation schemas.
3. **Strict Boundary & Encapsulation Rules**:
   - **Internal imports**: Features within a module may import from their sibling feature public barrels or shared module resources.
   - **Cross-module imports**: Communication across different modules MUST strictly import from the module's public barrel (`src/modules/<module>/index.ts`). Deep-linking into internal feature files of other modules is strictly prohibited.
4. **Layered Design System Primitives (`src/components/ui/`)**:
   - Reusable, un-opinionated visual UI primitives (Buttons, Inputs, Modals, Tables, Steppers, Drawers).
   - Styled with Tailwind CSS v4 and merged via `cn(...)` (`clsx` + `tailwind-merge`).
5. **Segregated State Management**:
   - **Server Cache & Async Data**: TanStack Query (`@tanstack/react-query`) with structured query key factories.
   - **Global Client/UI State**: Zustand (`zustand`) for session (`useAuthStore`) and UI preferences (`useUIStore`).
   - **Local State**: `useState` / `useReducer` inside components for transient UI interactions.
6. **Centralized API Client with Silent Token Refresh**:
   - Centralized `apiClient<T>` with automated `Authorization: Bearer` header injection, 401 interception, failed request queueing, and silent token refreshing.
7. **Bilingual & RTL-First**:
   - Native bidirectional support (English LTR / Arabic RTL) with dynamic font switching (`Cairo` / `Inter`), reversed icons/chevrons, and directional layouts.
8. **Strict Zero-Mock Data Policy**:
   - Every feature, table, form, drawer, and action must connect directly to the real backend REST API (`/api/...`). Dummy local arrays, fake in-memory state mutations, and disconnected demo buttons are strictly prohibited (see `zero-mock-api-policy` skill).

---

## 2. Directory Layout Standard

```
src/
├── components/                 # Reusable, domain-agnostic UI primitives
│   └── ui/                     # Standalone UI components (Buttons, Inputs, Tables, Drawers, etc.)
├── modules/                    # Enterprise Module Layer (governance-aligned domains)
│   │
│   ├── security/               # 🔐 SECURITY Module (governance/modules/SECURITY)
│   │   ├── components/         # Module-wide shared components (e.g., DataScopeDrawer, UserProfileDrawer)
│   │   ├── features/           # Security domain features
│   │   │   ├── auth/           # Login, signup, password reset, token refresh
│   │   │   ├── users/          # User management, user activation, role assignment
│   │   │   ├── roles/          # Role management, role permission matrix, copy permissions
│   │   │   ├── permissions/    # Permission registry & CRUD
│   │   │   ├── pageRegistry/   # System page catalog & route registry
│   │   │   ├── roleDataScope/  # Branch data access scopes per role
│   │   │   └── userProfiles/   # User profile extension & branch assignment
│   │   ├── routes.tsx          # Security module routes & guards
│   │   ├── types.ts            # Security module-wide types & DTOs
│   │   └── index.ts            # Security public API barrel export
│   │
│   ├── org/                    # 🏢 ORG Module (governance/modules/ORG)
│   │   ├── components/         # Module-wide shared components (e.g., OrgTreePanel, BranchSelector)
│   │   ├── features/           # Organization domain features
│   │   │   ├── legalEntities/  # Legal entity CRUD & deactivation cascades
│   │   │   ├── regions/        # Region management
│   │   │   ├── branches/       # Branch hierarchy & operational units
│   │   │   ├── departments/    # Department tree & department hierarchy
│   │   │   ├── costCenters/    # Cost center hierarchy & branch association
│   │   │   ├── profitCenters/  # Profit center management
│   │   │   └── locationSites/  # Physical site & location management
│   │   ├── routes.tsx          # Org module routes & navigation
│   │   ├── types.ts            # Org module-wide types & DTOs
│   │   └── index.ts            # Org public API barrel export
│   │
│   ├── masterdata/             # 📋 MASTERDATA Module (governance/modules/MASTERDATA)
│   │   ├── components/         # Module-wide lookup components & selector dialogs
│   │   ├── features/           # Master data features
│   │   │   └── masterLookups/  # Master lookups management & consumer dropdown hooks
│   │   ├── routes.tsx          # Masterdata module routes
│   │   ├── types.ts            # Masterdata types & DTOs
│   │   └── index.ts            # Masterdata public API barrel export
│   │
│   └── shared/                 # 📦 Cross-Cutting / System Module
│       ├── features/
│       │   ├── dashboard/      # Executive KPIs, analytics summary
│       │   ├── notifications/  # System notifications & alerts
│       │   ├── attachments/    # Document & file attachment manager
│       │   └── unauthorized/   # 403 Forbidden & Access Denied pages
│       ├── routes.tsx          # Shared & fallback routes
│       ├── types.ts            # Common shared feature types
│       └── index.ts            # Shared public API barrel export
│
├── lib/                        # Cross-cutting infrastructure & utilities
│   ├── api.ts                  # Centralized apiClient with token refresh queue & ApiError
│   ├── errors/                 # Error mappings & API error envelope normalization
│   ├── translations.ts         # i18n dictionaries (en / ar)
│   ├── uiStore.ts              # Global UI preferences (theme, lang, dir)
│   └── utils.ts                # Utility functions (e.g., cn helper)
├── App.tsx                     # Main layout shell or root protected view
├── index.css                   # Tailwind CSS v4 imports, @theme, custom utilities
├── main.tsx                    # App entry point (QueryClientProvider, RouterProvider)
├── routes.tsx                  # React Router v7 root configuration aggregating module routes
└── types.ts                    # Global TypeScript contracts
```

---

## 3. Governance Module Mapping Reference

Each module in `src/modules/` directly corresponds to governance module specifications in `governance/modules/`:

| Module Directory | Governance Module | Domain Description | Features |
|---|---|---|---|
| `src/modules/security/` | `SECURITY` (`1-security`) | Authentication, IAM, RBAC, Data Scopes, Navigation Registry | `auth`, `users`, `roles`, `permissions`, `pageRegistry`, `roleDataScope`, `userProfiles` |
| `src/modules/org/` | `ORG` | Organizational Structure, Hierarchy Trees, Business Units | `legalEntities`, `regions`, `branches`, `departments`, `costCenters`, `profitCenters`, `locationSites` |
| `src/modules/masterdata/` | `MASTERDATA` (`2-masterdata`) | Reference Data, Standard Lookup Codes, Data Categories | `masterLookups` |
| `src/modules/shared/` | System / Common | Shared widgets, executive dashboard, notifications, attachments | `dashboard`, `notifications`, `attachments`, `unauthorized` |

---

## 4. Anatomy of a Feature Slice

Every feature slice within a module (`src/modules/<module>/features/<feature>/`) follows an identical internal structure:

```
src/modules/<module>/features/<feature>/
├── api/                        # Pure API fetchers, query key factory & TanStack Query hooks
│   ├── <feature>Api.ts         # REST endpoint callers using apiClient<T>
│   ├── <feature>Keys.ts        # Structured Query Key factory
│   ├── use<Feature>Queries.ts  # TanStack useQuery custom hooks
│   ├── use<Feature>Mutations.ts# TanStack useMutation custom hooks
│   └── index.ts                # Barrel export for API layer
├── components/                 # Feature-specific presentational & container components
│   ├── <Feature>Table.tsx
│   ├── <Feature>FormDrawer.tsx
│   ├── <Feature>FilterBar.tsx
│   └── index.ts
├── pages/                      # Routable page components
│   ├── <Feature>Page.tsx
│   └── index.ts
├── store/                      # Optional: Feature-scoped Zustand store (if complex local state)
│   └── <feature>Store.ts
├── types.ts                    # Feature-specific TypeScript interfaces & Zod schemas
└── index.ts                    # Clean public barrel export for the feature
```

---

## 5. End-to-End Feature Development Workflow

When implementing a feature (e.g. `users` in `security`, or `branches` in `org`):

### Step 1: Define TypeScript Types & Schemas (`types.ts`)
```ts
// src/modules/security/features/users/types.ts
import { z } from 'zod';

export interface User {
  id: string;
  username: string;
  email: string;
  fullNameEn: string;
  fullNameAr: string;
  roles: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  assignedBranchId?: string;
  createdAt: string;
}

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  fullNameEn: z.string().min(1, 'English name is required'),
  fullNameAr: z.string().min(1, 'Arabic name is required'),
  roles: z.array(z.string()).min(1, 'At least one role must be selected'),
  assignedBranchId: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

### Step 2: Query Keys Factory & API Endpoints (`api/`)
```ts
// src/modules/security/features/users/api/userKeys.ts
export const userKeys = {
  all: ['security', 'users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// src/modules/security/features/users/api/usersApi.ts
import { apiClient } from '@/lib/api';
import { User, CreateUserInput } from '../types';

export const usersApi = {
  getUsers: (filters?: Record<string, unknown>) =>
    apiClient<User[]>('/api/users', { method: 'GET' }),
  
  getUserById: (id: string) =>
    apiClient<User>(`/api/users/${id}`, { method: 'GET' }),
  
  createUser: (data: CreateUserInput) =>
    apiClient<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  deleteUser: (id: string) =>
    apiClient<{ success: boolean }>(`/api/users/${id}`, { method: 'DELETE' }),
};
```

### Step 3: Implement TanStack Query Custom Hooks (`api/`)
```ts
// src/modules/security/features/users/api/useUsersQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from './usersApi';
import { userKeys } from './userKeys';
import { CreateUserInput } from '../types';

export function useUsers(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => usersApi.getUsers(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getUserById(id),
    enabled: Boolean(id),
  });
}

export function useUserMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateUserInput) => usersApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });

  return { createMutation, deleteMutation };
}
```

### Step 4: Build Page Components & Feature Barrel (`pages/` & `index.ts`)
```tsx
// src/modules/security/features/users/pages/UsersPage.tsx
import React, { useState } from 'react';
import { useUsers, useUserMutations } from '../api';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { UserProfileDrawer } from '../../../components/UserProfileDrawer';

export function UsersPage() {
  const { data: users = [], isLoading } = useUsers();
  const { deleteMutation } = useUserMutations();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
          <p className="text-sm text-slate-500">Manage application users, roles, and branch access.</p>
        </div>
        <Button variant="primary" onClick={() => setSelectedUserId('new')}>
          Add User
        </Button>
      </div>

      <DataTable
        data={users}
        isLoading={isLoading}
        onDelete={(user) => deleteMutation.mutate(user.id)}
        onEdit={(user) => setSelectedUserId(user.id)}
      />

      <UserProfileDrawer
        isOpen={Boolean(selectedUserId)}
        userId={selectedUserId === 'new' ? null : selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </div>
  );
}

// src/modules/security/features/users/index.ts
export * from './types';
export * from './api';
export * from './components';
export * from './pages';
```

### Step 5: Export Module Surface (`src/modules/<module>/index.ts`)
```ts
// src/modules/security/index.ts
export * from './features/auth';
export * from './features/users';
export * from './features/roles';
export * from './features/permissions';
export * from './features/pageRegistry';
export * from './features/roleDataScope';
export * from './features/userProfiles';
export * from './components';
export * from './routes';
export * from './types';
```

---

## 6. Modular Routing & Route Aggregation

Modules define their own route definitions, which are aggregated cleanly into the top-level `src/routes.tsx`:

### 1. Module Routes Definition (`src/modules/security/routes.tsx`)
```tsx
import React from 'react';
import { RouteObject, Outlet } from 'react-router-dom';
import { RequireAuth, RequireRole } from './features/auth';
import { UsersPage } from './features/users';
import { RolesPage } from './features/roles';
import { PermissionsPage } from './features/permissions';
import { PagesRegistryPage } from './features/pageRegistry';

export const securityRoutes: RouteObject = {
  element: <RequireAuth />,
  children: [
    {
      path: 'security',
      element: <RequireRole roles={['ADMIN', 'SECURITY_OFFICER']} />,
      children: [
        { path: 'users', element: <UsersPage /> },
        { path: 'roles', element: <RolesPage /> },
        { path: 'permissions', element: <PermissionsPage /> },
        { path: 'pages', element: <PagesRegistryPage /> },
      ],
    },
  ],
};
```

### 2. Root Route Configuration (`src/routes.tsx`)
```tsx
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { securityRoutes, AuthLayout, LoginPage, RegisterPage } from '@/modules/security';
import { orgRoutes } from '@/modules/org';
import { masterDataRoutes } from '@/modules/masterdata';
import { sharedRoutes } from '@/modules/shared';
import App from './App';

export const router = createBrowserRouter([
  // Public Authentication Routes
  {
    element: <AuthLayout><Outlet /></AuthLayout>,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  // Main Protected App Shell
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      sharedRoutes,
      securityRoutes,
      orgRoutes,
      masterDataRoutes,
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);
```

---

## 7. State Management Standards

### 1. Global UI Preferences Store (`src/lib/uiStore.ts`)
```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark';
  lang: 'en' | 'ar';
  dir: 'ltr' | 'rtl';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLang: (lang: 'en' | 'ar') => void;
  toggleLang: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      lang: 'en',
      dir: 'ltr',
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', next === 'dark');
        set({ theme: next });
      },
      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        set({ theme });
      },
      setLang: (lang) => {
        const dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.setAttribute('dir', dir);
        document.documentElement.setAttribute('lang', lang);
        set({ lang, dir });
      },
      toggleLang: () => {
        const nextLang = get().lang === 'en' ? 'ar' : 'en';
        get().setLang(nextLang);
      },
    }),
    { name: 'ui-theme-storage' }
  )
);
```

### 2. Session & Auth Store (`src/modules/security/features/auth/store/authStore.ts`)
```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: any | null;
  tokens: AuthTokens | null;
  status: 'idle' | 'authenticated' | 'unauthenticated' | 'loading';
  setSession: (user: any, tokens: AuthTokens) => void;
  clearSession: () => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      status: 'idle',
      setSession: (user, tokens) => set({ user, tokens, status: 'authenticated' }),
      clearSession: () => set({ user: null, tokens: null, status: 'unauthenticated' }),
      hasRole: (role) => get().user?.roles?.includes(role) ?? false,
      hasPermission: (perm) => get().user?.permissions?.includes(perm) ?? false,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ tokens: state.tokens }),
    }
  )
);
```

---

## 8. Centralized API Client & Silent 401 Refresh Pattern

Network calls are routed through `src/lib/api.ts`:
```ts
export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string, public data?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token!)));
  failedQueue = [];
};

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { tokens, clearSession, setTokens } = useAuthStore.getState();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (tokens?.accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${tokens.accessToken}`);
  }

  const response = await fetch(endpoint, { ...options, headers });

  if (response.status === 401 && tokens?.refreshToken && !endpoint.includes('/api/auth/refresh')) {
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => failedQueue.push({ resolve, reject }))
        .then((newToken) => {
          headers.set('Authorization', `Bearer ${newToken}`);
          return fetch(endpoint, { ...options, headers }).then((res) => res.json());
        });
    }

    isRefreshing = true;
    try {
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });
      if (!refreshRes.ok) throw new Error('Refresh failed');
      const data = await refreshRes.json();
      setTokens(data.tokens);
      processQueue(null, data.tokens.accessToken);
      headers.set('Authorization', `Bearer ${data.tokens.accessToken}`);
      return await fetch(endpoint, { ...options, headers }).then((res) => res.json());
    } catch (err) {
      processQueue(err, null);
      clearSession();
      throw new ApiError(401, 'Session expired. Please log in again.');
    } finally {
      isRefreshing = false;
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(response.status, errorData.message || 'API request failed', errorData.code, errorData);
  }

  return response.json();
}
```

---

## 9. UI Components, Theming & Styling Rules

1. **Utility Merging (`src/lib/utils.ts`)**:
   ```ts
   import { clsx, type ClassValue } from 'clsx';
   import { twMerge } from 'tailwind-merge';

   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs));
   }
   ```
2. **Form Validation**: Always pair `react-hook-form` with `zod` and `@hookform/resolvers/zod`. Standardize form fields with clear error states (`border-red-500 text-red-500`).
3. **Data Tables**: Use `@tanstack/react-table` v8 with sortable columns, global filters, row selection, and CSV export.
4. **Bilingual & RTL**: All navigation components, sidebars, breadcrumbs, and inputs must respect dynamic `dir` and optional `lang?: 'en' | 'ar'` props. Use bidirectional chevron icons (`ChevronRight` vs `ChevronLeft`) and flex orders.
5. **Aesthetic Excellence**: Apply smooth transitions (`motion`), sleek dark mode palettes (`slate-950`), custom ERP shadows (`shadow-erp-card`), and curated typography (`Cairo` for Arabic, `Inter` for English).
