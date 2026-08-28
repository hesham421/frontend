# SECURITY — F3 Session Report

**Phase:** F3 (Frontend Validation Rule Specifications) — all 6 pending subs executed in one pass (all LIGHT/MEDIUM weight).

## Subs completed

| Sub | Rules covered | File |
|---|---|---|
| SCR-SEC-001 | RULE-SEC-030,032,033,038,040,041,050 | `src/auth/auth.schema.ts` |
| SCR-SEC-002 | RULE-SEC-049 | `src/users/users.schema.ts` |
| SCR-SEC-003 | RULE-SEC-042,043,044,045,048 | `src/roles/roles.schema.ts` |
| SCR-SEC-005 | RULE-SEC-046,047 | `src/pageRegistry/pageRegistry.schema.ts` |
| SCR-SEC-006 | RULE-SEC-034 | `src/userProfiles/userProfiles.schema.ts` |
| SCR-SEC-007 | RULE-SEC-035,036 | `src/roleDataScope/roleDataScope.schema.ts` |

Also added: `src/lib/errors/secErrors.ts` (ERR-SEC-{NNN} AR/EN message registry, 1:1 with every RULE-SEC block above) and the `zod` dependency (`package.json`).

## Scoping decision (read before F4)

This codebase's actual Security screens (`src/pages/Security/*.tsx`, `src/pages/Login.tsx`, `src/components/features/{UserProfileDrawer,DataScopeDrawer}.tsx`) are still the pre-governance prototype — `useState` per field, driven by `useSecurityStore`/`useAuthStore` (Zustand + mock data), with no RHF/Zod and no calls into the real F2 API/facade layer (`src/auth`, `src/users`, `src/roles`, `src/pageRegistry`, `src/userProfiles`, `src/roleDataScope`) that F1/F2 already built alongside them.

F3 followed the same precedent F1 (DTOs) and F2 (hooks/facades) already set: build the next layer of the real stack — Zod validation schemas — without touching the still-mock Shell. Wiring the Shell to the real API/schema/facade stack (replacing `useState` + Zustand-store actions with RHF + these schemas + the F2 mutations) is F4's explicit job per the Weight Map (F4 subs are literally described as "\<Page\>Wiring", still `PENDING`).

Consequently:
- **Login.tsx already contains all 5 auth sub-forms** as tabs (`login`/`signup`/`activate`/`forgot`/`reset`) in one file — not a Shell gap as the F1/F4 "XL, Shell status UNCONFIRMED" notes assumed. No new screens were created.
- **RULE-SEC-035's corrected `dataAccessLevel` enum is already live** in `DataScopeDrawer.tsx` (`BRANCH_ONLY`/`BRANCH_AND_CHILDREN`/`ALL`) — the new schema formalizes it via the existing `DATA_ACCESS_LEVELS` const, no drift found.
- Rules that are pure server-round-trip business checks (uniqueness, rate limiting, duplicate assignment, empty-source copy) have no client-side Zod encoding possible — each is documented in the relevant schema file's comments and keyed into `secErrors.ts` for the mutation's `ApiError` to consume once F4 wires the real facade calls in.

## Not done (explicitly out of scope for F3)

- No changes to any `.tsx` file — the mock Shell is untouched, per the UI Shell reference-check step (never redesign/rewire an existing component outside its owning phase).
- No `mapBackendError`/`normalizeError` implementation — `create-error-handling` is a Phase-1 "once per app" skill not yet run in this codebase; `secErrors.ts` is scoped to be its future input for the SECURITY module's `CODE_KEYS`, not a substitute for it.

## Verification

`npx tsc --noEmit` passes clean against the real DTOs (`satisfies z.ZodType<...Request>` on every schema catches any field drift immediately).

## Blocked / api_doc_gaps

None added this pass.
