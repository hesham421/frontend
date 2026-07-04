---
name: avelynq-design
description: Use this skill to generate well-branded interfaces and assets for AVELYNQ, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping the AVELYNQ enterprise ERP brand.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

AVELYNQ is an enterprise ERP software brand. Its identity is **disciplined, structured, stable, composed, timeless, and enterprise-grade** — navy foundation, Avelynq Blue (trust), teal ascent accent (growth), IBM Plex typography, restrained semantic colors, navy-tinted low shadows, no startup/consumer styling, no emoji in UI, bilingual EN/AR with RTL parity.

Key files:
- `readme.md` — full design guide: company context, content fundamentals, visual foundations, iconography, manifest.
- `styles.css` + `tokens/` — design tokens (colors, type, spacing, elevation, fonts). Link `styles.css` and use semantic CSS variables.
- `components/` — React UI primitives (Button, IconButton, Input, Select, Checkbox, Switch, Card, Stat, Badge, Avatar, Alert, EmptyState, Tabs, Breadcrumb).
- `ui_kits/erp/` — full interactive application recreation (login, dashboard, chart of accounts, account form).
- `guidelines/` — foundation specimen cards.
- `assets/` — logos and brand marks.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. Use Tabler Icons (`ti ti-*`) via CDN for iconography. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
