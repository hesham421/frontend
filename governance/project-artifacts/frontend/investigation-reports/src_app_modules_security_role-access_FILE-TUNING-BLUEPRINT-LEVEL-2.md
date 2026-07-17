> Relocated from `frontend/src/app/modules/security/role-access/FILE-TUNING-BLUEPRINT-LEVEL-2.md` on 2026-07-06 as part of the non-functional artifact consolidation.
> See `governance-repo/project-artifacts/CONSOLIDATION-INVENTORY.md`.

# Role Access Management - File Tuning Document

**Module:** `src/app/modules/security/role-access/`  
**Blueprint Level:** 2 (Page-Based CRUD)  
**Date Created:** 2026-01-29  
**Status:** ✅ COMPLIANT

---

## 1. Blueprint Declaration

### 1.1 Blueprint Level

**Level 2 - Page-Based CRUD Screens (DEFAULT)**

Role Access Management follows Blueprint Level 2 pattern with:
- **Page A:** Search/List page (`role-access-control.component`)
- **Page B:** Create/Edit page (`role-access-form.component`)

This is the **DEFAULT and RECOMMENDED** pattern for admin and master data screens.

---

## 2. Screen Routes and Navigation Flow

### 2.1 Route Structure

```typescript
// Defined in: security-routing.module.ts
{
  path: 'role-access',
  component: RoleAccessControlComponent  // Page A (List)
},
{
  path: 'role-access/create',
  component: RoleAccessFormComponent     // Page B (Create mode)
},
{
  path: 'role-access/edit/:id',
  component: RoleAccessFormComponent     // Page B (Edit mode)
}
```

### 2.2 Navigation Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Page A: role-access-control (Search/List)                  │
│  ├─ Search & filter section                                 │
│  ├─ Results table (ag-Grid)                                 │
│  └─ Row-level actions:                                      │
│     ├─ Edit → Navigate to /role-access/edit/:id            │
│     └─ Delete → Inline with confirmation dialog            │
│                                                             │
│  Header actions:                                            │
│  └─ Add Role → Navigate to /role-access/create             │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Page B: role-access-form (Create/Edit)                     │
│  ├─ Role info form (name, active status)                   │
│  ├─ Create mode: Show "Create Role" button                 │
│  ├─ Edit mode: Show page permissions table                 │
│  │   └─ CRUD checkboxes per page                           │
│  └─ Actions:                                                │
│     ├─ Save → Show success feedback, navigate back         │
│     └─ Cancel/Back → Navigate back without side effects    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Shared Components Consumption

### 3.1 Shared UI Components Used

✅ **COMPLIANT:** All required shared components are consumed.

| Shared Component | Usage Location | Purpose |
|------------------|----------------|---------|
| `ErpListComponent` | `role-access-control.component.ts` (extends) | Base class for list pages with pagination |
| `SpecificationFilterComponent` | `role-access-control.component.html:24` | Advanced search filters |
| `ErpEmptyStateComponent` | `role-access-control.component.html:42,48` | Empty state for error/no data |
| `ErpBackButtonComponent` | `role-access-form.component.html:3` | Back navigation button |
| `ErpFormFieldComponent` | `role-access-form.component.html:10` | Consistent form field wrapper |
| `ErpSectionComponent` | `role-access-form.component.html:7,76` | Form section grouping |
| `ErpDualListComponent` | `role-access-form.component.html:164` | Dual-list item selector for pages |

### 3.2 Shared Services Used

| Shared Service | Usage Location | Purpose |
|----------------|----------------|---------|
| `ErpDialogService` | Both components | Confirmation dialogs |
| `ErpNotificationService` | Both components | Toast notifications |
| `ErpErrorMapperService` | `role-access.facade.ts:90` | Backend error code mapping |

### 3.3 Shared Directives Used

| Directive | Usage | Purpose |
|-----------|-------|---------|
| `ErpPermissionDirective` | All action buttons | Permission-based visibility (RBAC) |

---

## 4. Facade Boundary Compliance

✅ **COMPLIANT:** Strict facade boundary enforcement.

