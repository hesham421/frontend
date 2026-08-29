---
name: validate-frontend-feature
description: "MASTER VALIDATION — scores a complete feature out of 150 points across 7 stages (completeness, models, API, server state, forms and components, routing and permissions, quality and tests) with 8 cross-cutting gate checks and 24 automatic rejection triggers. Use before marking a feature done, at final review, or when auditing an existing feature end to end."
---

# Skill: validate-frontend-feature

## Description
One scored verdict on a complete feature, combining every enforcement skill.
Rules: `references/contract-rules.md`. Architecture: `references/architecture.md`.

## When to Use
- A feature is complete and needs a verdict
- Final review before merge
- End-to-end audit of an existing feature

## When NOT to Use
- Mid-implementation — use the relevant `create-*` skill
- Partial features — report the missing layers instead of scoring a fraction
- Backend code

## Constraints

- MUST NOT modify code — this skill scores
- MUST NOT skip a stage
- MUST NOT auto-fix — report with the skill that owns the fix

---

## Stage 1 — Completeness (15)

| # | Check | Pts |
|---|---|---|
| V.1.1 | `model/<entity>.types.ts` | 2 |
| V.1.2 | `model/<entity>.schema.ts` with schema and mapper | 2 |
| V.1.3 | `api/<entity>Api.ts` | 2 |
| V.1.4 | `hooks/` — keys, queries, mutations | 3 |
| V.1.5 | `helpers/<entity>ConfirmActions.ts` | 1 |
| V.1.6 | `columns/` and `components/<Entity>ActionsCell.tsx` | 1 |
| V.1.7 | `components/<Entity>Form.tsx` | 1 |
| V.1.8 | `pages/` — list and entry | 2 |
| V.1.9 | Screen routed in `routes.tsx`, path in `paths.ts` | 1 |

## Stage 2 — Models and schema (15)

| # | Check | Pts | Rule |
|---|---|---|---|
| V.2.1 | All DTOs in one types file | 2 | R.1.1 |
| V.2.2 | `FormValues` inferred from the schema | 2 | R.1.3 |
| V.2.3 | Mapper has all four methods | 2 | R.1.4 |
| V.2.4 | Update request omits immutable fields | 3 | R.1.5 |
| V.2.5 | Numeric mappings use `??` | 2 | R.1.8 |
| V.2.6 | Field names match the backend contract | 2 | R.1.7 |
| V.2.7 | Shared list types imported | 1 | R.1.6 |
| V.2.8 | No `any`, no unsafe cast | 1 | TS.2, TS.8 |

## Stage 3 — API layer (20)

| # | Check | Pts | Rule |
|---|---|---|---|
| V.3.1 | All HTTP through `lib/http` | 3 | R.2.1 |
| V.3.2 | Endpoints grouped in `api/` | 2 | R.2.2 |
| V.3.3 | Base URL from env | 1 | R.2.3 |
| V.3.4 | Envelope unwrapped centrally | 2 | R.2.4 |
| V.3.5 | Normalised `ApiError` with kind, code, correlation ID | 3 | R.2.5, R.10.1 |
| V.3.6 | API modules pure I/O | 2 | R.2.6 |
| V.3.7 | Separate activate and deactivate | 2 | R.2.7 |
| V.3.8 | Search via `POST /search` with `SearchRequest` | 2 | R.2.8 |
| V.3.9 | `AbortSignal` forwarded | 2 | R.2.9 |
| V.3.10 | No retry, cache, or dedupe in the API layer | 1 | R.2.10 |

## Stage 4 — Server state (25)

| # | Check | Pts | Rule |
|---|---|---|---|
| V.4.1 | Zero `useEffect` fetching | 4 | R.3.1 |
| V.4.2 | Key factory used everywhere | 3 | R.3.3 |
| V.4.3 | Full `SearchRequest` in the key; no duplicate pagination state | 3 | R.3.4 |
| V.4.4 | `staleTime` and `gcTime` explicit | 3 | R.3.5 |
| V.4.5 | Invalidation by factory key | 2 | R.3.6 |
| V.4.6 | No waterfalls | 2 | R.3.7 |
| V.4.7 | Child mutations patch the cache | 2 | R.3.8 |
| V.4.8 | Usage invalidated after child mutations | 2 | R.3.9 |
| V.4.9 | No side effects inside hooks | 2 | R.3.11 |
| V.4.10 | No loading or error mirrors | 1 | R.3.12 |
| V.4.11 | Optimistic mutations have rollback | 1 | R.3.14 |

## Stage 5 — Forms and components (30)

