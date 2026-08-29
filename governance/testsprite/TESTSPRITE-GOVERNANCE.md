# TestSprite Governance — Frontend

This document is the single source of truth for how TestSprite (the
MCP-based AI test generator, wired in `frontend/.mcp.json` as the
`TestSprite` server) is used against this repository, and how its output is
organized. Read this before running any TestSprite tool, and before
touching anything under `testsprite_tests/` or
`governance/modules/<MOD>/testsprite/`. This mirrors
`backend/governance/testsprite/TESTSPRITE-GOVERNANCE.md` by design — same
rules, adapted to the frontend's own stack — the way
`frontend/governance/CLAUDE.md`'s Housekeeping section already mirrors
backend's.

---

## 1. Mechanism — how TestSprite actually works here

TestSprite runs as an MCP server (`npx @testsprite/testsprite-mcp@latest`,
`API_KEY` from `TESTSPRITE_API_KEY`, alongside the `playwright` MCP server
already wired for manual UI/E2E work) and drives a fixed pipeline, always
against `projectPath = frontend` (this repo root) and
`localEndpoint = http://localhost:4200` (the running Vite dev server —
start it first) with `loginUser=admin` / `loginPassword=admin` (a seeded
SUPER_ADMIN account on the local backend):

1. **Bootstrap** (`testsprite_bootstrap_tests`) — records `type: frontend`,
   `scope: codebase`, the local endpoint, and login credentials into a
   session file under `~/.testsprite/mcp/session-*.json`. Writes
   `testsprite_tests/tmp/config.json` (gitignored — pure session cache,
   never commit it). This is also where any run-specific
   `additionalInstruction` gets recorded (e.g. the standing note that
   Organization and Notifications screens are intentionally mock/local-state
   only — see that file if a run behaves unexpectedly around those modules).
2. **Code summary** (`testsprite_generate_code_summary`) — scans the React
   source and writes `testsprite_tests/tmp/code_summary.yaml` (gitignored).
3. **Standardized PRD** (`testsprite_generate_standardized_prd`) — writes
   `testsprite_tests/standard_prd.json`, describing every screen/flow
   TestSprite discovered, across every module at once. This is **not
   per-module** — one PRD covers the whole frontend.
4. **Frontend test plan** (`testsprite_generate_frontend_test_plan`) —
   writes `testsprite_tests/testsprite_frontend_test_plan.json`, a flat
   list `TC001..TCNNN` of UI flows, renumbered from `TC001` **every time it
   runs**. This list can be — and as of the 2026-08-28 run, is — larger
   than what actually gets generated: a run can plan e.g. 50 cases and only
   generate/execute a subset before stopping. Check the report, not just
   the plan's length, to know what actually ran.
5. **Generate + execute** (`testsprite_generate_code_and_execute`) — for
   each `TCnnn` it gets to, writes a standalone async Playwright script
   `testsprite_tests/TCnnn_<slug>.py` (`playwright.async_api`, headless
   Chromium, drives `http://localhost:4200` directly by CSS id / role /
   xpath locators — no shared page-object layer, each file is fully
   self-contained and ends with `asyncio.run(run_test())`) and executes it,
   then writes `testsprite_tests/testsprite-mcp-test-report.md` / `.html`.

**The problem this document exists to prevent:** step 4 restarts numbering
at `TC001` on every run, and step 5 never deletes a previous run's
`TCnnn_*.py` files before writing new ones. Run TestSprite twice without a
governance step in between and `testsprite_tests/` accumulates files from
different runs under colliding `TCnnn` names. The rules below keep that
from happening here the way it already did on the backend side (see
`backend/governance/testsprite/TESTSPRITE-GOVERNANCE.md` §5).

---

## 2. Where things live

