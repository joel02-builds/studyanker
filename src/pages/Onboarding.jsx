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
            <img
              src="/maskottchen.png"
              alt="Klar"
              className="mx-auto mb-8"
              style={{ maxHeight: '180px' }}
            />
            <h1 className="text-2xl font-semibold text-anker-accent mb-3">
              Hallo! Ich bin Klar, dein Lernbegleiter.
            </h1>
            <p className="text-lg text-anker-muted mb-10">
              StudyAnker hilft dir, nach jeder Pause sofort weiterzumachen.
            </p>
            <button
              onClick={() => setSchritt(2)}
              className="w-full bg-anker-accent text-white py-3 rounded-xl text-base font-medium hover:opacity-90"
            >
              Wie funktioniert das?
            </button>
          </>
        )}

        {schritt === 2 && (
          <>
            <div className="mb-10 space-y-4">
              <div className="bg-anker-card border border-anker-border rounded-2xl p-5 text-left">
                <p className="text-sm text-anker-muted mb-1">Vor dem Aufhören</p>
                <p className="text-lg text-anker-text">Anker setzen (30 Sekunden)</p>
              </div>

              <div className="flex justify-center">
                <div className="w-px h-8 bg-anker-border" />
              </div>

              <div className="bg-anker-card border border-anker-border rounded-2xl p-5 text-left">
                <p className="text-sm text-anker-muted mb-1">Beim Weitermachen</p>
                <p className="text-lg text-anker-text">Anker lesen → sofort wissen wo du warst</p>
              </div>
            </div>
            <button
              onClick={() => setSchritt(3)}
              className="w-full bg-anker-accent text-white py-3 rounded-xl text-base font-medium hover:opacity-90"
            >
              Verstanden — los geht's
            </button>
          </>
        )}

        {schritt === 3 && (
          <>
            <h1 className="text-2xl font-semibold text-anker-accent mb-10">
              Setz gleich deinen ersten Anker. Was lernst du gerade?
            </h1>
            <button
              onClick={abschliessenUndWeiter}
              className="w-full bg-anker-accent text-white py-3 rounded-xl text-base font-medium hover:opacity-90"
            >
              Ersten Anker setzen →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
