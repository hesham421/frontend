<!-- Source: PHASE:SEC-FE -->

# PHASE SEC-FE — Frontend Security Specifications

Open Questions: 3 active / see OQ Log above

Note (v2.0 split): backend API-level enforcement lives in
PROJECT-3-BACKEND-ENGINE.md Phase SEC-BE (not generated this session — no
backend-execution-plan.md was provided; permission names below are sourced directly
from SRS B4 / registry-srs-org.md's Permissions table, cross-checked against the
real endpoints' "Required permission(s)" annotations — see FINDING-4).

### SEC-FE — SCR-ORG-001 — Legal Entities
─────────────────────────────────────────────────────────────────
Screen guard     : navigation to org-entities requires canView = true
                   canView = false → redirect to unauthorized

Permission-based UI behavior:
  canView   = false → blocked at navigation — unauthorized redirect
  canCreate = false → New button / create entry point not shown
  canEdit   = false → all edit fields read-only, Save not available;
                       Deactivate/Activate buttons ALSO hidden (FINDING-4: real
                       backend gates these on LEGAL_ENTITY_UPDATE, i.e. canEdit — NOT
                       canDelete/LEGAL_ENTITY_DELETE, which the real backend never checks)
  canDelete = false → no UI effect in this module (see above) — LEGAL_ENTITY_DELETE is
                       SEC-3-seeded but not wired to any control; OQ-ORG-003 tracks
                       the discrepancy for backend/product resolution
  canApprove= n/a   → ORG has no approval workflow (SRS A6 confirms no workflow)

EXCEPTION module scope: none — ORG-001 is a ROOT MODULE with no EXCEPTION entities
─────────────────────────────────────────────────────────────────

### SEC-FE — SCR-ORG-002 — Branches
─────────────────────────────────────────────────────────────────
Screen guard     : navigation to org-branches requires canView = true
                   canView = false → redirect to unauthorized

Permission-based UI behavior:
  canView   = false → blocked at navigation — unauthorized redirect
  canCreate = false → New button / create entry point not shown
  canEdit   = false → all edit fields read-only, Save not available;
                       Deactivate/Activate buttons ALSO hidden (FINDING-4: real
                       backend gates these on BRANCH_UPDATE, i.e. canEdit — NOT
                       canDelete/BRANCH_DELETE, which the real backend never checks)
  canDelete = false → no UI effect in this module (see above) — BRANCH_DELETE is
                       SEC-3-seeded but not wired to any control; OQ-ORG-003 tracks
                       the discrepancy for backend/product resolution
  canApprove= n/a   → ORG has no approval workflow (SRS A6 confirms no workflow)

EXCEPTION module scope: none — ORG-001 is a ROOT MODULE with no EXCEPTION entities
─────────────────────────────────────────────────────────────────

### SEC-FE — SCR-ORG-003 — Regions
─────────────────────────────────────────────────────────────────
Screen guard     : navigation to org-regions requires canView = true
                   canView = false → redirect to unauthorized

Permission-based UI behavior:
  canView   = false → blocked at navigation — unauthorized redirect
  canCreate = false → New button / create entry point not shown
  canEdit   = false → all edit fields read-only, Save not available;
                       Deactivate/Activate buttons ALSO hidden (FINDING-4: real
                       backend gates these on REGION_UPDATE, i.e. canEdit — NOT
                       canDelete/REGION_DELETE, which the real backend never checks)
  canDelete = false → no UI effect in this module (see above) — REGION_DELETE is
                       SEC-3-seeded but not wired to any control; OQ-ORG-003 tracks
                       the discrepancy for backend/product resolution
  canApprove= n/a   → ORG has no approval workflow (SRS A6 confirms no workflow)

EXCEPTION module scope: none — ORG-001 is a ROOT MODULE with no EXCEPTION entities
─────────────────────────────────────────────────────────────────

### SEC-FE — SCR-ORG-004 — Departments
─────────────────────────────────────────────────────────────────
Screen guard     : navigation to org-departments requires canView = true
                   canView = false → redirect to unauthorized

Permission-based UI behavior:
  canView   = false → blocked at navigation — unauthorized redirect
  canCreate = false → New button / create entry point not shown
  canEdit   = false → all edit fields read-only, Save not available;
                       Deactivate/Activate buttons ALSO hidden (FINDING-4: real
                       backend gates these on DEPARTMENT_UPDATE, i.e. canEdit — NOT
                       canDelete/DEPARTMENT_DELETE, which the real backend never checks)
  canDelete = false → no UI effect in this module (see above) — DEPARTMENT_DELETE is
                       SEC-3-seeded but not wired to any control; OQ-ORG-003 tracks
                       the discrepancy for backend/product resolution
  canApprove= n/a   → ORG has no approval workflow (SRS A6 confirms no workflow)

EXCEPTION module scope: none — ORG-001 is a ROOT MODULE with no EXCEPTION entities
─────────────────────────────────────────────────────────────────

### SEC-FE — SCR-ORG-005 — Cost Centers
─────────────────────────────────────────────────────────────────
Screen guard     : navigation to org-cost-centers requires canView = true
                   canView = false → redirect to unauthorized

Permission-based UI behavior:
  canView   = false → blocked at navigation — unauthorized redirect
  canCreate = false → New button / create entry point not shown
  canEdit   = false → all edit fields read-only, Save not available;
                       Deactivate/Activate buttons ALSO hidden (FINDING-4: real
                       backend gates these on COST_CENTER_UPDATE, i.e. canEdit — NOT
                       canDelete/COST_CENTER_DELETE, which the real backend never checks)
  canDelete = false → no UI effect in this module (see above) — COST_CENTER_DELETE is
                       SEC-3-seeded but not wired to any control; OQ-ORG-003 tracks
                       the discrepancy for backend/product resolution
  canApprove= n/a   → ORG has no approval workflow (SRS A6 confirms no workflow)

EXCEPTION module scope: none — ORG-001 is a ROOT MODULE with no EXCEPTION entities
─────────────────────────────────────────────────────────────────

### SEC-FE — SCR-ORG-006 — Profit Centers
─────────────────────────────────────────────────────────────────
Screen guard     : navigation to org-profit-centers requires canView = true
                   canView = false → redirect to unauthorized

Permission-based UI behavior:
  canView   = false → blocked at navigation — unauthorized redirect
  canCreate = false → New button / create entry point not shown
  canEdit   = false → all edit fields read-only, Save not available;
                       Deactivate/Activate buttons ALSO hidden (FINDING-4: real
                       backend gates these on PROFIT_CENTER_UPDATE, i.e. canEdit — NOT
                       canDelete/PROFIT_CENTER_DELETE, which the real backend never checks)
  canDelete = false → no UI effect in this module (see above) — PROFIT_CENTER_DELETE is
                       SEC-3-seeded but not wired to any control; OQ-ORG-003 tracks
                       the discrepancy for backend/product resolution
  canApprove= n/a   → ORG has no approval workflow (SRS A6 confirms no workflow)

EXCEPTION module scope: none — ORG-001 is a ROOT MODULE with no EXCEPTION entities
─────────────────────────────────────────────────────────────────

### SEC-FE — SCR-ORG-007 — Location Sites
─────────────────────────────────────────────────────────────────
Screen guard     : navigation to org-locations requires canView = true
                   canView = false → redirect to unauthorized

Permission-based UI behavior:
  canView   = false → blocked at navigation — unauthorized redirect
  canCreate = false → New button / create entry point not shown
  canEdit   = false → all edit fields read-only, Save not available;
                       Deactivate/Activate buttons ALSO hidden (FINDING-4: real
                       backend gates these on LOCATION_SITE_UPDATE, i.e. canEdit — NOT
                       canDelete/LOCATION_SITE_DELETE, which the real backend never checks)
  canDelete = false → no UI effect in this module (see above) — LOCATION_SITE_DELETE is
                       SEC-3-seeded but not wired to any control; OQ-ORG-003 tracks
                       the discrepancy for backend/product resolution
  canApprove= n/a   → ORG has no approval workflow (SRS A6 confirms no workflow)

EXCEPTION module scope: none — ORG-001 is a ROOT MODULE with no EXCEPTION entities
─────────────────────────────────────────────────────────────────

**SEC-FE Governance Rules (shared, referenced not redeclared per screen):**
```
SEC-IMPL-RULE-2 — All UI show/hide decisions reference permission flags loaded at
  F2-SCREEN-INIT.
SEC-IMPL-RULE-3 — HTTP 403 responses caught and shown as localized message, routed
  per the F2 error routing table.
```