| # | Check | Pts | Rule |
|---|---|---|---|
| V.5.1 | RHF + `zodResolver`, `onTouched` | 2 | R.8.1 |
| V.5.2 | `handleSubmit` on the `<form>`; correct button types | 4 | R.8.2, R.8.3 |
| V.5.3 | Server field errors mapped and focused | 3 | R.8.4 |
| V.5.4 | Errors linked to inputs | 2 | R.8.5, DS.6.3 |
| V.5.5 | Submit loading state; no double submission | 2 | R.8.6 |
| V.5.6 | `reset` after a successful save | 2 | R.8.7 |
| V.5.7 | Unsaved-changes guard | 2 | R.8.8 |
| V.5.8 | One form component for both modes | 2 | R.8.9 |
| V.5.9 | Immutable fields disabled | 2 | R.8.10 |
| V.5.10 | Presentational components do not fetch | 2 | R.4.1 |
| V.5.11 | Columns in a factory; actions cell separate | 2 | R.4.3, R.4.5 |
| V.5.12 | Create → edit via `replace` | 2 | R.4.7 |
| V.5.13 | Pending, empty, filtered-empty, and error states | 2 | R.4.8 |
| V.5.14 | Manual memo justified | 1 | R.4.2 |

## Stage 6 — Routing and permissions (30)

| # | Check | Pts | Rule |
|---|---|---|---|
| V.6.1 | Route declared statically; nothing routing-related fetched | 3 | R.5.1 |
| V.6.2 | Every URL string lives in `paths.ts` | 3 | R.5.2 |
| V.6.3 | Pages lazy-loaded | 2 | R.5.3 |
| V.6.4 | `RequireAuth` + `RequirePermission` on all routes | 4 | R.5.4, P.1 |
| V.6.5 | Operation routes gated by CREATE and UPDATE | 3 | R.5.5 |
| V.6.6 | Params named `<entity>Id`; `key` on the edit route | 2 | R.5.6, R.4.10 |
| V.6.7 | `errorElement` on every branch | 2 | R.5.7, R.10.6 |
| V.6.8 | List state in URL params | 3 | R.5.8 |
| V.6.9 | 403 / 404 outcomes match the fixed table | 2 | R.5.9 |
| V.6.10 | UI controls gated with `<Can>` | 3 | P.2 |
| V.6.11 | Handlers check permission first, then usage, then dialog | 3 | R.6.3, R.6.4 |

## Stage 7 — Quality, i18n, tests (15)

| # | Check | Pts | Rule |
|---|---|---|---|
| V.7.1 | Every user-facing string a translation key, in both languages | 3 | DS.3.1, DS.3.2 |
| V.7.2 | Logical direction utilities; RTL verified | 2 | DS.3.4 |
| V.7.3 | Icon-only controls labelled; focus visible; dialogs accessible | 2 | DS.6.2, DS.5.1, DS.5.4 |
| V.7.4 | Backend error codes mapped in both languages | 1 | R.10.3 |
| V.7.5 | Unit tests for schema and mapper | 2 | R.11.1 |
| V.7.6 | MSW contract tests for the API module | 2 | R.11.2 |
| V.7.7 | Integration tests for list and entry flows | 2 | R.11.4 |
| V.7.8 | Permission tests: granted, denied control, denied deep link | 1 | R.11.5 |

---

## Verdict scale (150 points)

| Score | Verdict |
|---|---|
| 138–150 | **EXEMPLARY** — production ready |
| 120–137 | **APPROVED** |
| 100–119 | **APPROVED WITH WARNINGS** — fix flagged items before merge |
| 75–99 | **NEEDS REVISION** |
| Below 75 | **REJECTED** |

## Automatic rejection triggers

Regardless of score:

