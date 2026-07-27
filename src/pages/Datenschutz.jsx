import { Link } from 'react-router-dom'

export default function Datenschutz() {
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
          Datenschutz
        </h1>

        <div className="text-base text-anker-text space-y-4" style={{ lineHeight: 1.6 }}>
          <p>
            StudyAnker speichert nur die Daten die du selbst eingibst (Lern-Anker, Fächer).
          </p>
          <p>Keine Weitergabe an Dritte.</p>
          <p>Hosting in der EU (Supabase Frankfurt, Vercel Frankfurt).</p>
          <p>Kontakt: [deine Email]</p>
          <p>Anbieter: [dein Name], [deine Stadt]</p>
        </div>
      </div>
    </div>
  )
}
