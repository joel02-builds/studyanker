import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const [resetOffen, setResetOffen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetInfo, setResetInfo] = useState('')
  const [resetError, setResetError] = useState('')

  const { signIn, signUp, resetPassword } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    const { error } = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password)

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    if (mode === 'signup') {
      setInfo('Konto erstellt. Falls Email-Bestätigung aktiv ist, prüfe dein Postfach — sonst kannst du dich jetzt einloggen.')
    } else {
      navigate('/')
    }
  }

  async function handleReset(e) {
    e.preventDefault()
    setResetError('')
    setResetInfo('')
    setResetLoading(true)

    const { error } = await resetPassword(resetEmail)

    setResetLoading(false)

    if (error) {
      setResetError(error.message)
      return
    }

    setResetInfo('Wir haben dir einen Link geschickt — check deine E-Mails.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-anker-bg px-6">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: 'var(--accent-secondary)', marginRight: '8px', verticalAlign: 'middle' }}
            >
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v14" />
              <path d="M5 14H2a10 10 0 0 0 20 0h-3" />
            </svg>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2.25rem', fontWeight: 400, color: 'var(--accent-primary)' }}>
              StudyAnker
            </h1>
          </div>
          <p className="mt-2 text-base" style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Weißt du noch wo du warst?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-base text-anker-muted mb-2">E-Mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-base bg-anker-card border-[1.5px] border-anker-border rounded-anker-sm focus:outline-none focus:ring-2 focus:ring-anker-accent2/30 focus:border-anker-accent2"
            />
          </div>

          <div>
            <label className="block text-base text-anker-muted mb-2">Passwort</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-base bg-anker-card border-[1.5px] border-anker-border rounded-anker-sm focus:outline-none focus:ring-2 focus:ring-anker-accent2/30 focus:border-anker-accent2"
            />
          </div>

          {error && <p className="text-base text-red-600">{error}</p>}
          {info && <p className="text-base text-emerald-700">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-anker-accent text-white rounded-anker text-base font-medium hover:opacity-90 disabled:opacity-50"
            style={{ padding: '1rem 2rem', transition: 'all 0.2s ease' }}
          >
            {loading ? '...' : mode === 'signin' ? 'Einloggen' : 'Registrieren'}
          </button>
        </form>

        {mode === 'signin' && (
          <button
            onClick={() => { setResetOffen(!resetOffen); setResetInfo(''); setResetError('') }}
            className="mt-4 text-sm text-anker-muted hover:text-anker-text w-full text-center"
          >
            Passwort vergessen?
          </button>
        )}

        {resetOffen && (
          <form onSubmit={handleReset} className="mt-4 p-4 bg-anker-card border border-anker-border rounded-anker space-y-3">
            <label className="block text-sm text-anker-muted">
              Wir schicken dir einen Link zum Zurücksetzen.
            </label>
            <input
              type="email"
              required
              placeholder="E-Mail"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full px-3 py-2 text-base bg-anker-card border-[1.5px] border-anker-border rounded-anker-sm focus:outline-none focus:ring-2 focus:ring-anker-accent2/30 focus:border-anker-accent2"
            />

            {resetError && <p className="text-sm text-red-600">{resetError}</p>}
            {resetInfo && <p className="text-sm text-emerald-700">{resetInfo}</p>}

            <button
              type="submit"
              disabled={resetLoading}
              className="w-full bg-anker-accent text-white py-2 rounded-anker-sm text-base font-medium hover:opacity-90 disabled:opacity-50"
            >
              {resetLoading ? '...' : 'Link senden'}
            </button>
          </form>
        )}

        <button
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setInfo('') }}
          className="mt-6 text-base text-anker-accent/80 hover:text-anker-accent w-full text-center"
        >
          {mode === 'signin' ? 'Noch kein Konto? Registrieren' : 'Schon ein Konto? Einloggen'}
        </button>
      </div>
    </div>
  )
}
