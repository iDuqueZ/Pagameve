import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { AlertCircle, CheckCircle, XCircle, Banknote, Heart } from 'lucide-react'

const notificationRoutes = {
  new_debt: '/i-owe',
  debt_accepted: '/they-owe-me',
  debt_rejected: '/they-owe-me',
  debt_paid: '/they-owe-me',
  debt_forgiven: '/i-owe',
}

const notifIcons = {
  new_debt: { icon: AlertCircle, color: 'var(--accent-bg)', iconColor: 'var(--accent-light)' },
  debt_accepted: { icon: CheckCircle, color: 'var(--green-bg)', iconColor: 'var(--green)' },
  debt_rejected: { icon: XCircle, color: 'var(--red-bg)', iconColor: 'var(--red)' },
  debt_paid: { icon: Banknote, color: 'var(--green-bg)', iconColor: 'var(--green)' },
  debt_forgiven: { icon: Heart, color: 'var(--blue-bg)', iconColor: 'var(--blue)' },
}

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchNotifications() {
      if (!user) return

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error) {
        setNotifications(data || [])
      }
      setLoading(false)
    }

    fetchNotifications()
  }, [user])

  async function markAsRead(id) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)

    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ))
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    
    await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', unreadIds)

    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  function handleClick(notif) {
    markAsRead(notif.id)
    if (notif.debt_id) {
      const route = notificationRoutes[notif.type] || '/'
      navigate(route)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--txt-muted)' }}>Cargando...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '14px', fontWeight: '500', color: 'var(--txt-primary)', margin: 0 }}></h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px', cursor: 'pointer' }}
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--txt-muted)', fontSize: '12px' }}>
          No hay notificaciones
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {notifications.map(notif => {
            const { icon: Icon, color, iconColor } = notifIcons[notif.type] || notifIcons.new_debt
            return (
              <div
                key={notif.id}
                onClick={() => handleClick(notif)}
                style={{
                  display: 'flex',
                  gap: '10px',
                  padding: '12px 14px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  marginBottom: '6px',
                  cursor: 'pointer',
                  position: 'relative',
                  borderLeft: !notif.read ? '2px solid var(--accent)' : undefined,
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={14} strokeWidth={1.8} color={iconColor} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12.5px', fontWeight: '500', color: 'var(--txt-primary)', margin: 0 }}>{notif.message}</p>
                  <p style={{ fontSize: '10px', color: 'var(--txt-muted)', marginTop: '2px' }}>
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
                {!notif.read && (
                  <div style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                  }} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
