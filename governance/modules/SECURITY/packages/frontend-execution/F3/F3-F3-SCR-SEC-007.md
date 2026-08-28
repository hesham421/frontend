<!-- Source: PHASE:F3 / SUB:F3-SCR-SEC-007 -->
<!-- Context: see F3-HEADER.md for phase-level strategy, registry table, and intro -->


### F3 — SCR-SEC-007 — Role Data Scope (Branch Assignment)

### F3-VALIDATION — RULE-SEC-035 — Data access level required and valid
```
RULE SOURCE:
  Statement  : The system MUST require dataAccessLevel and MUST
               validate it is an active LOV-SEC-002 code
  Message-AR : مستوى الوصول للبيانات إلزامي ويجب أن يكون قيمة معتمَدة
  Message-EN : Data access level is required and must be a valid,
               active value
  ERR-ID     : ERR-SEC-035
  Scope      : CREATE, UPDATE (SecRoleBranch)
VALIDATION SPEC:
  Field            : dataAccessLevel
  DB Column        : DATA_ACCESS_LEVEL (VARCHAR(30))
  Validation type  : REQUIRED + LOV_VALID
  Zod primitive     : z.enum(['BRANCH_ONLY','BRANCH_AND_CHILDREN',
                     'ALL']) — CORRECTED values, per F1-MODEL
                     ENTITY-SEC-010 correction #3 / F2-LOV-QUERY
                     LOV-SEC-002. This is the single highest-stakes
                     validator in this plan: the Shell's original
                     ('BRANCH'|'CHILDREN'|'ALL') values would pass a
                     naively-copied client-side Zod check yet still
                     fail server-side on every save — this corrected
                     enum is what actually prevents that failure mode
                     at the form layer, before the request is even
                     sent.
  Evaluation timing : ON_CHANGE (select is constrained to the 3 valid
                     values) + ON_SUBMIT (defense-in-depth)
```

### F3-VALIDATION — RULE-SEC-036 — No duplicate role-branch assignment
```
RULE SOURCE:
  Statement  : The system MUST prevent duplicate (roleIdFk, branchIdFk)
               assignments
  Message-AR : هذا الفرع مُسنَد بالفعل لهذا الدور
  Message-EN : This branch is already assigned to this role
  ERR-ID     : ERR-SEC-036
  Scope      : CREATE only (the composite PK itself makes this
               structurally impossible to violate on UPDATE, since
               UPDATE targets an existing (roleId, branchId) pair by
               definition)
VALIDATION SPEC:
  Field            : the (roleIdFk, branchIdFk) pair as a whole
  Validation type  : UNIQUE_CHECK (composite)
  Evaluation timing : ON_SUBMIT only — no client-side pre-check exists
                     without fetching the full existing-assignments
                     list for the selected role first, which this plan
                     does not add as a mandatory pre-flight (would
                     require an extra round trip not called for by any
                     confirmed screen behavior); surfaced via 409/422
                     -> toast using ERR-SEC-036's message on failure
```

