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
`backend/CLAUDE.md`'s "STRUCTURAL LAW" ownership table, which names this
path as `frontend/governance/project-artifacts/frontend/` from the backend
repo's point of view — from inside this repo it's simply
`governance/project-artifacts/`).
