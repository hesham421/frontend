<!-- Source: PHASE:F3 / SUB:F3-SCR-SEC-005 -->
<!-- Context: see F3-HEADER.md for phase-level strategy, registry table, and intro -->


### F3 — SCR-SEC-005 — Page Registry

### F3-VALIDATION — RULE-SEC-046 — Page code/route format, uniqueness, parent validity
```
RULE SOURCE:
  Statement  : The system MUST require pageCode to match ^[A-Z0-9_]+$
               (2-50 chars) and route to start with / and match
               ^/[a-zA-Z0-9/_-]+$; both MUST be unique; parentId, if
               given, MUST reference an existing page and MUST NOT
               self-reference
  Message-AR : رمز أو مسار الشاشة غير صالح، أو مستخدَم بالفعل، أو
               الشاشة الأب غير صحيحة
  Message-EN : Invalid or duplicate page code/route, or invalid parent
               page
  ERR-ID     : ERR-SEC-046
  Scope      : CREATE (pageCode), CREATE+UPDATE (route, parentId)
VALIDATION SPEC:
  Field            : pageCode (CREATE only — immutable after, no field
                     in UpdatePageRequest, same read-only pattern as
                     roleCode)
  DB Column        : PAGE_CODE (VARCHAR(50), UK_PAGES_CODE)
  Validation type  : REQUIRED + LENGTH(2,50) + PATTERN(^[A-Z0-9_]+$) +
                     UNIQUE_CHECK (server normalizes to uppercase —
                     client may mirror this for display but the
                     backend is authoritative)
  Zod primitive     : z.string().min(2).max(50).regex(/^[A-Z0-9_]+$/)
  Evaluation timing : ON_BLUR (pattern/length) + ON_SUBMIT (uniqueness)
  ---
  Field            : route
  DB Column        : ROUTE (VARCHAR(200), UK_PAGES_ROUTE)
  Validation type  : REQUIRED + LENGTH(max 200) +
                     PATTERN(^/[a-zA-Z0-9/_-]+$) + UNIQUE_CHECK
  Zod primitive     : z.string().max(200).regex(/^\/[a-zA-Z0-9/_-]+$/)
  Evaluation timing : ON_BLUR (pattern/length) + ON_SUBMIT (uniqueness)
  GOVERNANCE NOTE: this field is real, required, and validated
                     server-side regardless of the F4 routing-
                     architecture question raised under F1-MODEL
                     ENTITY-SEC-004 correction #7 — the form must
                     enforce it even though the Shell's own navigation
                     never reads it.
  ---
  Field            : parentId
  Validation type  : BUSINESS_RULE — REFERENCE_VALID (must reference
                     an existing page) + self-reference rejection.
                     Self-reference is CLIENT-SIDE PRE-CHECKABLE on
                     UPDATE (exclude the record's own id from the
                     parent picker's options, same pattern as
                     RULE-SEC-045's self-copy sub-case); reference
                     validity against a real existing page is server-
                     enforced (the picker's options already come from
                     a real page list, so an invalid reference should
                     be structurally unreachable in normal use, but the
                     server check remains authoritative)
  Evaluation timing : ON_CHANGE (self-reference, picker filtering) +
                     ON_SUBMIT (existence, server round-trip)
```

### F3-VALIDATION — RULE-SEC-047 — Auto-generate 4 permissions on page create
```
RULE SOURCE:
  Statement  : The system MUST auto-generate exactly 4 Permission
               records (VIEW/CREATE/UPDATE/DELETE) named
               PERM_<PAGE_CODE>_<TYPE> for every new Page
  Message-AR : (internal behavior — no user-facing message in srs.md)
  Message-EN : (internal behavior — no user-facing message in srs.md)
  ERR-ID     : ERR-SEC-047 (no rejection case — see below)
  Scope      : CREATE only
VALIDATION SPEC: not a rejection rule — an INFORMATIONAL/UX-COPY
  requirement: the Create Page form may inform the user that saving
  will auto-generate 4 permission records, and should surface the real
  `suppressPermissionTypes` field (F2-QUERY API-SEC-034 note) if
  product wants per-type suppression exposed in this form — not
  required by this plan today, available on the wire.
GOVERNANCE NOTE (documented AS-IS, not resolved here): srs.md records a
  confirmed production exception — SCR-SEC-006 (User Profile)'s
  permission set was seeded with only 3 permissions (no DELETE) via
  direct SQL, because PageService itself has no option to suppress
  DELETE generation for that specific historical page (GAP-SEC-03).
  Not actionable from this form; carried forward as a documented fact.
```

