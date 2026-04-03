import { useState } from 'react'
import PaymentModal from './PaymentModal'
import Chip from './ui/Chip'
import DebtAvatar from './ui/DebtAvatar'
import Button from './ui/Button'
import { formatCOP } from '../utils/format'
import { CheckCircle, Heart, ThumbsUp, ThumbsDown } from 'lucide-react'

export default function DebtCard({ debt, role, onAccept, onReject, onPay, onForgive }) {
  const [showPayments, setShowPayments] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const user = role === 'creditor' ? debt.debtor : debt.creditor
  const payments = debt.payments || []
  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
  const remaining = parseFloat(debt.amount) - totalPaid
  const requiresAction = debt.status === 'pending_acceptance' && role === 'debtor'
  const amountColor = debt.status === 'paid' || debt.status === 'forgiven' 
    ? 'var(--txt-muted)' 
    : role === 'creditor' ? 'var(--green)' : 'var(--red)'

  return (
    <>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '14px',
        marginBottom: '8px',
        transition: 'border-color 0.15s',
        borderLeft: requiresAction ? '2px solid var(--accent)' : undefined,
      }}>
        {/* Header - responsive flex */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', minWidth: 0 }}>
            <DebtAvatar name={user?.username} role={role} />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12.5px', fontWeight: '500', color: 'var(--txt-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.username || 'Usuario'}
                </span>
                <Chip status={debt.status} />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--txt-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                {user?.full_name}
              </span>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--txt-muted)', whiteSpace: 'nowrap' }}>
            {new Date(debt.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Description & Amount */}
        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontSize: '12.5px', color: 'var(--txt-secondary)', marginBottom: '6px', wordBreak: 'break-word' }}>{debt.description}</p>
          <div style={{ fontSize: '18px', fontWeight: '500', color: amountColor }}>
            {formatCOP(debt.amount)}
          </div>
          {debt.due_date && (
            <p style={{ fontSize: '10px', color: 'var(--txt-muted)', marginTop: '2px' }}>
              Vence: {new Date(debt.due_date).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {debt.status === 'active' && totalPaid > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--txt-muted)', marginBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
              <span>Abonado: {formatCOP(totalPaid)}</span>
              <span>Restante: {formatCOP(remaining)}</span>
            </div>
            <div style={{ height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                background: 'var(--green)',
                borderRadius: '2px',
                width: `${Math.min((totalPaid / parseFloat(debt.amount)) * 100, 100)}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}

        {/* Payments History */}
        {payments.length > 0 && (
          <div style={{ marginBottom: '12px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
            <button
              onClick={() => setShowPayments(!showPayments)}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '11px', cursor: 'pointer', padding: 0 }}
            >
              {showPayments ? '▼' : '▶'} Ver pagos ({payments.length})
            </button>
            {showPayments && (
              <ul style={{ marginTop: '8px', fontSize: '11px', color: 'var(--txt-secondary)', paddingLeft: '16px' }}>
                {payments.map((p) => (
                  <li key={p.id}>
                    {formatCOP(p.amount)} - {new Date(p.paid_at).toLocaleDateString()}
                    {p.note && <span style={{ color: 'var(--txt-muted)' }}> ({p.note})</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {debt.status === 'active' && role === 'creditor' && (
            <>
              <Button variant="pay" onClick={() => setShowPaymentModal(true)}>
                <CheckCircle size={13} strokeWidth={1.8} />
                Registrar pago
              </Button>
              <Button variant="ghost" onClick={() => {
                if (confirm('¿Estás seguro de perdonar esta deuda?')) onForgive?.(debt.id)
              }}>
                <Heart size={13} strokeWidth={1.8} />
                Perdonar
              </Button>
            </>
          )}
          {debt.status === 'pending_acceptance' && role === 'debtor' && (
            <>
              <Button variant="accent" onClick={() => onAccept?.(debt.id)}>
                <ThumbsUp size={13} strokeWidth={1.8} />
                Aceptar
              </Button>
              <Button variant="danger" onClick={() => onReject?.(debt.id)}>
                <ThumbsDown size={13} strokeWidth={1.8} />
                Rechazar
              </Button>
            </>
          )}
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          debt={debt}
          onClose={() => setShowPaymentModal(false)}
          onSubmit={(amount, note) => onPay?.(debt.id, amount, note)}
        />
      )}
    </>
  )
}
