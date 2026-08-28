<!-- Source: PHASE:F3 / SUB:F3-SCR-SEC-002 -->
<!-- Context: see F3-HEADER.md for phase-level strategy, registry table, and intro -->


### F3 — SCR-SEC-002 — User Management

### F3-VALIDATION — RULE-SEC-049 — Username uniqueness, delete protection, default role
```
RULE SOURCE:
  Statement  : The system MUST require unique username (case-
               insensitive) on create and update, MUST prevent
               deletion of a user with active refresh tokens, and MUST
               auto-assign the default ROLE_USER role on creation if
               it exists (silently skipped otherwise)
  Message-AR : اسم المستخدم مستخدَم بالفعل / لا يمكن حذف مستخدم لديه
               جلسات نشطة
  Message-EN : Username already exists / Cannot delete a user with
               active sessions
  ERR-ID     : ERR-SEC-049
  Scope      : CREATE, UPDATE, DELETE (admin-side, distinct from
               RULE-SEC-040's signup-side uniqueness — same underlying
               DB constraint, two different entry points)
VALIDATION SPEC:
  Field            : username
  DB Column        : USERNAME (VARCHAR(80), UK_USERS_USERNAME,
                     case-insensitive per rule statement)
  Validation type  : REQUIRED + LENGTH(3,80) + UNIQUE_CHECK
                     (case-insensitive)
  Zod primitive     : z.string().min(3).max(80)
  Evaluation timing : ON_BLUR (format) + ON_SUBMIT (uniqueness)
DELETE-PATH BEHAVIOR: deleteUser (API-SEC-010) must surface
  ERR-SEC-049's second message via the 409/422 -> toast route when the
  backend rejects a delete for active-refresh-token reasons — no
  client-side pre-check exists (confirmed, see F2 pre-deactivation
  note).
INFORMATIONAL, NOT A FRONTEND VALIDATION: default ROLE_USER
  auto-assignment on create happens silently server-side and is not
  observable/actionable from the Create form — not given a Zod rule,
  noted here only so it is not mistaken for a plan gap.
```