### 4.1 Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Component Layer (UI only, no business logic)               │
│  ├─ role-access-control.component.ts                        │
│  └─ role-access-form.component.ts                           │
│           │                                                  │
│           ▼ (inject facade)                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Facade Layer (State + orchestration)                 │  │
│  │  role-access.facade.ts                                │  │
│  │    ├─ Signals for state management                    │  │
│  │    ├─ Business orchestration                          │  │
│  │    └─ Error handling                                  │  │
│  └───────────────────────────────────────────────────────┘  │
│           │                                                  │
│           ▼ (inject service)                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Service Layer (HTTP/API calls)                       │  │
│  │  role-access-api.service.ts                           │  │
│  │    └─ Backend communication only                      │  │
│  └───────────────────────────────────────────────────────┘  │
│           │                                                  │
│           ▼                                                  │
│       Backend API                                           │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Component → Facade Rules

✅ **Components:**
- Import and inject `RoleAccessFacade`
- Use facade signals for reactive state
- Call facade methods for actions
- Do NOT call service directly
- Do NOT contain business logic
- Do NOT make HTTP calls

✅ **Example (role-access-control.component.ts):**
```typescript
readonly facade = inject(RoleAccessFacade);

get rowData(): RoleDto[] {
  return this.facade.roles();  // ✅ Access via facade signal
}

refreshData(): void {
  this.facade.loadRoles();  // ✅ Action via facade method
}
```

### 4.3 Facade → Service Rules

✅ **Facade:**
- Manages signals (state)
- Orchestrates business flows
- Handles errors
- Calls service for API operations

✅ **Service:**
- Pure HTTP client wrapper
- No state management
- No business logic
- Returns Observables

---

## 5. Localization Compliance

✅ **COMPLIANT:** Zero hardcoded text in UI.

### 5.1 Translation Keys Used

| Translation Key | Location | Purpose |
|-----------------|----------|---------|
| `ROLE_ACCESS.TITLE` | Both components | Page title |
| `ROLE_ACCESS.ADD_ROLE` | List page | Add button label |
| `ROLE_ACCESS.ROLE_NAME` | Form page | Form field label |
| `ROLE_ACCESS.ROLE_NAME_PLACEHOLDER` | Form page | Input placeholder |
| `ROLE_ACCESS.IS_ACTIVE` | Form page | Active checkbox label |
| `ROLE_ACCESS.CREATE_ROLE` | Form page | Create button label |
| `ROLE_ACCESS.COPY_FROM` | Form page | Copy permissions button |
| `ROLE_ACCESS.ADD_PAGE` | Form page | Add page button |
| `ROLE_ACCESS.PAGES_ACCESS` | Form page | Section title |
| `ROLE_ACCESS.PAGE_NAME` | Form page | Table column header |
| `ROLE_ACCESS.CREATE` | Form page | Permission column header |
| `ROLE_ACCESS.UPDATE` | Form page | Permission column header |
| `ROLE_ACCESS.DELETE` | Form page | Permission column header |
| `ROLE_ACCESS.ALL` | Form page | Select all column |
| `ROLE_ACCESS.NO_PAGES_ASSIGNED` | Form page | Empty table message |
| `ROLE_ACCESS.NO_ROLES` | List page | Empty list message |
| `COMMON.REFRESH` | List page | Refresh button |
| `COMMON.SAVE` | Form page | Save button |
| `COMMON.VIEW` | Form page | View permission label |
| `COMMON.AUTO` | Form page | Auto-granted indicator |
| `COMMON.NO_DATA` | List page | Empty state title |
| `ERRORS.OPERATION_FAILED` | List page | Error state title |
| `ERRORS.TRY_AGAIN` | List page | Error state message |
| `USERS.ADVANCED_FILTERS` | List page | Show filters button |
| `USERS.HIDE_FILTERS` | List page | Hide filters button |

### 5.2 Validation Messages

✅ **Form validation uses shared form error resolver:**

```typescript
// In role-access-form.component.ts
import { getFormFieldError, isFormFieldInvalid } from '@shared/utils/form-error-resolver';

// Validators applied via FormBuilder
this.roleForm = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(3)]],
  active: [true]
});
```

