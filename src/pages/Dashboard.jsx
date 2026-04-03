import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { formatCOP } from '../utils/format'
import StatCard from '../components/ui/StatCard'
import DebtRow, { DebtRowSkeleton } from '../components/ui/DebtRow'
import { UserCheck, UserX, Clock, Bell, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'

function EmptyActivity() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '8px', 
      padding: '32px 20px',
      textAlign: 'center'
    }}>
      <Clock size={28} strokeWidth={1} color="var(--txt-muted)" />
      <div style={{ fontSize: '13px', color: 'var(--txt-secondary)' }}>Sin actividad reciente</div>
      <div style={{ fontSize: '11px', color: 'var(--txt-muted)' }}>Las deudas que crees o recibas aparecerán aquí</div>
    </div>
  )
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({
    totalOwedToMe: 0,
    totalIOwe: 0,
    pendingAcceptance: 0,
    unreadNotifications: 0,
  })
  const [recentDebts, setRecentDebts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return

      setLoading(true)

      const [debtsResult, notificationsResult] = await Promise.all([
        supabase
          .from('debts')
          .select('*, payments(*), creditor:profiles!debts_creditor_id_fkey(username), debtor:profiles!debts_debtor_id_fkey(username)')
          .or(`creditor_id.eq.${user.id},debtor_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false),
      ])

      const debts = debtsResult.data || []

      let totalOwedToMe = 0
      let totalIOwe = 0
      let pendingAcceptance = 0

      debts.forEach(debt => {
        const totalPaid = (debt.payments || []).reduce((sum, p) => sum + parseFloat(p.amount), 0)
        const remaining = parseFloat(debt.amount) - totalPaid

        if (debt.creditor_id === user.id && debt.status === 'active') {
          totalOwedToMe += remaining
        }
        if (debt.debtor_id === user.id && debt.status === 'active') {
          totalIOwe += remaining
        }
        if (debt.debtor_id === user.id && debt.status === 'pending_acceptance') {
          pendingAcceptance++
        }
      })

      setStats({
        totalOwedToMe,
        totalIOwe,
        pendingAcceptance,
        unreadNotifications: notificationsResult.count || 0,
      })

      setRecentDebts(debts.slice(0, 5))
      setLoading(false)
    }

    fetchDashboardData()
  }, [user])

  if (loading) {
    return (
      <div>
        <p style={{ color: 'var(--txt-secondary)', marginBottom: '20px' }}>
          Hola, {profile?.full_name || profile?.username || user?.email}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '18px' }}>
          <StatCard label="Me deben" value="—" color="var(--green)" />
          <StatCard label="Debo" value="—" color="var(--red)" />
          <StatCard label="Pendientes" value="—" color="var(--amber)" />
          <StatCard label="Notificaciones" value="—" color="var(--accent-light)" />
        </div>
      </div>
    )
  }

  const netBalance = stats.totalOwedToMe - stats.totalIOwe

  return (
    <div>
      <p style={{ color: 'var(--txt-secondary)', marginBottom: '20px' }}>
        Hola, {profile?.full_name || profile?.username || user?.email}
      </p>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '18px' }}>
        <StatCard 
          label={<><UserCheck size={11} color="var(--green)" /> Me deben</>} 
          value={formatCOP(stats.totalOwedToMe)} 
          color="var(--green)"
        />
        <StatCard 
          label={<><UserX size={11} color="var(--red)" /> Debo</>} 
          value={formatCOP(stats.totalIOwe)} 
          color="var(--red)"
        />
        <StatCard 
          label={<><Clock size={11} color="var(--amber)" /> Pendientes</>} 
          value={stats.pendingAcceptance} 
          color="var(--amber)"
        />
        <StatCard 
          label={<><Bell size={11} color="var(--accent-light)" /> Notificaciones</>} 
          value={stats.unreadNotifications} 
          color="var(--accent-light)"
        />
      </div>

      {/* Net Balance */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '14px 16px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--txt-muted)' }}>Balance neto</div>
          <div style={{ fontSize: '22px', fontWeight: '500', color: netBalance >= 0 ? 'var(--green)' : 'var(--red)', display: 'flex', alignItems: 'center' }}>
            {formatCOP(Math.abs(netBalance))}
            <span style={{ marginLeft: '4px' }}>
              {netBalance >= 0 ? <TrendingUp size={20} color="var(--green)" /> : <TrendingDown size={20} color="var(--red)" />}
            </span>
          </div>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--txt-muted)' }}>
          {netBalance >= 0 ? 'Estás a favor' : 'Debes'}
        </div>
      </div>

      {/* Actividad Reciente */}
      <h2 style={{ fontSize: '12px', fontWeight: '500', color: 'var(--txt-secondary)', marginBottom: '10px' }}>
        Actividad reciente
      </h2>
      
      {loading ? (
        <div>
          <DebtRowSkeleton />
          <DebtRowSkeleton />
          <DebtRowSkeleton />
          <DebtRowSkeleton />
        </div>
      ) : recentDebts.length === 0 ? (
        <EmptyActivity />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {recentDebts.map(debt => (
            <DebtRow key={debt.id} debt={debt} currentUserId={user.id} />
          ))}
          {recentDebts.length > 0 && (
            <Link 
              to="/they-owe-me" 
              style={{ 
                fontSize: '12px', 
                color: 'var(--accent)', 
                textDecoration: 'none',
                textAlign: 'right',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '4px'
              }}
            >
              Ver todo <ArrowRight size={12} />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
