# /ORG/execute-frontend

Execute the current phase for ORG — with context safety check.

## Usage
/ORG/execute-frontend [PHASE]

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
PHASE ASSESSMENT — ORG / [PHASE]
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
   `api_docs_path` first — treat it as the authoritative and only API
   contract. If an endpoint or contract detail is confirmed absent from
   api-docs, do not inspect backend source, controllers, services,
   repositories, or governance — record it in `api_doc_gaps[]` with
   resolution `"blocked pending frontend API contract clarification"`
   and continue with remaining tasks (same pattern as an OQ-blocked
   item below). Never invent the missing contract.
4. Read required skills from `.github/skills/frontend/`
5. Execute all tasks in order
6. Run the phase's validation skill after the last task
7. Mark sub COMPLETE in `execution-state.json`

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

## Weight Map — ORG

| Phase / Sub | Weight | Basis |
|---|---|---|
| F1 / SCR-ORG-001 (Legal Entities) | LIGHT | 1 entity (LegalEntity); single component, model fields confirmed 1:1 against real API DTO with minor corrections (entityTypeId enum value, audit-footer fields added) |
| F1 / SCR-ORG-002 (Branches) | LIGHT | 1 entity (Branch); single component, same confirm/correct pattern as SCR-ORG-001 |
| F1 / SCR-ORG-003 (Regions) | LIGHT | 1 entity (Region); single component, same confirm/correct pattern |
| F1 / SCR-ORG-004 (Departments) | LIGHT | 1 entity (Department); single component, same confirm/correct pattern |
| F1 / SCR-ORG-005 (Cost Centers) | LIGHT | 1 entity (CostCenter); single component, same confirm/correct pattern |
| F1 / SCR-ORG-006 (Profit Centers) | LIGHT | 1 entity (ProfitCenter); single component, same confirm/correct pattern |
| F1 / SCR-ORG-007 (Location Sites) | LIGHT | 1 entity (LocationSite); single component, same confirm/correct pattern |
| F2 / SCR-ORG-001 (Legal Entities) | MEDIUM | 9 tasks (7 F2-QUERY hooks + facade + screen-init); single entity, single facade (`useLegalEntitiesFacade`) |
| F2 / SCR-ORG-002 (Branches) | MEDIUM | 9 tasks (7 hooks + facade + screen-init); single entity |
| F2 / SCR-ORG-003 (Regions) | MEDIUM | 9 tasks (7 hooks + facade + screen-init); single entity |
| F2 / SCR-ORG-004 (Departments) | MEDIUM | 10 tasks (8 hooks + facade + screen-init); single entity |
| F2 / SCR-ORG-005 (Cost Centers) | MEDIUM | 10 tasks (8 hooks + facade + screen-init); single entity |
| F2 / SCR-ORG-006 (Profit Centers) | MEDIUM | 9 tasks (7 hooks + facade + screen-init); single entity |
| F2 / SCR-ORG-007 (Location Sites) | MEDIUM | 9 tasks (7 hooks + facade + screen-init); single entity |
| F3 / SCR-ORG-001 (Legal Entities) | MEDIUM | 8 F3-VALIDATION blocks — cross-entity deactivation guards (active Branches/ProfitCenters etc.) + field rules |
| F3 / SCR-ORG-002 (Branches) | MEDIUM | 10 F3-VALIDATION blocks — at the MEDIUM/HEAVY boundary, kept MEDIUM (not >10) |
| F3 / SCR-ORG-003 (Regions) | MEDIUM | 8 F3-VALIDATION blocks |
| F3 / SCR-ORG-004 (Departments) | HEAVY | 11 F3-VALIDATION blocks — highest rule count alongside SCR-ORG-005 |
| F3 / SCR-ORG-005 (Cost Centers) | HEAVY | 11 F3-VALIDATION blocks |
| F3 / SCR-ORG-006 (Profit Centers) | MEDIUM | 7 F3-VALIDATION blocks |
| F3 / SCR-ORG-007 (Location Sites) | MEDIUM | 8 F3-VALIDATION blocks |
| F4 / SCR-ORG-001 (Legal Entities) | LIGHT | Route/component ALREADY EXISTS (LegalEntities.tsx); guard (flagged addition) + PERM_* mapping; single component, ~3-4 items |
| F4 / SCR-ORG-002 (Branches) | LIGHT | Route/component already exists; guard + PERM_* mapping; single component |
| F4 / SCR-ORG-003 (Regions) | LIGHT | Route/component already exists; guard + PERM_* mapping; single component |
| F4 / SCR-ORG-004 (Departments) | LIGHT | Route/component already exists; guard + PERM_* mapping; single component |
| F4 / SCR-ORG-005 (Cost Centers) | LIGHT | Route/component already exists; guard + PERM_* mapping; single component |
| F4 / SCR-ORG-006 (Profit Centers) | LIGHT | Route/component already exists; guard + PERM_* mapping; single component |
| F4 / SCR-ORG-007 (Location Sites) | LIGHT | Route/component already exists; guard + PERM_* mapping; single component |
| SEC-FE / SCR-ORG-001 (Legal Entities) | LIGHT | 3 effective core flags (canView/Create/Edit — canDelete is a structural no-op, canApprove n/a); uniform pattern |
| SEC-FE / SCR-ORG-002 (Branches) | LIGHT | Same uniform 3-flag pattern |
| SEC-FE / SCR-ORG-003 (Regions) | LIGHT | Same uniform 3-flag pattern |
| SEC-FE / SCR-ORG-004 (Departments) | LIGHT | Same uniform 3-flag pattern |
| SEC-FE / SCR-ORG-005 (Cost Centers) | LIGHT | Same uniform 3-flag pattern |
| SEC-FE / SCR-ORG-006 (Profit Centers) | LIGHT | Same uniform 3-flag pattern |
| SEC-FE / SCR-ORG-007 (Location Sites) | LIGHT | Same uniform 3-flag pattern |
| ALIGN-FE / ALIGN-FE (Gate Summary) | LIGHT | Not an implementation task set — pre-passed cross-phase audit checklist (PASSED ✓ with 2 documented ⏸ items) to read/acknowledge; no code to write |

