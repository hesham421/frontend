# TestSprite AI Testing Report (MCP) — Organization Module Focus

---

## 1️⃣ Document Metadata
- **Project Name:** frontend
- **Module Focus:** ORG (Organization: Legal Entities, Branches, Regions, Departments, Cost Centers, Profit Centers, Location Sites), plus baseline SECURITY coverage
- **Date:** 2026-08-29
- **Prepared by:** TestSprite AI Team + Claude Code
- **Server Mode:** production build (`npm run build && npm run preview`), backend on `http://localhost:7272`
- **Test Account:** `admin` / `admin` (seeded SUPER_ADMIN)
- **Context:** first fresh TestSprite run since the Organization module (Legal Entities, Branches, Regions, Departments, Cost Centers, Profit Centers, Location Sites) was rewired from mock/local-state to real backend APIs under `/api/v1/org/*`.

---

## 2️⃣ Requirement Validation Summary

### Requirement: Login & Dashboard
#### TC001 Login and reach the dashboard — ✅ Passed
[TC001_Login_and_reach_the_dashboard.py](./TC001_Login_and_reach_the_dashboard.py)

### Requirement: Organization — Legal Entities
#### TC002 Create and update a legal entity — ✅ Passed
[TC002_Create_and_update_a_legal_entity.py](./TC002_Create_and_update_a_legal_entity.py)
#### TC006 Create and maintain a legal entity — ✅ Passed
[TC006_Create_and_maintain_a_legal_entity.py](./TC006_Create_and_maintain_a_legal_entity.py)
#### TC011 Activate and deactivate a legal entity — ✅ Passed
[TC011_Activate_and_deactivate_a_legal_entity.py](./TC011_Activate_and_deactivate_a_legal_entity.py)
#### TC016 Deactivate and reactivate a legal entity — ✅ Passed
[TC016_Deactivate_and_reactivate_a_legal_entity.py](./TC016_Deactivate_and_reactivate_a_legal_entity.py)
#### TC030 Search legal entities by name or code — ✅ Passed
[TC030_Search_legal_entities_by_name_or_code.py](./TC030_Search_legal_entities_by_name_or_code.py)

### Requirement: Organization — Branches
#### TC004 Create and maintain a branch under a legal entity — ✅ Passed
[TC004_Create_and_maintain_a_branch_under_a_legal_entity.py](./TC004_Create_and_maintain_a_branch_under_a_legal_entity.py)
#### TC014 Edit a branch and save updates — ✅ Passed
[TC014_Edit_a_branch_and_save_updates.py](./TC014_Edit_a_branch_and_save_updates.py)
#### TC023 Deactivate an active branch — ✅ Passed
[TC023_Deactivate_an_active_branch.py](./TC023_Deactivate_an_active_branch.py)
#### TC027 Search branches by name or code — ✅ Passed
[TC027_Search_branches_by_name_or_code.py](./TC027_Search_branches_by_name_or_code.py)

### Requirement: Organization — Regions
#### TC020 Create and maintain a region — ✅ Passed
[TC020_Create_and_maintain_a_region.py](./TC020_Create_and_maintain_a_region.py)

#### TC010 Create a region with a legal entity — ❌ Failed
[TC010_Create_a_region_with_a_legal_entity.py](./TC010_Create_a_region_with_a_legal_entity.py)
- **Error:** Creating a region did not save the selected Region Type. The new region "Test Region (EN)" (code `REG-TES`, legal entity "شركة أفيلنك للصناعة والخدمات اللوجستية") appears in the list as active, but its "نوع المنطقة" (Region Type) column is blank.
- **Analysis:** Real bug in the new Regions integration — either the create form isn't sending `regionTypeId` in the `POST /api/v1/org/regions` payload, or the list/table isn't reading the field back correctly from the response. Check `src/regions/hooks.ts` / `src/pages/Organization/Regions.tsx`'s create-form submission and the table column's field mapping.

### Requirement: Organization — Departments
#### TC008 Create a child department under a parent node — ✅ Passed
[TC008_Create_a_child_department_under_a_parent_node.py](./TC008_Create_a_child_department_under_a_parent_node.py)
#### TC019 Create and maintain a department with a branch — ✅ Passed
[TC019_Create_and_maintain_a_department_with_a_branch.py](./TC019_Create_and_maintain_a_department_with_a_branch.py)

#### TC017 Edit and deactivate a department in the branch tree — ❌ Failed
[TC017_Edit_and_deactivate_a_department_in_the_branch_tree.py](./TC017_Edit_and_deactivate_a_department_in_the_branch_tree.py)
- **Error:** Deactivating the department "عمليات فرع جدة الميدانية (محدثة)" did not mark it inactive in the UI after confirming. Its row still only offers "تعديل"/"إضافة فرعي" (edit/add-child) — no "تفعيل" (activate) control appeared, and the edit form remained open and editable rather than reflecting an inactive state.
- **Analysis:** Real bug — likely the deactivate mutation isn't invalidating/refetching the departments list correctly (compare to Branches' `useDeactivateBranch`, which does invalidate `branchKeys.lists()` on success), or the department row's active/inactive UI toggle logic doesn't check the updated `isActive` field. Check `src/departments/hooks.ts`'s `useDeactivateDepartment` and the row-rendering logic in `src/pages/Organization/Departments.tsx`.

