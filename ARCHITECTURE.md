# Senior Frontend Architectural Analysis & Specification

**Project:** `avelynq-erp-dashboard`  
**Role:** Senior Frontend Architect  

---

## Project Input Summary

* **Project Name:** `avelynq-erp-dashboard` (AVELYNQ Enterprise Resource Planning Platform)
* **One-Line Description:** High-density enterprise resource planning (ERP) dashboard with bimodal English/Arabic (LTR/RTL) localization, hierarchical organization structure, chart of accounts tree, financial telemetry, and granular access control.
* **Core Features / User Stories:**
  * **Authentication & Session:** Secure user login shell with session state management.
  * **Executive Dashboard:** Financial telemetry stats (KPI cards), pending approval queues, system activity audit log stream, quick navigation shortcuts.
  * **Chart of Accounts Management:** Filterable, hierarchical general ledger chart of accounts tree view with status badges, balance totals, and detail drawer view.
  * **Account Registration Form:** Multi-step styled form with input validation, code formatting, currency selectors, and category classification.
  * **Organization Management:** Multi-tab workspace featuring interactive tree hierarchy for business units, department registry cards, and job titles matrix.
  * **Enterprise Modules:** Standardized module shells for Human Resources, Inventory, Procurement, Sales, Maintenance, System Security, and Financial Reports.
  * **Bimodal i18n System:** Instant LTR (English) <-> RTL (Arabic) layout flipping with CSS custom properties and contextual text translation.
  * **Custom Design System:** Modular design tokens (`colors`, `typography`, `spacing`, `elevation`, `breakpoints`, `responsive`) paired with `@tabler/icons-webfont`.
* **Tech Stack:** React `^18.3.1`, TypeScript `^5.9.3`, Vite `^5.4.21`, Vanilla CSS Custom Properties (Design System Tokens), React Context (`LanguageContext`), State-driven view router.
* **Design System / UI Library:** Custom AVELON Design System with CSS design tokens + `@tabler/icons-webfont`.
* **Target Platforms:** Web application optimized for desktop, tablet, and responsive mobile viewports.
* **Backend/API Shape:** Client-side in-memory mock state model (`mockData.ts`), structured to seamlessly bind to RESTful JSON endpoints.

---

## Task 1 — Full Project Structure (Existing Codebase Analysis)

### Organization Convention: **Hybrid Layout & Tokenized Layered Architecture**
The codebase follows a hybrid pattern:
1. **Design System & Tokens (`src/styles/tokens/`)**: Separates design variables (colors, typography, spacing, elevation, responsiveness) from component logic.
2. **UI Primitive Library (`src/components/ui/`)**: Groups foundational atomic components by visual category (`Button`, `FormControls`, `DataDisplay`, `OverlaysAndFeedback`).
3. **Layout Layer (`src/layout/`)**: Encapsulates structural shells (`AppShell`, `Sidebar`, `Topbar`).
4. **View Layer (`src/pages/`)**: Contains full page views corresponding to application screens.
5. **Context & State (`src/context/`)**: Encapsulates global application concerns like localization (`LanguageContext`).
6. **Data & Schema Layer (`src/data/`)**: Centralizes domain types and mock data stores.

### Codebase Directory Tree

