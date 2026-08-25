---
name: erp-priority-override
description: "PRECEDENCE RULE for the React ERP skill pack. Use whenever general React guidance (react.dev, vercel-labs/agent-skills, TanStack docs, community convention) appears to conflict with a project rule, when deciding whether a new React or library API is permitted, or when a reviewer cites an external best-practices doc to justify a deviation."
---

# Skill: erp-priority-override

## Description
Defines which guidance wins when two sources disagree, and how a new API is admitted.

## When to Use
- External guidance suggests a pattern a project rule forbids, or the reverse
- A reviewer cites an outside document to justify a deviation
- Deciding whether a newly stable React or library API may be used

## When NOT to Use
- No conflict exists — follow the specific skill
- Choosing between two options that are both compliant; that is design, not precedence
- Backend questions

---

## Precedence order

1. **Security and correctness.** Guidance that would create a security hole or data loss never wins. Escalate rather than apply.
2. **`references/architecture.md`** — the binding decisions AD-1 … AD-14.
3. **`references/contract-rules.md`** — the rule IDs.
4. **Skill-specific guidance** in this pack.
5. **General React guidance** — react.dev, `vercel-labs/agent-skills` (`react-best-practices`, `composition-patterns`, `web-design-guidelines`, `react-view-transitions`), TanStack, React Router, React Hook Form, and Zod documentation.
6. **Community convention.**

Tiers 5 and 6 are authoritative about React. This pack is authoritative about how this
project uses React.

## The three cases where general guidance wins

| # | Case | Example |
|---|---|---|
| O.1 | **Accessibility.** An accessible pattern beats a project style rule. | A layout rule that would remove a focus ring loses. |
| O.2 | **A documented footgun.** If official docs call a pattern unsafe, it is unsafe here. | Conditional hooks, mutating props, `useEffect` for derived state. |
| O.3 | **A measured performance defect.** A profiled regression beats a stylistic preference, and the fix cites the measurement (PERF.10). | Virtualizing a list that genuinely renders 500 rows. |

Outside O.1–O.3, the project rule wins.

## Resolution procedure

1. Apply the project rule.
2. Log one line in the PR description or generation report:
   `CONFLICT RESOLVED: <source> suggests <X>; rule <ID> requires <Y>. Applied <Y>.`
3. Do not interrupt the user to ask — apply and log.
4. Under O.1–O.3, invert and log:
   `OVERRIDE <O.n>: rule <ID> yields to <source> because <reason>. Applied <X>.`

## Standing resolutions

| External guidance | Project position | Rule |
|---|---|---|
| "Fetching in `useEffect` is fine for simple cases" | Never; all server reads use Query | R.3.1 |
| "Colocate the fetch in the component" | Only through a feature hook | R.3.10 |
| "Memoize aggressively" | Memoise for identity or measurement only, with the reason stated | R.4.2, PERF.5 |
| "Uncontrolled forms with `FormData` are simpler" | RHF + Zod, submitted via `handleSubmit` | R.8.1, R.8.2 |
| "React Context can hold fetched data" | Server data belongs to the QueryClient | R.7.1 |
| "Put toasts in the mutation hook" | Side effects at the call site | R.3.11 |
| "One global store keeps things simple" | One provider per concern; no state library | R.7.2, R.7.7 |
| "Store the JWT in localStorage" | In-memory access token, httpOnly refresh cookie | AD-4, R.9.1 |
| "Generate routes or menus from the API" | Static route tree; the backend supplies grants only | AD-1, AD-2 |
| "Hide the button; that secures it" | Frontend authorization is UX only | AD-6, SEC.11 |
| "Add a `utils/` folder" | No catch-all layers | AD-13 |
| "Axios is more convenient" | `fetch` behind one client | AD-8 |
| "Just add another boolean prop, it's one line" | Variant union or compound component past the second boolean | R.4.14, R.4.15 |
| "Derive it in a `useEffect` and store it in state" | Compute during render; an effect that only calls `setX(f(y))` is deleted | R.4.2, S.6.1 |

## Cross-reference: `vercel-labs/agent-skills`

