<!-- Source: PHASE:F3 / PREAMBLE (before first SUB) -->

# PHASE F3 — Frontend Validation Rule Specifications

Open Questions: 3 active / see OQ Log above

**F3 shared rules declared once, referenced per screen below:**
```
F3-BC-RULE-1 — Business Code field (legalEntityCode/branchCode/regionCode/deptCode/
  costCenterCode/profitCenterCode/locationSiteCode): read-only on all 7 screens.
  Never part of user input — displayed only. Applies RULE-ORG-011/013/014.
F3-BC-RULE-2 — On create form: shown as a muted, read-only placeholder (not an input),
  per ui-ux-spec's "muted background" convention (distinguishes "never editable" from
  "not editable right now").
F3-BC-RULE-3 — On edit form: value from the GET response — shown, never editable.

F3-LOC-RULE-1 — No hardcoded message text — all keyed by ERR-ID → Error Catalog.
  NOTE: this session has no backend-execution-plan.md, so no canonical ERR-ID catalog
  was provided. Message text below is quoted directly from SRS A4 (Message-AR/EN) as
  an interim binding; the agent MUST replace with the real ERR-ID once SVC+API's
  Error Catalog is available — flagged as DRV-4 in the Derivation Log.
F3-LOC-RULE-2 — nameAr (NAME_AR col) / nameEn (NAME_EN col): separate inputs, RTL/LTR aware.
F3-LOC-RULE-3 — Locale detection: session preference → browser locale → default AR.

F3-SEC-RULE-1 — Field visibility/editability governed by screen permissions loaded at
  F2-SCREEN-INIT: canEdit=false → all fields read-only; canCreate=false → no new-record
  entry; canApprove=false → n/a (ORG has no approval workflow, A6 confirms no workflow).
```