```
dashboard_workspace/
├── index.html                           # Single Page Application HTML entry point
├── package.json                         # Dependencies (@tabler/icons-webfont, react, typescript, vite)
├── package-lock.json                    # Locked dependency tree
├── tsconfig.json                        # TypeScript compiler configuration
├── vite.config.ts                       # Vite bundler build config
├── public/                              # Static public assets
│   └── assets/                          # Brand assets & logos (light/dark lockups, app icons)
│       ├── avelynq-appicon.png
│       ├── avelynq-brand-sheet.png
│       ├── avelynq-lockup-dark.png
│       ├── avelynq-lockup-light.png
│       └── avelynq-mark-dark.png
└── src/                                 # Application source root
    ├── App.tsx                          # Root component with view routing & session state
    ├── main.tsx                         # React 18 DOM mount point with LanguageProvider wrapper
    ├── assets/                          # In-bundle image assets
    ├── components/                      # Reusable UI component library
    │   └── ui/                          # Design system primitive components
    │       ├── Button.tsx               # Button & IconButton primitives with variants & loading state
    │       ├── DataDisplay.tsx          # Card, Stat, Badge, Avatar presentation primitives
    │       ├── FormControls.tsx         # Input, Select, Checkbox, Switch input primitives
    │       └── OverlaysAndFeedback.tsx  # Alert, EmptyState, Tabs, Breadcrumb, Dialog, Drawer
    ├── context/                         # Global React Context providers
    │   └── LanguageContext.tsx          # Bimodal English/Arabic i18n & RTL document state manager
    ├── data/                            # Application domain data & types
    │   └── mockData.ts                  # Account records, Org tree hierarchy, Depts, Audit logs
    ├── layout/                          # App layout frame & scaffolding components
    │   ├── AppShell.tsx                 # Main layout frame container (Topbar + Sidebar + Content)
    │   ├── Sidebar.tsx                  # Collapsible multi-section navigation sidebar with active markers
    │   └── Topbar.tsx                   # Top bar header with search, notifications, i18n switcher, user profile
    ├── pages/                           # Application page views
    │   ├── AccountForm.tsx              # Create/Edit Account multi-step input view
    │   ├── Accounts.tsx                 # Chart of Accounts general ledger management view
    │   ├── Dashboard.tsx                # Executive telemetry summary & quick actions view
    │   ├── GenericModule.tsx            # Generic placeholder view for standard ERP modules
    │   ├── Login.tsx                    # Authentication screen view
    │   └── Organization.tsx             # Enterprise Org Structure, Departments & Job Titles view
    └── styles/                          # CSS design system root
        ├── styles.css                   # Global reset, typography imports & utility styles
        └── tokens/                      # Design Token definitions
            ├── breakpoints.css          # Viewport media query breakpoints
            ├── colors.css               # Color tokens (Brand, Text, Surface, Border, Semantic colors)
            ├── elevation.css            # Box shadows, z-index layers & borders
            ├── fonts.css                # Typography font family declarations (Inter, Cairo, JetBrains Mono)
            ├── responsive.css           # Mobile navigation & responsive override rules
            ├── spacing.css              # Control heights, gaps & layout margins
            └── typography.css           # Scale declarations (h1-h4, body, caption, code)
```

### Architectural Mapping & Conventions

* **Components & Primitives (`src/components/ui/`):** Universal, state-agnostic design system primitives. They receive props, execute callbacks, and leverage CSS custom properties.
* **Layout Shells (`src/layout/`):** High-level structural components responsible for application frame scaffolding, responsive drawer toggles, and sidebar navigation state.
* **Pages (`src/pages/`):** Domain views that assemble primitives and layouts to fulfill specific user workflows (e.g. Chart of Accounts, Organization Management).
* **State Management (`src/context/LanguageContext.tsx`):** Centralizes global locale state (`en` / `ar`), document direction (`dir="ltr"` / `dir="rtl"`), and key-based translation rendering (`t()`).
* **Routing Strategy:** Lightweight, fast state-driven router in `App.tsx` (`currentScreen` state variable) rendering full screen pages wrapped in `AppShell`.
* **Naming Conventions:**
  * **Components & Pages:** `PascalCase.tsx` (e.g., `AccountForm.tsx`, `OverlaysAndFeedback.tsx`).
  * **Data & Utilities:** `camelCase.ts` (e.g., `mockData.ts`).
  * **Design Tokens & Styles:** `kebab-case.css` (e.g., `responsive.css`, `colors.css`).
  * **CSS Custom Properties:** `--kebab-case` (e.g., `--brand-primary`, `--surface-sunken`).

---

## Task 2 — Component Inventory

The following table documents every component in the codebase:

