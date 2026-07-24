import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

const TIMER_STANDARD = 25
const TIMER_MIN = 1
const TIMER_MAX = 180
const DEFAULT_FARBE = '#2D4A6B'

function hexZuRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function formatDatum(iso) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatZeit(sekunden) {
  const min = Math.floor(sekunden / 60).toString().padStart(2, '0')
  const sek = (sekunden % 60).toString().padStart(2, '0')
  return `${min}:${sek}`
}

function tageSeit(iso) {
  const diffMs = Date.now() - new Date(iso).getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

function formatTageSeit(tage) {
  if (tage <= 0) return 'heute'
  if (tage === 1) return 'vor 1 Tag'
  return `vor ${tage} Tagen`
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

  const [timerMinuten, setTimerMinuten] = useState(TIMER_STANDARD)
  const [timerLaeuft, setTimerLaeuft] = useState(false)
  const [timerFertig, setTimerFertig] = useState(false)
  const [verbleibend, setVerbleibend] = useState(TIMER_STANDARD * 60)
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
    if (faecher) {
      setFachFarben(Object.fromEntries(faecher.map((f) => [f.name, f.farbe])))
    }

    const { data: alleAnker } = await supabase
      .from('anker')
      .select('fach, created_at')
      .order('created_at', { ascending: false })

    if (alleAnker) {
      const letzterProFach = new Map()
      for (const a of alleAnker) {
        if (!a.fach || a.fach.trim() === '') continue
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

  function timerStarten() {
    setVerbleibend(timerMinuten * 60)
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

  return (
    <div className="min-h-screen bg-anker-bg px-6 py-8">
      <div className="max-w-[500px] mx-auto">
        <div className="flex justify-end mb-6">
          <button onClick={signOut} className="text-sm text-slate-400 hover:text-slate-600">
            Ausloggen
          </button>
        </div>

        {loading ? (
          <p className="text-slate-500 text-base">Lädt...</p>
        ) : letzterAnker ? (
          <>
            <h1 className="text-2xl font-semibold text-anker-accent mb-6">Dein letzter Anker</h1>
            <div
              className="bg-white rounded-2xl border border-slate-200 p-6 mb-4 space-y-4"
              style={{
                borderLeft: `4px solid ${fachFarbe(letzterAnker.fach)}`,
                backgroundColor: hexZuRgba(fachFarbe(letzterAnker.fach), 0.1),
              }}
            >
              <p className="text-lg font-semibold text-slate-800">{letzterAnker.fach}</p>

              {letzterAnker.wo_war_ich && (
                <div>
                  <p className="text-sm text-slate-400 mb-1">Wo war ich</p>
                  <p className="text-base text-slate-700">{letzterAnker.wo_war_ich}</p>
                </div>
              )}

              {letzterAnker.was_war_wichtig && (
                <div>
                  <p className="text-sm text-slate-400 mb-1">Was war wichtig</p>
                  <p className="text-base text-slate-700">{letzterAnker.was_war_wichtig}</p>
                </div>
              )}

              {letzterAnker.naechster_schritt && (
                <div>
                  <p className="text-sm text-slate-400 mb-1">Nächster Schritt</p>
                  <p className="text-base text-slate-700">{letzterAnker.naechster_schritt}</p>
                </div>
              )}
            </div>

            {letzterAnker.feynman_satz && !timerLaeuft && !timerFertig && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4 space-y-3">
                <p className="text-base text-slate-700">
                  Erinnerst du dich noch? → {letzterAnker.feynman_satz}
                </p>
                <input
                  type="text"
                  placeholder="Was fällt dir dazu noch ein?"
                  value={retrievalAntwort}
                  onChange={(e) => setRetrievalAntwort(e.target.value)}
                  className="w-full px-4 py-2 text-base bg-anker-bg border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-anker-accent/40 focus:border-anker-accent"
                />
              </div>
            )}

            {letzterKontakt.length > 0 && (
              <div className="mb-4 space-y-1.5">
                {letzterKontakt.map((k) => {
                  const tage = tageSeit(k.created_at)
                  const gedimmt = tage > 5
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
                      <span className="text-slate-500">
                        {k.fach} — zuletzt {formatTageSeit(tage)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mb-8">
              {timerFertig ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                  <p className="text-base text-slate-700 mb-4">{timerMinuten} Minuten geschafft! 🎉 Anker aktualisieren?</p>
                  <Link
                    to="/anker/neu"
                    className="block w-full text-center bg-anker-accent text-white py-3 rounded-xl text-base font-medium hover:opacity-90"
                  >
                    Anker aktualisieren
                  </Link>
                </div>
              ) : timerLaeuft ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                  <p className="text-4xl font-semibold text-anker-accent tracking-wide mb-4">
                    {formatZeit(verbleibend)}
                  </p>
                  <button
                    onClick={timerAbbrechen}
                    className="w-full text-center border border-slate-300 text-slate-600 py-3 rounded-xl text-base font-medium hover:bg-slate-50"
                  >
                    Timer läuft... (abbrechen)
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <label className="block text-sm text-slate-400 mb-2 text-center">
                    Wie viele Minuten?
                  </label>
                  <div className="flex items-center justify-center gap-3 mb-5">
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
                      className="w-28 text-center text-4xl font-semibold text-anker-accent border border-slate-200 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-anker-accent/40 focus:border-anker-accent"
                    />
                    <span className="text-lg text-slate-500">Minuten</span>
                  </div>
                  <button
                    onClick={timerStarten}
                    disabled={timerMinuten === ''}
                    className="block w-full text-center border border-anker-accent text-anker-accent py-3 rounded-xl text-base font-medium hover:bg-anker-bg disabled:opacity-50"
                  >
                    ⏱ Fokus-Timer starten ({timerMinuten || TIMER_STANDARD} Min)
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="mb-8 text-center">
            <img
              src="/maskottchen.png"
              alt="Klar"
              className="mx-auto mb-4"
              style={{ height: '80px' }}
            />
            <h1 className="text-2xl font-semibold text-anker-accent">
              Klar ist bereit — setz deinen ersten Anker ⚓
            </h1>
          </div>
        )}

        <Link
          to="/anker/neu"
          className="block w-full text-center bg-anker-accent text-white py-4 rounded-xl text-base font-medium hover:opacity-90 mb-4"
        >
          Neuen Anker setzen
        </Link>

        {ankerAnzahl >= 3 && (
          <Link
            to="/zusammenfassung"
            className="block w-full text-center text-anker-accent py-3 text-base font-medium hover:opacity-80 mb-10"
          >
            🧠 Mein Lernkontext
          </Link>
        )}

        {weitereAnker.length > 0 && (
          <div>
            <p className="text-sm text-slate-400 mb-3">Zuletzt</p>
            <div className="space-y-2">
              {weitereAnker.map((a) => (
                <div
                  key={a.id}
                  className="relative bg-white rounded-xl border border-slate-200 px-4 py-3"
                  style={{ borderLeft: `4px solid ${fachFarbe(a.fach)}` }}
                >
                  {loeschenBestaetigen === a.id ? (
                    <div className="flex items-center justify-between">
                      <span className="text-base text-slate-700">Wirklich löschen?</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => ankerLoeschen(a.id)}
                          className="text-sm text-red-600 font-medium px-2 py-1 hover:bg-red-50 rounded-lg"
                        >
                          Löschen
                        </button>
                        <button
                          onClick={() => setLoeschenBestaetigen(null)}
                          className="text-sm text-slate-500 px-2 py-1 hover:bg-slate-50 rounded-lg"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-base text-slate-700">{a.fach}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400">{formatDatum(a.created_at)}</span>
                        <button
                          onClick={() => setOffenesMenu(offenesMenu === a.id ? null : a.id)}
                          className="text-slate-400 hover:text-slate-600 px-1 text-lg leading-none"
                          aria-label="Optionen"
                        >
                          ···
                        </button>
                      </div>
                    </div>
                  )}

                  {offenesMenu === a.id && loeschenBestaetigen !== a.id && (
                    <div className="absolute right-4 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden z-10">
                      <button
                        onClick={() => navigate(`/anker/bearbeiten/${a.id}`)}
                        className="block w-full text-left px-4 py-2 text-base text-slate-700 hover:bg-slate-50"
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
