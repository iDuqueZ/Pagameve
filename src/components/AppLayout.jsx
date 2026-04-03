import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  LayoutDashboard, 
  UserCheck, 
  UserX, 
  Bell, 
  Plus, 
  LogOut,
  Wallet,
  Menu,
  X
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/they-owe-me', label: 'Me deben', icon: UserCheck },
  { path: '/i-owe', label: 'Debo', icon: UserX },
  { path: '/notifications', label: 'Notificaciones', icon: Bell },
]

export default function AppLayout({ children, title, showNewDebt, onNewDebt }) {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!user) return

    async function fetchUnreadCount() {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)

      setUnreadCount(count || 0)
    }

    fetchUnreadCount()

    const channel = supabase
      .channel('notifications_count')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchUnreadCount()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
  }, [location.pathname, isMobile])

  async function handleSignOut() {
    await signOut()
    navigate('/auth')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: 'var(--sidebar-width)',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
        transition: 'transform 0.2s ease',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px', borderBottom: '1px solid var(--border)', height: 'var(--topbar-height)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <Wallet size={20} strokeWidth={1.8} color="var(--accent)" />
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--txt-primary)' }}>PágameVe</span>
          </Link>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--txt-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          <div style={{ fontSize: '10px', fontWeight: '400', color: 'var(--txt-muted)', letterSpacing: '0.08em', marginBottom: '8px', paddingLeft: '8px' }}>MENÚ</div>
          {navItems.map(item => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  padding: '7px 8px',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? 'var(--accent-light)' : 'var(--txt-secondary)',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  position: 'relative',
                  textDecoration: 'none',
                  background: isActive ? 'var(--accent-bg)' : 'transparent',
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: 0, top: '6px', bottom: '6px',
                    width: '2.5px',
                    background: 'var(--accent)',
                    borderRadius: '0 2px 2px 0'
                  }} />
                )}
                <Icon size={15} strokeWidth={1.6} />
                {item.label}
                {item.path === '/i-owe' && unreadCount > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '9px',
                    fontWeight: '500',
                    padding: '1px 5px',
                    borderRadius: '99px',
                    background: 'var(--red)',
                    color: '#fff'
                  }}>{unreadCount}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '7px 8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--accent-bg)',
              color: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: '500'
            }}>
              {profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12.5px', color: 'var(--txt-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile?.username || user?.email?.split('@')[0]}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt-muted)', padding: '4px' }}
            >
              <LogOut size={15} strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        marginLeft: isMobile ? 0 : 'var(--sidebar-width)',
        transition: 'margin-left 0.2s ease',
        width: isMobile ? '100%' : `calc(100% - var(--sidebar-width))`,
      }}>
        {/* Topbar */}
        <header style={{
          height: 'var(--topbar-height)',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '12px',
          flexShrink: 0
        }}>
          {isMobile && (
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--txt-secondary)', cursor: 'pointer', marginRight: '4px' }}>
              <Menu size={20} />
            </button>
          )}
          <h1 style={{ fontSize: '14px', fontWeight: '500', color: 'var(--txt-primary)', margin: 0 }}>{title}</h1>
          {showNewDebt && (
            <button
              onClick={onNewDebt}
              style={{
                marginLeft: 'auto',
                padding: '6px 13px',
                fontSize: '12px',
                background: 'var(--accent)',
                border: 'none',
                color: '#fff',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Plus size={12} strokeWidth={2} />
              {!isMobile && 'Nueva deuda'}
            </button>
          )}
        </header>

        {/* Main Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
