---
name: enforce-security
description: "FRONTEND SECURITY ENFORCER — 34 checks on token and session handling, XSS, CSRF, unsafe HTML, URL and redirect validation, file uploads, error leakage, environment variables, secrets, and dependency risk. Use during security review, before release, or whenever credentials, user-supplied content, or external input are involved."
---

# Skill: enforce-security

## Description
Frontend security audit. Rules: `references/contract-rules.md` §SEC, §R.9;
`references/architecture.md` AD-4, AD-6.

## When to Use
- Security review or pre-release check
- Anything touching credentials, user-supplied content, or external input
- After adding a dependency

## When NOT to Use
- Backend authorization design
- Infrastructure and headers (CSP, HSTS) — flag them, but they are owned by the platform

---

## What the frontend can and cannot protect

| The frontend CAN | The backend MUST |
|---|---|
| Keep tokens out of persistent storage | Validate every token on every request |
| Avoid injecting untrusted HTML | Authorize every operation |
| Refuse to render `javascript:` URLs | Enforce ownership and tenancy |
| Validate a redirect target as same-origin | Re-validate every input and file |
| Hide actions the user cannot perform | Reject those actions if attempted |
| Avoid leaking internals in errors | Rate-limit and audit |

Anything in the left column is defence in depth. Anything in the right column is the
control. A reviewer who reads a passing report here as "the feature is secure" has misread
it (SEC.11).

## Section 1 — Credentials and session (9)

| # | Check |
|---|---|
| SEC.1.1 | No token in `localStorage`, `sessionStorage`, IndexedDB, or a JS-readable cookie |
| SEC.1.2 | Access token in memory only; refresh token httpOnly, Secure, SameSite, path-scoped |
| SEC.1.3 | Cookie-bearing endpoints send a double-submit CSRF header |
| SEC.1.4 | Business endpoints use the `Authorization` header, not ambient cookies |
| SEC.1.5 | Refresh is single-flight; failure is a hard logout, not a retry loop |
| SEC.1.6 | Logout clears the token, the query cache, and other tabs |
| SEC.1.7 | No token, permission set, or session payload logged or sent to analytics |
| SEC.1.8 | No credential in a URL, search param, `document.title`, or referrer |
| SEC.1.9 | Post-login redirect validated as a same-origin relative path |

## Section 2 — Injection and content (7)

| # | Check |
|---|---|
| SEC.2.1 | `dangerouslySetInnerHTML` only inside a sanitising wrapper with an allow-list |
| SEC.2.2 | No `eval`, `new Function`, or string-bodied `setTimeout` |
| SEC.2.3 | User-supplied URLs validated before use in `href`, `src`, or navigation |
| SEC.2.4 | `javascript:`, `data:`, and `vbscript:` schemes rejected |
| SEC.2.5 | External links carry `rel="noopener noreferrer"` |
| SEC.2.6 | No untrusted content injected into `<style>`, `<script>`, or CSS custom properties |
| SEC.2.7 | Markdown or rich text rendered through a sanitiser, never raw |

## Section 3 — Data exposure (6)

| # | Check |
|---|---|
| SEC.3.1 | Errors show mapped copy plus a correlation ID — never stacks, SQL, or class names |
| SEC.3.2 | Monitoring payloads scrubbed of tokens, headers, bodies, and PII |
| SEC.3.3 | No sensitive field written to `localStorage` or `sessionStorage` |
| SEC.3.4 | Query cache cleared on logout so the next user cannot read it |
| SEC.3.5 | No sensitive value in a URL that lands in browser history or server logs |
| SEC.3.6 | Debug logging removed or gated behind a build flag |

## Section 4 — Input and files (5)

| # | Check |
|---|---|
| SEC.4.1 | Upload type and size checked client-side as UX, re-validated server-side |
| SEC.4.2 | Uploads sent as `FormData` without a manual `Content-Type` |
| SEC.4.3 | Downloaded blob URLs revoked after use |
| SEC.4.4 | Filenames from the server sanitised before use in a `download` attribute |
| SEC.4.5 | Client-side validation never treated as the enforcement point |

## Section 5 — Configuration and supply chain (7)

| # | Check |
|---|---|
| SEC.5.1 | Only `VITE_`-prefixed public config reaches the client |
| SEC.5.2 | No API key, secret, or private endpoint in source, env, or bundle |
| SEC.5.3 | `.env` files excluded from version control; `.env.example` documents keys only |
| SEC.5.4 | Source maps not published for production, or access-restricted |
| SEC.5.5 | Dependency audit runs in CI and fails on high severity |
| SEC.5.6 | New runtime dependencies appear in the ownership table with a rationale |
| SEC.5.7 | Lockfile committed; no floating major ranges on security-relevant packages |

---

## Automatic rejection triggers

| # | Trigger | Rule |
|---|---|---|
| 1 | Token in persistent or JS-readable storage | SEC.1.1 |
| 2 | Cookie endpoint without CSRF protection | SEC.1.3 |
| 3 | Logout leaving the cache or other tabs authenticated | SEC.1.6 |
| 4 | Credential in a log, URL, or analytics payload | SEC.1.7, SEC.1.8 |
| 5 | Unvalidated post-login redirect | SEC.1.9 |
| 6 | Unsanitised `dangerouslySetInnerHTML` | SEC.2.1 |
| 7 | `eval` or `new Function` | SEC.2.2 |
| 8 | Unvalidated user-supplied URL rendered or navigated | SEC.2.3, SEC.2.4 |
| 9 | Stack trace or internal identifier shown to a user | SEC.3.1 |
| 10 | Request or response body sent to monitoring | SEC.3.2 |
| 11 | Sensitive value written to storage | SEC.3.3 |
| 12 | Secret in source, env, or bundle | SEC.5.2 |
| 13 | Frontend check presented as the enforcement of an authorization rule | SEC.11 |

## Detection recipes

```bash
rg -n "localStorage|sessionStorage|indexedDB" src                       # SEC.1.1
rg -n "dangerouslySetInnerHTML" src                                     # SEC.2.1
rg -n "\beval\(|new Function\(" src                                     # SEC.2.2
rg -n "target=\"_blank\"" src | rg -v "noopener"                        # SEC.2.5
rg -n "console\.(log|debug)" src                                        # SEC.3.6
rg -n "import\.meta\.env\.(?!VITE_)" src                                # SEC.5.1
rg -n "(api[_-]?key|secret|password)\s*[:=]\s*['\"]" src                # SEC.5.2
git check-ignore .env && npm audit --audit-level=high                   # SEC.5.3, SEC.5.5
```

Grep finds the mechanical cases. The judgement cases — is this URL user-controlled, is this
field sensitive, is this error message leaking a schema detail — need reading.

## Report

```
FRONTEND SECURITY REPORT
Scope: <feature or release>     Date: <date>
S1 CREDENTIALS & SESSION [X/9]
S2 INJECTION & CONTENT   [X/7]
S3 DATA EXPOSURE         [X/6]
S4 INPUT & FILES         [X/5]
S5 CONFIG & SUPPLY CHAIN [X/7]
TOTAL: XX/34
AUTOMATIC REJECTION: YES/NO
FINDINGS: [severity — file:line — rule — remediation]
SCOPE NOTE: frontend controls only. Backend authorization, rate limiting,
tenancy isolation, and response headers are NOT covered by this report.
VERDICT: APPROVED / APPROVED WITH WARNINGS / REJECTED
```

## Related skills
`create-auth-session` · `create-error-handling` · `enforce-permissions` · `validate-frontend-feature`
