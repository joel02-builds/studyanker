import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

const LEER = { fach: '', wo_war_ich: '', was_war_wichtig: '', naechster_schritt: '' }

export default function AnkerForm() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(LEER)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const { error } = await supabase.from('anker').insert({
      ...form,
      user_id: user.id,
    })

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    navigate('/')
  }

  return (
    <div className="min-h-screen bg-anker-bg px-6 py-8">
      <div className="max-w-[500px] mx-auto">
        <Link to="/" className="text-base text-slate-400 hover:text-slate-600">
          ← Zurück
        </Link>

        <h1 className="text-2xl font-semibold text-anker-accent mt-6 mb-8">
          Anker setzen — wo bist du gerade?
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-base text-slate-600 mb-2">Welches Fach?</label>
            <input
              required
              value={form.fach}
              onChange={(e) => setForm({ ...form, fach: e.target.value })}
              className="w-full px-4 py-3 text-base bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-anker-accent/40 focus:border-anker-accent"
            />
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
            {saving ? 'Speichern...' : 'Anker setzen ⚓'}
          </button>
        </form>
      </div>
    </div>
  )
}
