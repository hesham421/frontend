---
name: create-queries
description: "Generates a feature's server-state layer with TanStack Query v5: query key factory, list/detail/usage reads, and mutations with invalidation and optimistic rollback. Step 2.3 — AFTER the api module, BEFORE components. Use whenever a feature reads or writes backend data, or when replacing useEffect fetching."
---

# Skill: create-queries

## Description
Generates the layer that owns everything the backend is the source of truth for. **Step 2.3.**
Implements AD-7. Rules: `references/contract-rules.md` §R.3.

## When to Use
- A feature needs to read or write backend data
- Removing `useEffect` + `useState` fetching

## When NOT to Use
- Before the api module exists
- UI state → `create-app-state`; form state → `create-forms`; list params → URL (R.5.8)

## Output

- `hooks/<ENTITY_CAMEL>Keys.ts`
- `hooks/use<ENTITY_NAME>Queries.ts`
- `hooks/use<ENTITY_NAME>Mutations.ts`

## Constraints

- MUST NOT copy server data into `useState` or React Context (R.3.12, R.7.1)
- MUST NOT put toasts, dialogs, or navigation in a hook (R.3.11)
- MUST NOT build keys inline (R.3.3)
- MUST NOT hold pagination outside the key (R.3.4)
- MUST NOT omit `staleTime` / `gcTime` (R.3.5)

---

## Step 0 — QueryClient defaults (once, `app/queryClient.ts`)

```ts
export const queryClient = new QueryClient({          // R.3.16 — one instance, module scope
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const kind = normalizeError(error).kind;
        return (kind === 'network' || kind === 'server') && failureCount < 2;   // R.3.13
      },
      retryDelay: (i) => Math.min(1000 * 2 ** i, 8000),
      refetchOnWindowFocus: false,      // ERP data is not a live feed; focus refetch is noise
      refetchOnReconnect: true,
    },
    mutations: { retry: false },
  },
});
```

Retry policy is declared once. A 403 or a validation failure is never retried — the outcome
cannot change and the retry doubles the audit noise.

## Step 1 — Key factory (R.3.3)

```ts
export const branchKeys = {
  all:      ['branches'] as const,
  lists:    () => [...branchKeys.all, 'list'] as const,
  list:     (req: SearchRequest) => [...branchKeys.lists(), req] as const,   // R.3.4
  details:  () => [...branchKeys.all, 'detail'] as const,
  detail:   (id: number) => [...branchKeys.details(), id] as const,
  usage:    (id: number) => [...branchKeys.all, 'usage', id] as const,
  children: (parentId: number) => [...branchKeys.all, 'children', parentId] as const,
};
```

Hierarchical keys make invalidation precise: `lists()` refreshes every page and filter
combination without touching cached detail records.

The whole `SearchRequest` is in the list key. There is no `useState(page)` anywhere —
changing a parameter changes the key, and that is the only mechanism. This is why page and
filter can never desynchronise.

## Step 2 — Reads

```ts
const LIST_STALE = 30_000, DETAIL_STALE = 60_000, GC = 5 * 60_000;

export function useBranchList(req: SearchRequest) {
  return useQuery({
    queryKey: branchKeys.list(req),
    queryFn: ({ signal }) => branchApi.search(req, signal),     // R.2.9
    placeholderData: keepPreviousData,                          // R.3.15
    staleTime: LIST_STALE, gcTime: GC,                          // R.3.5
  });
}

export function useBranch(id: number | undefined) {
  return useQuery({
    queryKey: branchKeys.detail(id!),
    queryFn: ({ signal }) => branchApi.getById(id!, signal),
    enabled: id != null,
    staleTime: DETAIL_STALE, gcTime: GC,
  });
}

/** Gates destructive actions, so it is never served stale — R.3.9 */
export function useBranchUsage(id: number | undefined) {
  return useQuery({
    queryKey: branchKeys.usage(id!),
    queryFn: ({ signal }) => branchApi.getUsage(id!, signal),
    enabled: id != null,
    staleTime: 0, gcTime: GC,
  });
}
```

Independent data means independent hooks called side by side; React runs them in parallel.
Chaining query B behind query A it does not depend on is a waterfall (R.3.7) — the same
failure `react-best-practices` names `async-parallel` — and doubles perceived load time. Where
two reads are genuinely independent but one is cheap and one is expensive, start both and let
`Promise.all`-style parallelism (here, two sibling `useQuery` calls) do the waiting; only
chain the ones with a real data dependency.

`staleTime` is a product decision, so it is stated per query rather than inherited: a
reference list tolerates minutes, a list the user is actively editing tolerates seconds, and
gating data tolerates nothing.

## Step 3 — Mutations

