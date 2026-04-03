import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { groupDebtsByCounterpart } from '../utils/groupDebts'

export function useDebtors() {
  const { user } = useAuth()
  const [debtors, setDebtors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDebtors = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('debts')
        .select(`
          *,
          creditor:profiles!debts_creditor_id_fkey(id, username, full_name),
          debtor:profiles!debts_debtor_id_fkey(id, username, full_name),
          payments(*)
        `)
        .or(`creditor_id.eq.${user.id},debtor_id.eq.${user.id}`)
        .not('status', 'eq', 'rejected')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const grouped = groupDebtsByCounterpart(data || [], user.id)
      setDebtors(grouped)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchDebtors()
  }, [fetchDebtors])

  return {
    debtors,
    loading,
    error,
    refresh: fetchDebtors,
  }
}
