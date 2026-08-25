/* @ds-bundle: {"format":3,"namespace":"AVELONDesignSystem_a21abd","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"IconButton","sourcePath":"components/buttons/IconButton.jsx"},{"name":"Avatar","sourcePath":"components/data-display/Avatar.jsx"},{"name":"Badge","sourcePath":"components/data-display/Badge.jsx"},{"name":"Card","sourcePath":"components/data-display/Card.jsx"},{"name":"Stat","sourcePath":"components/data-display/Stat.jsx"},{"name":"Alert","sourcePath":"components/feedback/Alert.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Breadcrumb","sourcePath":"components/navigation/Breadcrumb.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"Dialog","sourcePath":"components/overlays/Dialog.jsx"},{"name":"Drawer","sourcePath":"components/overlays/Drawer.jsx"}],"sourceHashes":{"components/buttons/Button.jsx":"16d4a9b7f2c4","components/buttons/IconButton.jsx":"74c51f0df0dc","components/data-display/Avatar.jsx":"e0359e750764","components/data-display/Badge.jsx":"a4ad76e993ef","components/data-display/Card.jsx":"f4e5b3e361fc","components/data-display/Stat.jsx":"164b2a08e71d","components/feedback/Alert.jsx":"b6c1c386199f","components/feedback/EmptyState.jsx":"0ebae326c0b7","components/forms/Checkbox.jsx":"30254eafcbe9","components/forms/Input.jsx":"66f69c2977fa","components/forms/Select.jsx":"8a0c9645fe87","components/forms/Switch.jsx":"0f60c9757934","components/navigation/Breadcrumb.jsx":"8d3efc6c8d4f","components/navigation/Tabs.jsx":"f129122ecc18","components/overlays/Dialog.jsx":"c94124a95e9e","components/overlays/Drawer.jsx":"537303f366b1","ui_kits/erp/AccountFormScreen.jsx":"558c2686e319","ui_kits/erp/AccountsScreen.jsx":"c85fccec5246","ui_kits/erp/DashboardScreen.jsx":"116cb0e76696","ui_kits/erp/LoginScreen.jsx":"6f01580b9280","ui_kits/erp/Shell.jsx":"355f5ce17635","ui_kits/erp/data.js":"c967cb30bb89"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.AVELONDesignSystem_a21abd = window.AVELONDesignSystem_a21abd || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft = null,
  iconRight = null,
  block = false,
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      height: 'var(--control-sm)',
      padding: '0 12px',
      fontSize: 'var(--fs-sm)',
      gap: '6px'
    },
    md: {
      height: 'var(--control-md)',
      padding: '0 16px',
      fontSize: 'var(--fs-body)',
      gap: '8px'
    },
    lg: {
      height: 'var(--control-lg)',
      padding: '0 22px',
      fontSize: 'var(--fs-h4)',
      gap: '8px'
    }
  };
  const variants = {
    primary: {
      background: 'var(--brand-primary)',
      color: '#fff',
      border: '1px solid transparent'
    },
    accent: {
      background: 'var(--brand-accent)',
      color: '#fff',
      border: '1px solid transparent'
    },
    secondary: {
      background: '#fff',
      color: 'var(--text-body)',
      border: '1px solid var(--border-default)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-link)',
      border: '1px solid transparent'
    },
    danger: {
      background: 'var(--red-500)',
      color: '#fff',
      border: '1px solid transparent'
    },
    inverse: {
      background: 'rgba(255,255,255,0.08)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.16)'
    }
  };
  const v = variants[variant] || variants.primary;
  const isDisabled = disabled || loading;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    onClick: onClick,
    disabled: isDisabled,
    className: 'avl-btn avl-btn-' + variant,
    style: {
      display: block ? 'flex' : 'inline-flex',
      width: block ? '100%' : 'auto',
      alignItems: 'center',
      justifyContent: 'center',
      gap: sizes[size].gap,
      height: sizes[size].height,
      padding: sizes[size].padding,
      fontSize: sizes[size].fontSize,
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--fw-semibold)',
      lineHeight: 1,
      letterSpacing: '0.01em',
      borderRadius: 'var(--radius-md)',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.5 : 1,
      whiteSpace: 'nowrap',
      transition: 'background var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)',
      ...v,
      ...style
    }
  }, rest), loading && /*#__PURE__*/React.createElement(Spinner, null), !loading && iconLeft, children && /*#__PURE__*/React.createElement("span", null, children), !loading && iconRight);
}
function Spinner() {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: '14px',
      height: '14px',
      borderRadius: '50%',
      border: '2px solid currentColor',
      borderTopColor: 'transparent',
      display: 'inline-block',
      animation: 'avl-spin 0.7s linear infinite'
    }
  });
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  label,
  disabled = false,
  onClick,
  style = {},
  ...rest
}) {
  const dims = {
    sm: 30,
    md: 38,
    lg: 44
  };
  const variants = {
    ghost: {
      background: 'transparent',
      color: 'var(--text-muted)',
      border: '1px solid transparent'
    },
    outline: {
      background: '#fff',
      color: 'var(--text-body)',
      border: '1px solid var(--border-default)'
    },
    solid: {
      background: 'var(--brand-primary)',
      color: '#fff',
      border: '1px solid transparent'
    },
    subtle: {
      background: 'var(--surface-sunken)',
      color: 'var(--text-body)',
      border: '1px solid transparent'
    }
  };
  const v = variants[variant] || variants.ghost;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onClick: onClick,
    className: 'avl-iconbtn avl-iconbtn-' + variant,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: dims[size] + 'px',
      height: dims[size] + 'px',
      borderRadius: 'var(--radius-md)',
      fontSize: size === 'sm' ? '15px' : '17px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      transition: 'background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)',
      ...v,
      ...style
    }
  }, rest), typeof icon === 'string' ? /*#__PURE__*/React.createElement("i", {
    className: icon
  }) : icon);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Avatar.jsx
try { (() => {
function Avatar({
  name = '',
  src = null,
  size = 'md',
  square = false,
  style = {}
}) {
  const dims = {
    xs: 24,
    sm: 30,
    md: 38,
    lg: 48
  };
  const d = dims[size] || dims.md;
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  // deterministic brand-family tint from name
  const palette = ['var(--blue-600)', 'var(--teal-600)', 'var(--slate-600)', 'var(--blue-800)', 'var(--teal-700)'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % palette.length;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: d + 'px',
      height: d + 'px',
      borderRadius: square ? 'var(--radius-md)' : '50%',
      background: src ? 'transparent' : palette[h],
      color: '#fff',
      overflow: 'hidden',
      flexShrink: 0,
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--fw-semibold)',
      fontSize: Math.round(d * 0.38) + 'px',
      letterSpacing: '0.01em',
      ...style
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Badge.jsx
try { (() => {
function Badge({
  children,
  tone = 'neutral',
  variant = 'soft',
  icon = null,
  style = {}
}) {
  const tones = {
    neutral: {
      c: 'var(--status-neutral)',
      bg: 'var(--status-neutral-bg)',
      solid: 'var(--slate-600)'
    },
    info: {
      c: 'var(--status-info)',
      bg: 'var(--status-info-bg)',
      solid: 'var(--blue-500)'
    },
    success: {
      c: 'var(--status-success)',
      bg: 'var(--status-success-bg)',
      solid: 'var(--green-600)'
    },
    warning: {
      c: 'var(--status-warning)',
      bg: 'var(--status-warning-bg)',
      solid: 'var(--amber-600)'
    },
    danger: {
      c: 'var(--status-danger)',
      bg: 'var(--status-danger-bg)',
      solid: 'var(--red-600)'
    },
    accent: {
      c: 'var(--teal-700)',
      bg: 'var(--teal-50)',
      solid: 'var(--teal-600)'
    }
  };
  const t = tones[tone] || tones.neutral;
  const styles = variant === 'solid' ? {
    background: t.solid,
    color: '#fff',
    border: '1px solid transparent'
  } : variant === 'outline' ? {
    background: 'transparent',
    color: t.c,
    border: '1px solid currentColor'
  } : {
    background: t.bg,
    color: t.c,
    border: '1px solid transparent'
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      height: '22px',
      padding: '0 9px',
      fontSize: 'var(--fs-2xs)',
      fontWeight: 'var(--fw-semibold)',
      fontFamily: 'var(--font-sans)',
      letterSpacing: '0.02em',
      borderRadius: 'var(--radius-sm)',
      whiteSpace: 'nowrap',
      lineHeight: 1,
      ...styles,
      ...style
    }
  }, icon && (typeof icon === 'string' ? /*#__PURE__*/React.createElement("i", {
    className: icon
  }) : icon), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Card.jsx
try { (() => {
function Card({
  children,
  title,
  subtitle,
  actions = null,
  padding = 'md',
  header = null,
  footer = null,
  hover = false,
  style = {}
}) {
  const pads = {
    none: '0',
    sm: '14px',
    md: '20px',
    lg: '24px'
  };
  const [h, setH] = typeof React !== 'undefined' && React.useState ? React.useState(false) : [false, () => {}];
  return /*#__PURE__*/React.createElement("div", {
    onMouseEnter: () => hover && setH(true),
    onMouseLeave: () => hover && setH(false),
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: h ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      transition: 'box-shadow var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard)',
      transform: h ? 'translateY(-2px)' : 'none',
      overflow: 'hidden',
      ...style
    }
  }, (title || header || actions) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      rowGap: '8px',
      gap: '12px',
      padding: '14px 20px',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, header || /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--fw-semibold)',
      fontSize: 'var(--fs-title)',
      color: 'var(--text-strong)',
      letterSpacing: 'var(--ls-heading)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-xs)',
      color: 'var(--text-muted)',
      marginTop: '2px'
    }
  }, subtitle)), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      flexShrink: 0
    }
  }, actions)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: pads[padding],
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-body)',
      color: 'var(--text-body)'
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 20px',
      borderTop: '1px solid var(--border-subtle)',
      background: 'var(--surface-card)'
    }
  }, footer));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Card.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Stat.jsx
