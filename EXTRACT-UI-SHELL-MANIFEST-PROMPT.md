# Extract UI Shell Manifest — for Execution Plan Frontend (P3.2)

## Role

You are extracting a COMPACT, STRUCTURED SUMMARY of an already-built UI
Shell (real React components + routing, built by Claude Code after
mockup approval, confirmed at `GATE: UI SHELL COMPLETE`) — for one
module, into ONE file that gets attached to the "Execution Plan —
Frontend" (Project 3.2) Claude Project session.

You are NOT modifying any code. You are NOT judging whether the Shell
is correct or complete — that's P3.2's job (F1 confirms, F4
documents+integrates), using what you extract here as its primary
input. Every claim you write must trace to a real file you actually
read — if something is ambiguous or you can't determine it confidently,
say so explicitly rather than guessing.

**Why this exists:** P3.2 needs the real UI Shell as an attachable
input, but the Shell's actual source files are often too large/numerous
to upload wholesale into a chat session. This manifest is the condensed
substitute — everything F1 (model confirmation) and F4 (routing/
component documentation) actually need, nothing else.

---

## Input

```
MODULE : module code, e.g. FIN, ORG
```

If not specified, ask before doing anything.

---

## Step 0 — Precondition check

```
Confirm before scanning:
  □ GATE: UI SHELL COMPLETE is confirmed for this module (human
    sign-off already recorded — check frontend/governance/modules/
    [MODULE]/execution-state.json if it exists, or ask if uncertain)
  □ frontend/src/features/[module-kebab]/ actually exists and contains
    real files (not an empty scaffold)
```

If either is unclear, state that plainly and ask before proceeding —
extracting a manifest from an incomplete or unconfirmed Shell would
hand P3.2 a false "this is final" signal.

---

## Step 1 — Scan the module's UI Shell source

```bash
find frontend/src/features/[module-kebab] -type f \( -name "*.tsx" -o -name "*.ts" \) | sort
```

Read every file found. For each, extract only what's listed in Step 2
— do not paraphrase implementation logic, do not describe styling, do
not comment on code quality.

---

## Step 2 — Extract, per category

### 2.1 — Component inventory
For every `.tsx` file that exports a component:
```
Component name : [exact export name]
File path      : [relative to frontend/src/]
Type           : [Page component (route-mounted, "Page" suffix) /
                  reusable presentational component]
Props accepted : [prop names + types, from the component's own type
                  signature — exact, not inferred]
Renders        : [one line — what it structurally contains, e.g.
                  "search filters + results table" — not styling detail]
```

### 2.2 — Route inventory
From the module's route config file (`[module-kebab].routes.tsx` or
equivalent):
```
Route path     : [exact path string]
Component      : [which Page component it mounts]
Guard present  : [Yes — <ProtectedRoute .../> already wired /
                  No — not yet wired, this is a gap for F4 to flag]
Child routes   : [list, if any]
```
Preserve the exact route declaration ORDER found in the file — this
matters for F4-RULE-1 (tree routes before `/:id/*` routes) and is
something P3.2 needs to verify, not assume.

### 2.3 — Existing TypeScript models/interfaces
For every `interface`/`type` declaration used by this module's
components (whether in a dedicated models file or inline):
```
Name    : [exact type name]
Fields  : [field name : type, for every field]
Source  : [file path where declared]
```
This is the PRIMARY input F1 uses to confirm against real API Docs —
extract it completely and exactly, field by field. Do not summarize
or abbreviate a type's shape.

### 2.4 — Data source used (dummy/static vs none)
For every place a component currently gets its data:
```
Component      : [name]
Data source    : [hardcoded array literal / imported mock JSON file /
                  empty placeholder / no data binding at all]
Shape observed : [if a concrete example exists, note the shape briefly
                  — this is a hint for F1, not authoritative]
```

### 2.5 — Anything NOT found (explicit gaps)
State plainly if any of the following are absent — these are exactly
the "integration gaps" F4 is supposed to flag and add, so knowing
they're missing up front is valuable, not a failure of this extraction:
```
- No route guard wired on any route
- No models/interfaces defined at all (Shell built with inline `any`
  or untyped props)
- No routing file found (routes declared ad hoc elsewhere, or missing)
```

---

## Step 3 — Produce the manifest file

Write ONE file: `shell-manifest-[MOD].md`

```markdown
# UI Shell Manifest — [MODULE]
Extracted: [date]
Source: frontend/src/features/[module-kebab]/
GATE: UI SHELL COMPLETE confirmed: [Yes / Unconfirmed — see Step 0 note]

## Components
[Section 2.1 output, one block per component]

## Routes
[Section 2.2 output, in file-declaration order]

## Existing Models/Interfaces
[Section 2.3 output, one block per type]

## Data Sources (pre-integration)
[Section 2.4 output]

## Gaps (not found — expected integration work for P3.2 F4)
[Section 2.5 output — "None found" if genuinely nothing is missing,
but double-check before writing that; a Shell with zero gaps is unusual]
```

---

## Step 4 — Report

```
══════════════════════════════════════════════════════
UI SHELL MANIFEST EXTRACTED — [MODULE]
══════════════════════════════════════════════════════
Components found     : [N]  ([N] Page, [N] reusable)
Routes found          : [N]
Models/interfaces found : [N]
Guards already wired   : [N] / [N] routes
Gaps flagged           : [N]

Output: shell-manifest-[MODULE].md

Next step: attach this file — alongside flow-diagram.md, ui-ux-spec.md,
real API Docs, and srs.md — to the Execution Plan — Frontend (Project
3.2) Claude Project session.
══════════════════════════════════════════════════════
```

---

## Constraints (NON-NEGOTIABLE)

- NEVER modify any file under `frontend/src/` — read-only extraction
- NEVER invent a component, route, or field that isn't actually in the
  code — if something looks incomplete, report it as a gap, don't fill it in
- NEVER judge or improve the Shell's structure — describe what exists,
  nothing more
- NEVER skip Step 0's precondition check — a manifest from an
  unconfirmed Shell must be labeled as such, not presented as final
- NEVER omit a field from an extracted type's shape — F1's confirmation
  against real API Docs depends on completeness here; a missing field
  in the manifest could hide a real mismatch
- If the module's `features/` folder doesn't exist at all, say so
  plainly and stop — do not produce an empty or speculative manifest
