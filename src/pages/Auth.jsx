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
  const { signIn, signUp } = useAuth()
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
