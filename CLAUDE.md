# ERP Frontend

This is the **frontend** repository. It contains Angular source code, build
configuration, Nginx config, the frontend Dockerfile, and (as of the
backend/frontend governance split) its own internal copy of the AI governance
content that applies to frontend work.

> **Governance lives inside this repository now.**
> Frontend-relevant AI skills live in `governance/` (this repo's own
> subfolder). Do not look for a separate sibling `governance-repo/` repository
> for these — the pointer-based external-governance model has been replaced by
> an internal `governance/` copy for the frontend-owned slice of governance
> content (PLAYWRIGHT test scenarios, frontend skills).

---

## Internal Governance

Before generating any code:

1. Load the required skill from `governance/.github/skills/frontend/<skill-name>/SKILL.md`.
2. For a module's F1-F4 execution phases and PLAYWRIGHT test scenarios, read
   `governance/modules/[MODULE]/execution-state.json` (frontend-owned file —
   F1-F4 + PLAYWRIGHT only, plus a READ-ONLY `align_status` field mirrored
   from `backend/governance/modules/[MODULE]/execution-state.json`'s ALIGN
   result — never hand-edit `align_status` here) and
   `governance/modules/[MODULE]/packages/execution/F[N]/` /
   `governance/modules/[MODULE]/packages/test/PLAYWRIGHT/`.
3. The AVELYNQ design-system skill at `design-system/avelynq-source/SKILL.md`
   is local to this repository already — it is unrelated to the
   governance-repo skill-routing system and was never moved.

**Most governance content (P0-P3 planning docs, packages/execution/CORE..INT-R/SEC/ALIGN,
and JUNIT backend tests) lives in `backend/governance/`, not here** — but
F1-F4 (the frontend-*implementation* phase specs) and PLAYWRIGHT both live
HERE, in this repo, not in `backend/governance/`. This repo's `governance/`
folder carries the frontend-specific slice (F1-F4 execution phases,
PLAYWRIGHT scenarios, frontend skills) per the backend/frontend governance
split — `agent3_splitter.py` (which lives in and runs from `backend/`)
writes F1-F4/PLAYWRIGHT output directly here at generation time, not as a
manual copy. If you need CORE..INT-R/SEC/ALIGN content or anything from
`backend/governance/modules/[MODULE]/`, look there instead — it is not
duplicated here.

If `governance/` is missing or looks incomplete for what you need:
- Stop implementation.
- Explain the missing dependency.
- Never invent governance content to fill the gap.

Note: a `governance/governance-shared/` placeholder folder exists, reserved for
a future git submodule carrying genuinely cross-repo shared governance content.
It is intentionally empty — do not treat it as a source of truth yet.

---

## Workspace Layout

This repository is one of several repositories that form the ERP platform. As
of the backend/frontend governance split, `backend/` and `frontend/` each
carry their own internal `governance/` copy rather than pointing at one
external sibling repository:

```
workspace/
  backend/          ← includes its own governance/ (most content)
  frontend/         ← this repository (includes governance/, frontend slice only)
  deploy/
  governance-repo/  ← original source-of-truth checkout; content not yet
                       migrated (root-level docs, api-docs/, project-artifacts/,
                       etc. — see the deep-dive report) still lives here only
```

---

## Where to Find Governance

| Governance artifact | Location |
|---------------------|----------|
| Frontend skills | `governance/.github/skills/frontend/` |
| F1-F4 execution phases (per module) | `governance/modules/[MODULE]/packages/execution/F[N]/` |
| PLAYWRIGHT test scenarios (per module) | `governance/modules/[MODULE]/packages/test/PLAYWRIGHT/` |
| Module execution state (F1-F4 + PLAYWRIGHT, plus mirrored `align_status`) | `governance/modules/[MODULE]/execution-state.json` |
| Backend skills | not here — `backend/governance/.github/skills/backend/` |
| CORE..INT-R/SEC/ALIGN execution-plan phase specs | not here — `backend/governance/modules/[MODULE]/packages/execution/` |
| Module execution state (CORE..INT-R, SEC, ALIGN, JUNIT) | not here — `backend/governance/modules/[MODULE]/execution-state.json` |
| AI commands (`/project:execute-*`) | not here — `backend/governance/.claude/commands/` |
| AVELYNQ design-system skill | `design-system/avelynq-source/SKILL.md` (local to this repo, unchanged) |

