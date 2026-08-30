---
name: react-dashboard-architecture
description: >-
  Architectural blueprint, standards, and patterns for building scalable, feature-driven React 19 dashboards and enterprise web apps. Use this skill when scaffolding new features, creating or refactoring UI components, structuring API client layers with TanStack Query and silent token refresh, implementing Zustand stores, configuring React Router v7 guards, handling React Hook Form with Zod validation, building TanStack Tables, or supporting bilingual LTR/RTL and dark mode theming.
---

# React Dashboard Architecture & Development Guide

This skill provides an enterprise architectural blueprint for building scalable, feature-driven React 19 web applications and dashboards.

---

## 1. Core Architecture Principles

1. **Feature-Driven Architecture (Bulletproof React standard)**:
   - Business domain logic is grouped into self-contained feature modules in `src/features/<feature-name>/`.
   - Each feature encapsulates its own API calls, TanStack Query hooks, Zustand/local state, domain components, route guards, and pages.
2. **Layered Design System Primitives (`src/components/ui/`)**:
   - Reusable, un-opinionated visual UI primitives (Buttons, Inputs, Modals, Tables, Steppers, Drawers).
   - Style with Tailwind CSS v4 and merge classes via `cn(...)` (`clsx` + `tailwind-merge`).
3. **Segregated State Management**:
   - **Server Cache & Async Data**: TanStack Query (`@tanstack/react-query`) with query key factories.
   - **Global Client/UI State**: Zustand (`zustand`) for session (`useAuthStore`) and UI preferences (`useUIStore`).
   - **Local State**: `useState` / `useReducer` inside components for transient UI logic.
4. **Centralized API Client with Silent Token Refresh**:
   - Centralized `apiClient<T>` with automated `Authorization: Bearer` header injection, 401 interception, failed request queueing, and silent token refreshing.
5. **Bilingual & RTL-First**:
   - Native bidirectional support (English LTR / Arabic RTL) with dynamic font switching, reversed chevrons/icons, and flex directions.

---

## 2. Directory Layout Standard

```
src/
├── components/             # Reusable, domain-agnostic UI primitives
│   └── ui/                 # Standalone UI components (Buttons, Inputs, Tables, etc.)
├── features/               # Feature domain modules
│   └── <feature-name>/     # e.g., auth, users, roles, billing, inventory
│       ├── api/            # Pure API fetchers, query keys & React Query hooks
│       │   ├── <feature>Api.ts
│       │   ├── <feature>Keys.ts
│       │   ├── use<Feature>Queries.ts
│       │   ├── use<Feature>Mutations.ts
│       │   └── index.ts
│       ├── components/     # Feature-specific UI components & route guards
│       │   └── index.ts
│       ├── pages/          # Feature route page components
│       │   ├── <Feature>Page.tsx
│       │   └── index.ts
│       ├── store/          # Optional: Feature-scoped Zustand store
│       │   └── <feature>Store.ts
│       ├── types.ts        # TypeScript interfaces and schemas for this feature
│       └── index.ts        # Clean barrel export for public feature surface
├── lib/                    # Cross-cutting shared infrastructure
│   ├── api.ts              # Centralized apiClient with token refresh queue & ApiError
│   ├── translations.ts     # i18n translation dictionaries (e.g. en / ar)
│   ├── uiStore.ts          # Global UI preferences (theme, lang, dir)
│   └── utils.ts            # Utility functions (e.g., cn helper)
├── App.tsx                 # Main layout or root protected view
├── index.css               # Tailwind CSS v4 imports, @theme, custom utilities
├── main.tsx                # App entry point (QueryClientProvider, RouterProvider)
├── routes.tsx              # React Router v7 configuration with guards
└── types.ts                # Global shared TypeScript types
```

---

## 3. Feature Module Development Workflow

When adding a new feature (e.g., `users`, `products`, `orders`):

### Step 1: Define Types (`src/features/<feature>/types.ts`)
```ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  role: string;
}
```

### Step 2: Create API Client & Query Keys (`src/features/<feature>/api/`)
```ts
// src/features/<feature>/api/<feature>Keys.ts
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// src/features/<feature>/api/<feature>Api.ts
import { apiClient } from '../../../lib/api';
import { User, CreateUserInput } from '../types';

export const usersApi = {
  getUsers: () => apiClient<User[]>('/api/users', { method: 'GET' }),
  getUserById: (id: string) => apiClient<User>(`/api/users/${id}`, { method: 'GET' }),
  createUser: (data: CreateUserInput) => apiClient<User>('/api/users', { method: 'POST', body: JSON.stringify(data) }),
  deleteUser: (id: string) => apiClient<{ success: boolean }>(`/api/users/${id}`, { method: 'DELETE' }),
};
```

### Step 3: Implement TanStack Query Hooks
```ts
// src/features/<feature>/api/useUsersQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from './usersApi';
import { userKeys } from './userKeys';
import { CreateUserInput } from '../types';

export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: usersApi.getUsers,
    staleTime: 1000 * 60 * 5, // 5 minutes
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

### Step 4: Build Feature Pages & Export
```ts
// src/features/<feature>/pages/UsersPage.tsx
import React from 'react';
import { useUsers } from '../api/useUsersQueries';
import { DataTable } from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';

export function UsersPage() {
  const { data: users = [], isLoading, error } = useUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
        <Button variant="primary">Add User</Button>
      </div>
      {/* Table implementation */}
    </div>
  );
}

// src/features/<feature>/index.ts
export * from './types';
export * from './api';
export * from './pages';
```

---

## 4. State Management Standards

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

### 2. Session & Auth Store (`src/features/auth/store/authStore.ts`)
```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  status: 'idle' | 'authenticated' | 'unauthenticated' | 'loading';
  setSession: (user: User, tokens: AuthTokens) => void;
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

## 5. Centralized API Client & Silent 401 Refresh Pattern

Always use `src/lib/api.ts` for network calls:
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

## 6. Routing & Guard Standards (`src/routes.tsx`)

Implement nested route structures with declarative guards:
```tsx
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { RequireAuth, RequireRole, AuthLayout, LoginPage, RegisterPage } from './features/auth';
import { UsersPage } from './features/users';
import App from './App';

export const router = createBrowserRouter([
  // Public Auth Routes
  {
    element: <AuthLayout><Outlet /></AuthLayout>,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  // Protected Routes
  {
    element: <RequireAuth />,
    children: [
      {
        element: <App />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <div>Dashboard Overview</div> },
          // Role-protected subroute
          {
            element: <RequireRole roles={['admin', 'manager']} />,
            children: [
              { path: '/users', element: <UsersPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
```

---

## 7. UI Components, Theming & Styling Rules

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
