# Generate Frontend Module Setup

```
Lives at   : frontend/governance/.claude/commands/generate-frontend-module-setup.md
Invokes    : frontend/governance/governance-tools/agent1_create_structure.py,
             agent2_archive.py, agent3_splitter.py — these tools know
             ONLY the frontend. There is no track concept here; this
             file and the tools it calls have no representation of
             "backend" anywhere except the two sanctioned reads noted below.
```

## Your Task

Scan this repo for the specified module and generate three files:
1. `.claude/commands/execute-frontend.md` — implementation phase execution
2. `.claude/commands/execute-frontend-test.md` — test phase execution,
   gated on execute-frontend.md's phases
3. `execution-state.json` — state tracker for both

Both generated commands reference `TEST-EXECUTION-AGENT.md` for MCP
boundaries and the failure taxonomy — shared across modules, not
regenerated per module.

**The two sanctioned cross-repo reads** (nothing else ever reaches into
`backend/governance/`):
```
1. ../backend/governance/governance-tools/modules-registry.json
   — read-only, to validate the module actually exists. This repo
   never registers a module itself.
2. ../backend/governance/modules/[MODULE]/api-docs/
   — real API Docs, used during execution (STEP 1.5)
```

---

## Input

```
$ARGUMENTS = MODULE
```

If missing, ask for it — do not guess.

**Module validation (the only identity check — no module is ever**
**named or excluded by this file itself):**
```bash
grep -q "\"$MODULE\"" ../backend/governance/governance-tools/modules-registry.json \
  && echo "found" || echo "not found"
```
If not found: stop with a plain "module not registered" message and
explain that registration only happens in the backend toolset. There
is no auto-register option here, and no other module-specific check
anywhere in this file — a module that was never registered is simply
unreachable, for any module, by construction.

---

## Precondition gate (readiness, not identity — checked only after
## the module validation above passes)

```
╔══════════════════════════════════════════════════════════════════╗
║   FRONTEND READINESS GATE                                         ║
╠════════════════════════════════════╦═══════════════════════════════╣
║ GATE: BACKEND MODULE COMPLETE      ║ [Yes / No]                    ║
║ (backend 100% implemented + real   ║                                ║
║  API Docs + UI/UX approved)        ║                                ║
║ GATE: UI SHELL COMPLETE confirmed  ║ [Yes / No]                    ║
║ frontend-execution-plan.md exists  ║ [Yes / No]                    ║
║ with Gate ALIGN-FE ✓               ║                                ║
╚══════════════════════════════════════════════════════════════════╝
```

If all three are Yes: proceed to Step 1 directly.

If any is No: offer a documented-override path — this exists for any
module with a real, working backend but missing formal upstream
artifacts (a readiness gap, not an identity question):

```
This module doesn't meet the standard readiness gate. Does it have a
real, working backend already, with formal artifacts missing only
because they were never generated for it?

  1) Yes — documented override (one question, then proceed immediately)
  2) No — stop here, complete the standard flow first
```

If (2): stop, state exactly which precondition is missing.

If (1): ask exactly one follow-up question — a one-line reason — then
append to `../backend/governance/modules/[MODULE]/frontend-gate-overrides.json`
(create with `"overrides": []` if absent; always append, never overwrite):
```json
{
  "date": "[actual current date]",
  "module": "[MODULE]",
  "gates_bypassed": ["list the No/unconfirmed items above"],
  "reason": "[user's exact one-line answer]",
  "decided_by": "user (documented override)"
}
```
Confirm the log was written, then proceed straight to Step 1 — no
further questions or warnings this session.

---

## Step 1 — Scan the repo structure

```bash
find governance/modules/$MODULE/packages/frontend-execution -type f -name "*.md" | sort
find governance/modules/$MODULE/packages/frontend-test -type f -name "*.md" | sort
```

Identify PHASES, SUBs (per file, excluding `index.md`), preserving
filesystem sort order. Read each sub's first 40 lines, count tasks.

Expected phases, in strict order (only include ones actually present):
```
F1 → F2 → F3 → F4 → SEC-FE → ALIGN-FE
```

### Test phase (single phase — no MARK-level split)

`packages/frontend-test/` is Playwright-only by construction. Treat it
as ONE TEST-PHASE named `frontend-test`:
- SUBs = every `.md` file inside, excluding `index.md`, `.gitkeep`, any
  `*-HEADER.md`/`MANDATORY-*.md` (typically `UI-FLOWS`, `INT-FLOW`)
- Gated by every frontend phase that exists for this module

### Weight classification

