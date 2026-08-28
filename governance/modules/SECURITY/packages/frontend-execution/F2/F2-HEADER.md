<!-- Source: PHASE:F2 / PREAMBLE (before first SUB) -->

## PHASE F2 — Data & Facade Hook Specifications

```
GLOBAL DECLARATIONS (apply to every F2-QUERY/F2-FACADE-HOOK below,
referenced by name rather than repeated per block):

State ownership:
  currentPage / pageSize live inside each screen's `searchFilters`
  object, which IS the query key's filter param — never a standalone
  useState. TanStack Query refetches automatically when searchFilters
  changes.

Error routing (shared Axios/fetch response interceptor, declared once
here — CORE phase for this module was never generated, since SECURITY
is a registry EXCEPTION module with no P3.1; this plan asserts the
mechanism per CORE-8/CONTRACT-12 defaults rather than inventing a
project-specific one):
  HTTP 400 (BAD_REQUEST / INVALID_JSON) -> inline, under the triggering
    field, via React Hook Form's setError (see F3)
  HTTP 401 (UNAUTHORIZED)  -> redirect to login
  HTTP 403 (FORBIDDEN)     -> redirect to unauthorized
  HTTP 409 / 422           -> shared error mapper -> user toast
    (NOTE: no endpoint in this module's real API docs documents a 409
    or 422 response explicitly in its "Other Possible Responses" table
    — every endpoint's documented error surface is limited to
    UNAUTHORIZED / FORBIDDEN / BAD_REQUEST-INVALID_JSON. Real business-
    rule conflicts almost certainly exist at runtime — e.g. DELETE
    /api/roles/{roleId}'s own description states "Returns 409 if role
    has user assignments" in prose, and DELETE /api/users/{userId}'s
    description references "child relationships" — but the auto-
    generated doc's structured error table does not capture these as
    machine-readable entries for either endpoint. This plan does not
    invent a specific ERR-ID/message for them; the shared 409/422 ->
    toast route is declared as the fallback and is sufficient to not
    leave these cases unhandled, but the exact toast copy is deferred to
    implementation using the shared error mapper's generic business-
    error text.)
  HTTP 500                 -> generic message only, no technical detail

Pre-deactivation check pattern: applies only where the target entity
supports a distinct deactivate/reactivate action (Role, Page,
SecRoleBranch/SecUserProfile via isActiveFl toggle). None of the real
endpoints in this module's docs expose a dedicated "check usage before
deactivate" pre-flight endpoint — deactivation is a direct PUT call in
every case (PUT .../deactivate for Role/Page; a plain UPDATE with
isActiveFl:false for SecUserProfile/SecRoleBranch, which have no
separate deactivate endpoint at all). This plan does NOT invent a
usage-check pre-flight call that doesn't exist: the confirmation dialog
fires directly before the mutation; if the backend itself rejects the
operation (e.g. DELETE /api/roles/{roleId} returning 409 for
role-with-assignments, per its own description), that is handled via
the 409->toast route above, not a separate pre-check call.

Caching defaults (no project-wide CORE declaration exists for this
EXCEPTION module — this plan asserts TanStack Query framework defaults
unless a specific block below states otherwise): staleTime 0,
gcTime 5 minutes. Any deviation is called out per-block with a DRV-ID.
```