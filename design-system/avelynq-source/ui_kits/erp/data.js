// AVELYNQ ERP — demo data (fake, for the UI kit recreation)
window.AVL_NAV = [
  { group: 'Overview', items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'ti ti-layout-dashboard' },
  ]},
  { group: 'Modules', items: [
    { id: 'finance', label: 'Finance', icon: 'ti ti-building-bank', children: [
      { id: 'accounts', label: 'Chart of Accounts' },
      { id: 'journals', label: 'Journals' },
      { id: 'rules', label: 'Posting Rules' },
    ]},
    { id: 'hr', label: 'Human Resources', icon: 'ti ti-users' },
    { id: 'inventory', label: 'Inventory', icon: 'ti ti-packages' },
    { id: 'procurement', label: 'Procurement', icon: 'ti ti-shopping-cart' },
    { id: 'sales', label: 'Sales', icon: 'ti ti-receipt' },
    { id: 'maintenance', label: 'Maintenance', icon: 'ti ti-tools' },
  ]},
  { group: 'Administration', items: [
    { id: 'master', label: 'Master Data', icon: 'ti ti-database' },
    { id: 'security', label: 'Security', icon: 'ti ti-shield-lock', children: [
      { id: 'users', label: 'Users' },
      { id: 'roles', label: 'Roles & Access' },
      { id: 'pages', label: 'Pages Registry' },
    ]},
    { id: 'reports', label: 'Reports', icon: 'ti ti-chart-bar' },
  ]},
];

window.AVL_ACCOUNTS = [
  { code: '1000-0000', name: 'Assets', type: 'Header', cur: '—', balance: null, status: 'Active', level: 0 },
  { code: '1100-0000', name: 'Cash & Cash Equivalents', type: 'Asset', cur: 'SAR', balance: 482150.00, status: 'Active', level: 1 },
  { code: '1100-0100', name: 'Petty Cash', type: 'Asset', cur: 'SAR', balance: 12400.00, status: 'Active', level: 2 },
  { code: '1200-0000', name: 'Accounts Receivable', type: 'Asset', cur: 'SAR', balance: 938220.75, status: 'Active', level: 1 },
  { code: '2000-0000', name: 'Liabilities', type: 'Header', cur: '—', balance: null, status: 'Active', level: 0 },
  { code: '2100-0400', name: 'Accounts Payable', type: 'Liability', cur: 'SAR', balance: -128940.50, status: 'Active', level: 1 },
  { code: '2300-0000', name: 'Accrued Expenses', type: 'Liability', cur: 'SAR', balance: -54300.00, status: 'Inactive', level: 1 },
  { code: '3200-0100', name: 'Retained Earnings', type: 'Equity', cur: 'SAR', balance: 1204775.25, status: 'Active', level: 1 },
  { code: '4000-0000', name: 'Operating Revenue', type: 'Revenue', cur: 'SAR', balance: 2840110.00, status: 'Active', level: 1 },
  { code: '5100-0200', name: 'Salaries & Wages', type: 'Expense', cur: 'SAR', balance: -612480.00, status: 'Active', level: 1 },
  { code: '5200-0300', name: 'Utilities', type: 'Expense', cur: 'SAR', balance: -38215.40, status: 'Active', level: 1 },
  { code: '5400-0900', name: 'Depreciation', type: 'Expense', cur: 'SAR', balance: -97600.00, status: 'Inactive', level: 1 },
];

window.AVL_TYPE_TONE = {
  Header: 'neutral', Asset: 'info', Liability: 'warning',
  Equity: 'accent', Revenue: 'success', Expense: 'danger',
};

window.AVL_ACTIVITY = [
  { icon: 'ti ti-circle-check', tone: 'var(--green-600)', text: 'Journal JV-2041 posted to General Ledger', who: 'Omar Faris', time: '12m ago' },
  { icon: 'ti ti-plus', tone: 'var(--blue-600)', text: 'New account 5200-0300 “Utilities” created', who: 'Layla Hassan', time: '1h ago' },
  { icon: 'ti ti-edit', tone: 'var(--teal-600)', text: 'Posting rule “Monthly Accruals” updated', who: 'Sara Noor', time: '3h ago' },
  { icon: 'ti ti-user-plus', tone: 'var(--slate-600)', text: 'User “k.almutairi” granted Finance Approver role', who: 'System', time: 'Yesterday' },
];

window.AVL_FMT = (n) => n == null ? '—' : new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
