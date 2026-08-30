---
name: enforce-frontend-architecture
description: "ARCHITECTURE ENFORCER — 50 checks on feature completeness, layer boundaries, import direction, naming, TypeScript rigor, and bundle hygiene. Use when reviewing a feature's structure, when a file's location or import looks wrong, or when deciding where new code belongs."
---

# Skill: enforce-frontend-architecture

## Description
Validates structure and boundaries. `enforce-state-management` asks who owns a piece of
state; this skill asks whether a file exists in the right place and may import what it
imports. Rules: `references/architecture.md` §3–4, `references/contract-rules.md` §TS, §PERF.

## When to Use
- Reviewing a whole feature
- A file's location or import direction looks wrong
- Deciding where new code belongs

## When NOT to Use
- Single-file changes inside an established layer
- Styling and copy → `enforce-ui-ux`
- Duplication → `enforce-reusability`
- Security → `enforce-security`

## Output
50-check report with file, rule, and required action.

---

## Section 1 — Feature completeness (12)

| # | Check |
|---|---|
| A.1.1 | `model/<entity>.types.ts` |
| A.1.2 | `model/<entity>.schema.ts` |
| A.1.3 | `api/<entity>Api.ts` |
| A.1.4 | `hooks/<entity>Keys.ts` |
| A.1.5 | `hooks/use<Entity>Queries.ts` |
| A.1.6 | `hooks/use<Entity>Mutations.ts` |
| A.1.7 | `columns/<entity>Columns.tsx` |
| A.1.8 | `components/<Entity>ActionsCell.tsx` |
| A.1.9 | `components/<Entity>Form.tsx` |
| A.1.10 | `pages/<Entity>ListPage.tsx` and `<Entity>EntryPage.tsx` |
| A.1.11 | `helpers/<entity>ConfirmActions.ts` where destructive actions exist |
| A.1.12 | Screen routed in `src/routes/routes.tsx` with its path in `paths.ts` |

## Section 2 — Layer boundaries (12)

| # | Check | Violation |
|---|---|---|
| A.2.1 | No React import in `api/` | `useState` in an api module |
| A.2.2 | No `fetch` outside `lib/http` | Bypassed client |
| A.2.3 | No component importing `api/` | Component calling an endpoint |
| A.2.4 | No hook importing a page or component | Upward import |
| A.2.5 | `components/` never calls a query hook | Data-fetching leaf |
| A.2.6 | No cross-feature imports | `../../other-feature/…` |
| A.2.7 | `components/ui` imports nothing from `modules/` or `hooks/` | Design system depending on a feature |
| A.2.8 | No circular imports | Cycle reported by `madge` |
| A.2.9 | Column factory imports the actions cell, not the reverse | Inverted dependency |
| A.2.10 | Types imported with `import type` | Runtime import of a type-only module |
| A.2.11 | No `utils/`, `common/`, `helpers/`, `shared/`, `misc/` at `src/` level; `lib/format` gains no new exports | Catch-all layer (AD-13) |
| A.2.12 | `lib/` modules do not import from `modules/` | Inverted foundation |

## Section 3 — Naming (10)

| # | Check |
|---|---|
| A.3.1 | Component files and exports PascalCase |
| A.3.2 | Non-component modules camelCase |
| A.3.3 | Hooks prefixed `use` |
| A.3.4 | Types PascalCase with a meaningful suffix (`Dto`, `Request`, `FormValues`) |
| A.3.5 | Domain and feature folders kebab-case |
| A.3.6 | Pages named `<Entity>ListPage` / `<Entity>EntryPage` |
| A.3.7 | Default export only on lazy page components; named exports elsewhere |
| A.3.8 | Key factory named `<entity>Keys`; api object `<entity>Api` |
| A.3.9 | Route params named `<entityCamel>Id` |
| A.3.10 | Constants UPPER_SNAKE in a `constants.ts` beside their owner |

## Section 4 — TypeScript (10)

