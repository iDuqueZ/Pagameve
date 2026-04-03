import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import TheyOweMe from './pages/TheyOweMe'
import IOwe from './pages/IOwe'
import Debtors from './pages/Debtors'
import Notifications from './pages/Notifications'
import AppLayout from './components/AppLayout'

function ProtectedRoute({ children, title, showNewDebt, onNewDebt }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-base)' }}>
        <p style={{ color: 'var(--txt-muted)' }}>Cargando...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return (
    <AppLayout title={title} showNewDebt={showNewDebt} onNewDebt={onNewDebt}>
      {children}
    </AppLayout>
  )
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-base)' }}>
        <p style={{ color: 'var(--txt-muted)' }}>Cargando...</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppRoutes() {
  const [showDebtForm, setShowDebtForm] = useState(false)
  const location = useLocation()

  const getTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard'
      case '/they-owe-me': return 'Me deben'
      case '/i-owe': return 'Debo'
      case '/debtors': return 'Deudores'
      case '/notifications': return 'Notificaciones'
      default: return 'PágameVe'
    }
  }

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute title="Dashboard">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/they-owe-me"
        element={
          <ProtectedRoute title="Me deben" showNewDebt onNewDebt={() => setShowDebtForm(true)}>
            <TheyOweMe showForm={showDebtForm} setShowForm={setShowDebtForm} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/i-owe"
        element={
          <ProtectedRoute title="Debo">
            <IOwe />
          </ProtectedRoute>
        }
      />
      <Route
        path="/debtors"
        element={
          <ProtectedRoute title="Deudores">
            <Debtors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute title="Notificaciones">
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  )
}

import { useState } from 'react'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