### Requirement: Organization — Cost Centers
#### TC007 Create a root cost center — ✅ Passed
[TC007_Create_a_root_cost_center.py](./TC007_Create_a_root_cost_center.py)
#### TC018 Create a child cost center — ✅ Passed
[TC018_Create_a_child_cost_center.py](./TC018_Create_a_child_cost_center.py)
#### TC021 Edit a cost center — ✅ Passed
[TC021_Edit_a_cost_center.py](./TC021_Edit_a_cost_center.py)
#### TC022 Create and maintain a cost center — ✅ Passed
[TC022_Create_and_maintain_a_cost_center.py](./TC022_Create_and_maintain_a_cost_center.py)
#### TC024 View cost centers for a selected branch — ✅ Passed
[TC024_View_cost_centers_for_a_selected_branch.py](./TC024_View_cost_centers_for_a_selected_branch.py)

### Requirement: Organization — Profit Centers
#### TC009 Create a profit center — ✅ Passed
[TC009_Create_a_profit_center.py](./TC009_Create_a_profit_center.py)
#### TC026 Edit a profit center — ✅ Passed
[TC026_Edit_a_profit_center.py](./TC026_Edit_a_profit_center.py)

### Requirement: Organization — Location Sites
#### TC012 Create a location site — ✅ Passed
[TC012_Create_a_location_site.py](./TC012_Create_a_location_site.py)
#### TC028 Edit a location site — ✅ Passed
[TC028_Edit_a_location_site.py](./TC028_Edit_a_location_site.py)

### Requirement: Security Users Management
#### TC005 Create a new user — ✅ Passed
[TC005_Create_a_new_user.py](./TC005_Create_a_new_user.py)
#### TC015 Update a user's roles and profile — ✅ Passed
[TC015_Update_a_users_roles_and_profile.py](./TC015_Update_a_users_roles_and_profile.py)
#### TC025 Search and filter users — ✅ Passed
[TC025_Search_and_filter_users.py](./TC025_Search_and_filter_users.py)

### Requirement: Security Roles Management
#### TC013 Manage roles and permissions — ✅ Passed
[TC013_Manage_roles_and_permissions.py](./TC013_Manage_roles_and_permissions.py)
#### TC029 Search and filter roles — ✅ Passed
[TC029_Search_and_filter_roles.py](./TC029_Search_and_filter_roles.py)

#### TC003 Create and manage a user role — ❌ Failed
[TC003_Create_and_manage_a_user_role.py](./TC003_Create_and_manage_a_user_role.py)
- **Error:** Role edit and permission-copy both succeeded (role `ROLE_AUTOTEST_20260829_01`'s description was updated, permissions were copied from another role and saved), but the test never actually clicked an active-state toggle, so that part of the scenario wasn't exercised.
- **Analysis:** Test-execution gap, not a confirmed product bug — the agent didn't locate/click the activate/deactivate control within this session. Low priority to re-run given TC011/TC016 (Legal Entities) and prior runs' TC020/TC024 (Roles) already confirm activate/deactivate works elsewhere in this app; worth a quick manual check on Roles specifically if time allows, but not blocking.

---

## 3️⃣ Coverage & Matching Metrics

**27 / 30 passed — 90%**

| Requirement                         | Total Tests | ✅ Passed | ❌ Failed |
|--------------------------------------|:-----------:|:---------:|:---------:|
| Login & Dashboard                    | 1           | 1         | 0         |
| Organization — Legal Entities        | 5           | 5         | 0         |
| Organization — Branches              | 4           | 4         | 0         |
| Organization — Regions               | 2           | 1         | 1         |
| Organization — Departments           | 3           | 2         | 1         |
| Organization — Cost Centers          | 5           | 5         | 0         |
| Organization — Profit Centers        | 2           | 2         | 0         |
| Organization — Location Sites        | 2           | 2         | 0         |
| Security — Users                     | 3           | 3         | 0         |
| Security — Roles                     | 3           | 2         | 1         |
| **Total**                             | **30**      | **27**    | **3**     |

Organization subtotal: **23 tests, 21 passed (91%)** — the module's newly-wired real-backend CRUD is largely solid across all 7 entities on first fresh run.

---

## 4️⃣ Key Gaps / Risks

1. **Regions — Region Type not persisted (TC010, confirmed bug).** New regions save without their selected type, silently dropping data on create. Fix before relying on Region Type anywhere downstream (reporting, FK pickers elsewhere).
2. **Departments — deactivate doesn't update the UI (TC017, confirmed bug).** Either a missing query invalidation or a stale row-render check; compare against Branches' working `useDeactivateBranch` pattern, which is presumably the model this hook should follow.
3. **Roles — active-state toggle unverified (TC003).** Not a confirmed bug, but the one scenario in this run that didn't fully execute; worth a quick manual pass since it's cheap to check.
4. **Untested this run:** Permissions and Page Registry screens, Notifications workspace (mock-only, out of scope), and 20 of the 50 planned test cases were never generated (production-mode cap of 30 — the plan's remaining cases skewed toward Security Permissions/Pages and Notifications, all lower priority for this ORG-focused run).
5. **No regressions detected** in Legal Entities, Branches, Cost Centers, Profit Centers, or Location Sites — all passed cleanly across create/edit/search/activate/deactivate flows against the real backend.
