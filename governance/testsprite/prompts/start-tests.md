# Ready Prompt — Start a Fresh TestSprite Run (Frontend)

Use this to run TestSprite from scratch: it (re)generates the PRD, the test
plan, and every UI test file, then executes them headless against the app.
This **rewrites** whatever was in `testsprite_tests/` before — read
`governance/testsprite/TESTSPRITE-GOVERNANCE.md` first if you haven't.

Preconditions:
- The backend is running on `http://localhost:7272` (real API calls happen
  on login and most flows).
- The frontend dev server is running on `http://localhost:4200`
  (`npm run dev`).
- `TESTSPRITE_API_KEY` is exported in the shell that launched this session.

---

## Prompt

```
Read frontend/governance/testsprite/TESTSPRITE-GOVERNANCE.md in full before doing anything else.

Step 0 — housekeeping: check frontend/testsprite_tests/ for any .py files,
standard_prd.json, testsprite_frontend_test_plan.json, or report files left
over from a previous run that were never archived (i.e. anything other than
the tmp/ folder). If any exist, archive them first exactly per §4 of
TESTSPRITE-GOVERNANCE.md (classify each .py by §3's screen/module table,
git mv it into governance/modules/<MOD>/testsprite/tests/, and move the
PRD/plan/report trio into a new governance/testsprite/runs/<today>-frontend/
folder) before continuing. Do not skip this even if the folder looks mostly
empty — check.

Step 1 — confirm the backend answers at http://localhost:7272/actuator/health
and the frontend dev server answers at http://localhost:4200. If either
isn't up, stop and tell me instead of proceeding.

Step 2 — run the full TestSprite pipeline against this frontend using the
TestSprite MCP tools, in order:
  1. testsprite_bootstrap_tests — type=frontend, scope=codebase,
     localPort=4200, projectPath=<this repo's absolute path>.
  2. testsprite_generate_code_summary
  3. testsprite_generate_standardized_prd
  4. testsprite_generate_frontend_test_plan
  5. testsprite_generate_code_and_execute

Step 3 — once the run finishes, close it out per §4 "After a run finishes"
in TESTSPRITE-GOVERNANCE.md: for every TCnnn that actually produced a .py
file, classify it by §3, move it into its module's
governance/modules/<MOD>/testsprite/tests/, and move standard_prd.json +
testsprite_frontend_test_plan.json + both report files into
governance/testsprite/runs/<YYYY-MM-DD>-frontend/ using today's actual
date. Confirm testsprite_tests/ ends with nothing but tmp/ in it.

Step 4 — give me a short summary: how many cases were planned vs. actually
generated/executed, pass/fail count, and which modules they landed in.
```