Validation keys automatically resolved:
- `VALIDATION.REQUIRED` → "This field is required"
- `VALIDATION.MIN_LENGTH` → "Minimum length is {min}"

---

## 6. User Feedback Compliance

✅ **COMPLIANT:** All operations provide clear user feedback.

### 6.1 Save Operations

**Create Role:**
```typescript
onCreateRole(): void {
  // Show validation errors if form invalid
  if (this.roleForm.invalid) {
    this.roleForm.markAllAsTouched();
    return;
  }

  // Call facade
  this.facade.createRole(roleData);

  // Facade effect handles success notification:
  effect(() => {
    const role = this.facade.selectedRole();
    if (!role) return;
    untracked(() => {
      this.notificationService.success('ROLE_ACCESS.ROLE_CREATED');
      this.router.navigate(['/security/role-access/edit', role.id]);
    });
  });
}
```

**Save Permissions:**
```typescript
onSavePermissions(): void {
  this.facade.syncRolePages(this.roleId!, assignments);

  // Effect shows feedback:
  effect(() => {
    const saving = this.facade.saving();
    const error = this.facade.saveError();
    if (!saving && !error) {
      this.notificationService.success('ROLE_ACCESS.PERMISSIONS_SAVED');
      this.navigateBack();
    }
  });
}
```

### 6.2 Delete Operations

**Delete Role (inline with confirmation):**
```typescript
onDelete(role: RoleDto): void {
  this.dialogService.confirm({
    title: 'ROLE_ACCESS.CONFIRM_DELETE',
    message: 'ROLE_ACCESS.CONFIRM_DELETE_MESSAGE',
    confirmText: 'COMMON.DELETE',
    cancelText: 'COMMON.CANCEL'
  }).then((confirmed) => {
    if (confirmed) {
      this.facade.deleteRole(role.id);
      // Success notification via facade effect
    }
  });
}
```

### 6.3 Error Handling

**Errors displayed using:**
- `ErpEmptyStateComponent` for page-level errors (list page)
- `ErpNotificationService.error()` for operation errors (toast)
- Backend error codes mapped via `ErpErrorMapperService`

---

## 7. Forbidden Patterns - Verification

✅ **COMPLIANT:** No forbidden patterns detected.

### 7.1 Page A (List) Does NOT Contain

❌ Form submission logic → ✅ COMPLIANT (no forms on list page)  
❌ Create/Edit forms → ✅ COMPLIANT (only search filters + grid)  
❌ Business logic → ✅ COMPLIANT (delegated to facade)  
❌ Direct API calls → ✅ COMPLIANT (all via facade)

### 7.2 Page B (Form) Does NOT Contain

❌ Tables with search logic → ✅ COMPLIANT (only permissions table, read-only view)  
❌ Silent save without feedback → ✅ COMPLIANT (always shows notification)  
❌ Hardcoded text → ✅ COMPLIANT (all text via translation keys)  
❌ Direct API calls → ✅ COMPLIANT (all via facade)

---

## 8. Permission-Based Visibility (RBAC)

✅ **COMPLIANT:** All actions gated by permissions.

| Action | Required Permission | Implementation |
|--------|---------------------|----------------|
| View roles list | `ROLE.VIEW` | Service method `@PreAuthorize` (backend) |
| Add role | `ROLE.CREATE` | `[erpPermission]="'ROLE.CREATE'"` on button |
| Create role | `ROLE.CREATE` | `[erpPermission]="'ROLE.CREATE'"` on button |
| Edit role permissions | `ROLE.UPDATE` | `erpPermission="ROLE.UPDATE"` on checkboxes/buttons |
| Save permissions | `ROLE.UPDATE` | `[erpPermission]="'ROLE.UPDATE'"` on save button |
| Copy permissions | `ROLE.UPDATE` | `[erpPermission]="'ROLE.UPDATE'"` on copy button |
| Add page | `ROLE.UPDATE` | `[erpPermission]="'ROLE.UPDATE'"` on add page button |
| Delete role | `ROLE.DELETE` | `[erpPermission]="'ROLE.DELETE'"` on delete action |