| Component | Type | Reusability | Purpose | Key Props | Internal State | Depends On |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Button` | Shared Primitive | **Reusable** | Primary clickable action element with multi-variant styling, size scales, and loading spinners | `variant`, `size`, `iconLeft`, `iconRight`, `block`, `loading`, `disabled`, `onClick` | None | `Spinner` |
| `IconButton` | Shared Primitive | **Reusable** | Compact square button for icon-only actions (settings, close, search) | `icon`, `label`, `variant`, `size`, `disabled`, `onClick` | None | `@tabler/icons-webfont` |
| `Input` | Shared Primitive | **Reusable** | Text/number entry field with labels, prefix icons, error states, and monospace support | `label`, `hint`, `error`, `value`, `onChange`, `iconLeft`, `suffix`, `mono` | `focused` (boolean) | CSS Tokens |
| `Select` | Shared Primitive | **Reusable** | Form dropdown selector with standard option rendering and error handling | `label`, `hint`, `error`, `value`, `onChange`, `options`, `iconLeft` | `focused` (boolean) | `Option` interface |
| `Checkbox` | Shared Primitive | **Reusable** | Binary checkbox input control with optional helper description | `label`, `checked`, `onChange`, `description`, `disabled` | None | Tabler check icon |
| `Switch` | Shared Primitive | **Reusable** | Toggle switch for binary state flags | `label`, `checked`, `onChange`, `disabled` | None | CSS animation tokens |
| `Card` | Shared Primitive | **Reusable** | Content container card with header, subtitle, actions, and custom padding | `title`, `subtitle`, `action`, `children`, `padding`, `variant` | None | CSS Surface tokens |
| `Stat` | Shared Primitive | **Reusable** | Telemetry summary tile displaying KPI metrics, delta trends, and background icons | `label`, `value`, `change`, `changeType`, `icon`, `trendText` | None | `Card`, `Badge` |
| `Badge` | Shared Primitive | **Reusable** | Status tag indicator pill with colored background accents | `variant`, `size`, `dot`, `children` | None | CSS Color tokens |
| `Avatar` | Shared Primitive | **Reusable** | User profile avatar displaying user initials or avatar image with size options | `name`, `src`, `size`, `status` | None | CSS Typography tokens |
| `Alert` | Shared Primitive | **Reusable** | In-page message banner for system alerts, warnings, and success notices | `variant`, `title`, `children`, `onClose` | None | `IconButton`, Tabler icons |
| `EmptyState` | Shared Primitive | **Reusable** | Placeholder view rendered when tables or trees contain zero records | `icon`, `title`, `description`, `action` | None | Tabler icons |
| `Tabs` | Shared Primitive | **Reusable** | Horizontal tabbed navigation bar for switching views within a page | `items`, `activeId`, `onChange`, `variant` | None | CSS Border tokens |
| `Breadcrumb` | Shared Primitive | **Reusable** | Path navigation crumb trail for hierarchical page tracking | `items` | None | Tabler chevron icon |
| `Dialog` | Shared Primitive | **Reusable** | Modal overlay window for confirmation prompts and heavy forms | `isOpen`, `onClose`, `title`, `children`, `footer` | None | `IconButton`, Backdrop CSS |
| `Drawer` | Shared Primitive | **Reusable** | Side slide-over panel for quick detail inspection without losing page context | `isOpen`, `onClose`, `title`, `children`, `width` | None | `IconButton`, Backdrop CSS |
| `AppShell` | Layout | **Single-use** | Top-level visual frame holding Topbar, Sidebar, and main scrollable content area | `activeScreen`, `onNavigate`, `onLogout`, `title`, `breadcrumb`, `children` | `mobileSidebarOpen` (boolean) | `Sidebar`, `Topbar`, `LanguageContext` |
| `Sidebar` | Layout | **Single-use** | Enterprise multi-group navigation sidebar with active screen indicators | `activeScreen`, `onNavigate`, `collapsed`, `onToggleCollapse` | None | `LanguageContext`, `IconButton` |
| `Topbar` | Layout | **Single-use** | Header bar containing quick search, notification counts, language switcher, and user menu | `title`, `breadcrumb`, `onMobileMenuClick` | `notificationsOpen`, `profileOpen` | `useLanguage`, `Avatar`, `IconButton` |
| `Login` | Page | **Single-use** | Authentication screen with credential entry, language toggle, and enterprise branding | `onLogin` | `username`, `password`, `loading`, `rememberMe` | `Input`, `Button`, `Checkbox`, `LanguageContext` |
| `Dashboard` | Page | **Single-use** | Executive telemetry overview with financial stats, audit logs, and quick module links | `onNavigate` | `timeframe` | `Stat`, `Card`, `Badge`, `Button`, `LanguageContext` |
| `Accounts` | Page | **Single-use** | General ledger Chart of Accounts tree & table browser with search and detail drawer | `onOpenForm` | `searchQuery`, `typeFilter`, `selectedAccount`, `drawerOpen` | `Input`, `Select`, `Button`, `Badge`, `Drawer`, `LanguageContext` |
| `AccountForm` | Page | **Single-use** | Multi-step form for creating new accounts with parent classification and code generator | `onBack` | Form fields state (`code`, `name`, `type`, `balance`, etc.) | `Input`, `Select`, `Checkbox`, `Button`, `Card`, `LanguageContext` |
| `Organization` | Page | **Single-use** | Multi-tab workspace for Org Unit tree hierarchy, Department cards, and Job Titles | None | `activeTab`, `searchQuery`, `selectedUnit`, `expandedNodes` | `Tabs`, `Input`, `Button`, `Card`, `Badge`, `Drawer`, `LanguageContext` |
| `GenericModule` | Page | **Single-use** | Reusable placeholder screen for unbuilt modules (HR, Inventory, Procurement, etc.) | `titleKey`, `icon`, `description` | None | `Card`, `Button`, `EmptyState`, `LanguageContext` |
| `LanguageProvider` | Provider | **Reusable** | Context provider managing locale (`en`/`ar`), document direction (`ltr`/`rtl`), and `t()` function | `children` | `language` (`'en'` \| `'ar'`) | `LanguageContext` |

---

## Task 3 — Reusable Frontend Skill

The architecture and design principles above have been formatted into a standalone **Skill Document** (`SKILL.md`) for future reuse.

```markdown
---
name: avelynq-react-enterprise-architecture
description: Guidelines and architectural conventions for building high-density, bimodal (LTR/RTL), token-driven React enterprise applications.
---

