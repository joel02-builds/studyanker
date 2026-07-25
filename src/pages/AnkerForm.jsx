import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { useSpeechInput } from '../useSpeechInput'

const LEER = { fach: '', wo_war_ich: '', was_war_wichtig: '', naechster_schritt: '', feynman_satz: '' }

function BestaetigungsAnsicht() {
  const [sichtbar, setSichtbar] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSichtbar(true), 10)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-anker-bg flex items-center justify-center">
      <div
        className="text-center"
        style={{ opacity: sichtbar ? 1 : 0, transition: 'opacity 0.4s ease' }}
      >
        <p className="text-6xl mb-4">⚓</p>
        <p className="text-xl font-semibold text-anker-accent">Anker gesetzt.</p>
      </div>
    </div>
  )
}

function SprachFeld({ label, placeholder, value, onChange, rows = 2, required = false }) {
  const { isListening, startListening, stopListening, supported } = useSpeechInput((text) => {
    onChange(value ? `${value} ${text}` : text)
  })

  return (
    <div>
      <label className="block text-base text-anker-muted mb-2">{label}</label>
      <div className="relative">
        <textarea
          rows={rows}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-3 ${supported ? 'pr-12' : ''} text-base bg-anker-card border border-anker-border rounded-xl focus:outline-none focus:ring-2 focus:ring-anker-accent/40 focus:border-anker-accent`}
        />
        {supported && (
          <button
            type="button"
            onClick={() => (isListening ? stopListening() : startListening())}
            className={`absolute top-3 right-3 text-lg leading-none ${isListening ? 'animate-pulse text-red-500' : 'text-anker-muted hover:text-anker-accent'}`}
            aria-label={isListening ? 'Aufnahme stoppen' : 'Spracheingabe starten'}
          >
            🎤
          </button>
        )}
      </div>
    </div>
  )
}

export default function AnkerForm() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const bearbeitenModus = Boolean(id)

  const [form, setForm] = useState(LEER)
  const [faecher, setFaecher] = useState([])
  const [ladenFaecher, setLadenFaecher] = useState(true)
  const [ladenAnker, setLadenAnker] = useState(bearbeitenModus)
  const [saving, setSaving] = useState(false)
  const [gespeichert, setGespeichert] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function faecherLaden() {
      const { data, error } = await supabase
        .from('faecher')
        .select('*')
        .order('created_at', { ascending: true })

      if (!error) setFaecher(data)
      setLadenFaecher(false)
    }
    faecherLaden()
  }, [])

  useEffect(() => {
    if (!bearbeitenModus) return

    async function ankerLaden() {
      const { data, error } = await supabase
        .from('anker')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data) {
        setForm({
          fach: data.fach ?? '',
          wo_war_ich: data.wo_war_ich ?? '',
          was_war_wichtig: data.was_war_wichtig ?? '',
          naechster_schritt: data.naechster_schritt ?? '',
          feynman_satz: data.feynman_satz ?? '',
        })
      }
      setLadenAnker(false)
    }
    ankerLaden()
  }, [id, bearbeitenModus])

  useEffect(() => {
    if (!gespeichert) return
    const t = setTimeout(() => navigate('/'), 1200)
    return () => clearTimeout(t)
  }, [gespeichert, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const { error } = bearbeitenModus
      ? await supabase.from('anker').update(form).eq('id', id)
      : await supabase.from('anker').insert({ ...form, user_id: user.id })

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setGespeichert(true)
  }

  if (gespeichert) {
    return <BestaetigungsAnsicht />
  }

  const nurKurzAnkern =
    form.wo_war_ich.trim() !== '' &&
    !form.was_war_wichtig.trim() &&
    !form.naechster_schritt.trim() &&
    !form.feynman_satz.trim()

  if (ladenAnker) {
    return (
      <div className="min-h-screen bg-anker-bg flex items-center justify-center">
        <p className="text-anker-muted text-base">Lädt...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-anker-bg px-6 py-8">
      <div className="max-w-[500px] mx-auto">
        <Link to="/" className="text-base text-anker-muted hover:text-anker-text">
          ← Zurück
        </Link>

        <h1 className="text-2xl font-semibold text-anker-accent mt-6 mb-8">
          {bearbeitenModus ? 'Anker bearbeiten' : 'Anker setzen — wo bist du gerade?'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-base text-anker-muted mb-2">Welches Fach?</label>
            <div className="flex gap-3">
              <select
                value={form.fach}
                onChange={(e) => setForm({ ...form, fach: e.target.value })}
                disabled={ladenFaecher}
                className="flex-1 px-4 py-3 text-base bg-anker-card border border-anker-border rounded-xl focus:outline-none focus:ring-2 focus:ring-anker-accent/40 focus:border-anker-accent"
              >
                <option value="">
                  {ladenFaecher ? 'Lädt...' : 'Kein Fach — einfach loslegen'}
                </option>
                {faecher.map((f) => (
                  <option key={f.id} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
              <Link
                to="/faecher?from=anker"
                className="w-12 flex items-center justify-center text-xl bg-anker-card border border-anker-border rounded-xl text-anker-accent hover:bg-anker-bg"
                aria-label="Fach hinzufügen"
              >
                +
              </Link>
            </div>
          </div>

          <SprachFeld
            label="Wo genau bist du? (Kapitel, Seite, Thema)"
            placeholder="z.B. Kapitel 4, Seite 67 — Photosynthese"
            value={form.wo_war_ich}
            onChange={(text) => setForm((f) => ({ ...f, wo_war_ich: text }))}
            required
          />

          <SprachFeld
            label="Was solltest du nicht vergessen? (optional)"
            placeholder="z.B. Der Unterschied zwischen X und Y war mir neu"
            value={form.was_war_wichtig}
            onChange={(text) => setForm((f) => ({ ...f, was_war_wichtig: text }))}
          />

          <SprachFeld
            label="Was ist dein erster Schritt beim nächsten Mal? (optional)"
            placeholder="z.B. Aufgaben 3-5 auf Seite 71 lösen"
            value={form.naechster_schritt}
            onChange={(text) => setForm((f) => ({ ...f, naechster_schritt: text }))}
          />

          <div className="pt-4 border-t border-anker-border">
            <SprachFeld
              label="💡 Optional: Was hast du heute wirklich verstanden?"
              placeholder="z.B. Photosynthese ist wie eine Fabrik die aus Licht Zucker macht"
              value={form.feynman_satz}
              onChange={(text) => setForm((f) => ({ ...f, feynman_satz: text }))}
            />
          </div>

          {error && <p className="text-base text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-anker-accent text-white py-4 rounded-xl text-base font-medium hover:opacity-90 disabled:opacity-50"
          >
            {saving
              ? 'Speichern...'
              : bearbeitenModus
                ? 'Änderungen speichern'
                : nurKurzAnkern
                  ? 'Kurz ankern ⚓'
                  : 'Anker setzen ⚓'}
          </button>
        </form>
      </div>
    </div>
  )
}
