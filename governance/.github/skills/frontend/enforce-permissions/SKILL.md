---
name: enforce-permissions
description: "PERMISSION ENFORCER — 34 checks validating triple enforcement (route guards, UI gating, programmatic checks), permission-code naming, grant-filtered navigation, and hidden-vs-disabled policy. Use when reviewing routes, action controls, or confirm handlers, or when diagnosing a 403 on a visible button."
---

# Skill: enforce-permissions

## Description
Validates that every action is gated at all three layers, that permission strings bind back
to a page code, and that navigation reflects the session. Rules:
`references/contract-rules.md` §P, §R.5; `references/architecture.md` AD-2, AD-6.

> **Stated first, because the report is routinely misread:** these are UX controls. They
> stop users being shown doors they cannot open. The backend is the access control. A clean
> report here says nothing about whether an endpoint is protected (AD-6, SEC.11).

## When to Use
- Reviewing routes, action controls, or confirm handlers
- A visible button returns 403
- Security review of a frontend change

## When NOT to Use
- Deliberately public routes (login, 404, forbidden)
- Backend authorization
- The backend's permission catalogue — this skill consumes grants, never defines them

---

## Triple enforcement

```
Layer 1  ROUTE      <RequireAuth> + <RequirePermission permission>
                    → the page cannot be reached
Layer 2  UI         <Can permission={perm(PAGE, ACTION)}>
                    → the control is not shown
Layer 3  HANDLER    can(perm(PAGE, ACTION)) as the first statement
                    → the action cannot fire from a stale render or the console
```

### Per-action map

| Action | Route | UI | Handler |
|---|---|---|---|
| View list | `VIEW` on the page route | — (the page is the control) | — |
| Create | `CREATE` on `new` | `<Can>` on the Create button | — |
| Edit | `UPDATE` on `:id/edit` | `<Can>` on the row Edit action | — |
| Save | route already gated | `<Can>` on Save with the mode's action | — |
| Activate / deactivate | `UPDATE` on the page route | `<Can>` on the toggle | `can()` first in `confirmToggleActive` |
| Delete | `DELETE` | `<Can>` on delete | `can()` first in `confirmDelete` |

## Section 1 — Route layer (8)

| # | Check |
|---|---|
| P.1.1 | `RequireAuth` covers the authenticated branch |
| P.1.2 | Page route guarded with `VIEW` |
| P.1.3 | `new` guarded with `CREATE` |
| P.1.4 | `:<entity>Id/edit` guarded with `UPDATE` |
| P.1.5 | Guards wrap the element; no unguarded render path |
| P.1.6 | Unauthorized renders an explicit 403, not a redirect |
| P.1.7 | A route whose permission the session does not grant renders 403 |
| P.1.8 | Route permission strings match the backend's grant codes exactly |

## Section 2 — UI layer (8)

| # | Check |
|---|---|
| P.2.1 | Create button wrapped in `<Can>` |
| P.2.2 | Row edit action wrapped |
| P.2.3 | Activation toggle wrapped |
| P.2.4 | Delete action wrapped |
| P.2.5 | Save wrapped with the mode-correct action |
| P.2.6 | Controls inside table cells gated, not only toolbar controls |
| P.2.7 | Child add and row actions gated |
| P.2.8 | Bulk actions gated by the action they perform |

## Section 3 — Handler layer (7)

| # | Check |
|---|---|
| P.3.1 | `can()` is the first statement, before any `await` |
| P.3.2 | Toggle handler checks before the dialog |
| P.3.3 | Delete handler checks before the dialog |
| P.3.4 | Delete checks `usage.canDelete` before the dialog |
| P.3.5 | Deactivate checks `usage.canDeactivate` before the dialog |
| P.3.6 | A failed check gives feedback, not a silent no-op |
| P.3.7 | Entry page's save action gated for its mode |

## Section 4 — Naming and binding (7)

| # | Check |
|---|---|
| P.4.1 | Permissions built with `perm(RESOURCE, ACTION)` — never a concatenated literal |
| P.4.2 | One `RESOURCES` constant per resource, used by routes, controls, and handlers |
| P.4.3 | Actions restricted to `VIEW`, `CREATE`, `UPDATE`, `DELETE` |
| P.4.4 | Path constants, permission codes, and component names never interchanged |
| P.4.5 | Grants resolve against the session payload; the frontend never assumes a grant |
| P.4.6 | Child entities state their permission policy explicitly — parent's or their own |
| P.4.7 | No permission derived from a route string at runtime |

## Section 5 — Navigation and consistency (6)

| # | Check |
|---|---|
| P.5.1 | Navigation derived from the route config and filtered by held grants |
| P.5.2 | Menu labels are `t()` keys present in both dictionaries |
| P.5.3 | Grant codes the frontend does not know are ignored, never fatal |
| P.5.4 | Same permission for the same action across route, UI, and handler |
| P.5.5 | Every action gated at all three layers |
| P.5.6 | Unauthorized controls **hidden**; data-blocked controls **disabled with a reason** |

---

