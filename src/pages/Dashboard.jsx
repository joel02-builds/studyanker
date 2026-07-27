import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { formatDatum, tageSeit } from '../lib/formatDatum'
import { track } from '../analytics'

const TIMER_STANDARD = 25
const TIMER_MIN = 1
const TIMER_MAX = 180
const DEFAULT_FARBE = '#1C3A52'
const RING_RADIUS = 60
const RING_UMFANG = 2 * Math.PI * RING_RADIUS

function hexZuRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function formatZeit(sekunden) {
  const min = Math.floor(sekunden / 60).toString().padStart(2, '0')
  const sek = (sekunden % 60).toString().padStart(2, '0')
  return `${min}:${sek}`
}

const primaryButton = {
  backgroundColor: 'var(--accent-primary)',
  padding: '1rem 2rem',
  transition: 'all 0.2s ease',
}

const WOCHENTAGE_KURZ = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function montagDieserWoche() {
  const heute = new Date()
  heute.setHours(0, 0, 0, 0)
  const versatz = (heute.getDay() + 6) % 7 // 0 = Montag
  const montag = new Date(heute)
  montag.setDate(heute.getDate() - versatz)
  return montag
}

const STAN_NACHRICHTEN = {
  morgens: ['Guten Morgen. Wo fängst du heute an?', 'Frischer Start — wo warst du zuletzt?'],
  mittags: ["Mittagspause? Kurz ankern bevor du weitermachst.", 'Wie läuft\'s heute?'],
  abends: ['Bevor du aufhörst — setz kurz einen Anker.', 'Guter Moment um festzuhalten wo du warst.'],
  nacht: ['Spät noch am Lernen? Respect. Kurz ankern.', 'Stan ist auch noch wach.'],
}

function stanNachricht() {
  const stunde = new Date().getHours()
  const zeitraum = stunde < 11 ? 'morgens' : stunde < 17 ? 'mittags' : stunde < 22 ? 'abends' : 'nacht'
  const nachrichten = STAN_NACHRICHTEN[zeitraum]
  const wochentag = new Date().getDay()
  return nachrichten[wochentag % nachrichten.length]
}

