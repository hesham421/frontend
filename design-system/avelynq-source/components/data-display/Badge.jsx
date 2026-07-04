export function Badge({ children, tone = 'neutral', variant = 'soft', icon = null, style = {} }) {
  const tones = {
    neutral: { c: 'var(--status-neutral)', bg: 'var(--status-neutral-bg)', solid: 'var(--slate-600)' },
    info:    { c: 'var(--status-info)',    bg: 'var(--status-info-bg)',    solid: 'var(--blue-500)' },
    success: { c: 'var(--status-success)', bg: 'var(--status-success-bg)', solid: 'var(--green-600)' },
    warning: { c: 'var(--status-warning)', bg: 'var(--status-warning-bg)', solid: 'var(--amber-600)' },
    danger:  { c: 'var(--status-danger)',  bg: 'var(--status-danger-bg)',  solid: 'var(--red-600)' },
    accent:  { c: 'var(--teal-700)',       bg: 'var(--teal-50)',           solid: 'var(--teal-600)' },
  };
  const t = tones[tone] || tones.neutral;
  const styles = variant === 'solid'
    ? { background: t.solid, color: '#fff', border: '1px solid transparent' }
    : variant === 'outline'
    ? { background: 'transparent', color: t.c, border: '1px solid currentColor' }
    : { background: t.bg, color: t.c, border: '1px solid transparent' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      height: '22px', padding: '0 9px',
      fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-semibold)',
      fontFamily: 'var(--font-sans)', letterSpacing: '0.02em',
      borderRadius: 'var(--radius-sm)', whiteSpace: 'nowrap', lineHeight: 1,
      ...styles, ...style,
    }}>
      {icon && (typeof icon === 'string' ? <i className={icon} /> : icon)}
      {children}
    </span>
  );
}
