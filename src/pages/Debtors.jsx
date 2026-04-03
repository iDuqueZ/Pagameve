import { useDebts } from '../hooks/useDebts'
import { useDebtors } from '../hooks/useDebtors'
import DebtorCard from '../components/DebtorCard'
import EmptyState from '../components/ui/EmptyState'
import { Users } from 'lucide-react'

export default function Debtors() {
  const { loading, error, debtors, refresh } = useDebtors()
  const debtActions = useDebts('all')

  const handleAccept = async (debtId) => {
    await debtActions.acceptDebt(debtId)
    refresh()
  }

  const handleReject = async (debtId) => {
    await debtActions.rejectDebt(debtId)
    refresh()
  }

  const handlePay = async (debtId, amount, note) => {
    await debtActions.registerPayment(debtId, amount, note)
    refresh()
  }

  const handleForgive = async (debtId) => {
    await debtActions.forgiveDebt(debtId)
    refresh()
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--txt-muted)' }}>
        Cargando...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ color: 'var(--red)', fontSize: '12px' }}>
        {error}
      </div>
    )
  }

  if (debtors.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Sin deudores"
        subtitle="Las personas con quienes tienes deudas aparecerán aquí"
      />
    )
  }

  return (
    <div>
      {debtors.map(debtor => (
        <DebtorCard
          key={debtor.userId}
          debtor={debtor}
          onAccept={handleAccept}
          onReject={handleReject}
          onPay={handlePay}
          onForgive={handleForgive}
        />
      ))}
    </div>
  )
}
