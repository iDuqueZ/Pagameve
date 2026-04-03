export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      padding: '48px 20px',
      color: 'var(--txt-muted)',
      textAlign: 'center'
    }}>
      {Icon && <Icon size={32} strokeWidth={1} color="var(--txt-muted)" />}
      <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--txt-secondary)', marginTop: '8px' }}>{title}</p>
      <p style={{ fontSize: '12px', color: 'var(--txt-muted)', maxWidth: '220px', lineHeight: '1.5' }}>{subtitle}</p>
      {action}
    </div>
  )
}
