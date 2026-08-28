<!-- Source: PHASE:F3 / PREAMBLE (before first SUB) -->

## PHASE F3 — Frontend Validation Rule Specifications

```
ERR-ID GOVERNANCE GAP (disclosed once here, applies to every block
below): CONTRACT-4 requires F3 validators to reference an ERR-ID, never
redefine message text inline. srs.md's A4 section (RULE-SEC-030..053)
carries Message-AR/Message-EN pairs per rule, but — because SECURITY is
a reverse-documented EXCEPTION module that never passed through P1's
normal ERR-ID assignment step — no formal ERR-SEC-xxx registry exists
anywhere in the attached artifacts. This plan does NOT invent new
message text (HR-1 would be violated) — instead it assigns a synthetic
ERR-SEC-{NNN} id 1:1 with each RULE-SEC-{NNN} purely as an internal
cross-reference convenience for this document, sourcing the message
text verbatim from srs.md A4. This is a bookkeeping assignment by P3.2,
not a claim on a real backend error-code registry (same disclosure
pattern already used for PLAN-SEC-FE-001 in the Plan Header).

RULES WITH NO FRONTEND SURFACE (no user-facing message per srs.md A4,
purely internal/backend behavior — listed here once, not given a full
VALIDATION SPEC block, since there is no field/form for a Zod primitive
to attach to):
  RULE-SEC-031 (event-based notification dispatch — architectural)
  RULE-SEC-037 (JWT allowedBranches[] derivation — see OQ-015 carryover)
  RULE-SEC-039 (prior reset-token invalidation — transparent to user)
  RULE-SEC-051 (refresh token rotation — transparent to user)
  RULE-SEC-052 (scheduled refresh-token cleanup — no user interaction)
  RULE-SEC-053 (svc-notification cross-module auth — purely internal)
```

### F3-VALIDATION — RULE-SEC-044 — Full replacement on role-page sync

```
RULE SOURCE:
  Statement  : The system MUST fully replace the role's page-scoped
               permissions on sync, while leaving system-level
               permissions (no page FK) untouched
  Message-AR : (internal behavior — no user-facing message in srs.md)
  Message-EN : (internal behavior — no user-facing message in srs.md)
  Scope      : UPDATE (via "sync all" action, API-SEC-020)
VALIDATION SPEC: not a field-level Zod rule — this is a CONFIRMATION-
  COPY requirement: the "sync all" action's confirmation dialog (F2-
  FACADE-HOOK SCR-SEC-003) must warn the user this REPLACES all
  page-scoped assignments, since srs.md documents this as full-replace
  semantics, not additive. No ERR-ID applies (no rejection case) — this
  is a pre-action warning, not a validation error.
```