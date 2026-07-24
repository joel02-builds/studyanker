import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

const TIMER_STANDARD = 25
const TIMER_MIN = 1
const TIMER_MAX = 180

function formatDatum(iso) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatZeit(sekunden) {
  const min = Math.floor(sekunden / 60).toString().padStart(2, '0')
  const sek = (sekunden % 60).toString().padStart(2, '0')
  return `${min}:${sek}`
}

export default function Dashboard() {
  const { signOut } = useAuth()
  const [anker, setAnker] = useState([])
  const [ankerAnzahl, setAnkerAnzahl] = useState(0)
  const [loading, setLoading] = useState(true)

  const [timerMinuten, setTimerMinuten] = useState(TIMER_STANDARD)
  const [timerLaeuft, setTimerLaeuft] = useState(false)
  const [timerFertig, setTimerFertig] = useState(false)
  const [verbleibend, setVerbleibend] = useState(TIMER_STANDARD * 60)
  const intervalRef = useRef(null)

  useEffect(() => {
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
      setLoading(false)
    }
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

  const letzterAnker = anker[0]
  const weitereAnker = anker.slice(1, 4)

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
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4 space-y-4">
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
          <h1 className="text-2xl font-semibold text-anker-accent mb-8">
            Hallo 👋 — wo warst du zuletzt?
          </h1>
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
                  className="flex justify-between items-center bg-white rounded-xl border border-slate-200 px-4 py-3"
                >
                  <span className="text-base text-slate-700">{a.fach}</span>
                  <span className="text-sm text-slate-400">{formatDatum(a.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
