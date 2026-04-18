import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { sendNotificationEmail, getDebtAcceptedEmailHtml, getDebtRejectedEmailHtml, getPaymentRegisteredEmailHtml, getDebtForgivenEmailHtml } from '../utils/sendEmail'

export function useDebts(type = 'all') {
  const { user } = useAuth()
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDebts = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    let query = supabase
      .from('debts')
      .select(`
        *,
        creditor:profiles!debts_creditor_id_fkey(id, username, full_name),
        debtor:profiles!debts_debtor_id_fkey(id, username, full_name),
        payments(*)
      `)
      .order('created_at', { ascending: false })

    if (type === 'creditor') {
      query = query.eq('creditor_id', user.id)
    } else if (type === 'debtor') {
      query = query.eq('debtor_id', user.id)
    } else {
      query = query.or(`creditor_id.eq.${user.id},debtor_id.eq.${user.id}`)
    }

    const { data, error: fetchError } = await query

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setDebts(data || [])
    }
    setLoading(false)
  }, [user, type])

  useEffect(() => {
    fetchDebts()
  }, [fetchDebts])

  const acceptDebt = async (debtId) => {
    const { error } = await supabase
      .from('debts')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', debtId)

    if (error) throw error

    const { data: debt } = await supabase
      .from('debts')
      .select('creditor_id, debtor:profiles!debts_debtor_id_fkey(username, email)')
      .eq('id', debtId)
      .single()

    if (debt) {
      await supabase.from('notifications').insert({
        user_id: debt.creditor_id,
        type: 'debt_accepted',
        debt_id: debtId,
        message: 'El deudor ha aceptado la deuda',
      })
      
      sendNotificationEmail(
        debt.creditor_id,
        'Deuda aceptada - PágameVe',
        getDebtAcceptedEmailHtml,
        'El deudor'
      )
    }

    fetchDebts()
  }

  const rejectDebt = async (debtId) => {
    const { error } = await supabase
      .from('debts')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', debtId)

    if (error) throw error

    const { data: debt } = await supabase
      .from('debts')
      .select('creditor_id')
      .eq('id', debtId)
      .single()

    if (debt) {
      await supabase.from('notifications').insert({
        user_id: debt.creditor_id,
        type: 'debt_rejected',
        debt_id: debtId,
        message: 'El deudor ha rechazado la deuda',
      })
      
      sendNotificationEmail(
        debt.creditor_id,
        'Deuda rechazada - PágameVe',
        getDebtRejectedEmailHtml,
        'El deudor'
      )
    }

    fetchDebts()
  }

  const registerPayment = async (debtId, amount, note = '') => {
    const { data: debt } = await supabase
      .from('debts')
      .select('*, payments(*), debtor:profiles!debts_debtor_id_fkey(username)')
      .eq('id', debtId)
      .single()

    if (!debt) throw new Error('Deuda no encontrada')

    const totalPaid = (debt.payments || []).reduce((sum, p) => sum + parseFloat(p.amount), 0)
    const newTotalPaid = totalPaid + parseFloat(amount)
    const remaining = parseFloat(debt.amount) - newTotalPaid
    const isPaid = newTotalPaid >= parseFloat(debt.amount)

    const { error: paymentError } = await supabase
      .from('payments')
      .insert({ debt_id: debtId, amount, note })

    if (paymentError) throw paymentError

    if (isPaid) {
      await supabase
        .from('debts')
        .update({ status: 'paid', updated_at: new Date().toISOString() })
        .eq('id', debtId)
    }

    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: debt.creditor_id,
        type: 'debt_paid',
        debt_id: debtId,
        message: `Pago registrado: $${amount}`,
      })

    if (notifError) console.error('Notif error:', notifError)
    
    sendNotificationEmail(
      debt.creditor_id,
      'Pago registrado - PágameVe',
      getPaymentRegisteredEmailHtml,
      amount,
      debt.debtor?.username || 'El deudor',
      remaining
    )

    fetchDebts()
  }

  const forgiveDebt = async (debtId) => {
    const { error } = await supabase
      .from('debts')
      .update({ status: 'forgiven', updated_at: new Date().toISOString() })
      .eq('id', debtId)

    if (error) throw error

    const { data: debt } = await supabase
      .from('debts')
      .select('debtor_id, creditor:profiles!debts_creditor_id_fkey(username)')
      .eq('id', debtId)
      .single()

    if (debt) {
      await supabase.from('notifications').insert({
        user_id: debt.debtor_id,
        type: 'debt_forgiven',
        debt_id: debtId,
        message: 'El acreedor ha perdonado tu deuda',
      })
      
      sendNotificationEmail(
        debt.debtor_id,
        'Deuda perdonada - PágameVe',
        getDebtForgivenEmailHtml,
        debt.creditor?.username || 'El acreedor'
      )
    }

    fetchDebts()
  }

  return {
    debts,
    loading,
    error,
    refresh: fetchDebts,
    acceptDebt,
    rejectDebt,
    registerPayment,
    forgiveDebt,
  }
}
