# ORG Module — Skill-Compliance Fix-up Session Report

**Not a formal execution-state.json phase** — a targeted fix-up dispatched per
the handover document after the original 30-session ORG build (F1→ALIGN-FE)
was found to have completed without ever reading this repo's skill files.
Two concrete violations were named for correction: `enforce-permissions`
Layer 3 (Task 1) and `create-forms` R.8.1 (Task 2). Both are now closed
across all 7 ORG entity pages under `src/pages/Organization/`. Every sub was
dispatched as its own sequential Claude Code session, one page at a time,
per the amended `governance/.claude/commands/orchestrate-module.md`
discipline; every diff was verified independently (`git status --short`,
`git diff` on the touched file, `npx tsc --noEmit`) before moving to the
next page.

---

## Task 1 — `enforce-permissions` Layer 3

**Before:** all 7 pages had Layer 1 (route guard, F4) and Layer 2 (UI hiding,
SEC-FE) correctly in place, but every save/deactivate handler ran the mock
store's mutation immediately — no `can()` check inside the handler itself.
A stale render or a direct console call could still fire a write with no
permission behind it. Same gap independently confirmed pre-existing in
`src/pages/Security/Roles.tsx` (`handleSave`, `handleConfirmToggle`),
establishing this as a platform-wide pattern the whole app never implemented,
not an ORG-specific miss.

**After:** every page's save handler and deactivate-confirm handler now
opens with a `can()`/`canEdit`/`canSaveDrawer`-equivalent check as its first
statement, `return;`ing with no new UI on failure (Layer 2 already prevents
the normal-case UX from reaching this path — this is defense-in-depth for a
stale render or direct call, matching the skill's own framing of what Layer
3 is for).

| Page | Save handler | Deactivate handler |
|---|---|---|
| LegalEntities.tsx | `handleSave` — `if (!canSaveDrawer) return;` | `handleConfirmDeactivate` — `if (!canEdit) return;` |
| Branches.tsx | same pattern | same pattern |
| Regions.tsx | same pattern | same pattern |
| LocationSites.tsx | same pattern | same pattern |
| ProfitCenters.tsx | same pattern | same pattern |
| Departments.tsx | `handleSaveForm` — guard right after `e.preventDefault()` | `handleConfirmDeactivate` — `if (!canEdit) return;` |
| CostCenters.tsx | same tree pattern as Departments | same pattern |

Nothing about which buttons are shown/hidden changed — Layer 2 was already
correct from SEC-FE and was left untouched. `Roles.tsx` was **not** touched —
it was cited only as evidence the gap is platform-wide; fixing it was out of
this handover's stated scope (ORG's 7 pages only).

---

## Task 2 — `create-forms` R.8.1 (useState per field, unwired schemas)

