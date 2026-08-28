<!-- Source: PHASE:F2 / SUB:F2-SCR-SEC-005 -->
<!-- Context: see F2-HEADER.md for phase-level strategy, registry table, and intro -->


### F2 — SCR-SEC-005 — Page Registry

```
Shell status: CONFIRMED. Entity: ENTITY-SEC-004 (Page, sole subject).
```

### F2-QUERY — API-SEC-030 — Get page by ID
```
HTTP method    : GET
Endpoint path  : /api/pages/{id}
Response shape : PageResponse
Hook type      : useQuery
Query key      : ['pages', id]
Errors         : 401 -> login; 403 -> unauthorized (PAGE_VIEW required)
Loading        : LOCAL
Caching        : defaults
USAGE NOTE: this screen's own list comes from API-SEC-035 (search);
this by-id GET is used for cross-screen page-options reads (SCR-SEC-
003's permission matrix, SCR-SEC-004's "associated screen" picker) when
a single page needs re-confirming outside a list.
```

### F2-QUERY — API-SEC-031 — Update page
```
HTTP method    : PUT
Endpoint path  : /api/pages/{id}
Request shape  : UpdatePageRequest { nameAr, nameEn, route (all
                 required), icon?, module?, parentId?, displayOrder?,
                 description? } — pageCode is NOT in this shape
                 (immutable after creation)
Response shape : PageResponse
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (PAGE_UPDATE required)
Invalidation   : ['pages']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-032 — Reactivate page
```
HTTP method    : PUT
Endpoint path  : /api/pages/{id}/reactivate
Response shape : PageResponse
Hook type      : useMutation
Errors         : 401 -> login; 403 -> unauthorized (PAGE_UPDATE
                 required)
Invalidation   : ['pages']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-033 — Deactivate page
```
HTTP method    : PUT
Endpoint path  : /api/pages/{id}/deactivate
Response shape : PageResponse — soft delete, sets active=false
Hook type      : useMutation
Errors         : 401 -> login; 403 -> unauthorized (PAGE_DELETE
                 required — NOTE: deactivate requires PAGE_DELETE, not
                 PAGE_UPDATE; confirmed from the doc, not obvious from
                 the action's name — flagged for SEC-FE's permission-
                 gating block so the deactivate button is gated on the
                 right PERM_*)
Invalidation   : ['pages']
Loading        : LOCAL
```

### F2-QUERY — API-SEC-034 — Create new page
```
HTTP method    : POST
Endpoint path  : /api/pages
Request shape  : CreatePageRequest { pageCode (required, normalized
                 uppercase), nameAr, nameEn, route (all required),
                 icon?, module?, parentId?, displayOrder?, active?,
                 description?, suppressPermissionTypes?: string[] }
Response shape : PageResponse
Hook type      : useMutation
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (PAGE_CREATE required)
Invalidation   : ['pages']
Loading        : LOCAL
GOVERNANCE NOTE: creating a page auto-generates 4 CRUD permission
records (RULE-SEC-047, confirmed by this endpoint's own description).
`suppressPermissionTypes` lets the caller skip generating specific
types (e.g. no DELETE permission for a page with no delete action) —
VIEW cannot be suppressed. shell-manifest does not document this field
on PagesRegistryPage's create/edit drawer; this plan surfaces it as an
available-but-currently-unused field, consistent with the "confirm,
don't redesign" mandate — F3/F4 may add it to the form only if product
asks, not required by this plan.
```

### F2-QUERY — API-SEC-035 — Search pages
```
HTTP method    : POST
Endpoint path  : /api/pages/search
Request shape  : PageSearchContractRequest { filters[] (allowed:
                 pageCode, nameAr, nameEn, module, active), sorts[]
                 (allowed: id, pageCode, nameAr, nameEn, module,
                 displayOrder, createdAt, updatedAt), page, size }
Response shape : paginated list of PageResponse
Hook type      : useMutation (POST-as-query pattern)
Errors         : 400 INVALID_JSON -> inline; 401 -> login; 403 ->
                 unauthorized (PAGE_VIEW required)
Loading        : LOCAL
Caching        : n/a (mutation pattern)
CONFIRMED, NO CORRECTION: unlike API-SEC-026 (roles search), `active`
IS an allowed filter field here — SCR-SEC-005's status filter maps to
a real server-side filter, not a client-side approximation.
```

### F2-QUERY — API-SEC-036 — Get active pages
```
HTTP method    : GET
Endpoint path  : /api/pages/active
Response shape : array of PageResponse (no pagination envelope — flat
                 array, per its own documented shape)
Hook type      : useQuery
Query key      : ['pages', 'active']
Errors         : 401 -> login; 403 -> unauthorized (PAGE_VIEW required)
Loading        : LOCAL
Caching        : staleTime 10 minutes — DRV-ID: this is reference data
                 explicitly described as "used in Role Access Control
                 'Add Page' dropdown" — stable-list caching is
                 justified by the endpoint's own stated purpose, per
                 the caching-deviation rule (SRS-implied stable
                 reference data)
USAGE NOTE: this is the real source for SCR-SEC-003's "add page" picker
in the permission matrix — not a generic pages list, and not paginated.
```

### F2-SCREEN-INIT — SCR-SEC-005 — Page Registry
```
On mount:
  1. Permission hook for SCR-SEC-005 -> canView, canCreate, canEdit
     (canDelete: n/a — deactivate/reactivate stand in for delete, per
     the entity's own operations set; gated on PAGE_DELETE for
     deactivate specifically, see API-SEC-033 note)
  2. No formal LOV hooks
  3. Composite Screen (CORE-9) — entry DRAWER opens from a row/create
     action (drawer, not dialog — confirmed shell-manifest terminology)
Search screen state: searchFilters (incl. currentPage/pageSize, module,
  active) drives API-SEC-035 — all real server-side filters.
```

### F2-FACADE-HOOK — SCR-SEC-005 — Page Registry
```
Facade Hook name : usePageRegistryFacade()
Composes         : useSearchPages (API-SEC-035), useCreatePage
                   (API-SEC-034), useUpdatePage (API-SEC-031),
                   useDeactivatePage (API-SEC-033), useReactivatePage
                   (API-SEC-032), useActivePages (API-SEC-036, for
                   cross-screen page pickers)

STATE OWNED: pageList (from useSearchPages), selectedPage (local
  useState), isLoading (derived), searchFilters (currentPage/pageSize/
  module/active inside), kpiCounts (DERIVED client-side — same
  no-summary-endpoint gap as SCR-SEC-002/003)

OPERATIONS EXPOSED: createPage(data), updatePage(id, data),
  deactivatePage(id) -> no separate pre-check call (direct mutation,
  409/422 -> toast if the backend rejects it), reactivatePage(id),
  selectPage(page), setSearchFilters(filters)

BOUNDARIES: components call this Facade only; composes the F2-QUERY
  hooks above only.
```

