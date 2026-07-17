<!-- Source: MARK:PLAYWRIGHT / SUB:INT-FLOW -->
<!-- Context: see PLAYWRIGHT-HEADER.md for mark-level intro and mandatory scenarios -->

### SUB:INT-FLOW — Module Integration Flow (TP-SEC-4, adapted to NotificationTemplate lifecycle — the only entity with a full Create→Update→Deactivate flow in this module)

<!-- TC:TC-NOTIF-035:START -->
```
TC-NOTIF-035 — MANDATORY-P-4, part 1: Create → Search (verify appears)
─────────────────────────────────────────────────────────────────
API-ID       : API-NOTIF-007, API-NOTIF-006
RULE-ID      : —
SCR-ID       : SCR-NOTIF-002
ERR-ID       : —
LOV-ID       : —
─────────────────────────────────────────────────────────────────
Scenario type : Edge case
Data class    : VALID

Given         : Clean module state (no template with templateCode="INT_FLOW_TEST")
When          : User creates a template with templateCode="INT_FLOW_TEST" via
                the Entry form, then returns to Search and filters by that code
Then          : Exactly 1 result appears, matching the created template

ERR-ID        : —
Language      : —
Test-Hint     : —
XM-impact     : —
─────────────────────────────────────────────────────────────────
```
<!-- TC:TC-NOTIF-035:END -->

<!-- TC:TC-NOTIF-036:START -->
```
TC-NOTIF-036 — MANDATORY-P-4, part 2: Update → Search (verify updated)
─────────────────────────────────────────────────────────────────
API-ID       : API-NOTIF-008, API-NOTIF-006
RULE-ID      : —
SCR-ID       : SCR-NOTIF-002
ERR-ID       : —
LOV-ID       : —
─────────────────────────────────────────────────────────────────
Scenario type : State transition
Data class    : VALID

Given         : Continuing from TC-NOTIF-035 — "INT_FLOW_TEST" template exists
When          : User opens it from Search, changes templateNameEn, saves,
                re-searches
Then          : The updated templateNameEn is reflected in the search results grid

ERR-ID        : —
Language      : —
Test-Hint     : —
XM-impact     : —
─────────────────────────────────────────────────────────────────
```
<!-- TC:TC-NOTIF-036:END -->

<!-- TC:TC-NOTIF-037:START -->
```
TC-NOTIF-037 — MANDATORY-P-4, part 3: Deactivate → Search (verify removed from active list)
─────────────────────────────────────────────────────────────────
API-ID       : API-NOTIF-009, API-NOTIF-006
RULE-ID      : —
SCR-ID       : SCR-NOTIF-002
ERR-ID       : —
LOV-ID       : —
─────────────────────────────────────────────────────────────────
Scenario type : State transition
Data class    : VALID

Given         : Continuing from TC-NOTIF-036 — "INT_FLOW_TEST" template active
When          : User clicks Deactivate, confirms, then re-searches with
                isActiveFl=true filter (default active-only view)
Then          : "INT_FLOW_TEST" no longer appears in the active-only
                results (row still exists in DB with isActiveFl=false,
                per DATA+DOM — not deleted)

ERR-ID        : —
Language      : —
Test-Hint     : —
XM-impact     : —
─────────────────────────────────────────────────────────────────
```
<!-- TC:TC-NOTIF-037:END -->

