import { Link } from 'react-router-dom'

export default function Impressum() {
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
          Impressum
        </h1>

        <div className="text-base text-anker-text space-y-4" style={{ lineHeight: 1.6 }}>
          <p>Angaben gemäß § 5 TMG:</p>
          <p>[Dein vollständiger Name]</p>
          <p>[Deine Adresse]</p>
          <p>[Deine Email]</p>
        </div>
      </div>
    </div>
  )
}