try { (() => {
function Stat({
  label,
  value,
  delta = null,
  deltaTone = 'success',
  icon = null,
  accent = 'blue',
  style = {}
}) {
  const accents = {
    blue: 'var(--blue-500)',
    teal: 'var(--teal-500)',
    slate: 'var(--slate-500)',
    amber: 'var(--amber-500)',
    green: 'var(--green-500)',
    red: 'var(--red-500)'
  };
  const deltaColors = {
    success: 'var(--green-600)',
    danger: 'var(--red-600)',
    neutral: 'var(--text-muted)'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      padding: '18px 20px',
      overflow: 'hidden',
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '3px',
      background: accents[accent]
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-xs)',
      fontWeight: 'var(--fw-medium)',
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--ls-wide)'
    }
  }, label), icon && /*#__PURE__*/React.createElement("i", {
    className: typeof icon === 'string' ? icon : '',
    style: {
      color: accents[accent],
      fontSize: '18px'
    }
  }, typeof icon !== 'string' ? icon : null)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '28px',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--text-strong)',
      letterSpacing: '-0.01em'
    }
  }, value), delta && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-xs)',
      fontWeight: 'var(--fw-semibold)',
      color: deltaColors[deltaTone]
    }
  }, delta)));
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Stat.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Alert.jsx
try { (() => {
function Alert({
  tone = 'info',
  title,
  children,
  icon = null,
  onClose = null,
  style = {}
}) {
  const tones = {
    info: {
      c: 'var(--blue-700)',
      bg: 'var(--info-50)',
      bd: 'var(--blue-200)',
      i: 'ti ti-info-circle'
    },
    success: {
      c: 'var(--green-700)',
      bg: 'var(--green-50)',
      bd: '#B7E0C6',
      i: 'ti ti-circle-check'
    },
    warning: {
      c: 'var(--amber-700)',
      bg: 'var(--amber-50)',
      bd: '#E8D49B',
      i: 'ti ti-alert-triangle'
    },
    danger: {
      c: 'var(--red-700)',
      bg: 'var(--red-50)',
      bd: '#E6B5AE',
      i: 'ti ti-alert-circle'
    }
  };
  const t = tones[tone] || tones.info;
  return /*#__PURE__*/React.createElement("div", {
    role: "alert",
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '12px 14px',
      background: t.bg,
      border: '1px solid ' + t.bd,
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: typeof icon === 'string' ? icon : t.i,
    style: {
      color: t.c,
      fontSize: '18px',
      marginTop: '1px',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 'var(--fw-semibold)',
      fontSize: 'var(--fs-sm)',
      color: t.c,
      marginBottom: children ? '2px' : 0
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-body)',
      lineHeight: 'var(--lh-normal)'
    }
  }, children)), onClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Dismiss",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: t.c,
      fontSize: '16px',
      padding: 0,
      lineHeight: 1
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti ti-x"
  })));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Alert.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
