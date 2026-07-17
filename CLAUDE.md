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
2. For a module's PLAYWRIGHT test scenarios, read
   `governance/modules/[MODULE]/execution-state.json` (frontend-owned copy,
   PLAYWRIGHT phase only) and `governance/modules/[MODULE]/packages/test/PLAYWRIGHT/`.
3. The AVELYNQ design-system skill at `design-system/avelynq-source/SKILL.md`
   is local to this repository already — it is unrelated to the
   governance-repo skill-routing system and was never moved.

**Most governance content (P0-P3 planning docs, packages/execution/ — including
the F1-F4 frontend-implementation phase specs — and JUNIT backend tests) now
lives in `backend/governance/`, not here.** This repo's `governance/` folder
only carries the frontend-specific slice (PLAYWRIGHT scenarios + frontend
skills) per the backend/frontend governance split. If you need execution-plan
content, phase specs, or anything from `packages/execution/`, look in
`backend/governance/modules/[MODULE]/` instead — it is not duplicated here.

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
| PLAYWRIGHT test scenarios (per module) | `governance/modules/[MODULE]/packages/test/PLAYWRIGHT/` |
| Module execution state (frontend/PLAYWRIGHT slice) | `governance/modules/[MODULE]/execution-state.json` |
| Backend skills | not here — `backend/governance/.github/skills/backend/` |
| Execution-plan / F1-F4 phase specs | not here — `backend/governance/modules/[MODULE]/packages/execution/` |
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
