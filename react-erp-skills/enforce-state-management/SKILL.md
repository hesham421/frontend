---
name: enforce-state-management
description: "STATE ENFORCER — 48 checks that server state lives in TanStack Query, form state in React Hook Form, list state in the URL, session in one query, and UI state in React Context, with no duplicated sources of truth, plus render and effect hygiene. Use when reviewing hooks, stores, or pages, or when diagnosing stale data, flicker, duplicate requests, unnecessary re-renders, or state leaking between routes."
---

# Skill: enforce-state-management

## Description
Validates state ownership. Every piece of state has one owner; this skill finds the ones
with two. Rules: `references/architecture.md` AD-5, AD-7; `references/contract-rules.md`
§R.3, §R.7, §R.8, §R.9.

## When to Use
- Reviewing hooks, stores, or pages
- Diagnosing stale data, table flicker, duplicate requests, cross-route leakage

## When NOT to Use
- File layout → `enforce-frontend-architecture`
- Visual and i18n → `enforce-ui-ux`
- Permission wiring → `enforce-permissions`

---

## Section 1 — Ownership (12)

| # | Check | Pass criteria |
|---|---|---|
| S.1.1 | Server reads via Query | No `useEffect` + api call |
| S.1.2 | Writes via mutation | No `await api.*` in a handler |
| S.1.3 | No server data in `useState` | No state seeded from query data |
| S.1.4 | No server data in a Context provider | Providers hold cross-cutting client state only |
| S.1.5 | No `loading` / `error` mirrors | UI reads `isPending` / `isError` |
| S.1.6 | Form state owned by RHF | No `useState` per field |
| S.1.7 | List state in the URL | Page, size, sort, filters in search params |
| S.1.8 | Derived values computed | No stored derivation |
| S.1.9 | Session fetched once; Context is a read surface over it, not a second copy |
| S.1.10 | Token outside React entirely | Not in state, Context, or storage |
| S.1.11 | No prop-drilled global state | Cross-tree state in a provider |
| S.1.12 | One provider per concern, value memoised | No god provider, no unmemoised value |

## Section 2 — Query keys and pagination (8)

| # | Check |
|---|---|
| S.2.1 | Key factory exists with `all` / `lists` / `list` / `details` / `detail` / `usage` |
| S.2.2 | No literal query key outside the factory |
| S.2.3 | Full `SearchRequest` in the list key |
| S.2.4 | No `useState(page)` beside a list query |
| S.2.5 | `placeholderData: keepPreviousData` on paged lists |
| S.2.6 | Default sort declared in the initial request |
| S.2.7 | Keys hierarchical — `list()` extends `lists()` extends `all` |
| S.2.8 | Child keys scoped by parent id |

## Section 3 — Query and mutation configuration (10)

| # | Check |
|---|---|
| S.3.1 | `staleTime` explicit on every query |
| S.3.2 | `gcTime` explicit on every query |
| S.3.3 | Usage queries at `staleTime: 0` |
| S.3.4 | `signal` forwarded from `queryFn` |
| S.3.5 | `enabled` guards optional params |
| S.3.6 | Mutations `retry: false`; read retry only in QueryClient defaults |
| S.3.7 | Invalidation by factory key |
| S.3.8 | No toast, navigation, or dialog inside a hook |
| S.3.9 | Detail cache primed after create and update |
| S.3.10 | Optimistic mutations have cancel, snapshot, rollback, and settle |

## Section 4 — Child collections and freshness (6)

| # | Check |
|---|---|
| S.4.1 | Local append on child create |
| S.4.2 | Local map on child update |
| S.4.3 | Local filter on child delete |
| S.4.4 | Usage invalidated after child create |
| S.4.5 | Usage invalidated after child delete |
| S.4.6 | Child queries independently keyed with their own pending state |

## Section 5 — Cache discipline (6)

The QueryClient is the application's cache and its use is mandatory. What this section
forbids is a **second** cache for the same data — every hand-rolled alternative below exists
because someone re-solved a problem the QueryClient already solves.

| # | Check |
|---|---|
| S.5.1 | No `Map` or object cache holding server data |
| S.5.2 | No `useState` mirror of query data |
| S.5.3 | No custom TTL via `setTimeout` or `Date.now()` |
| S.5.4 | No manual request dedupe |
| S.5.5 | `QueryClient` instantiated once, at module scope |
| S.5.6 | Cache cleared on logout |

## Section 6 — Render and effect hygiene (6)

Ownership (Section 1) asks whether a piece of state belongs to Query, RHF, the URL, or a
Context provider. Once it is in the right owner, these checks catch the pattern most likely
to cause it to re-render, go stale, or run in an effect that should have been a plain
computation — the concerns `vercel-labs/agent-skills`' `react-best-practices` groups under
`rerender-*`.

