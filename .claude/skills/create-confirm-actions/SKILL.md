---
name: create-confirm-actions
description: "Generates permission-checked and usage-checked confirm handlers for destructive and state-changing row actions, ordering the checks before the dialog. Step 2.8. Use for any delete, activate, or deactivate action, and to fix dialogs that appear before a permission or eligibility check."
---

# Skill: create-confirm-actions

## Description
Generates `helpers/<entity>ConfirmActions.ts`. **Step 2.8.**
Rules: `references/contract-rules.md` §R.6, §P.3.

## When to Use
- A row action needs confirmation
- Auditing check ordering
- Extracting a grown inline handler

## When NOT to Use
- Non-destructive navigation
- Form submission → `create-forms`
- Backend validation — the server re-checks everything regardless (AD-6)

---

## The ordering rule

```
1. Permission        fail → toast "no permission", stop. No dialog.        R.6.3
2. Eligibility       fail → toast the blocking reason, stop. No dialog.    R.6.4
3. Dialog            cancel → stop.
4. Mutation          outcome toast at the call site.                       R.3.11
```

Any other order produces one of two defects: the user confirms a delete and *then* learns
they lack permission, or confirms and *then* receives a 409 because the record has children.
Both are knowable before the dialog opens, and both make the product feel unreliable in a
way a backend error cannot fix.

## Template

```ts
export function useBranchConfirmActions({ mutations }: { mutations: BranchMutations }) {
  const t = useLanguage();
  const { can } = usePermission();
  const confirm = useConfirmDialog();
  const toast = useToast();
  const qc = useQueryClient();

  // reuses the cache when fresh, fetches when not — usage is staleTime: 0 (R.3.9)
  const fetchUsage = (id: number) =>
    qc.fetchQuery({ queryKey: branchKeys.usage(id), queryFn: ({ signal }) => branchApi.getUsage(id, signal) });

  async function confirmToggleActive(row: BranchDto) {
    if (!can(perm(RESOURCES.BRANCH, 'UPDATE'))) { toast.error(t('common.noPermission')); return; }   // 1

    if (row.isActive) {                                                                         // 2
      const usage = await fetchUsage(row.id);
      if (!usage.canDeactivate) {
        toast.error(t('branch.deactivateBlocked', { reason: usage.deactivateBlockedReason ?? '' }));
        return;
      }
    }

    const ok = await confirm({                                                                  // 3
      intent: 'warning',                                                                        // R.6.5
      title: t(row.isActive ? 'branch.deactivateTitle' : 'branch.activateTitle'),
      message: t(row.isActive ? 'branch.deactivateMessage' : 'branch.activateMessage', { code: row.code }),
      confirmLabel: t('common.confirm'), cancelLabel: t('common.cancel'),
    });
    if (!ok) return;

    const mutation = row.isActive ? mutations.deactivate : mutations.activate;                  // R.2.7
    mutation.mutate(row.id, {                                                                   // 4
      onSuccess: () => toast.success(t('common.saved')),
      onError: (e) => toast.error(t(mapBackendError(e).key)),
    });
  }

  async function confirmDelete(row: BranchDto) {
    if (!can(perm(RESOURCES.BRANCH, 'DELETE'))) { toast.error(t('common.noPermission')); return; }

    const usage = await fetchUsage(row.id);                                                     // R.6.4
    if (!usage.canDelete) {
      toast.error(t('branch.deleteBlocked', { reason: usage.deleteBlockedReason ?? '', count: usage.childCount }));
      return;
    }

    const ok = await confirm({
      intent: 'danger',                                                                          // R.6.5
      title: t('branch.deleteTitle'),
      message: t('branch.deleteMessage', { code: row.code }),
      confirmLabel: t('common.delete'), cancelLabel: t('common.cancel'),
    });
    if (!ok) return;

    mutations.remove.mutate(row.id, {
      onSuccess: () => toast.success(t('common.deleted')),
      onError: (e) => toast.error(t(mapBackendError(e).key)),
    });
  }

  return { confirmToggleActive, confirmDelete };
}
```

## Dialog intent (R.6.5)

| Action | Intent |
|---|---|
| Activate / deactivate | `warning` |
| Discard unsaved changes | `warning` |
| Delete | `danger` |

Reserving `danger` for irreversible actions is what keeps it meaningful. Making every dialog
red trains users to click through red dialogs.

## Dependencies (R.6.2)

The handler factory takes `mutations` as an argument and reads `t`, `can`, `confirm`, and
`toast` from hooks at the top level. It never imports a toast or dialog singleton — that
would make the handlers untestable without mounting the whole provider tree.

## Verify before finishing

- [ ] Permission is the first statement in every handler
- [ ] Usage checked before the delete dialog and before deactivation
- [ ] Dialog opens only after both checks pass
- [ ] `danger` reserved for delete
- [ ] Copy from translation keys with interpolated params
- [ ] Separate activate and deactivate mutations
- [ ] Outcome toasts at the call site, not inside the mutation hook
- [ ] Handlers live in `helpers/`

## Violations requiring immediate rejection

| Pattern | Rule |
|---|---|
| Inline handler in the page | R.6.1 |
| Handler importing a toast or dialog singleton | R.6.2 |
| Dialog before the permission check | R.6.3, P.3 |
| Delete dialog with no `canDelete` check | R.6.4 |
| `danger` on a deactivate | R.6.5 |
| Concatenated confirmation copy | R.6.6, DS.5 |
| `toggleActive(id, !row.isActive)` | R.2.7 |
| `window.confirm(...)` | SH.11 |

## Alignment with general React guidance

**Consistent with:** promise-returning dialog hooks, `useOptimistic` for the toggle when
paired with rollback (R.3.14), headless dialog primitives behind the project's shell.

**Deliberately different:** "let the server reject it and show the error" is rejected — the
server *will* reject it, but only after the user has committed to a destructive action.
`window.confirm` is rejected: it is unstyled, untranslatable, and not RTL-aware.
