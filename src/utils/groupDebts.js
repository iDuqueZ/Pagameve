export function groupDebtsByCounterpart(debts, currentUserId) {
  const grouped = {}

  debts.forEach(debt => {
    const isCreditor = debt.creditor_id === currentUserId
    const counterparty = isCreditor ? debt.debtor : debt.creditor
    const counterpartyId = counterparty?.id

    if (!counterpartyId) return

    if (!grouped[counterpartyId]) {
      grouped[counterpartyId] = {
        userId: counterpartyId,
        username: counterparty?.username || 'Usuario',
        fullName: counterparty?.full_name || '',
        debtsAsCreditor: [],
        debtsAsDebtor: [],
        totalIOwe: 0,
        totalOwedToMe: 0,
        pendingAcceptance: 0,
      }
    }

    const payments = debt.payments || []
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
    const remaining = parseFloat(debt.amount) - totalPaid

    if (isCreditor) {
      if (debt.status === 'active') {
        grouped[counterpartyId].totalOwedToMe += remaining
      }
      if (debt.status === 'pending_acceptance') {
        grouped[counterpartyId].pendingAcceptance += 1
      }
      grouped[counterpartyId].debtsAsCreditor.push(debt)
    } else {
      if (debt.status === 'active') {
        grouped[counterpartyId].totalIOwe += remaining
      }
      if (debt.status === 'pending_acceptance') {
        grouped[counterpartyId].pendingAcceptance += 1
      }
      grouped[counterpartyId].debtsAsDebtor.push(debt)
    }
  })

  return Object.values(grouped).map(item => ({
    ...item,
    netBalance: item.totalOwedToMe - item.totalIOwe,
    activeDebtsCount: 
      item.debtsAsCreditor.filter(d => d.status === 'active').length +
      item.debtsAsDebtor.filter(d => d.status === 'active').length,
  })).sort((a, b) => {
    const aAbs = Math.abs(a.netBalance)
    const bAbs = Math.abs(b.netBalance)
    return bAbs - aAbs
  })
}