## Phase Map — ORG

```
F1 (Frontend Model Specifications)
├── SCR-ORG-001 — Legal Entities       [LIGHT]
├── SCR-ORG-002 — Branches             [LIGHT]
├── SCR-ORG-003 — Regions              [LIGHT]
├── SCR-ORG-004 — Departments          [LIGHT]
├── SCR-ORG-005 — Cost Centers         [LIGHT]
├── SCR-ORG-006 — Profit Centers       [LIGHT]
└── SCR-ORG-007 — Location Sites       [LIGHT]

F2 (Data & Facade Hook Specifications)
├── SCR-ORG-001 — Legal Entities       [MEDIUM]
├── SCR-ORG-002 — Branches             [MEDIUM]
├── SCR-ORG-003 — Regions              [MEDIUM]
├── SCR-ORG-004 — Departments          [MEDIUM]
├── SCR-ORG-005 — Cost Centers         [MEDIUM]
├── SCR-ORG-006 — Profit Centers       [MEDIUM]
└── SCR-ORG-007 — Location Sites       [MEDIUM]

F3 (Frontend Validation Rule Specifications)
├── SCR-ORG-001 — Legal Entities       [MEDIUM]
├── SCR-ORG-002 — Branches             [MEDIUM]
├── SCR-ORG-003 — Regions              [MEDIUM]
├── SCR-ORG-004 — Departments          [HEAVY]
├── SCR-ORG-005 — Cost Centers         [HEAVY]
├── SCR-ORG-006 — Profit Centers       [MEDIUM]
└── SCR-ORG-007 — Location Sites       [MEDIUM]

F4 (Routing & Component Structure)
├── SCR-ORG-001 — Legal Entities       [LIGHT]
├── SCR-ORG-002 — Branches             [LIGHT]
├── SCR-ORG-003 — Regions              [LIGHT]
├── SCR-ORG-004 — Departments          [LIGHT]
├── SCR-ORG-005 — Cost Centers         [LIGHT]
├── SCR-ORG-006 — Profit Centers       [LIGHT]
└── SCR-ORG-007 — Location Sites       [LIGHT]
    (router-less architecture: no React Router; navigation is a
    `switch`-style renderCurrentScreen() in App.tsx driven by
    useNavigationStore)

SEC-FE (Frontend Security Specifications)
├── SCR-ORG-001 — Legal Entities       [LIGHT]
├── SCR-ORG-002 — Branches             [LIGHT]
├── SCR-ORG-003 — Regions              [LIGHT]
├── SCR-ORG-004 — Departments          [LIGHT]
├── SCR-ORG-005 — Cost Centers         [LIGHT]
├── SCR-ORG-006 — Profit Centers       [LIGHT]
└── SCR-ORG-007 — Location Sites       [LIGHT]

ALIGN-FE (Cross-Phase Alignment Gate)
└── ALIGN-FE — Gate Summary     [LIGHT]  (PASSED w/ 2 documented ⏸ items — see OQ-ORG-002/003)
```

---

## Constraints (NON-NEGOTIABLE)

- NEVER skip STEP 0
- NEVER execute without confirmation after assessment
- NEVER invent a route path, component name, or PERM_* code — trace
  every value to an F4-SCREEN block, raise an OQ if none covers it
- NEVER redesign a component/route that already exists in the UI Shell
- NEVER call an endpoint not present in real API Docs
- NEVER consult backend source, controllers, services, repositories,
  or governance for an API detail — if missing from api-docs, record
  it in `api_doc_gaps[]` and continue
- NEVER write an XM-ID reference in frontend code
- NEVER advance phase without explicit instruction
- ALWAYS update execution-state.json after every sub