| Content | Location | Lifetime |
|---|---|---|
| TestSprite's own working directory (session cache, PRD, plan, generated `.py`, report — all freshly (re)written by every run) | `frontend/testsprite_tests/` (repo root — `projectPath`-derived, **not configurable**) | Ephemeral — treat as scratch. Never the durable copy. |
| `testsprite_tests/tmp/` | same folder | Gitignored, session-only. Never archive or commit it. |
| **Durable, module-organized test archive** (the currently-valid generated `.py` files, sorted by owning module) | `frontend/governance/modules/<MOD>/testsprite/tests/` | Permanent, git-tracked. Overwritten only when a fresh run regenerates that module's tests (see §3). |
| **Full run bundle archive** (`standard_prd.json` + `testsprite_frontend_test_plan.json` + report `.md`/`.html` from one specific run, kept intact together) | `frontend/governance/testsprite/runs/<YYYY-MM-DD>-frontend/` | Permanent, one dated folder per run, never overwritten. |
| Ready-to-use prompts to drive TestSprite | `frontend/governance/testsprite/prompts/` | Permanent. |
| This document | `frontend/governance/testsprite/TESTSPRITE-GOVERNANCE.md` | Permanent. |

Unlike the backend, this repo has no separate legacy `test-api/` folder to
confuse this with — `governance/modules/<MOD>/testsprite/` is the only
generated-UI-test archive here. Vitest/RTL unit and MSW-mocked component
tests (per the `create-tests` skill) live under `src/`, not here — they are
a different, developer-owned test layer, not TestSprite output.

---

## 3. Module classification rule