## Hidden versus disabled (P.5.6, DS.15)

| Situation | Treatment | Why |
|---|---|---|
| User lacks the permission | Hidden | An action they can never perform is noise |
| Record state forbids it (`canDelete: false`) | Disabled with a tooltip naming the reason | Temporary and actionable |
| Action in flight | Disabled with a loading state | Prevents double submission |
| Feature not yet released | Hidden | Not a permission concern |

A disabled button with no explanation is the worst of both: it advertises a capability and
refuses to say why it is unavailable.

## Automatic rejection triggers

| # | Trigger | Rule |
|---|---|---|
| 1 | Route without `RequireAuth` or `RequirePermission` | P.1.1–P.1.4 |
| 2 | Route guarded with the wrong action | P.1.2–P.1.4 |
| 3 | Redirect instead of an explicit 403 | P.1.6 |
| 4 | Unregistered page code failing open | P.1.7 |
| 5 | Action control without `<Can>` | P.2.1–P.2.4 |
| 6 | Dialog before the permission check | P.3.2, P.3.3 |
| 7 | Delete without a `canDelete` check | P.3.4 |
| 8 | Concatenated permission literal | P.4.1 |
| 8b | `can(...)` literal missing the verified `PERM_` prefix | P.1.8 |
| 9 | Permission derived from a route string | P.4.7 |
| 10 | Hardcoded navigation menu | P.5.1 |
| 11 | An action gated at fewer than three layers | P.5.5 |
| 12 | Unauthorized control disabled instead of hidden | P.5.6 |

## Diagnostic patterns

**Visible button returns 403** → layer 2 missing.

**Dialog then "no permission"** → check placed after the dialog; move it to the first line.

**Delete confirmed, then a 409** → missing usage gate.

**User reaches `new` by typing the URL** → guard on the page route only.

**Menu item hidden but the route still loads** → layer 2 without layer 1. Hiding is not
guarding.

**A menu item appears but 403s** → the nav item's permission differs from the route's.

**A screen 403s for everyone after a backend change** → a grant code was renamed server-side
without updating `permissions.ts`. Fails closed and silently — check P.1.8 first.

**A Create/Save/toggle control is missing for literally every user, including SUPER_ADMIN**
→ do not assume the backend grant is missing before checking the literal itself, in any
module. Every real authority the backend issues, for every module's resources, is
`PERM_<RESOURCE>_<ACTION>` (verified by decoding a live login JWT — see
`references/architecture.md` AD-2). Confirmed incident, 2026-08-29: four Security-module
facades called `can('ROLE_CREATE')`, `can('PAGE_UPDATE')`, `can('USER_PROFILE_VIEW')`, etc.
— missing the `PERM_` prefix. Security was simply the first module built and tested; the
same class of mistake is equally possible in Organization, Master Data, Notifications, or
any future module, since the underlying convention is platform-wide, not Security-specific.
This fails closed silently: no error, no 403, the control just never
renders, for anyone. Before concluding a permission is genuinely ungranted **in any
module**, decode a real login response's JWT (`payload.authorities`) and diff it against the
literal in the `can(...)` call — don't trust what a spec doc says the naming convention is.

## How to run

```bash
rg -n "RequirePermission|RequireAuth" src/routes/routes.tsx     # Section 1
rg -n "onClick=" src/features --glob '*.tsx' | rg -v "Can"      # Section 2 candidates
rg -n "'[A-Z_]+_(VIEW|CREATE|UPDATE|DELETE)'" src               # P.4.1 inline literals
rg -n "permission:" src/routes/navigation.ts                    # P.5.1
rg -n "can\('[A-Z_]+'\)" src | rg -v "can\('PERM_"               # P.1.8 — literals missing the PERM_ prefix (see Diagnostic patterns)
```

To verify what the backend actually issues, rather than trusting this doc or any spec:

```bash
curl -s -X POST http://localhost:7272/api/auth/login -H "Content-Type: application/json" \
  -d '{"username":"<user>","password":"<pass>"}' \
  | python3 -c "import json,sys,base64; t=json.load(sys.stdin)['data']['accessToken'].split('.')[1]; t+='='*(-len(t)%4); print(sorted(json.loads(base64.urlsafe_b64decode(t))['authorities']))"
```

Then read each confirm handler top-down: the first statement must be `can(...)`.

```
PERMISSION REPORT
Feature: <name>        Date: <date>
S1 ROUTE LAYER    [X/8]
S2 UI LAYER       [X/8]
S3 HANDLER LAYER  [X/7]
S4 NAMING/BINDING [X/7]
S5 NAVIGATION     [X/6]
TOTAL: XX/34
AUTOMATIC REJECTION: YES/NO
VIOLATIONS: [action — missing layer — file:line]
NOTE: frontend gating is UX. Backend authorization is out of scope for this report.
VERDICT: APPROVED / APPROVED WITH WARNINGS / REJECTED
```

## Related skills
`create-routing` · `create-auth-session` · `create-confirm-actions` · `enforce-security` · `validate-frontend-feature`
