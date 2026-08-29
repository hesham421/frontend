<!-- Source: PHASE:F3 / SUB:F3-SCR-ORG-005 -->
<!-- Context: see F3-HEADER.md for phase-level strategy, registry table, and intro -->

## F3 — SCR-ORG-005 — Cost Centers

### F3-VALIDATION — RULE-ORG-004 — Prevent Branch deactivation — active cost centers
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent deactivation of a Branch when one or more active CostCenters reference it
  Message-AR : لا يمكن إلغاء تفعيل الفرع لوجود مراكز تكلفة نشطة مرتبطة به
  Message-EN : Cannot deactivate Branch: active cost centers exist
  Scope      : DEACTIVATE (server-enforced, 409)

VALIDATION SPEC:
  Field            : isActive (via Deactivate action)
  DB Column        : is_active_fl (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-008 — Prevent circular reference — CostCenter tree
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent assignment of a parent CostCenter that would create a circular reference in the CostCenter tree
  Message-AR : لا يمكن تعيين مركز التكلفة هذا كأب ـ سيؤدي إلى دورة في هيكل مراكز التكلفة
  Message-EN : Cannot set parent cost center: circular reference detected
  Scope      : CREATE/UPDATE (client-side prevention at selection time per ui-ux-spec + server-enforced)

VALIDATION SPEC:
  Field            : parentCostCenterFk
  DB Column        : parent_cost_center_fk (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-010 — Prevent SUMMARY CostCenter on transactional records
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent direct assignment of a SUMMARY-type CostCenter to any transactional record
  Message-AR : لا يمكن استخدام مركز تكلفة من نوع (ملخص) في السجلات التشغيلية
  Message-EN : Cannot assign a SUMMARY cost center to transactional records — only DETAIL cost centers are permitted
  Scope      : N/A to ORG's own screens — enforced in consumer modules' UIs, not here (SRS Test-Hint)

VALIDATION SPEC:
  Field            : nodeTypeId (display-only in ORG's own screens)
  DB Column        : node_type_id (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (not enforced by ORG UI)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-019 — Department/CostCenter/LocationSite require active Branch
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent creation of a Department, CostCenter, or LocationSite under an inactive Branch
  Message-AR : لا يمكن إنشاء قسم أو مركز تكلفة أو موقع تحت فرع غير نشط
  Message-EN : Cannot create organizational unit under an inactive Branch
  Scope      : CREATE — branchFk picker only lists isActive=true records

VALIDATION SPEC:
  Field            : branchFk
  DB Column        : branch_fk (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : LOV_VALID (active-only filter)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-020 — node_type_id immutable after save (Department/CostCenter)
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent modification of the node_type_id (SUMMARY / DETAIL) after a Department or CostCenter record has been saved
  Message-AR : لا يمكن تغيير نوع العقدة (ملخص/تفصيل) بعد الحفظ
  Message-EN : Node type (SUMMARY/DETAIL) cannot be changed after initial save
  Scope      : UPDATE — nodeTypeId field becomes read-only in EDIT mode (same muted-display convention as Business Code)

VALIDATION SPEC:
  Field            : nodeTypeId
  DB Column        : node_type_id (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (field lock post-save)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-011 — Business Code immutable after save
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent modification of the Business Code field after the record has been saved for the first time
  Message-AR : رمز الأعمال لا يمكن تعديله بعد الحفظ الأول — هذا الحقل محمي ونهائي
  Message-EN : Business Code is immutable after first save and cannot be modified
  Scope      : UPDATE — see F3-BC-RULE-1..3

VALIDATION SPEC:
  Field            : costCenterCode
  DB Column        : cost_center_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : REQUIRED (read-only field, no user-editable validation)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-012 — Business Code uniqueness within defined scope
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST ensure the Business Code generated by NumberingEngine is globally unique within its defined scope
  Message-AR : تعذّر إنشاء رمز الأعمال — تعارض في التسلسل. يرجى المحاولة مرة أخرى
  Message-EN : Business Code generation failed due to sequence conflict. Please retry
  Scope      : CREATE (409, server-only — not a client-checkable rule, no field to validate client-side)

VALIDATION SPEC:
  Field            : costCenterCode (system-generated)
  DB Column        : cost_center_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (server-only)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-013 — Business Code generated via NumberingEngine only
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST generate the Business Code exclusively through NumberingEngine
  Message-AR : يجب إنشاء رمز الأعمال عبر محرك الترقيم المركزي فقط
  Message-EN : Business Code must be generated via NumberingEngine only
  Scope      : CREATE — field never sent by client, no client validation needed (see F3-BC-RULE-2)

VALIDATION SPEC:
  Field            : costCenterCode (never sent by client)
  DB Column        : cost_center_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : REQUIRED (read-only field)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-014 — Reject Business Code in Update payload
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST reject any Update request that includes the Business Code field in its payload
  Message-AR : رمز الأعمال لا يُقبل ضمن طلبات التعديل
  Message-EN : Business Code field is not accepted in update requests
  Scope      : UPDATE — Update DTOs must omit the code field entirely (F3-BC-RULE-3)

VALIDATION SPEC:
  Field            : costCenterCode (excluded from Update DTO)
  DB Column        : cost_center_code (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (DTO shape)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-015 — Name uniqueness within parent scope
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST prevent saving a record whose name_ar or name_en duplicates an existing active record within the same parent scope
  Message-AR : الاسم مُستخدم مسبقاً ضمن نفس النطاق — يرجى اختيار اسم مختلف
  Message-EN : Name already exists within the same parent scope — please choose a different name
  Scope      : CREATE/UPDATE (409, server-enforced — no client-side pre-check declared; async on-blur check optional per F3 pattern, not specified by SRS)

VALIDATION SPEC:
  Field            : nameAr, nameEn
  DB Column        : name_ar, name_en (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : UNIQUE_CHECK
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  409 → business error → user toast via error mapper
─────────────────────────────────────────────────────────────────

### F3-VALIDATION — RULE-ORG-016 — Reject audit fields in request payload
─────────────────────────────────────────────────────────────────
RULE SOURCE:
  Statement  : The system MUST reject any request payload that includes audit fields (created_by, created_at, updated_by, updated_at)
  Message-AR : حقول التدقيق لا تُقبل من المستخدم — يملؤها النظام تلقائياً
  Message-EN : Audit fields are not accepted in request payloads — populated by system only
  Scope      : CREATE/UPDATE — form models never send createdAt/createdBy/updatedAt/updatedBy (display-only, see F1 audit footer)

VALIDATION SPEC:
  Field            : createdBy/createdAt/updatedBy/updatedAt (never sent)
  DB Column        : created_by/created_at/updated_by/updated_at (DBF-ID: N/A — backend-execution-plan.md not provided this session)
  Validation type  : BUSINESS_RULE (DTO shape)
  ERR-ID           : NOT ASSIGNED — no Error Catalog provided this session (see F3-LOC-RULE-1
                     above); agent binds to the real ERR-ID once SVC+API's catalog exists
Error routing (per shared F2 table above):
  400 → field validation → inline display under triggering field
─────────────────────────────────────────────────────────────────

