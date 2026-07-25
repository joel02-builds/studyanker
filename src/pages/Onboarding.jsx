import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Onboarding() {
  const [schritt, setSchritt] = useState(1)
  const navigate = useNavigate()

  function abschliessenUndWeiter() {
    localStorage.setItem('onboarding_done', 'true')
    navigate('/anker/neu')
  }

  return (
    <div className="min-h-screen bg-anker-bg flex items-center justify-center px-6">
      <div className="w-full max-w-[400px] text-center">
        {schritt === 1 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
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
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: '1.5rem', fontWeight: 400, color: 'var(--accent-primary)' }}>
                StudyAnker
              </span>
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
