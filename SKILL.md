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
