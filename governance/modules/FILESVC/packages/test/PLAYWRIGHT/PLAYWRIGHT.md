<!-- Source: MARK:PLAYWRIGHT -->

## MARK:PLAYWRIGHT — UI + Integration tests executed via Playwright

Threshold check: 6 TCs ≤ 8 → no SUB split required; all TCs directly under MARK:PLAYWRIGHT.

<!-- TC:TC-FILE-026:START -->
```
TC-FILE-026 — SCR-FILE-001 happy UI flow (view file list)
─────────────────────────────────────────────────────────────────
API-ID       : API-FILE-005
RULE-ID      : —
SCR-ID       : SCR-FILE-001
ERR-ID       : —
LOV-ID       : —
─────────────────────────────────────────────────────────────────
Scenario type : Happy path
Data class    : VALID

Given         : SCR-FILE-001 embedded panel open on a host screen with
                3 existing attachments
When          : Panel initializes (facade init sequence per F2)
Then          : 3 rows render with fileNameOriginal, category name,
                fileTypeId, fileSizeBytes, createdAt — no console errors

ERR-ID        : —
Language      : —
Test-Hint     : —
XM-impact     : —
─────────────────────────────────────────────────────────────────
```
<!-- TC:TC-FILE-026:END -->

<!-- TC:TC-FILE-027:START -->
```
TC-FILE-027 — Upload via UI succeeds (create flow)
─────────────────────────────────────────────────────────────────
API-ID       : API-FILE-001, API-FILE-002
RULE-ID      : —
SCR-ID       : SCR-FILE-001
ERR-ID       : —
LOV-ID       : —
─────────────────────────────────────────────────────────────────
Scenario type : Happy path
Data class    : VALID

Given         : SCR-FILE-001 panel open, user has PERM_FILE_ATTACHMENT_CREATE
When          : User selects a category, picks a valid 1MB file, clicks Upload
Then          : Upload progress shown (LOCAL loading state per F2), new row
                appears in the list without a full page reload

ERR-ID        : —
Language      : —
Test-Hint     : —
XM-impact     : —
─────────────────────────────────────────────────────────────────
```
<!-- TC:TC-FILE-027:END -->

<!-- TC:TC-FILE-028:START -->
```
TC-FILE-028 — MANDATORY-P-1 + rule violation on UI: oversized upload
─────────────────────────────────────────────────────────────────
API-ID       : API-FILE-002
RULE-ID      : RULE-FILE-001
SCR-ID       : SCR-FILE-001
ERR-ID       : ERR-FILE-0001
LOV-ID       : —
─────────────────────────────────────────────────────────────────
Scenario type : Arabic message
Data class    : INVALID

Given         : User locale = AR, SCR-FILE-001 panel open
When          : User picks a 6MB file and clicks Upload
Then          : Inline error banner shows "حجم الملف يتجاوز الحد المسموح
                به" (Arabic, primary) with the English equivalent also
                visible; no row added to the list

ERR-ID        : ERR-FILE-0001
Language      : BOTH
Test-Hint     : —
XM-impact     : —
─────────────────────────────────────────────────────────────────
```
<!-- TC:TC-FILE-028:END -->

<!-- TC:TC-FILE-029:START -->
```
TC-FILE-029 — MANDATORY-P-3: Permission enforcement (UI level)
─────────────────────────────────────────────────────────────────
API-ID       : —
RULE-ID      : —
SCR-ID       : SCR-FILE-001
ERR-ID       : —
LOV-ID       : —
─────────────────────────────────────────────────────────────────
Scenario type : Permission
Data class    : VALID

Given         : User WITHOUT PERM_FILE_ATTACHMENT_CREATE and WITHOUT
                PERM_FILE_ATTACHMENT_DELETE
When          : SCR-FILE-001 panel renders
Then          : Upload control is not rendered; delete buttons are not
                rendered on any row; list itself remains visible (VIEW
                permission still present)

ERR-ID        : —
Language      : —
Test-Hint     : —
XM-impact     : —
─────────────────────────────────────────────────────────────────
```
<!-- TC:TC-FILE-029:END -->

<!-- TC:TC-FILE-030:START -->
```
TC-FILE-030 — Module INT Flow, part 1: Upload → List (verify appears)
─────────────────────────────────────────────────────────────────
API-ID       : API-FILE-002, API-FILE-005
RULE-ID      : —
SCR-ID       : SCR-FILE-001
ERR-ID       : —
LOV-ID       : —
─────────────────────────────────────────────────────────────────
Scenario type : Edge case
Data class    : VALID

Given         : Clean module state (no attachments for the test owner record)
When          : User uploads "report.pdf" via SCR-FILE-001, then the panel
                refreshes its list
Then          : "report.pdf" appears exactly once in the list with the
                correct category and size

ERR-ID        : —
Language      : —
Test-Hint     : —
XM-impact     : —
─────────────────────────────────────────────────────────────────
```
<!-- TC:TC-FILE-030:END -->

<!-- TC:TC-FILE-031:START -->
```
TC-FILE-031 — Module INT Flow, part 2: Delete → List (verify removed)
─────────────────────────────────────────────────────────────────
API-ID       : API-FILE-004, API-FILE-005
RULE-ID      : RULE-FILE-006
SCR-ID       : SCR-FILE-001
ERR-ID       : —
LOV-ID       : —
─────────────────────────────────────────────────────────────────
Scenario type : State transition
Data class    : VALID

Given         : Continuing from TC-FILE-030 — "report.pdf" present in the list
When          : User clicks Delete, confirms the RULE-FILE-006 confirmation
                dialog, deletion completes
Then          : "report.pdf" no longer appears in the active list (list
                refetch confirms removal); a subsequent download attempt
                against the same file would return HTTP 410 (TC-FILE-020)

ERR-ID        : —
Language      : —
Test-Hint     : —
XM-impact     : —
─────────────────────────────────────────────────────────────────
```
<!-- TC:TC-FILE-031:END -->

**MANDATORY-P-2 (Composite Screen UX separation, CORE-9): N/A** — SCR-FILE-001 is a
COMPOSITE embedded panel (PATTERN-2 Inline/Modal per F1), not a Search+Entry
(PATTERN-1) screen. The CORE-9 Search-view/Entry-form separation rule targets
PATTERN-1 screens specifically; SCR-FILE-001's list and upload control are
designed to coexist in one embedded view by architecture. No TC generated — not
invented.
