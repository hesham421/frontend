<!-- Source: PHASE:ALIGN-FE -->

# PHASE ALIGN-FE — Frontend Internal Consistency Gate (auto-runs after SEC-FE)

ALIGN-FE validates this plan against ITSELF and against real API Docs + srs.md B1-B4.
External cross-artifact validation (vs flow-diagram.md/ui-ux-spec.md as design intent)
is Project 4.2 scope — not re-litigated here.

```
MODEL/API CHECKS (F1/F2)                                     │ Status
───────────────────────────────────────────────────────────────┴──────────
Every SCR-ID has an F1 model spec (7/7)                      │ ✓
Every model confirmed against real API DTO, mismatches fixed │ ✓ (FINDING-3)
Every API-ID (44/44) has an F2-QUERY block matching a real    │
  endpoint (including the POST-search deviation, FINDING-5)  │ ✓
Every LOV-ID (6/6) has an F2-LOV-QUERY block                  │ ✓
LOV-ORG-007 does NOT exist — correctly absent, not invented  │ ✓ (FINDING-1/2)
Facade state: currentPage/pageSize derived, not separate      │ ✓
Error routing declared (400/409/401/403/500)                  │ ✓
Pre-deactivation check declared for every deactivate op (7/7) │ ✓ (server-enforced)

VALIDATION CHECKS (F3)                                        │ Status
───────────────────────────────────────────────────────────────┴──────────
Every RULE-ID (20/20) has an F3-VALIDATION block               │ ✓
Every F3 block declares an ERR-ID or explicit NOT ASSIGNED     │ ⚠ PARTIAL — no
  status (no invented ERR-IDs, per HR-5)                       │   Error Catalog this
                                                                │   session (DRV-4)
No hardcoded message text — SRS Message-AR/EN quoted verbatim │ ✓

ROUTING/COMPONENT CHECKS (F4)                                 │ Status
───────────────────────────────────────────────────────────────┴──────────
Every SCR-ID (7/7) has an F4-SCREEN block                      │ ✓
F4-SCREEN documents real Shell structure, not fresh redesign  │ ✓
Tree-bearing entities (2/2: Departments, CostCenters) declare │ ✓ (target path
  a tree route ordered before /:id/*                          │   convention only —
                                                                │   no router exists yet)
All routes wrapped in guard                                    │ ✓ — implemented in
                                                                │   F4 (SCR-ORG-001..007):
                                                                │   can('PERM_X_VIEW')
                                                                │   guards added to all 7
                                                                │   org-* cases in
                                                                │   App.tsx's
                                                                │   renderCurrentScreen()
PERM_* in F4 sourced from Permissions Matrix, none invented     │ ✓ (with FINDING-4
                                                                │   correction applied)
No 'Page'/'Container' suffix violations                        │ ✓ (Shell already uses
                                                                │   'Page' suffix correctly)

SEC-FE CHECKS                                                  │ Status
───────────────────────────────────────────────────────────────┴──────────
Every SCR-ID (7/7) has route guard spec + permission-based UI  │ ✓
EXCEPTION module interfaces respected                          │ ✓ (n/a — no EXCEPTION
                                                                │   entities in ORG)

TEST-FE COVERAGE CHECKS (Summary validation)                   │ Status
───────────────────────────────────────────────────────────────┴──────────
TC Coverage Matrix Summary (frontend) present                  │ ✓ (see SECTION D below)
No GAP ✗ entries without a DEFERRED note                      │ ✓ (regionTypeIdFk create/
                                                                │   edit explicitly DEFERRED)
NOTE: Full TC block validation is Project 4.2 CHECK-4 scope
============================================================================
ALIGN-FE GATE RESULT: PASSED ✓ — with 1 documented ⏸ item (not ✗ failures):
  ✓ F4 route guards — RESOLVED during F4 execution (SCR-ORG-001..007): can('PERM_X_VIEW')
    guards now wired for all 7 screens in App.tsx's renderCurrentScreen()
  ⏸ F3 ERR-ID binding — no Error Catalog available this session (DRV-4); SRS
    Message-AR/EN used as interim binding, to be replaced once SVC+API exists
Auto-correction applied: DRV-1 (LegalEntity.entityTypeId code), DRV-2 (Branch.
  branchTypeId codes), DRV-3 (audit fields added to all 7 models) — see Derivation Log
============================================================================
```

**Table — Operations Coverage (UI/Route view), all 44 APIs:**

