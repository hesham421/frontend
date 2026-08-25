Dropdown select matched to the Input field system.

```jsx
<Select label="Currency" options={['SAR','USD','EUR']} value={cur} onChange={e=>setCur(e.target.value)} />
<Select label="Status" options={[{value:'a',label:'Active'},{value:'i',label:'Inactive'}]} />
```

Options accept plain strings or `{value,label}` objects.
