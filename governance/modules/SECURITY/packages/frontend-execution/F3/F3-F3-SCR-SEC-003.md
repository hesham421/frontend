<!-- Source: PHASE:F3 / SUB:F3-SCR-SEC-003 -->
<!-- Context: see F3-HEADER.md for phase-level strategy, registry table, and intro -->


### F3 — SCR-SEC-003 — Role & RBAC Management

### F3-VALIDATION — RULE-SEC-042 — VIEW auto-added, not independently removable
```
RULE SOURCE:
  Statement  : The system MUST auto-add VIEW permission whenever a
               Page is assigned to a Role, and MUST NOT allow VIEW to
               be removed independently of the full CRUD set for that
               page
  Message-AR : صلاحية العرض تُضاف تلقائياً ولا يمكن إزالتها بمفردها
  Message-EN : VIEW permission is added automatically and cannot be
               removed independently
  ERR-ID     : ERR-SEC-042
  Scope      : CREATE, UPDATE (permission matrix in the Role dialog)
VALIDATION SPEC:
  Field            : the VIEW checkbox in each permission-matrix row
  Validation type  : BUSINESS_RULE (UI-enforced, not a Zod schema
                     rule in the usual sense — the checkbox itself is
                     rendered checked + disabled, so an invalid state
                     is structurally unreachable rather than caught at
                     submit time). Directly ties to F1-MODEL
                     ENTITY-SEC-002 correction #3 and F2's real
                     PageAssignmentResponse shape (VIEW never appears
                     in the `permissions` array at all).
  Evaluation timing : ON_CHANGE (checkbox is non-interactive for VIEW)
```

### F3-VALIDATION — RULE-SEC-043 — CRUD value restriction on page assignment
```
RULE SOURCE:
  Statement  : The system MUST restrict permission values in role-page
               assignment requests to CREATE, UPDATE, DELETE only
  Message-AR : نوع الصلاحية غير صالح
  Message-EN : Invalid permission type
  ERR-ID     : ERR-SEC-043
  Scope      : CREATE, UPDATE (add-page-to-role / sync-pages payloads)
VALIDATION SPEC:
  Field            : permissions[] (per page-assignment row)
  Validation type  : PATTERN / enum membership
  Zod primitive     : z.array(z.enum(['CREATE','UPDATE','DELETE']))
  Evaluation timing : ON_CHANGE (the matrix UI only ever renders these
                     3 togglable checkboxes per row — VIEW excluded
                     per RULE-SEC-042 — so client-side this is
                     structurally enforced, not just validated;
                     ON_SUBMIT as a defense-in-depth Zod check before
                     the mutation fires)
```

### F3-VALIDATION — RULE-SEC-045 — Role permission copy rules
```
RULE SOURCE:
  Statement  : The system MUST copy only page-scoped permissions from
               the source role, MUST NOT overwrite the target role's
               system-level permissions, MUST reject copying from a
               role with zero page-scoped permissions, and MUST reject
               self-copy
  Message-AR : لا توجد صلاحيات لنسخها من هذا الدور / لا يمكن النسخ من
               نفس الدور
  Message-EN : No permissions to copy from this role / Cannot copy
               from the same role
  ERR-ID     : ERR-SEC-045
  Scope      : the "copy from another role" action (API-SEC-025)
VALIDATION SPEC:
  Field            : sourceRoleId (source-role picker)
  Validation type  : BUSINESS_RULE, two sub-cases:
    (a) self-copy — CLIENT-SIDE PRE-CHECK POSSIBLE: the source-role
        picker must exclude the currently-selected target role from
        its own options list (the target role's id is already known
        client-side — this one sub-case does not need a server round
        trip to catch, though the server still enforces it too)
    (b) empty-source (zero page-scoped permissions) — NOT client-side
        checkable without an extra fetch; surfaced via the 409/422 ->
        toast route using ERR-SEC-045's first message on mutation
        failure
  Evaluation timing : ON_CHANGE (self-copy, via picker filtering) +
                     ON_SUBMIT (empty-source, server round-trip)
```

### F3-VALIDATION — RULE-SEC-048 — Role code/name uniqueness, immutability, delete protection
```
RULE SOURCE:
  Statement  : The system MUST require unique roleCode and roleName,
               MUST treat roleCode as immutable after creation, and
               MUST prevent deletion of a role that has existing user
               assignments
  Message-AR : رمز أو اسم الدور مستخدَم بالفعل / لا يمكن حذف دور له
               مستخدمون مُسنَدون
  Message-EN : Role code or name already exists / Cannot delete a role
               with assigned users
  ERR-ID     : ERR-SEC-048
  Scope      : CREATE (roleCode+roleName), UPDATE (roleName only),
               DELETE
VALIDATION SPEC:
  Field            : roleCode (CREATE only)
  DB Column        : ROLE_CODE (VARCHAR(60), UK_ROLES_ROLE_CODE)
  Validation type  : REQUIRED + PATTERN(^[A-Z][A-Z0-9_]*$) +
                     UNIQUE_CHECK
  Zod primitive     : z.string().regex(/^[A-Z][A-Z0-9_]*$/)
  Read-only on EDIT : yes — roleCode has no field at all in
                     UpdateRoleRequest (confirmed, F1-MODEL
                     ENTITY-SEC-002); the edit form must render it
                     display-only, not merely disabled-but-submitted
  Evaluation timing : ON_BLUR (pattern) + ON_SUBMIT (uniqueness)
  ---
  Field            : roleName
  DB Column        : NAME (VARCHAR(60), UK_ROLES_NAME)
  Validation type  : REQUIRED + LENGTH(max 60) + UNIQUE_CHECK
  Zod primitive     : z.string().min(1).max(60)
  Evaluation timing : ON_BLUR (length) + ON_SUBMIT (uniqueness)
DELETE-PATH BEHAVIOR: deleteRole (API-SEC-018) surfaces ERR-SEC-048's
  second message via 409/422 -> toast; no client-side pre-check exists.
```

