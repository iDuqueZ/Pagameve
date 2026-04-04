import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Input from './ui/Input'
import Button from './ui/Button'
import { Search } from 'lucide-react'

export default function DebtForm({ onSuccess, onCancel }) {
  const { user, profile } = useAuth()
  const [debtorUsername, setDebtorUsername] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchingUser, setSearchingUser] = useState(false)
  const [userFound, setUserFound] = useState(null)

  async function searchUser() {
    if (!debtorUsername.trim()) return
    
    setSearchingUser(true)
    setError('')
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .eq('username', debtorUsername)
      .single()

    if (error || !data) {
      setError('Usuario no encontrado')
      setUserFound(null)
    } else if (data.id === user.id) {
      setError('No puedes crearte una deuda a ti mismo')
      setUserFound(null)
    } else {
      setUserFound(data)
    }
    setSearchingUser(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!userFound) {
      setError('Debes buscar y seleccionar un usuario válido')
      setLoading(false)
      return
    }

    try {
      const { data: debt, error: debtError } = await supabase
        .from('debts')
        .insert({
          creditor_id: user.id,
          debtor_id: userFound.id,
          amount: parseInt(amount),
          description,
          due_date: dueDate || null,
          status: 'pending_acceptance',
        })
        .select()
        .single()

      if (debtError) throw debtError

      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: userFound.id,
          type: 'new_debt',
          debt_id: debt.id,
          message: `Nueva deuda creada por ${profile?.username || user.email}`,
        })

      if (notifError) console.error('Notif error:', notifError)

      onSuccess?.()
      setDebtorUsername('')
      setAmount('')
      setDescription('')
      setDueDate('')
      setUserFound(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {error && (
        <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red)', color: 'var(--red)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
          {error}
        </div>
      )}

      <div>
        <label style={{ fontSize: '11px', color: 'var(--txt-secondary)', display: 'block', marginBottom: '5px' }}>Usuario deudor</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={debtorUsername}
            onChange={(e) => {
              setDebtorUsername(e.target.value)
              setUserFound(null)
            }}
            placeholder="Buscar por username"
            style={{
              flex: '1 1 auto',
              minWidth: '150px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 10px',
              color: 'var(--txt-primary)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={searchUser}
            disabled={searchingUser || !debtorUsername.trim()}
            className={userFound === null ? 'pulse-border' : ''}
            style={{
              padding: '8px 12px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--txt-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: searchingUser || !debtorUsername.trim() ? 0.5 : 1,
            }}
          >
            <Search size={14} strokeWidth={1.6} />
          </button>
        </div>
        {userFound && (
          <div style={{ marginTop: '8px', padding: '8px 12px', background: 'var(--green-bg)', border: '1px solid var(--green)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--green)', fontSize: '12px' }}>✓</span>
            <span style={{ color: 'var(--green)', fontSize: '12px', marginLeft: '6px' }}>
              {userFound.username} ({userFound.full_name || 'Sin nombre'})
            </span>
          </div>
        )}
      </div>

      <Input
        label="Monto"
        type="number"
        min="1"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0"
      />

      <div>
        <label style={{ fontSize: '11px', color: 'var(--txt-secondary)', display: 'block', marginBottom: '5px' }}>Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="2"
          style={{
            width: '100%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 10px',
            color: 'var(--txt-primary)',
            fontSize: '13px',
            outline: 'none',
            resize: 'none',
            fontFamily: 'inherit',
          }}
          placeholder="¿Por qué es esta deuda?"
        />
      </div>

      <Input
        label="Fecha límite (opcional)"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
        <Button type="submit" variant="primary" disabled={loading || !userFound} style={{ flex: '1 1 auto', justifyContent: 'center', minWidth: '140px' }}>
          {loading ? 'Creando...' : 'Crear Deuda'}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
