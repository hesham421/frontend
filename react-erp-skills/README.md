# AVELYNQ React Enterprise Skill Pack

Architecture, rules, and enforcement for the AVELYNQ ERP dashboard: a high-density,
bimodal (LTR/RTL), token-driven React enterprise application. The pack defines how a
feature is built, where every piece of state lives, and what fails review.

**Stack:** React 18.3 · TypeScript 5.9 (strict) · Vite 5 · React Router v7 ·
Vanilla CSS custom properties + `avl-*` classes · `@tabler/icons-webfont` ·
`LanguageContext` (en/ar, LTR/RTL) · TanStack Query v5 · React Hook Form 7 · Zod 4 ·
Vitest + RTL + MSW · Playwright

---

## Start here

| Read | For |
|---|---|
| `references/architecture.md` | Binding decisions AD-1 … AD-14, structure, naming, library ownership |
| `references/contract-rules.md` | Every rule ID the skills cite |

## Layout

```
references/
├── architecture.md            binding decisions — wins over any skill
└── contract-rules.md          canonical rule IDs

erp-priority-override/         precedence when guidance conflicts

create-auth-session/           Phase 1  token store, refresh, session, grants
create-error-handling/         Phase 1  error taxonomy and boundaries
create-app-state/              Phase 1  LanguageContext, AuthContext

create-models/                 DTO types, Zod schema, form mapper
create-api-client/             HTTP client and feature api module
create-queries/                query keys, reads, mutations
create-forms/                  RHF + Zod, server errors, dirty guarding
create-components/             list and entry screens, tables, cells
create-routing/                paths, static route tree, guards, navigation
create-confirm-actions/        permission- and usage-checked handlers
create-tests/                  unit, contract, integration, E2E

enforce-frontend-architecture/ 50 checks
enforce-state-management/      48 checks
enforce-ui-ux/                 42 checks
enforce-permissions/           34 checks
enforce-security/              34 checks
enforce-reusability/           28 checks
validate-frontend-feature/     master, 150 points
```

## Build order

```
Phase 1 (once)   create-auth-session → create-error-handling → create-app-state

Per feature      create-models → create-api-client → create-queries
                   → create-forms → create-components → create-routing
                     → create-confirm-actions → create-tests

Review           enforce-* as needed → validate-frontend-feature
```

## Install

```bash
cp -r react-erp-skills/* .claude/skills/
```

Or, using the [Agent Skills](https://agentskills.io/) CLI that `vercel-labs/agent-skills`
itself installs with, from a repo hosting this pack:

```bash
npx skills add <owner>/<repo> --all         # every skill in this pack
npx skills add <owner>/<repo> --skill create-routing --skill enforce-ui-ux   # a subset
```

Any agent supporting the Agent Skills format (`SKILL.md` + YAML frontmatter — Claude Code,
Cursor, opencode, and others) can load these either way.

---

## The architecture in one page

**Routing is frontend-owned and static (AD-1, AD-2).** Routes are declared in code in
`src/routes/routes.tsx`; every URL string lives in `src/routes/paths.ts`. **Nothing about
the URL space, the screen inventory, or the navigation menu comes from an API.** The
backend supplies one routing-adjacent fact the frontend cannot know: **which permissions
this user holds**. The menu is derived from the route config and filtered by those grants.

This replaces `currentScreen` state switching, which cannot support deep links, browser
history, refresh-stable URLs, or per-route code splitting.

**Five state owners (AD-7).** Server data → TanStack Query. Locale, direction, session and
grants → React Context. Form fields → React Hook Form. Page, size, sort, filters, active
tab → URL search params. One subtree → `useState`. There is no state library: two Context
providers already own the cross-cutting client state, and a third owner is the failure the
ownership table exists to prevent.

**Sessions use an in-memory access token and an httpOnly refresh cookie (AD-4).** No token
touches `localStorage` or `sessionStorage`. Startup exchanges the cookie for a token before
anything authenticated renders. A 401 triggers one single-flight refresh with concurrent
requests queued; a failed refresh is a hard logout that clears the cache and every tab.

**Frontend authorization is UX, not security (AD-6).** Three layers — route guard, `<Can>`
gating, and a check in the handler before any dialog — decide what the user is shown. The
backend decides what the user may do. Every enforcement report says so, because a passing
report is otherwise misread as proof an endpoint is protected.

**Styling is tokens only (AD-10).** All values come from `src/styles/tokens/*.css` via
`var(--token)`; components compose `avl-*` classes. Layout uses logical CSS properties
(`margin-inline-start`, `inset-inline-start`) so one stylesheet serves both directions —
physical properties are the single most common cause of RTL breakage and are prohibited.

**Errors normalise to eight kinds (AD-11).** `network`, `unauthenticated`, `forbidden`,
`notFound`, `validation`, `conflict`, `server`, `unknown` — each with one defined
user-facing behaviour. Raw messages never reach the UI; a correlation ID does.

## Conventions at a glance

| Thing | Form |
|---|---|
| Feature logic | `src/features/accounts/{model,api,hooks}.ts` |
| Screen | `src/pages/Accounts.tsx` (default export, lazy) |
| Path | `PATHS.accounts.edit(id)` — never a literal |
| Permission | `perm(RESOURCES.ACCOUNT, 'UPDATE')` → `ACCOUNT_UPDATE` |
| Query key | `accountKeys.list(searchRequest)` |
| Hook | `useAccountList`, `useAccountMutations` |
| Translation | `t('accounts.title')`, present in `en` and `ar` |
| CSS class | `avl-card__header--compact` |
| CSS token | `var(--brand-primary)` |

## Related guidance

Each skill closes with an "Alignment" section reconciling against react.dev,
[`vercel-labs/agent-skills`](https://github.com/vercel-labs/agent-skills), and the TanStack,
React Router, React Hook Form, and Zod documentation. Those sources are authoritative about
React; this pack is authoritative about how this project uses React. Three of that repo's
skills map onto this one directly:

| `vercel-labs/agent-skills` | Where it lands here |
|---|---|
| `react-best-practices` | Waterfalls → `create-queries`/`create-api-client`; bundle rules → `enforce-frontend-architecture` §5; re-render rules → `enforce-state-management` §6 |
| `composition-patterns` | Boolean-prop and compound-component rules → `create-components` Part 2.5, R.4.14–R.4.15 |
| `web-design-guidelines` | Accessibility, forms, focus, motion, and locale rules → `enforce-ui-ux`, DS.1–DS.18 |

Not every official rule applies — this is a Vite SPA with no server rendering, so the
RSC/SSR-specific `server-*` category is explicitly out of scope. `erp-priority-override`
carries the full category-by-category reconciliation, the precedence order, and the three
cases where external guidance wins outright.
