# frontend/governance/

This is the frontend-owned slice of the ERP platform's AI governance content, migrated here from the standalone `governance-repo` repository on 2026-07-17 (see the workspace root's `DEEP-DIVE-BACKEND-FRONTEND-SPLIT.md` and `ARCHITECTURE-OVERVIEW.md` for why and what moved). It's deliberately small — most governance content stayed with `backend/governance/`.

## Layout

```
governance/
  modules/
    FILESVC/packages/test/PLAYWRIGHT/
    NOTIFICATION/packages/test/PLAYWRIGHT/
    ORG/packages/test/PLAYWRIGHT/
      ← split test-plan.md output, UI/E2E scenarios executed via Playwright.
        Each module's PLAYWRIGHT/ folder has scenario files (UI-FLOWS.md,
        INT-FLOW.md, and module-specific MANDATORY-P.md/PLAYWRIGHT-HEADER.md
        where present) split from the same source test-plan.md that produced
        backend's JUNIT scenarios.

  .github/skills/frontend/    ← 12 frontend task skills (create-components,
                                 create-facade, enforce-design-system, etc.)

  project-artifacts/frontend/  ← design-decisions/, investigation-reports/,
                                  migration-audits/ — non-governance audit docs

  governance-shared/    ← EMPTY placeholder, reserved for a future git submodule.
                           Do not put content here manually; do not init a
                           submodule here without a deliberate, separate decision.
```

## What's deliberately NOT here

Almost everything else — P0-P3 planning docs, `packages/execution/` (including the F1-F4 frontend-*implementation* phase specs, as opposed to the PLAYWRIGHT *test* scenarios above), JUnit scenarios, `execution-state.json`, slash commands, governance tooling, `api-docs/`, the SECURITY module, and root-level governance docs (`GOVERNANCE-RULES.md`, `WORKSPACE.md`, `master-registry.md`, etc.) — all live in `backend/governance/` instead. This wasn't a partial migration; it's the deliberate split boundary. If you're looking for a phase spec or an execution plan and it's not here, check `backend/governance/modules/<MODULE>/` — it isn't duplicated in both places.

One consequence worth knowing: this repo has no local copy of the `P3_5/test-plan.md` source that the PLAYWRIGHT scenarios above were split from (that source stayed in `backend/governance/modules/<MODULE>/P3_5/`, alongside the splitter tooling that reads it). So this repo can't independently re-verify or regenerate its own PLAYWRIGHT content — that capability lives with `backend/governance/governance-tools/agent3_splitter.py`.

## The AVELYNQ design-system skill is separate from all of this

`frontend/design-system/avelynq-source/SKILL.md` (outside this `governance/` folder entirely) is a self-invocable, repo-local skill for the AVELYNQ brand UI kit. It was never part of the governance-repo skill-routing system and wasn't touched by the split — it lives where it's always lived.