function EmptyState({
  icon = 'ti ti-database',
  title,
  message,
  action = null,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '48px 24px',
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '56px',
      height: '56px',
      borderRadius: 'var(--radius-xl)',
      background: 'var(--surface-sunken)',
      color: 'var(--text-subtle)',
      fontSize: '26px',
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: typeof icon === 'string' ? icon : ''
  }, typeof icon !== 'string' ? icon : null)), title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 'var(--fw-semibold)',
      fontSize: 'var(--fs-title)',
      color: 'var(--text-strong)',
      marginBottom: '4px'
    }
  }, title), message && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-sm)',
      color: 'var(--text-muted)',
      maxWidth: '360px',
      lineHeight: 'var(--lh-normal)'
    }
  }, message), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '18px'
    }
  }, action));
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function Checkbox({
  label,
  checked = false,
  onChange,
  disabled = false,
  indeterminate = false,
  id,
  style = {}
}) {
  const fid = id || (label ? 'avl-cb-' + String(label).replace(/\s+/g, '-').toLowerCase() : undefined);
  const on = checked || indeterminate;
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: fid,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '9px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-body)',
      color: 'var(--text-body)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      width: '18px',
      height: '18px',
      flexShrink: 0,
      borderRadius: 'var(--radius-xs)',
      border: '1.5px solid ' + (on ? 'var(--brand-primary)' : 'var(--border-strong)'),
      background: on ? 'var(--brand-primary)' : '#fff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    id: fid,
    type: "checkbox",
    checked: checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      position: 'absolute',
      opacity: 0,
      width: '100%',
      height: '100%',
      margin: 0,
      cursor: 'inherit'
    }
  }), indeterminate ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: '9px',
      height: '2px',
      background: '#fff',
      borderRadius: '1px'
    }
  }) : on && /*#__PURE__*/React.createElement("i", {
    className: "ti ti-check",
    style: {
      color: '#fff',
      fontSize: '13px',
      fontWeight: 700
    }
  })), label && /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  label,
  hint,
  error,
  value,
  onChange,
  placeholder,
  type = 'text',
  iconLeft = null,
  suffix = null,
  disabled = false,
  readOnly = false,
  required = false,
  mono = false,
  id,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState ? React.useState(false) : [false, () => {}];
  const fid = id || (label ? 'avl-' + label.replace(/\s+/g, '-').toLowerCase() : undefined);
  const borderColor = error ? 'var(--red-500)' : focus ? 'var(--brand-primary)' : 'var(--border-default)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fid,
    style: {
      fontSize: 'var(--fs-xs)',
      fontWeight: 'var(--fw-medium)',
      color: 'var(--text-body)',
      letterSpacing: '0.01em'
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--red-500)',
      marginInlineStart: '3px'
    }
  }, "*")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      height: 'var(--control-md)',
      padding: '0 12px',
      background: disabled ? 'var(--surface-sunken)' : '#fff',
      border: '1px solid ' + borderColor,
      borderRadius: 'var(--radius-md)',
      boxShadow: focus && !error ? 'var(--focus-ring)' : 'none',
      transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)'
    }
  }, iconLeft && /*#__PURE__*/React.createElement("i", {
    className: typeof iconLeft === 'string' ? iconLeft : '',
    style: {
      color: 'var(--text-subtle)',
      fontSize: '16px'
    }
  }, typeof iconLeft !== 'string' ? iconLeft : null), /*#__PURE__*/React.createElement("input", _extends({
    id: fid,
    type: type,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled,
    readOnly: readOnly,
    required: required,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
      fontSize: 'var(--fs-body)',
      color: 'var(--text-strong)',
      height: '100%'
    }
  }, rest)), suffix && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 'var(--fs-sm)',
      whiteSpace: 'nowrap'
    }
  }, suffix)), error ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-xs)',
      color: 'var(--red-600)'
    }
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-xs)',
      color: 'var(--text-muted)'
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function Select({
  label,
  hint,
  error,
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  disabled = false,
  required = false,
  id,
  style = {}
}) {
  const [focus, setFocus] = React.useState ? React.useState(false) : [false, () => {}];
  const fid = id || (label ? 'avl-sel-' + label.replace(/\s+/g, '-').toLowerCase() : undefined);
  const borderColor = error ? 'var(--red-500)' : focus ? 'var(--brand-primary)' : 'var(--border-default)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fid,
    style: {
      fontSize: 'var(--fs-xs)',
      fontWeight: 'var(--fw-medium)',
      color: 'var(--text-body)'
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--red-500)',
      marginInlineStart: '3px'
    }
  }, "*")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("select", {
    id: fid,
    value: value,
    onChange: onChange,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: '100%',
      height: 'var(--control-md)',
      padding: '0 36px 0 12px',
      appearance: 'none',
      WebkitAppearance: 'none',
      background: disabled ? 'var(--surface-sunken)' : '#fff',
      border: '1px solid ' + borderColor,
      borderRadius: 'var(--radius-md)',
      boxShadow: focus && !error ? 'var(--focus-ring)' : 'none',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-body)',
      color: value ? 'var(--text-strong)' : 'var(--text-subtle)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      outline: 'none',
      transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)'
    }
  }, placeholder && /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder), options.map(o => {
    const val = typeof o === 'string' ? o : o.value;
    const lbl = typeof o === 'string' ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: val,
      value: val
    }, lbl);
  })), /*#__PURE__*/React.createElement("i", {
    className: "ti ti-chevron-down",
    style: {
      position: 'absolute',
      insetInlineEnd: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--text-subtle)',
      pointerEvents: 'none',
      fontSize: '16px'
    }
  })), error ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-xs)',
      color: 'var(--red-600)'
    }
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-xs)',
      color: 'var(--text-muted)'
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function Switch({
  label,
  checked = false,
  onChange,
  disabled = false,
  id,
  style = {}
}) {
  const fid = id || (label ? 'avl-sw-' + String(label).replace(/\s+/g, '-').toLowerCase() : undefined);
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: fid,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-body)',
      color: 'var(--text-body)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      width: '38px',
      height: '22px',
      flexShrink: 0,
      borderRadius: 'var(--radius-pill)',
      background: checked ? 'var(--brand-primary)' : 'var(--slate-300)',
      transition: 'background var(--dur-base) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    id: fid,
    type: "checkbox",
    checked: checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      position: 'absolute',
      opacity: 0,
      width: '100%',
      height: '100%',
      margin: 0,
      cursor: 'inherit'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: '3px',
      insetInlineStart: checked ? '19px' : '3px',
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      background: '#fff',
      boxShadow: 'var(--shadow-sm)',
      transition: 'inset-inline-start var(--dur-base) var(--ease-out)'
    }
  })), label && /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Breadcrumb.jsx
try { (() => {
function Breadcrumb({
  items = [],
  style = {}
}) {
  return /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Breadcrumb",
    style: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '6px',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-xs)',
      ...style
    }
  }, items.map((item, i) => {
    const last = i === items.length - 1;
    const label = typeof item === 'string' ? item : item.label;
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: last ? 'var(--text-strong)' : 'var(--text-muted)',
        fontWeight: last ? 'var(--fw-semibold)' : 'var(--fw-regular)',
        cursor: !last && item.href ? 'pointer' : 'default'
      }
    }, label), !last && /*#__PURE__*/React.createElement("i", {
      className: "ti ti-chevron-right",
      style: {
        color: 'var(--text-subtle)',
        fontSize: '13px'
      }
    }));
  }));
}
Object.assign(__ds_scope, { Breadcrumb });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Breadcrumb.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function Tabs({
  tabs = [],
  value,
  onChange,
  style = {}
}) {
  const [internal, setInternal] = React.useState ? React.useState(tabs[0] && (tabs[0].id || tabs[0])) : [value, () => {}];
  const active = value !== undefined ? value : internal;
  const setActive = id => {
    if (onChange) onChange(id);
    if (value === undefined) setInternal(id);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "avl-tabs",
    style: {
      display: 'flex',
      gap: '4px',
      borderBottom: '1px solid var(--border-subtle)',
      fontFamily: 'var(--font-sans)',
      overflowX: 'auto',
      flexWrap: 'nowrap',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      ...style
    }
  }, tabs.map(tab => {
    const id = tab.id || tab;
    const label = tab.label || tab;
    const isActive = id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => setActive(id),
      style: {
        position: 'relative',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '10px 14px',
        fontFamily: 'var(--font-sans)',
        flexShrink: 0,
        whiteSpace: 'nowrap',
        fontSize: 'var(--fs-body)',
        fontWeight: isActive ? 'var(--fw-semibold)' : 'var(--fw-medium)',
        color: isActive ? 'var(--text-strong)' : 'var(--text-muted)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        transition: 'color var(--dur-fast) var(--ease-standard)'
      }
    }, tab.icon && /*#__PURE__*/React.createElement("i", {
      className: tab.icon
    }), label, tab.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-2xs)',
        fontWeight: 600,
        color: isActive ? 'var(--brand-primary)' : 'var(--text-subtle)',
        background: isActive ? 'var(--blue-50)' : 'var(--surface-sunken)',
        padding: '1px 6px',
        borderRadius: 'var(--radius-pill)'
      }
    }, tab.count), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: '10px',
        right: '10px',
        bottom: '-1px',
        height: '2px',
        background: isActive ? 'var(--brand-primary)' : 'transparent',
        borderRadius: '2px 2px 0 0'
      }
    }));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/overlays/Dialog.jsx