**Scope decision (user-confirmed before any code was written):** reduced
compliance — React Hook Form + `zodResolver` wiring the existing F3-built
`{entity}.schema.ts` files, with server-error mapping (`setError`/
`root.serverError`) and the `useBlocker` unsaved-changes guard explicitly
**out of scope** (this app has no router, and the mock store has no real
mutation error shape to map from). A dedicated `<Entity>FormMapper` class
(skill's `createEmpty()`/`fromDto()` pattern) was also treated as out of
scope — no such infrastructure exists anywhere in this codebase yet, and
building it for 7 entities was not part of the approved scope; inline
default/reset objects were used instead.

**Before:** all 7 pages held one `useState` per form field — R.8.1's named
automatic-rejection trigger. The F3-built Zod schemas (`createXSchema`/
`updateXSchema` per entity) were never imported anywhere.

**After:** all 7 pages use `useForm` + `zodResolver`, mode-dependent between
each entity's `createXSchema` (create) and `updateXSchema` (edit), wired via
RHF `Controller` (not `register` — this codebase's `Input`/`Select` are
controlled components without `forwardRef`, so `register`'s ref-based
reading would silently fail; `Controller` was used throughout instead).

**New dependency added:** `react-hook-form` + `@hookform/resolvers` (neither
existed in this project before this session) — `package.json` /
`package-lock.json` updated, confirmed resolving correctly via a full
`npm run build`.

### A real, load-bearing gap the schema-wiring work surfaced

The F3 schemas were written against the **real backend contract** — several
FK fields (`legalEntityFk`, `branchFk`, `parentDepartmentFk`,
`parentCostCenterFk`) are typed `z.number()`. But every page's mock store
(`useOrganizationStore`) represents these same FKs as **string** mock ids
(`'le-1'`, `'br-1'`, …). Wiring the schemas as-is would have made every
create/edit submission on an FK field fail validation permanently — a
regression, not a fix. Resolved with page-local derived schemas (`.extend({
fk: z.string()... })`, never touching the shared schema files) on:
`Branches.tsx`, `LocationSites.tsx`, `ProfitCenters.tsx`, `Regions.tsx`,
`Departments.tsx`, `CostCenters.tsx`.

`Regions.tsx` had a second, sharper version of the same class of gap:
`createRegionSchema` requires `regionTypeIdFk`, but the page has never had a
picker for it (FINDING-2/OQ-ORG-002, deferred — no listing endpoint exists).
Validating against the schema as-is would have made the create flow
permanently unsubmittable. Resolved with `.omit({ regionTypeIdFk: true })`
on the page-local schema; the existing read-only `regionTypeNameEn` display
was left untouched, and the pre-existing comment explaining why
`regionTypeIdFk` is omitted from the save payload was preserved.

The two tree pages (`Departments.tsx`, `CostCenters.tsx`) had the same
FK-omission pattern for `branchFk` (collected from a separate filter
`<Select>`, never a form field) plus a `parentDepartmentFk`/
`parentCostCenterFk` override (`z.number().optional()` in the schema →
`z.string().nullable().optional()` locally, matching the mock's `string |
null` shape). Both pages also had a `useEffect` reactively syncing form
state to the tree-selection/creation-mode — the exact
fetch-then-sync anti-pattern the skill's Step 1 warns against. Both were
removed and replaced with explicit `form.reset(...)` calls inside the three
transition handlers (`handleSelectNode`, `handleStartAddChild`,
`handleStartAddRoot`) instead.

### Skill items handled beyond the minimum

- **Enter-to-submit (R.8.13):** every multi-field form now prevents Enter
  from submitting mid-form — `onKeyDown` guards on every field except the
  true last one, which keeps native Enter-submits behavior. Caught and fixed
  as a follow-up on the reference implementation (`LegalEntities.tsx`)
  before it was replicated to the other 6.
- `noValidate` on every form tag (missed on the first pass of
  `Departments.tsx`, caught and fixed in a follow-up before moving to
  `CostCenters.tsx`).
- Cancel buttons explicitly `type="button"` everywhere (one page,
  `CostCenters.tsx`, had an unmarked Cancel button that would have submitted
  the form by default — fixed as part of the migration).

### Explicitly out of scope / unresolved, named per item

- Server-error mapping, `useBlocker` — per the confirmed scope decision.
- A `FormMapper` class per entity — per the confirmed scope decision.
- R.8.12 (validation messages as translation keys) — the F3 schema files'
  messages are English literals (`'Arabic name is required.'`, etc.); this
  is a pre-existing, separate gap in the F3-built schema files themselves,
  not introduced or fixed by this session.
- `aria-describedby` wiring is whatever the shared `Input`/`Select`
  components in `src/components/ui/FormControls.tsx` already do internally
  — not independently re-verified or extended in this session (those
  components were not modified).

---

## Verification performed

- `npx tsc --noEmit` — clean after every single sub (14 dispatches total: 7
  for Task 1, 7 + 2 short follow-ups for Task 2).
- `npm run build` — full production build succeeded at the end of the
  session (180 modules, no errors, one pre-existing chunk-size advisory
  unrelated to this work).
- `git status --short` / `git diff` on each touched file, checked against
  each dispatched agent's own report before the next dispatch — no
  cross-file drift, no file touched outside its own sub's stated scope.
- No `git commit` made at any point in this session, per instructions.

## Files touched this session

`src/pages/Organization/{LegalEntities,Branches,Regions,LocationSites,
ProfitCenters,Departments,CostCenters}.tsx`, `package.json`,
`package-lock.json`. No schema file (`src/*/​*.schema.ts`), the mock store
(`useOrganizationStore.ts`), `mockData.ts`, or any file from a prior ORG
phase was modified.
