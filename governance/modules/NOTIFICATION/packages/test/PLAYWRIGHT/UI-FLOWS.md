<!-- Source: MARK:PLAYWRIGHT / SUB:UI-FLOWS -->
<!-- Context: see PLAYWRIGHT-HEADER.md for mark-level intro and mandatory scenarios -->

### SUB:UI-FLOWS — Per-SCR-ID coverage (TP-SEC-3) + mandatory UI scenarios

<!-- TC:TC-NOTIF-028:START -->
```
TC-NOTIF-028 — SCR-NOTIF-001 happy UI flow (view history)
─────────────────────────────────────────────────────────────────
API-ID       : API-NOTIF-003
RULE-ID      : —
SCR-ID       : SCR-NOTIF-001
ERR-ID       : —
LOV-ID       : LOV-NOTIF-001, LOV-NOTIF-002
─────────────────────────────────────────────────────────────────
Scenario type : Happy path
Data class    : VALID

Given         : Current user has 4 notifications in history
When          : SCR-NOTIF-001 bell dropdown opened
Then          : History list renders 4 rows with notificationTypeId,
                subject, notificationStatusId, sentAt/createdAt visible

ERR-ID        : —
Language      : —
Test-Hint     : —
XM-impact     : —
─────────────────────────────────────────────────────────────────
```
<!-- TC:TC-NOTIF-028:END -->

<!-- TC:TC-NOTIF-029:START -->
```
TC-NOTIF-029 — SCR-NOTIF-002 happy UI flow (search templates)
─────────────────────────────────────────────────────────────────
API-ID       : API-NOTIF-006
RULE-ID      : —
SCR-ID       : SCR-NOTIF-002
ERR-ID       : —
LOV-ID       : LOV-NOTIF-001
─────────────────────────────────────────────────────────────────
Scenario type : Happy path
Data class    : VALID

Given         : 3 templates exist
When          : SCR-NOTIF-002 opens, user filters by channelTypeId="EMAIL"
Then          : Result grid shows only EMAIL-channel templates; pagination
                controls reflect the filtered count

ERR-ID        : —
Language      : —
Test-Hint     : —
XM-impact     : —
─────────────────────────────────────────────────────────────────
```
<!-- TC:TC-NOTIF-029:END -->

<!-- TC:TC-NOTIF-030:START -->
```
TC-NOTIF-030 — SCR-NOTIF-002 create via UI (template form submit → success)
─────────────────────────────────────────────────────────────────
API-ID       : API-NOTIF-007
RULE-ID      : —
SCR-ID       : SCR-NOTIF-002
ERR-ID       : —
LOV-ID       : LOV-NOTIF-001
─────────────────────────────────────────────────────────────────
Scenario type : Happy path
Data class    : VALID

Given         : User has PERM_NOTIFICATION_TEMPLATE_CREATE, on the Entry
                form (navigated from Search view)
When          : User fills templateCode, both name fields, channelTypeId,
                moduleCode, and both body fields, clicks Save
Then          : Form closes, new template appears in the search results
                grid without a full page reload

ERR-ID        : —
Language      : —
Test-Hint     : —
XM-impact     : —
─────────────────────────────────────────────────────────────────
```
<!-- TC:TC-NOTIF-030:END -->

<!-- TC:TC-NOTIF-031:START -->
```
TC-NOTIF-031 — MANDATORY-P-1 + rule violation on UI: missing bilingual body
─────────────────────────────────────────────────────────────────
API-ID       : API-NOTIF-007
RULE-ID      : RULE-NOTIF-006
SCR-ID       : SCR-NOTIF-002
ERR-ID       : ERR-NOTIF-0002
LOV-ID       : —
─────────────────────────────────────────────────────────────────
Scenario type : Arabic message
Data class    : INVALID

Given         : User locale = AR, Entry form open, templateBodyAr filled,
                templateBodyEn left empty
When          : User clicks Save
Then          : Inline error shows "يجب توفير نص القالب بالعربي والإنجليزي
                معاً" (Arabic, primary) with the English equivalent also
                visible; form remains open, no template created

ERR-ID        : ERR-NOTIF-0002
Language      : BOTH
Test-Hint     : —
XM-impact     : —
─────────────────────────────────────────────────────────────────
```
<!-- TC:TC-NOTIF-031:END -->

<!-- TC:TC-NOTIF-032:START -->
```
TC-NOTIF-032 — SCR-NOTIF-003 happy UI flow (toggle a channel)
─────────────────────────────────────────────────────────────────
API-ID       : API-NOTIF-011, API-NOTIF-012
RULE-ID      : —
SCR-ID       : SCR-NOTIF-003
ERR-ID       : —
LOV-ID       : LOV-NOTIF-001
─────────────────────────────────────────────────────────────────
Scenario type : Happy path
Data class    : VALID

Given         : SCR-NOTIF-003 open, all 5 channels listed, user has
                PERM_NOTIFICATION_CHANNEL_CONFIG_UPDATE
When          : User toggles SMS's isEnabledFl off and saves
Then          : SMS row shows disabled state; API-NOTIF-012 called with
                isEnabledFl=false; other 4 rows unaffected

ERR-ID        : —
Language      : —
Test-Hint     : —
XM-impact     : —
─────────────────────────────────────────────────────────────────
```
<!-- TC:TC-NOTIF-032:END -->

<!-- TC:TC-NOTIF-033:START -->
```
TC-NOTIF-033 — MANDATORY-P-2: Composite Screen UX separation (CORE-9)
─────────────────────────────────────────────────────────────────
API-ID       : —
RULE-ID      : —
SCR-ID       : SCR-NOTIF-002
ERR-ID       : —
LOV-ID       : —
─────────────────────────────────────────────────────────────────
Scenario type : Edge case
Data class    : VALID

Given         : SCR-NOTIF-002 (PATTERN-1 Search+Entry) opened
Then          : Search view renders only filter inputs + result grid;
                the Entry form (templateBodyAr/En, etc.) is NOT rendered
                on the Search view; Entry is reached only via a
                navigation action (row click or "New" button)

ERR-ID        : —
Language      : —
Test-Hint     : —
XM-impact     : —
─────────────────────────────────────────────────────────────────
```
<!-- TC:TC-NOTIF-033:END -->

<!-- TC:TC-NOTIF-034:START -->
```
TC-NOTIF-034 — MANDATORY-P-3: Permission enforcement (UI level)
─────────────────────────────────────────────────────────────────
API-ID       : —
RULE-ID      : —
SCR-ID       : SCR-NOTIF-002
ERR-ID       : —
LOV-ID       : —
─────────────────────────────────────────────────────────────────
Scenario type : Permission
Data class    : VALID

Given         : User WITHOUT PERM_NOTIFICATION_TEMPLATE_CREATE
When          : SCR-NOTIF-002 renders
Then          : "New Template" button is not rendered; Search/list
                remains visible (VIEW permission still present)

ERR-ID        : —
Language      : —
Test-Hint     : —
XM-impact     : —
─────────────────────────────────────────────────────────────────
```
<!-- TC:TC-NOTIF-034:END -->

**Note on SCR-NOTIF-001 (Bell + History):** No dedicated "create via UI" or
"rule violation on UI" TC is generated for this screen — it is a read + action
screen (PATTERN-3) with no Entry form to submit invalid data against (SRS B2/B4
confirm no manual create exists for NotificationLog). TC-NOTIF-028 (happy UI
flow) is its sole UI-Flow coverage; not invented beyond what the screen supports.

