---
name: create-components
description: "Generates a feature's UI: column factory, row actions cell, List page composing useErpList and DataTable, and Entry page orchestrating the form. Steps 2.5–2.6 — AFTER models, api, hooks, and forms. Use when building or reviewing feature pages, tables, and their loading, empty, and error states."
---

# Skill: create-components

## Description
Generates the feature's pages and presentational parts. **Steps 2.5–2.6.**
Rules: `references/contract-rules.md` §R.4, §DS, §PERF.

## When to Use
- Building a list or entry screen
- Reviewing feature UI

## When NOT to Use
- Form fields and submission → `create-forms`
- Routing and guards → `create-routing`
- `components/ui` internals — hand-curated, though the same DS rules apply

## Output

```
columns/<ENTITY_CAMEL>Columns.tsx
components/<ENTITY_NAME>ActionsCell.tsx
pages/<ENTITY_NAME>ListPage.tsx
pages/<ENTITY_NAME>EntryPage.tsx
```

## Constraints

- MUST NOT fetch in `components/` (R.4.1)
- MUST NOT define columns inline (R.4.3)
- MUST NOT rebuild table, pager, toast, empty state, or modal shell (SH)
- MUST NOT emit literal user-facing strings (DS.5)
- MUST NOT use physical direction utilities (DS.7)
- MUST NOT add manual memo without a cited reason (R.4.2)

---

## Part 1 — Column factory (R.4.3)

A factory, not a constant: columns depend on the translation function and the row handlers,
and must rebuild when the language changes.

```tsx
interface ColumnDeps {
  t: TFn;
  onEdit: (row: BranchDto) => void;
  onToggleActive: (row: BranchDto) => void;
  onDelete: (row: BranchDto) => void;
}

export function buildBranchColumns({ t, ...handlers }: ColumnDeps): ColumnDef<BranchDto>[] {
  return [
    { accessorKey: 'code',   header: t('branch.code'), meta: { align: 'start' } },
    { accessorKey: 'nameEn', header: t('branch.nameEn') },
    { accessorKey: 'childCount', header: t('branch.children'),
      meta: { align: 'end', className: 'tabular-nums' } },          // DS.10
    { accessorKey: 'isActive', header: t('common.status'),
      cell: ({ getValue }) => <StatusBadge active={getValue<boolean>()} /> },
    { id: 'actions', header: '', enableSorting: false,
      cell: ({ row }) => <BranchActionsCell row={row.original} {...handlers} /> },   // R.4.5
  ];
}
```

## Part 2 — Actions cell (R.4.5, P.2, P.7)

Presentational: row plus callbacks. Each control is wrapped in `<Can>` so it is **hidden**
when unauthorized, and `disabled` with a reason when the data forbids it.

```tsx
export function BranchActionsCell({ row, onEdit, onToggleActive, onDelete }: Props) {
  const t = useLanguage();
  return (
    <div className="flex items-center gap-1">
      <Can permission={perm(BRANCH_PAGE, 'UPDATE')}>
        <Button variant="ghost" size="xs" aria-label={t('common.edit')} onClick={() => onEdit(row)}>
          <Pencil className="size-4" />
        </Button>
      </Can>
      <Can permission={perm(BRANCH_PAGE, 'UPDATE')}>
        <Button variant="ghost" size="xs"
                aria-label={t(row.isActive ? 'common.deactivate' : 'common.activate')}
                onClick={() => onToggleActive(row)}>
          {row.isActive ? <ToggleRight className="size-4" /> : <ToggleLeft className="size-4" />}
        </Button>
      </Can>
      <Can permission={perm(BRANCH_PAGE, 'DELETE')}>
        <Button variant="ghost" size="xs" aria-label={t('common.delete')} onClick={() => onDelete(row)}>
          <Trash2 className="size-4" />
        </Button>
      </Can>
    </div>
  );
}
```

Hidden versus disabled (DS.15, P.7): **unauthorized → hidden**, because offering an action
the user can never perform is noise. **Unavailable for data reasons → disabled with a
tooltip naming the reason**, because that state is temporary and the user can act on it.

## Part 2.5 — Variants without boolean props (R.4.14, R.4.15)

A shared component under revision gathers a boolean per requirement until its behaviour is
unreadable from the call site. This is the failure `vercel-labs/agent-skills`'
`composition-patterns` skill names `architecture-avoid-boolean-props`: each boolean doubles
the number of possible states, and the component ends up rendering combinations no one
intended.

