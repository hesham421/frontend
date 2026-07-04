Responsive side panel (slide-over). Slides in from the inline-end — right in LTR, left in RTL — and goes full-screen on phones. Complements `Dialog`: reach for `Drawer` when the task has context to keep visible or more than a couple of fields — **record details, create/edit forms, filter panels, contextual workflows**. Use `Dialog` for focused confirmations and short prompts.

```jsx
const [open, setOpen] = React.useState(false);

<Drawer
  open={open}
  onClose={() => setOpen(false)}
  size="md"
  icon="ti ti-filter"
  title="Filter accounts"
  subtitle="Finance · General Ledger"
  footer={<>
    <Button variant="ghost" onClick={reset}>Reset</Button>
    <Button variant="primary" onClick={() => setOpen(false)}>Apply filters</Button>
  </>}
>
  <Select label="Account type" options={['Asset','Liability','Equity','Revenue','Expense']} />
  <Select label="Status" options={['Active','Inactive']} />
  <Input label="Balance ≥" mono suffix="SAR" />
</Drawer>
```

Sizes: `sm` (360) `md` (480) `lg` (640). Body scrolls within the panel; footer actions sit at the bottom. RTL is automatic via logical properties.
