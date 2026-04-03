import { useState, useEffect, useRef } from 'react'
import { formatCOP } from '../utils/format'
import Input from './ui/Input'

export default function PaymentModal({ debt, onClose, onSubmit }) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const modalRef = useRef(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 480)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

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
      padding: isMobile ? '16px' : '20px',
    }} onClick={onClose}>
      <div 
        ref={modalRef}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: '14px',
          padding: '20px',
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }} 
        onClick={e => e.stopPropagation()}
      >
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
                padding: '10px 12px',
                color: 'var(--txt-primary)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
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

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: '1 1 140px',
                padding: '10px 12px',
                background: 'var(--green)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                fontSize: '13px',
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
                padding: '10px 12px',
                background: 'transparent',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--txt-secondary)',
                fontSize: '13px',
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
