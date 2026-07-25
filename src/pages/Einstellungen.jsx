import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../useTheme'

export default function Einstellungen() {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const [loeschenBestaetigen, setLoeschenBestaetigen] = useState(false)
  const [loeschenLaeuft, setLoeschenLaeuft] = useState(false)
  const [error, setError] = useState('')

  async function accountLoeschen() {
    setLoeschenLaeuft(true)
    setError('')

    try {
      await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
    } catch (e) {}

    // Session lokal clearen ohne Server-Call
    await supabase.auth.signOut({ scope: 'local' })
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-anker-bg px-6 py-8">
      <div className="max-w-[500px] mx-auto">
        <Link to="/" className="text-base text-anker-muted hover:text-anker-text">
          ← Zurück
        </Link>

        <h1
          style={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 400, color: 'var(--text-primary)' }}
          className="mt-6 mb-8"
        >
          Einstellungen
        </h1>

        <div className="bg-anker-card rounded-anker shadow-anker p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium text-anker-text">Dark Mode</p>
              <p className="text-sm text-anker-muted">Ruhiger für die Augen, besonders abends</p>
            </div>
            <button
              onClick={toggleTheme}
              role="switch"
              aria-checked={theme === 'dark'}
              className="relative w-14 h-8 rounded-full transition-colors"
              style={{ backgroundColor: theme === 'dark' ? 'var(--accent-primary)' : 'var(--border)' }}
            >
              <span
                className="absolute top-1 w-6 h-6 rounded-full bg-white transition-transform"
                style={{ transform: theme === 'dark' ? 'translateX(1.75rem)' : 'translateX(0.25rem)' }}
              />
            </button>
          </div>
        </div>

        <Link
          to="/faecher"
          className="block bg-anker-card rounded-anker shadow-anker p-6 mb-6 text-base text-anker-text hover:opacity-80"
        >
          Fächer verwalten
        </Link>

        <div className="border-t border-anker-border pt-6">
          {error && <p className="text-base text-red-600 mb-4">{error}</p>}

          {loeschenBestaetigen ? (
            <div className="bg-anker-card rounded-anker shadow-anker p-6 space-y-4" style={{ border: '1.5px solid #DC2626' }}>
              <p className="text-base text-anker-text">
                Wirklich? Alle Daten werden gelöscht.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={accountLoeschen}
                  disabled={loeschenLaeuft}
                  className="flex-1 bg-red-600 text-white py-2 rounded-anker-sm text-base font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {loeschenLaeuft ? 'Löschen...' : 'Ja, alles löschen'}
                </button>
                <button
                  onClick={() => setLoeschenBestaetigen(false)}
                  className="flex-1 border border-anker-border text-anker-text py-2 rounded-anker-sm text-base"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setLoeschenBestaetigen(true)}
              className="text-base text-red-600 hover:underline"
            >
              Account löschen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
