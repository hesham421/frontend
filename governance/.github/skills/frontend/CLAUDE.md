# Skills: frontend

Skill pack for the AVELYNQ React ERP frontend. This directory is the governance
home for every frontend skill — read this file first when working under
`governance/.github/skills/frontend/`.

- Full index, layout, and build order: [`README.md`](README.md)
- Binding architecture (wins over any skill on conflict): [`references/architecture.md`](references/architecture.md)
- Canonical rule IDs cited by skills: [`references/contract-rules.md`](references/contract-rules.md)
- Precedence when external React/library guidance conflicts with a project rule: [`erp-priority-override/SKILL.md`](erp-priority-override/SKILL.md)

## Build skills (Phase 1 — once per app)

| Skill | Use when |
|---|---|
| [create-auth-session](create-auth-session/SKILL.md) | Building login, logout, token refresh, session expiry, or anything touching credentials |
| [create-error-handling](create-error-handling/SKILL.md) | Defining the error taxonomy, route error elements, or error boundaries |
| [create-app-state](create-app-state/SKILL.md) | Adding cross-cutting client state (locale/direction, session) via React Context |

## Build skills (per feature)

| Skill | Use when |
|---|---|
| [create-models](create-models/SKILL.md) | Starting a new entity: DTO types, Zod schema, form mapper |
| [create-api-client](create-api-client/SKILL.md) | Wiring a feature to backend endpoints |
| [create-queries](create-queries/SKILL.md) | Reading or writing backend data with TanStack Query |
| [create-forms](create-forms/SKILL.md) | Building any entry form with RHF + Zod |
| [create-components](create-components/SKILL.md) | Building feature list/entry pages, tables, cells |
| [create-routing](create-routing/SKILL.md) | Adding a screen or auditing route guards |
| [create-confirm-actions](create-confirm-actions/SKILL.md) | Adding delete/activate/deactivate handlers |
| [create-tests](create-tests/SKILL.md) | Adding or reviewing test coverage for a feature |

## Enforcement skills (review)

| Skill | Use when |
|---|---|
| [enforce-frontend-architecture](enforce-frontend-architecture/SKILL.md) | Reviewing feature structure, imports, naming, TS rigor (50 checks) |
| [enforce-state-management](enforce-state-management/SKILL.md) | Diagnosing stale data, flicker, duplicate requests, re-renders (48 checks) |
| [enforce-ui-ux](enforce-ui-ux/SKILL.md) | Reviewing UI, design tokens, i18n/RTL, accessibility (42 checks) |
| [enforce-permissions](enforce-permissions/SKILL.md) | Reviewing route guards, action gating, or a 403 on a visible button (34 checks) |
| [enforce-security](enforce-security/SKILL.md) | Security review before release; tokens, XSS, CSRF, secrets (34 checks) |
| [enforce-reusability](enforce-reusability/SKILL.md) | Checking for duplicated components, logic, or types (28 checks) |
| [validate-frontend-feature](validate-frontend-feature/SKILL.md) | Final review of a complete feature (150-point master validation) |

## Adding a new skill

1. Create `<skill-name>/SKILL.md` with `name` and `description` frontmatter.
2. Add a row to the appropriate table above and to `README.md`.
3. If the skill introduces a new binding decision, record it in `references/architecture.md` rather than only in the skill file.
