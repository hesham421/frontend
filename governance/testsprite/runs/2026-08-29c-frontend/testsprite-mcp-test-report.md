# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** frontend (avelynq-erp-dashboard)
- **Date:** 2026-08-29
- **Prepared by:** TestSprite AI Team
- **Run focus:** Organization module (Legal Entities, Branches, Regions, Departments, Cost Centers, Profit Centers, Location Sites) - recently rewired from mock/local-state to real backend APIs
- **Server mode:** production (build + preview), 30/50 planned cases executed (production-mode cap)

---

## 2️⃣ Requirement Validation Summary

### Security - Authentication

#### Test TC001 Login and reach the dashboard
- **Test Code:** [TC001_Login_and_reach_the_dashboard.py](./TC001_Login_and_reach_the_dashboard.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Login succeeded against the real backend and landed on the dashboard as expected.
---


### Security - Users Management

#### Test TC005 Create a new user
- **Test Code:** [TC005_Create_a_new_user.py](./TC005_Create_a_new_user.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** New user creation succeeded end-to-end.
---

#### Test TC015 Update a user's roles and profile
- **Test Code:** [TC015_Update_a_users_roles_and_profile.py](./TC015_Update_a_users_roles_and_profile.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** User role and profile update persisted correctly.
---

#### Test TC025 Search and filter users
- **Test Code:** [TC025_Search_and_filter_users.py](./TC025_Search_and_filter_users.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** User search and filter returned correct results.
---


### Security - Roles Management

#### Test TC003 Create and manage a user role
- **Test Code:** [TC003_Create_and_manage_a_user_role.py](./TC003_Create_and_manage_a_user_role.py)
- **Test Error:** TEST FAILURE

The role edit and permission-copy operations succeeded, but the required active-state toggle action was not performed during this session, so the full test intent was not exercised.

Observations:
- The role 'ROLE_AUTOTEST_20260829_01' was opened, its description was updated, permissions were copied from 'test ahmed (TEST1234)', and 'تأكيد' and 'حفظ التعديلات' were clicked; the updated description appears in the role list.
- The permission matrix modal opened and was used to copy permissions; changes were saved and the modal closed.
- No explicit action was performed to toggle the role's active state (no enable/disable toggle click recorded), so the active-state toggle capability was not verified.

- **Status:** ❌ Failed
- **Analysis / Findings:** Role description update and copy-permissions-from-role both worked and persisted, but the test did not exercise the active/inactive toggle, so that specific capability remains unverified this run (test-scenario gap, not a confirmed product bug).
---

#### Test TC013 Manage roles and permissions
- **Test Code:** [TC013_Manage_roles_and_permissions.py](./TC013_Manage_roles_and_permissions.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Role and permission management flow passed.
---

#### Test TC029 Search and filter roles
- **Test Code:** [TC029_Search_and_filter_roles.py](./TC029_Search_and_filter_roles.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Role search and filter returned correct results.
---


### Organization - Legal Entities

#### Test TC002 Create and update a legal entity
- **Test Code:** [TC002_Create_and_update_a_legal_entity.py](./TC002_Create_and_update_a_legal_entity.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Legal entity update flow persisted changes correctly.
---

#### Test TC006 Create and maintain a legal entity
- **Test Code:** [TC006_Create_and_maintain_a_legal_entity.py](./TC006_Create_and_maintain_a_legal_entity.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Legal entity create/maintain flow passed.
---

#### Test TC011 Activate and deactivate a legal entity
- **Test Code:** [TC011_Activate_and_deactivate_a_legal_entity.py](./TC011_Activate_and_deactivate_a_legal_entity.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Legal entity activate/deactivate toggle round-tripped correctly.
---

#### Test TC016 Deactivate and reactivate a legal entity
- **Test Code:** [TC016_Deactivate_and_reactivate_a_legal_entity.py](./TC016_Deactivate_and_reactivate_a_legal_entity.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Legal entity deactivate/reactivate round-tripped correctly.
---

#### Test TC030 Search legal entities by name or code
- **Test Code:** [TC030_Search_legal_entities_by_name_or_code.py](./TC030_Search_legal_entities_by_name_or_code.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Legal entity search by name/code returned correct results.
---


### Organization - Branches

#### Test TC004 Create and maintain a branch under a legal entity
- **Test Code:** [TC004_Create_and_maintain_a_branch_under_a_legal_entity.py](./TC004_Create_and_maintain_a_branch_under_a_legal_entity.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Branch created successfully under a selected parent legal entity.
---

#### Test TC014 Edit a branch and save updates
- **Test Code:** [TC014_Edit_a_branch_and_save_updates.py](./TC014_Edit_a_branch_and_save_updates.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Branch edit and save succeeded.
---

#### Test TC023 Deactivate an active branch
- **Test Code:** [TC023_Deactivate_an_active_branch.py](./TC023_Deactivate_an_active_branch.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Branch deactivation succeeded.
---

#### Test TC027 Search branches by name or code
- **Test Code:** [TC027_Search_branches_by_name_or_code.py](./TC027_Search_branches_by_name_or_code.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Branch search by name/code returned correct results.
---


### Organization - Regions

#### Test TC010 Create a region with a legal entity
- **Test Code:** [TC010_Create_a_region_with_a_legal_entity.py](./TC010_Create_a_region_with_a_legal_entity.py)
- **Status:** ❌ Failed
- **Analysis / Findings:** BUG: creating a region with a selected Region Type does not persist/display that type - the new row shows an empty نوع المنطقة (Region Type) column despite the value being selected during creation.
---

#### Test TC020 Create and maintain a region
- **Test Code:** [TC020_Create_and_maintain_a_region.py](./TC020_Create_and_maintain_a_region.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Region create/maintain flow passed.
---


### Organization - Departments

#### Test TC008 Create a child department under a parent node
- **Test Code:** [TC008_Create_a_child_department_under_a_parent_node.py](./TC008_Create_a_child_department_under_a_parent_node.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Child department creation under a parent node succeeded.
---

#### Test TC017 Edit and deactivate a department in the branch tree
- **Test Code:** [TC017_Edit_and_deactivate_a_department_in_the_branch_tree.py](./TC017_Edit_and_deactivate_a_department_in_the_branch_tree.py)
- **Test Error:** TEST FAILURE

Deactivating the department did not mark it as inactive in the UI after confirming the deactivation.

Observations:
- The department row shows 'عمليات فرع جدة الميدانية (محدثة)' and its action area still provides 'تعديل' and 'إضافة فرعي' (edit/add) — no 'تفعيل' (activate) button is present.
- A page search for the texts 'تفعيل' and 'معطل' returned no matches.
- The department's edit form is open with populated fields and the 'حفظ التعديلات' button visible, indicating the record remains editable rather than inactive.

- **Status:** ❌ Failed
- **Analysis / Findings:** BUG: deactivating a department does not mark it inactive in the UI - after confirming deactivation, the row still shows edit/add-child actions with no activate control, and the edit form remains open and editable rather than reflecting an inactive state.
---

#### Test TC019 Create and maintain a department with a branch
- **Test Code:** [TC019_Create_and_maintain_a_department_with_a_branch.py](./TC019_Create_and_maintain_a_department_with_a_branch.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Department creation with a branch link succeeded.
---


### Organization - Cost Centers

#### Test TC007 Create a root cost center
- **Test Code:** [TC007_Create_a_root_cost_center.py](./TC007_Create_a_root_cost_center.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Root-level cost center creation succeeded.
---

#### Test TC018 Create a child cost center
- **Test Code:** [TC018_Create_a_child_cost_center.py](./TC018_Create_a_child_cost_center.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Child cost center creation succeeded.
---

#### Test TC021 Edit a cost center
- **Test Code:** [TC021_Edit_a_cost_center.py](./TC021_Edit_a_cost_center.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Cost center edit succeeded.
---

#### Test TC022 Create and maintain a cost center
- **Test Code:** [TC022_Create_and_maintain_a_cost_center.py](./TC022_Create_and_maintain_a_cost_center.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Cost center create/maintain flow passed.
---

#### Test TC024 View cost centers for a selected branch
- **Test Code:** [TC024_View_cost_centers_for_a_selected_branch.py](./TC024_View_cost_centers_for_a_selected_branch.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Cost centers correctly filtered/displayed for a selected branch.
---


### Organization - Profit Centers

#### Test TC009 Create a profit center
- **Test Code:** [TC009_Create_a_profit_center.py](./TC009_Create_a_profit_center.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Profit center creation succeeded.
---

#### Test TC026 Edit a profit center
- **Test Code:** [TC026_Edit_a_profit_center.py](./TC026_Edit_a_profit_center.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Profit center edit succeeded.
---


### Organization - Location Sites

#### Test TC012 Create a location site
- **Test Code:** [TC012_Create_a_location_site.py](./TC012_Create_a_location_site.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Location site creation succeeded.
---

#### Test TC028 Edit a location site
- **Test Code:** [TC028_Edit_a_location_site.py](./TC028_Edit_a_location_site.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Location site edit succeeded.
---


## 3️⃣ Coverage & Matching Metrics

- **27/30 (90.0%)** of executed tests passed.
- 30 of 50 planned cases were executed (production-mode cap of 30 high-priority cases); the remaining 20 (mostly Security Permissions/Pages edge cases and the Notifications mock workspace) were planned but not run this pass.

| Requirement | Total Tests | ✅ Passed | ❌ Failed |
|---|---|---|---|
| Security - Authentication | 1 | 1 | 0 |
| Security - Users Management | 3 | 3 | 0 |
| Security - Roles Management | 3 | 2 | 1 |
| Organization - Legal Entities | 5 | 5 | 0 |
| Organization - Branches | 4 | 4 | 0 |
| Organization - Regions | 2 | 1 | 1 |
| Organization - Departments | 3 | 2 | 1 |
| Organization - Cost Centers | 5 | 5 | 0 |
| Organization - Profit Centers | 2 | 2 | 0 |
| Organization - Location Sites | 2 | 2 | 0 |
| **Total** | **30** | **27** | **3** |

---

## 4️⃣ Key Gaps / Risks

- **Organization > Regions - Region Type not persisted (TC010):** creating a region with a Region Type selection results in the field showing blank in the list afterward. Needs investigation in `src/regions/hooks.ts` / `src/pages/Organization/Regions.tsx` (request payload) and the backend `/api/v1/org/regions` create endpoint (response/read-back shape).
- **Organization > Departments - Deactivate doesn't reflect in UI (TC017):** confirming a department deactivation leaves the row showing active-state actions (edit/add-child) instead of switching to an inactive state with an activate control. Needs investigation in `src/departments/hooks.ts` (query invalidation after `deactivate`) and `src/pages/Organization/Departments.tsx` (row action rendering based on `isActive`).
- **Security > Roles - active-state toggle unverified (TC003):** the generated test didn't exercise the enable/disable toggle for a role; description-edit and copy-permissions-from-role both worked. Not a confirmed bug - recommend a targeted re-run or manual check of Security > Roles activate/deactivate before considering it verified.
- **Not covered this run:** Security Permissions (search/create/edit), Security Pages Registry, Master Data Lookups, and the Notifications mock workspace were planned (TC031-TC050) but not executed under the 30-case production cap. Two previously-known issues (Permissions search+module-filter combo, user-delete-with-linked-data conflict) were therefore not re-verified this run.
