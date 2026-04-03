export default function StatCard({ label, value, sub, color = 'var(--txt-primary)' }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '14px 16px',
    }}>
      <div style={{ fontSize: '11px', color: 'var(--txt-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
        {label}
      </div>
      <div style={{ fontSize: '22px', fontWeight: '500', lineHeight: 1, color }}>{value}</div>
      {sub && <div style={{ fontSize: '10px', color: 'var(--txt-muted)', marginTop: '4px' }}>{sub}</div>}
    </div>
  )
}
