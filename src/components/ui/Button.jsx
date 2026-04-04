export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: {
      background: 'var(--accent)',
      border: 'var(--accent)',
      color: '#fff',
      hoverBg: 'var(--accent-light)',
    },
    pay: {
      background: 'var(--green-bg)',
      border: 'var(--green)',
      color: 'var(--green)',
      hoverBg: '#133d28',
    },
    danger: {
      background: 'var(--red-bg)',
      border: 'var(--red)',
      color: 'var(--red)',
      hoverBg: '#3a1515',
    },
    accent: {
      background: 'var(--accent-bg)',
      border: 'var(--accent)',
      color: 'var(--accent-light)',
      hoverBg: '#251f4a',
    },
    ghost: {
      background: 'transparent',
      border: 'var(--border-strong)',
      color: 'var(--txt-secondary)',
      hoverBg: 'var(--bg-elevated)',
    },
  }

  const v = variants[variant] || variants.primary

  return (
    <button
      {...props}
      style={{
        padding: '5px 10px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '11px',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        border: `1px solid ${v.border}`,
        background: v.background,
        color: v.color,
        transition: 'background 0.15s',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        opacity: props.disabled ? 0.5 : 1,
        ...props.style,
      }}
      className={className}
      onMouseEnter={(e) => { if (!props.disabled) e.currentTarget.style.background = v.hoverBg }}
      onMouseLeave={(e) => { if (!props.disabled) e.currentTarget.style.background = v.background }}
    >
      {children}
    </button>
  )
}
