# Zero-Mock Data Policy

## Mandatory Rules for All Code & Features

1. **Direct API Integration Only**:
   - All components, pages, tables, drawers, forms, and dialogs must fetch and persist data directly using the real backend REST API (`/api/...`).
   - Mock/dummy data sets, in-memory fake mutations, placeholder arrays, and simulated timeouts are strictly prohibited in production features.

2. **Full CRUD & Relationship Persistence**:
   - Every user action (create, edit, delete, activate, deactivate, role/permission assignment, data scope updates) must trigger a TanStack Query mutation calling the real API.
   - All drawers and modals must have an explicit **Save** (`حفظ`) action in their footer with active loading indicators, error banners, and success toasts.
   - Closing or canceling a drawer must not simulate a save.

3. **TanStack Query Invalidation**:
   - Every mutation must invalidate the corresponding TanStack Query cache keys on success to guarantee that UI lists and details reflect the latest server state immediately.