# AVELYNQ React Enterprise Architecture Skill

Use this skill when designing, building, or refactoring high-density React enterprise applications that require design token discipline, bimodal i18n (LTR/RTL), custom styling, and scalable component isolation.

## Conventions

### 1. Folder Structure Rules
* **`src/styles/tokens/`**: Store all visual design tokens (colors, typography, spacing, elevation, breakpoints, responsive) as raw CSS variables here. Never hardcode hex values or pixel sizes in components.
* **`src/components/ui/`**: Keep primitive UI components atomic and domain-agnostic. Group them strictly by capability (`Button.tsx`, `FormControls.tsx`, `DataDisplay.tsx`, `OverlaysAndFeedback.tsx`).
* **`src/layout/`**: Keep app scaffolding (`AppShell`, `Sidebar`, `Topbar`) cleanly decoupled from business pages.
* **`src/pages/`**: Compose full screen views here by stitching together UI primitives and layout containers.
* **`src/context/`**: Place cross-cutting app providers here (e.g. `LanguageContext.tsx`).
* **`src/data/`**: Keep TypeScript data interfaces and mock seed state isolated from view components.

### 2. Naming Rules
* **Components & Views**: `PascalCase.tsx` (e.g., `AccountForm.tsx`, `DataDisplay.tsx`).
* **Utility & Data Files**: `camelCase.ts` (e.g., `mockData.ts`).
* **CSS Files & Assets**: `kebab-case.css` (e.g., `responsive.css`).
* **CSS Variables**: `--kebab-case` with semantic prefixes (e.g., `--brand-primary`, `--surface-sunken`, `--text-body`).

