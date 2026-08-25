Underline tab bar for switching sections within a page (e.g. account detail → Details / Journals / History).

```jsx
<Tabs tabs={[{id:'details',label:'Details'},{id:'journals',label:'Journals',count:12}]} value={tab} onChange={setTab} />
```

Tabs accept `{id,label,icon,count}` or plain strings. Works controlled (`value`+`onChange`) or uncontrolled.