| Weight | Criteria |
|--------|----------|
| LIGHT  | < 5 tasks, single component |
| MEDIUM | 5–10 tasks, 1–2 components |
| HEAVY  | > 10 tasks, multi-layer (Models+Hooks+Validation+Routing) |
| XL     | 3+ screens in one sub |

---

## Step 2 — Generate `execution-state.json`

Location: `governance/modules/$MODULE/execution-state.json` (this
repo's own copy — never merged with backend's file of the same name
for the same module).

```json
{
  "module": "[MODULE]",
  "generated_at": "[today's date]",
  "backend_module_complete_confirmed": true,
  "ui_shell_complete_confirmed": true,
  "current_phase": "[FIRST_PHASE]",
  "current_sub": "[FIRST_SUB or null]",
  "api_docs_path": "../backend/governance/modules/[MODULE]/api-docs/",
  "phases": [
    {
      "id": "[PHASE_NAME]",
      "status": "PENDING",
      "subs": [
        { "id": "[SUB_NAME]", "status": "PENDING" }
      ]
    }
  ],
  "test_phase": {
    "id": "frontend-test",
    "status": "PENDING",
    "gated_by_phases": ["F1", "F2", "F3", "F4", "SEC-FE", "ALIGN-FE"],
    "header_file": "packages/frontend-test/UI-FLOWS-HEADER.md",
    "mandatory_file": "packages/frontend-test/MANDATORY-P.md",
    "subs": [
      { "id": "UI-FLOWS", "status": "PENDING" },
      { "id": "INT-FLOW", "status": "PENDING" }
    ]
  },
  "blocked": [],
  "api_doc_gaps": []
}
```

The two `*_confirmed` booleans record that the precondition gate
actually passed (standard or override) — a record, not a cache to
trust blindly much later.

Rules: list only phases actually found; `gated_by_phases` lists only
phases present for this module; `blocked`/`api_doc_gaps` start empty.
No `deferred_xm` field here — XM-IDs never appear in frontend state at all.

### `api_doc_gaps[]` entry format (same shape as backend's)
```json
{
  "type": "MISSING_IN_DOCS",
  "phase": "[PHASE]",
  "sub": "[SUB]",
  "endpoint": "[METHOD] [path]",
  "detail": "[what was missing]",
  "resolution": "resolved via backend source: <path>",
  "recorded_at": "[timestamp]"
}
```

---

## Step 3 — Generate `.claude/commands/execute-frontend.md`

```markdown
# /project:execute-frontend

Execute the current phase for the specified module — with context safety check.

## Usage
/project:execute-frontend [MODULE] [PHASE]

---

## STEP 0 — Context Safety Assessment (MANDATORY)

### 0.1 — Read state, identify PENDING subs in the requested phase
### 0.2 — Look up each sub's weight from the Weight Map below
### 0.3 — Classify and decide chunking

| Total weight in phase | Action |
|---|---|
| All LIGHT/MEDIUM | Execute the whole phase in one pass |
| Any HEAVY present | Chunk — one sub (or a few LIGHT subs) per pass |
| Any XL present | That sub alone is one full pass |

### 0.4 — Print assessment, wait for confirmation
```
══════════════════════════════════════════════════════
PHASE ASSESSMENT — [MODULE] / [PHASE]
══════════════════════════════════════════════════════
Subs pending : [list, weight + task count each]
Plan         : [one pass / chunked — list chunks]
══════════════════════════════════════════════════════
Proceed? [waits for confirmation]
```

---

## STEP 1 — Execution (after confirmation)

### Per sub:
1. Read `packages/frontend-execution/[PHASE]/[SUB].md` completely
2. Identify all tasks
2.5. **UI Shell reference check** — before writing any task's code,
     confirm whether a corresponding component/route already exists in
     the UI Shell. If it exists: CONFIRM/INTEGRATE, modify the existing
     file — never create a competing new one. If genuinely absent: flag
     it in the session report as a Shell gap, implement as an explicit addition.
3. **API Contract Resolution** [phases F1/F2/F3 only]: check
   `api_docs_path` first — treat it as trusted. Only fall back to
   backend source if confirmed absent from api-docs, and log the
   fallback in `api_doc_gaps[]`.
4. Map each task to the skill routing table in `GOVERNANCE-RULES.md`
5. Read required skills from `.github/skills/frontend/`
6. Execute all tasks in order
7. Run the phase's validation skill after the last task
8. Mark sub COMPLETE in `execution-state.json`

### Blocked items — OQ
OQ-blocked task → skip, add to `blocked[]`, mark:
`// TODO: OQ-[ID] — pending resolution`. Continue remaining tasks.

Never write an XM-related TODO in frontend code — XM-IDs are
exclusively a backend concern. If a task seems to need one, stop and
flag it instead of implementing it.

