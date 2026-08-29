
# TestSprite AI Testing Report (MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** frontend (avelynq-erp-dashboard)
- **Date:** 2026-08-28
- **Prepared by:** TestSprite AI Team
- **Environment:** Production build (`npm run build && npm run preview --port 4200`), backend Spring Boot API on `http://localhost:7272`, login as seeded `SUPER_ADMIN` account (`admin`/`admin`)
- **Scope:** 30 of 50 generated test cases (production-mode cap); remaining 20 (mostly Notifications and low-priority Organization CRUD) were not executed in this run

---

## 2️⃣ Requirement Validation Summary

### Requirement: Authentication and Self-Service

#### Test TC001 Login and reach the dashboard
- **Test Code:** [TC001_Login_and_reach_the_dashboard.py](./TC001_Login_and_reach_the_dashboard.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/f6067fdd-d535-4cd5-84fa-d1c93ccc83c8
- **Status:** ✅ Passed
- **Analysis / Findings:** Login with valid credentials correctly authenticates and lands on the dashboard with KPI content visible. Core auth gate works as designed.
---

#### Test TC002 Create a new account and see it marked for activation
- **Test Code:** [TC002_Create_a_new_account_and_see_it_marked_for_activation.py](./TC002_Create_a_new_account_and_see_it_marked_for_activation.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/62b7c5d4-31af-4820-b6a7-75a8ff3ad780
- **Status:** ✅ Passed
- **Analysis / Findings:** Signup form correctly creates an account in a disabled/inactive state pending activation.
---

#### Test TC003 Activate an account with a token
- **Test Code:** [TC003_Activate_an_account_with_a_token.py](./TC003_Activate_an_account_with_a_token.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/c74ea8c9-ce92-446d-b16c-b081a66925c9
- **Status:** ⚠️ Blocked
- **Analysis / Findings:** Could not complete — the activation screen has no way to obtain a real token from the UI (the field was pre-filled with a stale placeholder `ACT-998822`, which the backend correctly rejected as invalid/expired). This is a **test-environment gap, not a product bug**: activation tokens are delivered by email (see `MAIL_USERNAME`/`MAIL_PASSWORD` SMTP config in the backend), which TestSprite's browser session cannot read. To unblock: expose the token via a test-only backend endpoint or check the mail sink/logs for the generated token before running this case.
---

#### Test TC004 Request a password reset
- **Test Code:** [TC004_Request_a_password_reset.py](./TC004_Request_a_password_reset.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/555d391b-645d-41bf-906b-d156d8f82c50
- **Status:** ✅ Passed
- **Analysis / Findings:** Forgot-password form submits successfully and the UI acknowledges the request.
---

#### Test TC005 Set a new password with a recovery token
- **Test Code:** [TC005_Set_a_new_password_with_a_recovery_token.py](./TC005_Set_a_new_password_with_a_recovery_token.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/22177d6b-d351-4ebf-8390-54d87a1614d1
- **Status:** ⚠️ Blocked
- **Analysis / Findings:** Same root cause as TC003 — reset tokens are only delivered by email, and the UI provides no way to retrieve a valid one in an automated browser session. Not a product defect; a test-fixture limitation.
---

#### Test TC006 Reject invalid login credentials
- **Test Code:** [TC006_Reject_invalid_login_credentials.py](./TC006_Reject_invalid_login_credentials.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/7de243eb-f23b-4770-ae4d-62d91757adb2
- **Status:** ✅ Passed
- **Analysis / Findings:** Invalid credentials are correctly rejected with an error, and login rate limiting (relaxed in dev profile) did not interfere.
---

### Requirement: Role Management and RBAC

#### Test TC007 Edit a role permission matrix and remove a page
- **Test Code:** [TC007_Edit_a_role_permission_matrix_and_remove_a_page.py](./TC007_Edit_a_role_permission_matrix_and_remove_a_page.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/8164e68d-955e-4c0a-88f5-c6ae3ab8755b
- **Status:** ❌ Failed
- **Analysis / Findings:** **Real bug.** Removing a page ("Test Page") from a role's permission matrix and saving does not persist — reopening the Edit dialog still shows the page row with its CRUD checkboxes checked. Likely the "remove page" UI action isn't calling `DELETE /api/roles/{id}/pages/{pageCode}` (or the calling code has a bug), or the row is being re-added by a stale client-side cache/refetch. Needs backend/frontend investigation in `src/pages/Security/Roles.tsx` around the page-removal handler.
---

#### Test TC008 Copy permissions from another role
- **Test Code:** [TC008_Copy_permissions_from_another_role.py](./TC008_Copy_permissions_from_another_role.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/3999b07a-05ce-413b-86ed-4a2ff1748f84
- **Status:** ❌ Failed
- **Analysis / Findings:** **Real bug.** After selecting a source role and confirming "Copy From", the target role's permission matrix checkboxes remain unchecked and no success feedback is shown. Either `POST /api/roles/{id}/copy-from/{sourceRoleId}` is not being called/awaited correctly, or the UI isn't refetching `GET /api/roles/{id}/pages` after the copy completes. Worth checking `src/roles/hooks.ts` for a missing query invalidation after the copy mutation.
---

#### Test TC010 Sync a role's permissions from a source role
- **Test Code:** [TC010_Sync_a_roles_permissions_from_a_source_role.py](./TC010_Sync_a_roles_permissions_from_a_source_role.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/0ad4a266-0593-4eac-8ed1-fe32f969d85b
- **Status:** ✅ Passed
- **Analysis / Findings:** "Sync All" (bulk replace via `PUT /api/roles/{id}/pages`) works correctly, in contrast to the "Copy From" flow (TC008) which shares similar intent but fails — suggests the bug in TC008 is specific to the copy-from code path, not the general permission-matrix save mechanism.
---

#### Test TC012 Edit a role and save changes
- **Test Code:** [TC012_Edit_a_role_and_save_changes.py](./TC012_Edit_a_role_and_save_changes.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/f8d3661d-0069-4bc2-9da9-0f6d4a5548f9
- **Status:** ✅ Passed
- **Analysis / Findings:** Basic role field edits (name/description) persist correctly.
---

#### Test TC013 Search and filter roles
- **Test Code:** [TC013_Search_and_filter_roles.py](./TC013_Search_and_filter_roles.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/2ef06f28-80e1-48b0-bff3-f7373ded9665
- **Status:** ✅ Passed
- **Analysis / Findings:** Search and status filter work for the currently loaded page of results (consistent with the known client-side-only status filter limitation already documented for this screen).
---

#### Test TC015 Create a new role
- **Test Code:** [TC015_Create_a_new_role.py](./TC015_Create_a_new_role.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/d838cdee-6455-4f9e-8073-be5b8af09b3f
- **Status:** ✅ Passed
- **Analysis / Findings:** Role creation via `POST /api/roles` works end-to-end.
---

#### Test TC018 Deactivate and reactivate a role
- **Test Code:** [TC018_Deactivate_and_reactivate_a_role.py](./TC018_Deactivate_and_reactivate_a_role.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/ebdd40ee-d354-468d-b5b0-5fdb081827df
- **Status:** ✅ Passed
- **Analysis / Findings:** Both activate/deactivate transitions work with confirmation dialogs.
---

### Requirement: User Management

#### Test TC009 Update a user's details and roles
- **Test Code:** [TC009_Update_a_users_details_and_roles.py](./TC009_Update_a_users_details_and_roles.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/cd9a2be4-5d16-453d-a407-4efb0c046b2a
- **Status:** ❌ Failed
- **Analysis / Findings:** **Real bug.** The "Assigned Roles" control in the Edit User dialog does not respond to clicks — no dropdown/checklist opens, tried 6+ times on multiple users. Other controls in the same modal (Active toggle, Save, Cancel) work fine, isolating this to the roles-picker component itself in `src/pages/Security/Users.tsx`. This blocks role assignment entirely from the UI.
---

#### Test TC011 Search and filter users
- **Test Code:** [TC011_Search_and_filter_users.py](./TC011_Search_and_filter_users.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/0335e2dd-265c-4685-950b-16cb82f7bb8d
- **Status:** ✅ Passed
- **Analysis / Findings:** Search and status filter return correct results via `POST /api/users/search`.
---

#### Test TC014 Create a new user
- **Test Code:** [TC014_Create_a_new_user.py](./TC014_Create_a_new_user.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/52f82dea-aa58-460f-bc0a-11fe76e1151d
- **Status:** ✅ Passed
- **Analysis / Findings:** New user creation succeeds.
---

#### Test TC017 Open profile and data scope drawers from a user
- **Test Code:** [TC017_Open_profile_and_data_scope_drawers_from_a_user.py](./TC017_Open_profile_and_data_scope_drawers_from_a_user.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/a36c3750-3e7d-4f39-aea9-018b9e83f29e
- **Status:** ❌ Failed
- **Analysis / Findings:** **Real bug.** User Profile Drawer edits (Full Name EN, Employee ID) do not persist — reopening the drawer shows the original values. The Data Scope control was also disabled for this user, so that half of the flow couldn't even be exercised. Likely the save mutation in `src/userProfiles/hooks.ts` / `UserProfileDrawer.tsx` isn't sending the right payload, isn't awaited before the drawer closes, or the drawer reloads stale cached data on reopen instead of the fresh save response.
---

#### Test TC019 Delete a user
- **Test Code:** [TC019_Delete_a_user.py](./TC019_Delete_a_user.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/a3d617ad-7f46-4b2c-a254-63c2dae59235
- **Status:** ✅ Passed
- **Analysis / Findings:** Delete-with-confirmation flow works correctly.
---

#### Test TC021 Manage page registry entries
- **Test Code:** [TC021_Manage_page_registry_entries.py](./TC021_Manage_page_registry_entries.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/ff2525aa-dea0-4f97-b45c-2eeacff78701
- **Status:** ✅ Passed
- **Analysis / Findings:** Page registry CRUD works (mis-categorized by the generator under "User Management" — functionally a Page Registry test).
---

#### Test TC023 Manage permissions in the registry
- **Test Code:** [TC023_Manage_permissions_in_the_registry.py](./TC023_Manage_permissions_in_the_registry.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/309b08ab-0794-4aac-9b49-0f38abac6e0c
- **Status:** ✅ Passed
- **Analysis / Findings:** Permission registry create/edit works (mis-categorized under "User Management"; functionally belongs to Permission Registry).
---

### Requirement: Permission Registry

#### Test TC016 View security permission list and narrow it with search and module filters
- **Test Code:** [TC016_View_security_permission_list_and_narrow_it_with_search_and_module_filters.py](./TC016_View_security_permission_list_and_narrow_it_with_search_and_module_filters.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/b0f06eef-b720-4e80-a83e-acbe9f63a3f5
- **Status:** ❌ Failed
- **Analysis / Findings:** **Likely real bug (or a search-indexing quirk).** Searching "TESTPAGE" with the module filter set to "SEC (Security)" returns "No records found", even though matching `PERM_TESTPAGE...` rows were visible earlier in the same session before the module filter was applied. Suggests the combined search-text + module-filter query in `POST /api/permissions/search` is over-constraining (e.g. an AND on a module code that doesn't match how these permissions were tagged), or the module value sent by the UI doesn't match the backend's stored module code.
---

#### Test TC020 Create a new permission record
- **Test Code:** [TC020_Create_a_new_permission_record.py](./TC020_Create_a_new_permission_record.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/493489c4-e5f2-444c-808a-5bd94760e8e6
- **Status:** ✅ Passed
- **Analysis / Findings:** Permission creation succeeds.
---

#### Test TC022 Rename an existing permission
- **Test Code:** [TC022_Rename_an_existing_permission.py](./TC022_Rename_an_existing_permission.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/69a74f40-3786-424a-8623-bbdb828ba147
- **Status:** ✅ Passed
- **Analysis / Findings:** Name-only update via `PUT /api/permissions/{id}` works, consistent with the documented "no delete, name-only edit" design.
---

### Requirement: Page Registry

#### Test TC024 Search pages and filter them by module and status
- **Test Code:** [TC024_Search_pages_and_filter_them_by_module_and_status.py](./TC024_Search_pages_and_filter_them_by_module_and_status.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/80203930-c0d8-4709-a3e6-305fcaab73a4
- **Status:** ✅ Passed
- **Analysis / Findings:** Page search/filter works correctly — unlike the equivalent Permissions search (TC016), so the bug there is likely specific to the permissions-search query construction rather than a shared search component.
---

#### Test TC025 Create a new page registry entry
- **Test Code:** [TC025_Create_a_new_page_registry_entry.py](./TC025_Create_a_new_page_registry_entry.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/af158688-42fd-4279-8008-1fff7b35a763
- **Status:** ✅ Passed
- **Analysis / Findings:** New page creation succeeds and correctly triggers server-side auto-generation of the 4 CRUD permissions.
---

### Requirement: Organization Management (mock/local-state module)

#### Test TC026 Create and manage a branch
- **Status:** ✅ Passed — https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/ec280978-a2b5-4f30-a546-372b8bc8c766
- **Analysis / Findings:** Branch CRUD works against the in-memory mock store as expected; no persistence across reload by design.
---

#### Test TC027 Create, edit, and delete a legal entity
- **Status:** ✅ Passed — https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/e0290efa-203b-42f6-b27a-bb8cc1f888da
- **Analysis / Findings:** Legal entity CRUD works against the mock store.
---

#### Test TC028 Create and manage a legal entity
- **Status:** ✅ Passed — https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/b8771316-8c32-4690-9341-46281260eaf0
- **Analysis / Findings:** Overlaps with TC027; both confirm the same mock-backed CRUD path works.
---

#### Test TC029 Create, edit, and deactivate a branch
- **Status:** ✅ Passed — https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/f30b7c58-3a4e-4c70-af71-2812d27be11b
- **Analysis / Findings:** Deactivate confirmation dialog and state update work correctly.
---

#### Test TC030 Navigate through the organization tree views
- **Status:** ✅ Passed — https://www.testsprite.com/dashboard/mcp/tests/26fb8f30-b0f7-5c63-bdfb-82189c66d069/test/ccbf3d61-ca22-49a7-96b7-b58c08f21aa8
- **Analysis / Findings:** Departments/Cost Centers tree expand-collapse navigation works.
---

### Not Executed (production-mode 30-test cap reached)

The following 20 generated cases were not run in this session: TC031 (Deactivate/reactivate a page entry), TC032–034, TC036–038 (Organization: profit centers, regions, cost centers), TC035 (Dashboard quick-nav), TC039–042, TC044, TC046–050 (Notifications inbox/templates/channels, dashboard attachment drawer), TC043, TC045 (profit center/location CRUD), TC049 (Organization session-locality check). These are lower-priority per the generated plan and mostly cover the already-known mock-only Notifications module. Re-run with `testIds` scoped to these if full coverage is needed.

---

## 3️⃣ Coverage & Matching Metrics

**76.7% of executed tests passed (23/30).**

| Requirement                         | Total Tests | ✅ Passed | ❌ Failed | ⚠️ Blocked |
|--------------------------------------|:-----------:|:---------:|:---------:|:----------:|
| Authentication and Self-Service      | 6           | 4         | 0         | 2          |
| Role Management and RBAC             | 7           | 5         | 2         | 0          |
| User Management                      | 7           | 5         | 2         | 0          |
| Permission Registry                  | 3           | 2         | 1         | 0          |
| Page Registry                        | 2           | 2         | 0         | 0          |
| Organization Management              | 5           | 5         | 0         | 0          |
| **Total**                            | **30**      | **23**    | **5**     | **2**      |

---

## 4️⃣ Key Gaps / Risks

**High-priority real bugs found (not test-environment artifacts):**

1. **Role permission-matrix "remove page" doesn't persist** (TC007) — deleting a page row from a role's permission matrix and saving silently fails to remove it server-side.
2. **"Copy permissions from role" doesn't apply** (TC008) — the copy-from-role action shows no effect and no error/success feedback, while the related "Sync All" action (TC010) works fine — points to a bug isolated to the copy-from code path or its post-copy refetch.
3. **"Assigned Roles" picker in Edit User dialog is unresponsive** (TC009) — this blocks assigning/changing a user's roles from the UI entirely, a core RBAC workflow.
4. **User Profile Drawer edits don't persist** (TC017) — Full Name and Employee ID changes are silently discarded; likely a missing/incorrect save call or stale-cache reopen. The Data Scope control being disabled for this user also blocked half the test and should be investigated (expected to be enabled for editable users).
5. **Permission search + module filter over-constrains results** (TC016) — combining a text search with the "SEC (Security)" module filter returns zero results even for permissions confirmed to exist and match, while the equivalent Page Registry search (TC024) works correctly — suggests a module-code mismatch specific to the permissions search query.

**Test-environment limitations (not product bugs):**
- Account activation (TC003) and password reset (TC005) cannot be completed by browser automation alone since tokens are delivered via email (Gmail SMTP) with no in-app fallback to retrieve them. To get full coverage here, either add a dev/test-only endpoint to fetch the last-issued token, or point TestSprite at a mail-catcher (e.g. Mailhog) instead of real Gmail SMTP.
- 20 of 50 planned tests were not run due to the 30-test cap TestSprite applies even in production mode; the untested set is concentrated in the already-known-mock Notifications module and lower-priority Organization CRUD screens, so risk of missing a *new* backend-integration bug there is low — but it does mean regressions in Dashboard quick-navigation (TC035) and page reactivation (TC031) went unchecked this run.

**Suggested next step:** file the 5 confirmed failures above as bugs (TC007, TC008, TC009, TC016, TC017 map directly to reproducible steps via the linked TestSprite visualizations), then re-run with `testIds` targeting TC031–TC050 for full-plan coverage once these are fixed.
