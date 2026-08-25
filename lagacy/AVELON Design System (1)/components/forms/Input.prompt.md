Labelled text input with hint, error, icon, and suffix support.

```jsx
<Input label="Account Code" mono iconLeft="ti ti-hash" placeholder="1000-0000" required />
<Input label="Email" error="Required field" />
```

Use `mono` for codes/amounts. `error` overrides `hint` and turns the field red. `suffix` for units (e.g. "SAR").
