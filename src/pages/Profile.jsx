import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { User, Mail, Save, ArrowLeft } from 'lucide-react'

export default function Profile() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (profile?.username) {
      setUsername(profile.username)
    }
  }, [profile])

  const handleSave = async () => {
    if (!username.trim()) {
      setMessage({ type: 'error', text: 'El nombre de usuario no puede estar vacío' })
      return
    }

    setSaving(true)
    setMessage(null)

    const { error } = await supabase
      .from('profiles')
      .update({ username: username.trim() })
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      setMessage({ type: 'error', text: 'Error al guardar: ' + error.message })
    } else {
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' })
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
        <p style={{ color: 'var(--txt-muted)' }}>Cargando...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none', border: 'none',
          color: 'var(--txt-secondary)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', padding: '8px 0', marginBottom: '16px',
        }}
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        padding: '24px',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--txt-primary)', marginBottom: '24px' }}>
          Mi perfil
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px', background: 'var(--bg-base)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'var(--accent-bg)', color: 'var(--accent-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', fontWeight: '600', flexShrink: 0,
            }}>
              {(profile?.username ?? user?.email ?? '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--txt-primary)' }}>
                {profile?.username || 'Sin nombre'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--txt-muted)' }}>
                Avatar generado automáticamente
              </div>
            </div>
          </div>

          <div>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', color: 'var(--txt-secondary)',
              marginBottom: '6px',
            }}>
              <User size={14} />
              Nombre de usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu nombre de usuario"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-base)',
                color: 'var(--txt-primary)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', color: 'var(--txt-secondary)',
              marginBottom: '6px',
            }}>
              <Mail size={14} />
              Correo electrónico
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-base)',
                color: 'var(--txt-muted)',
                outline: 'none',
                boxSizing: 'border-box',
                cursor: 'not-allowed',
              }}
            />
            <p style={{ fontSize: '11px', color: 'var(--txt-muted)', marginTop: '4px' }}>
              El correo no se puede modificar
            </p>
          </div>

          {message && (
            <div style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              background: message.type === 'error' ? '#fee2e2' : '#dcfce7',
              color: message.type === 'error' ? '#dc2626' : '#16a34a',
            }}>
              {message.text}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px',
              fontSize: '14px', fontWeight: '500',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none', borderRadius: 'var(--radius-sm)',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Save size={16} />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}