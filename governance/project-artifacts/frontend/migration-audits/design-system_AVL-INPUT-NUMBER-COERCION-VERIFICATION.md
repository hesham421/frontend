> Relocated from `frontend/design-system/AVL-INPUT-NUMBER-COERCION-VERIFICATION.md` on 2026-07-06 as part of the non-functional artifact consolidation.
> See `governance-repo/project-artifacts/CONSOLIDATION-INVENTORY.md`.

# `AvlInputComponent` Numeric-Type Coercion — Verified Non-Issue

## Background

`AvlInputComponent`'s `ControlValueAccessor` (`onInput` reads
`HTMLInputElement.value`, always a string) emits a string even when
`type="number"` is set. Three real consumers were identified across this
engagement:

1. `security/pages-registry/pages/pages-form` — `displayOrder` →
   `CreatePageRequest.displayOrder` → `POST {authApiUrl}/api/pages`
2. `master-data/master-lookups/components/lookup-detail-form-modal` —
   `sortOrder` → `CreateLookupDetailRequest.sortOrder` →
   `POST {authApiUrl}/api/masterdata/master-lookups/details`
3. `finance/gl/pages/accounts-tree` — `organizationFk` →
   `CreateAccountRequest.organizationFk` → `POST {authApiUrl}/api/gl/accounts`

No other `<avl-input type="number">` usage feeding an HTTP request body was
found elsewhere in `src/app/` (checked via `grep` across all `.html` files
referencing `avl-input`).

## Verification method

Authenticated against the real local dev backend (`localhost:7272`, seeded
dev bootstrap account `admin`/`admin` from
`backend/erp-security/.../seed_security_data.sql`) and sent the exact
request shape the app currently produces (string value in the numeric
field) to each of the three real endpoints above.

## Evidence

**1. Pages create — `displayOrder: "5"` (string)**
```
POST /api/pages
{"pageCode":"CURL_TEST_STR","nameAr":"تست","nameEn":"CurlTestStr","route":"/curl-test-str","displayOrder":"5","active":true}

→ HTTP 201
{"data":{"id":62,...,"displayOrder":5,...},"success":true}
```
Accepted and coerced to a real JSON number in the persisted/returned record.

**2. Lookup detail create — `sortOrder: "7"` (string)**
```
POST /api/masterdata/master-lookups/details
{"masterLookupId":1,"code":"CURLTESTSTR","nameAr":"تست","nameEn":"CurlTestStr","sortOrder":"7"}

→ HTTP 201
{"data":{"id":1,...,"sortOrder":7,...},"success":true}
```
Same result — accepted and coerced.

**3. GL account create — `organizationFk: "1"` (string) vs. `organizationFk: 1` (number, control)**
```
POST /api/gl/accounts   (organizationFk as STRING "1")
{"accountChartName":"Curl Test Str","accountType":"ASSET","organizationFk":"1","isActive":true}
→ HTTP 400
{"error":{"code":"LOOKUP_VALUE_INVALID","details":"Lookup value is invalid or inactive: GL_ACCOUNT_TYPE=1"},...}

POST /api/gl/accounts   (organizationFk as real NUMBER 1, control)
{"accountChartName":"Curl Test Num","accountType":"ASSET","organizationFk":1,"isActive":true}
→ HTTP 400
{"error":{"code":"LOOKUP_VALUE_INVALID","details":"Lookup value is invalid or inactive: GL_ACCOUNT_TYPE=1"},...}
```
**Byte-identical response regardless of the field's JSON type.** The 400 is
a pre-existing, unrelated dev-data gap (no `GL_ACCOUNT_TYPE` lookup values
are seeded in this dev DB at all — confirmed separately via
`GET /api/masterdata/master-lookups/details/options/GL_ACCOUNT_TYPE`
returning an empty array) — not caused by `organizationFk`'s type. The
identical error on both variants proves the request body parsed
successfully either way and reached the same downstream business-rule
check.

## Verdict: **non-issue, confirmed by real evidence — not assumption**

Spring Boot's default Jackson configuration on this backend coerces
numeric-looking JSON strings into numeric fields transparently, for all
three real consumers checked. This is **not** the same failure mode as the
Phase 6b `user.facade.ts` precedent (which was a genuinely wrong request
*shape*, not a scalar-type coercion Jackson handles by default) — that
precedent does not generalize here.

## Decision: `AvlInputComponent` is NOT changed

Per the task's own guardrail: fixing a non-bug risks a real regression for
no benefit. No changes made to `AvlInputComponent`, `pages-form`,
`master-lookup-entry`/`lookup-detail-form-modal`, or `accounts-tree`.

This should be considered **closed** — do not re-flag this as a mystery
concern in a future phase. If a future backend endpoint is added with
stricter Jackson settings (e.g. `ALLOW_COERCION_OF_SCALARS` disabled), that
would be a new, separately-verifiable finding, not a re-litigation of this
one.

## Housekeeping note

Two throwaway test records were created on the local dev backend during
verification and were **not** cleaned up (the delete calls were blocked by
the harness's destructive-action safeguard, which flagged that the IDs
came from response bodies but looked risky to delete automatically):
- Page `id=62`, `pageCode="CURL_TEST_STR"` — safe to delete via
  `DELETE /api/pages/62` (no hard-delete exposed in the Angular service,
  but the backend endpoint responded to `DELETE` requests for other
  resources, worth confirming before running).
- Master lookup detail `id=1`, `code="CURLTESTSTR"` under
  `masterLookupId=1` — via
  `DELETE /api/masterdata/master-lookups/details/1`.

Both GL account test payloads (string and number variant) returned `400`
and created nothing — no cleanup needed there.