```tsx
// Rejected — booleans compound: 8 states, most never tested
<DataTable compact readOnly hideActionsColumn stripedRows … />
```

Prefer a typed variant union, or — when the parts genuinely share state, such as a table and
its own toolbar and pagination footer — a compound component with an internal context
(`architecture-compound-components`), the same shape `ErpTabs`, `Stepper`, and `Shutter`
already use:

```tsx
<DataTable.Root data={data} columns={columns} density="compact">
  <DataTable.Toolbar />
  <DataTable.Body />
  <DataTable.Pagination />
</DataTable.Root>
```

The provider (`DataTable.Root`) is the only place that knows how row selection and sort
state are held; `Toolbar`, `Body`, and `Pagination` read a context interface and stay
ignorant of the implementation (`state-decouple-implementation`). This is why swapping
client-side sort for server-side sort later touches one file, not every consumer.

This does not apply to `columns/<entity>Columns.tsx` or `<Entity>ActionsCell` themselves —
those stay plain data-in, callbacks-out components (R.4.1, R.4.5). It applies when a shared
`components/ui` primitive, or a feature component composed from several of them, is tempted
to grow another boolean instead of exposing its parts.

## Part 3 — List page

```tsx
export default function BranchListPage() {
  const t = useLanguage();
  const navigate = useNavigate();
  const { can } = usePermission();

  // page, size, sort, filters live in the URL — R.5.8
  const { searchRequest, setSearchRequest } = useErpList({
    defaultSort: [{ field: 'code', direction: 'ASC' }],
    defaultSize: 20,
  });

  const { data, isPending, isError, error, refetch } = useBranchList(searchRequest);
  const mutations = useBranchMutations();
  const actions = useBranchConfirmActions({ mutations });

  const columns = useMemo(
    () => buildBranchColumns({
      t,
      onEdit: (row) => navigate(`${row.id}/edit`),
      onToggleActive: actions.confirmToggleActive,
      onDelete: actions.confirmDelete,
    }),
    // memo justified: TanStack Table treats a new column array as a full reset,
    // discarding sizing and visibility state on every unrelated render.
    [t, navigate, actions],
  );

  return (
    <>
      <Breadcrumbs items={[{ label: t('nav.organization') }, { label: t('branch.title') }]} />
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{t('branch.title')}</h1>
        <Can permission={perm(BRANCH_PAGE, 'CREATE')}>
          <Button leftIcon={<Plus className="size-4" />} onClick={() => navigate('new')}>
            {t('common.create')}
          </Button>
        </Can>
      </div>

      <BranchFilters value={searchRequest.filters} onChange={(filters) => setSearchRequest({ filters, page: 0 })} />

      {isPending && <SkeletonLoader type="table" count={8} />}

      {isError && (
        <ErrorState kind={normalizeError(error).kind}
                    correlationId={normalizeError(error).correlationId}
                    onRetry={refetch} />
      )}

      {data && data.content.length === 0 && (
        hasActiveFilters(searchRequest)
          ? <EmptyState title={t('branch.noMatches')} description={t('common.tryClearingFilters')}
                        action={<Button variant="secondary" onClick={clearFilters}>{t('common.clearFilters')}</Button>} />
          : <EmptyState title={t('branch.emptyTitle')} description={t('branch.emptyHint')} />
      )}

      {data && data.content.length > 0 && (
        <DataTable data={data.content} columns={columns}
                   pageCount={data.totalPages} state={searchRequest} onStateChange={setSearchRequest} />
      )}
    </>
  );
}
```

Four states, not two (R.4.8). "No records exist" and "no records match your filters" are
different situations with different remedies, and collapsing them leaves the user staring at
an empty table wondering whether the data or the filter is wrong.

The page holds no server state, no loading flag, and no page number. Filter changes reset
`page` to 0 — otherwise the user lands on page 5 of a 2-page result and sees nothing.

## Part 4 — Entry page

The page orchestrates; `create-forms` owns the fields and submission.