---

## Repository Structure

```
angular.json
package.json
tsconfig.json
tsconfig.app.json
tsconfig.spec.json
eslint.config.mjs
karma.conf.js
Dockerfile           ← Multi-stage Node → Nginx image (self-contained)
nginx.conf           ← Nginx config used by Dockerfile Stage 2
governance/           ← internal AI governance copy, frontend slice (see above)
src/
  app/
    core/
    layout/
    modules/
    shared/
    theme/
  assets/
    i18n/            ← Localisation files (en.json, ar.json)
    images/
  environments/
```

---

## Running Locally

```bash
npm install
npm start            # ng serve (dev server)
npm test             # ng test (Karma unit tests)
npm run build        # ng build --configuration=production
```

Build output: `dist/n-erp-system/`

**Package manager:** npm is the standard for this repo (`package-lock.json`
is the committed lockfile). Do not reintroduce `yarn.lock` — it was removed
after this engagement confirmed npm was used exclusively throughout.

---

## STRUCTURAL LAW — DO NOT DEVIATE

> This section is binding, not a proposal. It formalizes the backend/frontend governance split that is already implemented and verified on disk — see workspace-root `ARCHITECTURE-OVERVIEW.md`, `backend/governance/README.md`, `frontend/governance/README.md`, and `GOVERNANCE-SPLIT-PHASE-2-COMPLETION.md`. It locks in what already exists; it does not redesign anything. This exact section also appears in `backend/CLAUDE.md` — the two copies are identical and must stay that way.

### Ownership table

