---
name: zero-mock-api-policy
description: >-
  Enforces a strict zero-mock-data policy across all frontend features, screens, forms, tables, and drawers. Mandates that every read and write operation connects directly to the real backend REST API via TanStack Query and the central HTTP client. Prohibits dummy in-memory arrays, fake state mutations, and disconnected demo buttons.
---

# Zero-Mock Data & Direct API Integration Policy

This skill establishes the non-negotiable architectural requirement: **Every screen, drawer, modal, form, filter, table, and user action across all modules must be connected directly to the real backend REST API.** No dummy/demo data or simulated local-only persistence is permitted.

---

## 1. Core Principles & Strict Prohibitions

1. **Zero Mock/Demo Data in Production Features**:
   - ❌ **NEVER** import or initialize UI state with dummy objects or arrays from `mockData.ts` or local fake lists.
   - ❌ **NEVER** simulate creation, updating, or deletion with local React `useState` / in-memory store mutations without an actual HTTP request.
   - ❌ **NEVER** build "demo-only" buttons, placeholder callbacks (`// TODO: integrate with API`), or non-functional actions that only close dialogs without making network calls.
   - ✅ **ALWAYS** connect every action to a live backend endpoint (`/api/...`) via `http` client (`src/lib/http/client.ts`).

2. **Direct Server-Side Authority**:
   - The backend database is the single source of truth for all domain entities.
   - Any state change triggered by the user (create, update, delete, activate, deactivate, assign, sync) must be dispatched via a TanStack Query mutation to the corresponding REST endpoint.

3. **Explicit Action & Persistence in Drawers/Modals**:
   - Drawers and dialogs that configure entity relationships (e.g. Permission Matrix, Role Assignment, Data Scope, Branch Assignment) must have an **explicit "Save" (`حفظ` / `Save Changes`)** primary button in their footer.
   - Clicking "Save" must execute the API mutation, display a loading indicator, show a success toast on completion, and display mapped backend error messages if the operation fails.
   - A "Close" or "Cancel" button must only dismiss the drawer without claiming or pretending data was saved.

---

## 2. Direct API Integration Workflow

Every feature under `src/modules/<module>/features/<feature>/` must follow the 4-layer integration pipeline:

```
┌────────────────────────────────────────────────────────┐
│ 1. API Client Layer (<feature>Api.ts)                  │
│    • Typed request & response DTOs                    │
│    • Calls http.get / http.post / http.put / http.del  │
└─────────────────────────┬──────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────┐
│ 2. TanStack Query Layer (hooks.ts)                     │
│    • Deterministic query keys factory                  │
│    • useQuery for reads (caching, gc, refetch)         │
│    • useMutation for writes + invalidateQueries        │
└─────────────────────────┬──────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────┐
│ 3. Feature Facade Hook (use<Feature>Facade)            │
│    • Aggregates queries, mutations, permissions        │
│    • Exposes clean actions: create, update, save, sync │
└─────────────────────────┬──────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────┐
│ 4. UI Layer (Pages, Drawers, Modals, Tables)           │
│    • Connects directly to facade actions               │
│    • Real loading states, error alerts, toasts         │
└────────────────────────────────────────────────────────┘
```

---

## 3. Implementation Standards by Use Case

### A. List, Filter & Pagination Reads
- All data grids and tables must fetch their rows using the real backend search contract endpoint (`POST /api/<entity>/search` or `GET /api/<entity>`).
- Pagination, sorting, and filter predicates must be sent to the server.
- Bind `Table` component's `isLoading={isListLoading}`, `loadError={loadError}`, `rows={data?.content ?? []}`, and `totalElements={data?.totalElements}` directly to the query result.

### B. Entity CRUD Forms
- Form submissions must trigger `createMutation.mutateAsync(dto)` or `updateMutation.mutateAsync({ id, req })`.
- On success:
  1. Invalidate related query keys (e.g., `roleKeys.lists()`, `roleKeys.detail(id)`).
  2. Display a localized success toast notification (`showToast(t('roleSavedSuccess'), 'success')`).
  3. Close the modal/drawer.
- On error:
  1. Catch the `ApiError`.
  2. Map using `mapApiError(err, t)`.
  3. Render an inline `<Alert variant="danger" message={errorMessage} />` inside the form.

### C. Relationship & Matrix Drawers (Permissions, Roles, Data Scopes)
- **Drafting vs. Committing**:
  - Local state in the drawer may hold transient user edits (e.g. checkbox selections in `matrixDraft`).
  - Committing must call the bulk/sync endpoint (e.g., `rolesApi.syncPages(roleId, { assignments })` or `usersApi.assignRoles(userId, { roleNames })`).
- **Footer Buttons**:
  - `Cancel` / `Close`: Reverts/discards local draft without calling the API.
  - `Save Changes`: Primary button with `loading={isSaving}` that dispatches the API mutation and persists data to the server.

### D. Single-Action Toggles (Activate, Deactivate, Status Change)
- Status toggles and deactivation flows must call their respective dedicated endpoints (e.g. `PUT /api/<entity>/{id}/activate` and `PUT /api/<entity>/{id}/deactivate`).
- Never perform optimistic local state overrides without a backing API call.

---

## 4. Anti-Patterns & Verification Checklist

| ❌ Forbidden Anti-Pattern | ✅ Required Solution |
| :--- | :--- |
| `const [items, setItems] = useState(mockItems)` | Use `useQuery` / `useMutation` calling real backend API. |
| Drawer footer only has "Close", pretending changes are saved | Add primary "Save" button connected to the sync API mutation. |
| `setTimeout(() => resolve(), 500)` faking network call | Call real `apiClient` / `http` method. |
| Checkboxes or toggles without `onChange` API/draft handler | Wire `onChange` to live draft state and commit via API mutation. |
| Silently catching API errors (`catch (e) {}`) | Catch `ApiError`, map with `mapApiError(e, t)`, and display alert. |
| Unsaved local draft deleted on row click | Local removal or atomic API call + immediate query cache invalidation. |

---

## 5. Feature Audit Checklist

Before declaring any feature complete:
1. **Network Tab Verification**: Open DevTools Network tab and verify that every CRUD action and list filter produces actual HTTP requests with `200/201/204` responses.
2. **Persistence Check**: Refresh the page after creating, updating, or assigning records to verify data was persisted in the backend database.
3. **Error Feedback**: Verify that if the server returns `400 Bad Request`, `403 Forbidden`, or `409 Conflict`, the error message is displayed to the user via toast or alert.
