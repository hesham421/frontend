# AVELYNQ ERP — UI Kit

A high-fidelity recreation of the AVELYNQ enterprise resource planning application, rebranded into the **future** AVELYNQ visual identity (navy foundation, Avelynq Blue, teal ascent accent, IBM Plex type). It demonstrates the real product surfaces, not a component storybook.

## Run it
Open `index.html`. It boots an interactive click-through:

1. **Login** → split brand/form layout with role tabs and language switch.
2. **Dashboard** → welcome banner, KPI stats, permission-based quick-access grid, recent activity.
3. **Chart of Accounts** (Finance · GL) → page header actions, search + type filter, data table with mono codes, type badges, signed balances, status, row actions, pagination.
4. **Account form** → breadcrumb, tabbed sections (Identity / Classification / Settings), bilingual EN/AR fields, save/cancel.

Other sidebar modules render a consistent placeholder surface.

## Files
- `index.html` — app shell + routing (login → dashboard → accounts → form)
- `Shell.jsx` — `Sidebar`, `Topbar`
- `LoginScreen.jsx`, `DashboardScreen.jsx`, `AccountsScreen.jsx`, `AccountFormScreen.jsx`
- `data.js` — fake nav + GL accounts + activity data

## Composition
Screens compose the design-system primitives from `_ds_bundle.js` (`window.AVELONDesignSystem_a21abd` — the compiler-generated namespace, retained for build stability): `Button`, `IconButton`, `Card`, `Stat`, `Badge`, `Avatar`, `Input`, `Select`, `Switch`, `Checkbox`, `Alert`, `EmptyState`, `Tabs`. The sidebar/topbar chrome is kit-specific.

## Source of truth
Functional structure (modules, navigation, GL workflows, list/form/modal patterns, bilingual RTL) is taken from the AVELYNQ Angular codebase (`frontend/`). Per the brand constitution, the **visual identity is original** — the current Angular Material / Mantis skin is temporary and was not used as a visual reference.
