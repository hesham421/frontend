# frontend/governance/

This is the frontend-owned slice of the ERP platform's AI governance content, migrated here from the standalone `governance-repo` repository on 2026-07-17 (see the workspace root's `DEEP-DIVE-BACKEND-FRONTEND-SPLIT.md` and `ARCHITECTURE-OVERVIEW.md` for why and what moved). It's deliberately small — most governance content stayed with `backend/governance/`.

## Layout

```
governance/
  verify-playwright-reference.sh  ← read-only helper: diffs the P3_5 reference
                                     copies below against backend/'s live source,
                                     when backend/ happens to be a sibling checkout

  modules/
    FILESVC/
      P3_5/test-plan.md          ← REFERENCE COPY of backend's source-of-truth
                                     test-plan.md (see "PLAYWRIGHT re-verification"
                                     below) — not a duplicate source of truth
      execution-state.json       ← F1-F4 + PLAYWRIGHT status ONLY (this repo owns
                                     these), plus a READ-ONLY `align_status` field
                                     mirrored from backend/governance/modules/<MOD>/
                                     execution-state.json's ALIGN result — never
                                     hand-edit `align_status` here
      packages/execution/F1/ .. F4/  ← split execution-plan.md output for the
                                         frontend-*implementation* phases only.
                                         Written directly here by agent3_splitter.py
                                         (which runs from backend/) — not copied
                                         after the fact.
      packages/test/PLAYWRIGHT/
    NOTIFICATION/ (same shape)
    ORG/          (same shape — no F4 folder; ORG's plan never had one)
      ← packages/test/PLAYWRIGHT/ holds the split test-plan.md output, UI/E2E
        scenarios executed via Playwright. Each module's PLAYWRIGHT/ folder has
        scenario files (UI-FLOWS.md, INT-FLOW.md, and module-specific
        MANDATORY-P.md/PLAYWRIGHT-HEADER.md where present) split from the same
        source test-plan.md that produced backend's JUNIT scenarios.

  .github/skills/frontend/    ← 12 frontend task skills (create-components,
                                 create-facade, enforce-design-system, etc.)

  project-artifacts/frontend/  ← design-decisions/, investigation-reports/,
                                  migration-audits/ — non-governance audit docs

  governance-shared/    ← EMPTY placeholder, reserved for a future git submodule.
                           Do not put content here manually; do not init a
                           submodule here without a deliberate, separate decision.
```

## What's deliberately NOT here

P0-P3 planning docs (except the P3_5 reference copies above), `packages/execution/CORE..INT-R/SEC/ALIGN` (the backend-implementation phases), JUnit scenarios, the CORE..ALIGN/JUNIT slice of `execution-state.json`, slash commands, the splitter/api-doc-generator tooling itself, `api-docs/`, the SECURITY module, and root-level governance docs (`GOVERNANCE-RULES.md`, `WORKSPACE.md`, `master-registry.md`, etc.) — all live in `backend/governance/` instead. This wasn't a partial migration; it's the deliberate split boundary. If you're looking for a CORE..ALIGN phase spec or execution plan and it's not here, check `backend/governance/modules/<MODULE>/` — it isn't duplicated in both places. (F1-F4 and PLAYWRIGHT, by contrast, ARE here — see Layout above — that boundary changed from an earlier version of this doc once it became clear frontend-*implementation* content belongs with frontend, not backend.)

## PLAYWRIGHT re-verification — a deliberate, bounded capability

Each module's `P3_5/test-plan.md` here is a **reference copy** (marked as such at the top of the file) of the real source of truth, which stays in `backend/governance/modules/<MODULE>/P3_5/test-plan.md`. This lets frontend/, on its own, read the original source its PLAYWRIGHT scenarios were split from and audit them for drift — without needing `backend/` open.

What this does NOT give frontend/: the ability to *regenerate* PLAYWRIGHT content. That logic (`agent3_splitter.py`) stays centralized in `backend/governance/governance-tools/` by design, so split-logic doesn't fork into two diverging implementations. This is an accepted, deliberate asymmetry — reference/audit capability, not full regeneration capability.

To re-verify:
1. Run `./verify-playwright-reference.sh <MODULE>` from this folder. If `backend/` is checked out as a sibling, it diffs the local reference copy against backend's live source directly and reports drift. If not, it tells you so and points at the manual procedure below.
2. If drift is found (or `backend/` isn't available), the actual fix always happens in `backend/`: update `P3_5/test-plan.md` there, re-run `agent3_splitter.py` to regenerate `packages/test/PLAYWRIGHT/`, then re-copy both the updated `P3_5/test-plan.md` (keeping the `REFERENCE COPY` marker line) and the regenerated `packages/test/PLAYWRIGHT/*.md` files into this repo.

This repo never hand-edits a `P3_5/test-plan.md` reference copy or regenerates `packages/test/PLAYWRIGHT/` output locally — both are always sourced from backend/'s pipeline.

## Playwright MCP wiring

`../.mcp.json` (this repo's own root) wires a `playwright` MCP server via `npx @playwright/mcp@latest` — the same command this repo's own `package.json` already exposes as its `mcp:playwright` script. This needs no vendored copy in `governance/`: `frontend/` already carries a separate, real `@playwright/test` install (`node_modules/@playwright/test`, used for its own e2e tests) that has nothing to do with the MCP server binary, so nothing here duplicates it. An earlier pass vendored a local copy of `@playwright/mcp` (code + `node_modules`, ~18MB) under `governance/mcp-servers/playwright/` instead — that was reverted once it became clear this repo already had an `npx`-based convention for the same thing (backend's own `.mcp.json` uses a vendored copy instead of its own equivalent script, for offline/reproducible use; frontend follows its own existing convention instead, at the cost of needing npx/network access — typically served from npm's local cache — the first time the server launches).

## The AVELYNQ design-system skill is separate from all of this

`frontend/design-system/avelynq-source/SKILL.md` (outside this `governance/` folder entirely) is a self-invocable, repo-local skill for the AVELYNQ brand UI kit. It was never part of the governance-repo skill-routing system and wasn't touched by the split — it lives where it's always lived.
