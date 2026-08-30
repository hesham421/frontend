# Ready Prompt — Fix Bugs Found by TestSprite (Frontend, Fix-and-Verify Loop)

Use this after a run (`start-tests.md`) or a re-run (`rerun-tests.md`)
reports failing tests. It drives a diagnose → fix → re-run loop until every
failure is genuinely resolved — either the UI/logic was actually wrong and
got fixed, or the test's expectation was legitimately outdated (a
deliberate, correct UI change) and got updated per
`TESTSPRITE-GOVERNANCE.md` §5. It never gets a test to go green by
weakening or bypassing the app's actual behavior.

Preconditions:
- You have a concrete list of failing tests and their actual error output
  (from `testsprite-mcp-test-report.md` for a fresh run, or from the table
  produced by `rerun-tests.md`). Don't start this without real failure
  output in hand.
- The backend is running on `http://localhost:7272` and the frontend dev
  server on `http://localhost:4200`.

---

## Prompt

```
I have TestSprite frontend test failures to fix. Failing tests and their
error output: [PASTE the failing test names + assertion/error/timeout
messages here — from the report or from rerun-tests.md's output table].

For EACH failing test, follow this loop. Do not skip the diagnosis step to
jump straight to a fix.

STEP 1 — Diagnose, don't guess.
  a. Open the test file itself at
     frontend/governance/modules/<MOD>/testsprite/tests/TCnnn_<slug>.py and
     read exactly what it does (which elements it fills/clicks) and
     exactly what it asserts.
  b. Reproduce the same flow by reading the actual component/page code it
     drives (and, if relevant, the query/mutation hook and API call behind
     it) to find the exact point where actual behavior diverges from the
     test's expectation.
  c. Classify the failure as exactly one of:
     - REAL BUG — the UI/logic genuinely doesn't do what it's supposed to:
       state doesn't update, a permission gate is wrong, a form validates
       incorrectly, a mutation call is wrong or missing, a confirm flow is
       broken. The app is wrong; the test's expectation is right.
     - STALE TEST — a deliberate, correct UI change moved/renamed an
       element, changed a label/heading's text, changed a role/name, or
       added/removed a legitimate step (e.g. a new confirm dialog) — and
       the test's locator/assertion is simply out of date. The test is
       wrong; the UI is right.
     - ENVIRONMENT ISSUE — not a real bug: dev server or backend not
       running, stale seeded data, a timing issue unrelated to app logic.
       Note it and move on — don't "fix" this by touching code or the
       test.
  d. If you cannot confidently tell which of the three it is, STOP and ask
     me — do not guess. Misclassifying a real bug as "stale test" hides
     the bug; misclassifying a stale test as "real bug" risks a wrong fix
     to working UI.

STEP 2 — Fix, respecting governance, only for REAL BUG.
  - Read governance/GOVERNANCE-RULES.md's skill-routing table first, then
    the specific skill(s) for whatever layer you're touching
    (create-queries / create-forms / create-components / create-routing /
    create-confirm-actions / enforce-permissions / enforce-state-management
    as applicable) — same as any other frontend change.
  - The fix must make the UI correctly implement the actual intended
    behavior. It must NOT: remove or loosen a permission/role check just
    to make an action succeed, hardcode a value the component should be
    deriving from real state/query data, silence a validation error
    instead of fixing why it fires wrong, or add a special case that only
    exists to satisfy this specific test's seeded admin/admin login.
  - If making the test pass would require contradicting the permission
    model, the state-management rules, or a documented business rule from
    the backend's master-registry.md — that's not a UI bug, it's a
    requirements conflict. STOP and flag it instead of forcing a change.
  - Note: Notifications screens are intentionally mock/local-state only as
    of this writing (create/update/delete resets on refresh) — that is
    expected behavior per the TestSprite bootstrap config, not a bug. Don't
    "fix" a failure there by wiring it to a real API without an explicit
    human decision to do so. Organization was mock/local-state too, but was
    rewired to real backend APIs (all 7 entities) on 2026-08-29 — treat its
    screens as real-API-backed like Security, not mock.
  - Keep the fix minimal and targeted at the one root cause — no unrelated
    refactoring while you're in a bug-fix pass.

STEP 2 (alt) — Update the test, only for STALE TEST.
  - Follow governance/testsprite/TESTSPRITE-GOVERNANCE.md §5 exactly:
    patch only the specific locator/assertion that's out of date (prefer
    role/text-based locators over brittle xpath if you're touching the
    line anyway), don't rewrite the scenario, and don't touch it at all if
    you're not fully sure the UI's new behavior is the intended one.

STEP 3 — Re-run and verify, every time, no exceptions.
  - Per rerun-tests.md's mechanism (no TestSprite MCP calls — direct
    `python3 <path>`, with the playwright Python package already
    installed), re-run the ONE test you just touched first. If it still
    fails, go back to STEP 1 — don't try a second blind fix on top of the
    first.
  - Once it passes, re-run every OTHER test in
    governance/modules/<MOD>/testsprite/tests/ for that same module — a
    fix must not break a sibling scenario in the same module (e.g. a
    shared layout/permission change touching multiple screens).
  - If the fix touched shared code (a shared component, a cross-cutting
    context/store, the auth/session layer), additionally re-run the
    archived tests of every module that consumes it.
  - Don't attempt more than 3 distinct fixes on the same test without
    stopping to report progress and ask how to proceed — a test still
    failing after 3 genuinely different diagnoses is a sign something
    bigger is wrong, not a reason to keep guessing.

STEP 4 — Report, once every failure in this batch is resolved or triaged.
  For each original failing test, state: REAL BUG (fixed, with a one-line
  summary of the actual root cause and the fix) / STALE TEST (updated,
  with what changed and why) / STILL OPEN (why, and what you need from me
  to proceed) / ENVIRONMENT ISSUE (what was wrong, whether it's resolved
  now). Then confirm the full affected module's archived suite passes
  end-to-end as a final regression check — not just the tests that were
  originally failing.
```
