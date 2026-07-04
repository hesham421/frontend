Responsive modal dialog. Centered on desktop/laptop/tablet; docks as a bottom sheet on phones. Body scrolls within a capped height. Use for confirmations, edit forms, and detail panels.

```jsx
const [open, setOpen] = React.useState(false);

<Dialog
  open={open}
  onClose={() => setOpen(false)}
  size="sm"
  icon="ti ti-alert-triangle"
  iconTone="danger"
  title="Discard changes?"
  subtitle="This account has unsaved edits."
  footer={<>
    <Button variant="secondary" onClick={() => setOpen(false)}>Keep editing</Button>
    <Button variant="danger" onClick={() => setOpen(false)}>Discard</Button>
  </>}
>
  Your changes to <strong>5300-0100</strong> will be lost. This cannot be undone.
</Dialog>
```

Sizes: `sm` (420) `md` (560) `lg` (760). `footer` actions stack full-width on phones automatically. Pair with the design-system `Button`/`Input`/`Select` for confirm and form dialogs.