| # | Check | Pass criteria |
|---|---|---|
| S.6.1 | Derived values computed during render, not synced via an effect | No `useEffect` that only calls `setX(deriveFromY(y))` |
| S.6.2 | Consumers subscribe to a derived boolean, not the raw value it's computed from | `const isFull = count >= max` read once, not `count` re-read by five components |
| S.6.3 | `setState` updaters use the functional form when the next value depends on the previous one | `setCount((c) => c + 1)`, not `setCount(count + 1)` inside a stable callback |
| S.6.4 | Effect dependency arrays list primitives, not fresh objects or arrays recreated every render | `[userId, filterId]`, not `[filters]` where `filters` is a new object each render |
| S.6.5 | Hooks with independent triggers are separate hooks, not one combined hook re-running both on either's change | `useDebounce(query)` and `usePermissions()` stay apart |
| S.6.6 | No component defined inside another component's body | `List.tsx` never declares `function Row() { … }` inside `List` |

---

## Automatic rejection triggers

| # | Trigger | Rule |
|---|---|---|
| 1 | `useEffect` data fetching | S.1.1 |
| 2 | Server data in `useState` or a Context provider | S.1.3, S.1.4 |
| 3 | Session or grants duplicated into a second source | S.1.9 |
| 4 | Token in state, Context, or storage | S.1.10 |
| 5 | `useState(page)` beside a list query | S.2.4 |
| 6 | Inline query key | S.2.2 |
| 7 | Query with no `staleTime` | S.3.1 |
| 8 | Toast or navigation inside a hook | S.3.8 |
| 9 | Optimistic update with no rollback | S.3.10 |
| 10 | Full list refetch after one child mutation | S.4.1–S.4.3 |
| 11 | Usage not invalidated after a child mutation | S.4.4, S.4.5 |
| 12 | A second cache for the same data | S.5.1, S.5.2 |
| 13 | `new QueryClient()` in a component body | S.5.5 |
| 14 | Logout leaving the cache populated | S.5.6 |
| 15 | A component defined inside another component's render body | S.6.6 |

## Diagnostic patterns

**Table flickers and scrolls to top after saving a child row** → full refetch instead of
`setQueryData` (S.4.1–S.4.3).

**Delete stays enabled on a record that has children** → usage never invalidated, or usage
has a non-zero `staleTime` (S.3.3, S.4.4).

**Page resets when a filter changes, or filters reset when paging** → pagination duplicated
outside the query key, or the filter handler forgetting `page: 0` (S.2.3, S.2.4).

**Two identical requests on mount** → a `useEffect` fetch double-invoked by StrictMode.
Remove the effect; Query handles StrictMode correctly (S.1.1).

**Stale form values when moving between records** → no `key` on the edit route (R.4.10).

**Loading spinner never clears after an error** → a mirrored `loading` boolean (S.1.5).

**The menu shows a screen the user cannot open** → nav item permission differs from the route's,
or the menu is not filtered by grants (P.6).

**Previous user's data visible after switching accounts** → cache not cleared on logout
(S.5.6).

**A row's input loses focus on every keystroke** → the row (or its cell editor) is a
component defined inside its parent's render body, so it gets a new identity — and remounts —
on every parent render (S.6.6).

**A filter panel re-renders every list consumer on every keystroke** → the panel's callers
subscribe to the raw filter object instead of a derived boolean or memoised slice they
actually use (S.6.2).

## How to run

```bash
rg -n "useEffect\(" src/features | rg -B2 "api\.|fetch"   # S.1.1
rg -n "queryKey:\s*\[" src/features | rg -v "Keys\."      # S.2.2
rg -n "useState\(" src/features                            # classify each hit
rg -n "staleTime" src/features                             # compare against useQuery count
rg -n "toast\.|navigate\(" src/features/*/hooks.ts        # S.3.8
rg -n "localStorage|sessionStorage" src                   # S.1.10
rg -n "useEffect\(\(\) => \{\s*set[A-Z]" src/features      # candidate S.6.1 sync-to-state effects
rg -n "^\s+function [A-Z]" src/features --glob '*.tsx'    # candidate S.6.6 nested component defs
```

```
STATE MANAGEMENT REPORT
Feature: <name>          Date: <date>
S1 OWNERSHIP         [X/12]
S2 KEYS & PAGINATION [X/8]
S3 CONFIGURATION     [X/10]
S4 CHILD & FRESHNESS [X/6]
S5 CACHE DISCIPLINE  [X/6]
S6 RENDER & EFFECTS  [X/6]
TOTAL: XX/48
AUTOMATIC REJECTION: YES/NO
VIOLATIONS: [symbol — file:line — rule]
VERDICT: APPROVED / APPROVED WITH WARNINGS / REJECTED
```

## Alignment with `vercel-labs/agent-skills`

Section 6 is this project's application of `react-best-practices`' Re-render Optimization
category (`rerender-derived-state`, `rerender-derived-state-no-effect`,
`rerender-functional-setstate`, `rerender-dependencies`, `rerender-split-combined-hooks`,
`rerender-no-inline-components`). The rest of that category — `rerender-memo`,
`rerender-lazy-state-init`, `rerender-use-deferred-value`, `rerender-transitions` — is a
per-callsite judgement call made where the state actually lives (`create-components`,
`create-queries`), not a project-wide gate, so it is not duplicated here.

## Related skills
`create-queries` · `create-app-state` · `create-forms` · `create-auth-session` · `validate-frontend-feature`