| # | Check | Rule |
|---|---|---|
| A.4.1 | `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax` on | TS.1 |
| A.4.2 | No `any` | TS.2 |
| A.4.3 | No non-null assertion outside a guarded branch | TS.3 |
| A.4.4 | No `@ts-ignore`; `@ts-expect-error` carries a reason | TS.4 |
| A.4.5 | Reused props interfaces named and exported | TS.5 |
| A.4.6 | Discriminated unions over optional-field soup | TS.6 |
| A.4.7 | Type guards are tested predicates | TS.7 |
| A.4.8 | No unsafe cast across the API boundary | TS.8 |
| A.4.9 | Errors typed through `ApiError` and its `kind` | TS.9 |
| A.4.10 | `as const` on key factory tuples; generics constrained | TS.11 |

## Section 5 — Bundle and runtime (6)

| # | Check | Rule |
|---|---|---|
| A.5.1 | Pages lazy per route | PERF.1 |
| A.5.2 | Heavy widgets dynamically imported | PERF.2 |
| A.5.3 | Icons are `ti ti-<name>` webfont classes, no second icon package | PERF.3 |
| A.5.4 | No barrel chain defeating tree-shaking | PERF.4 |
| A.5.5 | Every `useMemo`/`useCallback`/`memo` carries a justification comment | PERF.5 |
| A.5.6 | Server-side pagination; virtualization only above 200 rendered rows | PERF.6 |

---

## Automatic rejection triggers

| # | Trigger | Rule |
|---|---|---|
| 1 | `fetch` outside `lib/http` | A.2.2 |
| 2 | Component importing `api/` | A.2.3 |
| 3 | Cross-feature import | A.2.6 |
| 4 | `components/ui` importing a feature | A.2.7 |
| 5 | Circular import | A.2.8 |
| 6 | New catch-all folder, or a new export in `lib/format` | A.2.11 |
| 7 | `any` in application code | A.4.2 |
| 8 | Relaxed compiler options | A.4.1 |
| 9 | Page not lazy-loaded | A.5.1 |
| 10 | Memoisation applied by reflex, with no stated reason | A.5.5 |
| 11 | Screen unreachable, or a URL literal outside `paths.ts` | A.1.12, R.5.2 |

## Cross-cutting alignment (gate checks — pass/fail)

| # | Check | Compares |
|---|---|---|
| X.1 | DTO ↔ backend response contract | `*.types.ts` ↔ backend |
| X.2 | Schema ↔ DTO | `*.schema.ts` ↔ `*.types.ts` |
| X.3 | API paths ↔ backend controller mappings | `*Api.ts` ↔ backend |
| X.4 | Route permissions ↔ backend grant codes | `routes.tsx` ↔ backend permission catalogue |
| X.5 | Error codes ↔ backend codes | `mapBackendError` ↔ backend |
| X.6 | Translation keys ↔ JSX, in both languages | `context/LanguageContext` ↔ components |
| X.7 | Immutability ↔ backend update contract | Same fields excluded both sides |
| X.8 | Shared resources consumed, not duplicated | Feature ↔ `lib`, `components/ui` |

A single X failure triggers review regardless of the numeric score.

## How to run

```bash
find src/features/<domain>/<feature> -type f | sort        # Section 1
rg -n "^import .*(from '\.\./\.\./)" src/features          # A.2.6 cross-feature
rg -n "fetch\(" src --glob '!src/lib/http/*'              # A.2.2
rg -n ": any|as any|@ts-ignore" src                        # A.4.2, A.4.4
rg -n "from ['\"](lucide|@heroicons|react-icons|@mui/icons)" src   # A.5.3 — second icon package introduced
npx madge --circular src                                   # A.2.8
npx tsc --noEmit                                           # A.4.x
rg -n "PATHS\." src | wc -l; rg -n "'/[a-z]" src/pages src/layout   # X.4, R.5.2
```

```
ARCHITECTURE REPORT
Feature: <name>            Date: <date>
S1 COMPLETENESS      [X/12]
S2 BOUNDARIES        [X/12]
S3 NAMING            [X/10]
S4 TYPESCRIPT        [X/10]
S5 BUNDLE & RUNTIME  [X/6]
TOTAL: XX/50
AUTOMATIC REJECTION: YES/NO
CROSS-CUTTING X.1–X.8: [PASS/FAIL each]
VIOLATIONS: [file — rule — action]
VERDICT: APPROVED / APPROVED WITH WARNINGS / REJECTED
```

## Related skills
`enforce-state-management` · `enforce-permissions` · `enforce-security` · `enforce-reusability` · `validate-frontend-feature`
