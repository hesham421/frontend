---
name: enforce-reusability
description: "REUSABILITY ENFORCER — 28 checks detecting duplicated components, logic, and types across features: re-implemented UI, second HTTP wrappers, parallel type definitions, cloned formatters or permission helpers. Use after generating any layer, during review of a change that adds files, or when a concept appears to exist twice."
---

# Skill: enforce-reusability

## Description
Finds code that should have been imported instead of written, and places genuinely new
shared code correctly. Rules: `references/contract-rules.md` §SH;
`references/architecture.md` AD-13.

## When to Use
- After generating any layer — every `create-*` skill points here
- Reviewing a change that adds files
- The same concept appears to exist twice

## When NOT to Use
- Documented, deliberate divergence with a recorded reason
- Genuinely first-of-its-kind code — then the task is placing it, not blocking it

---

## The three questions

1. **Does an equivalent exist?** Check `components/ui`, `lib/`, `hooks/`, and sibling features.
2. **If something close exists, can it be extended?** Extend when the difference is a prop. Never copy.
3. **If it is new and a second feature will need it, does it belong in `lib/` or `components/ui` now?** Do not wait for the third copy.

Placement follows AD-13: `lib/` is organised by purpose (`lib/http`, `lib/format`,
`lib/errors`) — `auth/` is its own top-level folder, not under `lib/` (AD-4, AD-5). Creating
`lib/utils/` or `src/common/` to hold it is itself the violation.

## Section 1 — Component duplication (10)

| # | Do not build | Use |
|---|---|---|
| RU.1.1 | Any table or grid | `DataTable`, `TreeTable` |
| RU.1.2 | Pagination controls | `DataTable` state |
| RU.1.3 | Filter UI | `FilterBuilder` |
| RU.1.4 | Modal or drawer shell | `Shutter` |
| RU.1.5 | Toast system | `NotificationCenter` / `useToast()` |
| RU.1.6 | Empty or loading placeholder | `EmptyState`, `SkeletonLoader` |
| RU.1.7 | Form field wrappers | `TextField`, `NumberField`, `Select`, `MultiSelect`, `DatePicker`, `Label`, `SelectionControls` |
| RU.1.8 | Record picker | `LookupField` |
| RU.1.9 | Tabs, steps, breadcrumbs | `ErpTabs`, `Stepper`, `Breadcrumbs` |
| RU.1.10 | Buttons and menus | `Button`, `SplitButton`, `Fab` |

## Section 2 — Logic duplication (12)

| # | Do not write | Use |
|---|---|---|
| RU.2.1 | A second HTTP wrapper | `lib/http` |
| RU.2.2 | A local class-name joiner | `cx()` |
| RU.2.3 | Feature-local list types | `data/types.ts` |
| RU.2.4 | Ad-hoc backend error mapping | `mapBackendError()` |
| RU.2.5 | A local permission read | `perm()`, `usePermission()`, `<Can>` |
| RU.2.6 | Per-feature date or number formatters | `lib/format` |
| RU.2.7 | A second query key convention | the feature's `<entity>Keys` |
| RU.2.8 | A hand-rolled list state hook | `useErpList()` |
| RU.2.9 | A second translation lookup | `useLanguage()` |
| RU.2.10 | Copy-pasted confirm logic | `create-confirm-actions` + `useConfirmDialog()` |
| RU.2.11 | A local token or session read | `tokenStore`, `useSession()` |
| RU.2.12 | A second error normaliser | `normalizeError()` |

## Section 3 — Type duplication (6)

| # | Check |
|---|---|
| RU.3.1 | No two features define the same entity's DTO |
| RU.3.2 | Shared enums and unions defined once in `data/types.ts` |
| RU.3.3 | Option shapes reuse `SelectOption` |
| RU.3.4 | No parallel form-values type beside a Zod schema |
| RU.3.5 | Cross-feature types promoted to `lib/`, never imported feature-to-feature |
| RU.3.6 | Permission and page-code constants defined once per feature and exported |

---

## Detection recipes

```bash
rg -n "fetch\(" src --glob '!src/lib/http/*'                          # RU.2.1
rg -n "interface (PagedResponse|SearchRequest|SelectOption|FilterCondition)" src   # RU.2.3
rg -n "function (cn|classNames|clsx)\b" src --glob '!src/lib/utils.ts'  # RU.2.2
rg -n "<table|role=\"dialog\"" src/features                             # RU.1.1, RU.1.4
rg -n "permissions\.(has|includes)" src/features                        # RU.2.5
rg -n "toLocaleDateString|toFixed\(" src/features                       # RU.2.6
rg -n "queryKey:\s*\[" src/features | rg -v "Keys\."                    # RU.2.7
npx jscpd src --min-lines 12 --min-tokens 70                           # near-duplicates
```

## Escalation ladder

| Finding | Action |
|---|---|
| Exact duplicate of a shared resource | Reject; import instead |
| Near-duplicate differing by one prop | Reject; extend the shared component |
| Second occurrence of novel logic | Promote to `lib/`, refactor both call sites in the same change |
| First occurrence of obviously general logic | Place it in `lib/` now |
| Deliberate divergence | Allowed only with an inline comment naming the reason and the shared thing it departs from |

## Automatic rejection triggers

| # | Trigger | Rule |
|---|---|---|
| 1 | New table, modal, toast, or empty-state implementation | RU.1.x |
| 2 | `fetch` outside `lib/http` | RU.2.1 |
| 3 | Local class-name joiner | RU.2.2 |
| 4 | Feature-local list types | RU.2.3 |
| 5 | Permission or session read bypassing the helpers | RU.2.5, RU.2.11 |
| 6 | Feature-to-feature import | RU.3.5 |
| 7 | Two features defining the same DTO | RU.3.1 |
| 8 | New catch-all folder created to host shared code | AD-13 |

```
REUSABILITY REPORT
Feature: <name>     Date: <date>
S1 COMPONENTS [X/10]
S2 LOGIC      [X/12]
S3 TYPES      [X/6]
TOTAL: XX/28
DUPLICATES: [new symbol — existing resource — action]
VERDICT: APPROVED / APPROVED WITH WARNINGS / REJECTED
```

## Related skills
Every `create-*` skill ends by pointing here. Also `enforce-frontend-architecture`, `enforce-ui-ux`.
