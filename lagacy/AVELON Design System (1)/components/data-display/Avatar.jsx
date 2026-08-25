export function Avatar({ name = '', src = null, size = 'md', square = false, style = {} }) {
  const dims = { xs: 24, sm: 30, md: 38, lg: 48 };
  const d = dims[size] || dims.md;
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  // deterministic brand-family tint from name
  const palette = ['var(--blue-600)', 'var(--teal-600)', 'var(--slate-600)', 'var(--blue-800)', 'var(--teal-700)'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % palette.length;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: d + 'px', height: d + 'px',
      borderRadius: square ? 'var(--radius-md)' : '50%',
      background: src ? 'transparent' : palette[h],
      color: '#fff', overflow: 'hidden', flexShrink: 0,
      fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-semibold)',
      fontSize: Math.round(d * 0.38) + 'px', letterSpacing: '0.01em',
      ...style,
    }}>
      {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </span>
  );
}
