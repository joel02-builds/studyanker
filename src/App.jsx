import { Navigate, Route, Routes } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { useTheme } from './useTheme'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import AnkerForm from './pages/AnkerForm'
import KiZusammenfassung from './pages/KiZusammenfassung'
import Onboarding from './pages/Onboarding'
import FachVerwaltung from './pages/FachVerwaltung'
import Einstellungen from './pages/Einstellungen'
import Datenschutz from './pages/Datenschutz'
import Impressum from './pages/Impressum'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-anker-muted">Lädt...</div>
  }

  return user ? children : <Navigate to="/login" replace />
}

function RootRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-anker-muted">Lädt...</div>
  }

  if (!user) {
    return <Landing />
  }

  const onboardingErledigt = localStorage.getItem('onboarding_done') === 'true'
  return onboardingErledigt ? <Dashboard /> : <Navigate to="/onboarding" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth initialMode="signup" />} />
      <Route path="/datenschutz" element={<Datenschutz />} />
      <Route path="/impressum" element={<Impressum />} />
      <Route
        path="/onboarding"
        element={
          <PrivateRoute>
            <Onboarding />
          </PrivateRoute>
        }
      />
      <Route
        path="/anker/neu"
        element={
          <PrivateRoute>
            <AnkerForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/anker/bearbeiten/:id"
        element={
          <PrivateRoute>
            <AnkerForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/faecher"
        element={
          <PrivateRoute>
            <FachVerwaltung />
          </PrivateRoute>
        }
      />
      <Route
        path="/zusammenfassung"
        element={
          <PrivateRoute>
            <KiZusammenfassung />
          </PrivateRoute>
        }
      />
      <Route
        path="/einstellungen"
        element={
          <PrivateRoute>
            <Einstellungen />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

function App() {
  useTheme()

  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default Sentry.withErrorBoundary(App, {
  fallback: (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Etwas ist schiefgelaufen.</h2>
      <p>Bitte lade die Seite neu.</p>
      <button onClick={() => window.location.reload()}>Neu laden</button>
    </div>
  ),
})
