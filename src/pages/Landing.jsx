import { useNavigate } from 'react-router-dom'
import { useTheme } from '../useTheme'
import StudyAnkerLogo from '../components/StudyAnkerLogo'

const PROBLEME = [
  { emoji: '😶', text: 'Du setzt dich hin um weiterzulernen — und weißt nicht mehr wo du warst.' },
  { emoji: '⏱', text: 'Du verlierst 20-30 Minuten nur damit du wieder reinkommst.' },
  { emoji: '😮‍💨', text: 'Du hast alles aufgeschrieben — aber schaust es nie wieder an.' },
]

const SCHRITTE = [
  { step: '1', title: 'Anker setzen', desc: 'Wenn du aufhörst: 30 Sekunden. Wo bist du? Was war wichtig? Was kommt als nächstes?', icon: '⚓' },
  { step: '2', title: 'Pause machen', desc: 'Geh essen, schlaf, leb dein Leben. Stan hält deinen Platz frei.', icon: '😴' },
  { step: '3', title: 'Sofort weitermachen', desc: 'Beim nächsten Öffnen siehst du sofort wo du warst. Kein Suchen. Kein Erinnern. Einfach anfangen.', icon: '🚀' },
]

const ZIELGRUPPE = [
  '...ADHS hast und immer wieder neu anfangen musst',
  '...Schwierigkeiten hast nach Pausen in den Lernfluss zu kommen',
  '...dich beim Lernen oft fragst "wo war ich nochmal?"',
  '...Notizen machst aber sie nie wieder anschaust',
  '...einfach einen klaren Kopf beim Wiedereinstieg brauchst',
]

const primaryButtonStyle = {
  background: 'var(--accent-primary)',
  color: 'white',
  border: 'none',
  borderRadius: 'var(--radius)',
  padding: '1rem 2.5rem',
  fontSize: '1.1rem',
  fontFamily: 'Fraunces, serif',
  cursor: 'pointer',
}

const sectionHeadingStyle = {
  fontFamily: 'Fraunces, serif',
  textAlign: 'center',
  color: 'var(--accent-primary)',
  marginBottom: '2rem',
  fontSize: '1.5rem',
}

export default function Landing() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'
  const logoColor = isDarkMode ? '#4E8098' : '#1C3A52'

  return (
    <div className="bg-anker-bg">
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StudyAnkerLogo size={32} color={logoColor} />
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: '1.2rem', color: 'var(--accent-primary)' }}>
            StudyAnker
          </span>
        </div>
        <a href="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Einloggen
        </a>
      </header>

      <section style={{ textAlign: 'center', padding: '4rem 1.5rem 3rem' }}>
        <StudyAnkerLogo size={72} color={logoColor} />

        <h1
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            color: 'var(--accent-primary)',
            margin: '1.5rem 0 1rem',
            lineHeight: 1.2,
          }}
        >
          Weißt du noch<br />wo du warst?
        </h1>

        <p
          style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            maxWidth: '480px',
            margin: '0 auto 2rem',
            lineHeight: 1.6,
          }}
        >
          StudyAnker hilft dir nach jeder Lernpause sofort weiterzumachen —
          ohne den Faden zu verlieren. Entwickelt für Studierende mit ADHS.
        </p>

        <button onClick={() => navigate('/login')} style={primaryButtonStyle}>
          Kostenlos starten ⚓
        </button>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
          Kein Abo. Keine Kreditkarte. Einfach loslegen.
        </p>
      </section>

      <section style={{ padding: '2rem 1.5rem', background: 'var(--bg-subtle)' }}>
        <h2 style={sectionHeadingStyle}>Kennst du das?</h2>

        {PROBLEME.map((item, i) => (
          <div
            key={i}
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius)',
              padding: '1.25rem',
              marginBottom: '1rem',
              boxShadow: 'var(--shadow)',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>{item.emoji}</span>
            <p style={{ color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>{item.text}</p>
          </div>
        ))}
      </section>

      <section style={{ padding: '3rem 1.5rem' }}>
        <h2 style={sectionHeadingStyle}>So funktioniert StudyAnker</h2>

        {SCHRITTE.map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '2rem',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Fraunces, serif',
                fontSize: '1.1rem',
                flexShrink: 0,
              }}
            >
              {item.step}
            </div>
            <div>
              <h3 style={{ fontFamily: 'Fraunces, serif', color: 'var(--accent-primary)', margin: '0 0 0.25rem' }}>
                {item.icon} {item.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section style={{ padding: '2rem 1.5rem', background: 'var(--bg-subtle)' }}>
        <h2 style={{ ...sectionHeadingStyle, marginBottom: '1.5rem' }}>Für dich, wenn du...</h2>

        {ZIELGRUPPE.map((text, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '0.75rem',
              marginBottom: '0.75rem',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ color: 'var(--accent-secondary)', fontSize: '1.1rem' }}>✓</span>
            <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: 1.5 }}>{text}</p>
          </div>
        ))}
      </section>

      <section style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <StudyAnkerLogo size={48} color={logoColor} />
        <h2
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: '1.75rem',
            color: 'var(--accent-primary)',
            margin: '1rem 0 0.5rem',
          }}
        >
          Bereit anzufangen?
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Kostenlos. Kein Abo. Keine Kreditkarte.
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{ ...primaryButtonStyle, width: '100%', maxWidth: '320px' }}
        >
          Kostenlos starten ⚓
        </button>
      </section>

      <footer
        style={{
          padding: '1.5rem',
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
        }}
      >
        <p>
          © 2026 StudyAnker ·
          <a href="/datenschutz" style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>Datenschutz</a> ·
          <a href="/impressum" style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>Impressum</a>
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          Entwickelt mit ❤️ für Studierende mit ADHS
        </p>
      </footer>
    </div>
  )
}
