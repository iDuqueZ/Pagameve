export default function DebtAvatar({ name, role }) {
  const initials = name?.charAt(0).toUpperCase() || '?'
  const bgColor = role === 'creditor' ? 'var(--green-bg)' : 'var(--red-bg)'
  const textColor = role === 'creditor' ? 'var(--green)' : 'var(--red)'

  return (
    <div style={{
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: bgColor,
      color: textColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: '500',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}