| # | Trigger | Penalty | Rule |
|---|---|---|---|
| 1 | Token in `localStorage`, `sessionStorage`, or a readable cookie | −25 | R.9.1, SEC.1 |
| 2 | `useEffect` data fetching | −15 | R.3.1 |
| 3 | Server data, session, or permissions in `useState` or React Context | −15 | R.3.12, R.7.1 |
| 4 | `fetch` outside `lib/http` | −10 | R.2.1 |
| 5 | Any route missing `RequireAuth` or `RequirePermission` | −12 | R.5.4 |
| 6 | Operation route gated with the wrong action | −8 | R.5.5 |
| 7 | Route or menu item derived from an API response | −10 | R.5.1, AD-1 |
| 8 | Submit wired to a button's `onClick` | −10 | R.8.2 |
| 9 | Unsanitised `dangerouslySetInnerHTML` | −10 | SEC.2 |
| 10 | Dialog opened before the permission check | −6 | R.6.3 |
| 11 | Delete with no `canDelete` check | −6 | R.6.4 |
| 12 | Logout not clearing the query cache | −8 | R.9.7, SEC.9 |
| 13 | Duplicate pagination state outside the query key | −5 | R.3.4 |
| 14 | Inline query keys | −5 | R.3.3 |
| 15 | `navigate()` without `replace` after create | −4 | R.4.7 |
| 16 | Literal user-facing strings | −5 | DS.5 |
| 17 | Key missing from `ar` | −5 | DS.6 |
| 18 | Physical direction utilities | −5 | DS.7 |
| 19 | Immutable field editable in edit mode | −4 | R.8.10 |
| 20 | `\|\|` on a numeric mapping | −3 | R.1.8 |
| 21 | Query with no `staleTime` | −3 | R.3.5 |
| 22 | Toast or navigation inside a hook | −3 | R.3.11 |
| 23 | Page not lazy-loaded | −3 | R.5.3 |
| 24 | `any` in feature code | −3 | TS.2 |

Any trigger dropping the total below 75 → REJECTED.

## Cross-cutting gate checks (pass/fail, no points)

| # | Check | Compares |
|---|---|---|
| X.1 | DTO ↔ backend response | `*.types.ts` ↔ backend |
| X.2 | Schema ↔ DTO | `*.schema.ts` ↔ `*.types.ts` |
| X.3 | API paths ↔ controller mappings | `*Api.ts` ↔ backend |
| X.4 | Route permissions ↔ backend grant codes | `routes.tsx` ↔ backend catalogue |
| X.5 | Error codes ↔ backend codes | `mapBackendError` ↔ backend |
| X.6 | Translation keys ↔ JSX, both languages | `context/LanguageContext` ↔ components |
| X.7 | Immutability ↔ backend update contract | Both sides exclude the same fields |
| X.8 | Shared resources consumed, not duplicated | Feature ↔ `lib`, `components/ui` |

A single X failure triggers review regardless of score.

## How to run

```bash
npx tsc --noEmit
npx eslint src
rg -n "'/[a-z]" src/pages src/layout  # R.5.2 stray URL literals
npx vitest run
npx madge --circular src
npm audit --audit-level=high
```

Then run the enforcement skills for depth: `enforce-frontend-architecture` (50),
`enforce-state-management` (48), `enforce-permissions` (34), `enforce-ui-ux` (42),
`enforce-security` (34), `enforce-reusability` (28).

## Report format

```
FEATURE VALIDATION REPORT
=========================
Feature: <name>   Route: <path>   Date: <date>

STAGE 1 COMPLETENESS            [XX/15]
STAGE 2 MODELS & SCHEMA         [XX/15]
STAGE 3 API LAYER               [XX/20]
STAGE 4 SERVER STATE            [XX/25]
STAGE 5 FORMS & COMPONENTS      [XX/30]
STAGE 6 ROUTING & PERMISSIONS   [XX/30]
STAGE 7 QUALITY, I18N & TESTS   [XX/15]
SUBTOTAL                        [XX/150]
PENALTIES                       [-XX]
FINAL                           [XX/150]

REJECTION TRIGGERS: [list or NONE]

GATE CHECKS:
  X.1 DTO ↔ backend         [PASS/FAIL]
  X.2 Schema ↔ DTO          [PASS/FAIL]
  X.3 API ↔ controllers     [PASS/FAIL]
  X.4 Perms ↔ backend       [PASS/FAIL]
  X.5 Error codes mapped    [PASS/FAIL]
  X.6 i18n both languages   [PASS/FAIL]
  X.7 Immutability aligned  [PASS/FAIL]
  X.8 Shared code reused    [PASS/FAIL]

TOOLING: tsc [ ] eslint [ ] vitest [ ] madge [ ] audit [ ]

VERDICT: <scale>
REMEDIATION: [item — owning skill — file]
SCOPE NOTE: frontend authorization is UX. Backend enforcement is not assessed here.
```

## Related skills

| Skill | Depth |
|---|---|
| `enforce-frontend-architecture` | 50 structural checks |
| `enforce-state-management` | 48 ownership, render, and effect checks |
| `enforce-permissions` | 34 triple-enforcement checks |
| `enforce-ui-ux` | 42 design, i18n, accessibility, and motion checks |
| `enforce-security` | 34 security checks |
| `enforce-reusability` | 28 duplication checks |
