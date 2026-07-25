import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export default function FachVerwaltung() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [faecher, setFaecher] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [farbe, setFarbe] = useState('#1C3A52')
  const [speichern, setSpeichern] = useState(false)
  const [error, setError] = useState('')

  async function laden() {
    const { data, error } = await supabase
      .from('faecher')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error) setFaecher(data)
    setLoading(false)
  }

  useEffect(() => {
    laden()
  }, [])

  async function hinzufuegen(e) {
    e.preventDefault()
    if (!name.trim()) return

    setSpeichern(true)
    setError('')

    const { error } = await supabase.from('faecher').insert({
      name: name.trim(),
      farbe,
      user_id: user.id,
    })

    setSpeichern(false)

    if (error) {
      setError(error.message)
      return
    }

    setName('')
    setFarbe('#1C3A52')

    const params = new URLSearchParams(window.location.search)
    if (params.get('from') === 'anker') {
      navigate('/anker/neu')
      return
    }

    laden()
  }

  async function loeschen(id) {
    const { error } = await supabase.from('faecher').delete().eq('id', id)
    if (!error) laden()
  }

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
          Deine Fächer
        </h1>

        <form onSubmit={hinzufuegen} className="bg-anker-card rounded-anker shadow-anker p-5 mb-8 space-y-4">
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={farbe}
              onChange={(e) => setFarbe(e.target.value)}
              className="w-12 h-12 rounded-anker-sm border border-anker-border cursor-pointer"
            />
            <input
              type="text"
              placeholder="Fach hinzufügen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-4 py-3 text-base bg-anker-card border-[1.5px] border-anker-border rounded-anker-sm focus:outline-none focus:ring-2 focus:ring-anker-accent2/30 focus:border-anker-accent2"
            />
          </div>

          {error && <p className="text-base text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={speichern || !name.trim()}
            className="w-full bg-anker-accent text-white rounded-anker text-base font-medium hover:opacity-90 disabled:opacity-50"
            style={{ padding: '1rem 2rem', transition: 'all 0.2s ease' }}
          >
            {speichern ? 'Speichern...' : 'Fach hinzufügen'}
          </button>
        </form>

        {loading ? (
          <p className="text-anker-muted text-base">Lädt...</p>
        ) : faecher.length === 0 ? (
          <p className="text-anker-muted text-base">Noch keine Fächer angelegt.</p>
        ) : (
          <div className="space-y-2">
            {faecher.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between bg-anker-card rounded-anker-sm shadow-anker px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-4 h-4 rounded-full inline-block"
                    style={{ backgroundColor: f.farbe }}
                  />
                  <span className="text-base text-anker-text">{f.name}</span>
                </div>
                <button
                  onClick={() => loeschen(f.id)}
                  className="text-anker-muted hover:text-red-500 text-lg leading-none px-2"
                  aria-label={`${f.name} löschen`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
