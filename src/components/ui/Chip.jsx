export const chipStyles = {
  pending_acceptance: { background: 'var(--amber-bg)', color: 'var(--amber)' },
  active: { background: 'var(--green-bg)', color: 'var(--green)' },
  paid: { background: '#1a2030', color: 'var(--txt-muted)' },
  forgiven: { background: 'var(--blue-bg)', color: 'var(--blue)' },
  rejected: { background: 'var(--red-bg)', color: 'var(--red)' },
}

export const chipLabels = {
  pending_acceptance: 'esperando',
  active: 'activa',
  paid: 'pagada',
  forgiven: 'perdonada',
  rejected: 'rechazada',
}

export default function Chip({ status }) {
  const style = chipStyles[status] || chipStyles.active
  const label = chipLabels[status] || status

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: '10px',
      fontWeight: '500',
      padding: '2px 7px',
      borderRadius: '99px',
      ...style
    }}>
      {label}
    </span>
  )
}
