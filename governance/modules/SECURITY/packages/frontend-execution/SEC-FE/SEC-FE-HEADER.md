<!-- Source: PHASE:SEC-FE / PREAMBLE (before first SUB) -->

## PHASE SEC-FE — Frontend Security Specifications

```
GOVERNANCE NOTE (applies to every block below): this module has no
PROJECT-3-BACKEND-ENGINE.md SEC-BE phase output to reference — SECURITY
is an EXCEPTION module that never passed through the forward P0->P1->
P2->P3.1 pipeline (0.1 GATE note), so no formal "Permissions Matrix"
artifact from a P3.1 plan exists. This plan substitutes the REAL,
confirmed permission-annotation strings found directly in the 8 API
doc files (@PreAuthorize/@Secured-derived "Required permission(s)"
lines) as the equivalent source of truth — never inventing a
PERM_[PAGE_CODE]_[TYPE] literal beyond what F4 already confirmed
(PERM_USER_VIEW) or what the API docs state as literal Spring Security
authority names (ROLE_VIEW, ROLE_UPDATE, USER_MANAGE_ROLES, etc. — note
these are NOT all in the PERM_<CODE>_<TYPE> shape; several endpoints
use short authority names like ROLE_VIEW/PAGE_UPDATE directly, which
this plan does not silently rewrite into the PERM_* shape it hasn't
confirmed for those authorities).
```