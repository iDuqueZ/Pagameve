import { useState } from 'react'
import { formatCOP } from '../utils/format'
import Input from './ui/Input'

export default function PaymentModal({ debt, onClose, onSubmit }) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await onSubmit(parseInt(amount), note)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: '14px',
        padding: '24px',
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: '15px', fontWeight: '500', color: 'var(--txt-primary)', margin: 0 }}>Registrar Pago</h2>
        
        {error && (
          <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red)', color: 'var(--red)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--txt-secondary)', display: 'block', marginBottom: '5px' }}>Monto</label>
            <input
              type="number"
              min="1"
              max={debt?.amount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
                color: 'var(--txt-primary)',
                fontSize: '13px',
                outline: 'none',
              }}
              required
            />
            <p style={{ fontSize: '10px', color: 'var(--txt-muted)', marginTop: '4px' }}>
              Deuda total: {formatCOP(debt?.amount || 0)}
            </p>
          </div>

          <Input
            label="Nota (opcional)"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej: Pago parcial"
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: 'var(--green)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? 'Guardando...' : 'Registrar Pago'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 12px',
                background: 'transparent',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--txt-secondary)',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
