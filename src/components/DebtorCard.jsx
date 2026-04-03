import { useState } from 'react'
import { formatCOP } from '../utils/format'
import Chip from './ui/Chip'
import DebtCard from './DebtCard'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function DebtorCard({ debtor, onAccept, onReject, onPay, onForgive }) {
  const [expanded, setExpanded] = useState(false)

  const netBalanceColor = debtor.netBalance > 0 
    ? 'var(--green)' 
    : debtor.netBalance < 0 
      ? 'var(--red)' 
      : 'var(--txt-muted)'

  const netBalancePrefix = debtor.netBalance > 0 ? '+' : ''

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      marginBottom: '8px',
      overflow: 'hidden',
    }}>
      {/* Card Principal - clickeable */}
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '14px 16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* Avatar */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: debtor.netBalance > 0 
            ? 'var(--green-bg)' 
            : debtor.netBalance < 0 
              ? 'var(--red-bg)' 
              : 'var(--bg-elevated)',
          color: debtor.netBalance > 0 
            ? 'var(--green)' 
            : debtor.netBalance < 0 
              ? 'var(--red)' 
              : 'var(--txt-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: '500',
          flexShrink: 0,
        }}>
          {debtor.username?.charAt(0).toUpperCase() || '?'}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--txt-primary)' }}>
              @{debtor.username}
            </span>
            {debtor.fullName && (
              <span style={{ fontSize: '11px', color: 'var(--txt-muted)' }}>
                {debtor.fullName}
              </span>
            )}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--txt-muted)' }}>
            {debtor.activeDebtsCount} deuda{debtor.activeDebtsCount !== 1 ? 's' : ''} activa{debtor.activeDebtsCount !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Balance */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: '500', color: netBalanceColor }}>
            {netBalancePrefix}{formatCOP(Math.abs(debtor.netBalance))}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--txt-muted)' }}>
            {debtor.netBalance > 0 ? 'Te debe' : debtor.netBalance < 0 ? 'Debes' : 'Saldos'}
          </div>
        </div>

        {/* Chevron */}
        <div style={{ color: 'var(--txt-muted)', flexShrink: 0 }}>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {/* Detalle expandido */}
      {expanded && (
        <div style={{ 
          borderTop: '1px solid var(--border)', 
          padding: '12px',
          background: 'var(--bg-base)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Resumen de saldos */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '8px',
            marginBottom: '8px'
          }}>
            <div style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '10px', color: 'var(--txt-muted)' }}>Me debe</div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--green)' }}>
                {formatCOP(debtor.totalOwedToMe)}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '10px', color: 'var(--txt-muted)' }}>Le debo</div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--red)' }}>
                {formatCOP(debtor.totalIOwe)}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '10px', color: 'var(--txt-muted)' }}>Pendientes</div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--amber)' }}>
                {debtor.pendingAcceptance}
              </div>
            </div>
          </div>

          {/* Deudas donde me debe */}
          {debtor.debtsAsCreditor.length > 0 && (
            <div>
              <div style={{ fontSize: '10px', fontWeight: '500', color: 'var(--txt-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Te debe
              </div>
              {debtor.debtsAsCreditor.map(debt => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  role="creditor"
                  onPay={onPay}
                  onForgive={onForgive}
                />
              ))}
            </div>
          )}

          {/* Deudas donde debo */}
          {debtor.debtsAsDebtor.length > 0 && (
            <div>
              <div style={{ fontSize: '10px', fontWeight: '500', color: 'var(--txt-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Le debes
              </div>
              {debtor.debtsAsDebtor.map(debt => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  role="debtor"
                  onAccept={onAccept}
                  onReject={onReject}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
