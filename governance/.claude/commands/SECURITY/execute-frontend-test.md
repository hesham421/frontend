# /SECURITY/execute-frontend-test

Execute test scenarios for SECURITY — only for what's actually complete.

> Read `TEST-EXECUTION-AGENT.md` first.

## Usage
/SECURITY/execute-frontend-test

---

## STEP 0 — Gate Check + Assessment

### 0.1 — Gate Check (MANDATORY)
Read `execution-state.json` → `test_phase.gated_by_phases[]`. Confirm
every listed phase has `status == COMPLETE`. Empty list → gate passes automatically.

Current gate: `["F1", "F2", "F3", "F4", "SEC-FE", "ALIGN-FE"]` — all
six phases now have real content as of this generation. F1 is
COMPLETE; F2/F3/F4/SEC-FE/ALIGN-FE are PENDING, so the gate does not
pass yet.

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

⚠ Neither exists yet for this module — `packages/frontend-test/`
contains only `UI-FLOWS/.gitkeep` and `INT-FLOW/.gitkeep`, no
`*-HEADER.md`/`MANDATORY-*.md` and no scenario `.md` files. This step
is a no-op until those are authored; do not invent their content.

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