```ts
export function useBranchMutations() {
  const qc = useQueryClient();
  const invalidateLists = () => qc.invalidateQueries({ queryKey: branchKeys.lists() });   // R.3.6

  const create = useMutation({
    mutationFn: branchApi.create,
    onSuccess: (dto) => { qc.setQueryData(branchKeys.detail(dto.id), dto); void invalidateLists(); },
  });

  const update = useMutation({
    mutationFn: ({ id, req }: { id: number; req: UpdateBranchRequest }) => branchApi.update(id, req),
    onSuccess: (dto) => { qc.setQueryData(branchKeys.detail(dto.id), dto); void invalidateLists(); },
  });

  const activate = useMutation({
    mutationFn: branchApi.activate,
    onSuccess: (dto) => {
      qc.setQueryData(branchKeys.detail(dto.id), dto);
      void invalidateLists();
      void qc.invalidateQueries({ queryKey: branchKeys.usage(dto.id) });
    },
  });

  const deactivate = useMutation({ /* mirror of activate */ });

  const remove = useMutation({
    mutationFn: branchApi.remove,
    onSuccess: (_v, id) => { qc.removeQueries({ queryKey: branchKeys.detail(id) }); void invalidateLists(); },
  });

  return { create, update, activate, deactivate, remove };
}
```

**No toasts, no navigation, no dialogs here** (R.3.11). The caller owns the reaction:

```ts
create.mutate(req, { onSuccess: (dto) => { toast.success(t('common.created')); navigate(...); } });
```

A toast inside the hook fires once per mounted consumer, cannot be varied by call site, and
makes the hook untestable without a toast provider.

## Step 4 — Optimistic updates (R.3.14)

Reserved for high-frequency, low-risk toggles. Four parts, all mandatory:

```ts
const toggleFavourite = useMutation({
  mutationFn: branchApi.toggleFavourite,
  onMutate: async (id) => {
    await qc.cancelQueries({ queryKey: branchKeys.lists() });        // 1 stop in-flight refetches
    const snapshot = qc.getQueriesData({ queryKey: branchKeys.lists() });  // 2 snapshot
    qc.setQueriesData({ queryKey: branchKeys.lists() }, patch(id));
    return { snapshot };
  },
  onError: (_e, _v, ctx) => { ctx?.snapshot.forEach(([k, d]) => qc.setQueryData(k, d)); },  // 3 rollback
  onSettled: () => { void invalidateLists(); },                       // 4 reconcile
});
```

An optimistic update without rollback leaves the UI asserting something the server rejected.
If any of the four parts is missing, do not use optimism — the pending state is honest.

## Step 5 — Child collections (R.3.8, R.3.9)

Patch rather than refetch, so the table does not flicker or scroll to top:

```ts
onSuccess: (child) => {
  qc.setQueryData<ChildDto[]>(branchKeys.children(parentId), (old = []) => [...old, child]);
  void qc.invalidateQueries({ queryKey: branchKeys.usage(parentId) });   // canDelete just changed
}
```

Update → `old.map(...)`. Delete → `old.filter(...)`. Every child create and delete
invalidates parent usage; skipping it is how a delete button stays enabled on a record that
just acquired children.

## Verify before finishing

- [ ] Zero `useEffect` fetching in the feature
- [ ] Every key from the factory; full `SearchRequest` in the list key
- [ ] `staleTime` and `gcTime` explicit on every query
- [ ] Reads forward `signal`; optional-param queries use `enabled`
- [ ] Invalidation targets factory keys
- [ ] No toast, navigation, or dialog inside a hook
- [ ] Optimistic mutations have all four parts
- [ ] Child mutations patch the cache and invalidate usage
- [ ] No server data mirrored into `useState` or React Context
- [ ] Retry policy lives in QueryClient defaults, not per hook

## Violations requiring immediate rejection

| Pattern | Rule |
|---|---|
| `useEffect(() => { fetch(...) }, [])` | R.3.1 |
| `await api.create()` in a handler | R.3.2 |
| Inline `queryKey: ['branches', page]` | R.3.3 |
| `useState(page)` beside a list query | R.3.4 |
| Query with no `staleTime` | R.3.5 |
| `invalidateQueries()` with no key | R.3.6 |
| Waterfall between independent queries | R.3.7 |
| Full refetch after one child mutation | R.3.8 |
| Usage not invalidated after a child mutation | R.3.9 |
| Toast or navigation in a hook | R.3.11 |
| `useState(loading)` beside a query | R.3.12 |
| Optimistic update with no rollback | R.3.14 |
| `new QueryClient()` in a component body | R.3.16 |

## Alignment with general React guidance

**Consistent with:** `useSuspenseQuery` behind an error boundary, `useQueries` for fan-out,
`prefetchQuery` on row hover, `useInfiniteQuery` for feeds, `useOptimistic` alongside a
mutation, `useDeferredValue` for filter inputs, and `vercel-labs/agent-skills`'
`react-best-practices` waterfall category (`async-parallel`, R.3.7 above) — TanStack Query's
own request deduplication also supersedes that skill's `client-swr-dedup` rule, which targets
SWR specifically; Query is this project's single client-cache layer (S.5.1–S.5.4 in
`enforce-state-management`).

**Deliberately different:** global-default `staleTime` is rejected in favour of per-query
declaration, because freshness is a product decision per dataset. `refetchOnWindowFocus` is
off: for transactional ERP screens it produces surprise refetches mid-edit rather than
useful freshness.
