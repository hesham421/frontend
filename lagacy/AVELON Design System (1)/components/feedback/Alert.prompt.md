Inline message banner for form-level feedback, validation summaries, and system notices.

```jsx
<Alert tone="success" title="Journal posted" onClose={dismiss}>Entry JV-2041 was posted to the general ledger.</Alert>
<Alert tone="warning">This account has unposted transactions.</Alert>
```

Tones: `info` `success` `warning` `danger`. Pass `onClose` to make it dismissible.