### 3. Component-Splitting Criteria
Break a component apart into smaller sub-components when:
* A file exceeds 300 lines of code.
* A visual sub-section (like an account row or node tree item) contains reusable internal state or event handlers.
* A component mixes domain business logic with design system rendering primitives.

## Tech Stack Defaults

* **Core Framework:** React 18+ with TypeScript (strict mode enabled).
* **Build System:** Vite.
* **Styling Strategy:** Vanilla CSS custom properties with dedicated token files and pure class composition (`avl-*`).
* **Icon System:** `@tabler/icons-webfont` vector icons.
* **Localization:** Custom bimodal context (`LanguageContext`) managing English (`en`) / Arabic (`ar`) translation maps and real-time LTR/RTL document attribute updates (`document.documentElement.dir`).

## State Management Pattern

* **Local Component State (`useState`):** Use for UI-only transient state (dropdown toggle, tab switching, input focus, modal open state).
* **Global Context (`React.createContext`):** Use for cross-cutting application concerns that span the entire application tree (Authentication session, i18n locale, RTL direction).
* **Domain Data Layer:** Keep data models typed (`interface AccountRecord`, `interface OrgTreeNode`) and isolate API fetch calls or mock state providers outside of visual component code.

## Do / Don't Rules

* **DO** use CSS custom variables (`var(--brand-primary)`) for all styling properties to support real-time theme and direction changes.
* **DO** implement full LTR and RTL support by applying logical CSS properties (`margin-inline-start`, `padding-inline-end`, `border-inline-start`) or directional overrides.
* **DO** provide clear fallback translations in `LanguageContext` for all user-facing strings.
* **DO** type all component props explicitly using exported TypeScript interfaces.
* **DON'T** put direct API data fetching inside primitive UI components (`src/components/ui/`). Primitives must remain pure presentation components.
* **DON'T** embed inline hex colors or hardcoded pixel font-sizes directly inside JSX style props. Use CSS token variables instead.
* **DON'T** mix layout logic (sidebar grid spans) directly inside feature pages. Always wrap views using `AppShell`.
* **DON'T** use heavy external UI component libraries when a lightweight, custom token-driven primitive library provides higher control and density.
```

---

## Task 4 — Execution Plan

This phase-by-phase execution plan outlines the sequential roadmap for building or extending an enterprise application of this architecture.

---

### Phase 1: Project Setup & Design System Tokens
* **Goal:** Initialize Vite + React + TypeScript environment and establish design token infrastructure.
* **Tasks in Build Order:**
  1. Initialize Vite project (`vite`, `@vitejs/plugin-react`, TypeScript).
  2. Install font assets and `@tabler/icons-webfont` package.
  3. Create token files under `src/styles/tokens/` (`colors.css`, `typography.css`, `spacing.css`, `elevation.css`, `breakpoints.css`, `fonts.css`).
  4. Build main `styles.css` root file importing all token files and CSS resets.
* **Definition of Done:** App compiles cleanly; CSS custom properties are globally available in the browser DOM.
* **Relative Effort:** **S (Small)**

---

### Phase 2: Bimodal i18n Context & Framework
* **Goal:** Create the global localization context supporting instant LTR/RTL switching.
* **Tasks in Build Order:**
  1. Create `LanguageContext.tsx` with English (`en`) and Arabic (`ar`) translation dictionaries.
  2. Implement document direction synchronizer (`document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'`).
  3. Export `useLanguage()` custom hook.
  4. Wrap app root in `main.tsx` with `<LanguageProvider>`.
* **Definition of Done:** Toggling language dynamically updates DOM `dir` attribute and translates dictionary keys instantly.
* **Relative Effort:** **S (Small)**

---

### Phase 3: Shared Primitive UI Components
* **Goal:** Build the complete set of reusable atomic UI primitives.
* **Tasks in Build Order:**
  1. Build `Button.tsx` and `IconButton.tsx` with variant, size, and loading state props.
  2. Build `FormControls.tsx` (`Input`, `Select`, `Checkbox`, `Switch`).
  3. Build `DataDisplay.tsx` (`Card`, `Stat`, `Badge`, `Avatar`).
  4. Build `OverlaysAndFeedback.tsx` (`Alert`, `EmptyState`, `Tabs`, `Breadcrumb`, `Dialog`, `Drawer`).
