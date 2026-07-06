# ERP Frontend

This is the **frontend** repository. It contains only Angular source code, build
configuration, Nginx config, and the frontend Dockerfile.

> **Governance is external.**
> All AI skills, coding standards, architecture rules, and execution protocols
> live in the `governance-repo` repository. Do NOT recreate them here.

---

## External Dependency

This repository depends on **governance-repo**.

Before generating any code:

1. Confirm `governance-repo` is available in the workspace (see layout below).
2. Read `governance-repo/CLAUDE.md` — it is the canonical AI governance document.
3. Load the required skill from `governance-repo/.github/skills/frontend/<skill-name>/SKILL.md`.
4. Load architecture context from `governance-repo/.github/context/frontend.md`.

If `governance-repo` is missing:
- Stop implementation.
- Explain the missing dependency.
- Never recreate governance artifacts locally.
- Never duplicate governance files.

---

## Workspace Layout

This repository is one of four sibling repositories that form the ERP platform:

```
workspace/
  backend/
  frontend/          ← this repository
  deploy/
  governance-repo/
```

The repositories are independent — there is no monorepo root above them.

---

## Where to Find Governance

| Governance artifact | Location |
|---------------------|----------|
| Frontend skills | `governance-repo/.github/skills/frontend/` |
| Backend skills | `governance-repo/.github/skills/backend/` |
| Frontend architecture context | `governance-repo/.github/context/frontend.md` |
| Master entity registry | `governance-repo/master-registry.md` |
| AI commands | `governance-repo/.claude/commands/` |
| Task routing table | `governance-repo/CLAUDE.md` |
| Execution protocol | `governance-repo/CLAUDE.md` |

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
