# Frontend Governance — Housekeeping & Reporting

This file documents two standing conventions for this repo's `governance/`
tree, mirrored from `backend/CLAUDE.md`'s equivalent sections so both repos
follow the same rules independently.

---

## Housekeeping — Files to Delete Proactively

These carry no functional value in this repo. Delete them on sight instead of
letting them accumulate — do not wait for an explicit cleanup request.

| Pattern | Why it's junk | How to clear it |
|---|---|---|
| `.DS_Store` (anywhere, including inside `node_modules/`, `.git/`) | macOS Finder metadata; already in `.gitignore`; never tracked | `find . -iname ".DS_Store" -delete` |
| `dist/`, `build/` (if/when present) | Vite build output, regenerated on demand | Safe to delete anytime |
| `*.log` (if/when present) | Runtime/dev-server log output | Delete once no longer needed for the debugging session that produced them |

**Do NOT delete** (empty but load-bearing): `.gitkeep` files under
`governance/modules/**` — they keep otherwise-empty scaffolding directories
tracked in git.

---

## Reporting / Non-Impacting Markdown Files — ALWAYS under `project-artifacts/`

Any markdown file that is purely informational — a report, an investigation
note, a design-decision writeup, an audit summary — and does not itself drive
generation, execution, or another agent's behavior, belongs under:

```
governance/project-artifacts/
```

Never at the root of `governance/`, never inside `modules/<MOD>/`, and never
inside `.claude/commands/`. This keeps the folders that ARE read by agents
(`modules/`, `.claude/commands/`, `governance-tools/`) free of files that
exist only for a human to read later. This mirrors the backend's rule (see
`backend/CLAUDE.md`'s "STRUCTURAL LAW" ownership table) — flat, same as
backend's own `project-artifacts/`, no nested per-repo subfolder.

---

## TestSprite Tests

`frontend/testsprite_tests/` is TestSprite's own scratch working directory
(fixed path, not relocatable) — treat it as ephemeral. The durable,
module-organized archive of generated tests lives under
`governance/modules/<MOD>/testsprite/tests/`, and each run's full PRD +
test plan + report bundle is archived under
`governance/testsprite/runs/<date>-frontend/`. Full mechanism, the
module-classification rule, the standing before/after-run procedure, and
the two ready prompts (`start-tests.md` / `rerun-tests.md`) are documented
in `governance/testsprite/TESTSPRITE-GOVERNANCE.md` — read it before
running TestSprite or touching anything under `testsprite_tests/`.

---

## Code Comments — No Banners, No Oversized Javadoc/JSDoc

- NEVER write banner/section-divider comments (`// ==== Section ====`, a
  repeated-character line used to slice one file into visual sections). A
  file that feels like it needs dividers should be split into smaller
  files/components instead.
- NEVER write a JSDoc/comment block longer than ~5 lines, and never restate
  what a well-named function/component/prop already says. Document the one
  non-obvious thing — a hidden constraint, a workaround, a subtle
  invariant — or don't comment at all.