* **Definition of Done:** Primitives render cleanly, adopt CSS token variables, and handle user interactions reliably.
* **Relative Effort:** **M (Medium)**

---

### Phase 4: Layout Shell & Navigation Skeleton
* **Goal:** Construct the master structural layout shell and top-level navigation.
* **Tasks in Build Order:**
  1. Build `Topbar.tsx` with title header, search input, notification menu, language toggle, and user profile drawer.
  2. Build `Sidebar.tsx` with enterprise module navigation links, badges, and collapse toggles.
  3. Build `AppShell.tsx` assembling Topbar, Sidebar, and scrollable child content area with mobile navigation drawer logic.
  4. Wire `App.tsx` state-based view switching (`currentScreen` state).
* **Definition of Done:** Complete navigation frame functions smoothly, sidebar links switch screens, and layout adapts to screen resizing.
* **Relative Effort:** **M (Medium)**

---

### Phase 5: Feature Pages Implementation
* **Goal:** Implement all domain feature pages and workflows.
* **Sub-Phases:**
  * **5.1 Auth & Login (`Login.tsx`):** Build login card, branding hero, user inputs, and authentication toggle callback.
  * **5.2 Executive Dashboard (`Dashboard.tsx`):** Build telemetry KPI stats grid, recent activity stream table, and quick shortcut cards.
  * **5.3 Chart of Accounts (`Accounts.tsx`):** Build tree view browser, search filter, account status badges, and detail drawer panel.
  * **5.4 Account Entry Form (`AccountForm.tsx`):** Build multi-step input form for creating accounts with validation and category selectors.
  * **5.5 Organization Management (`Organization.tsx`):** Build tabbed workspace for Org Tree, Department cards, and Job Title list.
  * **5.6 Generic Modules (`GenericModule.tsx`):** Create standardized module template view for HR, Inventory, Sales, Procurement, Maintenance, Security, and Reports.
* **Definition of Done:** All screens are fully rendered, interactive, localized, and styled per design specifications.
* **Relative Effort:** **L (Large)**

---

### Phase 6: Data & State Integration
* **Goal:** Centralize domain models, seed mock datasets, and wire full client state bindings.
* **Tasks in Build Order:**
  1. Define TypeScript interfaces for Accounts, Org Trees, Departments, and Audit Logs in `src/data/mockData.ts`.
  2. Populated rich mock data representing enterprise scale operations.
  3. Connect live state handler logic in `Accounts.tsx` and `Organization.tsx` to filter and manipulate mock data.
* **Definition of Done:** Filtering, searching, opening detail drawers, and form submissions operate seamlessly with real-time feedback.
* **Relative Effort:** **M (Medium)**

---

### Phase 7: Responsiveness & Accessibility Polish
* **Goal:** Fine-tune mobile responsive viewports, RTL layout alignment, and keyboard accessibility.
* **Tasks in Build Order:**
  1. Test and tune `responsive.css` across mobile, tablet, and widescreen breakpoints.
  2. Verify RTL layout mirroring (flex directions, padding, icon flips) in Arabic mode.
  3. Add `aria-label`, focus rings, and keyboard navigation to all interactive controls.
* **Definition of Done:** Zero horizontal scrolling on mobile viewports; seamless LTR/RTL visual symmetry; WCAG-compliant keyboard focus indicators.
* **Relative Effort:** **M (Medium)**

---

### Phase 8: Build Verification & Testing
* **Goal:** Verify TypeScript compilation, production bundling, and execution performance.
* **Tasks in Build Order:**
  1. Run `npm run lint` (`tsc --noEmit`) to verify zero TypeScript compilation errors.
  2. Run `npm run build` (`vite build`) to generate optimized static output in `dist/`.
  3. Run `npm run preview` to test production bundle execution.
* **Definition of Done:** Production bundle compiles cleanly without warnings; page load speeds and transition animations are instant.
* **Relative Effort:** **S (Small)**