export default function Dashboard() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [anker, setAnker] = useState([])
  const [ankerAnzahl, setAnkerAnzahl] = useState(0)
  const [fachFarben, setFachFarben] = useState({})
  const [letzterKontakt, setLetzterKontakt] = useState([])
  const [loading, setLoading] = useState(true)
  const [offenesMenu, setOffenesMenu] = useState(null)
  const [loeschenBestaetigen, setLoeschenBestaetigen] = useState(null)
  const [retrievalAntwort, setRetrievalAntwort] = useState('')
  const [reinschauenOffen, setReinschauenOffen] = useState(false)
  const [wocheKreise, setWocheKreise] = useState([])
  const [wochenAnkerAnzahl, setWochenAnkerAnzahl] = useState(0)
  const [stanText, setStanText] = useState('')

  const [timerMinuten, setTimerMinuten] = useState(TIMER_STANDARD)
  const [timerLaeuft, setTimerLaeuft] = useState(false)
  const [timerFertig, setTimerFertig] = useState(false)
  const [verbleibend, setVerbleibend] = useState(TIMER_STANDARD * 60)
  const [gesamtSekunden, setGesamtSekunden] = useState(TIMER_STANDARD * 60)
  const intervalRef = useRef(null)

  function fachFarbe(fach) {
    return fachFarben[fach] ?? DEFAULT_FARBE
  }

  async function laden() {
    const { data, error } = await supabase
      .from('anker')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4)

    if (!error) setAnker(data)

    const { count } = await supabase
      .from('anker')
      .select('*', { count: 'exact', head: true })

    setAnkerAnzahl(count ?? 0)

    const { data: faecher } = await supabase.from('faecher').select('name, farbe')
    const bekannteFaecher = new Set()
    const fachFarbenLokal = {}
    if (faecher) {
      Object.assign(fachFarbenLokal, Object.fromEntries(faecher.map((f) => [f.name, f.farbe])))
      setFachFarben(fachFarbenLokal)
      faecher.forEach((f) => bekannteFaecher.add(f.name))
    }

    const montag = montagDieserWoche()
    const { data: wochenAnker } = await supabase
      .from('anker')
      .select('fach, created_at')
      .gte('created_at', montag.toISOString())

    if (wochenAnker) {
      setWochenAnkerAnzahl(wochenAnker.length)

      const tageMitAnker = new Map()
      for (const a of wochenAnker) {
        const key = new Date(a.created_at).toDateString()
        if (!tageMitAnker.has(key)) {
          const farbe = a.fach && bekannteFaecher.has(a.fach) ? fachFarbenLokal[a.fach] : null
          tageMitAnker.set(key, farbe)
        }
      }

      const kreise = Array.from({ length: 7 }, (_, i) => {
        const tag = new Date(montag)
        tag.setDate(montag.getDate() + i)
        const key = tag.toDateString()
        return { gefuellt: tageMitAnker.has(key), farbe: tageMitAnker.get(key) }
      })
      setWocheKreise(kreise)
    }

    const { data: alleAnker } = await supabase
      .from('anker')
      .select('fach, created_at')
      .order('created_at', { ascending: false })

    if (alleAnker) {
      const letzterProFach = new Map()
      for (const a of alleAnker) {
        if (!a.fach || !bekannteFaecher.has(a.fach)) continue
        if (!letzterProFach.has(a.fach)) letzterProFach.set(a.fach, a.created_at)
      }
      setLetzterKontakt(
        Array.from(letzterProFach.entries())
          .map(([fach, created_at]) => ({ fach, created_at }))
          .slice(0, 3)
      )
    }

    setLoading(false)
  }

  useEffect(() => {
    laden()
  }, [])

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (loading) return
    const heute = new Date().toDateString()

    if (anker.length > 0) {
      const letzte = localStorage.getItem('lastStanMessage')
      if (letzte !== heute) {
        setStanText(stanNachricht())
        localStorage.setItem('lastStanMessage', heute)
      }
    } else {
      setStanText(stanNachricht())
    }
  }, [loading, anker.length])

  function timerStarten() {
    track('timer_started', { minutes: timerMinuten })

    const sekunden = timerMinuten * 60
    setVerbleibend(sekunden)
    setGesamtSekunden(sekunden)
    setTimerFertig(false)
    setTimerLaeuft(true)

    intervalRef.current = setInterval(() => {
      setVerbleibend((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setTimerLaeuft(false)
          setTimerFertig(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function timerAbbrechen() {
    clearInterval(intervalRef.current)
    setTimerLaeuft(false)
    setVerbleibend(timerMinuten * 60)
  }

  async function ankerLoeschen(id) {
    const { error } = await supabase.from('anker').delete().eq('id', id)
    setLoeschenBestaetigen(null)
    setOffenesMenu(null)
    if (!error) laden()
  }

  const letzterAnker = anker[0]
  const weitereAnker = anker.slice(1, 4).filter((a) => a.fach && a.fach.trim() !== '')
  const ringFortschritt = gesamtSekunden > 0 ? verbleibend / gesamtSekunden : 0
  const ringOffset = RING_UMFANG * (1 - ringFortschritt)

  return (
    <div className="min-h-screen bg-anker-bg px-6 py-8">
      <div className="max-w-[500px] mx-auto">
        <div className="flex justify-end items-center gap-4 mb-6">
          <Link to="/einstellungen" className="text-lg text-anker-muted hover:text-anker-text" aria-label="Einstellungen">
            ⚙️
          </Link>
          <button onClick={signOut} className="text-sm text-anker-muted hover:text-anker-text">
            Ausloggen
          </button>
        </div>

        {loading ? (
          <p className="text-anker-muted text-base">Lädt...</p>
        ) : letzterAnker ? (
          <>
            <h1
              style={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 400, color: 'var(--text-primary)' }}
              className={stanText ? 'mb-1' : 'mb-6'}
            >
              Dein letzter Anker
            </h1>

            {stanText && (
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                {stanText}
              </p>
            )}
            <div
              className="bg-anker-card rounded-anker shadow-anker p-6 mb-4 space-y-4"
              style={{
                borderLeft: `4px solid ${fachFarbe(letzterAnker.fach)}`,
                backgroundColor: hexZuRgba(fachFarbe(letzterAnker.fach), 0.06),
              }}
            >
              <p className="text-lg font-semibold text-anker-text">{letzterAnker.fach}</p>

              {letzterAnker.wo_war_ich && (
                <div>
                  <p className="text-sm text-anker-muted mb-1">Wo war ich</p>
                  <p className="text-base text-anker-text">{letzterAnker.wo_war_ich}</p>
                </div>
              )}

              {letzterAnker.was_war_wichtig && (
                <div>
                  <p className="text-sm text-anker-muted mb-1">Was war wichtig</p>
                  <p className="text-base text-anker-text">{letzterAnker.was_war_wichtig}</p>
                </div>
              )}

              {letzterAnker.naechster_schritt && (
                <div>
                  <p className="text-xs uppercase text-anker-accent2 font-medium mb-1" style={{ letterSpacing: '0.08em' }}>
                    Nächster Schritt
                  </p>
                  <p className="text-anker-text font-semibold" style={{ fontSize: '1.1rem' }}>
                    → {letzterAnker.naechster_schritt}
                  </p>
                </div>
              )}
            </div>

            {wocheKreise.length > 0 && (
              <div className="mb-6 text-center">
                <div className="flex justify-center gap-2 mb-2">
                  {wocheKreise.map((tag, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          border: '2px solid var(--border)',
                          background: tag.gefuellt ? (tag.farbe ?? 'var(--accent-secondary)') : 'transparent',
                        }}
                      />
                      <span className="text-xs text-anker-faint">{WOCHENTAGE_KURZ[i]}</span>
                    </div>
                  ))}
                </div>
                {wochenAnkerAnzahl > 0 && (
                  <p className="text-sm text-anker-faint">
                    {wocheKreise.every((t) => t.gefuellt)
                      ? 'Starke Woche. ⚓'
                      : `Diese Woche: ${wochenAnkerAnzahl} Anker ⚓`}
                  </p>
                )}
              </div>
            )}

            {letzterAnker.feynman_satz && !timerLaeuft && !timerFertig && (
              <div
                className="p-6 mb-4 space-y-3"
                style={{
                  background: 'var(--bg-subtle)',
                  border: 'none',
                  borderLeft: '3px solid var(--accent-secondary)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <p className="text-base text-anker-text">
                  Erinnerst du dich noch? → {letzterAnker.feynman_satz}
                </p>
                <input
                  type="text"
                  placeholder="Was fällt dir dazu noch ein?"
                  value={retrievalAntwort}
                  onChange={(e) => setRetrievalAntwort(e.target.value)}
                  className="w-full px-4 py-2 text-base bg-anker-bg border border-anker-border rounded-anker-sm focus:outline-none focus:ring-2 focus:ring-anker-accent2/40 focus:border-anker-accent2"
                />
              </div>
            )}

            {letzterKontakt.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-x-4 gap-y-1.5">
                {letzterKontakt.map((k) => {
                  const gedimmt = tageSeit(k.created_at) > 5
                  return (
                    <div
                      key={k.fach}
                      className="flex items-center gap-2 text-sm"
                      style={{ opacity: gedimmt ? 0.5 : 1 }}
                    >
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: fachFarbe(k.fach) }}
                      />
                      <span className="text-anker-muted">{k.fach}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {ankerAnzahl >= 3 ? (
              <div
                onClick={() => navigate('/zusammenfassung')}
                style={{
                  background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                  borderRadius: 'var(--radius)',
                  padding: '1rem 1.25rem',
                  cursor: 'pointer',
                  color: 'white',
                }}
                className="mb-4"
              >
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '4px' }}>KI-ZUSAMMENFASSUNG</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: '1.1rem' }}>
                  ✨ Mein Lernkontext — was hat Stan für dich?
                </div>
              </div>
            ) : (
              <Link
                to="/zusammenfassung"
                className="block w-full text-center text-anker-accent py-3 text-base font-medium hover:opacity-80 mb-4"
              >
                🧠 Mein Lernkontext
              </Link>
            )}

            <button
              onClick={() => setReinschauenOffen(!reinschauenOffen)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'transparent',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.95rem',
                marginBottom: '0.75rem',
              }}
            >
              👁 Kurz reinschauen
            </button>

            {reinschauenOffen && (
              <div
                className="bg-anker-card rounded-anker shadow-anker p-5 mb-4 space-y-3"
                style={{
                  borderLeft: `4px solid ${fachFarbe(letzterAnker.fach)}`,
                  backgroundColor: hexZuRgba(fachFarbe(letzterAnker.fach), 0.06),
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: fachFarbe(letzterAnker.fach) }}
                  />
                  <span className="font-semibold text-anker-text">{letzterAnker.fach || 'Ohne Fach'}</span>
                </div>
                {letzterAnker.wo_war_ich && (
                  <p className="text-base text-anker-text">{letzterAnker.wo_war_ich}</p>
                )}
                {letzterAnker.naechster_schritt && (
                  <p className="text-base font-semibold text-anker-text">→ {letzterAnker.naechster_schritt}</p>
                )}
                <button
                  onClick={() => setReinschauenOffen(false)}
                  className="w-full text-center text-white rounded-anker font-medium hover:opacity-90"
                  style={{ backgroundColor: 'var(--accent-primary)', padding: '0.6rem 1rem', transition: 'all 0.2s ease' }}
                >
                  Alles klar, weiter ✓
                </button>
              </div>
            )}

            <Link
              to="/anker/neu"
              className="block w-full text-center bg-anker-accent text-white rounded-anker text-base font-medium hover:opacity-90 mb-8"
              style={primaryButton}
            >
              Neuen Anker setzen
            </Link>

            <div className="mb-8 text-center">
              {timerFertig ? (
                <div className="space-y-3">
                  <p className="text-base text-anker-text mb-1">{timerMinuten} Minuten geschafft! 🎉</p>
                  <Link
                    to="/anker/neu"
                    className="block w-full text-center text-white rounded-anker text-base font-medium hover:opacity-90"
                    style={{ backgroundColor: 'var(--accent-primary)', padding: '0.75rem 1.5rem', transition: 'all 0.2s ease' }}
                  >
                    Anker aktualisieren ⚓
                  </Link>
                  <button
                    onClick={timerStarten}
                    className="block w-full text-center border border-anker-border text-anker-text rounded-anker text-base font-medium hover:bg-anker-bg"
                    style={{ padding: '0.75rem 1.5rem', transition: 'all 0.2s ease' }}
                  >
                    Weiterlaufen — ich bin im Flow 🌊
                  </button>
                </div>
              ) : timerLaeuft ? (
                <div>
                  <div className="relative mx-auto mb-4" style={{ width: 140, height: 140 }}>
                    <svg width="140" height="140" viewBox="0 0 140 140">
                      <circle
                        cx="70"
                        cy="70"
                        r={RING_RADIUS}
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="70"
                        cy="70"
                        r={RING_RADIUS}
                        fill="none"
                        stroke="var(--accent-primary)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={RING_UMFANG}
                        strokeDashoffset={ringOffset}
                        transform="rotate(-90 70 70)"
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        style={{ fontFamily: 'Fraunces, serif', color: 'var(--accent-primary)' }}
                        className="text-3xl tracking-wide"
                      >
                        {formatZeit(verbleibend)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={timerAbbrechen}
                    className="border border-anker-border text-anker-muted rounded-anker text-sm font-medium hover:bg-anker-subtle"
                    style={{ padding: '0.5rem 1.25rem', transition: 'all 0.2s ease' }}
                  >
                    Timer läuft... (abbrechen)
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-anker-faint mb-3">Fokus-Timer</p>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <input
                      type="number"
                      inputMode="numeric"
                      min={TIMER_MIN}
                      max={TIMER_MAX}
                      value={timerMinuten}
                      onChange={(e) => {
                        const wert = e.target.value
                        if (wert === '') {
                          setTimerMinuten('')
                          return
                        }
                        const zahl = Math.min(TIMER_MAX, Math.max(TIMER_MIN, Number(wert)))
                        setTimerMinuten(zahl)
                      }}
                      onBlur={() => {
                        if (timerMinuten === '' || Number.isNaN(timerMinuten)) {
                          setTimerMinuten(TIMER_STANDARD)
                        }
                      }}
                      style={{ fontFamily: 'Fraunces, serif', color: 'var(--accent-primary)' }}
                      className="w-20 text-center text-3xl border border-anker-border rounded-anker-sm py-1 focus:outline-none focus:ring-2 focus:ring-anker-accent2/40 focus:border-anker-accent2 bg-transparent"
                    />
                    <span className="text-base text-anker-muted">Minuten</span>
                  </div>
                  <button
                    onClick={timerStarten}
                    disabled={timerMinuten === ''}
                    className="border border-anker-accent text-anker-accent rounded-anker text-sm font-medium hover:bg-anker-subtle disabled:opacity-50"
                    style={{ padding: '0.5rem 1.25rem', transition: 'all 0.2s ease' }}
                  >
                    ⏱ Fokus-Timer starten ({timerMinuten || TIMER_STANDARD} Min)
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="mb-8 text-center">
              <img
                src="/maskottchen.png"
                alt="Stan, StudyAnker Maskottchen"
                className="mx-auto mb-4"
                style={{ height: '80px' }}
              />
              <h1
                style={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 400, color: 'var(--text-primary)' }}
              >
                Stan ist bereit — setz deinen ersten Anker ⚓
              </h1>
              {stanText && (
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  {stanText}
                </p>
              )}
            </div>

            <Link
              to="/anker/neu"
              className="block w-full text-center bg-anker-accent text-white rounded-anker text-base font-medium hover:opacity-90 mb-6"
              style={primaryButton}
            >
              Neuen Anker setzen
            </Link>
          </>
        )}

        {weitereAnker.length > 0 && (
          <div>
            <p className="text-sm text-anker-muted mb-3">Deine Anker</p>
            <div className="space-y-2">
              {weitereAnker.map((a) => (
                <div
                  key={a.id}
                  className="relative bg-anker-card rounded-anker-sm shadow-anker px-4 py-3"
                  style={{ borderLeft: `4px solid ${fachFarbe(a.fach)}` }}
                >
                  {loeschenBestaetigen === a.id ? (
                    <div className="flex items-center justify-between">
                      <span className="text-base text-anker-text">Wirklich löschen?</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => ankerLoeschen(a.id)}
                          className="text-sm text-red-600 font-medium px-2 py-1 hover:bg-red-50 rounded-anker-sm"
                        >
                          Löschen
                        </button>
                        <button
                          onClick={() => setLoeschenBestaetigen(null)}
                          className="text-sm text-anker-muted px-2 py-1 hover:bg-anker-bg rounded-anker-sm"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-base text-anker-text">{a.fach}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-anker-muted">{formatDatum(a.created_at)}</span>
                        <button
                          onClick={() => setOffenesMenu(offenesMenu === a.id ? null : a.id)}
                          className="text-anker-muted hover:text-anker-text px-1 text-lg leading-none"
                          aria-label="Optionen"
                        >
                          ···
                        </button>
                      </div>
                    </div>
                  )}

                  {offenesMenu === a.id && loeschenBestaetigen !== a.id && (
                    <div className="absolute right-4 top-full mt-1 bg-anker-card border border-anker-border rounded-anker-sm shadow-anker-hover overflow-hidden z-10">
                      <button
                        onClick={() => navigate(`/anker/bearbeiten/${a.id}`)}
                        className="block w-full text-left px-4 py-2 text-base text-anker-text hover:bg-anker-bg"
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => { setLoeschenBestaetigen(a.id); setOffenesMenu(null) }}
                        className="block w-full text-left px-4 py-2 text-base text-red-600 hover:bg-red-50"
                      >
                        Löschen
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
