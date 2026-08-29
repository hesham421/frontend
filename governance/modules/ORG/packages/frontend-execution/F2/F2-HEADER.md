<!-- Source: PHASE:F2 / PREAMBLE (before first SUB) -->

# PHASE F2 — Frontend Data & Facade Hook Specifications

Open Questions: 3 active / see OQ Log above

**Frontend contracts declared once, referenced by every screen below:**
```
State ownership: currentPage/pageSize live inside each screen's searchFilters
  object (the TanStack Query key) — never independent useState.
Error routing (shared Axios interceptor — mechanism itself is a CORE-phase
  decision outside this module's scope; referenced here, not redeclared):
  HTTP 400 → inline under field (React Hook Form setError, see F3)
  HTTP 409/422 → shared error mapper → toast (RULE-ORG-001..006 violations land here)
  HTTP 401 → redirect to login
  HTTP 403 → redirect to unauthorized (relevant given FINDING-4 — see SEC-FE)
  HTTP 500 → generic message only
Pre-deactivation check: every deactivate mutation below is preceded by the
  backend's own dependent-check (RULE-ORG-001..006 enforced server-side); the
  UI does not pre-check client-side — it calls deactivate, and on 409 shows the
  rule's bilingual message via the save-blocked banner (ui-ux-spec design intent).
```