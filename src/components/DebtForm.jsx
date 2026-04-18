import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { sendNotificationEmail, getNewDebtEmailHtml } from '../utils/sendEmail'
import Input from './ui/Input'
import Button from './ui/Button'
import { Search, X } from 'lucide-react'

export default function DebtForm({ onSuccess, onCancel }) {
  const { user, profile } = useAuth()
  const [debtorUsername, setDebtorUsername] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [userFound, setUserFound] = useState(null)
  const searchTimeoutRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (debtorUsername.trim().length < 2 || userFound) {
      setSearchResults([])
      return
    }

    clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(async () => {
      const searchTerm = debtorUsername.trim().toLowerCase()
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, email')
        .or(`username.ilike.*${searchTerm}*,full_name.ilike.*${searchTerm}*`)
        .neq('id', user.id)
        .limit(5)

      if (!error && data) {
        setSearchResults(data)
        setShowResults(true)
      }
    }, 300)

    return () => clearTimeout(searchTimeoutRef.current)
  }, [debtorUsername, user.id, userFound])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectUser(result) {
    setUserFound(result)
    setDebtorUsername(result.username)
    setSearchResults([])
    setShowResults(false)
  }

  function clearSelection() {
    setUserFound(null)
    setDebtorUsername('')
    setSearchResults([])
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

      sendNotificationEmail(
        userFound.id,
        'Nueva deuda creada - PágameVe',
        getNewDebtEmailHtml,
        profile?.username || user.email,
        amount,
        description
      )

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
        <div ref={inputRef} style={{ position: 'relative' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={debtorUsername}
              onChange={(e) => {
                setDebtorUsername(e.target.value)
                setUserFound(null)
              }}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
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
          </div>
          {showResults && searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', marginTop: '4px',
              zIndex: 20, maxHeight: '200px', overflowY: 'auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}>
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => selectUser(result)}
                  style={{
                    padding: '10px 12px', cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'var(--accent-bg)', color: 'var(--accent-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '500', flexShrink: 0,
                  }}>
                    {result.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--txt-primary)', fontWeight: '500' }}>
                      {result.username}
                    </div>
                    {result.full_name && (
                      <div style={{ fontSize: '11px', color: 'var(--txt-muted)' }}>
                        {result.full_name}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {userFound && (
          <div style={{ marginTop: '8px', padding: '8px 12px', background: 'var(--green-bg)', border: '1px solid var(--green)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--green)', fontSize: '12px' }}>
              ✓ {userFound.username} ({userFound.full_name || 'Sin nombre'})
            </span>
            <button
              type="button"
              onClick={clearSelection}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', padding: '2px' }}
            >
              <X size={14} />
            </button>
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