`testsprite_frontend_test_plan.json` and the generated `.py` files are not
module-aware — TestSprite treats the app as one flat set of screens. Assign
each generated `TCnnn_*.py` to a module by the screen/flow it drives, using
`backend/governance/master-registry.md`'s module ownership as the
authority (read via the sanctioned cross-repo path — see
`backend/governance/README.md`'s "Sanctioned cross-repo reads"):

| Screen / flow | Module |
|---|---|
| Login, signup/activation, forgot/reset password, dashboard landing | `SECURITY` |
| Roles (create/edit/deactivate/permission matrix/copy/sync), Users (create/edit/delete/search), Permissions (create/rename/manage), Pages registry (create/search/filter), profile & data-scope drawers | `SECURITY` |
| Legal entities, branches, organization tree navigation | `ORG` |
| Notifications (inbox/templates/channels) — **mock/local-state only as of this writing**, per the bootstrap `additionalInstruction`; still classify any generated test for it under `NOTIFICATION` when it appears | `NOTIFICATION` |

As of the 2026-08-28 run this frontend only exercises `SECURITY` (TC001–025)
and `ORG` (TC026–030) — no `NOTIFICATION` or `MASTERDATA` UI flows have been
generated yet. Add a row here the first time a generated test lands in a
module not yet listed above, rather than guessing where it goes.

---

## 4. Standing rule for every future run (read before running TestSprite)

**Before starting a new run:**

1. Check `frontend/testsprite_tests/` for leftover `.py` files,
   `standard_prd.json`, `testsprite_frontend_test_plan.json`, or report
   files from a previous run that were never archived. If any exist,
   archive them first, exactly as in §6 of the backend's
   `TESTSPRITE-GOVERNANCE.md` (same procedure, frontend paths) — classify
   each `.py` by §3, `git mv` it into its module's `testsprite/tests/`, and
   move the PRD/plan/report trio into a new
   `governance/testsprite/runs/<today>-frontend/`.
2. Only then run the new pipeline (see
   `governance/testsprite/prompts/start-tests.md`).
3. Confirm both the backend (`localhost:7272`) and the frontend dev server
   (`localhost:4200`) are running — the generated flows log in against the
   real backend.

**After a run finishes:**

1. Read `testsprite_tests/testsprite_frontend_test_plan.json` for the
   planned list, but confirm actual coverage against
   `testsprite-mcp-test-report.md` — the plan can list more cases than were
   actually generated/executed (see §1).
2. For every `TCnnn` that actually has a `.py` file, classify it by §3 and
   `git mv` it into `governance/modules/<MOD>/testsprite/tests/TCnnn_<slug>.py`,
   overwriting a same-named file from a prior run if present.
3. `git mv` `standard_prd.json`, `testsprite_frontend_test_plan.json`, and
   both report files as a set into a new
   `governance/testsprite/runs/<YYYY-MM-DD>-frontend/` folder.
4. Confirm `testsprite_tests/` now contains nothing but the gitignored
   `tmp/` folder.

**Never**:
- Hand-edit a `.py` file already archived under
  `governance/modules/<MOD>/testsprite/tests/` to change what flow it
  tests, or to make a genuinely new flow pass — regenerate through
  TestSprite and re-archive instead. The one sanctioned exception —
  keeping an existing test's locators/assertions in sync after a real UI
  change so it keeps passing — is §5, not a loophole to rewrite flows by
  hand.
- Leave a run's PRD/plan/report at the root of `testsprite_tests/` once the
  run is closed out.
- Invent a different folder shape than §2 without a human decision, per
  the STRUCTURAL LAW referenced from this repo's `governance/CLAUDE.md`.

---

## 5. Keeping archived tests in sync with code changes

The whole point of §2's durable archive is that any test in it can be
re-run at any time (`governance/testsprite/prompts/rerun-tests.md`) and
still mean something. A UI change that quietly breaks an archived test's
locators or assertions — without anyone touching the test — defeats that.

**Before finishing any frontend code change**, check whether it touches
something an archived test exercises:

1. Identify the module the change belongs to (per §3's screen/flow table).
2. Search that module's `governance/modules/<MOD>/testsprite/tests/*.py`
   for the element id, role/name, label text, or route the change affects
   (`grep -rl` for the id/text is enough — these are small, flat,
   self-contained scripts using `page.locator(...)`, `get_by_role(...)`,
   `to_contain_text(...)`, etc.).
3. If nothing matches, there's nothing to do.
4. If a test matches and your change alters what it locates or asserts —
   a renamed `id`/label, a changed button/role name, moved or restructured
   markup a locator's xpath depends on, changed copy a `to_contain_text`
   check asserts on, an added/removed step in the flow (e.g. a new confirm
   dialog) — **update that test file's locator/assertion in the same
   change**, minimally, to match the new UI. This is a direct edit to the
   archived `.py` file — allowed specifically for this case, unlike the
   general "never hand-edit" rule in §4.
5. Re-run the updated test (via `rerun-tests.md`, scoped to that file or
   module, with both the backend and the dev server running) against the
   changed UI before considering the code change done. A patched-but-never-
   executed test is not verified.
6. If the change is big enough that patching would mean rewriting the
   scenario's actual flow (not just updated selectors) — e.g. the screen's
   purpose changed, a multi-step flow gained/lost a step, navigation was
   restructured — prefer regenerating that scenario through TestSprite
   (`start-tests.md`) over hand-authoring a new flow. Say so instead of
   forcing a hand patch.

Never ship a UI change that leaves an archived test targeting an element
or asserting text that no longer exists — either fix the test in the same
change or flag it explicitly as a known, intentional break for the human
to resolve. Silently leaving it to fail on the next re-run is not
acceptable.

---

## 6. Related

- Ready prompts: `governance/testsprite/prompts/start-tests.md` (fresh
  run), `governance/testsprite/prompts/rerun-tests.md` (re-execute already
  generated tests, no regeneration), and
  `governance/testsprite/prompts/fix-bugs.md` (diagnose → fix → re-run
  loop for failures reported by either of the above, per §5's sync rule).
- Backend's mirrored doc and full cleanup event log:
  `backend/governance/testsprite/TESTSPRITE-GOVERNANCE.md`.
- Module ownership authority: `backend/governance/master-registry.md`.
