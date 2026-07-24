import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

const LEER = { fach: '', wo_war_ich: '', was_war_wichtig: '', naechster_schritt: '' }

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
        })
      }
      setLadenAnker(false)
    }
    ankerLaden()
  }, [id, bearbeitenModus])

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

    navigate('/')
  }

  if (ladenAnker) {
    return (
      <div className="min-h-screen bg-anker-bg flex items-center justify-center">
        <p className="text-slate-500 text-base">Lädt...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-anker-bg px-6 py-8">
      <div className="max-w-[500px] mx-auto">
        <Link to="/" className="text-base text-slate-400 hover:text-slate-600">
          ← Zurück
        </Link>

        <h1 className="text-2xl font-semibold text-anker-accent mt-6 mb-8">
          {bearbeitenModus ? 'Anker bearbeiten' : 'Anker setzen — wo bist du gerade?'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-base text-slate-600 mb-2">Welches Fach?</label>
            <div className="flex gap-3">
              <select
                required
                value={form.fach}
                onChange={(e) => setForm({ ...form, fach: e.target.value })}
                disabled={ladenFaecher}
                className="flex-1 px-4 py-3 text-base bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-anker-accent/40 focus:border-anker-accent"
              >
                <option value="" disabled>
                  {ladenFaecher ? 'Lädt...' : faecher.length === 0 ? 'Noch keine Fächer' : 'Fach wählen'}
                </option>
                {faecher.map((f) => (
                  <option key={f.id} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
              <Link
                to="/faecher"
                className="w-12 flex items-center justify-center text-xl bg-white border border-slate-200 rounded-xl text-anker-accent hover:bg-anker-bg"
                aria-label="Fach hinzufügen"
              >
                +
              </Link>
            </div>
          </div>

          <div>
            <label className="block text-base text-slate-600 mb-2">
              Wo genau bist du? (Kapitel, Seite, Thema)
            </label>
            <textarea
              rows={2}
              value={form.wo_war_ich}
              onChange={(e) => setForm({ ...form, wo_war_ich: e.target.value })}
              className="w-full px-4 py-3 text-base bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-anker-accent/40 focus:border-anker-accent"
            />
          </div>

          <div>
            <label className="block text-base text-slate-600 mb-2">
              Was solltest du nicht vergessen?
            </label>
            <textarea
              rows={2}
              value={form.was_war_wichtig}
              onChange={(e) => setForm({ ...form, was_war_wichtig: e.target.value })}
              className="w-full px-4 py-3 text-base bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-anker-accent/40 focus:border-anker-accent"
            />
          </div>

          <div>
            <label className="block text-base text-slate-600 mb-2">
              Was ist dein erster Schritt beim nächsten Mal?
            </label>
            <textarea
              rows={2}
              value={form.naechster_schritt}
              onChange={(e) => setForm({ ...form, naechster_schritt: e.target.value })}
              className="w-full px-4 py-3 text-base bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-anker-accent/40 focus:border-anker-accent"
            />
          </div>

          {error && <p className="text-base text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-anker-accent text-white py-4 rounded-xl text-base font-medium hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Speichern...' : bearbeitenModus ? 'Änderungen speichern' : 'Anker setzen ⚓'}
          </button>
        </form>
      </div>
    </div>
  )
}
