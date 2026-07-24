import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import AnkerForm from './pages/AnkerForm'
import KiZusammenfassung from './pages/KiZusammenfassung'
import Onboarding from './pages/Onboarding'
import FachVerwaltung from './pages/FachVerwaltung'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Lädt...</div>
  }

  return user ? children : <Navigate to="/login" replace />
}

function StartRoute() {
  const onboardingErledigt = localStorage.getItem('onboarding_done') === 'true'
  return onboardingErledigt ? <Dashboard /> : <Navigate to="/onboarding" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Auth />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <StartRoute />
          </PrivateRoute>
        }
      />
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
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
