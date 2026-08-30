---
name: create-forms
description: "Generates entry forms with React Hook Form and Zod: the shared <Entity>Form component, submit handling, server-error mapping, dirty tracking, unsaved-changes guarding, and create/edit mode. Step 2.4. Use for any form, and to prevent onClick-based submission, unlinked field errors, and silent data loss."
---

# Skill: create-forms

## Description
Generates the form layer for a feature. **Step 2.4.** Implements AD-9.
Rules: `references/contract-rules.md` §R.8.

## When to Use
- Building or reviewing any entry, filter, or modal form
- Wiring server validation errors into fields
- Adding unsaved-changes protection

## When NOT to Use
- Read-only detail views
- List filters bound to URL params → `useErpList()` (R.5.8)
- Backend validation rules — the schema mirrors them, it does not replace them

## Output

- `components/<ENTITY_NAME>Form.tsx` — fields, shared by create and edit (R.8.9)
- Form wiring inside `pages/<ENTITY_NAME>EntryPage.tsx`

---

## Step 1 — The form instance

```tsx
const form = useForm<BranchFormValues>({
  resolver: zodResolver(branchFormSchema),
  defaultValues: BranchFormMapper.createEmpty(),          // R.8.11
  values: branch ? BranchFormMapper.fromDto(branch) : undefined,   // reseeds when data arrives
  mode: 'onTouched',                                      // R.8.1
  reValidateMode: 'onChange',
});
```

`onTouched` validates a field when the user leaves it and re-validates as they fix it. This
is the setting that avoids both extremes: `onChange` shouts "required" at an empty field the
user has just clicked into, and `onSubmit` hides every problem until the end.

`values` (not `reset` in an effect) reseeds the form when the detail query resolves. Using
an effect for this re-introduces the fetch-then-sync pattern and races the user's typing.

## Step 2 — Submission (R.8.2, R.8.3)

```tsx
<form onSubmit={form.handleSubmit(onValid)} noValidate
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
  {/* fields */}
  <Button type="button" variant="secondary" onClick={onCancel}>{t('common.cancel')}</Button>
  <Button type="submit" loading={form.formState.isSubmitting}>{t('common.save')}</Button>
</form>
```

The handler goes on the `<form>`, never on the button's `onClick`. A `<form>` whose submit
is only handled by a click handler still fires the browser's native submit: the page
reloads, the request is never sent, and the button appears to work in a click-through test.
It also breaks Enter-to-submit, which is how most data-entry users actually save.

`type="button"` on Cancel is not cosmetic — the default `type` inside a form is `submit`,
so an unmarked Cancel button submits the form it was meant to abandon.

`noValidate` disables the browser's own bubbles so Zod is the only validation voice.

**Enter, precisely (R.8.13).** In a single-field form (a rename dialog, an inline filter),
Enter submits from that field — the default `<form>` behaviour already does this and needs
no extra wiring. In a multi-field entry form, only the *last* control should submit on Enter;
an earlier field submitting the whole form on Enter saves a half-filled record the moment the
user presses it out of habit. Inside a `<textarea>` (a notes or description field), Enter
must insert a newline, not submit — bind `Cmd`/`Ctrl`+`Enter` there instead if a keyboard
submit shortcut is wanted. This is `vercel-labs/agent-skills`' `web-design-guidelines`
"Enter submits" / "Textarea behavior" rules, applied to RHF fields:

```tsx
<TextField {...register('notes')} onKeyDown={(e) => {
  if (e.key === 'Enter' && !e.shiftKey) e.preventDefault();   // single-line: never submit mid-form
}} />

<TextareaField {...register('description')} onKeyDown={(e) => {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) form.handleSubmit(onValid)();  // Cmd/Ctrl+Enter
  // plain Enter is left alone — it inserts a newline
}} />
```

## Step 3 — Fields (R.8.5, DS.12, DS.15)

```tsx
<TextField
  label={t('branch.code')}
  required
  disabled={mode === 'edit'}                              // immutable — R.8.10
  error={errors.code && t(errors.code.message!)}
  aria-describedby={errors.code ? 'code-error' : undefined}
  {...register('code')}
/>
```

Immutable fields are **disabled, not hidden**: the user needs to see the natural key of the
record they are editing. Hiding it makes the form look like a different record.

Errors render through the shared field components so the message is always programmatically
linked to its input. An error rendered as loose text beside an input is invisible to a
screen reader user.

## Step 4 — Server validation errors (R.8.4)