| Operation | API-ID | UI Action (SCR-ID) | F4 Route (target) | TC-FE-ID | Status |
|---|---|---|---|---|---|
| Create | API-ORG-001 | SCR-ORG-001 Create Legal Entity | /legal-entities | TC-FE-ORG-001 | ✓ |
| Search | API-ORG-002 | SCR-ORG-001 Search Legal Entities | /legal-entities | TC-FE-ORG-002 | ✓ |
| Update | API-ORG-003 | SCR-ORG-001 Update Legal Entity | /legal-entities | TC-FE-ORG-003 | ✓ |
| Deactivate | API-ORG-004 | SCR-ORG-001 Deactivate Legal Entity | /legal-entities | TC-FE-ORG-004 | ✓ |
| Activate | API-ORG-005 | SCR-ORG-001 Activate Legal Entity | /legal-entities | TC-FE-ORG-005 | ✓ |
| Get | API-ORG-006 | SCR-ORG-001 Get Legal Entity by ID | /legal-entities | TC-FE-ORG-006 | ✓ |
| Create | API-ORG-007 | SCR-ORG-002 Create Branch | /branches | TC-FE-ORG-007 | ✓ |
| Search | API-ORG-008 | SCR-ORG-002 Search Branches | /branches | TC-FE-ORG-008 | ✓ |
| Update | API-ORG-009 | SCR-ORG-002 Update Branch | /branches | TC-FE-ORG-009 | ✓ |
| Deactivate | API-ORG-010 | SCR-ORG-002 Deactivate Branch | /branches | TC-FE-ORG-010 | ✓ |
| Activate | API-ORG-011 | SCR-ORG-002 Activate Branch | /branches | TC-FE-ORG-011 | ✓ |
| Get | API-ORG-012 | SCR-ORG-002 Get Branch by ID | /branches | TC-FE-ORG-012 | ✓ |
| Create | API-ORG-013 | SCR-ORG-003 Create Region | /regions | TC-FE-ORG-013 | ✓ |
| Search | API-ORG-014 | SCR-ORG-003 Search Regions | /regions | TC-FE-ORG-014 | ✓ |
| Update | API-ORG-015 | SCR-ORG-003 Update Region | /regions | TC-FE-ORG-015 | ✓ |
| Deactivate | API-ORG-016 | SCR-ORG-003 Deactivate Region | /regions | TC-FE-ORG-016 | ✓ |
| Activate | API-ORG-017 | SCR-ORG-003 Activate Region | /regions | TC-FE-ORG-017 | ✓ |
| Get | API-ORG-018 | SCR-ORG-003 Get Region by ID | /regions | TC-FE-ORG-018 | ✓ |
| Create | API-ORG-019 | SCR-ORG-004 Create Department | /departments | TC-FE-ORG-019 | ✓ |
| Get | API-ORG-020 | SCR-ORG-004 Get Department tree | /departments/tree | TC-FE-ORG-020 | ✓ |
| Search | API-ORG-021 | SCR-ORG-004 Search Departments (flat) | /departments | TC-FE-ORG-021 | ✓ |
| Update | API-ORG-022 | SCR-ORG-004 Update Department | /departments | TC-FE-ORG-022 | ✓ |
| Deactivate | API-ORG-023 | SCR-ORG-004 Deactivate Department | /departments | TC-FE-ORG-023 | ✓ |
| Activate | API-ORG-024 | SCR-ORG-004 Activate Department | /departments | TC-FE-ORG-024 | ✓ |
| Get | API-ORG-025 | SCR-ORG-004 Get Department by ID | /departments | TC-FE-ORG-025 | ✓ |
| Create | API-ORG-026 | SCR-ORG-005 Create Cost Center | /cost-centers | TC-FE-ORG-026 | ✓ |
| Get | API-ORG-027 | SCR-ORG-005 Get Cost Center tree | /cost-centers/tree | TC-FE-ORG-027 | ✓ |
| Search | API-ORG-028 | SCR-ORG-005 Search Cost Centers (flat) | /cost-centers | TC-FE-ORG-028 | ✓ |
| Update | API-ORG-029 | SCR-ORG-005 Update Cost Center | /cost-centers | TC-FE-ORG-029 | ✓ |
| Deactivate | API-ORG-030 | SCR-ORG-005 Deactivate Cost Center | /cost-centers | TC-FE-ORG-030 | ✓ |
| Activate | API-ORG-031 | SCR-ORG-005 Activate Cost Center | /cost-centers | TC-FE-ORG-031 | ✓ |
| Get | API-ORG-032 | SCR-ORG-005 Get Cost Center by ID | /cost-centers | TC-FE-ORG-032 | ✓ |
| Create | API-ORG-033 | SCR-ORG-006 Create Profit Center | /profit-centers | TC-FE-ORG-033 | ✓ |
| Search | API-ORG-034 | SCR-ORG-006 Search Profit Centers | /profit-centers | TC-FE-ORG-034 | ✓ |
| Update | API-ORG-035 | SCR-ORG-006 Update Profit Center | /profit-centers | TC-FE-ORG-035 | ✓ |
| Deactivate | API-ORG-036 | SCR-ORG-006 Deactivate Profit Center | /profit-centers | TC-FE-ORG-036 | ✓ |
| Activate | API-ORG-037 | SCR-ORG-006 Activate Profit Center | /profit-centers | TC-FE-ORG-037 | ✓ |
| Get | API-ORG-038 | SCR-ORG-006 Get Profit Center by ID | /profit-centers | TC-FE-ORG-038 | ✓ |
| Create | API-ORG-039 | SCR-ORG-007 Create Location Site | /location-sites | TC-FE-ORG-039 | ✓ |
| Search | API-ORG-040 | SCR-ORG-007 Search Location Sites | /location-sites | TC-FE-ORG-040 | ✓ |
| Update | API-ORG-041 | SCR-ORG-007 Update Location Site | /location-sites | TC-FE-ORG-041 | ✓ |
| Deactivate | API-ORG-042 | SCR-ORG-007 Deactivate Location Site | /location-sites | TC-FE-ORG-042 | ✓ |
| Activate | API-ORG-043 | SCR-ORG-007 Activate Location Site | /location-sites | TC-FE-ORG-043 | ✓ |
| Get | API-ORG-044 | SCR-ORG-007 Get Location Site by ID | /location-sites | TC-FE-ORG-044 | ✓ |

Note: F4 Route above is the target convention (F4-RULE-1), not a live react-router
path yet — see F4 phase's structural note. TC-FE-IDs are placeholders (Section 8.6),
assigned for real in frontend-test-plan.md.

