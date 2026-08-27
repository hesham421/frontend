# /project:execute-frontend-test

Execute test scenarios for SECURITY — only for what's actually complete.

> Read `TEST-EXECUTION-AGENT.md` first.

## Usage
/project:execute-frontend-test [MODULE]

---

## STEP 0 — Gate Check + Assessment

### 0.1 — Gate Check (MANDATORY)
Read `execution-state.json` → `test_phase.gated_by_phases[]`. Confirm
every listed phase has `status == COMPLETE`. Empty list → gate passes automatically.

Gated by (SECURITY): F1, F2, F3, F4, SEC-FE, ALIGN-FE

If not all complete:
```
══════════════════════════════════════════════════════
⛔ TEST GATE FAILED — SECURITY
══════════════════════════════════════════════════════
Waiting on : [PHASE: status], ...
══════════════════════════════════════════════════════
```
STOP. Do not generate or run any test.

### 0.2–0.4 — Same assessment/confirmation pattern as execute-frontend.md

---

## STEP 1 — Execution (after confirmation)

### 1.0 — Read `header_file` and `mandatory_file` once

> NOTE: as of generation time, `packages/frontend-test/` for SECURITY
> contains only empty placeholder directories (`UI-FLOWS/.gitkeep`,
> `INT-FLOW/.gitkeep`) — no `.md` sub files, no `*-HEADER.md`, and no
> `MANDATORY-*.md` exist yet. `header_file`/`mandatory_file` are `null`
> in `execution-state.json`. These must be generated (or the test
> package otherwise populated) before this command has any subs to run.

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

Write to `reports/TEST-REPORT-SECURITY-frontend-[YYYY-MM-DD].md`. Any
`FAIL` → hand off to `AUTONOMOUS-FULLSTACK-FIXING-AGENT.md` — never fix here.

---

## Constraints (NON-NEGOTIABLE)

- NEVER run before the gate check passes
- NEVER treat `*-HEADER.md`/`MANDATORY-*.md` as a sub
- NEVER skip MANDATORY scenarios
- NEVER modify application source code — report, don't fix
- ALWAYS classify every failure/skip
- ALWAYS update execution-state.json after every sub