```ts
const onValid = (values: BranchFormValues) => {
  const req = mode === 'edit' ? BranchFormMapper.toUpdateRequest(values) : BranchFormMapper.toCreateRequest(values);
  save.mutate(req, {
    onSuccess: (dto) => { form.reset(BranchFormMapper.fromDto(dto)); onSaved(dto); },   // R.8.7
    onError: (e) => applyServerErrors(form, e),
  });
};

export function applyServerErrors<T extends FieldValues>(form: UseFormReturn<T>, e: unknown) {
  const err = normalizeError(e);
  if (err.kind === 'validation' && err.fieldErrors) {
    for (const [field, code] of Object.entries(err.fieldErrors)) {
      form.setError(field as Path<T>, { type: 'server', message: code });   // key, translated at render
    }
    form.setFocus(Object.keys(err.fieldErrors)[0] as Path<T>);
    return;
  }
  form.setError('root.serverError', { message: mapBackendError(err).key });
}
```

A validation failure belongs on the field that caused it, not in a toast that disappears
before the user finds the input (R.10.8). Focusing the first invalid field saves the user
hunting through a long form.

Unfielded failures — a conflict, a cross-field rule — go to `root.serverError` and render in
a form-level alert above the actions.

## Step 5 — Dirty state and unsaved changes (R.8.7, R.8.8)

```tsx
const blocker = useBlocker(({ currentLocation, nextLocation }) =>
  form.formState.isDirty && currentLocation.pathname !== nextLocation.pathname);

useEffect(() => {
  if (blocker.state !== 'blocked') return;
  confirm({ intent: 'warning', title: t('common.unsavedTitle'), message: t('common.unsavedMessage') })
    .then((ok) => (ok ? blocker.proceed() : blocker.reset()));
}, [blocker.state]);
```

`reset(fromDto(saved))` after a successful save is what makes this work: without it the form
stays dirty against its old baseline and warns the user about changes they already saved.

For full page unloads, pair this with a `beforeunload` listener registered only while dirty —
registering it unconditionally makes every navigation slow and shows the browser's dialog on
clean forms.

## Step 6 — One form, two modes (R.8.9)

```tsx
interface BranchFormProps {
  form: UseFormReturn<BranchFormValues>;
  mode: 'create' | 'edit';
  disabled?: boolean;
}
```

Create and edit share one field component. Two divergent forms drift within a sprint: a
field gets added to one and not the other, and the difference surfaces as a backend
validation error the user cannot act on.

The page owns the form instance and the mutation; the form component owns layout and fields
only. It receives `form` as a prop rather than creating it, so the page can inspect
`isDirty` and apply server errors.

## Verify before finishing

- [ ] `handleSubmit` on the `<form>`; submit button is `type="submit"`; others are `type="button"`
- [ ] `mode: 'onTouched'`, `reValidateMode: 'onChange'`, `noValidate`
- [ ] Defaults from `createEmpty()` / `fromDto()`; reseeding via `values`, not an effect
- [ ] Server field errors mapped with `setError` and focused; unfielded ones on `root.serverError`
- [ ] Errors linked to inputs with `aria-describedby`
- [ ] Submit disabled and loading while `isSubmitting`
- [ ] `reset(nextValues)` after a successful save
- [ ] `useBlocker` guards dirty navigation; `beforeunload` registered only while dirty
- [ ] Immutable fields disabled, not hidden
- [ ] One form component for both modes
- [ ] Validation messages are translation keys
- [ ] Enter submits only from a single-field form or the last control of a multi-field one; a `<textarea>` takes plain Enter as a newline and, if wired, `Cmd`/`Ctrl`+`Enter` as submit

## Violations requiring immediate rejection

| Pattern | Rule |
|---|---|
| Submit wired to a button's `onClick` | R.8.2 |
| Unmarked Cancel button inside a form | R.8.3 |
| Server field errors shown only as a toast | R.8.4, R.10.8 |
| Error text not linked to its input | R.8.5, DS.12 |
| No loading state on submit; double submission possible | R.8.6 |
| Form still dirty after a successful save | R.8.7 |
| No unsaved-changes guard on an entry form | R.8.8 |
| Separate create and edit form components | R.8.9 |
| Immutable field editable or hidden in edit mode | R.8.10 |
| Inline default literals instead of the mapper | R.8.11 |
| English validation message in the schema | R.8.12 |
| `useState` per field | R.8.1 |
| Enter submitting from a mid-form field, or submitting from inside a `<textarea>` | R.8.13 |

## Alignment with general React guidance

**Consistent with:** React Hook Form's uncontrolled-by-default model, `zodResolver`,
`useBlocker` from React Router, `setError` for server errors, and `vercel-labs/agent-skills`'
`web-design-guidelines` rules on Enter-to-submit and textarea keyboard behaviour (R.8.13).

**Deliberately different:** `useActionState` and `<form action>` are not used on entry pages
(see `erp-priority-override`) — they do not give the dirty tracking, field-level server
error mapping, or navigation blocking these forms require. Controlled `useState` per field
is rejected for the re-render cost and the duplicated validation it invites.
