<!-- Source: PHASE:F3 / SUB:F3-SCR-SEC-006 -->
<!-- Context: see F3-HEADER.md for phase-level strategy, registry table, and intro -->


### F3 — SCR-SEC-006 — User Profile

### F3-VALIDATION — RULE-SEC-034 — Active branch validation (cross-module)
```
RULE SOURCE:
  Statement  : The system MUST validate that branchIdFk references an
               existing, active ORG_BRANCH row via cross-module call
               before saving
  Message-AR : الفرع المحدَّد غير موجود أو غير نشط
  Message-EN : Selected branch does not exist or is not active
  ERR-ID     : ERR-SEC-034
  Scope      : CREATE, UPDATE (SecUserProfile)
VALIDATION SPEC:
  Field            : branchIdFk (branch select)
  Validation type  : REQUIRED + BUSINESS_RULE (cross-module existence +
                     active-status check, XM-SEC-001 — see F1-MODEL
                     ENTITY-SEC-009 correction #7). The select's own
                     OPTIONS already come from Organization's live
                     branch list (useOrganizationStore, confirmed
                     Shell-compatible), so an inactive/nonexistent
                     branch should be structurally unreachable via the
                     picker in normal use — the server check remains
                     authoritative for race conditions (branch
                     deactivated between page load and submit).
  Zod primitive     : z.number() (required, no client-side enum — the
                     valid set is the dynamically loaded branch list,
                     not a fixed union)
  Evaluation timing : ON_CHANGE (picker only offers valid-looking
                     options) + ON_SUBMIT (server round-trip,
                     authoritative)
```