```tsx
export default function BranchEntryPage() {
  const { branchId } = useParams();                        // R.5.6
  const id = branchId ? Number(branchId) : undefined;
  const mode = id ? 'edit' : 'create';

  const t = useLanguage(); const navigate = useNavigate(); const toast = useToast();
  const { data: branch, isPending, isError, error } = useBranch(id);
  const { create, update } = useBranchMutations();

  const form = useForm<BranchFormValues>({ /* see create-forms */ });

  const onValid = (values: BranchFormValues) => {
    if (mode === 'edit') {
      update.mutate({ id: id!, req: BranchFormMapper.toUpdateRequest(values) }, {
        onSuccess: (dto) => { form.reset(BranchFormMapper.fromDto(dto)); toast.success(t('common.saved')); },
        onError: (e) => applyServerErrors(form, e),
      });
      return;
    }
    create.mutate(BranchFormMapper.toCreateRequest(values), {
      onSuccess: (dto) => {
        form.reset(BranchFormMapper.fromDto(dto));
        toast.success(t('common.created'));
        navigate(`../${dto.id}/edit`, { replace: true });   // R.4.7
      },
      onError: (e) => applyServerErrors(form, e),
    });
  };

  if (mode === 'edit' && isPending) return <SkeletonLoader type="form" />;
  if (mode === 'edit' && isError) return <ErrorState kind={normalizeError(error).kind} />;

  return (
    <form onSubmit={form.handleSubmit(onValid)} noValidate className="space-y-6">
      <BranchForm form={form} mode={mode} />
      <FormActions
        onCancel={() => navigate('..')}
        savePermission={perm(BRANCH_PAGE, mode === 'edit' ? 'UPDATE' : 'CREATE')}
        isSubmitting={create.isPending || update.isPending}
      />
    </form>
  );
}
```

`replace: true` after create (R.4.7) turns the create URL into the edit URL without a new
history entry, so Back returns to the list rather than to a form that would create a
duplicate. There is no `isEditMode` state: mode derives from the route param, and the route
`key` (R.4.10, set in `create-routing`) resets the component when the record changes.

## Verify before finishing

- [ ] No fetching in `components/`; no server data in `useState`
- [ ] Columns in a factory; actions cell separate
- [ ] Four list states: pending, empty, filtered-empty, error
- [ ] Filter change resets page to 0
- [ ] Create success navigates with `replace`
- [ ] Every string a translation key; every icon button labelled
- [ ] Unauthorized controls hidden; data-blocked controls disabled with a reason
- [ ] Logical direction utilities; `cx()` for classes; numeric columns `tabular-nums`
- [ ] Manual memo carries a justification comment
- [ ] A component acquiring its third or fourth boolean prop is reconsidered as a variant union or a compound component

## Violations requiring immediate rejection

| Pattern | Rule |
|---|---|
| Presentational component calling a query hook | R.4.1 |
| Manual memo with no justification | R.4.2, PERF.5 |
| Inline `ColumnDef[]` | R.4.3 |
| Hand-rolled pagination | R.4.4, SH.9 |
| Actions inlined in a `cell` renderer | R.4.5 |
| Entry page containing field markup instead of `<Entity>Form` | R.4.6 |
| `navigate()` without `replace` after create | R.4.7 |
| Missing empty, filtered-empty, or error branch | R.4.8 |
| Modal hidden rather than unmounted | R.4.9 |
| Raw `error.message` rendered | R.4.11, R.10.3 |
| `dangerouslySetInnerHTML` without sanitising | R.4.13, SEC.2 |
| Literal user-facing string | DS.5 |
| `ml-`, `pr-`, `text-left` | DS.7 |
| Arbitrary hex in a class | DS.3 |
| Icon-only button with no `aria-label` | DS.12 |
| A shared component accumulating independent boolean props | R.4.14 |
| Multi-part UI with implicit shared state, no compound structure | R.4.15 |

## Alignment with general React guidance

**Consistent with `vercel-labs/agent-skills`:** `composition-patterns`'
`architecture-avoid-boolean-props` and `architecture-compound-components` (Part 2.5, R.4.14,
R.4.15), `react-best-practices`' `bundle-dynamic-imports` (heavy widgets — `create-routing`
lazy-loads the page, this skill dynamic-imports anything heavier inside it, e.g. a chart or a
rich-text field), `rendering-hoist-jsx` (static JSX, such as a fixed set of table icons,
hoisted outside the column factory's closure), and `rendering-conditional-render` (ternary
over `&&` so a falsy `0` or `''` never renders). Accessibility guidance wins outright over any
of these — `erp-priority-override` O.1.

**Deliberately different:** "colocate columns with the table" is rejected because the factory
must take the translation function and handlers, which forces it out of module scope anyway.
"Memoize aggressively" is rejected: on React 18 every memo is a dependency array that can go
stale, and unexplained memo hides the few places where identity genuinely matters (AD-14).
`architecture-avoid-boolean-props` is applied to shared and compound components, not to the
column factory or actions cell, which are intentionally plain props-in components (R.4.1).