try { (() => {
function Dialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  icon = null,
  iconTone = 'info',
  closeOnScrim = true,
  showClose = true,
  style = {}
}) {
  if (!open) return null;
  const tones = {
    info: {
      c: 'var(--blue-600)',
      bg: 'var(--info-50)'
    },
    success: {
      c: 'var(--green-600)',
      bg: 'var(--green-50)'
    },
    warning: {
      c: 'var(--amber-600)',
      bg: 'var(--amber-50)'
    },
    danger: {
      c: 'var(--red-600)',
      bg: 'var(--red-50)'
    },
    neutral: {
      c: 'var(--slate-600)',
      bg: 'var(--surface-sunken)'
    }
  };
  const t = tones[iconTone] || tones.info;
  return /*#__PURE__*/React.createElement("div", {
    className: 'avl-dialog avl-dialog--' + size,
    role: "dialog",
    "aria-modal": "true",
    "aria-label": title || 'Dialog',
    style: {
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "avl-dialog__scrim",
    onClick: closeOnScrim ? onClose : undefined
  }), /*#__PURE__*/React.createElement("div", {
    className: "avl-dialog__panel",
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-xl)',
      overflow: 'hidden',
      ...style
    }
  }, (title || icon || showClose) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '18px 20px',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '38px',
      height: '38px',
      flexShrink: 0,
      borderRadius: 'var(--radius-md)',
      background: t.bg,
      color: t.c,
      fontSize: '20px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: typeof icon === 'string' ? icon : ''
  }, typeof icon !== 'string' ? icon : null)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      paddingTop: icon ? '2px' : 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-title)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--text-strong)',
      letterSpacing: 'var(--ls-heading)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-xs)',
      color: 'var(--text-muted)',
      marginTop: '2px'
    }
  }, subtitle)), showClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--text-muted)',
      fontSize: '18px',
      lineHeight: 1,
      padding: '2px',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti ti-x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "avl-dialog__body",
    style: {
      flex: '1 1 auto',
      padding: '20px',
      fontSize: 'var(--fs-body)',
      color: 'var(--text-body)',
      lineHeight: 'var(--lh-normal)'
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    className: "avl-dialog__footer",
    style: {
      padding: '14px 20px',
      borderTop: '1px solid var(--border-subtle)'
    }
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/overlays/Drawer.jsx
try { (() => {
function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  icon = null,
  iconTone = 'info',
  closeOnScrim = true,
  showClose = true,
  style = {}
}) {
  if (!open) return null;
  const tones = {
    info: {
      c: 'var(--blue-600)',
      bg: 'var(--info-50)'
    },
    success: {
      c: 'var(--green-600)',
      bg: 'var(--green-50)'
    },
    warning: {
      c: 'var(--amber-600)',
      bg: 'var(--amber-50)'
    },
    danger: {
      c: 'var(--red-600)',
      bg: 'var(--red-50)'
    },
    neutral: {
      c: 'var(--slate-600)',
      bg: 'var(--surface-sunken)'
    }
  };
  const t = tones[iconTone] || tones.info;
  return /*#__PURE__*/React.createElement("div", {
    className: 'avl-drawer avl-drawer--' + size,
    role: "dialog",
    "aria-modal": "true",
    "aria-label": title || 'Side panel',
    style: {
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "avl-drawer__scrim",
    onClick: closeOnScrim ? onClose : undefined
  }), /*#__PURE__*/React.createElement("div", {
    className: "avl-drawer__panel",
    style: {
      background: 'var(--surface-card)',
      borderInlineStart: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-xl)',
      overflow: 'hidden',
      ...style
    }
  }, (title || icon || showClose) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '18px 20px',
      borderBottom: '1px solid var(--border-subtle)',
      flexShrink: 0
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '38px',
      height: '38px',
      flexShrink: 0,
      borderRadius: 'var(--radius-md)',
      background: t.bg,
      color: t.c,
      fontSize: '20px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: typeof icon === 'string' ? icon : ''
  }, typeof icon !== 'string' ? icon : null)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      paddingTop: icon ? '2px' : 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-title)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--text-strong)',
      letterSpacing: 'var(--ls-heading)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-xs)',
      color: 'var(--text-muted)',
      marginTop: '2px'
    }
  }, subtitle)), showClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--text-muted)',
      fontSize: '18px',
      lineHeight: 1,
      padding: '2px',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti ti-x"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "avl-drawer__body",
    style: {
      padding: '20px',
      fontSize: 'var(--fs-body)',
      color: 'var(--text-body)',
      lineHeight: 'var(--lh-normal)'
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    className: "avl-drawer__footer",
    style: {
      padding: '14px 20px',
      borderTop: '1px solid var(--border-subtle)',
      flexShrink: 0
    }
  }, footer)));
}
Object.assign(__ds_scope, { Drawer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/Drawer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/erp/AccountFormScreen.jsx
try { (() => {
// AVELYNQ ERP — Account form (create / edit)
function AccountFormScreen({
  onBack
}) {
  const {
    Card,
    Button,
    Input,
    Select,
    Switch,
    Checkbox,
    Badge,
    Tabs,
    Dialog
  } = window.AVELONDesignSystem_a21abd;
  const [tab, setTab] = React.useState('details');
  const [confirm, setConfirm] = React.useState(false);
  const SectionTitle = ({
    children,
    hint
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '14px',
      fontWeight: 600,
      color: 'var(--text-strong)',
      margin: 0
    }
  }, children), hint && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '12px',
      color: 'var(--text-muted)',
      margin: '2px 0 0'
    }
  }, hint));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--page-pad)',
      fontFamily: 'var(--font-sans)',
      maxWidth: '980px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-sans)',
      fontSize: '13px',
      fontWeight: 500,
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti ti-arrow-left"
  }), " Back"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--border-default)'
    }
  }, "/"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '13px',
      color: 'var(--text-muted)'
    }
  }, "Finance \xB7 General Ledger \xB7 Chart of Accounts")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      rowGap: '12px',
      flexWrap: 'wrap',
      marginBottom: '18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: '22px',
      fontWeight: 700,
      color: 'var(--text-strong)',
      letterSpacing: '-0.01em',
      margin: 0
    }
  }, "New Account"), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral",
    variant: "outline"
  }, "Draft")), /*#__PURE__*/React.createElement("div", {
    className: "avl-cluster"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => setConfirm(true)
  }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement("i", {
      className: "ti ti-device-floppy"
    }),
    onClick: onBack
  }, "Save Account"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '18px'
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    tabs: [{
      id: 'details',
      label: 'Details',
      icon: 'ti ti-file-description'
    }, {
      id: 'classification',
      label: 'Classification',
      icon: 'ti ti-category'
    }, {
      id: 'settings',
      label: 'Settings',
      icon: 'ti ti-settings'
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '18px'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Identity",
    padding: "lg"
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    hint: "The unique code and display name used across the ledger."
  }, "Account identity"), /*#__PURE__*/React.createElement("div", {
    className: "avl-grid avl-grid--2"
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Account Code",
    mono: true,
    iconLeft: "ti ti-hash",
    value: "5300-0100",
    required: true,
    hint: "Format: NNNN-NNNN"
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Parent Account",
    value: "5000-0000",
    options: [{
      value: '5000-0000',
      label: '5000-0000 · Expenses'
    }],
    required: true
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Account Name (EN)",
    value: "Marketing & Advertising",
    required: true
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Account Name (AR)",
    value: "\u0627\u0644\u062A\u0633\u0648\u064A\u0642 \u0648\u0627\u0644\u0625\u0639\u0644\u0627\u0646",
    required: true,
    style: {
      direction: 'rtl'
    }
  }))), /*#__PURE__*/React.createElement(Card, {
    title: "Classification",
    padding: "lg"
  }, /*#__PURE__*/React.createElement("div", {
    className: "avl-grid avl-grid--3"
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Account Type",
    value: "Expense",
    required: true,
    options: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Currency",
    value: "SAR",
    required: true,
    options: ['SAR', 'USD', 'EUR', 'AED']
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Normal Balance",
    value: "Debit",
    options: ['Debit', 'Credit']
  }))), /*#__PURE__*/React.createElement(Card, {
    title: "Settings",
    padding: "lg"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: '14px',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, "Active"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: 'var(--text-muted)'
    }
  }, "Available for posting in the current period.")), /*#__PURE__*/React.createElement(Switch, {
    checked: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: '14px',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, "Allow manual journals"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: 'var(--text-muted)'
    }
  }, "Users may post entries directly to this account.")), /*#__PURE__*/React.createElement(Switch, {
    checked: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '14px',
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, "Reconcilable"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: 'var(--text-muted)'
    }
  }, "Include in period-end reconciliation.")), /*#__PURE__*/React.createElement(Switch, null))))), /*#__PURE__*/React.createElement(Dialog, {
    open: confirm,
    onClose: () => setConfirm(false),
    size: "sm",
    icon: "ti ti-alert-triangle",
    iconTone: "warning",
    title: "Discard changes?",
    subtitle: "New Account \xB7 unsaved",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: () => setConfirm(false)
    }, "Keep editing"), /*#__PURE__*/React.createElement(Button, {
      variant: "danger",
      iconLeft: /*#__PURE__*/React.createElement("i", {
        className: "ti ti-trash"
      }),
      onClick: onBack
    }, "Discard"))
  }, "Your edits to this account haven\u2019t been saved. If you leave now, they will be lost."));
}
Object.assign(window, {
  AccountFormScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/erp/AccountFormScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/erp/AccountsScreen.jsx
try { (() => {
// AVELYNQ ERP — Chart of Accounts (list / search)
function AccountsScreen({
  onOpenForm
}) {
  const {
    Card,
    Button,
    Badge,
    IconButton,
    Input,
    Select,
    Drawer
  } = window.AVELONDesignSystem_a21abd;
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [detail, setDetail] = React.useState(null);
  const [query, setQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');
  const rows = window.AVL_ACCOUNTS.filter(a => (!query || a.name.toLowerCase().includes(query.toLowerCase()) || a.code.includes(query)) && (!typeFilter || a.type === typeFilter));
  const DetailRow = ({
    k,
    v,
    mono
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '10px 0',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '13px',
      color: 'var(--text-muted)'
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '13px',
      fontWeight: 600,
      color: 'var(--text-strong)',
      fontFamily: mono ? 'var(--font-mono)' : 'inherit'
    }
  }, v));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--page-pad)',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "avl-pagehead",
    style: {
      marginBottom: '18px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: 'var(--text-subtle)',
      marginBottom: '3px'
    }
  }, "Finance \xB7 General Ledger"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'clamp(19px, 2.4vw, 22px)',
      fontWeight: 700,
      color: 'var(--text-strong)',
      letterSpacing: '-0.01em',
      margin: 0
    }
  }, "Chart of Accounts")), /*#__PURE__*/React.createElement("div", {
    className: "avl-cluster"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "md",
    iconLeft: /*#__PURE__*/React.createElement("i", {
      className: "ti ti-binary-tree"
    })
  }, "Tree view"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "md",
    iconLeft: /*#__PURE__*/React.createElement("i", {
      className: "ti ti-filter"
    }),
    onClick: () => setFiltersOpen(true)
  }, "Filters"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md",
    iconLeft: /*#__PURE__*/React.createElement("i", {
      className: "ti ti-plus"
    }),
    onClick: onOpenForm
  }, "Add Account"))), /*#__PURE__*/React.createElement(Card, {
    padding: "none"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px',
      rowGap: '10px',
      padding: '14px 18px',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 240px'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    iconLeft: "ti ti-search",
    placeholder: "Search by code or name\u2026",
    value: query,
    onChange: e => setQuery(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 160px',
      maxWidth: '220px'
    }
  }, /*#__PURE__*/React.createElement(Select, {
    placeholder: "All types",
    value: typeFilter,
    onChange: e => setTypeFilter(e.target.value),
    options: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense', 'Header']
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-mono)'
    }
  }, rows.length, " of ", window.AVL_ACCOUNTS.length), /*#__PURE__*/React.createElement(IconButton, {
    icon: "ti ti-download",
    label: "Export",
    variant: "outline"
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: "ti ti-refresh",
    label: "Refresh",
    variant: "outline"
  })), /*#__PURE__*/React.createElement("div", {
    className: "avl-table-scroll"
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, ['Code', 'Account Name', 'Type', 'Currency', 'Balance', 'Status', ''].map((h, i) => /*#__PURE__*/React.createElement("th", {
    key: i,
    style: {
      textAlign: i === 4 ? 'right' : 'left',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      color: 'var(--text-subtle)',
      padding: '11px 18px',
      borderBottom: '1px solid var(--border-default)',
      background: 'var(--surface-page)',
      whiteSpace: 'nowrap',
      position: 'sticky',
      top: 0
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((a, i) => /*#__PURE__*/React.createElement("tr", {
    key: a.code,
    onClick: () => a.type !== 'Header' && setDetail(a),
    style: {
      borderBottom: '1px solid var(--border-subtle)',
      background: a.type === 'Header' ? 'var(--surface-page)' : '#fff',
      cursor: a.type === 'Header' ? 'default' : 'pointer'
    },
    onMouseEnter: e => {
      if (a.type !== 'Header') e.currentTarget.style.background = 'var(--surface-hover)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = a.type === 'Header' ? 'var(--surface-page)' : '#fff';
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 18px',
      fontFamily: 'var(--font-mono)',
      fontSize: '13px',
      color: 'var(--text-strong)',
      fontWeight: a.type === 'Header' ? 600 : 400,
      whiteSpace: 'nowrap'
    }
  }, a.code), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 18px',
      fontSize: '14px',
      color: 'var(--text-strong)',
      fontWeight: a.type === 'Header' ? 700 : 500
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      paddingInlineStart: a.level * 16 + 'px'
    }
  }, a.name)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 18px'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: window.AVL_TYPE_TONE[a.type]
  }, a.type)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 18px',
      fontFamily: 'var(--font-mono)',
      fontSize: '13px',
      color: 'var(--text-muted)'
    }
  }, a.cur), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 18px',
      textAlign: 'right',
      fontFamily: 'var(--font-mono)',
      fontSize: '13px',
      fontWeight: 500,
      color: a.balance == null ? 'var(--text-subtle)' : a.balance < 0 ? 'var(--red-600)' : 'var(--text-strong)'
    }
  }, window.AVL_FMT(a.balance)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 18px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px',
      fontWeight: 500,
      color: a.status === 'Active' ? 'var(--green-600)' : 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '7px',
      height: '7px',
      borderRadius: '50%',
      background: a.status === 'Active' ? 'var(--green-500)' : 'var(--slate-400)'
    }
  }), a.status)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '8px 14px',
      textAlign: 'right',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "ti ti-pencil",
    label: "Edit",
    variant: "ghost",
    size: "sm",
    onClick: e => {
      e.stopPropagation();
      onOpenForm();
    }
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: "ti ti-dots-vertical",
    label: "More",
    variant: "ghost",
    size: "sm",
    onClick: e => e.stopPropagation()
  }))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '10px',
      padding: '12px 18px',
      borderTop: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: 'var(--text-muted)'
    }
  }, "Showing 1\u2013", rows.length, " of ", window.AVL_ACCOUNTS.length, " accounts"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '6px',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "ti ti-chevron-left",
    label: "Previous",
    variant: "outline",
    size: "sm"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '30px',
      height: '30px',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--brand-primary)',
      color: '#fff',
      fontFamily: 'var(--font-mono)',
      fontSize: '13px',
      fontWeight: 600
    }
  }, "1"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '30px',
      height: '30px',
      fontFamily: 'var(--font-mono)',
      fontSize: '13px',
      color: 'var(--text-muted)'
    }
  }, "2"), /*#__PURE__*/React.createElement(IconButton, {
    icon: "ti ti-chevron-right",
    label: "Next",
    variant: "outline",
    size: "sm"
  })))), /*#__PURE__*/React.createElement(Drawer, {
    open: filtersOpen,
    onClose: () => setFiltersOpen(false),
    size: "sm",
    icon: "ti ti-filter",
    title: "Filter accounts",
    subtitle: "Finance \xB7 General Ledger",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: () => {
        setTypeFilter('');
      }
    }, "Reset"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement("i", {
        className: "ti ti-check"
      }),
      onClick: () => setFiltersOpen(false)
    }, "Apply filters"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Account type",
    placeholder: "All types",
    value: typeFilter,
    onChange: e => setTypeFilter(e.target.value),
    options: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense', 'Header']
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Status",
    placeholder: "Any status",
    options: ['Active', 'Inactive']
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Currency",
    placeholder: "e.g. SAR"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Balance \u2265",
    mono: true,
    suffix: "SAR",
    placeholder: "0.00"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Balance \u2264",
    mono: true,
    suffix: "SAR",
    placeholder: "0.00"
  }))), /*#__PURE__*/React.createElement(Drawer, {
    open: !!detail,
    onClose: () => setDetail(null),
    size: "md",
    icon: "ti ti-file-description",
    title: detail ? detail.name : '',
    subtitle: detail ? detail.code + ' · ' + detail.type : '',
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: () => setDetail(null)
    }, "Close"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement("i", {
        className: "ti ti-pencil"
      }),
      onClick: () => {
        setDetail(null);
        onOpenForm();
      }
    }, "Edit account"))
  }, detail && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      marginBottom: '16px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: window.AVL_TYPE_TONE[detail.type]
  }, detail.type), /*#__PURE__*/React.createElement(Badge, {
    tone: detail.status === 'Active' ? 'success' : 'neutral',
    icon: detail.status === 'Active' ? 'ti ti-circle-check' : 'ti ti-circle-minus'
  }, detail.status)), /*#__PURE__*/React.createElement(DetailRow, {
    k: "Account code",
    v: detail.code,
    mono: true
  }), /*#__PURE__*/React.createElement(DetailRow, {
    k: "Account name",
    v: detail.name
  }), /*#__PURE__*/React.createElement(DetailRow, {
    k: "Type",
    v: detail.type
  }), /*#__PURE__*/React.createElement(DetailRow, {
    k: "Currency",
    v: detail.cur,
    mono: true
  }), /*#__PURE__*/React.createElement(DetailRow, {
    k: "Balance",
    v: window.AVL_FMT(detail.balance),
    mono: true
  }), /*#__PURE__*/React.createElement(DetailRow, {
    k: "Status",
    v: detail.status
  }))));
}
Object.assign(window, {
  AccountsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/erp/AccountsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/erp/DashboardScreen.jsx
try { (() => {
// AVELYNQ ERP — Dashboard screen
function DashboardScreen({
  onNavigate
}) {
  const {
    Card,
    Stat,
    Badge,
    Button
  } = window.AVELONDesignSystem_a21abd;
  const modules = [{
    id: 'accounts',
    label: 'Chart of Accounts',
    desc: 'General ledger structure',
    icon: 'ti ti-calculator',
    accent: 'var(--blue-500)'
  }, {
    id: 'journals',
    label: 'Journals',
    desc: 'Post and review entries',
    icon: 'ti ti-book',
    accent: 'var(--teal-500)'
  }, {
    id: 'users',
    label: 'User Management',
    desc: 'Accounts and access',
    icon: 'ti ti-users',
    accent: 'var(--slate-500)'
  }, {
    id: 'roles',
    label: 'Roles & Access',
    desc: 'Permission control',
    icon: 'ti ti-shield-lock',
    accent: 'var(--blue-700)'
  }, {
    id: 'master',
    label: 'Master Data',
    desc: 'Lookups and references',
    icon: 'ti ti-database',
    accent: 'var(--teal-600)'
  }, {
    id: 'reports',
    label: 'Reports',
    desc: 'Financial statements',
    icon: 'ti ti-chart-bar',
    accent: 'var(--amber-600)'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--page-pad)',
      fontFamily: 'var(--font-sans)',
      maxWidth: '1280px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--navy-850)',
      borderRadius: 'var(--radius-xl)',
      padding: '26px 30px',
      marginBottom: '22px',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(80% 120% at 100% 0%, color-mix(in srgb, var(--blue-600) 34%, transparent), transparent 55%), radial-gradient(60% 100% at 92% 100%, color-mix(in srgb, var(--teal-600) 24%, transparent), transparent 60%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px',
      flexWrap: 'wrap',
      rowGap: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--teal-400)',
      marginBottom: '8px'
    }
  }, "Wednesday \xB7 13 June 2026"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'clamp(22px, 3.4vw, 28px)',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      margin: '0 0 6px'
    }
  }, "Welcome back, Khalid"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '14px',
      color: 'rgba(255,255,255,0.68)',
      margin: 0
    }
  }, "Your enterprise overview. Period ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: '#fff',
      fontWeight: 600
    }
  }, "FY26 \xB7 Q2"), " is open for posting.")), /*#__PURE__*/React.createElement(Button, {
    variant: "inverse",
    iconLeft: /*#__PURE__*/React.createElement("i", {
      className: "ti ti-file-plus"
    })
  }, "New Journal"))), /*#__PURE__*/React.createElement("div", {
    className: "avl-grid avl-grid--stats",
    style: {
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "Total Assets",
    value: "48.2M",
    delta: "+3.1%",
    accent: "blue",
    icon: "ti ti-building-bank"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Open Journals",
    value: "1,284",
    delta: "+12 today",
    accent: "teal",
    icon: "ti ti-book"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Pending Approval",
    value: "37",
    delta: "-5",
    deltaTone: "success",
    accent: "amber",
    icon: "ti ti-clock-hour-4"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Period Variance",
    value: "2.4%",
    delta: "within target",
    deltaTone: "neutral",
    accent: "slate",
    icon: "ti ti-activity"
  })), /*#__PURE__*/React.createElement("div", {
    className: "avl-grid avl-grid--split"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: '15px',
      fontWeight: 600,
      color: 'var(--text-strong)',
      margin: 0
    }
  }, "Quick Access"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: 'var(--text-muted)'
    }
  }, "Based on your permissions")), /*#__PURE__*/React.createElement("div", {
    className: "avl-grid avl-grid--2",
    style: {
      gap: '12px'
    }
  }, modules.map(m => /*#__PURE__*/React.createElement("button", {
    key: m.id,
    onClick: () => onNavigate(m.id),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      textAlign: 'left',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px',
      cursor: 'pointer',
      boxShadow: 'var(--shadow-sm)',
      transition: 'box-shadow var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard)'
    },
    onMouseEnter: e => {
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      e.currentTarget.style.transform = 'none';
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '42px',
      height: '42px',
      borderRadius: 'var(--radius-md)',
      background: 'color-mix(in srgb, ' + m.accent + ' 12%, transparent)',
      color: m.accent,
      fontSize: '20px',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: m.icon
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: '14px',
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, m.label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: '12px',
      color: 'var(--text-muted)',
      marginTop: '2px'
    }
  }, m.desc)), /*#__PURE__*/React.createElement("i", {
    className: "ti ti-chevron-right",
    style: {
      color: 'var(--text-subtle)'
    }
  }))))), /*#__PURE__*/React.createElement(Card, {
    title: "Recent Activity",
    actions: /*#__PURE__*/React.createElement("a", {
      href: "javascript:void(0)",
      style: {
        fontSize: '12px',
        color: 'var(--text-link)',
        textDecoration: 'none',
        fontWeight: 500
      }
    }, "View all"),
    padding: "none"
  }, /*#__PURE__*/React.createElement("div", null, window.AVL_ACTIVITY.map((a, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: '12px',
      padding: '13px 18px',
      borderBottom: i < window.AVL_ACTIVITY.length - 1 ? '1px solid var(--border-subtle)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      background: 'color-mix(in srgb, ' + a.tone + ' 12%, transparent)',
      color: a.tone,
      fontSize: '15px',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: a.icon
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '13px',
      color: 'var(--text-body)',
      lineHeight: 1.4
    }
  }, a.text), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      color: 'var(--text-subtle)',
      marginTop: '3px'
    }
  }, a.who, " \xB7 ", a.time))))))));
}
Object.assign(window, {
  DashboardScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/erp/DashboardScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/erp/LoginScreen.jsx
try { (() => {
// AVELYNQ ERP — Login screen
function LoginScreen({
  onLogin,
  lang,
  onToggleLang
}) {
  const {
    Button,
    Input,
    Checkbox
  } = window.AVELONDesignSystem_a21abd;
  const [role, setRole] = React.useState('approver');
  const roles = [{
    id: 'approver',
    label: 'Finance Approver'
  }, {
    id: 'admin',
    label: 'System Admin'
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "avl-split",
    style: {
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "avl-split__aside",
    style: {
      background: 'var(--navy-850)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '48px 52px',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(120% 80% at 100% 0%, color-mix(in srgb, var(--blue-600) 30%, transparent), transparent 60%), radial-gradient(90% 70% at 0% 100%, color-mix(in srgb, var(--teal-600) 22%, transparent), transparent 60%)'
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/avelynq-lockup-dark.png",
    alt: "AVELYNQ",
    style: {
      height: '82px',
      width: 'auto',
      position: 'relative',
      alignSelf: 'flex-start'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: 'var(--teal-400)',
      marginBottom: '14px'
    }
  }, "Enterprise Resource Planning"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'clamp(27px, 4vw, 38px)',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.12,
      margin: 0
    }
  }, "Built to Grow.", /*#__PURE__*/React.createElement("br", null), "Designed to Endure."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '15px',
      color: 'rgba(255,255,255,0.7)',
      lineHeight: 1.6,
      maxWidth: '420px',
      marginTop: '16px'
    }
  }, "Systems built to grow \u2014 without breaking what already works."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px',
      marginTop: '26px'
    }
  }, ['Structure', 'Growth', 'Stability'].map(p => /*#__PURE__*/React.createElement("span", {
    key: p,
    style: {
      fontSize: '12px',
      fontWeight: 600,
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: 'var(--radius-pill)',
      padding: '5px 14px'
    }
  }, p)))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      fontSize: '12px',
      color: 'rgba(255,255,255,0.4)'
    }
  }, "\xA9 2026 AVELYNQ \xB7 Enterprise Systems")), /*#__PURE__*/React.createElement("div", {
    className: "avl-split__main",
    style: {
      background: 'var(--surface-card)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(24px, 5vw, 40px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: '380px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "avl-only-md-down",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '11px',
      marginBottom: '22px'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/avelynq-mark-dark.png",
    alt: "",
    style: {
      height: '30px',
      width: 'auto',
      background: 'var(--navy-850)',
      borderRadius: '7px',
      padding: '3px'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: '20px',
      letterSpacing: '0.04em',
      color: 'var(--text-strong)'
    }
  }, "AVEL", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-500)'
    }
  }, "Y"), "NQ")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onToggleLang,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      height: '34px',
      padding: '0 12px',
      background: '#fff',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontSize: '13px',
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti ti-language"
  }), " ", lang === 'en' ? 'العربية' : 'English')), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: '26px',
      fontWeight: 700,
      color: 'var(--text-strong)',
      letterSpacing: '-0.01em',
      margin: '0 0 4px'
    }
  }, "Sign in"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '14px',
      color: 'var(--text-muted)',
      margin: '0 0 24px'
    }
  }, "Access your AVELYNQ workspace."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px',
      marginBottom: '22px'
    }
  }, roles.map(r => /*#__PURE__*/React.createElement("button", {
    key: r.id,
    onClick: () => setRole(r.id),
    style: {
      padding: '10px',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      border: '1px solid ' + (role === r.id ? 'var(--brand-primary)' : 'var(--border-default)'),
      background: role === r.id ? 'var(--blue-50)' : '#fff',
      color: role === r.id ? 'var(--blue-700)' : 'var(--text-body)',
      fontFamily: 'var(--font-sans)',
      fontSize: '13px',
      fontWeight: 600
    }
  }, r.label))), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      onLogin();
    },
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Username",
    iconLeft: "ti ti-user",
    value: "k.almutairi",
    placeholder: "Enter your username"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Password",
    type: "password",
    iconLeft: "ti ti-lock",
    value: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    placeholder: "Enter your password"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Remember me",
    checked: true
  }), /*#__PURE__*/React.createElement("a", {
    href: "javascript:void(0)",
    style: {
      fontSize: '13px',
      color: 'var(--text-link)',
      textDecoration: 'none',
      fontWeight: 500
    }
  }, "Forgot password?")), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    block: true,
    size: "lg",
    iconRight: /*#__PURE__*/React.createElement("i", {
      className: "ti ti-arrow-right"
    })
  }, "Sign in")))));
}
Object.assign(window, {
  LoginScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/erp/LoginScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/erp/Shell.jsx
try { (() => {
// AVELYNQ ERP — app shell: Sidebar + Topbar
const {
  Avatar,
  IconButton,
  Badge
} = window.AVELONDesignSystem_a21abd;
function Sidebar({
  active,
  onNavigate,
  open,
  onClose
}) {
  const [openGroups, setOpenGroups] = React.useState({
    finance: true
  });
  const toggle = id => setOpenGroups(g => ({
    ...g,
    [id]: !g[id]
  }));
  return /*#__PURE__*/React.createElement("aside", {
    className: 'avl-sidebar' + (open ? ' is-open' : ''),
    style: {
      width: 'var(--sidebar-width)',
      flexShrink: 0,
      background: 'var(--navy-850)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      borderRight: '1px solid var(--border-inverse)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 'var(--topbar-height)',
      display: 'flex',
      alignItems: 'center',
      gap: '11px',
      padding: '0 20px',
      borderBottom: '1px solid var(--border-inverse)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/avelynq-mark-dark.png",
    alt: "",
    style: {
      height: '30px',
      width: 'auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: '19px',
      letterSpacing: '0.04em',
      color: '#fff'
    }
  }, "AVEL", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-400)'
    }
  }, "Y"), "NQ"), /*#__PURE__*/React.createElement("button", {
    className: "avl-menu-btn",
    onClick: onClose,
    "aria-label": "Close menu",
    style: {
      marginInlineStart: 'auto',
      background: 'none',
      border: 'none',
      color: 'rgba(255,255,255,0.7)',
      cursor: 'pointer',
      fontSize: '20px',
      padding: '4px',
      lineHeight: 1
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti ti-x"
  }))), /*#__PURE__*/React.createElement("nav", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '14px 12px'
    }
  }, window.AVL_NAV.map(sec => /*#__PURE__*/React.createElement("div", {
    key: sec.group,
    style: {
      marginBottom: '18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '10px',
      fontWeight: 600,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.38)',
      padding: '0 10px 8px'
    }
  }, sec.group), sec.items.map(item => {
    const hasChildren = !!item.children;
    const isActive = active === item.id || hasChildren && item.children.some(c => c.id === active);
    const isOpen = openGroups[item.id];
    return /*#__PURE__*/React.createElement("div", {
      key: item.id
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => hasChildren ? toggle(item.id) : onNavigate(item.id),
      style: navItemStyle(isActive && !hasChildren),
      onMouseEnter: e => {
        if (!(isActive && !hasChildren)) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
      },
      onMouseLeave: e => {
        if (!(isActive && !hasChildren)) e.currentTarget.style.background = 'transparent';
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: item.icon,
      style: {
        fontSize: '18px',
        width: '20px',
        color: isActive ? 'var(--teal-400)' : 'rgba(255,255,255,0.6)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        textAlign: 'left'
      }
    }, item.label), hasChildren && /*#__PURE__*/React.createElement("i", {
      className: isOpen ? 'ti ti-chevron-down' : 'ti ti-chevron-right',
      style: {
        fontSize: '15px',
        opacity: 0.5
      }
    })), hasChildren && isOpen && /*#__PURE__*/React.createElement("div", {
      style: {
        margin: '2px 0 4px',
        paddingInlineStart: '30px'
      }
    }, item.children.map(c => {
      const childActive = active === c.id;
      return /*#__PURE__*/React.createElement("button", {
        key: c.id,
        onClick: () => onNavigate(c.id),
        style: subItemStyle(childActive),
        onMouseEnter: e => {
          if (!childActive) e.currentTarget.style.color = '#fff';
        },
        onMouseLeave: e => {
          if (!childActive) e.currentTarget.style.color = 'rgba(255,255,255,0.62)';
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: childActive ? 'var(--teal-400)' : 'rgba(255,255,255,0.3)',
          flexShrink: 0
        }
      }), c.label);
    })));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px',
      borderTop: '1px solid var(--border-inverse)',
      fontSize: '10px',
      color: 'rgba(255,255,255,0.4)',
      letterSpacing: '0.1em',
      textTransform: 'uppercase'
    }
  }, "Built to Grow \xB7 v2.4"));
}
function navItemStyle(active) {
  return {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    width: '100%',
    padding: '9px 10px',
    marginBottom: '2px',
    background: active ? 'rgba(36,102,216,0.18)' : 'transparent',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    fontWeight: active ? 600 : 500,
    color: active ? '#fff' : 'rgba(255,255,255,0.78)',
    boxShadow: active ? 'inset 2px 0 0 var(--teal-400)' : 'none',
    transition: 'background var(--dur-fast) var(--ease-standard)'
  };
}
function subItemStyle(active) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '7px 10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    fontWeight: active ? 600 : 400,
    color: active ? '#fff' : 'rgba(255,255,255,0.62)',
    textAlign: 'left',
    transition: 'color var(--dur-fast) var(--ease-standard)'
  };
}
function Topbar({
  title,
  breadcrumb,
  lang,
  onToggleLang,
  onLogout,
  onMenu
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      height: 'var(--topbar-height)',
      flexShrink: 0,
      background: '#fff',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      gap: 'clamp(8px, 1.4vw, 16px)',
      padding: '0 clamp(12px, 2vw, 22px)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "avl-menu-btn",
    onClick: onMenu,
    "aria-label": "Open menu",
    style: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '38px',
      height: '38px',
      flexShrink: 0,
      background: 'transparent',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      color: 'var(--text-body)',
      cursor: 'pointer',
      fontSize: '19px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti ti-menu-2"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, breadcrumb && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      color: 'var(--text-subtle)',
      marginBottom: '1px',
      fontFamily: 'var(--font-sans)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, breadcrumb), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: '16px',
      fontWeight: 600,
      color: 'var(--text-strong)',
      letterSpacing: 'var(--ls-heading)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, title)), /*#__PURE__*/React.createElement("div", {
    className: "avl-hide-md-down",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      maxWidth: '340px',
      flex: '0 1 320px',
      height: '38px',
      padding: '0 12px',
      background: 'var(--surface-page)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti ti-search",
    style: {
      color: 'var(--text-subtle)',
      fontSize: '16px'
    }
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Search accounts, journals, users\u2026",
    style: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      background: 'transparent',
      outline: 'none',
      fontFamily: 'var(--font-sans)',
      fontSize: '13px',
      color: 'var(--text-body)'
    }
  }), /*#__PURE__*/React.createElement("kbd", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '10px',
      color: 'var(--text-subtle)',
      border: '1px solid var(--border-default)',
      borderRadius: '4px',
      padding: '1px 5px'
    }
  }, "\u2318K")), /*#__PURE__*/React.createElement("button", {
    onClick: onToggleLang,
    title: "Switch language",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      height: '38px',
      padding: '0 12px',
      flexShrink: 0,
      background: '#fff',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontSize: '13px',
      fontWeight: 500,
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti ti-language",
    style: {
      fontSize: '17px'
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "avl-hide-sm-down"
  }, lang === 'en' ? 'العربية' : 'English')), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "ti ti-bell",
    label: "Notifications",
    variant: "ghost"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: '5px',
      insetInlineEnd: '6px',
      width: '7px',
      height: '7px',
      borderRadius: '50%',
      background: 'var(--red-500)',
      border: '1.5px solid #fff'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '9px',
      flexShrink: 0,
      paddingInlineStart: '6px',
      borderInlineStart: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Khalid Al-Mutairi",
    size: "sm"
  }), /*#__PURE__*/React.createElement("div", {
    className: "avl-hide-sm-down",
    style: {
      lineHeight: 1.25
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: '13px',
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, "K. Al-Mutairi"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: '11px',
      color: 'var(--text-muted)'
    }
  }, "Finance Approver")), /*#__PURE__*/React.createElement(IconButton, {
    icon: "ti ti-logout",
    label: "Sign out",
    variant: "ghost",
    size: "sm",
    onClick: onLogout
  })));
}
Object.assign(window, {
  Sidebar,
  Topbar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/erp/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/erp/data.js
try { (() => {
// AVELYNQ ERP — demo data (fake, for the UI kit recreation)
window.AVL_NAV = [{
  group: 'Overview',
  items: [{
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'ti ti-layout-dashboard'
  }]
}, {
  group: 'Modules',
  items: [{
    id: 'finance',
    label: 'Finance',
    icon: 'ti ti-building-bank',
    children: [{
      id: 'accounts',
      label: 'Chart of Accounts'
    }, {
      id: 'journals',
      label: 'Journals'
    }, {
      id: 'rules',
      label: 'Posting Rules'
    }]
  }, {
    id: 'hr',
    label: 'Human Resources',
    icon: 'ti ti-users'
  }, {
    id: 'inventory',
    label: 'Inventory',
    icon: 'ti ti-packages'
  }, {
    id: 'procurement',
    label: 'Procurement',
    icon: 'ti ti-shopping-cart'
  }, {
    id: 'sales',
    label: 'Sales',
    icon: 'ti ti-receipt'
  }, {
    id: 'maintenance',
    label: 'Maintenance',
    icon: 'ti ti-tools'
  }]
}, {
  group: 'Administration',
  items: [{
    id: 'master',
    label: 'Master Data',
    icon: 'ti ti-database'
  }, {
    id: 'security',
    label: 'Security',
    icon: 'ti ti-shield-lock',
    children: [{
      id: 'users',
      label: 'Users'
    }, {
      id: 'roles',
      label: 'Roles & Access'
    }, {
      id: 'pages',
      label: 'Pages Registry'
    }]
  }, {
    id: 'reports',
    label: 'Reports',
    icon: 'ti ti-chart-bar'
  }]
}];
window.AVL_ACCOUNTS = [{
  code: '1000-0000',
  name: 'Assets',
  type: 'Header',
  cur: '—',
  balance: null,
  status: 'Active',
  level: 0
}, {
  code: '1100-0000',
  name: 'Cash & Cash Equivalents',
  type: 'Asset',
  cur: 'SAR',
  balance: 482150.00,
  status: 'Active',
  level: 1
}, {
  code: '1100-0100',
  name: 'Petty Cash',
  type: 'Asset',
  cur: 'SAR',
  balance: 12400.00,
  status: 'Active',
  level: 2
}, {
  code: '1200-0000',
  name: 'Accounts Receivable',
  type: 'Asset',
  cur: 'SAR',
  balance: 938220.75,
  status: 'Active',
  level: 1
}, {
  code: '2000-0000',
  name: 'Liabilities',
  type: 'Header',
  cur: '—',
  balance: null,
  status: 'Active',
  level: 0
}, {
  code: '2100-0400',
  name: 'Accounts Payable',
  type: 'Liability',
  cur: 'SAR',
  balance: -128940.50,
  status: 'Active',
  level: 1
}, {
  code: '2300-0000',
  name: 'Accrued Expenses',
  type: 'Liability',
  cur: 'SAR',
  balance: -54300.00,
  status: 'Inactive',
  level: 1
}, {
  code: '3200-0100',
  name: 'Retained Earnings',
  type: 'Equity',
  cur: 'SAR',
  balance: 1204775.25,
  status: 'Active',
  level: 1
}, {
  code: '4000-0000',
  name: 'Operating Revenue',
  type: 'Revenue',
  cur: 'SAR',
  balance: 2840110.00,
  status: 'Active',
  level: 1
}, {
  code: '5100-0200',
  name: 'Salaries & Wages',
  type: 'Expense',
  cur: 'SAR',
  balance: -612480.00,
  status: 'Active',
  level: 1
}, {
  code: '5200-0300',
  name: 'Utilities',
  type: 'Expense',
  cur: 'SAR',
  balance: -38215.40,
  status: 'Active',
  level: 1
}, {
  code: '5400-0900',
  name: 'Depreciation',
  type: 'Expense',
  cur: 'SAR',
  balance: -97600.00,
  status: 'Inactive',
  level: 1
}];
window.AVL_TYPE_TONE = {
  Header: 'neutral',
  Asset: 'info',
  Liability: 'warning',
  Equity: 'accent',
  Revenue: 'success',
  Expense: 'danger'
};
window.AVL_ACTIVITY = [{
  icon: 'ti ti-circle-check',
  tone: 'var(--green-600)',
  text: 'Journal JV-2041 posted to General Ledger',
  who: 'Omar Faris',
  time: '12m ago'
}, {
  icon: 'ti ti-plus',
  tone: 'var(--blue-600)',
  text: 'New account 5200-0300 “Utilities” created',
  who: 'Layla Hassan',
  time: '1h ago'
}, {
  icon: 'ti ti-edit',
  tone: 'var(--teal-600)',
  text: 'Posting rule “Monthly Accruals” updated',
  who: 'Sara Noor',
  time: '3h ago'
}, {
  icon: 'ti ti-user-plus',
  tone: 'var(--slate-600)',
  text: 'User “k.almutairi” granted Finance Approver role',
  who: 'System',
  time: 'Yesterday'
}];
window.AVL_FMT = n => n == null ? '—' : new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(n);
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/erp/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Breadcrumb = __ds_scope.Breadcrumb;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Drawer = __ds_scope.Drawer;

})();
