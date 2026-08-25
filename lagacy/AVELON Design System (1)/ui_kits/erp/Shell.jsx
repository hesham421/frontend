// AVELYNQ ERP — app shell: Sidebar + Topbar
const { Avatar, IconButton, Badge } = window.AVELONDesignSystem_a21abd;

function Sidebar({ active, onNavigate, open, onClose }) {
  const [openGroups, setOpenGroups] = React.useState({ finance: true });
  const toggle = (id) => setOpenGroups((g) => ({ ...g, [id]: !g[id] }));

  return (
    <aside className={'avl-sidebar' + (open ? ' is-open' : '')} style={{
      width: 'var(--sidebar-width)', flexShrink: 0, background: 'var(--navy-850)',
      color: '#fff', display: 'flex', flexDirection: 'column', height: '100%',
      borderRight: '1px solid var(--border-inverse)',
    }}>
      {/* Brand */}
      <div style={{ height: 'var(--topbar-height)', display: 'flex', alignItems: 'center', gap: '11px', padding: '0 20px', borderBottom: '1px solid var(--border-inverse)' }}>
        <img src="../../assets/avelynq-mark-dark.png" alt="" style={{ height: '30px', width: 'auto' }} />
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '19px', letterSpacing: '0.04em', color: '#fff' }}>
          AVEL<span style={{ color: 'var(--teal-400)' }}>Y</span>NQ
        </span>
        <button className="avl-menu-btn" onClick={onClose} aria-label="Close menu" style={{ marginInlineStart: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '20px', padding: '4px', lineHeight: 1 }}>
          <i className="ti ti-x" />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>
        {window.AVL_NAV.map((sec) => (
          <div key={sec.group} style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', padding: '0 10px 8px' }}>{sec.group}</div>
            {sec.items.map((item) => {
              const hasChildren = !!item.children;
              const isActive = active === item.id || (hasChildren && item.children.some((c) => c.id === active));
              const isOpen = openGroups[item.id];
              return (
                <div key={item.id}>
                  <button
                    onClick={() => hasChildren ? toggle(item.id) : onNavigate(item.id)}
                    style={navItemStyle(isActive && !hasChildren)}
                    onMouseEnter={(e) => { if (!(isActive && !hasChildren)) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={(e) => { if (!(isActive && !hasChildren)) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <i className={item.icon} style={{ fontSize: '18px', width: '20px', color: isActive ? 'var(--teal-400)' : 'rgba(255,255,255,0.6)' }} />
                    <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                    {hasChildren && <i className={isOpen ? 'ti ti-chevron-down' : 'ti ti-chevron-right'} style={{ fontSize: '15px', opacity: 0.5 }} />}
                  </button>
                  {hasChildren && isOpen && (
                    <div style={{ margin: '2px 0 4px', paddingInlineStart: '30px' }}>
                      {item.children.map((c) => {
                        const childActive = active === c.id;
                        return (
                          <button key={c.id} onClick={() => onNavigate(c.id)} style={subItemStyle(childActive)}
                            onMouseEnter={(e) => { if (!childActive) e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={(e) => { if (!childActive) e.currentTarget.style.color = 'rgba(255,255,255,0.62)'; }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: childActive ? 'var(--teal-400)' : 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border-inverse)', fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Built to Grow · v2.4
      </div>
    </aside>
  );
}

function navItemStyle(active) {
  return {
    position: 'relative', display: 'flex', alignItems: 'center', gap: '11px',
    width: '100%', padding: '9px 10px', marginBottom: '2px',
    background: active ? 'rgba(36,102,216,0.18)' : 'transparent',
    border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer',
    fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: active ? 600 : 500,
    color: active ? '#fff' : 'rgba(255,255,255,0.78)',
    boxShadow: active ? 'inset 2px 0 0 var(--teal-400)' : 'none',
    transition: 'background var(--dur-fast) var(--ease-standard)',
  };
}
function subItemStyle(active) {
  return {
    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
    padding: '7px 10px', background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: active ? 600 : 400,
    color: active ? '#fff' : 'rgba(255,255,255,0.62)', textAlign: 'left',
    transition: 'color var(--dur-fast) var(--ease-standard)',
  };
}

function Topbar({ title, breadcrumb, lang, onToggleLang, onLogout, onMenu }) {
  return (
    <header style={{
      height: 'var(--topbar-height)', flexShrink: 0, background: '#fff',
      borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center',
      gap: 'clamp(8px, 1.4vw, 16px)', padding: '0 clamp(12px, 2vw, 22px)',
    }}>
      <button className="avl-menu-btn" onClick={onMenu} aria-label="Open menu" style={{ alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', flexShrink: 0, background: 'transparent', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-body)', cursor: 'pointer', fontSize: '19px' }}>
        <i className="ti ti-menu-2" />
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        {breadcrumb && <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginBottom: '1px', fontFamily: 'var(--font-sans)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{breadcrumb}</div>}
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 600, color: 'var(--text-strong)', letterSpacing: 'var(--ls-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
      </div>

      <div className="avl-hide-md-down" style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '340px', flex: '0 1 320px', height: '38px', padding: '0 12px', background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
        <i className="ti ti-search" style={{ color: 'var(--text-subtle)', fontSize: '16px' }} />
        <input placeholder="Search accounts, journals, users…" style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--text-body)' }} />
        <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-subtle)', border: '1px solid var(--border-default)', borderRadius: '4px', padding: '1px 5px' }}>⌘K</kbd>
      </div>

      <button onClick={onToggleLang} title="Switch language" style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px', padding: '0 12px', flexShrink: 0, background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--text-body)' }}>
        <i className="ti ti-language" style={{ fontSize: '17px' }} />
        <span className="avl-hide-sm-down">{lang === 'en' ? 'العربية' : 'English'}</span>
      </button>

      <div style={{ position: 'relative', flexShrink: 0 }}>
        <IconButton icon="ti ti-bell" label="Notifications" variant="ghost" />
        <span style={{ position: 'absolute', top: '5px', insetInlineEnd: '6px', width: '7px', height: '7px', borderRadius: '50%', background: 'var(--red-500)', border: '1.5px solid #fff' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flexShrink: 0, paddingInlineStart: '6px', borderInlineStart: '1px solid var(--border-subtle)' }}>
        <Avatar name="Khalid Al-Mutairi" size="sm" />
        <div className="avl-hide-sm-down" style={{ lineHeight: 1.25 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--text-strong)' }}>K. Al-Mutairi</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--text-muted)' }}>Finance Approver</div>
        </div>
        <IconButton icon="ti ti-logout" label="Sign out" variant="ghost" size="sm" onClick={onLogout} />
      </div>
    </header>
  );
}

Object.assign(window, { Sidebar, Topbar });