| Content type | Lives in | Never in |
|---|---|---|
| `CLAUDE.md`, `GOVERNANCE-RULES.md`, `WORKSPACE.md`, `master-registry.md`, `modules-registry.json`, `vision.md` | `backend/governance/` | `frontend/governance/` |
| P0-P4 planning docs (per module) | `backend/governance/modules/<MOD>/` | `frontend/governance/` — except the `P3_5/test-plan.md` reference copies noted below |
| `packages/execution/<PHASE>/` — CORE, DATA-DOM/DATAOM, SVC-API/SVCAPI, DOC, INT-C/INTC, INT-R/INTR, SEC, ALIGN | `backend/governance/modules/<MOD>/packages/execution/` | `frontend/governance/` |
| `packages/execution/F1/`, `F2/`, `F3/`, `F4/` (frontend-*implementation* phase specs) | `frontend/governance/modules/<MOD>/packages/execution/F[N]/` | `backend/governance/` — backend keeps none of these; `agent3_splitter.py` Stage 2 routes them directly at generation time (guardrail-protected, same mechanism as PLAYWRIGHT) |
| `packages/test/JUNIT/` (JUnit test scenarios) | `backend/governance/modules/<MOD>/packages/test/JUNIT/` | `frontend/governance/` |
| `packages/test/PLAYWRIGHT/` (Playwright UI/E2E scenarios) | `frontend/governance/modules/<MOD>/packages/test/PLAYWRIGHT/` | `backend/governance/` — backend keeps none of these |
| `P3_5/test-plan.md` | Source of truth: `backend/governance/modules/<MOD>/P3_5/`. A marked `REFERENCE COPY` also exists at `frontend/governance/modules/<MOD>/P3_5/` for audit purposes only. | Nowhere else. Never hand-edit the frontend copy; never treat it as a second source of truth. |
| `execution-state.json` — TWO separate files, not a shared/reference one | Backend file (`backend/governance/modules/<MOD>/execution-state.json`) owns CORE..INT-R/SEC/ALIGN + JUNIT. Frontend file (`frontend/governance/modules/<MOD>/execution-state.json`) owns F1-F4 + PLAYWRIGHT, plus one READ-ONLY mirrored field, `align_status` (copied from backend's ALIGN phase status — never hand-edited in the frontend file directly). SECURITY/gaps has its own, structurally different, non-split shape (no `packages/execution/` at all — see its own file). | Neither file duplicates the other's phases/test_phases; `blocked[]`/`deferred_xm[]`/`api_doc_gaps[]` entries route by their own `phase` field. |
| `governance-tools/` (`config.py`, `marker_parser.py`, `agent1_create_structure.py`, `agent2_archive.py`, `agent3_splitter.py`, `api-doc-generator/`) | `backend/governance/governance-tools/` only | `frontend/governance/` — never duplicated, never re-implemented |
| `.claude/commands/` (slash commands) | `backend/governance/.claude/commands/` only | `frontend/governance/` |
| `.github/skills/backend/`, `.github/skills/devops/` | `backend/governance/.github/skills/` | `frontend/governance/` |
| `.github/skills/frontend/` | `frontend/governance/.github/skills/` | `backend/governance/` |
| `mcp-servers/postgres/` | `backend/governance/mcp-servers/postgres/` only, wired via `backend/.mcp.json` | `frontend/governance/` — not duplicated (no frontend DB access use case) |
| `mcp-servers/playwright/` (server code + vendored `node_modules`) | `backend/governance/mcp-servers/playwright/` only, wired via `backend/.mcp.json` | `frontend/governance/` — frontend does NOT vendor a copy; `frontend/.mcp.json` instead wires its own `playwright` entry via `npx @playwright/mcp@latest`, matching `frontend/package.json`'s own pre-existing `mcp:playwright` script. A vendored copy was tried once and reverted — it only duplicated node_modules alongside frontend's own separate, real `@playwright/test` install with no benefit. |
| SECURITY module (all of it — "PERMANENT EXCEPTION") | `backend/governance/modules/SECURITY/` | `frontend/governance/` |
| `api-docs/` (auto-generated) | `backend/governance/modules/<MOD>/api-docs/` | `frontend/governance/` |
| `project-artifacts/` (backend + shared) | `backend/governance/project-artifacts/` | — |
| `project-artifacts/frontend/` | `frontend/governance/project-artifacts/frontend/` | `backend/governance/` |
| `governance-shared/` | Empty placeholder in both repos, reserved for a future git submodule | Do not put content in either copy without a separate, explicit human decision |
| `governance-repo/` (workspace root) | Superseded remnant only (`reports/` folder + an inert timestamped backup) | Not a source of truth for anything, in either repo |

### If you are about to do X, the answer is always Y

- **About to add a new CORE..INT-R/SEC/ALIGN execution-plan phase file, JUnit scenario, or slash command?** → `backend/governance/`. Never `frontend/governance/`.
- **About to add a new F1-F4 execution-plan phase file, PLAYWRIGHT scenario, or frontend skill?** → `frontend/governance/`. Never `backend/governance/`. `agent3_splitter.py` routes F1-F4 and PLAYWRIGHT there automatically — a guardrail refuses to write either back into `backend/governance/`, even if misconfigured.
- **Found yourself wanting to copy a NEW file from `backend/` into `frontend/` (or vice versa) that isn't already an established reference-copy pattern (`P3_5/test-plan.md`, the Playwright MCP server, the `align_status` mirrored field)?** → STOP. This requires an explicit human decision, not silent duplication. Ask first.
- **About to regenerate PLAYWRIGHT or F1-F4 content locally in `frontend/`?** → Not possible by design. Regeneration only happens via `backend/governance/governance-tools/agent3_splitter.py`; `frontend/` only receives the routed output.
- **About to write to `governance-shared/` or initialize a submodule there?** → Forbidden until a separate, explicit human decision authorizes it.
- **About to edit `execution-state.json` via a script?** → Forbidden, for BOTH the backend and frontend files. Hand-maintained only, per the agent phase-execution protocol — no script reads or writes either one. The one exception: whichever agent completes ALIGN must hand-update the mirrored `align_status` field in the frontend file in the same session — still a hand-edit, not a script.
- **About to treat `governance-repo/` (the empty shell at the workspace root) as a source of truth for anything?** → Forbidden. It's a superseded remnant; only its git history has archival value.

### No new top-level content categories without explicit confirmation

Do not create a new folder type, a new cross-repo dependency, or a new "shared" location under either `governance/` tree without first producing a short written justification and getting explicit human confirmation — the same rigor the original split itself required (evidence-based analysis → dry-run plan → confirmation → execution). Never skip straight to implementation.

### Decision authority

This structure was deliberately designed and verified (see workspace-root ARCHITECTURE-OVERVIEW.md and GOVERNANCE-SPLIT-PHASE-2-COMPLETION.md) to keep backend/ and frontend/ independently workable without opening the other. Any deviation — new duplication, new cross-repo path reference, new shared location — requires the same rigor the original split required: evidence-based analysis, a dry-run plan, and explicit human confirmation. Silent structural drift is treated as a governance violation, not a convenience.