---

## 9. Blueprint Level 2 Checklist

### 9.1 Mandatory Structure

- [x] Page A: Search/List page exists (`role-access-control.component`)
- [x] Page B: Create/Edit page exists (`role-access-form.component`)
- [x] Separate routes for create and edit
- [x] Route parameters used for edit mode (`:id`)

### 9.2 Search/List Page (Page A)

- [x] Contains search & filter section (`SpecificationFilterComponent`)
- [x] Contains results table (ag-Grid)
- [x] Contains row-level actions (Edit/Delete via `RoleActionsCellComponent`)
- [x] Add action navigates to create page
- [x] Edit action navigates to edit page
- [x] Delete action performed inline with confirmation dialog
- [x] Empty result uses shared empty-state component
- [x] Does NOT contain form submission logic
- [x] Does NOT contain create/edit forms

### 9.3 Create/Edit Page (Page B)

- [x] Accessible only via routing (no modals)
- [x] Supports both modes via route parameters
- [x] Contains ONLY form-related UI
- [x] All fields use shared form components (`ErpFormFieldComponent`)
- [x] Fields grouped using shared section components (`ErpSectionComponent`)
- [x] Save action validates form
- [x] Save action shows success feedback
- [x] Cancel/Back navigates without side effects (`ErpBackButtonComponent`)
- [x] Does NOT contain tables with search logic (permissions table is read-only matrix)
- [x] Does NOT silent save without feedback

### 9.4 Shared Component Enforcement

- [x] Shared components used where available
- [x] No local alternatives to shared components
- [x] Validation uses shared resolver logic
- [x] Confirmation dialogs use shared dialog service

### 9.5 Localization

- [x] Supports at least two languages (EN, AR)
- [x] No hardcoded text in UI
- [x] All labels use translation keys
- [x] All messages use translation keys
- [x] All errors use translation keys
- [x] Validation messages are language-aware

### 9.6 Confirmation & Feedback

- [x] Save operations provide user feedback (success toast)
- [x] Delete operations require explicit confirmation
- [x] Error states visible and localized
- [x] No silent failures

---

## 10. File Structure

```
role-access/
├── components/
│   ├── role-access-control/          # Page A (Search/List)
│   │   ├── role-access-control.component.ts
│   │   ├── role-access-control.component.html
│   │   └── role-access-control.component.scss
│   └── role-actions-cell/            # Grid cell renderer
│       └── role-actions-cell.component.ts
├── facades/
│   └── role-access.facade.ts         # State + orchestration layer
├── models/
│   └── role-access.model.ts          # DTOs and interfaces
├── pages/
│   └── role-access-form/             # Page B (Create/Edit)
│       ├── role-access-form.component.ts
│       ├── role-access-form.component.html
│       └── role-access-form.component.scss
└── services/
    ├── role-access-api.service.ts    # HTTP/API layer
    └── role-access-api.service.spec.ts
```

---

## 11. Enforcement Summary

| Rule Category | Status | Details |
|---------------|--------|---------|
| Blueprint Level 2 Structure | ✅ PASS | Page A + Page B with routing |
| Shared Components | ✅ PASS | All required shared components used |
| Facade Boundary | ✅ PASS | Strict component → facade → service |
| Localization | ✅ PASS | Zero hardcoded text |
| User Feedback | ✅ PASS | All operations provide feedback |
| Forbidden Patterns | ✅ PASS | No violations detected |
| Permission Gating | ✅ PASS | All actions require permissions |

---

## 12. Compliance Statement

**Role Access Management module is FULLY COMPLIANT with Blueprint Level 2 requirements.**

This File Tuning document serves as the authoritative reference for:
- Architecture decisions
- Component responsibilities
- Shared component usage
- Localization strategy
- User feedback implementation
- Permission enforcement

Any future modifications to this module MUST maintain compliance with Blueprint Level 2 and update this document accordingly.

---

**Last Updated:** 2026-01-29  
**Reviewed By:** AI Senior QA Lead & Enterprise Angular Engineer  
**Status:** ✅ PRODUCTION READY
