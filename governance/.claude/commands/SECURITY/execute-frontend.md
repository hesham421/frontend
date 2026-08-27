# /SECURITY/execute-frontend

Execute the current phase for SECURITY — with context safety check.

## Usage
/SECURITY/execute-frontend [PHASE]

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
PHASE ASSESSMENT — SECURITY / [PHASE]
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

## Weight Map — SECURITY

| Phase | Sub | Weight | Tasks | Notes |
|---|---|---|---|---|
| F1 | F1 | XL | 8 model blocks across 7 screens | Multi-entity model spec (AppUser + 7 others); single sub spans 3+ screens → XL |
| F2 | F2 | XL | 60 query/facade/mutation/LOV blocks across 7 screens | Largest phase; data/facade hook layer for all screens |
| F3 | F3 | XL | 15 validation rule blocks across 7 screens | Validation rule layer for all screens |
| F4 | F4 | XL | 7 screen/routing blocks (SCR-SEC-001..007) | Routing & component structure for all 7 screens |
| SEC-FE | SEC-FE | XL | 7 permission-gating blocks (SCR-SEC-001..007) | Permission/guard layer for all 7 screens |
| ALIGN-FE | ALIGN-FE | LIGHT | 1 (verification gate) | Already PASSED in P3_2/frontend-execution-plan.md — re-verification only, no new implementation tasks |

Per the chunking rule, every implementation phase (F1–SEC-FE) already
contains exactly one XL sub — each phase is executed as its own single
full pass; there is nothing to further subdivide within a phase.

## Phase Map — SECURITY

```
F1 → F2 → F3 → F4 → SEC-FE → ALIGN-FE
```

- F1        : governance/modules/SECURITY/packages/frontend-execution/F1/F1.md
- F2        : governance/modules/SECURITY/packages/frontend-execution/F2/F2.md
- F3        : governance/modules/SECURITY/packages/frontend-execution/F3/F3.md
- F4        : governance/modules/SECURITY/packages/frontend-execution/F4/F4.md
- SEC-FE    : governance/modules/SECURITY/packages/frontend-execution/SEC-FE/SEC-FE.md
- ALIGN-FE  : governance/modules/SECURITY/packages/frontend-execution/ALIGN-FE/ALIGN-FE.md

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