Tier 5 is not applied blindly — some of its rule categories assume a stack this project does
not have (Next.js RSC/SSR). This table records what was adopted, what was judged
not-applicable and why, and which project skill carries the enforcement.

| Official category | Applies here? | Carried by |
|---|---|---|
| `react-best-practices` § Eliminating Waterfalls (`async-*`) | Yes — client-side fetch waterfalls are the same failure | R.3.7; `create-queries`, `create-api-client` |
| `react-best-practices` § Bundle Size Optimization (`bundle-*`) | Yes | PERF.1–4; `enforce-frontend-architecture` §5, `create-routing` |
| `react-best-practices` § Server-Side Performance (`server-*`) | **No** — RSC/`next/*`-specific; this is a Vite SPA with no server rendering | N/A |
| `react-best-practices` § Client-Side Data Fetching (`client-*`) | Partially — TanStack Query is this project's single client-cache layer and supersedes `client-swr-dedup`; `client-passive-event-listeners` still applies to raw DOM listeners | S.5.1–S.5.4; `create-queries` |
| `react-best-practices` § Re-render Optimization (`rerender-*`) | Yes | S.6.1–S.6.6 in `enforce-state-management` |
| `react-best-practices` § Rendering Performance (`rendering-*`) | Selectively — hydration-specific rules (`rendering-hydration-*`) do not apply without SSR | DS.11, DS.18, PERF.6; `create-components` |
| `react-best-practices` § JavaScript Performance (`js-*`) | Case-by-case, not a blanket gate | Cite as a measured defect under O.3, PERF.10 |
| `react-best-practices` § Advanced Patterns (`advanced-*`) | Case-by-case | "Admitting a new API" below |
| `composition-patterns` § Component Architecture | Yes | R.4.14, R.4.15; `create-components` Part 2.5 |
| `composition-patterns` § State Management (lift state, context interface, decouple implementation) | Yes — already this project's Context model | AD-7, AD-8; `create-app-state` |
| `web-design-guidelines` § Accessibility, Focus States, Forms | Yes | DS §5–6; `enforce-ui-ux` |
| `web-design-guidelines` § Animation | Yes | DS.18; `enforce-ui-ux` §7 |
| `web-design-guidelines` § Typography (non-breaking spaces, ellipsis character) | Partially — non-breaking spaces adopted (DS.17); the rest is a copy-editing convention, not a gate | DS.17; `enforce-ui-ux` §7 |
| `web-design-guidelines` § Navigation & State | Yes — this is `create-routing`'s founding rule | AD-1, AD-2, R.5.8 |
| `web-design-guidelines` § Locale & i18n | Yes | DS.10 (`Intl` formatting); this project drives locale from `LanguageContext`, not `Accept-Language`, because the toggle is an explicit in-app control (SH.3) |
| `react-view-transitions` | Allowed, opt-in | Standing calls table below; must respect `prefers-reduced-motion` (DS.11) |

## Admitting a new API or library

1. **Stable?** Experimental, canary, or RC → prohibited.
2. **Does it overlap an owned responsibility** in the architecture reference's ownership table? If yes, the existing owner wins unless the table is amended.
3. **Does it change state ownership or the security model?** If yes, it needs an amendment to `references/architecture.md`, not a local decision.
4. A new runtime dependency requires a row in the ownership table naming why it exists, where it may be used, and where it must not (SEC.10).

### Standing calls on React APIs

| API | Status | Condition |
|---|---|---|
| React Compiler | Not adopted | Targets React 19; revisit on upgrade (AD-14) |
| `useTransition`, `useDeferredValue` | Allowed | Filter and search responsiveness |
| `useOptimistic` | Allowed | Paired with a mutation that has rollback (R.3.14) |
| `useActionState`, `<form action>` | Restricted | Not on entry pages; acceptable in trivial non-entity forms |
| `use()` with a promise | Restricted | Only with a query declaring `staleTime`/`gcTime` |
| `useSuspenseQuery` | Allowed | Requires a matching error boundary (R.10.6) |
| Server Components | Not applicable | This is a Vite SPA |
| View Transitions | Allowed | Must respect `prefers-reduced-motion` (DS.11) |
| `useSyncExternalStore` directly | Restricted | React Context already wraps it; direct use only in `lib/` |