---

## STEP 2 — Session Report

Phase/sub completed, tasks executed, blocked items, any api_doc_gaps added.

---

## Weight Map — [MODULE]
[Insert actual weight map from Step 1]

## Phase Map — [MODULE]
[Insert actual phase → subs map from Step 1]

---

## Constraints (NON-NEGOTIABLE)

- NEVER skip STEP 0
- NEVER execute without confirmation after assessment
- NEVER invent a route path, component name, or PERM_* code — trace
  every value to an F4-SCREEN block, raise an OQ if none covers it
- NEVER redesign a component/route that already exists in the UI Shell
- NEVER call an endpoint not present in real API Docs
- NEVER go to backend source for an API detail unless confirmed absent
  from api-docs — always log the fallback
- NEVER write an XM-ID reference in frontend code
- NEVER advance phase without explicit instruction
- ALWAYS update execution-state.json after every sub
```

---

## Step 3B — Generate `.claude/commands/execute-frontend-test.md`

```markdown
# /project:execute-frontend-test

Execute test scenarios for [MODULE] — only for what's actually complete.

> Read `TEST-EXECUTION-AGENT.md` first.

## Usage
/project:execute-frontend-test [MODULE]

---

## STEP 0 — Gate Check + Assessment

### 0.1 — Gate Check (MANDATORY)
Read `execution-state.json` → `test_phase.gated_by_phases[]`. Confirm
every listed phase has `status == COMPLETE`. Empty list → gate passes automatically.

If not all complete:
```
══════════════════════════════════════════════════════
⛔ TEST GATE FAILED — [MODULE]
══════════════════════════════════════════════════════
Waiting on : [PHASE: status], ...
══════════════════════════════════════════════════════
```
STOP. Do not generate or run any test.

### 0.2–0.4 — Same assessment/confirmation pattern as execute-frontend.md

---

## STEP 1 — Execution (after confirmation)

### 1.0 — Read `header_file` and `mandatory_file` once

### Per sub:
1. Read `packages/frontend-test/[SUB].md` completely
2. Identify all scenarios
3. Generate: POM + spec file, per `TEST-EXECUTION-AGENT.md`'s
   conventions (Page Object Model, `data-testid` first, no `waitForTimeout`)
4. Run: `playwright-mcp`, per the shared MCP execution order
   (oracle-sql precondition → playwright-mcp execute → oracle-sql
   confirm → screenshot on failure)
5. Classify every failure/skip using the shared taxonomy
6. Update `execution-state.json`

---

## STEP 2 — Session Report

Write to `reports/TEST-REPORT-[MODULE]-frontend-[YYYY-MM-DD].md`. Any
`FAIL` → hand off to `AUTONOMOUS-FULLSTACK-FIXING-AGENT.md` — never fix here.

---

## Constraints (NON-NEGOTIABLE)

- NEVER run before the gate check passes
- NEVER treat `*-HEADER.md`/`MANDATORY-*.md` as a sub
- NEVER skip MANDATORY scenarios
- NEVER modify application source code — report, don't fix
- ALWAYS classify every failure/skip
- ALWAYS update execution-state.json after every sub
```

---

## Step 4 — Verify and report

```
══════════════════════════════════════════════════════
FRONTEND MODULE SETUP COMPLETE: [MODULE]
══════════════════════════════════════════════════════
Preconditions:
  GATE: BACKEND MODULE COMPLETE : [✓ / override logged]
  GATE: UI SHELL COMPLETE       : [✓ / override logged]
  ALIGN-FE ✓                    : [✓ / override logged]

execution-state.json      ✓  governance/modules/[MODULE]/ (this repo)
execute-frontend.md       ✓  .claude/commands/
execute-frontend-test.md  ✓  .claude/commands/

Phases detected       : [count]
Total subs detected   : [count]
Test phase detected   : frontend-test [✓ / not found]
  gated by : [phases found]

Weight map:
  [PHASE] / [SUB]  → [WEIGHT]  ([N] tasks)

To start execution:
  /project:execute-frontend [MODULE] [FIRST_PHASE]

To run tests once implementation is COMPLETE:
  /project:execute-frontend-test [MODULE]
══════════════════════════════════════════════════════
```

---

## Constraints (this command itself — NON-NEGOTIABLE)

- NEVER run without MODULE specified
- NEVER proceed past the module-validation check for a module not
  found in backend's registry — there is no override for
  non-existence, only for readiness (a different question entirely)
- NEVER reach into `backend/governance/` for anything beyond the two
  sanctioned reads listed at the top of this file
- NEVER invent a phase, sub, or file path not found in Step 1's scan
- NEVER name or special-case any specific module anywhere in this file
