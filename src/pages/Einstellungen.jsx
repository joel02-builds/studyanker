import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../useTheme'

function sendeReminderAnServiceWorker(zeit) {
  navigator.serviceWorker?.ready.then((reg) => {
    reg.active?.postMessage({ type: 'SCHEDULE_REMINDER', time: zeit })
  })
}

export default function Einstellungen() {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const [loeschenBestaetigen, setLoeschenBestaetigen] = useState(false)
  const [loeschenLaeuft, setLoeschenLaeuft] = useState(false)
  const [error, setError] = useState('')

  const [erinnerungZeit, setErinnerungZeit] = useState(() => localStorage.getItem('erinnerung_zeit') || '18:00')
  const [erinnerungAktiv, setErinnerungAktiv] = useState(() => localStorage.getItem('erinnerung_aktiv') === 'true')
  const [erinnerungInfo, setErinnerungInfo] = useState('')

  useEffect(() => {
    if (erinnerungAktiv && 'Notification' in window && Notification.permission === 'granted') {
      sendeReminderAnServiceWorker(erinnerungZeit)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function erinnerungToggeln() {
    setErinnerungInfo('')

    if (erinnerungAktiv) {
      setErinnerungAktiv(false)
      localStorage.setItem('erinnerung_aktiv', 'false')
      navigator.serviceWorker?.ready.then((reg) => reg.active?.postMessage({ type: 'CANCEL_REMINDER' }))
      return
    }

    if (!('Notification' in window)) {
      setErinnerungInfo('Kein Problem — du kannst jederzeit manuell vorbeikommen.')
      return
    }

    const permission = await Notification.requestPermission()

    if (permission !== 'granted') {
      setErinnerungInfo('Kein Problem — du kannst jederzeit manuell vorbeikommen.')
      return
    }

    setErinnerungAktiv(true)
    localStorage.setItem('erinnerung_aktiv', 'true')
    sendeReminderAnServiceWorker(erinnerungZeit)
  }

  function zeitAendern(neueZeit) {
    setErinnerungZeit(neueZeit)
    localStorage.setItem('erinnerung_zeit', neueZeit)
    if (erinnerungAktiv) sendeReminderAnServiceWorker(neueZeit)
  }

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

        <div className="bg-anker-card rounded-anker shadow-anker p-6 mb-6 space-y-4">
          <div>
            <p className="text-base font-medium text-anker-text">Erinnerung</p>
            <p className="text-sm text-anker-muted">Wann lernst du normalerweise?</p>
          </div>

          <input
            type="time"
            value={erinnerungZeit}
            onChange={(e) => zeitAendern(e.target.value)}
            className="px-3 py-2 text-base bg-anker-bg border border-anker-border rounded-anker-sm focus:outline-none focus:ring-2 focus:ring-anker-accent2/30 focus:border-anker-accent2"
          />

          <div className="flex items-center justify-between">
            <p className="text-base text-anker-text">Erinnere mich täglich</p>
            <button
              onClick={erinnerungToggeln}
              role="switch"
              aria-checked={erinnerungAktiv}
              className="relative w-14 h-8 rounded-full transition-colors"
              style={{ backgroundColor: erinnerungAktiv ? 'var(--accent-primary)' : 'var(--border)' }}
            >
              <span
                className="absolute top-1 w-6 h-6 rounded-full bg-white transition-transform"
                style={{ transform: erinnerungAktiv ? 'translateX(1.75rem)' : 'translateX(0.25rem)' }}
              />
            </button>
          </div>

          {erinnerungInfo && <p className="text-sm text-anker-muted">{erinnerungInfo}</p>}
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
