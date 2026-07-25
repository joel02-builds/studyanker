import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../useTheme'
import StudyAnkerLogo from '../components/StudyAnkerLogo'

export default function Onboarding() {
  const [schritt, setSchritt] = useState(1)
  const [erinnerungZeit, setErinnerungZeit] = useState('18:00')
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'

  function abschliessenUndWeiter() {
    localStorage.setItem('onboarding_done', 'true')
    navigate('/anker/neu')
  }

  async function handleReminderSetzen() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        localStorage.setItem('erinnerung_zeit', erinnerungZeit)
        localStorage.setItem('erinnerung_aktiv', 'true')
        navigator.serviceWorker?.ready.then((reg) => {
          reg.active?.postMessage({ type: 'SCHEDULE_REMINDER', time: erinnerungZeit })
        })
      }
    }
    setSchritt(4)
  }

  function handleReminderSkip() {
    setSchritt(4)
  }

  return (
    <div className="min-h-screen bg-anker-bg flex items-center justify-center px-6">
      <div className="w-full max-w-[400px] text-center">
        {schritt === 1 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <StudyAnkerLogo size={48} color={isDarkMode ? '#4E8098' : '#1C3A52'} />
            </div>
            <img
              src="/maskottchen.png"
              alt="Stan, StudyAnker Maskottchen"
              className="mx-auto mb-8"
              style={{ maxHeight: '180px' }}
            />
            <h1
              style={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 400, color: 'var(--text-primary)' }}
              className="mb-3"
            >
              Hallo! Ich bin Stan, dein Lernbegleiter.
            </h1>
            <p className="text-lg text-anker-muted mb-10">
              StudyAnker hilft dir, nach jeder Pause sofort weiterzumachen.
            </p>
            <button
              onClick={() => setSchritt(2)}
              className="w-full bg-anker-accent text-white rounded-anker text-base font-medium hover:opacity-90"
              style={{ padding: '1rem 2rem', transition: 'all 0.2s ease' }}
            >
              Wie funktioniert das?
            </button>
          </>
        )}

        {schritt === 2 && (
          <>
            <div className="mb-10 space-y-4">
              <div className="bg-anker-card rounded-anker shadow-anker p-5 text-left">
                <p className="text-sm text-anker-muted mb-1">Vor dem Aufhören</p>
                <p className="text-lg text-anker-text">Anker setzen (30 Sekunden)</p>
              </div>

              <div className="flex justify-center">
                <div className="w-px h-8 bg-anker-border" />
              </div>

              <div className="bg-anker-card rounded-anker shadow-anker p-5 text-left">
                <p className="text-sm text-anker-muted mb-1">Beim Weitermachen</p>
                <p className="text-lg text-anker-text">Anker lesen → sofort wissen wo du warst</p>
              </div>
            </div>
            <button
              onClick={() => setSchritt(3)}
              className="w-full bg-anker-accent text-white rounded-anker text-base font-medium hover:opacity-90"
              style={{ padding: '1rem 2rem', transition: 'all 0.2s ease' }}
            >
              Verstanden — los geht's
            </button>
          </>
        )}

        {schritt === 3 && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ fontSize: '1.5rem', fontFamily: 'Fraunces, serif', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Wann lernst du normalerweise?
            </p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
              Stan erinnert dich dann kurz — kein Druck, nur ein sanfter Impuls.
            </p>

            <input
              type="time"
              value={erinnerungZeit}
              onChange={(e) => setErinnerungZeit(e.target.value)}
              style={{
                fontSize: '2rem',
                border: 'none',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius)',
                padding: '0.75rem 1.5rem',
                color: 'var(--accent-primary)',
                fontFamily: 'Fraunces, serif',
                display: 'block',
                margin: '0 auto 1.5rem auto',
              }}
            />

            <button
              onClick={handleReminderSetzen}
              className="w-full bg-anker-accent text-white rounded-anker text-base font-medium hover:opacity-90"
              style={{ padding: '1rem 2rem', transition: 'all 0.2s ease' }}
            >
              Erinnere mich täglich ⚓
            </button>

            <button
              onClick={handleReminderSkip}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                marginTop: '1rem',
                cursor: 'pointer',
                display: 'block',
                margin: '1rem auto 0',
              }}
            >
              Lieber nicht — ich komme selbst
            </button>
          </div>
        )}

        {schritt === 4 && (
          <>
            <h1
              style={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 400, color: 'var(--text-primary)' }}
              className="mb-10"
            >
              Setz gleich deinen ersten Anker. Was lernst du gerade?
            </h1>
            <button
              onClick={abschliessenUndWeiter}
              className="w-full bg-anker-accent text-white rounded-anker text-base font-medium hover:opacity-90"
              style={{ padding: '1rem 2rem', transition: 'all 0.2s ease' }}
            >
              Ersten Anker setzen →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
