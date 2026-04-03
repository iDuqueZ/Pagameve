import { useState } from 'react'
import { useDebts } from '../hooks/useDebts'
import DebtCard from '../components/DebtCard'
import EmptyState from '../components/ui/EmptyState'
import { UserX } from 'lucide-react'

export default function IOwe() {
  const { debts, loading, error, acceptDebt, rejectDebt, refresh } = useDebts('debtor')
  const [statusFilter, setStatusFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('')

  const filteredDebts = debts.filter(d => {
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter
    const matchesUser = !userFilter || 
      d.creditor?.username?.toLowerCase().includes(userFilter.toLowerCase()) ||
      d.creditor?.full_name?.toLowerCase().includes(userFilter.toLowerCase())
    return matchesStatus && matchesUser
  })

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', alignItems: 'center' }}>
        <input
          type="text"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          placeholder="Buscar por usuario..."
          style={{
            flex: 1,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '7px 10px',
            color: 'var(--txt-primary)',
            fontSize: '12px',
            outline: 'none',
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '7px 8px',
            color: 'var(--txt-secondary)',
            fontSize: '12px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="all">Todos los estados</option>
          <option value="pending_acceptance">esperando</option>
          <option value="active">activa</option>
          <option value="paid">pagada</option>
          <option value="forgiven">perdonada</option>
          <option value="rejected">rechazada</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--txt-muted)' }}>Cargando...</div>
      ) : error ? (
        <div style={{ color: 'var(--red)', fontSize: '12px' }}>{error}</div>
      ) : filteredDebts.length === 0 ? (
        <EmptyState
          icon={UserX}
          title="No debes nada"
          subtitle="No tienes deudas pendientes con nadie"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredDebts.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              role="debtor"
              onAccept={acceptDebt}
              onReject={rejectDebt}
            />
          ))}
        </div>
      )}
    </div>
  )
}
