# Ready Prompt — Re-run Existing Tests (Frontend, No Regeneration)

Use this when you want to know if the **already-generated** UI tests still
pass against the current app — after a UI change, a fix, or just to
re-check — without asking TestSprite to regenerate anything (no new PRD, no
new test plan, no renumbering, no new files). This runs the archived `.py`
Playwright scripts directly, the same way TestSprite itself executes them
(each file is self-contained async Playwright and ends with
`asyncio.run(run_test())` — run the file as-is, don't wrap it in pytest).

Preconditions:
- The backend is running on `http://localhost:7272`.
- The frontend dev server is running on `http://localhost:4200`.
- You are not trying to test new/changed screens that don't have a
  generated test yet — this only re-executes what already exists. If the
  UI surface changed meaningfully, use `start-tests.md` instead.

---

## Prompt

```
Do not call any TestSprite MCP tool for this — no bootstrap, no
generate_code_summary, no generate_standardized_prd, no
generate_frontend_test_plan, no generate_code_and_execute. This is a plain
re-execution of tests that already exist under
frontend/governance/modules/*/testsprite/tests/ — nothing gets rewritten.

Step 1 — confirm the backend answers at http://localhost:7272/actuator/health
and the frontend dev server answers at http://localhost:4200. If either
isn't up, stop and tell me instead of proceeding.

Step 2 — [choose one]
  (a) Re-run every archived frontend TestSprite test: for each .py file
      under frontend/governance/modules/*/testsprite/tests/, run it with
      `python3 <path>` (needs the playwright Python package with browsers
      installed — check first, don't silently install) and record pass
      (clean exit) or fail (the assertion/exception) per file.
  (b) Re-run only module [NAME]: same as (a), but scoped to
      frontend/governance/modules/[NAME]/testsprite/tests/*.py.

Step 3 — report a simple table: file name, module, pass/fail, and for any
failure the assertion/exception message. Do not modify any .py file to make
it pass — if a test fails because the UI genuinely changed (a renamed
label, a moved element, a new confirm step), tell me that's a regression or
an intentional UI change to review, and point me at start-tests.md if
regenerating is actually what's needed.
```
