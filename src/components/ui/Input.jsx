export default function Input({ label, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && <label style={{ fontSize: '11px', color: 'var(--txt-secondary)' }}>{label}</label>}
      <input
        {...props}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 10px',
          color: 'var(--txt-primary)',
          fontSize: '13px',
          outline: 'none',
          transition: 'border-color 0.15s',
          width: '100%',
          ...props.style,
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
      />
    </div>
  )
}
