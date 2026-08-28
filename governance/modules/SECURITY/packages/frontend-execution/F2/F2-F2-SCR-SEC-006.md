<!-- Source: PHASE:F2 / SUB:F2-SCR-SEC-006 -->
<!-- Context: see F2-HEADER.md for phase-level strategy, registry table, and intro -->


### F2 — SCR-SEC-006 — User Profile [AS-BUILT identity preserved]

```
Shell status: CONFIRMED (UserProfileDrawer.tsx). Entity: ENTITY-SEC-009
(SecUserProfile) exclusively. Launched from SCR-SEC-002.
```

### F2-QUERY — API-SEC-037 — Get user profile by user ID
```
HTTP method    : GET
Endpoint path  : /api/v1/security/user-profiles/{userId}
Response shape : SecUserProfileDto
Hook type      : useQuery
Query key      : ['user-profiles', userId]
Errors         : 401 -> login; 403 -> unauthorized (USER_PROFILE_VIEW
                 required)
Loading        : LOCAL
Caching        : defaults
Enabled         : !!userId (only fires once the drawer is opened for a
                 specific user — standard Entry-screen-by-PK pattern)
```

### F2-QUERY — API-SEC-038 — Update user profile
```
HTTP method    : PUT
Endpoint path  : /api/v1/security/user-profiles/{userId}
Request shape  : UpdateSecUserProfileRequest { branchIdFk (required,
                 RULE-SEC-034), fullNameAr?, fullNameEn?,
                 preferredLang?, employeeIdFk? }
Response shape : SecUserProfileDto
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (USER_PROFILE_UPDATE required)
Invalidation   : ['user-profiles', userId]
Loading        : LOCAL
```

### F2-QUERY — API-SEC-039 — List user profiles
```
HTTP method    : GET
Endpoint path  : /api/v1/security/user-profiles
Request shape  : pageable (allowed sort: userIdFk, branchIdFk,
                 isActiveFl, createdAt)
Response shape : paginated list of SecUserProfileDto
Hook type      : useQuery
Query key      : ['user-profiles', { page, size, sort }]
Errors         : 401 -> login
Loading        : LOCAL
Caching        : defaults
USAGE NOTE: not used by SCR-SEC-006 itself (which is a by-userId
drawer, API-SEC-037), listed here for completeness per the "every
API-ID has an F2 spec" self-check requirement — no confirmed screen
consumes this list endpoint directly today.
```

### F2-QUERY — API-SEC-040 — Create user profile
```
HTTP method    : POST
Endpoint path  : /api/v1/security/user-profiles
Request shape  : CreateSecUserProfileRequest { userIdFk (required),
                 branchIdFk (required, RULE-SEC-034), fullNameAr?,
                 fullNameEn?, preferredLang?, employeeIdFk? }
Response shape : SecUserProfileDto
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (USER_PROFILE_CREATE required)
Invalidation   : ['user-profiles', userIdFk]
Loading        : LOCAL
GOVERNANCE NOTE: a profile is a separate creatable resource, not
auto-created alongside a User (POST /api/users has no profile fields
at all — confirmed, see F1-MODEL ENTITY-SEC-001). The Facade must treat
"does this user have a profile yet" as a real branch: API-SEC-037
returning 404-equivalent-empty (not explicitly documented, but implied
by profile being create-or-update, not always-exists) determines
whether the drawer's save action calls API-SEC-040 (create) or
API-SEC-038 (update).
```

### F2-QUERY — API-SEC-041 — Search user profiles
```
HTTP method    : POST
Endpoint path  : /api/v1/security/user-profiles/search
Response shape : paginated list of SecUserProfileDto
Hook type      : useMutation (POST-as-query pattern)
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (USER_PROFILE_VIEW required)
Loading        : LOCAL
Caching        : n/a (mutation pattern)
USAGE NOTE: same as API-SEC-039 — no confirmed screen consumes this
directly; listed for completeness.
```

### F2-SCREEN-INIT — SCR-SEC-006 — User Profile
```
On mount (drawer open, not page mount):
  1. Permission hook for SCR-SEC-006 -> canView, canEdit (no canCreate/
     canDelete in the usual sense — create is implicit via the
     create-or-update branch under API-SEC-040/038)
  2. No formal LOV hooks (branchIdFk options come from Organization's
     own branch list, confirmed already sourced via useOrganizationStore
     in the Shell — cross-module read, not a Security-owned LOV)
  3. Entry-by-PK query: useUserProfile(userId) (API-SEC-037), enabled:
     !!userId, drives the create-vs-update branch on save
```

### F2-FACADE-HOOK — SCR-SEC-006 — User Profile
```
Facade Hook name : useUserProfileFacade(userId)
Composes         : useUserProfile (API-SEC-037), useCreateUserProfile
                   (API-SEC-040), useUpdateUserProfile (API-SEC-038)

STATE OWNED: profile (from useUserProfile's data), isLoading (derived)

OPERATIONS EXPOSED: saveProfile(data) -> branches to create (API-SEC-
  040) if no profile exists yet, else update (API-SEC-038) — exposed as
  ONE operation per the create-or-update note under API-SEC-040

BOUNDARIES: components call this Facade only; composes the F2-QUERY
  hooks above only.

OQ-015 CARRYOVER (repeated once more per 0.4/F1-SCREEN — no new
content, cross-referenced for completeness at the data layer too):
this Facade does not filter or restrict anything by allowedBranches[]
— nothing to consume.
```

