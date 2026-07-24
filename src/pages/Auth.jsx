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
          <h1 className="text-3xl font-semibold text-anker-accent">StudyAnker</h1>
          <p className="mt-2 text-slate-500 text-base">Weißt du noch wo du warst?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-base text-slate-600 mb-2">E-Mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-base bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-anker-accent/40 focus:border-anker-accent"
            />
          </div>

          <div>
            <label className="block text-base text-slate-600 mb-2">Passwort</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-base bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-anker-accent/40 focus:border-anker-accent"
            />
          </div>

          {error && <p className="text-base text-red-600">{error}</p>}
          {info && <p className="text-base text-emerald-700">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-anker-accent text-white py-3 rounded-xl text-base font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? '...' : mode === 'signin' ? 'Einloggen' : 'Registrieren'}
          </button>
        </form>

        {mode === 'signin' && (
          <button
            onClick={() => { setResetOffen(!resetOffen); setResetInfo(''); setResetError('') }}
            className="mt-4 text-sm text-slate-400 hover:text-slate-600 w-full text-center"
          >
            Passwort vergessen?
          </button>
        )}

        {resetOffen && (
          <form onSubmit={handleReset} className="mt-4 p-4 bg-white border border-slate-200 rounded-xl space-y-3">
            <label className="block text-sm text-slate-600">
              Wir schicken dir einen Link zum Zurücksetzen.
            </label>
            <input
              type="email"
              required
              placeholder="E-Mail"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full px-3 py-2 text-base bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-anker-accent/40 focus:border-anker-accent"
            />

            {resetError && <p className="text-sm text-red-600">{resetError}</p>}
            {resetInfo && <p className="text-sm text-emerald-700">{resetInfo}</p>}

            <button
              type="submit"
              disabled={resetLoading}
              className="w-full bg-anker-accent text-white py-2 rounded-lg text-base font-medium hover:opacity-90 disabled:opacity-50"
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
