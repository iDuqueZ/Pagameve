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

const NAV_ITEMS = [
  { path: '/',               label: 'Dashboard',       icon: LayoutDashboard },
  { path: '/they-owe-me',    label: 'Me deben',        icon: UserCheck },
  { path: '/i-owe',          label: 'Debo',            icon: UserX },
  { path: '/notifications',  label: 'Notificaciones',  icon: Bell },
]

const SIDEBAR_W = 200

export default function AppLayout({ children, title, showNewDebt, onNewDebt }) {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount]   = useState(0)
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [isMobile, setIsMobile]         = useState(() => window.innerWidth < 768)

  /* ── Detectar mobile ─────────────────────────────────────── */
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  /* Cerrar sidebar al cambiar de ruta en mobile */
  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
  }, [location.pathname, isMobile])

  /* Bloquear scroll del body cuando el sidebar mobile está abierto */
  useEffect(() => {
    document.body.style.overflow = (isMobile && sidebarOpen) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobile, sidebarOpen])

  /* ── Notificaciones no leídas ────────────────────────────── */
  useEffect(() => {
    if (!user) return

    const fetchCount = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)
      setUnreadCount(count || 0)
    }

    fetchCount()

    const channel = supabase
      .channel('notif_count')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, fetchCount)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  /* ── Sign out ────────────────────────────────────────────── */
  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  /* ── Estilos calculados ──────────────────────────────────── */
  const sidebarStyle = {
    position: 'fixed',
    left: 0, top: 0, bottom: 0,
    width:    `${SIDEBAR_W}px`,
    minWidth: `${SIDEBAR_W}px`,
    background:   'var(--bg-surface)',
    borderRight:  '1px solid var(--border)',
    display:      'flex',
    flexDirection: 'column',
    zIndex: 50,
    /* En mobile: deslizar; en desktop: siempre visible */
    transform:  isMobile
      ? (sidebarOpen ? 'translateX(0)' : `translateX(-${SIDEBAR_W}px)`)
      : 'translateX(0)',
    transition: 'transform 0.22s ease',
  }

  /* El área de contenido empuja a la derecha en desktop.
     En mobile ocupa el 100% (el sidebar flota encima). */
  const contentStyle = {
    flex: 1,
    display:       'flex',
    flexDirection: 'column',
    overflow:      'hidden',
    marginLeft:    isMobile ? 0 : `${SIDEBAR_W}px`,
    width:         isMobile ? '100%' : `calc(100% - ${SIDEBAR_W}px)`,
    transition:    'margin-left 0.22s ease, width 0.22s ease',
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── Overlay mobile ────────────────────────────────────── */}
      {isMobile && sidebarOpen && (
        <div
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 49,           /* justo debajo del sidebar (50) */
            cursor: 'pointer',
          }}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside style={sidebarStyle}>

        {/* Logo */}
        <div style={{
          padding: '0 16px',
          borderBottom: '1px solid var(--border)',
          height: 'var(--topbar-height)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <Wallet size={20} strokeWidth={1.8} color="var(--accent)" />
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--txt-primary)' }}>PágameVe</span>
          </Link>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
              style={{ background: 'none', border: 'none', color: 'var(--txt-secondary)', cursor: 'pointer', padding: '4px', display: 'flex' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          <div style={{
            fontSize: '10px', color: 'var(--txt-muted)',
            letterSpacing: '0.08em', marginBottom: '8px', paddingLeft: '8px',
          }}>
            MENÚ
          </div>

          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  gap:            '9px',
                  padding:        '7px 8px',
                  borderRadius:   'var(--radius-sm)',
                  marginBottom:   '1px',
                  textDecoration: 'none',
                  position:       'relative',
                  color:          active ? 'var(--accent-light)' : 'var(--txt-secondary)',
                  background:     active ? 'var(--accent-bg)'    : 'transparent',
                  fontSize:       '12.5px',
                  transition:     'background 0.15s, color 0.15s',
                }}
              >
                {active && (
                  <div style={{
                    position: 'absolute', left: 0, top: '6px', bottom: '6px',
                    width: '2.5px', background: 'var(--accent)',
                    borderRadius: '0 2px 2px 0',
                  }} />
                )}
                <Icon size={15} strokeWidth={1.6} />
                {label}

                {/* Badge notificaciones no leídas */}
                {path === '/notifications' && unreadCount > 0 && (
                  <span style={{
                    marginLeft: 'auto', fontSize: '9px', fontWeight: '500',
                    padding: '1px 5px', borderRadius: '99px',
                    background: 'var(--accent)', color: '#fff',
                  }}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Avatar + logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '7px 8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'var(--accent-bg)', color: 'var(--accent-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '500', flexShrink: 0,
            }}>
              {(profile?.username ?? user?.email ?? '?').charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '12.5px', color: 'var(--txt-primary)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {profile?.username || user?.email?.split('@')[0]}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              aria-label="Cerrar sesión"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt-muted)', padding: '4px' }}
            >
              <LogOut size={15} strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Área de contenido ─────────────────────────────────── */}
      <div style={contentStyle}>

        {/* Topbar */}
        <header style={{
          height:       'var(--topbar-height)',
          background:   'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          display:      'flex',
          alignItems:   'center',
          padding:      '0 16px',
          gap:          '12px',
          flexShrink:   0,
          zIndex:       30,
        }}>
          {/* Botón hamburguesa — solo en mobile */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
              style={{
                background: 'none', border: 'none',
                color: 'var(--txt-secondary)', cursor: 'pointer',
                padding: '4px', display: 'flex', alignItems: 'center',
              }}
            >
              <Menu size={20} />
            </button>
          )}

          <h1 style={{ fontSize: '14px', fontWeight: '500', color: 'var(--txt-primary)', margin: 0 }}>
            {title}
          </h1>

          {showNewDebt && (
            <button
              onClick={onNewDebt}
              style={{
                marginLeft:   'auto',
                padding:      '6px 13px',
                fontSize:     '12px',
                background:   'var(--accent)',
                border:       'none',
                color:        '#fff',
                borderRadius: 'var(--radius-sm)',
                cursor:       'pointer',
                display:      'flex',
                alignItems:   'center',
                gap:          '5px',
                whiteSpace:   'nowrap',
              }}
            >
              <Plus size={12} strokeWidth={2} />
              {/* Texto visible en desktop, solo ícono en mobile */}
              {!isMobile && 'Nueva deuda'}
            </button>
          )}
        </header>

        {/* Contenido de la página */}
        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '12px' : '16px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}