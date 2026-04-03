import { formatCOP } from '../../utils/format'
import Chip from './Chip'

function getRelativeDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'hoy'
  if (diffDays === 1) return 'hace 1 día'
  if (diffDays < 7) return `hace ${diffDays} días`
  if (diffDays < 14) return 'hace 1 sem.'
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} sem.`
  if (diffDays < 60) return 'hace 1 mes'
  return `hace ${Math.floor(diffDays / 30)} meses`
}

function getAvatarStyle(status, isCreditor) {
  if (status === 'paid' || status === 'forgiven') {
    return { bg: 'var(--bg-card)', color: 'var(--txt-muted)' }
  }
  if (status === 'pending_acceptance') {
    return { bg: 'var(--amber-bg)', color: 'var(--amber)' }
  }
  if (isCreditor) {
    return { bg: 'var(--green-bg)', color: 'var(--green)' }
  }
  return { bg: 'var(--red-bg)', color: 'var(--red)' }
}

function getAmountStyle(status, isCreditor) {
  if (status === 'paid' || status === 'forgiven') {
    return 'var(--txt-secondary)'
  }
  return isCreditor ? 'var(--green)' : 'var(--red)'
}

export default function DebtRow({ debt, currentUserId }) {
  const isCreditor = debt.creditor_id === currentUserId
  const otherUser = isCreditor ? debt.debtor : debt.creditor
  const avatarStyle = getAvatarStyle(debt.status, isCreditor)
  const amountStyle = getAmountStyle(debt.status, isCreditor)
  const amountPrefix = isCreditor ? '+' : '-'
  
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '11px 14px',
      marginBottom: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      transition: 'border-color 0.15s',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)' }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      {/* Zona 1 - Avatar */}
      <div style={{
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        background: avatarStyle.bg,
        color: avatarStyle.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        fontWeight: '500',
        flexShrink: 0,
      }}>
        {otherUser?.username?.charAt(0).toUpperCase() || '?'}
      </div>

      {/* Zona 2 - Información central */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
          <span style={{ fontSize: '12.5px', fontWeight: '500', color: 'var(--txt-primary)' }}>
            {otherUser?.username || 'Usuario'}
          </span>
          <Chip status={debt.status} style={{ marginLeft: '6px' }} />
        </div>
        <div style={{ 
          fontSize: '11px', 
          color: 'var(--txt-muted)', 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          marginTop: '2px'
        }}>
          {debt.description}
        </div>
      </div>

      {/* Zona 3 - Monto y fecha */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: '500', color: amountStyle }}>
          {amountPrefix}{formatCOP(debt.amount)}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--txt-muted)', marginTop: '2px' }}>
          {getRelativeDate(debt.created_at)}
        </div>
      </div>
    </div>
  )
}

export function DebtRowSkeleton() {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '11px 14px',
      marginBottom: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    }}>
      <div style={{
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        background: 'var(--bg-elevated)',
        animation: 'pulse 1.2s ease-in-out infinite',
      }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ width: '120px', height: '12px', background: 'var(--bg-elevated)', borderRadius: '4px', animation: 'pulse 1.2s ease-in-out infinite' }} />
        <div style={{ width: '80px', height: '10px', background: 'var(--bg-elevated)', borderRadius: '4px', animation: 'pulse 1.2s ease-in-out infinite' }} />
      </div>
      <div style={{ width: '60px', height: '12px', background: 'var(--bg-elevated)', borderRadius: '4px', animation: 'pulse 1.2s ease-in-out infinite' }} />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
